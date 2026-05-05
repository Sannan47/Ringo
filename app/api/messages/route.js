import { NextResponse } from "next/server";
import connectDb from "../../../lib/db";
import Channel from "../../../models/Channel";
import Message from "../../../models/Message";
import { getUserFromRequest } from "../../../lib/auth";

export async function POST(request) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const content = String(body?.content || "").trim();
    const channelId = String(body?.channelId || "").trim();

    if (!content || !channelId) {
      return NextResponse.json(
        { message: "Message content and channelId are required" },
        { status: 400 }
      );
    }

    await connectDb();

    const channelExists = await Channel.exists({ _id: channelId });

    if (!channelExists) {
      return NextResponse.json({ message: "Channel not found" }, { status: 404 });
    }

    const message = await Message.create({
      content,
      channelId,
      senderId: user.userId,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
