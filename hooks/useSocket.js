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

    setSocket(socketInstance);

    return () => {
      socketInstance?.disconnect();
    };
  }, [isEnabled]);

  return socket;
}
