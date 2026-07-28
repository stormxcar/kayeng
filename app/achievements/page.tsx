"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, BookOpenCheck, Flame, Infinity, Medal, Mic2, Sparkles, Star, Trophy } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/lib/hooks/use-auth";

const levels = [
  { name: "Khởi hành", min: 0 }, { name: "Người học đều", min: 500 }, { name: "Người khám phá", min: 1500 },
  { name: "Người giao tiếp", min: 3500 }, { name: "Đại sứ Kayeng", min: 7000 },
];

export default function AchievementsPage(){
  const { user, supabase } = useAuth();
  const [stats,setStats]=useState({lessons:0,recordings:0,words:0,streak:0});
  useEffect(()=>{if(!user)return;Promise.all([
    supabase.from("lesson_progress").select("*",{count:"exact",head:true}).eq("user_id",user.id).eq("status","completed"),
    supabase.from("audio_recordings").select("*",{count:"exact",head:true}).eq("user_id",user.id),
    supabase.from("user_vocabulary").select("*",{count:"exact",head:true}).eq("user_id",user.id),
    supabase.from("streaks").select("current_streak").eq("user_id",user.id).maybeSingle(),
  ]).then(([lessons,recordings,words,streak])=>setStats({lessons:lessons.count||0,recordings:recordings.count||0,words:words.count||0,streak:streak.data?.current_streak||0}))},[supabase,user]);
  const xp=stats.lessons*100+stats.recordings*30+stats.words*10+stats.streak*20;
  const current=useMemo(()=>[...levels].reverse().find(level=>xp>=level.min)||levels[0],[xp]);
  const next=levels[levels.indexOf(current)+1];
  const progress=next?Math.min(100,((xp-current.min)/(next.min-current.min))*100):100;
  const badges=[
    {Icon:Flame,title:"Khởi động",description:"Học liên tiếp 3 ngày",done:stats.streak>=3,progress:`${Math.min(stats.streak,3)}/3 ngày`},
    {Icon:Star,title:"Người khám phá",description:"Hoàn thành 5 bài học",done:stats.lessons>=5,progress:`${Math.min(stats.lessons,5)}/5 bài`},
    {Icon:Mic2,title:"Giọng nói đầu tiên",description:"Hoàn thành 3 bản ghi âm",done:stats.recordings>=3,progress:`${Math.min(stats.recordings,3)}/3 bản ghi`},
    {Icon:Award,title:"Kho từ cá nhân",description:"Lưu 30 từ để ôn FSRS",done:stats.words>=30,progress:`${Math.min(stats.words,30)}/30 từ`},
  ];
  return <PageShell eyebrow="YOUR JOURNEY" title="Thành tích">
    <section className="achievement-hero"><Trophy size={52}/><div><small>CẤP HIỆN TẠI • {current.name.toUpperCase()}</small><h2>{xp.toLocaleString("vi-VN")} XP</h2><p>{next?`Còn ${next.min-xp} XP để đạt “${next.name}”.`:"Bạn đã đạt cấp cao nhất — hãy tiếp tục lan tỏa thói quen học."}</p><div className="xp-progress"><i style={{width:`${progress}%`}}/></div></div></section>
    <section className="free-learning-note"><Infinity size={32}/><div><small>FREE KNOWLEDGE, ALWAYS</small><h2>XP ghi nhận nỗ lực, không khóa kiến thức.</h2><p>Mọi bài học, bảng IPA, ngữ pháp, từ điển và bài luyện đều mở miễn phí. Cấp độ chỉ làm đẹp hồ sơ, trao huy hiệu và giúp bạn nhìn thấy hành trình tiến bộ.</p></div></section>
    <div className="xp-rules"><article><BookOpenCheck/><b>+100 XP</b><span>Mỗi bài học hoàn thành</span></article><article><Mic2/><b>+30 XP</b><span>Mỗi bài nói đã lưu</span></article><article><Sparkles/><b>+10 XP</b><span>Mỗi từ trong sổ cá nhân</span></article><article><Flame/><b>+20 XP</b><span>Mỗi ngày streak hiện tại</span></article></div>
    <div className="badge-grid">{badges.map(({Icon,title,description,done,progress:badgeProgress})=><article className={done?"":"locked"} key={title}><span>{done?<Medal size={28}/>:<Icon size={28}/>}</span><small>{done?"ĐÃ ĐẠT":badgeProgress}</small><h3>{title}</h3><p>{description}</p></article>)}</div>
  </PageShell>
}
