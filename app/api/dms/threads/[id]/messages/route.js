import { NextResponse } from "next/server";
import connectDb from "../../../../../../lib/db";
import DirectMessage from "../../../../../../models/DirectMessage";
import DirectThread from "../../../../../../models/DirectThread";
import { requireAuth } from "../../../../../../lib/permissions";

export async function GET(request, { params }) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    const resolvedParams = await params;
    const { id } = resolvedParams || {};

    if (!id) {
      return NextResponse.json({ error: "Thread id is required" }, { status: 400 });
    }

    await connectDb();

    const thread = await DirectThread.findOne({
      _id: id,
      participants: user.userId,
    }).lean();

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const messages = await DirectMessage.find({ threadId: id })
      .sort({ createdAt: 1 })
      .populate("senderId", "name")
      .lean();

    const formatted = messages.map((message) => ({
      id: message._id.toString(),
      content: message.content,
      createdAt: message.createdAt,
      sender: {
        id: message.senderId?._id?.toString(),
        name: message.senderId?.name || "Unknown",
      },
    }));

    return NextResponse.json({ messages: formatted }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
