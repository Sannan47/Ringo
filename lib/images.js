export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export const imageExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function isAllowedImageType(type) {
  return Boolean(imageExtensions[type]);
}

export function isLocalUploadUrl(url) {
  return /^\/uploads\/[a-z0-9-]+\/[a-f0-9-]+\.(jpg|png|webp|gif)$/i.test(
    String(url || "")
  );
}

export function isCloudinaryImageUrl(url) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  if (!cloudName) {
    return false;
  }

  try {
    const parsed = new URL(String(url || ""));
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.startsWith(`/${cloudName}/image/upload/`)
    );
  } catch {
    return false;
  }
}

export function isStoredImageUrl(url) {
  return isLocalUploadUrl(url) || isCloudinaryImageUrl(url);
}
