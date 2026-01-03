import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

export function createWSServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = new Map(); // ws -> { userId, role }

  wss.on("connection", (ws, req) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get("token");
      const user = jwt.verify(token, process.env.JWT_SECRET);

      clients.set(ws, { userId: user.id, role: user.role });

      ws.send(JSON.stringify({ type: "connected", userId: user.id, role: user.role }));

      ws.on("close", () => clients.delete(ws));
      ws.on("error", () => clients.delete(ws));
    } catch {
      ws.close(1008, "Unauthorized");
    }
  });

  function broadcast(obj) {
    const msg = JSON.stringify(obj);
    for (const ws of clients.keys()) {
      if (ws.readyState === 1) ws.send(msg);
    }
  }

  return { broadcast };
}
