import Image from "next/image";
import Link from "next/link";
import { BookOpen, Bookmark, Clock3, Headphones, MessageSquareText, Play, Search, Video } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { libraryItems } from "./library-data";
const icons={video:Video,podcast:Headphones,story:BookOpen,dialogue:MessageSquareText};
export default function LibraryPage(){const featured=libraryItems[0];return <PageShell eyebrow="MEDIA LIBRARY" title="Thư viện học liệu">
  <LibraryFilters/>
  <section className="library-feature"><div><span>FEATURED • {featured.level} • {featured.minutes} PHÚT</span><h2>{featured.title}</h2><p>{featured.description}</p><Link className="library-start" href={`/library/${featured.type}/${featured.slug}`}><Play size={18} fill="currentColor"/> Bắt đầu học</Link></div></section>
  <section className="library-editorial"><Image src="/student-study-unsplash.webp" alt="Người học đeo tai nghe và ghi chú" width={1200} height={800} sizes="(max-width: 900px) 100vw, 48vw"/><div><small>HỌC BẰNG NỘI DUNG THẬT</small><h2>Nghe, đọc, tra từ và kiểm tra trong cùng một trải nghiệm.</h2><p>Mỗi nội dung có transcript song ngữ, từ khóa, player điều chỉnh tốc độ, bookmark và câu hỏi hiểu bài.</p></div></section>
  <div className="library-content-grid">{libraryItems.map(item=>{const Icon=icons[item.type];const key=`${item.type}/${item.slug}`;return <Link data-library-card data-key={key} data-type={item.type} data-search={`${item.title} ${item.description} ${item.topic} ${item.level}`.toLocaleLowerCase("vi")} href={`/library/${key}`} key={key}><div className="library-card-image"><Image src={item.image} alt="" width={700} height={460} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"/><span><Icon/>{item.type}</span><i><Play fill="currentColor"/></i></div><header><small>{item.level} • {item.topic}</small><Bookmark className="library-saved-mark" size={15} fill="currentColor"/></header><h3>{item.title}</h3><p>{item.description}</p><footer><span><Clock3/> {item.minutes} phút</span><b>{item.questions.length} câu hỏi</b></footer></Link>})}</div>
  <div data-library-empty className="empty-state" hidden><Search/><h2>Chưa có nội dung phù hợp</h2><p>Thử chọn “Tất cả” hoặc tìm bằng từ khóa khác.</p></div>
  <p className="media-attribution">Ảnh học liệu: Unsplash và Pexels. Nội dung bài học do Kayeng biên soạn.</p>
</PageShell>}
