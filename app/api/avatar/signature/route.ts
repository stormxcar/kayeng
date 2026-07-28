import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createAuthenticatedClient } from "@/lib/supabase/authenticated";

export async function POST(request: Request) {
  const supabase = createAuthenticatedClient(request);
  if (!supabase) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ." }, { status: 401 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary chưa được cấu hình." }, { status: 503 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "kayeng/avatars";
  const publicId = data.user.id;
  const params = `folder=${folder}&overwrite=true&public_id=${publicId}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(`${params}${apiSecret}`).digest("hex");

  return NextResponse.json({ cloudName, apiKey, timestamp, folder, publicId, signature });
}
