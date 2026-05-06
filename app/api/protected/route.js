import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/auth";

export async function GET(request) {
  const { user, error } = requireAuth(request);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json({ message: "Protected data", user }, { status: 200 });
}
