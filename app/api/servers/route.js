import { NextResponse } from "next/server";
import connectDb from "../../../lib/db";
import Server from "../../../models/Server";
import { getUserFromRequest } from "../../../lib/auth";

export async function GET(request) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  try {
    await connectDb();
    const servers = await Server.find({ members: user.userId }).lean();

    return NextResponse.json({ servers }, { status: 200 });
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

    if (!name) {
      return NextResponse.json({ message: "Server name is required" }, { status: 400 });
    }

    await connectDb();

    const server = await Server.create({
      name,
      ownerId: user.userId,
      members: [user.userId],
    });

    return NextResponse.json({ server }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
