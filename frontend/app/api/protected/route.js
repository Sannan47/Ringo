import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/permissions";

export async function GET(request) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  return NextResponse.json({ message: "Protected data", user }, { status: 200 });
}
