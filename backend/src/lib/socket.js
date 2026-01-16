import { Server } from "socket.io";
import http from "http";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { ENV } from "./env.js";
import User from "../models/User.js";

const app = express();
app.use(cookieParser());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://chatify-mauve-nine.vercel.app",
    credentials: true,
  },
});

// Track online users
const onlineUsers = new Map();

// Socket auth middleware
io.use(async (socket, next) => {
  try {
    const cookie = socket.request.headers.cookie;
    if (!cookie) return next(new Error("No auth cookie"));

    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("jwt="))
      ?.split("=")[1];

    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.user._id.toString();

  onlineUsers.set(userId, socket.id);

  // Broadcast online users
  io.emit("online-users", Array.from(onlineUsers.keys()));

  console.log("User connected:", socket.user.fullName);

  socket.on("send-message", ({ receiverId, message }) => {
    const receiverSocket = onlineUsers.get(receiverId);

    if (receiverSocket) {
      io.to(receiverSocket).emit("receive-message", {
        senderId: userId,
        message,
      });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("online-users", Array.from(onlineUsers.keys()));
    console.log("User disconnected:", socket.user.fullName);
  });
});

export { app, server, io };
