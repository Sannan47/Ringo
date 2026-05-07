import { NextResponse } from "next/server";
import connectDb from "../../../../../../lib/db";
import User from "../../../../../../models/User";
import { requireAdmin } from "../../../../../../lib/permissions";

const allowedRoles = ["admin", "user"];

export async function PATCH(request, { params }) {
  const { user: adminUser, response } = requireAdmin(request);

  if (response) {
    return response;
  }

  try {
    const resolvedParams = await params;
    const { id } = resolvedParams || {};
    const body = await request.json();
    const role = String(body?.role || "").trim();

    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (adminUser?.userId === id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDb();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.role = role;
    await user.save();

    return NextResponse.json(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
