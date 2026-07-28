"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/client";

type Practice = { id: string; title: string; instructions: string | null; activity_type: string; lessons: { id: string; title: string } };

export default function PracticePage() {
  const [items, setItems] = useState<Practice[]>([]);
  const [capabilities, setCapabilities] = useState({ ai: false, pronunciation: false, realtime: false });
  useEffect(() => {
    Promise.all([
      createClient().from("lesson_activities").select("id,title,instructions,activity_type,lessons(id,title)").in("activity_type", ["speaking","pronunciation","roleplay"]).limit(20),
      fetch("/api/capabilities").then((response) => response.json()),
    ]).then(([activities, caps]) => { setItems((activities.data || []) as unknown as Practice[]); setCapabilities(caps); });
  }, []);
  return (
    <PageShell eyebrow="SPEAKING LAB" title="Luyện nói">
      <div className="capability-strip"><span className={capabilities.pronunciation ? "online" : ""}>● Chấm phát âm</span><span className={capabilities.ai ? "online" : ""}>● AI Role-play</span><span>○ Realtime voice — sắp ra mắt</span></div>
      <div className="practice-grid">
        <Link href={items[0] ? `/lesson/${items[0].lessons.id}` : "/learn"} className="practice-feature"><span>◉</span><div><small>LUYỆN NHANH</small><h2>Đọc và nhận phản hồi</h2><p>Ghi âm WAV, nghe lại và xem điểm từng từ khi Azure được cấu hình.</p></div><b>→</b></Link>
        {items.map((item) => <article className="practice-card" key={item.id}><span>{item.activity_type === "roleplay" ? "✦" : "●"}</span><div><small>{item.lessons?.title}</small><h2>{item.title}</h2><p>{item.instructions}</p></div><Link href="/learn">Mở bài học →</Link></article>)}
      </div>
    </PageShell>
  );
}
