"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { startWavRecording, type WavRecorder } from "@/lib/audio/wav-recorder";
import { createClient } from "@/lib/supabase/client";
import { CustomSelect, occupationOptions } from "@/components/CustomSelect";

const lessons = [
  { title: "Chào hỏi tự nhiên", detail: "Từ vựng • 4 phút", status: "done", icon: "Aa" },
  { title: "Giới thiệu bản thân", detail: "Nghe & nói • 6 phút", status: "active", icon: "◉" },
  { title: "Hội thoại cùng Maya", detail: "Role-play • 4 phút", status: "next", icon: "✦" },
];

export default function Home() {
  const supabaseRef = useRef(createClient());
  const recorderRef = useRef<WavRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ score?: number; message: string; transcript?: string }>({
    message: "",
  });
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [dbLessons, setDbLessons] = useState<Array<{ id: string; title: string; estimated_minutes: number }>>([]);
  const [learningStats, setLearningStats] = useState({ completedMinutes: 0, targetMinutes: 15, streak: 0, completedLessons: 0, recordings: 0 });

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => {
    const supabase = supabaseRef.current;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("kayeng-theme");
    const preferred =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setTheme(preferred);
    document.documentElement.dataset.theme = preferred;
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("kayeng-theme", next);
  }

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    const supabase = supabaseRef.current;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      setProfile(data);
      if (data?.daily_goal_minutes) setLearningStats((stats) => ({ ...stats, targetMinutes: data.daily_goal_minutes }));
    });
    supabase
      .from("lessons")
      .select("id,title,estimated_minutes")
      .eq("status", "published")
      .order("sort_order")
      .then(({ data }) => setDbLessons(data || []));
    Promise.all([
      supabase.from("daily_plans").select("completed_minutes,target_minutes").eq("user_id", user.id).eq("plan_date", new Date().toISOString().slice(0, 10)).maybeSingle(),
      supabase.from("streaks").select("current_streak").eq("user_id", user.id).single(),
      supabase.from("lesson_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed"),
      supabase.from("audio_recordings").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    ]).then(([daily, streak, lessonsResult, recordingsResult]) => setLearningStats((stats) => ({
      ...stats,
      completedMinutes: daily.data?.completed_minutes || 0,
      targetMinutes: daily.data?.target_minutes || stats.targetMinutes,
      streak: streak.data?.current_streak || 0,
      completedLessons: lessonsResult.count || 0,
      recordings: recordingsResult.count || 0,
    })));
  }, [user]);

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setAuthError("");
    const supabase = supabaseRef.current;
    const action =
      authMode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password, options: { data: { display_name: email.split("@")[0] } } });
    const { data, error } = await action;
    setBusy(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    if (authMode === "signup" && !data.session) {
      setAuthError("Hãy kiểm tra email để xác nhận tài khoản.");
      return;
    }
    setAuthOpen(false);
  }

  async function saveOnboarding(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const { data } = await supabaseRef.current
      .from("profiles")
      .update({
        display_name: form.get("displayName"),
        learning_goal: form.get("learningGoal"),
        occupation: form.get("occupation"),
        daily_goal_minutes: Number(form.get("dailyMinutes")),
        cefr_level: form.get("level"),
        onboarding_completed: true,
      })
      .eq("id", user.id)
      .select()
      .single();
    setProfile(data);
    setBusy(false);
  }

  function openLesson(lessonId?: string) {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (!lessonId) return;
    window.location.assign(`/lesson/${lessonId}`);
  }

  async function toggleRecording() {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (recording) {
      setRecording(false);
      const recordingData = await recorderRef.current?.stop();
      recorderRef.current = null;
      if (!recordingData || recordingData.durationMs < 1200) {
        setResult({ message: "Bản ghi quá ngắn. Hãy nói ít nhất 2 giây." });
        setShowResult(true);
        return;
      }
      setBusy(true);
      setResult({ message: "" });
      setShowResult(true);
      try {
        const { data: sessionData } = await supabaseRef.current.auth.getSession();
        const token = sessionData.session?.access_token;
        const signedResponse = await fetch("/api/recordings/signed-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            durationMs: recordingData.durationMs,
            referenceText: "My name is Minh. I work as a designer. In my free time, I enjoy reading.",
          }),
        });
        const signed = await signedResponse.json();
        if (!signedResponse.ok) throw new Error(signed.error);
        const { error: uploadError } = await supabaseRef.current.storage
          .from("speaking-recordings")
          .uploadToSignedUrl(signed.path, signed.token, recordingData.blob, {
            contentType: "audio/wav",
          });
        if (uploadError) throw uploadError;
        await supabaseRef.current
          .from("audio_recordings")
          .update({ status: "uploaded" })
          .eq("id", signed.recordingId);
        const assessmentResponse = await fetch("/api/assessments/pronunciation", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ recordingId: signed.recordingId }),
        });
        const assessment = await assessmentResponse.json();
        if (!assessmentResponse.ok) {
          if (assessment.code === "AZURE_NOT_CONFIGURED") {
            setResult({ message: "Đã lưu bản ghi an toàn. Thêm khóa Azure Speech để nhận điểm phát âm." });
          } else {
            throw new Error(assessment.error);
          }
        } else {
          setResult({
            score: Math.round(assessment.scores?.PronScore || 0),
            transcript: assessment.transcript,
            message: "Đã phân tích phát âm và lưu kết quả vào hồ sơ.",
          });
        }
      } catch (error) {
        setResult({ message: error instanceof Error ? error.message : "Không thể xử lý bản ghi âm." });
      } finally {
        setBusy(false);
      }
      return;
    }
    try {
      recorderRef.current = await startWavRecording();
      setSeconds(0);
      setShowResult(false);
      setRecording(true);
    } catch {
      setResult({ message: "Không thể truy cập microphone. Hãy kiểm tra quyền trình duyệt." });
      setShowResult(true);
    }
  }

  const displayName = (profile?.display_name as string) || user?.email?.split("@")[0] || "Minh";

  return (
    <main>
      <section className="desktop-rail" aria-label="Thương hiệu">
        <div className="brand-mark">K</div>
        <div className="rail-copy">
          <p className="eyebrow">KAYENG ENGLISH</p>
          <h1>Nói thật.<br />Tiến bộ thật.</h1>
          <p>15 phút mỗi ngày để biến tiếng Anh thành phản xạ tự nhiên.</p>
        </div>
        <div className="rail-quote">
          <span>“</span>
          Hôm nay bạn không cần nói hoàn hảo. Bạn chỉ cần bắt đầu.
        </div>
      </section>

      <section className="app-shell">
        <header className="topbar">
          <div>
            <p className="date-label">THỨ BA, 28 THÁNG 7</p>
            <h2>Chào buổi sáng, {displayName} <span>👋</span></h2>
          </div>
          <div className="top-actions">
            <button className="theme-toggle" aria-label={`Chuyển sang giao diện ${theme === "light" ? "tối" : "sáng"}`} onClick={toggleTheme}>
              {theme === "light" ? "◐" : "☀"}
            </button>
            <button
              className="avatar"
              data-tour="profile"
              data-tooltip="Hồ sơ cá nhân"
              aria-label={user ? "Đăng xuất" : "Đăng nhập"}
              onClick={() => (user ? supabaseRef.current.auth.signOut() : setAuthOpen(true))}
            >
              {displayName.slice(0, 1).toUpperCase()}
            </button>
          </div>
        </header>

        <div className="content">
          <article className="goal-card" data-tour="daily-plan">
            <div className="goal-head">
              <div>
                <p className="section-kicker">MỤC TIÊU HÔM NAY</p>
                <h3>15 phút luyện tập</h3>
              </div>
              <div className="streak"><span>◆</span> {learningStats.streak} ngày</div>
            </div>
            <div className="progress-line"><span style={{ width: `${Math.min(100, Math.round((learningStats.completedMinutes / Math.max(learningStats.targetMinutes, 1)) * 100))}%` }} /></div>
            <div className="goal-foot">
              <span>{learningStats.completedMinutes} phút đã hoàn thành</span>
              <strong>{Math.max(0, learningStats.targetMinutes - learningStats.completedMinutes)} phút còn lại</strong>
            </div>
          </article>

          <section className="plan-section">
            <div className="section-title">
              <div>
                <p className="section-kicker">LỘ TRÌNH CÁ NHÂN</p>
                <h3>Bài học hôm nay</h3>
              </div>
              <Link href="/learn">Xem tất cả</Link>
            </div>
            <div className="lesson-list" data-tour="continue-learning">
              {(dbLessons.length
                ? dbLessons.slice(0, 3).map((lesson, index) => ({
                    id: lesson.id,
                    title: lesson.title,
                    detail: `Bài học • ${lesson.estimated_minutes} phút`,
                    minutes: lesson.estimated_minutes,
                    status: index === 0 ? "active" : "next",
                    icon: index === 0 ? "◉" : "✦",
                  }))
                : lessons.map((lesson) => ({ ...lesson, id: undefined, minutes: 15 }))
              ).map((lesson, index) => (
                <button
                  className={`lesson ${lesson.status}`}
                  key={lesson.title}
                  onClick={() => openLesson(lesson.id)}
                  disabled={busy}
                >
                  <span className="lesson-index">{lesson.status === "done" ? "✓" : lesson.icon}</span>
                  <span className="lesson-copy">
                    <strong>{lesson.title}</strong>
                    <small>{lesson.detail}</small>
                  </span>
                  {lesson.status === "active" && <span className="continue">Tiếp tục <b>→</b></span>}
                  {lesson.status === "next" && <span className="lock">03</span>}
                  {index === 0 && <span className="complete-label">HOÀN THÀNH</span>}
                </button>
              ))}
            </div>
          </section>

          <section className="speaking-card">
            <div className="speaking-copy">
              <p className="section-kicker">LUYỆN NÓI NHANH</p>
              <h3>“Tell me about yourself.”</h3>
              <p>Hãy giới thiệu tên, công việc và một sở thích của bạn.</p>
              <div className="phrase"><span>Gợi ý</span> My name is... I work as... In my free time...</div>
            </div>
            <div className="recorder">
              <button
                className={recording ? "mic recording" : "mic"}
                onClick={toggleRecording}
                disabled={busy}
                aria-label={recording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
              >
                {recording ? "■" : "●"}
              </button>
              <span>{recording ? `${seconds}s • Chạm để dừng` : "Chạm để nói"}</span>
            </div>
          </section>

          {showResult && (
            <section className="result-card" aria-live="polite">
              <div className="score-ring"><strong>{result.score ?? "✓"}</strong><span>{result.score !== undefined ? "/100" : "ĐÃ LƯU"}</span></div>
              {busy ? (
                <div className="assessment-skeleton" aria-busy="true" aria-label="Đang phân tích bản ghi">
                  <div className="skeleton skeleton-line short" />
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line" />
                </div>
              ) : (
                <div>
                  <p className="section-kicker">PHẢN HỒI TỨC THÌ</p>
                  <h3>Kết quả luyện nói</h3>
                  <p>{result.message}</p>
                  {result.transcript && <p><mark>Transcript</mark> {result.transcript}</p>}
                </div>
              )}
              <button onClick={() => setShowResult(false)}>Luyện lại</button>
            </section>
          )}

          <section className="insight-row">
            <article>
              <span className="insight-icon">↗</span>
              <div><small>BÀI ĐÃ HOÀN THÀNH</small><strong>{learningStats.completedLessons} bài học</strong></div>
            </article>
            <article>
              <span className="insight-icon warm">◎</span>
              <div><small>LỊCH SỬ LUYỆN NÓI</small><strong>{learningStats.recordings} bản ghi</strong></div>
            </article>
          </section>
        </div>

        <AppNav />

        {authOpen && (
          <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Đăng nhập Kayeng">
            <form className="auth-card" onSubmit={submitAuth}>
              <button type="button" className="modal-close" onClick={() => setAuthOpen(false)}>×</button>
              <p className="section-kicker">KAYENG ENGLISH</p>
              <h3>{authMode === "login" ? "Chào mừng bạn trở lại" : "Tạo tài khoản học"}</h3>
              <p>Lưu tiến độ, streak và kết quả luyện nói trên mọi thiết bị.</p>
              <label>Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <label>Mật khẩu<input type="password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              {authError && <div className="form-message">{authError}</div>}
              <button className="primary-action" disabled={busy} aria-label={authMode === "login" ? "Đăng nhập" : "Đăng ký"}>
                {busy ? <span className="spinner" aria-hidden="true" /> : authMode === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
              <button type="button" className="text-action" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
                {authMode === "login" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
              </button>
            </form>
          </div>
        )}

        {user && profile && profile.onboarding_completed === false && (
          <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Thiết lập lộ trình">
            <form className="auth-card onboarding-card" onSubmit={saveOnboarding}>
              <p className="section-kicker">LỘ TRÌNH CÁ NHÂN</p>
              <h3>Bắt đầu đúng với mục tiêu của bạn</h3>
              <div className="form-grid">
                <label>Tên hiển thị<input name="displayName" defaultValue={displayName} required /></label>
                <label>Nghề nghiệp<CustomSelect name="occupation" options={occupationOptions} placeholder="Chọn lĩnh vực của bạn" /></label>
                <label>Trình độ<select name="level" defaultValue="A1"><option>A0</option><option>A1</option><option>A2</option><option>B1</option><option>B2</option></select></label>
                <label>Phút học mỗi ngày<select name="dailyMinutes" defaultValue="15"><option value="10">10 phút</option><option value="15">15 phút</option><option value="20">20 phút</option><option value="30">30 phút</option></select></label>
              </div>
              <label>Mục tiêu<textarea name="learningGoal" placeholder="Tự tin giao tiếp trong công việc..." required /></label>
              <button className="primary-action" disabled={busy} aria-label="Tạo lộ trình">
                {busy ? <span className="spinner" aria-hidden="true" /> : "Tạo lộ trình"}
              </button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}
