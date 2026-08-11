import { NextResponse } from "next/server";

export const dynamic = "force-static";

const allowed=new Set(["image/jpeg","image/png","image/webp","application/pdf"]);
export async function POST(request:Request){
  const apiKey=process.env.OCR_SPACE_API_KEY;
  if(!apiKey)return NextResponse.json({error:"OCR chưa được cấu hình. Thêm OCR_SPACE_API_KEY để đọc ảnh và PDF."},{status:503});
  const form=await request.formData();const file=form.get("file");
  if(!(file instanceof File))return NextResponse.json({error:"Không tìm thấy tệp."},{status:400});
  if(!allowed.has(file.type))return NextResponse.json({error:"Chỉ hỗ trợ JPG, PNG, WebP và PDF."},{status:415});
  if(file.size>1024*1024)return NextResponse.json({error:"Ảnh/PDF không được vượt quá 1 MB ở gói OCR miễn phí."},{status:413});
  const body=new FormData();body.append("file",file);body.append("language",String(form.get("language")||"eng"));body.append("detectOrientation","true");body.append("scale","true");body.append("OCREngine","2");
  const response=await fetch("https://api.ocr.space/parse/image",{method:"POST",headers:{apikey:apiKey},body,signal:AbortSignal.timeout(30000)});
  const data=await response.json() as {IsErroredOnProcessing?:boolean;ErrorMessage?:string[];ParsedResults?:Array<{ParsedText?:string}>};
  if(!response.ok||data.IsErroredOnProcessing)return NextResponse.json({error:data.ErrorMessage?.join(" ")||"Không thể đọc chữ trong tệp."},{status:502});
  const text=(data.ParsedResults||[]).map(item=>item.ParsedText||"").join("\n").trim();
  if(!text)return NextResponse.json({error:"Không nhận diện được chữ. Hãy dùng ảnh rõ, đủ sáng và thẳng."},{status:422});
  return NextResponse.json({text:text.slice(0,3000),truncated:text.length>3000});
}
