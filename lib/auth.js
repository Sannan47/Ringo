import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  return secret;
}

export function signAuthToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    return null;
  }
}

export function verifyAuthToken(token) {
  const payload = verifyToken(token);

  if (!payload) {
    throw new Error("Invalid token");
  }

  return payload;
}

export function getUserFromRequest(request) {
  const token = request?.cookies?.get?.("token")?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };
}

export function requireAuth(request) {
  const user = getUserFromRequest(request);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return { user, response: null };
}

export function requireAdmin(request) {
  const { user, response } = requireAuth(request);

  if (response) {
    return { user: null, response };
  }

  if (user.role !== "admin") {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return { user, response: null };
}
