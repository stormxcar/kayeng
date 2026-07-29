"use client";
import { useDeferredValue, useEffect, useState } from "react";
import { Bookmark, Search } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
const types=[["all","Tất cả"],["video","Video"],["podcast","Podcast"],["story","Truyện ngắn"],["dialogue","Hội thoại"],["saved","Đã lưu"]] as const;
export function LibraryFilters(){
  const {user,supabase}=useAuth();const [filter,setFilter]=useState("all");const [query,setQuery]=useState("");const deferred=useDeferredValue(query);const [saved,setSaved]=useState<string[]>(()=>typeof window==="undefined"?[]:JSON.parse(localStorage.getItem("kayeng-library-bookmarks")||"[]"));
  useEffect(()=>{if(!user)return;supabase.from("library_bookmarks").select("content_key").eq("user_id",user.id).then(({data})=>{if(data)setSaved(data.map(item=>item.content_key))})},[supabase,user]);
  useEffect(()=>{const needle=deferred.trim().toLocaleLowerCase("vi");let visible=0;document.querySelectorAll<HTMLElement>("[data-library-card]").forEach(card=>{const key=card.dataset.key||"";const show=(filter==="all"||card.dataset.type===filter||(filter==="saved"&&saved.includes(key)))&&(!needle||(card.dataset.search||"").includes(needle));card.hidden=!show;card.classList.toggle("saved",saved.includes(key));if(show)visible++});const empty=document.querySelector<HTMLElement>("[data-library-empty]");if(empty)empty.hidden=visible>0},[deferred,filter,saved]);
  return <div className="library-browser-tools"><div className="library-filters">{types.map(([id,title])=><button className={filter===id?"active":""} onClick={()=>setFilter(id)} key={id}>{id==="saved"&&<Bookmark size={14}/>} {title}</button>)}</div><label><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Tìm nội dung, chủ đề…"/></label></div>;
}
