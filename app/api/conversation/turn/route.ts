import { NextResponse } from "next/server";
import { createAuthenticatedClient } from "@/lib/supabase/authenticated";
import { getResponseText } from "@/lib/openai-response";

type Turn = { speaker: "learner" | "ai"; content: string };

export async function POST(request: Request) {
  const supabase = createAuthenticatedClient(request);
  if (!supabase) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI chưa được cấu hình.", code: "AI_NOT_CONFIGURED" }, { status: 503 });

  const body = (await request.json()) as { scenario: string; persona: string; turns: Turn[]; sessionId?: string };
  let sessionId = body.sessionId;
  if (!sessionId) {
    const { data: session, error } = await supabase.from("conversation_sessions").insert({
      user_id: userData.user.id,
      scenario: body.scenario,
      persona: body.persona,
    }).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    sessionId = session.id;
  }

  const latestLearnerTurn = [...body.turns].reverse().find((turn) => turn.speaker === "learner");
  if (latestLearnerTurn) {
    await supabase.from("conversation_turns").insert({
      session_id: sessionId,
      user_id: userData.user.id,
      speaker: "learner",
      content: latestLearnerTurn.content,
    });
  }

  const transcript = body.turns.slice(-8).map((turn) => `${turn.speaker === "learner" ? "Learner" : "Partner"}: ${turn.content}`).join("\n");
  const aiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-5.6-terra",
      reasoning: { effort: "low" },
      text: { verbosity: "low" },
      safety_identifier: userData.user.id,
      instructions: `You are ${body.persona} in an English role-play for a Vietnamese A1-A2 learner. Scenario: ${body.scenario}. Reply in natural, simple English, one or two sentences. Gently model a correction only when needed. Continue the role-play and ask at most one question.`,
      input: transcript,
    }),
  });
  const result = await aiResponse.json();
  if (!aiResponse.ok) return NextResponse.json({ error: result?.error?.message || "Không thể tạo lượt hội thoại." }, { status: 502 });
  const reply = getResponseText(result);
  await supabase.from("conversation_turns").insert({
    session_id: sessionId,
    user_id: userData.user.id,
    speaker: "ai",
    content: reply,
  });
  await supabase.from("conversation_sessions").update({ turn_count: body.turns.filter((turn) => turn.speaker === "learner").length }).eq("id", sessionId);
  return NextResponse.json({ reply, sessionId });
}
