import { AudioLines, Ear, Info, Mic2, Volume2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { IpaControls } from "@/components/learning/IpaControls";
import { SpeakButton } from "@/components/learning/SpeakButton";

type Sound={symbol:string;type:"Nguyên âm đơn"|"Nguyên âm đôi"|"Phụ âm";name:string;guide:string;examples:Array<[string,string,string]>;contrast?:string};
const sounds:Sound[]=[
  {symbol:"/iː/",type:"Nguyên âm đơn",name:"Long E",guide:"Môi hơi kéo ngang, lưỡi cao phía trước; giữ âm dài.",examples:[["see","/siː/","nhìn"],["teacher","/ˈtiː.tʃər/","giáo viên"],["green","/ɡriːn/","xanh lá"]],contrast:"/ɪ/ trong ship"},
  {symbol:"/ɪ/",type:"Nguyên âm đơn",name:"Short I",guide:"Thả lỏng môi, âm ngắn; lưỡi thấp hơn /iː/ một chút.",examples:[["sit","/sɪt/","ngồi"],["busy","/ˈbɪz.i/","bận"],["women","/ˈwɪm.ɪn/","phụ nữ"]],contrast:"/iː/ trong sheep"},
  {symbol:"/e/",type:"Nguyên âm đơn",name:"Short E",guide:"Miệng mở vừa, lưỡi trước; gần âm “e” tiếng Việt nhưng ngắn.",examples:[["bed","/bed/","giường"],["head","/hed/","đầu"],["friend","/frend/","bạn"]]},
  {symbol:"/æ/",type:"Nguyên âm đơn",name:"Short A",guide:"Hạ hàm rộng, lưỡi trước và thấp; âm nằm giữa “a” và “e”.",examples:[["cat","/kæt/","mèo"],["map","/mæp/","bản đồ"],["family","/ˈfæm.əl.i/","gia đình"]],contrast:"/e/ trong bed"},
  {symbol:"/ɑː/",type:"Nguyên âm đơn",name:"Long A",guide:"Mở miệng rộng, lưỡi thấp và lùi; giữ âm dài.",examples:[["car","/kɑːr/","xe hơi"],["father","/ˈfɑː.ðər/","bố"],["start","/stɑːrt/","bắt đầu"]]},
  {symbol:"/ɒ/",type:"Nguyên âm đơn",name:"Short O",guide:"Môi tròn nhẹ, hàm mở; phổ biến trong Anh–Anh.",examples:[["hot","/hɒt/","nóng"],["coffee","/ˈkɒf.i/","cà phê"],["watch","/wɒtʃ/","xem"]]},
  {symbol:"/ɔː/",type:"Nguyên âm đơn",name:"Long O",guide:"Môi tròn, lưỡi lùi; kéo dài và không trượt âm.",examples:[["call","/kɔːl/","gọi"],["talk","/tɔːk/","nói"],["morning","/ˈmɔːr.nɪŋ/","buổi sáng"]]},
  {symbol:"/ʊ/",type:"Nguyên âm đơn",name:"Short U",guide:"Môi tròn lỏng, âm ngắn; lưỡi cao phía sau.",examples:[["book","/bʊk/","sách"],["good","/ɡʊd/","tốt"],["woman","/ˈwʊm.ən/","phụ nữ"]],contrast:"/uː/ trong food"},
  {symbol:"/uː/",type:"Nguyên âm đơn",name:"Long U",guide:"Chu môi, lưỡi cao phía sau và giữ âm dài.",examples:[["food","/fuːd/","thức ăn"],["blue","/bluː/","xanh dương"],["school","/skuːl/","trường học"]],contrast:"/ʊ/ trong full"},
  {symbol:"/ʌ/",type:"Nguyên âm đơn",name:"Short Uh",guide:"Miệng mở tự nhiên, lưỡi giữa; phát âm ngắn và dứt.",examples:[["cup","/kʌp/","cốc"],["love","/lʌv/","yêu"],["country","/ˈkʌn.tri/","đất nước"]]},
  {symbol:"/ɜː/",type:"Nguyên âm đơn",name:"Long Er",guide:"Lưỡi ở giữa, môi trung tính; giữ âm dài, không cuộn quá mạnh.",examples:[["work","/wɜːrk/","làm việc"],["learn","/lɜːrn/","học"],["nurse","/nɜːrs/","y tá"]]},
  {symbol:"/ə/",type:"Nguyên âm đơn",name:"Schwa",guide:"Âm yếu, rất ngắn ở âm tiết không nhấn; miệng hoàn toàn thư giãn.",examples:[["about","/əˈbaʊt/","về"],["teacher","/ˈtiː.tʃər/","giáo viên"],["support","/səˈpɔːrt/","hỗ trợ"]]},
  {symbol:"/eɪ/",type:"Nguyên âm đôi",name:"A sound",guide:"Bắt đầu ở /e/ rồi trượt lên /ɪ/; không tách thành hai âm.",examples:[["day","/deɪ/","ngày"],["name","/neɪm/","tên"],["train","/treɪn/","tàu"]]},
  {symbol:"/aɪ/",type:"Nguyên âm đôi",name:"I sound",guide:"Mở ở /a/ rồi trượt lên /ɪ/ trong một nhịp.",examples:[["time","/taɪm/","thời gian"],["write","/raɪt/","viết"],["idea","/aɪˈdɪə/","ý tưởng"]]},
  {symbol:"/ɔɪ/",type:"Nguyên âm đôi",name:"Oy sound",guide:"Bắt đầu môi tròn /ɔ/ rồi trượt đến /ɪ/.",examples:[["boy","/bɔɪ/","cậu bé"],["choice","/tʃɔɪs/","lựa chọn"],["enjoy","/ɪnˈdʒɔɪ/","thích"]]},
  {symbol:"/aʊ/",type:"Nguyên âm đôi",name:"Ow sound",guide:"Mở miệng ở /a/, sau đó tròn môi về /ʊ/.",examples:[["now","/naʊ/","bây giờ"],["house","/haʊs/","ngôi nhà"],["about","/əˈbaʊt/","về"]]},
  {symbol:"/əʊ/",type:"Nguyên âm đôi",name:"O sound",guide:"Bắt đầu ở schwa rồi trượt đến /ʊ/, môi tròn dần.",examples:[["go","/ɡəʊ/","đi"],["home","/həʊm/","nhà"],["phone","/fəʊn/","điện thoại"]]},
  {symbol:"/ɪə/",type:"Nguyên âm đôi",name:"Ear sound",guide:"Từ /ɪ/ trượt về schwa; phổ biến trong Anh–Anh.",examples:[["near","/nɪər/","gần"],["here","/hɪər/","ở đây"],["idea","/aɪˈdɪə/","ý tưởng"]]},
  {symbol:"/eə/",type:"Nguyên âm đôi",name:"Air sound",guide:"Từ /e/ trượt về schwa, hàm khép nhẹ.",examples:[["care","/keər/","quan tâm"],["share","/ʃeər/","chia sẻ"],["where","/weər/","ở đâu"]]},
  {symbol:"/p/",type:"Phụ âm",name:"P",guide:"Hai môi khép rồi bật luồng hơi; dây thanh không rung.",examples:[["pen","/pen/","bút"],["happy","/ˈhæp.i/","vui"],["stop","/stɒp/","dừng"]],contrast:"/b/ hữu thanh"},
  {symbol:"/b/",type:"Phụ âm",name:"B",guide:"Hai môi bật mở như /p/ nhưng dây thanh rung.",examples:[["book","/bʊk/","sách"],["about","/əˈbaʊt/","về"],["job","/dʒɒb/","công việc"]],contrast:"/p/ vô thanh"},
  {symbol:"/t/",type:"Phụ âm",name:"T",guide:"Đầu lưỡi chạm lợi trên rồi bật hơi; không rung dây thanh.",examples:[["tea","/tiː/","trà"],["water","/ˈwɔː.tər/","nước"],["cat","/kæt/","mèo"]]},
  {symbol:"/d/",type:"Phụ âm",name:"D",guide:"Vị trí như /t/ nhưng dây thanh rung.",examples:[["day","/deɪ/","ngày"],["ready","/ˈred.i/","sẵn sàng"],["food","/fuːd/","thức ăn"]]},
  {symbol:"/k/",type:"Phụ âm",name:"K",guide:"Phần sau lưỡi chạm vòm mềm rồi bật hơi; không rung.",examples:[["key","/kiː/","chìa khóa"],["school","/skuːl/","trường"],["work","/wɜːrk/","làm việc"]]},
  {symbol:"/ɡ/",type:"Phụ âm",name:"G",guide:"Vị trí như /k/ nhưng dây thanh rung.",examples:[["go","/ɡəʊ/","đi"],["again","/əˈɡen/","lại"],["bag","/bæɡ/","túi"]]},
  {symbol:"/f/",type:"Phụ âm",name:"F",guide:"Răng trên chạm nhẹ môi dưới, thổi hơi liên tục; không rung.",examples:[["fine","/faɪn/","ổn"],["coffee","/ˈkɒf.i/","cà phê"],["life","/laɪf/","cuộc sống"]]},
  {symbol:"/v/",type:"Phụ âm",name:"V",guide:"Vị trí như /f/ nhưng dây thanh rung; không cắn môi.",examples:[["very","/ˈver.i/","rất"],["seven","/ˈsev.ən/","bảy"],["love","/lʌv/","yêu"]]},
  {symbol:"/θ/",type:"Phụ âm",name:"Unvoiced TH",guide:"Đặt đầu lưỡi nhẹ giữa hai răng và thổi hơi; dây thanh không rung.",examples:[["think","/θɪŋk/","nghĩ"],["healthy","/ˈhel.θi/","khỏe mạnh"],["bath","/bɑːθ/","bồn tắm"]],contrast:"/ð/ trong this"},
  {symbol:"/ð/",type:"Phụ âm",name:"Voiced TH",guide:"Đặt lưỡi như /θ/ nhưng làm rung dây thanh.",examples:[["this","/ðɪs/","này"],["mother","/ˈmʌð.ər/","mẹ"],["breathe","/briːð/","thở"]],contrast:"/θ/ trong think"},
  {symbol:"/s/",type:"Phụ âm",name:"S",guide:"Lưỡi gần lợi, tạo khe hẹp cho hơi đi qua; không rung.",examples:[["see","/siː/","nhìn"],["lesson","/ˈles.ən/","bài học"],["bus","/bʌs/","xe buýt"]]},
  {symbol:"/z/",type:"Phụ âm",name:"Z",guide:"Vị trí như /s/ nhưng dây thanh rung.",examples:[["zoo","/zuː/","sở thú"],["easy","/ˈiː.zi/","dễ"],["is","/ɪz/","là"]]},
  {symbol:"/ʃ/",type:"Phụ âm",name:"SH",guide:"Chu môi nhẹ, lưỡi gần vòm sau lợi; thổi hơi không rung.",examples:[["she","/ʃiː/","cô ấy"],["nation","/ˈneɪ.ʃən/","quốc gia"],["fish","/fɪʃ/","cá"]]},
  {symbol:"/ʒ/",type:"Phụ âm",name:"ZH",guide:"Vị trí như /ʃ/ nhưng dây thanh rung.",examples:[["vision","/ˈvɪʒ.ən/","tầm nhìn"],["measure","/ˈmeʒ.ər/","đo lường"],["usual","/ˈjuː.ʒu.əl/","thường lệ"]]},
  {symbol:"/tʃ/",type:"Phụ âm",name:"CH",guide:"Bắt đầu như /t/ và nhả thành /ʃ/ trong một âm.",examples:[["chair","/tʃeər/","ghế"],["teacher","/ˈtiː.tʃər/","giáo viên"],["watch","/wɒtʃ/","xem"]]},
  {symbol:"/dʒ/",type:"Phụ âm",name:"J",guide:"Bắt đầu như /d/ rồi nhả thành /ʒ/, có rung.",examples:[["job","/dʒɒb/","công việc"],["education","/ˌedʒ.ʊˈkeɪ.ʃən/","giáo dục"],["age","/eɪdʒ/","tuổi"]]},
  {symbol:"/h/",type:"Phụ âm",name:"H",guide:"Thở nhẹ qua thanh môn, không siết cổ.",examples:[["hello","/həˈləʊ/","xin chào"],["behind","/bɪˈhaɪnd/","phía sau"],["home","/həʊm/","nhà"]]},
  {symbol:"/m/",type:"Phụ âm",name:"M",guide:"Khép môi, cho hơi đi qua mũi và rung dây thanh.",examples:[["man","/mæn/","người đàn ông"],["summer","/ˈsʌm.ər/","mùa hè"],["time","/taɪm/","thời gian"]]},
  {symbol:"/n/",type:"Phụ âm",name:"N",guide:"Đầu lưỡi chạm lợi trên, hơi đi qua mũi.",examples:[["name","/neɪm/","tên"],["dinner","/ˈdɪn.ər/","bữa tối"],["sun","/sʌn/","mặt trời"]]},
  {symbol:"/ŋ/",type:"Phụ âm",name:"NG",guide:"Phần sau lưỡi chạm vòm mềm, hơi qua mũi; không thêm /g/.",examples:[["sing","/sɪŋ/","hát"],["English","/ˈɪŋ.ɡlɪʃ/","tiếng Anh"],["long","/lɒŋ/","dài"]]},
  {symbol:"/l/",type:"Phụ âm",name:"L",guide:"Đầu lưỡi chạm lợi, hơi thoát hai bên lưỡi.",examples:[["learn","/lɜːrn/","học"],["hello","/həˈləʊ/","xin chào"],["feel","/fiːl/","cảm thấy"]]},
  {symbol:"/r/",type:"Phụ âm",name:"R",guide:"Cong nhẹ lưỡi nhưng không chạm vòm; môi hơi tròn.",examples:[["red","/red/","đỏ"],["around","/əˈraʊnd/","xung quanh"],["right","/raɪt/","đúng"]]},
  {symbol:"/j/",type:"Phụ âm",name:"Y",guide:"Lưỡi cao phía trước rồi trượt nhanh sang nguyên âm.",examples:[["yes","/jes/","vâng"],["use","/juːz/","sử dụng"],["music","/ˈmjuː.zɪk/","âm nhạc"]]},
  {symbol:"/w/",type:"Phụ âm",name:"W",guide:"Chu môi rồi mở nhanh vào nguyên âm; không đọc như /v/.",examples:[["we","/wiː/","chúng tôi"],["away","/əˈweɪ/","đi xa"],["quick","/kwɪk/","nhanh"]]},
];

export default function PronunciationPage(){
  return <PageShell eyebrow="PRONUNCIATION LAB" title="Bảng phiên âm IPA">
    <section className="ipa-hero"><div><AudioLines size={36}/><small>44 ÂM TIẾNG ANH</small><h2>Nhìn âm. Nghe âm.<br/>Tự tin phát âm.</h2><p>Chạm vào từng ký hiệu để xem vị trí môi–lưỡi, nghe từ mẫu và phân biệt những cặp âm dễ nhầm.</p></div><div className="ipa-tip"><Ear/><b>Học bằng tai trước</b><p>Nghe → quan sát khẩu hình → bắt chước → ghi âm → so sánh.</p></div></section>
    <IpaControls/>
    <div className="ipa-layout"><section className="ipa-chart">{["Nguyên âm đơn","Nguyên âm đôi","Phụ âm"].map(group=><div key={group}><h2>{group}<small>{sounds.filter(sound=>sound.type===group).length} âm</small></h2><div>{sounds.filter(sound=>sound.type===group).map((sound,index)=><button data-ipa-sound data-ipa-trigger data-ipa={sound.symbol} data-type={sound.type} data-search={`${sound.symbol} ${sound.name} ${sound.examples.flat().join(" ")}`.toLowerCase()} className={index===0&&group==="Nguyên âm đơn"?"active":""} key={sound.symbol}><b>{sound.symbol}</b><span>{sound.examples[0][0]}</span></button>)}</div></div>)}</section>
    <aside className="ipa-detail">{sounds.map((sound,index)=><div data-ipa-detail data-ipa={sound.symbol} hidden={index!==0} key={sound.symbol}><header><div><small>{sound.type}</small><h2>{sound.symbol}</h2><b>{sound.name}</b></div><SpeakButton text={sound.examples[0][0]}><Volume2/> Nghe âm mẫu</SpeakButton></header><section><h3><Mic2/> Khẩu hình và cách tạo âm</h3><p>{sound.guide}</p></section>{sound.contrast&&<div className="ipa-contrast"><Info/><p><b>Dễ nhầm với</b>{sound.contrast}. Nghe xen kẽ và chú ý độ dài hoặc độ rung.</p></div>}<section><h3>Ví dụ thực tế</h3><div className="ipa-examples">{sound.examples.map(([word,ipa,meaning])=><SpeakButton text={word} key={word}><Volume2/><span><b>{word}</b><small>{ipa}</small></span><em>{meaning}</em></SpeakButton>)}</div></section><section className="ipa-practice"><h3>Mini practice</h3><p>Nói từng từ chậm, sau đó đặt từ đầu tiên vào câu hoàn chỉnh.</p></section></div>)}</aside></div>
  </PageShell>
}
