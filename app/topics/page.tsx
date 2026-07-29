import Link from "next/link";
import { BriefcaseBusiness, Cpu, GraduationCap, HeartPulse, Landmark, Map, Plane, UsersRound } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { topicCategories } from "./topic-data";

const icons={map:Map,plane:Plane,work:BriefcaseBusiness,study:GraduationCap,culture:UsersRound,technology:Cpu,professional:HeartPulse,exam:Landmark};
export default function TopicsPage(){
  return <PageShell eyebrow="TOPIC LIBRARY" title="Học theo chủ đề">
    <section className="topic-hero"><div><b>81</b><span>chủ đề thực tế</span></div><h2>Chọn điều bạn thực sự<br/>muốn nói bằng tiếng Anh.</h2><p>Mỗi chủ đề kết hợp từ vựng, ngữ pháp, hội thoại, nghe, nói và nhiệm vụ thực tế.</p></section>
    <div className="topic-grid">{topicCategories.map(topic=>{const Icon=icons[topic.icon as keyof typeof icons];return <Link href={`/topics/${topic.slug}`} className="topic-card" style={{"--topic-color":topic.color} as React.CSSProperties} key={topic.slug}><span><Icon size={28}/></span><small>{topic.units.length} chặng học</small><h3>{topic.title}</h3><p>{topic.description}</p><b>Khám phá nội dung →</b></Link>})}</div>
  </PageShell>
}
