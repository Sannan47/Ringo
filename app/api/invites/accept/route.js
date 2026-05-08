import { NextResponse } from "next/server";
import connectDb from "../../../../lib/db";
import Server from "../../../../models/Server";
import ServerInvite from "../../../../models/ServerInvite";
import { requireAuth } from "../../../../lib/permissions";

export async function POST(request) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    const body = await request.json();
    const token = String(body?.token || "").trim();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await connectDb();

    const invite = await ServerInvite.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!invite || invite.uses >= invite.maxUses) {
      return NextResponse.json({ error: "Invite expired" }, { status: 400 });
    }

    await Server.updateOne(
      { _id: invite.serverId },
      { $addToSet: { members: user.userId } }
    );

    invite.uses += 1;
    if (invite.uses >= invite.maxUses) {
      invite.expiresAt = new Date();
    }
    await invite.save();

    return NextResponse.json(
      { message: "Joined server", serverId: invite.serverId.toString() },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
