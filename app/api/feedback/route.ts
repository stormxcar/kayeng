import { NextResponse } from "next/server";
import { createAuthenticatedClient } from "@/lib/supabase/authenticated";
import { getResponseText } from "@/lib/openai-response";

export async function POST(request: Request) {
  const supabase = createAuthenticatedClient(request);
  if (!supabase) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI chưa được cấu hình trên server.", code: "OPENAI_NOT_CONFIGURED" }, { status: 503 });
  }

  const body = (await request.json()) as {
    transcript: string;
    scenario?: string;
    level?: string;
  };
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.6-terra",
      reasoning: { effort: "low" },
      text: { verbosity: "low" },
      instructions:
        "Bạn là gia sư tiếng Anh cho người Việt. Chỉ đánh giá nội dung được cung cấp. Trả lời ngắn bằng tiếng Việt với đúng 4 mục: điểm tốt, lỗi quan trọng, câu sửa tự nhiên, bài luyện tiếp theo. Không tuyên bố đây là chứng chỉ CEFR.",
      input: `Trình độ: ${body.level || "A1"}\nTình huống: ${body.scenario || "Giới thiệu bản thân"}\nTranscript: ${body.transcript}`,
      safety_identifier: data.user.id,
    }),
  });
  const result = await response.json();
  if (!response.ok) return NextResponse.json({ error: result?.error?.message || "Không thể tạo phản hồi AI." }, { status: 502 });
  return NextResponse.json({ feedback: getResponseText(result) });
}
