import { NextResponse } from "next/server";
import connectDb from "../../../lib/db";
import Channel from "../../../models/Channel";
import Message from "../../../models/Message";
import { isStoredImageUrl } from "../../../lib/images";
import { requireAuth } from "../../../lib/permissions";

export async function POST(request) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    const body = await request.json();
    const content = String(body?.content || "").trim();
    const imageUrl = String(body?.imageUrl || "").trim();
    const channelId = String(body?.channelId || "").trim();

    if ((!content && !imageUrl) || !channelId) {
      return NextResponse.json(
        { message: "Message content or image and channelId are required" },
        { status: 400 }
      );
    }

    if (imageUrl && !isStoredImageUrl(imageUrl)) {
      return NextResponse.json({ message: "Invalid image" }, { status: 400 });
    }

    await connectDb();

    const channelExists = await Channel.exists({ _id: channelId });

    if (!channelExists) {
      return NextResponse.json({ message: "Channel not found" }, { status: 404 });
    }

    const message = await Message.create({
      content,
      imageUrl,
      channelId,
      senderId: user.userId,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
