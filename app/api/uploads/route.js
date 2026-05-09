import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/permissions";
import {
  imageExtensions,
  isAllowedImageType,
  MAX_IMAGE_BYTES,
} from "../../../lib/images";

const allowedScopes = new Set(["avatars", "servers", "messages"]);

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

    const extension = imageExtensions[file.type];
    const fileName = `${randomUUID().replace(/-/g, "")}.${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", scope);
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);

    return NextResponse.json(
      { url: `/uploads/${scope}/${fileName}` },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Unable to upload image" }, { status: 500 });
  }
}
