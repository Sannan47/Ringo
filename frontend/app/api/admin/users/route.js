import { NextResponse } from "next/server";
import connectDb from "../../../../lib/db";
import User from "../../../../models/User";
import { requireAdmin } from "../../../../lib/permissions";

export async function GET(request) {
  const { response } = requireAdmin(request);

  if (response) {
    return response;
  }

  try {
    await connectDb();
    const users = await User.find({}, "name email role isActive createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: Boolean(user.isActive),
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
