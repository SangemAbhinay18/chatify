import { io } from "socket.io-client";

export const socket = io(
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "https://chatify-7om8.onrender.com",
  {
    withCredentials: true, // 🔴 REQUIRED
    transports: ["websocket"], // 🔴 Prevent polling issues
  }
);
