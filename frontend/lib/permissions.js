import { NextResponse } from "next/server";
import connectDb from "./db";
import Server from "../models/Server";
import { getUserFromRequest } from "./auth";

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const forbidden = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

export function requireAuth(request) {
  const user = getUserFromRequest(request);

  if (!user) {
    return { user: null, response: unauthorized() };
  }

  return { user, response: null };
}

export function requireAdmin(request) {
  const { user, response } = requireAuth(request);

  if (response) {
    return { user: null, response };
  }

  if (user.role !== "admin") {
    return { user: null, response: forbidden() };
  }

  return { user, response: null };
}

export async function requireServerOwner(userId, serverId) {
  await connectDb();

  const server = await Server.findById(serverId).lean();

  if (!server) {
    return {
      server: null,
      response: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }

  if (server.ownerId.toString() !== String(userId)) {
    return { server: null, response: forbidden() };
  }

  return { server, response: null };
}
