"use client";

import { useMemo, useState } from "react";
import { ArrowRight, BookOpenCheck, CheckCircle2, Search, Sparkles, X } from "lucide-react";
import { PageShell } from "@/components/PageShell";

const grammar = [
  ["A1","Present Simple","Thói quen và sự thật","I work in technology."],["A1","Present Continuous","Hành động đang diễn ra","She is learning English."],
  ["A1","Articles: a, an, the","Xác định danh từ","I saw a movie. The movie was great."],["A2","Past Simple","Sự việc đã kết thúc","We visited London last year."],
  ["A2","Comparatives","So sánh người và vật","This lesson is easier than the last one."],["A2","Modal verbs","Khả năng, lời khuyên, nghĩa vụ","You should practise every day."],
  ["B1","Present Perfect","Kinh nghiệm và kết quả","I have studied English for two years."],["B1","Conditionals","Điều kiện và kết quả","If I practise, I will improve."],
  ["B1","Passive Voice","Nhấn mạnh hành động","English is spoken worldwide."],["B2","Reported Speech","Thuật lại lời nói","She said that she was busy."],
  ["B2","Relative Clauses","Bổ nghĩa danh từ","The app that I use is helpful."],["C1","Inversion","Nhấn mạnh trong văn phong","Never have I seen such progress."],
];

export default function GrammarPage() {
  const [query, setQuery] = useState(""); const [level, setLevel] = useState("Tất cả");
  const [selected, setSelected] = useState<(typeof grammar)[number] | null>(null);
  const filtered = useMemo(() => grammar.filter((item) => (level === "Tất cả" || item[0] === level) && item.join(" ").toLowerCase().includes(query.toLowerCase())), [query, level]);
  return <PageShell eyebrow="GRAMMAR LIBRARY" title="Ngữ pháp dễ hiểu">
    <section className="knowledge-intro"><div><span><Sparkles size={17} /> HỌC THEO NGỮ CẢNH</span><h2>Không chỉ nhớ công thức.<br />Hãy hiểu cách dùng.</h2></div><p>Mỗi chủ điểm gồm giải thích tiếng Việt, cấu trúc, ví dụ, lỗi thường gặp và bài luyện.</p></section>
    <div className="knowledge-toolbar"><label><Search size={18} /><input placeholder="Tìm chủ điểm ngữ pháp…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div>{["Tất cả","A1","A2","B1","B2","C1"].map((item) => <button className={level === item ? "active" : ""} onClick={() => setLevel(item)} key={item}>{item}</button>)}</div></div>
    <div className="grammar-grid">{filtered.map((item) => {const [cefr,title,description,example]=item; return <article key={title}><span>{cefr}</span><BookOpenCheck size={25} /><h3>{title}</h3><p>{description}</p><blockquote>{example}</blockquote><button onClick={()=>setSelected(item)}>Học chủ điểm <ArrowRight size={16} /></button></article>})}</div>
    {selected && <div className="grammar-detail-backdrop" onClick={()=>setSelected(null)}><section className="grammar-detail" role="dialog" aria-modal="true" aria-labelledby="grammar-title" onClick={(event)=>event.stopPropagation()}><button className="grammar-close" onClick={()=>setSelected(null)} aria-label="Đóng"><X/></button><small>{selected[0]} • GRAMMAR NOTE</small><h2 id="grammar-title">{selected[1]}</h2><p>{selected[2]}</p><div className="grammar-formula"><b>Cách dùng nhanh</b><span>Subject + verb + complement</span></div><blockquote>{selected[3]}</blockquote><ul><li><CheckCircle2/> Đọc ví dụ thành tiếng 3 lần.</li><li><CheckCircle2/> Thay chủ ngữ và động từ bằng thông tin của bạn.</li><li><CheckCircle2/> Viết một câu mới để ghi nhớ theo ngữ cảnh.</li></ul><button className="lesson-primary" onClick={()=>setSelected(null)}>Đã hiểu, tiếp tục học</button></section></div>}
  </PageShell>;
}
