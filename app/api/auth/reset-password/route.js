import { NextResponse } from "next/server";
import connectDb from "../../../../lib/db";
import User from "../../../../models/User";
import { hashPassword } from "../../../../lib/hash";

export async function POST(request) {
  try {
    const body = await request.json();
    const token = String(body?.token || "").trim();
    const password = String(body?.password || "");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }

    await connectDb();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    user.password = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Password has been reset" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
