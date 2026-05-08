import { createServer } from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import nextEnv from "@next/env";
import connectDb from "./lib/db.js";
import Channel from "./models/Channel.js";
import Message from "./models/Message.js";
import DirectMessage from "./models/DirectMessage.js";
import DirectThread from "./models/DirectThread.js";
import User from "./models/User.js";
import { verifyToken } from "./lib/auth.js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

const parseCookies = (cookieHeader) =>
  cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const [key, ...value] = part.split("=");
      acc[key] = decodeURIComponent(value.join("="));
      return acc;
    }, {});

await app.prepare();

const httpServer = createServer((req, res) => handle(req, res));
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    credentials: true,
  },
});

io.use(async (socket, nextMiddleware) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || "";
    const cookies = parseCookies(cookieHeader);
    const token = cookies.token;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return nextMiddleware(new Error("Unauthorized"));
    }

    await connectDb();
    const userDoc = await User.findById(user.userId).lean();

    socket.user = {
      ...user,
      name: userDoc?.name || "User",
    };

    return nextMiddleware();
  } catch (error) {
    return nextMiddleware(new Error("Unauthorized"));
  }
});

const emitOnlineCount = (channelId) => {
  const count = io.sockets.adapter.rooms.get(channelId)?.size || 0;
  io.to(channelId).emit("online_count", { channelId, count });
};

io.on("connection", (socket) => {
  console.log(`socket connected: ${socket.id} (${socket.user?.email || ""})`);

  socket.on("join_channel", ({ channelId }) => {
    if (!channelId) {
      return;
    }

    socket.join(channelId);
    emitOnlineCount(channelId);
  });

  socket.on("leave_channel", ({ channelId }) => {
    if (!channelId) {
      return;
    }

    socket.leave(channelId);
    emitOnlineCount(channelId);
  });

  socket.on("typing", ({ channelId }) => {
    if (!channelId) {
      return;
    }

    socket.to(channelId).emit("typing", {
      channelId,
      user: { id: socket.user.userId, name: socket.user.name },
    });
  });

  socket.on("stop_typing", ({ channelId }) => {
    if (!channelId) {
      return;
    }

    socket.to(channelId).emit("stop_typing", {
      channelId,
      userId: socket.user.userId,
    });
  });

  socket.on("send_message", async ({ channelId, content }) => {
    const trimmed = String(content || "").trim();

    if (!channelId || !trimmed) {
      return;
    }

    try {
      await connectDb();

      const channelExists = await Channel.exists({ _id: channelId });

      if (!channelExists) {
        return;
      }

      const message = await Message.create({
        content: trimmed,
        channelId,
        senderId: socket.user.userId,
      });

      io.to(channelId).emit("receive_message", {
        id: message._id.toString(),
        content: message.content,
        channelId,
        createdAt: message.createdAt,
        sender: {
          id: socket.user.userId,
          name: socket.user.name,
        },
      });
    } catch (error) {
      console.error("socket message error", error);
    }
  });

  socket.on("join_dm", ({ threadId }) => {
    if (!threadId) {
      return;
    }

    socket.join(`dm:${threadId}`);
  });

  socket.on("leave_dm", ({ threadId }) => {
    if (!threadId) {
      return;
    }

    socket.leave(`dm:${threadId}`);
  });

  socket.on("send_dm", async ({ threadId, content }) => {
    const trimmed = String(content || "").trim();

    if (!threadId || !trimmed) {
      return;
    }

    try {
      await connectDb();

      const thread = await DirectThread.findOne({
        _id: threadId,
        participants: socket.user.userId,
      }).lean();

      if (!thread) {
        return;
      }

      const message = await DirectMessage.create({
        content: trimmed,
        threadId,
        senderId: socket.user.userId,
      });

      io.to(`dm:${threadId}`).emit("receive_dm", {
        id: message._id.toString(),
        content: message.content,
        threadId,
        createdAt: message.createdAt,
        sender: {
          id: socket.user.userId,
          name: socket.user.name,
        },
      });
    } catch (error) {
      console.error("socket dm error", error);
    }
  });

  socket.on("disconnect", () => {
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        emitOnlineCount(roomId);
      }
    });
    console.log(`socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  console.log(`> Server ready on http://localhost:${port}`);
});
