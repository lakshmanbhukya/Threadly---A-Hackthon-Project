import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getSocketUrl } from "../config/apiConfig";
import { toast } from "sonner";

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(getSocketUrl(), {
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      // Connected to server silently
    });

    socket.on("notification", (notification) => {
      toast.info(notification.message, {
        description: `From ${notification.createdBy?.username || "Anonymous"}`,
      });
    });

    socket.on("disconnect", () => {
      // Disconnected from server silently
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef.current;
};