"use client";

import { useEffect, useState } from "react";

const lessons = [
  { title: "Chào hỏi tự nhiên", detail: "Từ vựng • 4 phút", status: "done", icon: "Aa" },
  { title: "Giới thiệu bản thân", detail: "Nghe & nói • 6 phút", status: "active", icon: "◉" },
  { title: "Hội thoại cùng Maya", detail: "Role-play • 4 phút", status: "next", icon: "✦" },
];

const navItems = [
  ["⌂", "Hôm nay"],
  ["▤", "Học"],
  ["●", "Luyện nói"],
  ["↻", "Ôn tập"],
  ["◒", "Tiến bộ"],
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("Hôm nay");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  function toggleRecording() {
    if (recording) {
      setRecording(false);
      setShowResult(true);
      return;
    }
    setSeconds(0);
    setShowResult(false);
    setRecording(true);
  }

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
            <h2>Chào buổi sáng, Minh <span>👋</span></h2>
          </div>
          <button className="avatar" aria-label="Mở hồ sơ">M</button>
        </header>

        <div className="content">
          <article className="goal-card">
            <div className="goal-head">
              <div>
                <p className="section-kicker">MỤC TIÊU HÔM NAY</p>
                <h3>15 phút luyện tập</h3>
              </div>
              <div className="streak"><span>◆</span> 7 ngày</div>
            </div>
            <div className="progress-line"><span /></div>
            <div className="goal-foot">
              <span>6 phút đã hoàn thành</span>
              <strong>9 phút còn lại</strong>
            </div>
          </article>

          <section className="plan-section">
            <div className="section-title">
              <div>
                <p className="section-kicker">LỘ TRÌNH CÁ NHÂN</p>
                <h3>Bài học hôm nay</h3>
              </div>
              <button onClick={() => setActiveNav("Học")}>Xem tất cả</button>
            </div>
            <div className="lesson-list">
              {lessons.map((lesson, index) => (
                <button className={`lesson ${lesson.status}`} key={lesson.title}>
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
                aria-label={recording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
              >
                {recording ? "■" : "●"}
              </button>
              <span>{recording ? `${seconds}s • Chạm để dừng` : "Chạm để nói"}</span>
            </div>
          </section>

          {showResult && (
            <section className="result-card" aria-live="polite">
              <div className="score-ring"><strong>82</strong><span>/100</span></div>
              <div>
                <p className="section-kicker">PHẢN HỒI TỨC THÌ</p>
                <h3>Khởi đầu rất tốt!</h3>
                <p><mark>Phát âm rõ</mark> và hoàn thành đúng yêu cầu. Hãy luyện lại âm <b>/θ/</b> trong từ “think”.</p>
              </div>
              <button onClick={() => setShowResult(false)}>Luyện lại</button>
            </section>
          )}

          <section className="insight-row">
            <article>
              <span className="insight-icon">↗</span>
              <div><small>TIẾN BỘ TUẦN NÀY</small><strong>+12% độ trôi chảy</strong></div>
            </article>
            <article>
              <span className="insight-icon warm">◎</span>
              <div><small>CẦN ÔN HÔM NAY</small><strong>8 từ • 2 âm</strong></div>
            </article>
          </section>
        </div>

        <nav className="bottom-nav" aria-label="Điều hướng chính">
          {navItems.map(([icon, label]) => (
            <button key={label} className={activeNav === label ? "selected" : ""} onClick={() => setActiveNav(label)}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>
      </section>
    </main>
  );
}
