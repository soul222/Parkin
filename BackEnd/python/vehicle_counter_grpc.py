import cv2
import time
import grpc
import yt_dlp
from ultralytics import YOLO
from collections import defaultdict, deque
import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GENERATED_DIR = os.path.join(BASE_DIR, "generated")

if GENERATED_DIR not in sys.path:
    sys.path.insert(0, GENERATED_DIR)

import parking_pb2
import parking_pb2_grpc


class VehicleCounterGRPC:
    def __init__(self, grpc_server="localhost:50051", model_path="yolo11m.pt"):
        self.grpc_server = grpc_server
        self.model = YOLO(model_path)

        self.target_classes = [2, 3]  # 2 car, 3 motorcycle (COCO)
        self.class_names = {2: "mobil", 3: "motor"}

        self.track_history = defaultdict(lambda: deque(maxlen=30))
        self.counted_ids = set()
        self.count_in = {"mobil": 0, "motor": 0}
        self.count_out = {"mobil": 0, "motor": 0}

        self.stream_url = None
        self.stream_type = "youtube"   # default
        self.line_position = 0.6

        # gRPC
        self.channel = grpc.insecure_channel(self.grpc_server)
        self.vehicle_stub = parking_pb2_grpc.VehicleServiceStub(self.channel)
        self.settings_stub = parking_pb2_grpc.SettingsServiceStub(self.channel)

        self.load_settings()

    def load_settings(self):
        resp = self.settings_stub.GetSettings(parking_pb2.SettingsRequest())
        self.stream_url = resp.stream_url
        self.stream_type = resp.stream_type or "youtube"
        self.line_position = float(resp.line_position or 0.6)

        print("✅ Settings loaded")
        print("  stream_url  :", self.stream_url)
        print("  stream_type :", self.stream_type)
        print("  line_pos    :", self.line_position)

    def _youtube_to_direct_url(self, youtube_url: str) -> str | None:
        try:
            ydl_opts = {"format": "best[ext=mp4]/best", "quiet": True, "noplaylist": True}
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
                return info.get("url")
        except Exception as e:
            print(f"❌ yt_dlp error: {e}")
            return None

    def _open_capture(self):
        if not self.stream_url:
            raise RuntimeError("No stream_url in settings")

        if self.stream_type == "youtube":
            direct = self._youtube_to_direct_url(self.stream_url)
            if not direct:
                raise RuntimeError("Failed to resolve youtube direct stream url")
            cap = cv2.VideoCapture(direct)
            return cap

        if self.stream_type == "rtsp":
            cap = cv2.VideoCapture(self.stream_url)
            return cap

        raise RuntimeError(f"Unknown stream_type: {self.stream_type}")

    def _check_line_crossing(self, track_id: int, cy: int, prev_y: int, line_y: int, class_id: int):
        if track_id in self.counted_ids:
            return None

        vehicle_type = self.class_names.get(class_id)
        if not vehicle_type:
            return None

        # IN
        if prev_y < line_y and cy >= line_y:
            self.count_in[vehicle_type] += 1
            self.counted_ids.add(track_id)
            return "in"

        # OUT
        if prev_y > line_y and cy <= line_y:
            self.count_out[vehicle_type] += 1
            self.counted_ids.add(track_id)
            return "out"

        return None

    def run(self):
        cap = self._open_capture()
        if not cap.isOpened():
            raise RuntimeError("❌ Failed to open video capture")

        print("✅ YOLO service running. Press 'q' to quit.")

        # client-streaming generator
        def detections_generator():
            while True:
                ok, frame = cap.read()
                if not ok:
                    print("⚠️ Stream buffering... retry in 2s")
                    time.sleep(2)
                    continue

                frame = cv2.resize(frame, (1280, 720))
                h, w = frame.shape[:2]
                line_y = int(h * self.line_position)

                results = self.model.track(
                    frame,
                    persist=True,
                    classes=self.target_classes,
                    verbose=False
                )

                if results and results[0].boxes.id is not None:
                    boxes = results[0].boxes.xyxy.cpu().numpy()
                    track_ids = results[0].boxes.id.cpu().numpy().astype(int)
                    classes = results[0].boxes.cls.cpu().numpy().astype(int)
                    confs = results[0].boxes.conf.cpu().numpy()

                    for box, tid, cls, conf in zip(boxes, track_ids, classes, confs):
                        x1, y1, x2, y2 = map(int, box)
                        cy = (y1 + y2) // 2

                        self.track_history[tid].append(cy)
                        if len(self.track_history[tid]) >= 2:
                            prev_y = self.track_history[tid][-2]
                            direction = self._check_line_crossing(tid, cy, prev_y, line_y, cls)

                            if direction:
                                vehicle_type = self.class_names.get(cls, "vehicle")
                                yield parking_pb2.VehicleDetection(
                                    vehicle_type=vehicle_type,
                                    direction=direction,
                                    track_id=int(tid),
                                    timestamp=int(time.time() * 1000),
                                    bbox=parking_pb2.BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2),
                                    confidence=float(conf),
                                )

                # (optional) preview
                cv2.line(frame, (0, line_y), (w, line_y), (0, 255, 255), 3)
                cv2.imshow("YOLO Smart Parking", frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break

            cap.release()
            cv2.destroyAllWindows()

        # kirim streaming ke server
        try:
            resp = self.vehicle_stub.StreamDetections(detections_generator())
            print("✅ Stream ended. Server response:", resp.message)
        except grpc.RpcError as e:
            print("❌ gRPC error:", e.details())

        self.channel.close()


if __name__ == "__main__":
    counter = VehicleCounterGRPC(grpc_server="localhost:50051")
    counter.run()
