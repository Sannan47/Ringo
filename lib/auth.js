import jwt from "jsonwebtoken";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  return secret;
}

export function signAuthToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "1d" });
}

export function verifyAuthToken(token) {
  return jwt.verify(token, getJwtSecret());
}
