import { NextResponse } from "next/server";
import connectDb from "../../../../lib/db";
import DirectMessage from "../../../../models/DirectMessage";
import DirectThread from "../../../../models/DirectThread";
import { isLocalUploadUrl } from "../../../../lib/images";
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
    const imageUrl = String(body?.imageUrl || "").trim();

    if (!threadId || (!content && !imageUrl)) {
      return NextResponse.json(
        { error: "threadId and content or image are required" },
        { status: 400 }
      );
    }

    if (imageUrl && !isLocalUploadUrl(imageUrl)) {
      return NextResponse.json({ error: "Invalid image" }, { status: 400 });
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
      imageUrl,
    });

    return NextResponse.json(
      {
        message: {
          id: message._id.toString(),
          content: message.content,
          imageUrl: message.imageUrl || "",
          createdAt: message.createdAt,
          sender: { id: user.userId, name: "You" },
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
