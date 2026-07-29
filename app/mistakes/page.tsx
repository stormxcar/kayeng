"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/lib/hooks/use-auth";

type Mistake = {
  id: string;
  activity_id: string;
  score: number | null;
  answer: Record<string, unknown>;
  created_at: string;
  lesson_activities: { title: string; activity_type: string; lesson_id: string } | null;
};

export default function MistakesPage() {
  const { user, supabase, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("activity_attempts")
      .select("id,activity_id,score,answer,created_at,lesson_activities(title,activity_type,lesson_id)")
      .eq("user_id", user.id).eq("is_correct", false)
      .order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => {
        const unique = new Map<string, Mistake>();
        for (const row of (data || []) as unknown as Mistake[]) if (!unique.has(row.activity_id)) unique.set(row.activity_id, row);
        setItems([...unique.values()]);
        setLoading(false);
      });
  }, [supabase, user]);

  return <PageShell eyebrow="MISTAKE REVIEW" title="Ôn lại lỗi sai">
    {!authLoading && !user ? <div className="empty-state"><AlertCircle/><h2>Đăng nhập để xem lỗi sai</h2><p>Các lần thử chưa đúng sẽ được gom thành hàng đợi luyện lại.</p></div> :
      loading ? <div>{[1,2,3].map((item)=><div className="skeleton history-skeleton" key={item}/>)}</div> :
      items.length ? <div className="history-list">{items.map((item)=><article className="history-item" key={item.id}><span className="history-icon"><AlertCircle/></span><div><small>{item.lesson_activities?.activity_type.replaceAll("_"," ")}</small><h2>{item.lesson_activities?.title || "Hoạt động luyện tập"}</h2><p>{Math.round(item.score || 0)} điểm • {new Date(item.created_at).toLocaleDateString("vi-VN")}</p></div><Link href={`/lesson/${item.lesson_activities?.lesson_id}`}><RotateCcw/> Luyện lại</Link></article>)}</div> :
      <div className="empty-state"><CheckCircle2/><h2>Không còn lỗi cần ôn</h2><p>Những activity trả lời sai sẽ tự động xuất hiện tại đây.</p><Link href="/practice">Tiếp tục luyện tập</Link></div>}
  </PageShell>;
}
