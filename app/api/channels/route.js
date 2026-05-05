import { NextResponse } from "next/server";
import connectDb from "../../../lib/db";
import Channel from "../../../models/Channel";
import Server from "../../../models/Server";
import { getUserFromRequest } from "../../../lib/auth";

export async function GET(request) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
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

    return NextResponse.json({ channels }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const serverId = String(body?.serverId || "").trim();

    if (!name || !serverId) {
      return NextResponse.json(
        { message: "Channel name and serverId are required" },
        { status: 400 }
      );
    }

    await connectDb();

    const serverExists = await Server.exists({ _id: serverId });

    if (!serverExists) {
      return NextResponse.json({ message: "Server not found" }, { status: 404 });
    }

    const channel = await Channel.create({ name, serverId });

    return NextResponse.json({ channel }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
