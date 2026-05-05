import jwt from "jsonwebtoken";

export function withAuth(handler) {
  return async function authHandler(req, res) {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({ message: "JWT secret is not configured" });
    }

    try {
      const payload = jwt.verify(token, secret);
      req.user = { userId: payload.userId, role: payload.role };
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}
