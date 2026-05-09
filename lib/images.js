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
