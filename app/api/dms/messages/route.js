import { NextResponse } from "next/server";
import connectDb from "../../../../lib/db";
import DirectMessage from "../../../../models/DirectMessage";
import DirectThread from "../../../../models/DirectThread";
import { requireAuth } from "../../../../lib/permissions";

export async function POST(request) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    const body = await request.json();
    const threadId = String(body?.threadId || "").trim();
    const content = String(body?.content || "").trim();

    if (!threadId || !content) {
      return NextResponse.json(
        { error: "threadId and content are required" },
        { status: 400 }
      );
    }

    await connectDb();

    const thread = await DirectThread.findOne({
      _id: threadId,
      participants: user.userId,
    }).lean();

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const message = await DirectMessage.create({
      threadId,
      senderId: user.userId,
      content,
    });

    return NextResponse.json(
      {
        message: {
          id: message._id.toString(),
          content: message.content,
          createdAt: message.createdAt,
          sender: { id: user.userId, name: "You" },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
