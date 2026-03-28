import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";
import { makeVehicleService } from "./services/vehicleService.js";
import { settingsService } from "./services/settingsService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.join(__dirname, "../../proto/parking.proto");

export function startGrpcServer(wsBroadcaster) {
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });

  const parkingProto = grpc.loadPackageDefinition(packageDefinition).parking;

  const server = new grpc.Server();
  server.addService(parkingProto.VehicleService.service, makeVehicleService(wsBroadcaster));
  server.addService(parkingProto.SettingsService.service, settingsService);

  const port = process.env.GRPC_PORT || 50051;
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error("Failed to start gRPC server:", error);
      return;
    }
    console.log(`gRPC server running on ${port}`);
  }
)
}
