"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socketInstance;

export default function useSocket(isEnabled = true) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let isMounted = true;

    if (!isEnabled) {
      return undefined;
    }

    const connectSocket = async () => {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || undefined;
      let auth = undefined;

      if (socketUrl) {
        const response = await fetch("/api/auth/socket-token");
        const data = await response.json();
        if (!response.ok || !data?.token) {
          return;
        }
        auth = { token: data.token };
      }

      if (!socketInstance) {
        socketInstance = io(socketUrl, {
          path: "/socket.io",
          withCredentials: !socketUrl,
          auth,
        });
      } else {
        socketInstance.auth = auth || {};
        if (!socketInstance.connected) {
          socketInstance.connect();
        }
      }

      if (isMounted) {
        setSocket(socketInstance);
      }
    };

    connectSocket();

    return () => {
      isMounted = false;
      socketInstance?.disconnect();
    };
  }, [isEnabled]);

  return socket;
}
