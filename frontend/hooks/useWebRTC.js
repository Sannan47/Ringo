"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject", 
      credential: "openrelayproject",
    },
  ],
};

const createEmptyState = () => ({
  isConnected: false,
  isJoining: false,
  isMuted: false,
  error: "",
  participants: [],
  remoteStreams: {},
});

export default function useWebRTC({ socket, roomId, currentUser }) {
  const [state, setState] = useState(createEmptyState);
  const localStreamRef = useRef(null);
  const peersRef = useRef(new Map());
  const roomIdRef = useRef(roomId);
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const setError = useCallback((message) => {
    setState((current) => ({ ...current, error: message }));
  }, []);

  const closePeer = useCallback((peerSocketId) => {
    const peer = peersRef.current.get(peerSocketId);

    if (peer) {
      peer.close();
      peersRef.current.delete(peerSocketId);
    }

    setState((current) => {
      const nextStreams = { ...current.remoteStreams };
      delete nextStreams[peerSocketId];
      return { ...current, remoteStreams: nextStreams };
    });
  }, []);

  const cleanupMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
  }, []);

  const cleanupConnections = useCallback(() => {
    peersRef.current.forEach((peer) => peer.close());
    peersRef.current.clear();
    cleanupMedia();
    setState(createEmptyState());
  }, [cleanupMedia]);

  const createPeerConnection = useCallback(
    (peerSocketId) => {
      const existing = peersRef.current.get(peerSocketId);

      if (existing) {
        return existing;
      }

      console.log("[WebRTC] Creating peer connection with", peerSocketId);
      const peer = new RTCPeerConnection(rtcConfig);
      peersRef.current.set(peerSocketId, peer);

      localStreamRef.current?.getTracks().forEach((track) => {
        console.log("[WebRTC] Adding local track:", track.kind);
        peer.addTrack(track, localStreamRef.current);
      });

      peer.onicecandidate = (event) => {
        if (!event.candidate || !socket) {
          return;
        }

        console.log("[WebRTC] ICE candidate gathered:", event.candidate.candidate.substring(0, 50) + "...");
        socket.emit("ice-candidate", {
          to: peerSocketId,
          roomId: roomIdRef.current,
          candidate: event.candidate,
        });
      };

      peer.oniceconnectionstatechange = () => {
        console.log("[WebRTC] ICE connection state changed:", peer.iceConnectionState);
      };

      peer.ontrack = (event) => {
        const [remoteStream] = event.streams;

        if (!remoteStream) {
          console.warn("[WebRTC] Received track but no stream");
          return;
        }

        console.log("[WebRTC] Received remote track:", event.track.kind);
        setState((current) => ({
          ...current,
          remoteStreams: {
            ...current.remoteStreams,
            [peerSocketId]: remoteStream,
          },
        }));
      };

      peer.onconnectionstatechange = () => {
        console.log("[WebRTC] Connection state changed:", peer.connectionState);
        if (["failed", "closed", "disconnected"].includes(peer.connectionState)) {
          console.log("[WebRTC] Closing peer due to connection state:", peer.connectionState);
          closePeer(peerSocketId);
        }
      };

      return peer;
    },
    [closePeer, socket]
  );

  const makeOffer = useCallback(
    async (peerSocketId) => {
      if (!socket || !roomIdRef.current) {
        return;
      }

      try {
        console.log("[WebRTC] Making offer to", peerSocketId);
        const peer = createPeerConnection(peerSocketId);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        console.log("[WebRTC] Offer created and local description set, sending to", peerSocketId);

        socket.emit("offer", {
          to: peerSocketId,
          roomId: roomIdRef.current,
          offer,
        });
      } catch (error) {
        console.error("[WebRTC] Failed to make offer:", error.message);
        setError("Could not connect to a voice peer.");
        closePeer(peerSocketId);
      }
    },
    [closePeer, createPeerConnection, setError, socket]
  );

  const joinVoiceRoom = useCallback(async () => {
    if (!socket || !roomId) {
      setError("Select a channel before joining voice.");
      return false;
    }

    setState((current) => ({ ...current, isJoining: true, error: "" }));

    try {
      console.log("[WebRTC] Requesting microphone access for room:", roomId);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      console.log("[WebRTC] Microphone access granted, audio tracks:", stream.getAudioTracks().length);

      const result = await new Promise((resolve) => {
        socket.emit("join-voice-room", { roomId }, resolve);
      });

      if (!result?.ok) {
        cleanupMedia();
        setState((current) => ({
          ...current,
          isConnected: false,
          isJoining: false,
          error: result?.error || "Unable to join voice.",
        }));
        return false;
      }

      console.log("[WebRTC] Successfully joined voice room, participants:", result.users?.length || 0);
      setState((current) => ({
        ...current,
        isConnected: true,
        isJoining: false,
        isMuted: false,
        error: "",
        participants: result.users || [],
      }));

      return true;
    } catch (error) {
      cleanupMedia();
      console.error("[WebRTC] Failed to join voice room:", error.message);
      setState((current) => ({
        ...current,
        isConnected: false,
        isJoining: false,
        error:
          error?.name === "NotAllowedError"
            ? "Microphone permission was denied."
            : "Unable to access your microphone.",
      }));
      return false;
    }
  }, [cleanupMedia, roomId, setError, socket]);

  const leaveVoiceRoom = useCallback(async () => {
    if (socket && roomIdRef.current) {
      await new Promise((resolve) => {
        socket.emit("leave-voice-room", { roomId: roomIdRef.current }, resolve);
      });
    }

    cleanupConnections();
  }, [cleanupConnections, socket]);

  const toggleMute = useCallback(() => {
    const nextMuted = !state.isMuted;
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setState((current) => ({ ...current, isMuted: nextMuted }));
  }, [state.isMuted]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleUsers = ({ roomId: eventRoomId, users }) => {
      if (eventRoomId !== roomIdRef.current) {
        return;
      }

      setState((current) => ({ ...current, participants: users || [] }));
    };

    const handleUserJoined = ({ roomId: eventRoomId, user }) => {
      if (eventRoomId !== roomIdRef.current || !localStreamRef.current) {
        return;
      }

      setState((current) => ({
        ...current,
        participants: current.participants.some(
          (entry) => entry.socketId === user.socketId
        )
          ? current.participants
          : [...current.participants, user],
      }));

      // Existing room members initiate the offer. The joining user answers it.
      makeOffer(user.socketId);
    };

    const handleUserLeft = ({ roomId: eventRoomId, socketId }) => {
      if (eventRoomId !== roomIdRef.current) {
        return;
      }

      closePeer(socketId);
      setState((current) => ({
        ...current,
        participants: current.participants.filter(
          (entry) => entry.socketId !== socketId
        ),
      }));
    };

    const handleOffer = async ({ roomId: eventRoomId, from, offer }) => {
      if (eventRoomId !== roomIdRef.current || !offer || !localStreamRef.current) {
        return;
      }

      try {
        console.log("[WebRTC] Received offer from", from);
        const peer = createPeerConnection(from);
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("[WebRTC] Remote description set from offer, peer connection state:", peer.connectionState);
        
        // Process any pending ICE candidates
        if (peer._pendingCandidates && peer._pendingCandidates.length > 0) {
          console.log("[WebRTC] Processing", peer._pendingCandidates.length, "pending ICE candidates");
          for (const candidate of peer._pendingCandidates) {
            try {
              await peer.addIceCandidate(candidate);
            } catch (e) {
              console.error("[WebRTC] Failed to add pending candidate:", e.message);
            }
          }
          peer._pendingCandidates = [];
        }
        
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        console.log("[WebRTC] Sending answer to", from);
        socket.emit("answer", {
          to: from,
          roomId: eventRoomId,
          answer,
        });
      } catch (error) {
        console.error("[WebRTC] Failed to handle offer:", error.message);
        setError("Could not answer a voice peer.");
        closePeer(from);
      }
    };

    const handleAnswer = async ({ roomId: eventRoomId, from, answer }) => {
      if (eventRoomId !== roomIdRef.current || !answer) {
        return;
      }

      try {
        const peer = peersRef.current.get(from);
        if (peer) {
          console.log("[WebRTC] Received answer from", from);
          await peer.setRemoteDescription(new RTCSessionDescription(answer));
          console.log("[WebRTC] Remote description set from answer, peer connection state:", peer.connectionState);
          
          // Process any pending ICE candidates
          if (peer._pendingCandidates && peer._pendingCandidates.length > 0) {
            console.log("[WebRTC] Processing", peer._pendingCandidates.length, "pending ICE candidates");
            for (const candidate of peer._pendingCandidates) {
              try {
                await peer.addIceCandidate(candidate);
              } catch (e) {
                console.error("[WebRTC] Failed to add pending candidate:", e.message);
              }
            }
            peer._pendingCandidates = [];
          }
        }
      } catch (error) {
        console.error("[WebRTC] Failed to handle answer:", error.message);
        setError("Could not finish voice connection.");
        closePeer(from);
      }
    };

    const handleIceCandidate = async ({
      roomId: eventRoomId,
      from,
      candidate,
    }) => {
      if (eventRoomId !== roomIdRef.current || !candidate) {
        return;
      }

      try {
        const peer = peersRef.current.get(from);
        
        if (!peer) {
          console.warn(
            "[WebRTC] ICE candidate received before peer connection created, creating peer",
            { from }
          );
          // Create peer if it doesn't exist yet (candidate might arrive first)
          createPeerConnection(from);
          return;
        }

        // Only add candidate if remote description is set
        if (peer.remoteDescription) {
          console.debug("[WebRTC] Adding ICE candidate from", from);
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          console.warn(
            "[WebRTC] ICE candidate received before remote description set, queueing",
            { from }
          );
          // Store for later processing once remote description is set
          if (!peer._pendingCandidates) {
            peer._pendingCandidates = [];
          }
          peer._pendingCandidates.push(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error("[WebRTC] Failed to add ICE candidate:", error.message);
        setError("Voice network connection failed.");
      }
    };

    socket.on("voice-room-users", handleUsers);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.off("voice-room-users", handleUsers);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
    };
  }, [closePeer, createPeerConnection, makeOffer, setError, socket]);

  useEffect(
    () => () => {
      if (socket && roomIdRef.current && localStreamRef.current) {
        socket.emit("leave-voice-room", { roomId: roomIdRef.current });
      }
      cleanupConnections();
    },
    [cleanupConnections, socket]
  );

  const currentParticipant = useMemo(
    () =>
      state.participants.find((entry) => entry.socketId === socket?.id) || {
        socketId: socket?.id,
        userId: currentUserRef.current?.userId || currentUserRef.current?.id,
        name:
          currentUserRef.current?.name ||
          currentUserRef.current?.email ||
          "You",
      },
    [socket?.id, state.participants]
  );

  return {
    ...state,
    currentParticipant,
    joinVoiceRoom,
    leaveVoiceRoom,
    toggleMute,
  };
}
