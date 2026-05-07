import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import connectDb from "../../../../lib/db";
import User from "../../../../models/User";
import { comparePassword } from "../../../../lib/hash";
import { signAuthToken } from "../../../../lib/auth";
import { validateLoginInput } from "../../../../lib/validators";

export async function POST(request) {
  try {
    const body = await request.json();
    const { errors, values } = validateLoginInput(body || {});

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { message: Object.values(errors)[0] },
        { status: 400 }
      );
    }

    await connectDb();

    const user = await User.findOne({ email: values.normalizedEmail });

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account disabled" }, { status: 403 });
    }

    const isMatch = await comparePassword(values.rawPassword, user.password);

    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = signAuthToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
