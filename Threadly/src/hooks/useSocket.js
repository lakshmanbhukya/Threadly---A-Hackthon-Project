import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getSocketUrl } from "../config/apiConfig";
import { toast } from "sonner";

export const useSocket = (userId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(getSocketUrl(), {
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("join", userId);
    });

    socket.on("notification", (notification) => {
      toast.info(notification.message, {
        description: `From ${notification.createdBy?.username || "Anonymous"}`,
      });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return socketRef.current;
};