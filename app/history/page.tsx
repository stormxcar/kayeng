"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/lib/hooks/use-auth";

type ProgressItem = {
  lesson_id: string;
  status: string;
  percent_complete: number;
  score: number | null;
  completed_at: string | null;
  updated_at: string;
  lessons: { title: string; units: { title: string; courses: { title: string } } };
};
type RecordingItem = {
  id: string;
  created_at: string;
  reference_text: string | null;
  status: string;
  storage_path: string;
  playback?: string;
  speaking_assessments: Array<{ overall_score: number | null; transcript: string | null }>;
};
type ConversationItem = { id: string; scenario: string; persona: string; turn_count: number; status: string; started_at: string };

export default function HistoryPage() {
  const { user, supabase, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"lessons" | "recordings" | "conversations">("lessons");
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [conversationTurns, setConversationTurns] = useState<Array<{ id: string; speaker: string; content: string }>>([]);
  const [expandedConversation, setExpandedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState({ lessons: false, recordings: false, conversations: false });
  const pageSize = 20;

  useEffect(() => {
    if (!user) return;
    async function loadHistory() {
      const [progressResult, recordingResult, conversationResult] = await Promise.all([
        supabase.from("lesson_progress")
          .select("lesson_id,status,percent_complete,score,completed_at,updated_at,lessons(title,units(title,courses(title)))")
          .eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(pageSize + 1),
        supabase.from("audio_recordings")
          .select("id,created_at,reference_text,status,storage_path,speaking_assessments(overall_score,transcript)")
          .eq("user_id", user!.id).order("created_at", { ascending: false }).limit(pageSize + 1),
        supabase.from("conversation_sessions")
          .select("id,scenario,persona,turn_count,status,started_at")
          .eq("user_id", user!.id).order("started_at", { ascending: false }).limit(pageSize + 1),
      ]);
      const nextProgress = (progressResult.data || []) as unknown as ProgressItem[];
      const nextRecordings = (recordingResult.data || []) as unknown as RecordingItem[];
      const nextConversations = (conversationResult.data || []) as ConversationItem[];
      setProgress(nextProgress.slice(0, pageSize));
      setRecordings(nextRecordings.slice(0, pageSize));
      setConversations(nextConversations.slice(0, pageSize));
      setHasMore({
        lessons: nextProgress.length > pageSize,
        recordings: nextRecordings.length > pageSize,
        conversations: nextConversations.length > pageSize,
      });
      setLoading(false);
    }
    void loadHistory();
  }, [supabase, user]);

  async function loadMore() {
    if (!user || loadingMore || !hasMore[tab]) return;
    setLoadingMore(true);
    if (tab === "lessons" && progress.length) {
      const { data } = await supabase.from("lesson_progress")
        .select("lesson_id,status,percent_complete,score,completed_at,updated_at,lessons(title,units(title,courses(title)))")
        .eq("user_id", user.id).lt("updated_at", progress.at(-1)!.updated_at)
        .order("updated_at", { ascending: false }).limit(pageSize + 1);
      const next = (data || []) as unknown as ProgressItem[];
      setProgress((current) => [...current, ...next.slice(0, pageSize)]);
      setHasMore((current) => ({ ...current, lessons: next.length > pageSize }));
    }
    if (tab === "recordings" && recordings.length) {
      const { data } = await supabase.from("audio_recordings")
        .select("id,created_at,reference_text,status,storage_path,speaking_assessments(overall_score,transcript)")
        .eq("user_id", user.id).lt("created_at", recordings.at(-1)!.created_at)
        .order("created_at", { ascending: false }).limit(pageSize + 1);
      const next = (data || []) as unknown as RecordingItem[];
      setRecordings((current) => [...current, ...next.slice(0, pageSize)]);
      setHasMore((current) => ({ ...current, recordings: next.length > pageSize }));
    }
    if (tab === "conversations" && conversations.length) {
      const { data } = await supabase.from("conversation_sessions")
        .select("id,scenario,persona,turn_count,status,started_at")
        .eq("user_id", user.id).lt("started_at", conversations.at(-1)!.started_at)
        .order("started_at", { ascending: false }).limit(pageSize + 1);
      const next = (data || []) as ConversationItem[];
      setConversations((current) => [...current, ...next.slice(0, pageSize)]);
      setHasMore((current) => ({ ...current, conversations: next.length > pageSize }));
    }
    setLoadingMore(false);
  }

  async function loadPlayback(recording: RecordingItem) {
    if (recording.playback) return;
    const { data } = await supabase.storage.from("speaking-recordings").createSignedUrl(recording.storage_path, 900);
    if (data?.signedUrl) {
      setRecordings((current) => current.map((item) => item.id === recording.id ? { ...item, playback: data.signedUrl } : item));
    }
  }

  async function reviewConversation(id: string) {
    if (expandedConversation === id) {
      setExpandedConversation(null);
      return;
    }
    const { data } = await supabase.from("conversation_turns").select("id,speaker,content").eq("session_id", id).order("created_at");
    setConversationTurns(data || []);
    setExpandedConversation(id);
  }

  return (
    <PageShell eyebrow="HÀNH TRÌNH CỦA BẠN" title="Lịch sử học tập">
      {!authLoading && !user ? (
        <div className="empty-state"><span>↻</span><h2>Đăng nhập để xem lịch sử</h2><p>Mọi bài học, bản ghi và hội thoại sẽ xuất hiện tại đây.</p><Link href="/">Đăng nhập</Link></div>
      ) : (
        <>
          <div className="segmented-tabs">
            <button className={tab === "lessons" ? "active" : ""} onClick={() => setTab("lessons")}>Bài đã học <span>{progress.length}</span></button>
            <button className={tab === "recordings" ? "active" : ""} onClick={() => setTab("recordings")}>Bản ghi <span>{recordings.length}</span></button>
            <button className={tab === "conversations" ? "active" : ""} onClick={() => setTab("conversations")}>Hội thoại <span>{conversations.length}</span></button>
          </div>
          {loading ? <div>{[1,2,3].map((item) => <div className="skeleton history-skeleton" key={item} />)}</div> : (
            <div className="history-list">
              {tab === "lessons" && progress.map((item) => (
                <article className="history-item" key={item.lesson_id}>
                  <span className={item.status === "completed" ? "history-icon done" : "history-icon"}>{item.status === "completed" ? "✓" : "◷"}</span>
                  <div><small>{item.lessons?.units?.courses?.title}</small><h2>{item.lessons?.title}</h2><p>{new Date(item.completed_at || item.updated_at).toLocaleDateString("vi-VN")} • {item.percent_complete}% hoàn thành</p></div>
                  <Link href={`/lesson?id=${item.lesson_id}`}>{item.status === "completed" ? "Xem lại" : "Tiếp tục"} →</Link>
                </article>
              ))}
              {tab === "recordings" && recordings.map((item) => (
                <article className="recording-item" key={item.id}>
                  <div className="recording-head"><span>●</span><div><h2>{item.reference_text || "Luyện nói tự do"}</h2><p>{new Date(item.created_at).toLocaleString("vi-VN")}</p></div><strong>{item.speaking_assessments?.[0]?.overall_score ? `${Math.round(item.speaking_assessments[0].overall_score!)} điểm` : item.status}</strong></div>
                  {item.playback ? <audio controls autoPlay preload="none" src={item.playback} /> : <button className="review-button" onClick={() => void loadPlayback(item)}>Phát bản ghi</button>}
                  {item.speaking_assessments?.[0]?.transcript && <p className="recording-transcript">{item.speaking_assessments[0].transcript}</p>}
                </article>
              ))}
              {tab === "conversations" && conversations.map((item) => (
                <div className="conversation-history" key={item.id}>
                  <article className="history-item"><span className="history-icon">✦</span><div><small>{item.persona}</small><h2>{item.scenario}</h2><p>{item.turn_count} lượt • {new Date(item.started_at).toLocaleDateString("vi-VN")}</p></div><button className="review-button" onClick={() => reviewConversation(item.id)}>{expandedConversation === item.id ? "Thu gọn" : "Xem lại"}</button></article>
                  {expandedConversation === item.id && <div className="conversation-review">{conversationTurns.map((turn) => <p className={turn.speaker === "learner" ? "learner-turn" : "ai-turn"} key={turn.id}>{turn.content}</p>)}</div>}
                </div>
              ))}
              {((tab === "lessons" && !progress.length) || (tab === "recordings" && !recordings.length) || (tab === "conversations" && !conversations.length)) && <div className="empty-state"><span>◇</span><h2>Chưa có hoạt động</h2><p>Hoàn thành bài đầu tiên để bắt đầu lưu hành trình.</p><Link href="/learn">Bắt đầu học</Link></div>}
              {hasMore[tab] && <button className="history-load-more" disabled={loadingMore} onClick={() => void loadMore()}>{loadingMore ? <span className="spinner" aria-label="Đang lấy thêm lịch sử" /> : "Xem thêm lịch sử"}</button>}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
