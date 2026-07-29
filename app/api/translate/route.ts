import { NextResponse } from "next/server";

const encoder = new TextEncoder();
function splitText(text:string){
  const pieces=text.replace(/\r\n/g,"\n").split(/(?<=[.!?])\s+|\n+/).filter(Boolean);
  const chunks:string[]=[];
  for(const piece of pieces){
    let current="";
    for(const char of piece){
      if(encoder.encode(current+char).length>450){chunks.push(current);current=char}else current+=char;
    }
    if(current)chunks.push(current);
  }
  return chunks;
}
export async function POST(request:Request){
  try{
    const body=await request.json() as {text?:string;source?:string;target?:string};
    const text=String(body.text||"").trim();const source=String(body.source||"en");const target=String(body.target||"vi");
    if(!text||text.length>3000)return NextResponse.json({error:"Nội dung phải có từ 1 đến 3.000 ký tự."},{status:400});
    if(!["en","vi"].includes(source)||!["en","vi"].includes(target)||source===target)return NextResponse.json({error:"Cặp ngôn ngữ không hợp lệ."},{status:400});
    const chunks=splitText(text);
    if(chunks.length>24)return NextResponse.json({error:"Nội dung có quá nhiều đoạn nhỏ. Hãy rút gọn trước khi dịch."},{status:400});
    const libreUrl=process.env.LIBRETRANSLATE_URL;const libreKey=process.env.LIBRETRANSLATE_API_KEY;
    if(libreUrl){
      const response=await fetch(`${libreUrl.replace(/\/$/,"")}/translate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({q:text,source,target,format:"text",...(libreKey?{api_key:libreKey}:{})}),signal:AbortSignal.timeout(20000)});
      const data=await response.json() as {translatedText?:string;error?:string};
      if(response.ok&&data.translatedText)return NextResponse.json({translatedText:data.translatedText,provider:"LibreTranslate",characters:text.length});
    }
    const translated:string[]=[];
    for(const chunk of chunks){
      const url=new URL("https://api.mymemory.translated.net/get");
      url.searchParams.set("q",chunk);url.searchParams.set("langpair",`${source}|${target}`);
      const response=await fetch(url,{headers:{"Accept":"application/json"},signal:AbortSignal.timeout(12000)});
      if(!response.ok)throw new Error("Dịch vụ dịch đang bận.");
      const data=await response.json() as {responseData?:{translatedText?:string};responseStatus?:number};
      const value=data.responseData?.translatedText;
      if(!value)throw new Error("Không nhận được bản dịch.");
      translated.push(value);
    }
    return NextResponse.json({translatedText:translated.join(" "),provider:"MyMemory",characters:text.length,quality:"community"});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Không thể dịch nội dung."},{status:500});
  }
}
