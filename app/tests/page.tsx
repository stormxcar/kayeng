"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronRight, Clock3, RotateCcw, Target } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/lib/hooks/use-auth";

const questions = [
  { type: "multiple_choice", prompt: "Choose the correct sentence.", options: ["She go to work every day.","She goes to work every day.","She going to work every day."], answer: "She goes to work every day.", explanation: "Với she/he/it, động từ Present Simple thêm -s/-es." },
  { type: "fill_blank", prompt: "I ___ English since 2024. (study)", answer: "have studied", explanation: "Dùng Present Perfect với “since” để diễn tả hành động kéo dài đến hiện tại." },
  { type: "multiple_choice", prompt: "Which word means “rất vui vì một điều sắp xảy ra”?", options: ["excited","exhausted","embarrassed"], answer: "excited", explanation: "Excited = hào hứng, phấn khích." },
  { type: "fill_blank", prompt: "If it rains, we ___ at home. (stay)", answer: "will stay", explanation: "First Conditional: If + Present Simple, will + verb." },
];
const modes = [
  ["Kiểm tra đầu vào","A0–C1 · đánh giá kiến thức tổng hợp","45 phút"],
  ["Theo kỹ năng","Vocabulary, Grammar, Listening","20 phút"],
  ["Theo chủ đề","Du lịch, công việc, đời sống","15 phút"],
  ["Ôn lỗi sai","Cá nhân hóa từ lịch sử học","10 phút"],
];

export default function TestsPage() {
  const {user,supabase}=useAuth();
  const [started, setStarted] = useState(false); const [mode, setMode] = useState("Kiểm tra nhanh"); const [index, setIndex] = useState(0); const [value, setValue] = useState(""); const [checked, setChecked] = useState(false); const [score, setScore] = useState(0);
  const [placement,setPlacement]=useState<{recommendedLevel:string;courseSlug?:string|null}|null>(null);const saved=useRef(false);
  const item = questions[index]; const complete = index >= questions.length;
  const correct = useMemo(() => value.trim().toLowerCase() === item?.answer.toLowerCase(), [item, value]);
  function start(title: string) { setMode(title); setStarted(true); setIndex(0); setValue(""); setChecked(false); setScore(0); }
  function submit() { if (!value || checked) return; setChecked(true); if (correct) setScore((current) => current + 1); }
  function next() { setIndex((current) => current + 1); setValue(""); setChecked(false); }
  function reset() { setStarted(false); setIndex(0); setValue(""); setChecked(false); setScore(0); }
  useEffect(()=>{if(!complete||!user||saved.current)return;saved.current=true;const percentage=Math.round(score/questions.length*100);supabase.rpc("submit_placement_result",{p_score:percentage,p_assessment_type:mode,p_skill_scores:{grammar:percentage,vocabulary:percentage},p_answers:[]}).then(({data})=>setPlacement(data as {recommendedLevel:string;courseSlug?:string|null}))},[complete,mode,score,supabase,user]);
  return <PageShell eyebrow="ASSESSMENT CENTER" title="Kiểm tra năng lực">
    {!started ? <><section className="test-hero"><div><span><Target size={22} /> QUICK TEST</span><h2>Biết chính xác<br />bạn đang ở đâu.</h2><p>Bài kiểm tra thích ứng giúp tìm điểm mạnh, lỗ hổng và đề xuất lộ trình tiếp theo.</p><button onClick={() => start("Kiểm tra nhanh")}>Làm bài kiểm tra nhanh <ChevronRight size={18} /></button></div><div className="test-ring"><b>10</b><small>phút</small></div></section><div className="test-options">{modes.map(([title,detail,time]) => <article key={title}><Clock3 size={22} /><small>{time}</small><h3>{title}</h3><p>{detail}</p><button onClick={() => start(title)}>Bắt đầu <ChevronRight size={15} /></button></article>)}</div></> :
    complete ? <section className="test-result"><CheckCircle2 size={55} /><small>{mode.toUpperCase()} • KẾT QUẢ</small><h2>{score}/{questions.length}</h2><p>{score >= 3 ? "Bạn đã nắm khá tốt kiến thức nền." : "Kayeng sẽ thêm các nội dung này vào hàng đợi ôn tập."}</p>{placement&&<div className="placement-recommendation"><small>TRÌNH ĐỘ ĐỀ XUẤT</small><b>{placement.recommendedLevel}</b><p>Kết quả đã cập nhật vào hồ sơ để cá nhân hóa daily plan.</p>{placement.courseSlug&&<Link href={`/learn/${placement.courseSlug}`}>Mở lộ trình phù hợp <ChevronRight/></Link>}</div>}{!user&&<p>Đăng nhập để lưu trình độ và nhận lộ trình thích ứng.</p>}<button onClick={()=>{saved.current=false;setPlacement(null);reset()}}><RotateCcw size={17} /> Chọn bài khác</button></section> :
    <section className="test-player"><header><span>Câu {index + 1}/{questions.length}</span><div><i style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div><b>{score} điểm</b></header><small>{mode.toUpperCase()} • {item.type === "multiple_choice" ? "CHỌN ĐÁP ÁN" : "ĐIỀN VÀO CHỖ TRỐNG"}</small><h2>{item.prompt}</h2>{item.options ? <div className="answer-options">{item.options.map((option) => <button className={value === option ? "selected" : ""} onClick={() => !checked && setValue(option)} key={option}>{option}</button>)}</div> : <input className="fill-answer" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Nhập câu trả lời…" disabled={checked} />}{checked && <div className={`answer-feedback ${correct ? "correct" : "wrong"}`}><div><b>{correct ? "Chính xác!" : `Đáp án: ${item.answer}`}</b><p>{item.explanation}</p></div></div>}<footer>{checked ? <button onClick={next}>Tiếp tục <ChevronRight size={17} /></button> : <button onClick={submit} disabled={!value}>Kiểm tra</button>}</footer></section>}
  </PageShell>;
}
