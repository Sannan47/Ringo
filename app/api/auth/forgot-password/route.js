import crypto from "crypto";
import { NextResponse } from "next/server";
import connectDb from "../../../../lib/db";
import User from "../../../../models/User";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDb();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    return NextResponse.json(
      {
        message: "Password reset token generated",
        resetLink: `/reset-password/${token}`,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
