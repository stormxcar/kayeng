"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ActivityRenderer, type Activity } from "@/components/activities/ActivityRenderer";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/use-auth";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  estimated_minutes: number;
  lesson_activities: Activity[];
};

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ percentComplete: number; lessonCompleted: boolean } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function loadLesson() {
      const { data } = await supabase
      .from("lessons")
      .select("id,title,description,estimated_minutes,lesson_activities(id,activity_type,title,instructions,content)")
      .eq("id", id)
      .order("sort_order", { referencedTable: "lesson_activities" })
      .single();
      const loaded = data as Lesson | null;
      setLesson(loaded);
      if (user && loaded?.lesson_activities.length) {
        const { data: activityData } = await supabase.from("activity_progress").select("activity_id").eq("user_id", user.id).eq("status", "completed").in("activity_id", loaded.lesson_activities.map((activity) => activity.id));
        setCompleted(new Set((activityData || []).map((item) => item.activity_id)));
      }
    }
    loadLesson();
  }, [id, user]);

  async function submit(answer: Record<string, unknown>, score: number, correct: boolean) {
    if (!user || !lesson) return;
    const activity = lesson.lesson_activities[activeIndex];
    const { data, error } = await createClient().rpc("submit_activity", {
      p_activity_id: activity.id,
      p_answer: answer,
      p_score: score,
      p_is_correct: correct,
    });
    if (error) return;
    setCompleted((current) => new Set(current).add(activity.id));
    setResult(data as { percentComplete: number; lessonCompleted: boolean });
    if (activeIndex < lesson.lesson_activities.length - 1) setActiveIndex((index) => index + 1);
  }

  if (authLoading || !lesson) return <div className="lesson-loading"><div className="skeleton" style={{ width: "70%", height: 50 }} /><div className="skeleton activity-skeleton" /></div>;
  if (!user) return <div className="auth-required"><div className="brand-mark">K</div><h1>Đăng nhập để bắt đầu bài học</h1><p>Tiến độ và kết quả của bạn sẽ được lưu trên mọi thiết bị.</p><Link href="/">Về trang đăng nhập</Link></div>;

  const activity = lesson.lesson_activities[activeIndex];
  const visualPercent = result?.percentComplete ?? Math.round((completed.size / Math.max(lesson.lesson_activities.length, 1)) * 100);
  return (
    <main className="lesson-player">
      <header className="lesson-player-header">
        <button onClick={() => router.back()} aria-label="Quay lại">←</button>
        <div><small>BÀI HỌC</small><strong>{lesson.title}</strong></div>
        <span>{activeIndex + 1}/{lesson.lesson_activities.length}</span>
      </header>
      <div className="lesson-progress"><i style={{ width: `${visualPercent}%` }} /></div>
      <section className="activity-stage">
        <nav className="activity-steps" aria-label="Các hoạt động">
          {lesson.lesson_activities.map((item, index) => <button className={index === activeIndex ? "active" : completed.has(item.id) ? "done" : ""} onClick={() => setActiveIndex(index)} key={item.id}><span>{completed.has(item.id) ? "✓" : index + 1}</span>{item.title}</button>)}
        </nav>
        <ActivityRenderer activity={activity} onSubmit={submit} />
      </section>
      {result?.lessonCompleted && <div className="completion-toast"><span>✦</span><div><strong>Hoàn thành bài học</strong><small>Tiến độ và streak đã được cập nhật.</small></div><Link href="/history">Xem lịch sử</Link></div>}
    </main>
  );
}
