"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socketInstance;

export default function useSocket(isEnabled = true) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }

    if (!socketInstance) {
      socketInstance = io({
        path: "/socket.io",
        withCredentials: true,
      });
    } else if (!socketInstance.connected) {
      socketInstance.connect();
    }

    const activeSocket = socketInstance;
    queueMicrotask(() => setSocket(activeSocket));

    return () => {
      activeSocket?.disconnect();
    };
  }, [isEnabled]);

  return socket;
}
