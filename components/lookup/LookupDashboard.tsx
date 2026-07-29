"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookmarkCheck, Clock3, History, Languages, RotateCcw, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";

export function LookupDashboard({onLookup,onOpenTranslator}:{onLookup:(word:string)=>void;onOpenTranslator:()=>void}){
  const {user,supabase}=useAuth();const [recent,setRecent]=useState<string[]>(()=>typeof window==="undefined"?[]:JSON.parse(localStorage.getItem("kayeng-recent-words")||"[]"));const [saved,setSaved]=useState<Array<{word:string;phonetic:string|null}>>([]);
  useEffect(()=>{if(!user)return;Promise.all([
    supabase.from("dictionary_search_history").select("query").eq("user_id",user.id).order("created_at",{ascending:false}).limit(8),
    supabase.from("user_vocabulary").select("word,phonetic").eq("user_id",user.id).order("created_at",{ascending:false}).limit(6),
  ]).then(([history,vocabulary])=>{setRecent([...(new Set((history.data||[]).map(item=>item.query)))].slice(0,8));setSaved((vocabulary.data||[]) as Array<{word:string;phonetic:string|null}>)})},[supabase,user]);
  return <section className="lookup-dashboard">
    <article className="lookup-recent"><header><div><Clock3/><span><small>RECENT LOOKUPS</small><h2>Từ vừa tra</h2></span></div><Link href="/history">Xem lịch sử <History/></Link></header>{recent.length?<div>{recent.map(word=><button onClick={()=>onLookup(word)} key={word}><RotateCcw/><b>{word}</b></button>)}</div>:<p>Những từ bạn tra sẽ xuất hiện ở đây để mở lại nhanh.</p>}</article>
    <article className="lookup-saved"><header><div><BookmarkCheck/><span><small>PERSONAL WORDS</small><h2>Sổ từ gần đây</h2></span></div><Link href="/review">Ôn FSRS <Sparkles/></Link></header>{saved.length?<div>{saved.map(item=><button onClick={()=>onLookup(item.word)} key={item.word}><b>{item.word}</b><small>{item.phonetic||"Xem định nghĩa"}</small></button>)}</div>:<p>Đăng nhập và lưu từ để xây bộ flashcard cá nhân.</p>}</article>
    <button className="lookup-translate-launch" onClick={onOpenTranslator}><Languages/><span><small>NEW • TRANSLATOR</small><b>Dịch văn bản, ảnh và tệp</b><em>Anh ↔ Việt • preview trước khi dịch</em></span></button>
  </section>
}
