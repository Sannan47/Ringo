import { NextResponse } from "next/server";
import connectDb from "../../../../../../lib/db";
import FriendRequest from "../../../../../../models/FriendRequest";
import Friendship from "../../../../../../models/Friendship";
import DirectThread from "../../../../../../models/DirectThread";
import { requireAuth } from "../../../../../../lib/permissions";

export async function PATCH(request, { params }) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    const resolvedParams = await params;
    const { id } = resolvedParams || {};

    if (!id) {
      return NextResponse.json({ error: "Request id is required" }, { status: 400 });
    }

    await connectDb();

    const requestDoc = await FriendRequest.findOne({
      _id: id,
      toUser: user.userId,
    });

    if (!requestDoc) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (requestDoc.status === "rejected") {
      return NextResponse.json(
        { error: "Request already rejected" },
        { status: 400 }
      );
    }

    const usersPair = [user.userId, requestDoc.fromUser.toString()].sort();

    await Friendship.findOneAndUpdate(
      { users: usersPair },
      { $setOnInsert: { users: usersPair } },
      { upsert: true }
    );

    const thread = await DirectThread.findOneAndUpdate(
      {
        participants: { $all: usersPair },
        $expr: { $eq: [{ $size: "$participants" }, 2] },
      },
      { $setOnInsert: { participants: usersPair } },
      { upsert: true, returnDocument: "after" }
    ).lean();

    if (requestDoc.status !== "accepted") {
      requestDoc.status = "accepted";
      await requestDoc.save();
    }

    const participants = usersPair.map((entry) => entry.toString());
    participants.forEach((participantId) => {
      globalThis.ringoRealtime?.emitToUser?.(
        participantId,
        "friend_request_updated",
        {
          status: "accepted",
          friendId: participants.find((entry) => entry !== participantId),
        }
      );
    });

    return NextResponse.json(
      {
        friend: {
          id: requestDoc.fromUser.toString(),
        },
        thread: thread
          ? {
              id: thread._id.toString(),
              participants: thread.participants.map((entry) => entry.toString()),
            }
          : null,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
