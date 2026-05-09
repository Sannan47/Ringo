import { NextResponse } from "next/server";
import connectDb from "../../../lib/db";
import Server from "../../../models/Server";
import { requireAuth } from "../../../lib/permissions";

export async function GET(request) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    await connectDb();
    const servers = await Server.find({ members: user.userId }).lean();
    const formatted = servers.map((server) => ({
      id: server._id.toString(),
      name: server.name,
      ownerId: server.ownerId.toString(),
    }));

    return NextResponse.json({ servers: formatted }, { status: 200 });
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

    if (!name) {
      return NextResponse.json({ message: "Server name is required" }, { status: 400 });
    }

    await connectDb();

    const server = await Server.create({
      name,
      ownerId: user.userId,
      members: [user.userId],
    });

    return NextResponse.json(
      {
        server: {
          id: server._id.toString(),
          name: server.name,
          ownerId: server.ownerId.toString(),
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
