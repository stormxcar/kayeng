"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
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
  const { id: routeId } = useParams<{ id?: string }>();
  const id = useSearchParams().get("id") || routeId;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [retryVersion, setRetryVersion] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ percentComplete: number; lessonCompleted: boolean } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function loadLesson() {
      const { data } = await supabase
      .from("lessons")
      .select("id,title,description,estimated_minutes,lesson_activities(id,activity_type,title,instructions,content)")
      .eq("id", id || "")
      .order("sort_order", { referencedTable: "lesson_activities" })
      .single();
      const loaded = data as Lesson | null;
      setLesson(loaded);
      if (user && loaded?.lesson_activities.length) {
        const { data: activityData } = await supabase.from("activity_progress").select("activity_id").eq("user_id", user.id).eq("status", "completed").in("activity_id", loaded.lesson_activities.map((activity) => activity.id));
        const completedIds = new Set((activityData || []).map((item) => item.activity_id));
        setCompleted(completedIds);
        const resumeIndex = loaded.lesson_activities.findIndex((activity) => !completedIds.has(activity.id));
        setActiveIndex(resumeIndex < 0 ? Math.max(0, loaded.lesson_activities.length - 1) : resumeIndex);
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
    if (correct) setCompleted((current) => new Set(current).add(activity.id));
    setResult(data as { percentComplete: number; lessonCompleted: boolean });
    if (correct && activeIndex < lesson.lesson_activities.length - 1) setActiveIndex((index) => index + 1);
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
      <p className="sr-only" role="status" aria-live="polite">Tiến độ bài học {visualPercent} phần trăm. Hoạt động {activeIndex + 1} trên {lesson.lesson_activities.length}.</p>
      <section className="activity-stage">
        <nav className="activity-steps" aria-label="Các hoạt động">
          {lesson.lesson_activities.map((item, index) => <button className={index === activeIndex ? "active" : completed.has(item.id) ? "done" : ""} onClick={() => setActiveIndex(index)} key={item.id}><span>{completed.has(item.id) ? "✓" : index + 1}</span>{item.title}</button>)}
        </nav>
        <div>
          <ActivityRenderer key={`${activity.id}-${retryVersion}`} activity={activity} onSubmit={submit} />
          <nav className="lesson-activity-navigation" aria-label="Chuyển hoạt động">
            <button disabled={activeIndex === 0} onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}><ArrowLeft/> Hoạt động trước</button>
            {completed.has(activity.id) && <button onClick={() => setRetryVersion((version) => version + 1)}><RotateCcw/> Làm lại hoạt động</button>}
            <button disabled={activeIndex === lesson.lesson_activities.length - 1} onClick={() => setActiveIndex((index) => Math.min(lesson.lesson_activities.length - 1, index + 1))}>Hoạt động sau <ArrowRight/></button>
          </nav>
        </div>
      </section>
      {result?.lessonCompleted && <section className="lesson-final-summary" role="status"><CheckCircle2/><small>LESSON COMPLETE</small><h2>Bạn đã hoàn thành {lesson.title}</h2><p>{completed.size}/{lesson.lesson_activities.length} hoạt động • {result.percentComplete}% tiến độ yêu cầu. Daily plan và streak đã được cập nhật.</p><div><Link href="/mistakes">Ôn lại lỗi sai</Link><Link href="/history">Xem lịch sử</Link><Link href="/learn">Chọn bài tiếp theo</Link></div></section>}
    </main>
  );
}
