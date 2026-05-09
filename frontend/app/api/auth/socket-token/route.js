import { NextResponse } from "next/server";
import { signSocketToken } from "../../../../lib/auth";
import { requireAuth } from "../../../../lib/permissions";

export async function GET(request) {
  const { user, response } = requireAuth(request);

  if (response) {
    return response;
  }

  return NextResponse.json(
    {
      token: signSocketToken({
        userId: user.userId,
        email: user.email,
        role: user.role,
      }),
    },
    { status: 200 }
  );
}
