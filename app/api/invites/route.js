import crypto from "crypto";
import { NextResponse } from "next/server";
import connectDb from "../../../lib/db";
import ServerInvite from "../../../models/ServerInvite";
import { requireAuth, requireServerOwner } from "../../../lib/permissions";

export async function POST(request) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    const body = await request.json();
    const serverId = String(body?.serverId || "").trim();

    if (!serverId) {
      return NextResponse.json({ error: "serverId is required" }, { status: 400 });
    }

    const ownership = await requireServerOwner(user.userId, serverId);

    if (ownership.response) {
      return ownership.response;
    }

    await connectDb();

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await ServerInvite.create({
      serverId,
      token,
      createdBy: user.userId,
      expiresAt,
      maxUses: 1,
      uses: 0,
    });

    return NextResponse.json(
      {
        message: "Invite generated",
        inviteLink: `/invite/${token}`,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
