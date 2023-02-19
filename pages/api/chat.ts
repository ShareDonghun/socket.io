import { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Socket as NetSocket } from "net";
import type { Server as IOServerType } from "socket.io";
import { Server as IOServer } from "socket.io";

interface SocketServer extends HTTPServer {
  io?: IOServerType | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new IOServer(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("Client connected");
      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });

      socket.on("chat", (data) => {
        const { roomNum } = data;

        console.log("Chat message received", data);
        if (roomNum) {
          io.to(roomNum).emit("chat", data);
        } else {
          io.emit("chat", data);
        }
      });

      socket.on("roomEnter", (data) => {
        const { roomNum } = data;
        socket.join(roomNum);

        const welcomeMessage = `${roomNum}에 입장하셨습니다.`;
        io.to(roomNum).emit("roomEnter", welcomeMessage);
      });
    });
  }
  res.end();
}
