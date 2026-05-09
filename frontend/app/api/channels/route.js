import { NextResponse } from "next/server";
import connectDb from "../../../lib/db";
import Channel from "../../../models/Channel";
import Server from "../../../models/Server";
import { requireAuth, requireServerOwner } from "../../../lib/permissions";

export async function GET(request) {
  const { response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    const serverId = request.nextUrl.searchParams.get("serverId");

    if (!serverId) {
      return NextResponse.json({ message: "serverId is required" }, { status: 400 });
    }

    await connectDb();

    const serverExists = await Server.exists({ _id: serverId });

    if (!serverExists) {
      return NextResponse.json({ message: "Server not found" }, { status: 404 });
    }

    const channels = await Channel.find({ serverId }).lean();
    const formatted = channels.map((channel) => ({
      id: channel._id.toString(),
      name: channel.name,
      type: channel.type || "text",
      serverId: channel.serverId.toString(),
    }));

    return NextResponse.json({ channels: formatted }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const type = ["text", "voice"].includes(body?.type) ? body.type : "text";
    const serverId = String(body?.serverId || "").trim();

    if (!name || !serverId) {
      return NextResponse.json(
        { message: "Channel name and serverId are required" },
        { status: 400 }
      );
    }

    const ownership = await requireServerOwner(user.userId, serverId);

    if (ownership.response) {
      return ownership.response;
    }

    const channel = await Channel.create({ name, type, serverId });

    return NextResponse.json(
      {
        channel: {
          id: channel._id.toString(),
          name: channel.name,
          type: channel.type,
          serverId: channel.serverId.toString(),
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
