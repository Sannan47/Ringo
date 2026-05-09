import { NextResponse } from "next/server";
import connectDb from "../../../../lib/db";
import User from "../../../../models/User";
import { hashPassword } from "../../../../lib/hash";
import { validateSignupInput } from "../../../../lib/validators";

export async function POST(request) {
  try {
    const body = await request.json();
    const { errors, values } = validateSignupInput(body || {});

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { message: Object.values(errors)[0] },
        { status: 400 }
      );
    }

    await connectDb();

    const existingUser = await User.findOne({ email: values.normalizedEmail }).lean();

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(values.rawPassword);

    const user = await User.create({
      name: values.trimmedName,
      email: values.normalizedEmail,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        message: "Signup successful",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
