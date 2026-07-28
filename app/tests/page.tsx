"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Clock3, RotateCcw, Target } from "lucide-react";
import { PageShell } from "@/components/PageShell";

const questions = [
  { type: "multiple_choice", prompt: "Choose the correct sentence.", options: ["She go to work every day.","She goes to work every day.","She going to work every day."], answer: "She goes to work every day.", explanation: "Với she/he/it, động từ Present Simple thêm -s/-es." },
  { type: "fill_blank", prompt: "I ___ English since 2024. (study)", answer: "have studied", explanation: "Dùng Present Perfect với “since” để diễn tả hành động kéo dài đến hiện tại." },
  { type: "multiple_choice", prompt: "Which word means “rất vui vì một điều sắp xảy ra”?", options: ["excited","exhausted","embarrassed"], answer: "excited", explanation: "Excited = hào hứng, phấn khích." },
  { type: "fill_blank", prompt: "If it rains, we ___ at home. (stay)", answer: "will stay", explanation: "First Conditional: If + Present Simple, will + verb." },
];

export default function TestsPage() {
  const [started, setStarted] = useState(false); const [index, setIndex] = useState(0); const [value, setValue] = useState(""); const [checked, setChecked] = useState(false); const [score, setScore] = useState(0);
  const item = questions[index]; const complete = index >= questions.length;
  const correct = useMemo(() => value.trim().toLowerCase() === item?.answer.toLowerCase(), [item, value]);
  function submit() { if (!value || checked) return; setChecked(true); if (correct) setScore((current) => current + 1); }
  function next() { setIndex((current) => current + 1); setValue(""); setChecked(false); }
  function reset() { setStarted(false); setIndex(0); setValue(""); setChecked(false); setScore(0); }
  return <PageShell eyebrow="ASSESSMENT CENTER" title="Kiểm tra năng lực">
    {!started ? <><section className="test-hero"><div><span><Target size={22} /> QUICK TEST</span><h2>Biết chính xác<br />bạn đang ở đâu.</h2><p>Bài kiểm tra thích ứng giúp tìm điểm mạnh, lỗ hổng và đề xuất lộ trình tiếp theo.</p><button onClick={() => setStarted(true)}>Làm bài kiểm tra nhanh <ChevronRight size={18} /></button></div><div className="test-ring"><b>10</b><small>phút</small></div></section><div className="test-options">{[["Kiểm tra đầu vào","A0–C1 · 30–45 phút"],["Theo kỹ năng","Vocabulary, Grammar, Listening"],["Theo chủ đề","Du lịch, công việc, đời sống"],["Ôn lỗi sai","Cá nhân hóa từ lịch sử học"]].map(([title,detail]) => <article key={title}><Clock3 size={22} /><h3>{title}</h3><p>{detail}</p><button>Bắt đầu <ChevronRight size={15} /></button></article>)}</div></> :
    complete ? <section className="test-result"><CheckCircle2 size={55} /><small>KẾT QUẢ</small><h2>{score}/{questions.length}</h2><p>{score >= 3 ? "Bạn đã nắm khá tốt kiến thức nền." : "Kayeng sẽ thêm các nội dung này vào hàng đợi ôn tập."}</p><button onClick={reset}><RotateCcw size={17} /> Làm lại</button></section> :
    <section className="test-player"><header><span>Câu {index + 1}/{questions.length}</span><div><i style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div><b>{score} điểm</b></header><small>{item.type === "multiple_choice" ? "CHỌN ĐÁP ÁN" : "ĐIỀN VÀO CHỖ TRỐNG"}</small><h2>{item.prompt}</h2>{item.options ? <div className="answer-options">{item.options.map((option) => <button className={value === option ? "selected" : ""} onClick={() => !checked && setValue(option)} key={option}>{option}</button>)}</div> : <input className="fill-answer" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Nhập câu trả lời…" disabled={checked} />}{checked && <div className={`answer-feedback ${correct ? "correct" : "wrong"}`}><b>{correct ? "Chính xác!" : `Đáp án: ${item.answer}`}</b><p>{item.explanation}</p></div>}<footer>{checked ? <button onClick={next}>Tiếp tục <ChevronRight size={17} /></button> : <button onClick={submit} disabled={!value}>Kiểm tra</button>}</footer></section>}
  </PageShell>;
}
