import { NextResponse } from "next/server";
import connectDb from "../../../../lib/db";
import Channel from "../../../../models/Channel";
import Message from "../../../../models/Message";
import Server from "../../../../models/Server";
import { isLocalUploadUrl } from "../../../../lib/images";
import { requireAuth, requireServerOwner } from "../../../../lib/permissions";

export async function PATCH(request, { params }) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    const resolvedParams = await params;
    const { id } = resolvedParams || {};
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const imageUrl =
      body?.imageUrl === undefined ? undefined : String(body.imageUrl || "").trim();

    if (!id) {
      return NextResponse.json({ error: "Server id is required" }, { status: 400 });
    }

    if (!name && imageUrl === undefined) {
      return NextResponse.json({ error: "Server name is required" }, { status: 400 });
    }

    if (imageUrl !== undefined && imageUrl && !isLocalUploadUrl(imageUrl)) {
      return NextResponse.json({ error: "Invalid image" }, { status: 400 });
    }

    const ownership = await requireServerOwner(user.userId, id);

    if (ownership.response) {
      return ownership.response;
    }

    const updates = {};

    if (name) {
      updates.name = name;
    }

    if (imageUrl !== undefined) {
      updates.imageUrl = imageUrl;
    }

    const server = await Server.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).lean();

    return NextResponse.json(
      {
        server: {
          id: server._id.toString(),
          name: server.name,
          imageUrl: server.imageUrl || "",
          ownerId: server.ownerId.toString(),
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    const resolvedParams = await params;
    const { id } = resolvedParams || {};

    if (!id) {
      return NextResponse.json({ error: "Server id is required" }, { status: 400 });
    }

    const ownership = await requireServerOwner(user.userId, id);

    if (ownership.response) {
      return ownership.response;
    }

    await connectDb();

    const channelIds = await Channel.find({ serverId: id })
      .select("_id")
      .lean();

    const ids = channelIds.map((channel) => channel._id);

    if (ids.length > 0) {
      await Message.deleteMany({ channelId: { $in: ids } });
    }

    await Channel.deleteMany({ serverId: id });
    await Server.deleteOne({ _id: id });

    return NextResponse.json({ message: "Server deleted" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
