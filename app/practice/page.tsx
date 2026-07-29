"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, AudioLines, Bot, BookOpenCheck, BrainCircuit, Clock3, Headphones, ImageIcon, Mic2, Search, Sparkles, Video } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/client";

type Practice={id:string;title:string;instructions:string|null;activity_type:string;lessons:{id:string;title:string}};
type PracticeItem={title:string;description:string;level:string;topic:string;type:string;minutes:number;target:string;icon:"mic"|"audio"|"bot"|"listen"|"image"|"video"|"quiz"|"read";featured?:boolean};
const catalog:PracticeItem[]=[
  {title:"Âm đầu tiên: nghe và bắt chước",description:"Phân biệt âm, nghe từ mẫu rồi đọc lại chậm.",level:"A0",topic:"Phát âm",type:"Pronunciation",minutes:5,target:"/pronunciation",icon:"audio",featured:true},
  {title:"Chào hỏi trong 60 giây",description:"Tự giới thiệu tên, quê quán và nghề nghiệp.",level:"A0",topic:"Đời sống",type:"Speaking",minutes:5,target:"/topics/daily-life",icon:"mic"},
  {title:"Listen & choose: đồ vật quen thuộc",description:"Nghe từ và chọn hình minh họa tương ứng.",level:"A0",topic:"Đời sống",type:"Image choice",minutes:5,target:"/tests",icon:"image"},
  {title:"Shadowing: morning routine",description:"Nghe từng cụm, bắt chước nhịp và nối âm.",level:"A1",topic:"Đời sống",type:"Shadowing",minutes:8,target:"/topics/daily-life",icon:"listen",featured:true},
  {title:"Điền từ: Present Simple",description:"Hoàn thành câu về thói quen và kiểm tra chia động từ.",level:"A1",topic:"Ngữ pháp",type:"Fill blank",minutes:7,target:"/grammar",icon:"quiz"},
  {title:"Hỏi đường trong thành phố",description:"Đóng vai khách du lịch hỏi và xác nhận đường đi.",level:"A1",topic:"Du lịch",type:"Role-play",minutes:8,target:"/topics/travel",icon:"bot"},
  {title:"Dictation: at the café",description:"Nghe câu gọi món và gõ lại chính xác.",level:"A1",topic:"Ăn uống",type:"Dictation",minutes:8,target:"/library",icon:"listen"},
  {title:"Picture speaking: căn phòng của tôi",description:"Quan sát ảnh và mô tả vị trí, màu sắc, đồ vật.",level:"A1",topic:"Đời sống",type:"Picture speaking",minutes:7,target:"/topics/daily-life",icon:"image"},
  {title:"Check-in tại khách sạn",description:"Luyện nhận phòng, hỏi bữa sáng và yêu cầu dịch vụ.",level:"A2",topic:"Du lịch",type:"Role-play",minutes:10,target:"/topics/travel",icon:"bot",featured:true},
  {title:"Minimal pairs: ship hay sheep?",description:"Phân biệt nguyên âm ngắn/dài qua nghe và nói.",level:"A2",topic:"Phát âm",type:"Pronunciation",minutes:8,target:"/pronunciation",icon:"audio"},
  {title:"Kể lại cuối tuần",description:"Dùng Past Simple để kể chuỗi hành động theo thứ tự.",level:"A2",topic:"Đời sống",type:"Speaking",minutes:10,target:"/topics/daily-life",icon:"mic"},
  {title:"Video checkpoint: travel vlog",description:"Xem đoạn ngắn, dừng ở các mốc và trả lời câu hỏi.",level:"A2",topic:"Du lịch",type:"Video",minutes:12,target:"/library",icon:"video"},
  {title:"Email xin thông tin",description:"Viết email ngắn, lịch sự với mở đầu và kết thư phù hợp.",level:"A2",topic:"Công việc",type:"Writing",minutes:12,target:"/topics/work",icon:"read"},
  {title:"Cập nhật tiến độ trong cuộc họp",description:"Báo cáo việc đã làm, rủi ro và bước tiếp theo.",level:"B1",topic:"Công việc",type:"Role-play",minutes:12,target:"/topics/work",icon:"bot",featured:true},
  {title:"Listening: podcast ý chính",description:"Nghe đoạn hội thoại tự nhiên và chọn ý chính, thái độ.",level:"B1",topic:"Học tập",type:"Listening",minutes:12,target:"/library",icon:"listen"},
  {title:"Nói 2 phút: công nghệ trong đời sống",description:"Chuẩn bị ý, ví dụ và kết luận trong thời gian giới hạn.",level:"B1",topic:"Công nghệ",type:"Speaking",minutes:10,target:"/topics/technology",icon:"mic"},
  {title:"Sắp xếp đoạn văn",description:"Khôi phục thứ tự câu dựa trên từ nối và mạch ý.",level:"B1",topic:"Học tập",type:"Ordering",minutes:10,target:"/tests",icon:"quiz"},
  {title:"Phỏng vấn theo phương pháp STAR",description:"Trả lời câu hỏi hành vi bằng tình huống và kết quả cụ thể.",level:"B1",topic:"Công việc",type:"Interview",minutes:15,target:"/topics/work",icon:"bot"},
  {title:"Thuyết trình biểu đồ",description:"Mô tả xu hướng tăng giảm và so sánh dữ liệu.",level:"B2",topic:"Luyện thi",type:"Presentation",minutes:15,target:"/topics/exam",icon:"mic"},
  {title:"Debate: AI có thay thế công việc?",description:"Xây lập luận, phản biện và nhượng bộ có sắc thái.",level:"B2",topic:"Công nghệ",type:"Debate",minutes:18,target:"/topics/technology",icon:"bot"},
  {title:"Listening: hàm ý người nói",description:"Nhận biết thái độ, sự mỉa mai và ý nghĩa gián tiếp.",level:"B2",topic:"Xã hội",type:"Listening",minutes:12,target:"/library",icon:"listen"},
  {title:"Pronunciation: thought groups",description:"Chia cụm ý, đặt trọng âm câu và điều khiển ngữ điệu.",level:"B2",topic:"Phát âm",type:"Pronunciation",minutes:12,target:"/pronunciation",icon:"audio"},
  {title:"Tóm tắt bài giảng học thuật",description:"Ghi chú có chọn lọc rồi trình bày lại ý chính.",level:"C1",topic:"Học tập",type:"Integrated",minutes:20,target:"/topics/study",icon:"read"},
  {title:"Rephrase: nói chính xác và ngoại giao",description:"Viết lại câu trực tiếp thành cách nói chuyên nghiệp, tinh tế.",level:"C1",topic:"Công việc",type:"Rephrasing",minutes:12,target:"/grammar",icon:"read"},
  {title:"Critical response: nguồn tin và thiên kiến",description:"Đánh giá lập luận, bằng chứng và độ đáng tin của nguồn.",level:"C1",topic:"Xã hội",type:"Critical reading",minutes:20,target:"/topics/culture",icon:"read"},
  {title:"Impromptu speaking",description:"Nói ứng khẩu ba phút về một chủ đề trừu tượng.",level:"C2",topic:"Giao tiếp",type:"Speaking",minutes:15,target:"/topics/culture",icon:"mic"},
];
const iconMap={mic:Mic2,audio:AudioLines,bot:Bot,listen:Headphones,image:ImageIcon,video:Video,quiz:BrainCircuit,read:BookOpenCheck};
const levels=["Tất cả","A0","A1","A2","B1","B2","C1","C2"];
const topics=["Tất cả","Đời sống","Du lịch","Công việc","Phát âm","Ngữ pháp","Học tập","Công nghệ","Xã hội","Luyện thi"];

export default function PracticePage(){
  const [items,setItems]=useState<Practice[]>([]);const [capabilities,setCapabilities]=useState({ai:false,pronunciation:false,realtime:false});
  const [level,setLevel]=useState("Tất cả");const [topic,setTopic]=useState("Tất cả");const [query,setQuery]=useState("");
  useEffect(()=>{Promise.all([createClient().from("lesson_activities").select("id,title,instructions,activity_type,lessons(id,title)").in("activity_type",["speaking","pronunciation","roleplay"]).limit(20),fetch("/api/capabilities").then(response=>response.json())]).then(([activities,caps])=>{setItems((activities.data||[]) as unknown as Practice[]);setCapabilities(caps)})},[]);
  const filtered=useMemo(()=>catalog.filter(item=>(level==="Tất cả"||item.level===level)&&(topic==="Tất cả"||item.topic===topic)&&`${item.title} ${item.description} ${item.type} ${item.topic}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))),[level,topic,query]);
  const featured=catalog.filter(item=>item.featured);
  return <PageShell eyebrow="PRACTICE CENTER" title="Trung tâm luyện tập">
    <section className="practice-hub-hero"><div><span><Sparkles/> LUYỆN TỪ NHẬN BIẾT ĐẾN PHẢN XẠ</span><h2>Không chỉ làm bài.<br/>Hãy thực sự dùng tiếng Anh.</h2><p>Chọn mức độ, chủ đề và hình thức phù hợp với quỹ thời gian hôm nay.</p><div><b>{catalog.length}</b><small>bài luyện mẫu</small><b>A0–C2</b><small>đủ cấp độ</small><b>5–20</b><small>phút mỗi bài</small></div></div><aside><Mic2/><b>Daily speaking challenge</b><p>Nói 60 giây về kế hoạch hôm nay. Không dừng lại để sửa lỗi giữa câu.</p><Link href={items[0]?`/lesson/${items[0].lessons.id}`:"/pronunciation"}>Bắt đầu luyện <ArrowRight/></Link></aside></section>
    <div className="capability-strip"><span className={capabilities.pronunciation?"online":""}>● Chấm phát âm {capabilities.pronunciation?"đã sẵn sàng":"chờ Azure key"}</span><span className={capabilities.ai?"online":""}>● AI Role-play {capabilities.ai?"đã sẵn sàng":"chờ AI key"}</span><span>○ Realtime voice — triển khai sau</span></div>
    <section className="practice-featured-row">{featured.map((item,index)=>{const Icon=iconMap[item.icon];return <Link href={item.target} className={`practice-spotlight spotlight-${index}`} key={item.title}><header><span>{item.level}</span><small>{item.minutes} PHÚT</small></header><Icon/><h3>{item.title}</h3><p>{item.description}</p><b>Mở bài luyện <ArrowRight/></b></Link>})}</section>
    {items.length>0&&<section className="live-practice"><header><div><small>ACTIVITY ENGINE</small><h2>Bài luyện từ khóa học của bạn</h2></div><span>{items.length} hoạt động đang có dữ liệu</span></header><div>{items.map(item=><Link href={`/lesson/${item.lessons.id}`} key={item.id}><Sparkles/><div><small>{item.lessons?.title} • {item.activity_type}</small><h3>{item.title}</h3><p>{item.instructions}</p></div><ArrowRight/></Link>)}</div></section>}
    <section className="practice-explorer"><header><div><small>ALL PRACTICE</small><h2>Luyện theo nhu cầu</h2></div><label><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Tìm bài luyện…"/></label></header><div className="practice-filter-groups"><div><small>TRÌNH ĐỘ</small><section>{levels.map(item=><button className={level===item?"active":""} onClick={()=>setLevel(item)} key={item}>{item}</button>)}</section></div><div><small>CHỦ ĐỀ</small><section>{topics.map(item=><button className={topic===item?"active":""} onClick={()=>setTopic(item)} key={item}>{item}</button>)}</section></div></div>
      <div className="practice-catalog-grid">{filtered.map(item=>{const Icon=iconMap[item.icon];return <Link href={item.target} key={item.title}><header><span>{item.level}</span><small>{item.topic}</small></header><Icon/><h3>{item.title}</h3><p>{item.description}</p><div><span>{item.type}</span><b><Clock3/> {item.minutes} phút</b></div><footer>Bắt đầu <ArrowRight/></footer></Link>})}</div>
      {!filtered.length&&<div className="empty-state"><Search/><h2>Không có bài phù hợp bộ lọc</h2><p>Thử chọn “Tất cả” hoặc một cấp độ khác.</p></div>}
    </section>
  </PageShell>
}
