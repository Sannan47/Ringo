const voiceRooms = new Map();

const getVoiceRoomName = (roomId) => `voice:${roomId}`;

const getRoomUsers = (roomId) =>
  [...(voiceRooms.get(roomId)?.values() || [])].map((entry) => entry.user);

const leaveCurrentVoiceRoom = (io, socket) => {
  const roomId = socket.voiceRoomId;

  if (!roomId) {
    return;
  }

  const room = voiceRooms.get(roomId);
  const voiceRoomName = getVoiceRoomName(roomId);

  socket.leave(voiceRoomName);
  socket.voiceRoomId = null;

  if (room) {
    room.delete(socket.id);

    socket.to(voiceRoomName).emit("user-left", {
      roomId,
      socketId: socket.id,
      userId: socket.user?.userId,
    });

    if (room.size === 0) {
      voiceRooms.delete(roomId);
    } else {
      io.to(voiceRoomName).emit("voice-room-users", {
        roomId,
        users: getRoomUsers(roomId),
      });
    }
  }
};

export function registerVoiceHandlers(io, socket) {
  socket.on("join-voice-room", ({ roomId } = {}, ack) => {
    const normalizedRoomId = String(roomId || "").trim();

    if (!normalizedRoomId) {
      ack?.({ ok: false, error: "Voice room is required" });
      return;
    }

    leaveCurrentVoiceRoom(io, socket);

    const room = voiceRooms.get(normalizedRoomId) || new Map();

    if (room.size >= 5) {
      ack?.({ ok: false, error: "Voice room is full" });
      return;
    }

    const user = {
      socketId: socket.id,
      userId: socket.user?.userId,
      name: socket.user?.name || socket.user?.email || "User",
      email: socket.user?.email,
    };

    voiceRooms.set(normalizedRoomId, room);
    room.set(socket.id, { user });
    socket.voiceRoomId = normalizedRoomId;
    socket.join(getVoiceRoomName(normalizedRoomId));

    const peers = getRoomUsers(normalizedRoomId).filter(
      (entry) => entry.socketId !== socket.id
    );

    ack?.({
      ok: true,
      roomId: normalizedRoomId,
      user,
      peers,
      users: getRoomUsers(normalizedRoomId),
    });

    socket.to(getVoiceRoomName(normalizedRoomId)).emit("user-joined", {
      roomId: normalizedRoomId,
      user,
    });

    io.to(getVoiceRoomName(normalizedRoomId)).emit("voice-room-users", {
      roomId: normalizedRoomId,
      users: getRoomUsers(normalizedRoomId),
    });
  });

  socket.on("leave-voice-room", (_payload, ack) => {
    leaveCurrentVoiceRoom(io, socket);
    ack?.({ ok: true });
  });

  // WebRTC signaling relay: clients create SDP/ICE payloads and the server
  // forwards them to a specific peer socket in the same voice room.
  socket.on("offer", ({ to, roomId, offer } = {}) => {
    if (!to || !offer || socket.voiceRoomId !== roomId) {
      return;
    }

    socket.to(to).emit("offer", {
      from: socket.id,
      roomId,
      offer,
      user: {
        socketId: socket.id,
        userId: socket.user?.userId,
        name: socket.user?.name || socket.user?.email || "User",
        email: socket.user?.email,
      },
    });
  });

  socket.on("answer", ({ to, roomId, answer } = {}) => {
    if (!to || !answer || socket.voiceRoomId !== roomId) {
      return;
    }

    socket.to(to).emit("answer", {
      from: socket.id,
      roomId,
      answer,
    });
  });

  socket.on("ice-candidate", ({ to, roomId, candidate } = {}) => {
    if (!to || !candidate || socket.voiceRoomId !== roomId) {
      return;
    }

    socket.to(to).emit("ice-candidate", {
      from: socket.id,
      roomId,
      candidate,
    });
  });

  socket.on("disconnect", () => {
    leaveCurrentVoiceRoom(io, socket);
  });
}
