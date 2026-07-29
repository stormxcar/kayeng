import Link from "next/link";
import { ArrowLeft, BookOpen, Compass, Languages, MessageCircleQuestion, Search } from "lucide-react";

export default function NotFound(){
  return <main className="english-not-found">
    <section>
      <div className="lost-word"><span>4</span><i><MessageCircleQuestion/></i><span>4</span></div>
      <p className="section-kicker">WORD NOT FOUND • TRANG KHÔNG TỒN TẠI</p>
      <h1>Looks like this word<br/>is missing from the sentence.</h1>
      <p className="not-found-translation">Có vẻ đường dẫn này đã bị “lạc từ”. Không sao — chọn một điểm đến bên dưới để tiếp tục học mà không mất streak.</p>
      <div className="not-found-actions"><Link className="lesson-primary" href="/"><ArrowLeft size={17}/> Về Hôm nay</Link><Link className="secondary-link" href="/topics"><Compass size={17}/> Chọn chủ đề</Link></div>
    </section>
    <aside>
      <small>QUICK RECOVERY</small><h2>Bạn muốn học gì?</h2>
      <Link href="/dictionary"><span><Search/></span><div><b>Tra một từ</b><small>Nghĩa Việt, IPA và ví dụ</small></div></Link>
      <Link href="/grammar"><span><BookOpen/></span><div><b>Xem ngữ pháp</b><small>Công thức theo ngữ cảnh</small></div></Link>
      <Link href="/pronunciation"><span><Languages/></span><div><b>Luyện bảng IPA</b><small>44 âm và khẩu hình</small></div></Link>
      <blockquote><b>lost</b> /lɒst/ <em>adjective</em><p>unable to find the way — nhưng trong Kayeng, luôn có đường quay lại bài học.</p></blockquote>
    </aside>
  </main>
}
