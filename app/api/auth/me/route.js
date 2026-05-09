import { NextResponse } from "next/server";
import connectDb from "../../../../lib/db";
import User from "../../../../models/User";
import { isLocalUploadUrl } from "../../../../lib/images";
import { requireAuth } from "../../../../lib/permissions";

export async function GET(request) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    await connectDb();
    const userDoc = await User.findById(user.userId).select("name email role avatarUrl").lean();

    return NextResponse.json(
      {
        user: {
          userId: user.userId,
          email: userDoc?.email || user.email,
          role: userDoc?.role || user.role,
          name: userDoc?.name,
          avatarUrl: userDoc?.avatarUrl || "",
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ user }, { status: 200 });
  }
}

export async function PATCH(request) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    const body = await request.json();
    const avatarUrl = String(body?.avatarUrl || "").trim();

    if (avatarUrl && !isLocalUploadUrl(avatarUrl)) {
      return NextResponse.json({ error: "Invalid image" }, { status: 400 });
    }

    await connectDb();
    const userDoc = await User.findByIdAndUpdate(
      user.userId,
      { avatarUrl },
      { new: true }
    )
      .select("name email role avatarUrl")
      .lean();

    return NextResponse.json(
      {
        user: {
          userId: user.userId,
          email: userDoc?.email || user.email,
          role: userDoc?.role || user.role,
          name: userDoc?.name,
          avatarUrl: userDoc?.avatarUrl || "",
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Unable to update profile" }, { status: 500 });
  }
}
