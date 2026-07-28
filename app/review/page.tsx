"use client";

import { useEffect, useMemo, useState } from "react";
import { Brain, Check, RotateCcw, Volume2 } from "lucide-react";
import { createEmptyCard, fsrs, Rating, type CardInput, type Grade } from "ts-fsrs";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/lib/hooks/use-auth";

type VocabularyCard = { id: string; word: string; phonetic: string | null; definition: string | null; fsrs_card: CardInput | null };
const scheduler = fsrs({ request_retention: .9, maximum_interval: 3650, enable_fuzz: true, enable_short_term: true });

export default function ReviewPage() {
  const { user, supabase, loading } = useAuth();
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const current = cards[index];

  useEffect(() => {
    if (!user) return;
    supabase.from("user_vocabulary").select("id,word,phonetic,definition,fsrs_card").eq("user_id", user.id)
      .lte("next_review_at", new Date().toISOString()).order("next_review_at").limit(30)
      .then(({ data }) => setCards((data || []) as VocabularyCard[]));
  }, [supabase, user]);

  const previews = useMemo(() => {
    if (!current) return null;
    return scheduler.repeat(current.fsrs_card || createEmptyCard(), new Date());
  }, [current]);

  async function rate(rating: Grade) {
    if (!current) return;
    const result = scheduler.next(current.fsrs_card || createEmptyCard(), new Date(), rating);
    await supabase.from("user_vocabulary").update({
      fsrs_card: result.card,
      next_review_at: result.card.due.toISOString(),
      interval_days: result.card.scheduled_days,
      review_count: result.card.reps,
      mastery: Math.min(100, Math.round(result.card.stability * 6)),
      last_rating: rating,
      last_reviewed_at: new Date().toISOString(),
    }).eq("id", current.id);
    setReviewed((value) => value + 1);
    setIndex((value) => value + 1);
    setRevealed(false);
  }

  const interval = (rating: Grade) => {
    const due = previews?.[rating].card.due;
    if (!due) return "";
    const minutes = Math.max(1, Math.round((due.getTime() - Date.now()) / 60000));
    return minutes < 60 ? `${minutes} phút` : minutes < 1440 ? `${Math.round(minutes / 60)} giờ` : `${Math.round(minutes / 1440)} ngày`;
  };

  return <PageShell eyebrow="FSRS SMART REVIEW" title="Ôn tập thông minh">
    {!loading && !user ? <div className="empty-state"><Brain size={42}/><h2>Đăng nhập để ôn tập</h2><p>Sổ từ và lịch FSRS được đồng bộ theo tài khoản của bạn.</p></div> :
    !current ? <section className="review-complete"><Check size={46}/><small>HOÀN TẤT</small><h2>{reviewed ? `Bạn vừa ôn ${reviewed} từ` : "Không có từ đến hạn"}</h2><p>FSRS sẽ đưa từ trở lại đúng thời điểm trí nhớ bắt đầu suy giảm.</p></section> :
    <section className="fsrs-review">
      <header><span><Brain size={19}/> FSRS v6</span><b>{index + 1}/{cards.length}</b></header>
      <button className={`flashcard ${revealed ? "revealed" : ""}`} onClick={() => setRevealed(true)}>
        <small>{revealed ? "ĐỊNH NGHĨA" : "TỪ VỰNG"}</small>
        <h2>{current.word}</h2>
        {current.phonetic && <p>{current.phonetic}</p>}
        {revealed ? <strong>{current.definition || "Chưa có định nghĩa."}</strong> : <span>Chạm để lật thẻ</span>}
      </button>
      <button className="word-audio" onClick={() => speechSynthesis.speak(new SpeechSynthesisUtterance(current.word))}><Volume2 size={18}/> Nghe phát âm</button>
      {revealed && <div className="fsrs-ratings">
        <button onClick={() => rate(Rating.Again)}><b>Quên</b><small>{interval(Rating.Again)}</small></button>
        <button onClick={() => rate(Rating.Hard)}><b>Khó</b><small>{interval(Rating.Hard)}</small></button>
        <button onClick={() => rate(Rating.Good)}><b>Tốt</b><small>{interval(Rating.Good)}</small></button>
        <button onClick={() => rate(Rating.Easy)}><b>Dễ</b><small>{interval(Rating.Easy)}</small></button>
      </div>}
      <p className="fsrs-note"><RotateCcw size={14}/> Lịch tiếp theo được tính từ độ ổn định và độ khó riêng của từng thẻ.</p>
    </section>}
  </PageShell>;
}
