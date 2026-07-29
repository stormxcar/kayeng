"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRightLeft, Check, Clipboard, FileText, Image as ImageIcon, Languages, RotateCcw, ShieldCheck, Sparkles, Upload, X } from "lucide-react";
import { useTaskOverlay } from "@/components/TaskOverlay";
import { useDialogFocusTrap } from "@/lib/hooks/use-dialog-focus-trap";

type Direction={source:"en"|"vi";target:"en"|"vi"};
type TranslationRecord={source:string;translated:string;direction:string;at:string};
const textTypes=new Set(["text/plain","text/markdown","text/csv"]);
export function Translator({active,onClose}:{active:boolean;onClose:()=>void}){
  const [direction,setDirection]=useState<Direction>({source:"en",target:"vi"});const [text,setText]=useState("");const [translated,setTranslated]=useState("");const [error,setError]=useState("");const [fileName,setFileName]=useState("");const [preview,setPreview]=useState("");const [history,setHistory]=useState<TranslationRecord[]>(()=>typeof window==="undefined"?[]:JSON.parse(localStorage.getItem("kayeng-translation-history")||"[]"));const [copied,setCopied]=useState(false);const input=useRef<HTMLInputElement>(null);const {runTask}=useTaskOverlay();
  const dialog=useRef<HTMLElement>(null);const close=useCallback(()=>onClose(),[onClose]);useDialogFocusTrap(active,dialog,close);
  useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
  function swap(){setDirection(current=>({source:current.target,target:current.source}));setText(translated);setTranslated(text);setError("")}
  async function translate(){
    if(!text.trim())return setError("Hãy nhập hoặc trích xuất nội dung trước khi dịch.");
    if(text.length>3000)return setError("Mỗi lần dịch tối đa 3.000 ký tự.");
    setError("");await runTask("Đang dịch và giữ nguyên cấu trúc câu…",async()=>{const response=await fetch("/api/translate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...direction,text})});const data=await response.json();if(!response.ok){setError(data.error);return}setTranslated(data.translatedText);const record={source:text.slice(0,240),translated:String(data.translatedText).slice(0,240),direction:`${direction.source}-${direction.target}`,at:new Date().toISOString()};const next=[record,...history].slice(0,6);setHistory(next);localStorage.setItem("kayeng-translation-history",JSON.stringify(next))})}
  async function selectFile(file?:File){
    if(!file)return;setError("");setTranslated("");setFileName(file.name);
    if(preview){URL.revokeObjectURL(preview);setPreview("")}
    if(textTypes.has(file.type)||/\.(txt|md|csv)$/i.test(file.name)){
      if(file.size>1024*1024)return setError("Tệp văn bản không được vượt quá 1 MB.");
      const content=await file.text();if(!content.trim())return setError("Tệp không có nội dung chữ.");setText(content.slice(0,3000));if(content.length>3000)setError("Đã lấy 3.000 ký tự đầu tiên để bạn kiểm tra trước khi dịch.");return;
    }
    const allowed=["image/jpeg","image/png","image/webp","application/pdf"];
    if(!allowed.includes(file.type))return setError("Chỉ hỗ trợ TXT, MD, CSV, JPG, PNG, WebP hoặc PDF.");
    if(file.size>1024*1024)return setError("Ảnh/PDF tối đa 1 MB và PDF tối đa 3 trang.");
    if(file.type.startsWith("image/"))setPreview(URL.createObjectURL(file));
    await runTask("Đang đọc chữ trong tệp…",async()=>{const body=new FormData();body.append("file",file);body.append("language",direction.source==="vi"?"vie":"eng");const response=await fetch("/api/translate/extract",{method:"POST",body});const data=await response.json();if(!response.ok){setError(data.error);return}setText(data.text);if(data.truncated)setError("Văn bản dài đã được rút gọn còn 3.000 ký tự.")})}
  async function copy(){await navigator.clipboard.writeText(translated);setCopied(true);window.setTimeout(()=>setCopied(false),1500)}
  if(!active)return null;
  return <section className="translator-workspace" id="translator" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="translator-title">
    <header><div><Languages/><span><small>ENGLISH ↔ VIETNAMESE</small><h2 id="translator-title">Dịch theo ngữ cảnh</h2></span></div><button onClick={onClose} aria-label="Đóng trình dịch"><X/></button></header>
    <div className="translator-language-bar"><button className={direction.source==="en"?"active":""} onClick={()=>setDirection({source:"en",target:"vi"})}>English</button><button onClick={swap} aria-label="Đổi chiều dịch"><ArrowRightLeft/></button><button className={direction.source==="vi"?"active":""} onClick={()=>setDirection({source:"vi",target:"en"})}>Tiếng Việt</button></div>
    <div className="translator-panels"><div><label>{direction.source==="en"?"English":"Tiếng Việt"}<span>{text.length}/3.000</span></label><textarea value={text} maxLength={3000} onChange={event=>setText(event.target.value)} placeholder="Nhập hoặc dán đoạn văn cần dịch…"/><footer><button onClick={()=>{setText("");setTranslated("");setError("");setFileName("")}}><RotateCcw/> Xóa</button><button className="translate-action" onClick={translate}>Dịch nội dung <Sparkles/></button></footer></div><div className="translated-panel"><label>{direction.target==="vi"?"Tiếng Việt":"English"}</label>{translated?<p>{translated}</p>:<span>Bản dịch sẽ xuất hiện ở đây.</span>}<footer><button onClick={copy} disabled={!translated}>{copied?<Check/>:<Clipboard/>} {copied?"Đã sao chép":"Sao chép"}</button></footer></div></div>
    <div className="translation-upload"><input ref={input} type="file" hidden accept=".txt,.md,.csv,.jpg,.jpeg,.png,.webp,.pdf" onChange={event=>selectFile(event.target.files?.[0])}/><button onClick={()=>input.current?.click()}><Upload/><span><b>Chọn tệp hoặc ảnh</b><small>TXT, MD, CSV ≤ 1 MB • JPG, PNG, WebP, PDF ≤ 1 MB</small></span></button>{fileName&&<div className="uploaded-file">{preview?<Image src={preview} alt="Ảnh chờ nhận diện" width={96} height={72} sizes="96px" unoptimized/>:<FileText/>}<span><b>{fileName}</b><small>Hãy kiểm tra phần chữ đã trích xuất trước khi dịch.</small></span></div>}<aside><ShieldCheck/><p><b>Quy định upload</b>Không dùng tài liệu chứa mật khẩu, dữ liệu y tế, tài chính hoặc thông tin cá nhân nhạy cảm. File chỉ được xử lý để trích chữ, không lưu vào Supabase Storage.</p></aside></div>
    {error&&<p className="translator-error" role="alert">{error}</p>}
    {history.length>0&&<div className="translation-history"><header><small>LỊCH SỬ DỊCH TRÊN THIẾT BỊ</small><button onClick={()=>{setHistory([]);localStorage.removeItem("kayeng-translation-history")}}>Xóa lịch sử</button></header><div>{history.map((item,index)=><button onClick={()=>{setText(item.source);setTranslated(item.translated);setDirection(item.direction==="vi-en"?{source:"vi",target:"en"}:{source:"en",target:"vi"})}} key={`${item.at}-${index}`}><small>{item.direction.toUpperCase()}</small><b>{item.source}</b><span>{item.translated}</span></button>)}</div></div>}
    <p className="translation-note"><ImageIcon/> Bản dịch máy có thể chưa chính xác với thành ngữ hoặc tài liệu chuyên môn. Luôn đọc lại trước khi sử dụng chính thức.</p>
  </section>
}
