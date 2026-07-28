"use client";

import { useEffect, useState } from "react";
import type { Activity } from "./ActivityRenderer";
import { createClient } from "@/lib/supabase/client";

type Turn = { speaker: "learner" | "ai"; content: string };

export default function RoleplayActivity({ activity, onComplete }: { activity: Activity; onComplete: () => void }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState<string>();

  useEffect(() => {
    fetch("/api/capabilities").then((response) => response.json()).then((data) => setEnabled(Boolean(data.ai)));
  }, []);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const text = message.trim();
    if (!text || busy) return;
    setMessage("");
    const nextTurns = [...turns, { speaker: "learner" as const, content: text }];
    setTurns(nextTurns);
    setBusy(true);
    const { data } = await createClient().auth.getSession();
    const response = await fetch("/api/conversation/turn", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` },
      body: JSON.stringify({
        scenario: activity.title,
        persona: String(activity.content.persona || "friendly coworker"),
        turns: nextTurns,
        sessionId,
      }),
    });
    const result = await response.json();
    if (response.ok) {
      setSessionId(result.sessionId);
      const updated = [...nextTurns, { speaker: "ai" as const, content: result.reply }];
      setTurns(updated);
      if (updated.filter((turn) => turn.speaker === "learner").length >= Number(activity.content.turns || 3)) onComplete();
    }
    setBusy(false);
  }

  if (enabled === null) return <div className="skeleton activity-skeleton" />;
  if (!enabled) {
    return <div className="activity-panel capability-card"><span>✦</span><h2>AI Role-play đã sẵn sàng</h2><p>Luồng hội thoại, lịch sử và giao diện đã được chuẩn bị. Tính năng sẽ tự mở khi `OPENAI_API_KEY` được thêm vào server.</p><small>Không có khóa AI nào được gửi xuống trình duyệt.</small></div>;
  }

  return (
    <div className="activity-panel roleplay-panel">
      <p className="activity-type">AI ROLE-PLAY</p><h2>{activity.title}</h2><p>{activity.instructions}</p>
      <div className="conversation-log">
        {!turns.length && <div className="ai-turn">Hi! I&apos;m your new coworker. Tell me a little about yourself.</div>}
        {turns.map((turn, index) => <div className={turn.speaker === "learner" ? "learner-turn" : "ai-turn"} key={index}>{turn.content}</div>)}
        {busy && <div className="ai-turn"><span className="typing-dots"><i /><i /><i /></span></div>}
      </div>
      <form className="conversation-form" onSubmit={send}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type your answer in English…" /><button disabled={busy}>↑</button></form>
    </div>
  );
}
