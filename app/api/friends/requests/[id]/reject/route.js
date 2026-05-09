import { NextResponse } from "next/server";
import connectDb from "../../../../../../lib/db";
import FriendRequest from "../../../../../../models/FriendRequest";
import { requireAuth } from "../../../../../../lib/permissions";

export async function PATCH(request, { params }) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    const resolvedParams = await params;
    const { id } = resolvedParams || {};

    if (!id) {
      return NextResponse.json({ error: "Request id is required" }, { status: 400 });
    }

    await connectDb();

    const requestDoc = await FriendRequest.findOne({
      _id: id,
      toUser: user.userId,
      status: "pending",
    });

    if (!requestDoc) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    requestDoc.status = "rejected";
    await requestDoc.save();

    return NextResponse.json({ message: "Request rejected" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
