const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

export function validateSignupInput({ name, email, password }) {
  const errors = {};
  const trimmedName = String(name || "").trim();
  const normalizedEmail = normalizeEmail(email);
  const rawPassword = String(password || "");

  if (!trimmedName) {
    errors.name = "Name is required";
  }

  if (!normalizedEmail) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(normalizedEmail)) {
    errors.email = "Invalid email format";
  }

  if (!rawPassword) {
    errors.password = "Password is required";
  } else if (rawPassword.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return {
    errors,
    values: { trimmedName, normalizedEmail, rawPassword },
  };
}

export function validateLoginInput({ email, password }) {
  const errors = {};
  const normalizedEmail = normalizeEmail(email);
  const rawPassword = String(password || "");

  if (!normalizedEmail) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(normalizedEmail)) {
    errors.email = "Invalid email format";
  }

  if (!rawPassword) {
    errors.password = "Password is required";
  }

  return {
    errors,
    values: { normalizedEmail, rawPassword },
  };
}
