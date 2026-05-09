import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/permissions";
import {
  isAllowedImageType,
  MAX_IMAGE_BYTES,
} from "../../../lib/images";

const allowedScopes = new Set(["avatars", "servers", "messages"]);

const signCloudinaryParams = (params, apiSecret) => {
  const signatureBase = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${signatureBase}${apiSecret}`)
    .digest("hex");
};

export async function POST(request) {
  const { response } = requireAuth(request);

  if (response) {
    return response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const scope = String(formData.get("scope") || "messages").trim();

    if (!allowedScopes.has(scope)) {
      return NextResponse.json({ error: "Invalid upload scope" }, { status: 400 });
    }

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!isAllowedImageType(file.type)) {
      return NextResponse.json(
        { error: "Use a JPG, PNG, WebP, or GIF image" },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Images must be 4 MB or smaller" },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Image storage is not configured" },
        { status: 500 }
      );
    }

    const baseFolder = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || "ringo";
    const folder = `${baseFolder}/${scope}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const uploadParams = { folder, timestamp };
    const uploadFormData = new FormData();
    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = new Blob([buffer], { type: file.type });

    uploadFormData.append("file", blob, file.name || "upload");
    uploadFormData.append("api_key", apiKey);
    uploadFormData.append("folder", folder);
    uploadFormData.append("timestamp", String(timestamp));
    uploadFormData.append(
      "signature",
      signCloudinaryParams(uploadParams, apiSecret)
    );

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadFormData,
      }
    );
    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok || !uploadData?.secure_url) {
      return NextResponse.json(
        { error: "Unable to upload image" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { url: uploadData.secure_url },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Unable to upload image" }, { status: 500 });
  }
}
