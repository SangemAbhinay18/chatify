import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "https://chatify-7om8.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  socket: null,
  onlineUsers: [],
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    const res = await axiosInstance.post("/auth/signup", data);
    set({ authUser: res.data });
    toast.success("Account created");
    get().connectSocket();
  },

  login: async (data) => {
    const res = await axiosInstance.post("/auth/login", data);
    set({ authUser: res.data });
    toast.success("Logged in");
    get().connectSocket();
  },

  logout: async () => {
    await axiosInstance.post("/auth/logout");
    get().disconnectSocket();
    set({ authUser: null });
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("🟢 Socket connected:", newSocket.id);
    });

    newSocket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) socket.disconnect();
    set({ socket: null, onlineUsers: [] });
  },
}));
