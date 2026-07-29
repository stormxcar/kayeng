"use client";
import type { ReactNode } from "react";
export function SpeakButton({text,children,className,label}:{text:string;children:ReactNode;className?:string;label?:string}){
  return <button type="button" className={className} aria-label={label} onClick={()=>{speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang="en-US";utterance.rate=.82;speechSynthesis.speak(utterance)}}>{children}</button>;
}
