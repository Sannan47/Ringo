import { NextResponse } from "next/server";
import connectDb from "../../../../lib/db";
import FriendRequest from "../../../../models/FriendRequest";
import Friendship from "../../../../models/Friendship";
import User from "../../../../models/User";
import { requireAuth } from "../../../../lib/permissions";

export async function GET(request) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    await connectDb();

    const incoming = await FriendRequest.find({
      toUser: user.userId,
      status: "pending",
    })
      .populate("fromUser", "name email")
      .lean();

    const outgoing = await FriendRequest.find({
      fromUser: user.userId,
      status: "pending",
    })
      .populate("toUser", "name email")
      .lean();

    const friendships = await Friendship.find({ users: user.userId })
      .populate("users", "name email avatarUrl")
      .lean();

    const friends = friendships
      .map((friendship) =>
        friendship.users.find(
          (entry) => entry._id.toString() !== user.userId
        )
      )
      .filter(Boolean)
      .map((entry) => ({
        id: entry._id.toString(),
        name: entry.name,
        email: entry.email,
        avatarUrl: entry.avatarUrl || "",
      }));

    return NextResponse.json(
      {
        incoming: incoming.map((req) => ({
          id: req._id.toString(),
          from: {
            id: req.fromUser?._id?.toString(),
              name: req.fromUser?.name,
              email: req.fromUser?.email,
              avatarUrl: req.fromUser?.avatarUrl || "",
          },
          createdAt: req.createdAt,
        })),
        outgoing: outgoing.map((req) => ({
          id: req._id.toString(),
          to: {
            id: req.toUser?._id?.toString(),
            name: req.toUser?.name,
            email: req.toUser?.email,
            avatarUrl: req.toUser?.avatarUrl || "",
          },
          createdAt: req.createdAt,
        })),
        friends,
      },
      { status: 200 }
    );
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
    const email = String(body?.email || "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDb();

    const [target, currentUser] = await Promise.all([
      User.findOne({ email }).lean(),
      User.findById(user.userId).lean(),
    ]);

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (target._id.toString() === user.userId) {
      return NextResponse.json({ error: "Cannot friend yourself" }, { status: 400 });
    }

    const friendshipExists = await Friendship.exists({
      users: { $all: [user.userId, target._id] },
    });

    if (friendshipExists) {
      return NextResponse.json({ error: "Already friends" }, { status: 400 });
    }

    const pending = await FriendRequest.findOne({
      status: "pending",
      $or: [
        { fromUser: user.userId, toUser: target._id },
        { fromUser: target._id, toUser: user.userId },
      ],
    }).lean();

    if (pending) {
      return NextResponse.json({ error: "Request already pending" }, { status: 400 });
    }

    const requestDoc = await FriendRequest.create({
      fromUser: user.userId,
      toUser: target._id,
    });

    globalThis.ringoRealtime?.emitToUser?.(
      target._id.toString(),
      "friend_request_created",
      {
        request: {
          id: requestDoc._id.toString(),
          from: {
            id: user.userId,
            name: currentUser?.name,
            email: user.email,
            avatarUrl: currentUser?.avatarUrl || "",
          },
          createdAt: requestDoc.createdAt,
        },
      }
    );

    return NextResponse.json(
      {
        request: {
          id: requestDoc._id.toString(),
          to: {
            id: target._id.toString(),
            name: target.name,
            email: target.email,
          },
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
