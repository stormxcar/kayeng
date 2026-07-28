"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BookOpen, Bookmark, Headphones, MessageSquareText, Play, Video } from "lucide-react";
import { PageShell } from "@/components/PageShell";

const items = [["video","Video ngắn","Học qua tình huống và phụ đề tương tác",Video],["podcast","Podcast","Luyện nghe theo cấp độ và tốc độ",Headphones],["story","Truyện ngắn","Đọc hiểu, tra từ ngay trong bài",BookOpen],["dialogue","Hội thoại","Mẫu câu tự nhiên theo ngữ cảnh",MessageSquareText],["saved","Danh sách đã lưu","Nội dung bạn muốn xem lại",Bookmark]] as const;
export default function LibraryPage(){
  const [filter,setFilter]=useState("all");
  return <PageShell eyebrow="MEDIA LIBRARY" title="Thư viện học liệu">
    <div className="library-filters"><button className={filter==="all"?"active":""} onClick={()=>setFilter("all")}>Tất cả</button>{items.map(([id,title])=><button className={filter===id?"active":""} onClick={()=>setFilter(id)} key={id}>{title}</button>)}</div>
    <section className="library-feature"><div><span>FEATURED • A2</span><h2>A classroom conversation</h2><p>Nghe hội thoại, bật phụ đề, tra từ và hoàn thành 5 câu hỏi.</p><Link className="library-start" href="/practice"><Play size={18} fill="currentColor"/> Bắt đầu nghe</Link></div></section>
    <div className="library-photo-story"><Image src="/student-study-unsplash.webp" alt="Người học đeo tai nghe và ghi chú bên máy tính" width={1200} height={800}/><div><small>STUDY STORY • A1</small><h2>Build a study routine that lasts</h2><p>Một bài đọc ngắn kết hợp từ vựng về thói quen, thời gian và mục tiêu học tập.</p><Link className="library-story-link" href="/learn">Đọc câu chuyện</Link></div></div>
    <div className="library-grid">{items.filter(([id])=>filter==="all"||filter===id).map(([id,title,description,Icon])=><article key={id}><Icon size={27}/><small>{id.toUpperCase()}</small><h3>{title}</h3><p>{description}</p><Link href={id==="saved"?"/review":id==="dialogue"?"/practice":"/learn"}>Khám phá</Link></article>)}</div>
    <p className="media-attribution">Ảnh: Julio Lopez/Unsplash và RDNE Stock project/Pexels.</p>
  </PageShell>;
}
