import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, MessageCircleMore, Play, Sparkles, Volume2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { topicBySlug } from "../topic-data";
import { SpeakButton } from "@/components/learning/SpeakButton";

export default async function TopicDetailPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const topic=topicBySlug[slug];
  if(!topic)notFound();
  return <PageShell eyebrow="TOPIC DEEP DIVE" title={topic.title}>
    <Link href="/topics" className="topic-back"><ArrowLeft size={16}/> Tất cả chủ đề</Link>
    <section className="topic-detail-hero" style={{"--topic-color":topic.color} as React.CSSProperties}><div><small>HỌC MIỄN PHÍ • TỪ A0 ĐẾN B2</small><h2>{topic.hero}</h2><p>{topic.description}</p><div><span><CheckCircle2/> {topic.units.length} chặng học</span><span><CheckCircle2/> Từ vựng & mẫu câu</span><span><CheckCircle2/> Hội thoại thực tế</span></div></div><aside><small>SAU CHỦ ĐỀ NÀY</small><p>{topic.outcome}</p><Link href="/learn">Bắt đầu lộ trình <ArrowRight size={16}/></Link></aside></section>

    <section className="topic-section"><header><div><small>01 • ROADMAP</small><h2>Nội dung bạn sẽ học</h2></div><p>Đi từ ngôn ngữ nền tảng đến tình huống sử dụng thật.</p></header><div className="topic-unit-grid">{topic.units.map((unit,index)=><article key={unit.title}><span>{String(index+1).padStart(2,"0")}</span><div><small>{unit.level} • {unit.focus}</small><h3>{unit.title}</h3><p>{unit.description}</p></div><Link href="/learn" aria-label={`Học ${unit.title}`}><ArrowRight/></Link></article>)}</div></section>

    <section className="topic-section"><header><div><small>02 • VOCABULARY</small><h2>Từ khóa cần dùng được</h2></div><p>Không học từ đơn lẻ: mỗi từ luôn đi cùng phát âm và câu hoàn chỉnh.</p></header><div className="topic-word-grid">{topic.words.map(item=><article key={item.word}><SpeakButton text={item.word} label={`Nghe ${item.word}`}><Volume2/></SpeakButton><small>{item.ipa}</small><h3>{item.word}</h3><b>{item.meaning}</b><p>{item.example}</p></article>)}</div><Link className="topic-more-link" href="/dictionary">Tra cứu thêm trong từ điển <ArrowRight size={16}/></Link></section>

    <section className="topic-context-layout"><div className="topic-section"><header><div><small>03 • NATURAL PHRASES</small><h2>Mẫu câu theo tình huống</h2></div></header><div className="topic-phrases">{topic.phrases.map(item=><SpeakButton text={item.en} key={item.en}><span><small>{item.context}</small><b>{item.en}</b><em>{item.vi}</em></span><Volume2/></SpeakButton>)}</div></div><div className="topic-section"><header><div><small>04 • GRAMMAR IN USE</small><h2>Ngữ pháp liên quan</h2></div></header><div className="topic-grammar">{topic.grammar.map(item=><article key={item.name}><BookOpenCheck/><div><h3>{item.name}</h3><small>{item.use}</small><p>{item.example}</p></div></article>)}</div><Link className="topic-more-link" href="/grammar">Mở thư viện ngữ pháp <ArrowRight size={16}/></Link></div></section>

    <section className="topic-dialogue"><header><MessageCircleMore/><div><small>05 • MINI DIALOGUE</small><h2>Đọc, nghe rồi đóng vai</h2></div><SpeakButton text={topic.dialogue.map(line=>line.en).join(". ")}><Play size={17} fill="currentColor"/> Nghe toàn đoạn</SpeakButton></header><div>{topic.dialogue.map((line,index)=><article className={line.speaker==="You"?"you":""} key={`${line.speaker}-${index}`}><b>{line.speaker}</b><p>{line.en}</p><small>{line.vi}</small><SpeakButton text={line.en} label="Nghe câu"><Volume2 size={15}/></SpeakButton></article>)}</div><footer><Sparkles/><p><b>Nhiệm vụ nói:</b> Thay thông tin trong câu của “You” bằng trải nghiệm thật của bạn, sau đó nói lại mà không nhìn bản dịch.</p><Link href="/practice">Mở phòng luyện nói <ArrowRight size={16}/></Link></footer></section>
  </PageShell>
}
