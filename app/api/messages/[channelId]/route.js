import { NextResponse } from "next/server";
import connectDb from "../../../../lib/db";
import Channel from "../../../../models/Channel";
import Message from "../../../../models/Message";
import { requireAuth } from "../../../../lib/permissions";

export async function GET(request, { params }) {
  const { response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    const resolvedParams = await params;
    const { channelId } = resolvedParams || {};

    if (!channelId) {
      return NextResponse.json({ message: "channelId is required" }, { status: 400 });
    }

    await connectDb();

    const channelExists = await Channel.exists({ _id: channelId });

    if (!channelExists) {
      return NextResponse.json({ message: "Channel not found" }, { status: 404 });
    }

    const messages = await Message.find({ channelId })
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
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
