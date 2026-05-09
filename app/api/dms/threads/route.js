import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectDb from "../../../../lib/db";
import DirectMessage from "../../../../models/DirectMessage";
import DirectThread from "../../../../models/DirectThread";
import Friendship from "../../../../models/Friendship";
import { requireAuth } from "../../../../lib/permissions";

export async function GET(request) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    await connectDb();

    const threads = await DirectThread.find({ participants: user.userId })
      .populate("participants", "name email")
      .lean();

    const threadIds = threads.map((thread) => thread._id);
    const latestMessages = await DirectMessage.find({
      threadId: { $in: threadIds },
    })
      .sort({ createdAt: -1 })
      .lean();
    const latestByThreadId = new Map();

    latestMessages.forEach((message) => {
      const threadId = message.threadId.toString();

      if (!latestByThreadId.has(threadId)) {
        latestByThreadId.set(threadId, message);
      }
    });

    const formatted = threads
      .filter((thread) => latestByThreadId.has(thread._id.toString()))
      .sort((a, b) => {
        const aLatest = latestByThreadId.get(a._id.toString())?.createdAt;
        const bLatest = latestByThreadId.get(b._id.toString())?.createdAt;
        return new Date(bLatest || 0) - new Date(aLatest || 0);
      })
      .map((thread) => {
      const partner = thread.participants.find(
        (participant) => participant._id.toString() !== user.userId
      );

      return {
        id: thread._id.toString(),
        participant: partner
          ? {
              id: partner._id.toString(),
              name: partner.name,
              email: partner.email,
            }
          : null,
      };
    });

    return NextResponse.json({ threads: formatted }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    const body = await request.json();
    const friendId = String(body?.friendId || "").trim();

    if (!friendId) {
      return NextResponse.json({ error: "friendId is required" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      return NextResponse.json({ error: "Invalid friendId" }, { status: 400 });
    }

    await connectDb();

    const friendshipExists = await Friendship.exists({
      users: { $all: [user.userId, friendId] },
    });

    if (!friendshipExists) {
      return NextResponse.json({ error: "Not friends" }, { status: 403 });
    }

    const usersPair = [user.userId, friendId].sort();

    const existing = await DirectThread.findOne({
      participants: { $all: usersPair },
      $expr: { $eq: [{ $size: "$participants" }, 2] },
    }).lean();

    if (existing) {
      const partner = existing.participants.find(
        (participant) => participant.toString() !== user.userId
      );

      return NextResponse.json(
        {
          thread: {
            id: existing._id.toString(),
            participantId: partner?.toString(),
          },
        },
        { status: 200 }
      );
    }

    let thread;

    try {
      thread = await DirectThread.create({ participants: usersPair });
    } catch (error) {
      if (error?.code === 11000) {
        const fallback = await DirectThread.findOne({
          participants: { $all: usersPair },
          $expr: { $eq: [{ $size: "$participants" }, 2] },
        }).lean();

        if (fallback) {
          const partner = fallback.participants.find(
            (participant) => participant.toString() !== user.userId
          );

          return NextResponse.json(
            {
              thread: {
                id: fallback._id.toString(),
                participantId: partner?.toString(),
              },
            },
            { status: 200 }
          );
        }

        return NextResponse.json(
          { error: "Direct thread already exists" },
          { status: 409 }
        );
      }

      throw error;
    }

    const partner = thread.participants.find(
      (participant) => participant.toString() !== user.userId
    );

    return NextResponse.json(
      {
        thread: {
          id: thread._id.toString(),
          participantId: partner?.toString(),
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
