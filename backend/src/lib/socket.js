import { Server } from "socket.io";
import http from "http";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

const app = express();
const server = http.createServer(app);

// userId -> socketId
const userSocketMap = {};

const io = new Server(server, {
  cors: {
    origin: "https://chatify-mauve-nine.vercel.app",
    credentials: true,
  },
});

// ✅ EXPORT THIS FUNCTION
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.use((socket, next) => {
  try {
    const cookie = socket.handshake.headers.cookie;
    if (!cookie) return next(new Error("No cookie"));

    const token = cookie
      .split(";")
      .map(c => c.trim())
      .find(c => c.startsWith("jwt="))
      ?.split("=")[1];

    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    socket.userId = decoded.userId;

    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});


io.on("connection", (socket) => {
  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // send online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };