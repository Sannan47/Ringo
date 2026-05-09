import jwt from "jsonwebtoken";

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

export function signSocketToken(payload) {
  return jwt.sign({ ...payload, purpose: "socket" }, getJwtSecret(), {
    expiresIn: "10m",
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
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
      error: { status: 401, message: "Authentication required" },
    };
  }

  return { user, error: null };
}

export function requireAdmin(request) {
  const { user, error } = requireAuth(request);

  if (error) {
    return { user: null, error };
  }

  if (user.role !== "admin") {
    return {
      user: null,
      error: { status: 403, message: "Admin access required" },
    };
  }

  return { user, error: null };
}
