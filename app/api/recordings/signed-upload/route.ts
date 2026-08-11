import { NextResponse } from "next/server";

export const dynamic = "force-static";
import { createAuthenticatedClient } from "@/lib/supabase/authenticated";

export async function POST(request: Request) {
  const supabase = createAuthenticatedClient(request);
  if (!supabase) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
  }

  const body = (await request.json()) as {
    lessonId?: string;
    activityId?: string;
    referenceText?: string;
    durationMs?: number;
  };
  const recordingId = crypto.randomUUID();
  const storagePath = `${userData.user.id}/${new Date().toISOString().slice(0, 10)}/${recordingId}.wav`;

  const { data: upload, error: uploadError } = await supabase.storage
    .from("speaking-recordings")
    .createSignedUploadUrl(storagePath);
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { error: insertError } = await supabase.from("audio_recordings").insert({
    id: recordingId,
    user_id: userData.user.id,
    lesson_id: body.lessonId || null,
    activity_id: body.activityId || null,
    storage_path: storagePath,
    mime_type: "audio/wav",
    duration_ms: body.durationMs || null,
    reference_text: body.referenceText || null,
    status: "pending",
  });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({
    recordingId,
    path: storagePath,
    token: upload.token,
  });
}
