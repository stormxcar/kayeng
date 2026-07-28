import Link from "next/link";
import { BriefcaseBusiness, Cpu, GraduationCap, HeartPulse, Landmark, Map, Plane, UsersRound } from "lucide-react";
import { PageShell } from "@/components/PageShell";

const topics = [
  ["Cuộc sống hằng ngày","Gia đình, nhà cửa, ăn uống, mua sắm, cảm xúc",Map,"12 chủ đề","#d8ef74"],
  ["Du lịch","Sân bay, khách sạn, hỏi đường, nhà hàng",Plane,"10 chủ đề","#ffc088"],
  ["Công việc","Phỏng vấn, họp, email, thuyết trình",BriefcaseBusiness,"12 chủ đề","#9ddfd2"],
  ["Học tập","Trường học, đại học, nghiên cứu, du học",GraduationCap,"8 chủ đề","#c7b7f5"],
  ["Xã hội & văn hóa","Môi trường, truyền thông, cộng đồng",UsersRound,"9 chủ đề","#f5c5bd"],
  ["Công nghệ","Internet, lập trình, AI, bảo mật",Cpu,"10 chủ đề","#b8d4f2"],
  ["Chuyên ngành","IT, marketing, tài chính, y tế, logistics",HeartPulse,"12 chủ đề","#f3dea2"],
  ["Luyện thi","CEFR, IELTS, TOEIC và phỏng vấn quốc tế",Landmark,"8 chủ đề","#d1e8cf"],
];
export default function TopicsPage() {
  return <PageShell eyebrow="TOPIC LIBRARY" title="Học theo chủ đề"><section className="topic-hero"><div><b>81</b><span>chủ đề thực tế</span></div><h2>Chọn điều bạn thực sự<br />muốn nói bằng tiếng Anh.</h2><p>Mỗi chủ đề kết hợp từ vựng, ngữ pháp, nghe, nói, đọc, viết và bài kiểm tra cuối.</p></section><div className="topic-grid">{topics.map(([title,description,Icon,count,color]) => { const TopicIcon = Icon as typeof Map; return <Link href="/learn" className="topic-card" style={{"--topic-color": color} as React.CSSProperties} key={String(title)}><span><TopicIcon size={28} /></span><small>{count as string}</small><h3>{title as string}</h3><p>{description as string}</p></Link>; })}</div></PageShell>;
}
