alter table public.lesson_activities drop constraint if exists lesson_activities_activity_type_check;
alter table public.lesson_activities add constraint lesson_activities_activity_type_check check (
  activity_type in (
    'vocabulary','grammar','listening','pronunciation','speaking','roleplay','quiz',
    'multiple_choice','multiple_select','fill_blank','ordering','matching','dictation',
    'image_choice','video_checkpoint','short_answer','essay','reading'
  )
);

create table if not exists public.learning_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  cefr_level text not null check (cefr_level in ('A0','A1','A2','B1','B2','C1','C2')),
  description text,
  skills text[] not null default '{}',
  accent_color text,
  status public.content_status not null default 'published',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.learning_topics enable row level security;
create policy "learning_topics_published_read" on public.learning_topics for select using (status = 'published' or public.is_admin());
create policy "admins_manage_learning_topics" on public.learning_topics for all using (public.is_admin()) with check (public.is_admin());

insert into public.learning_topics (slug,title,category,cefr_level,description,skills,accent_color,sort_order) values
('bang-chu-cai-am-co-ban','Bảng chữ cái và âm cơ bản','Nền tảng','A0','Nhận biết chữ cái, đánh vần tên và các âm nền tảng.',array['vocabulary','pronunciation'],'#D8EF74',1),
('chao-hoi','Chào hỏi và tạm biệt','Cuộc sống','A0','Mở đầu và kết thúc một cuộc trò chuyện ngắn.',array['listening','speaking'],'#FFC088',2),
('so-va-tuoi','Số, tuổi và số điện thoại','Cuộc sống','A0','Đọc số và trao đổi thông tin cá nhân.',array['vocabulary','listening'],'#9DDFD2',3),
('gia-dinh','Gia đình của tôi','Cuộc sống','A1','Giới thiệu thành viên và mối quan hệ gia đình.',array['vocabulary','speaking'],'#C7B7F5',4),
('thoi-gian-lich-hen','Thời gian và lịch hẹn','Cuộc sống','A1','Hỏi giờ, ngày tháng và sắp xếp lịch hẹn.',array['listening','speaking'],'#F5C5BD',5),
('nha-cua','Nhà cửa và đồ vật','Cuộc sống','A1','Mô tả phòng, đồ dùng và vị trí.',array['vocabulary','grammar'],'#B8D4F2',6),
('do-an-do-uong','Đồ ăn và thức uống','Cuộc sống','A1','Gọi món và nói về sở thích ăn uống.',array['vocabulary','roleplay'],'#F3DEA2',7),
('mua-sam','Mua sắm','Cuộc sống','A1','Hỏi giá, kích cỡ và thanh toán.',array['listening','roleplay'],'#D1E8CF',8),
('so-thich','Sở thích và cuối tuần','Cuộc sống','A1','Nói về hoạt động yêu thích và tần suất.',array['grammar','speaking'],'#D8EF74',9),
('thoi-tiet','Thời tiết và mùa','Cuộc sống','A1','Hiểu dự báo và mô tả thời tiết.',array['vocabulary','listening'],'#9DDFD2',10),
('hoi-duong','Hỏi và chỉ đường','Du lịch','A1','Tìm địa điểm và mô tả tuyến đường.',array['listening','roleplay'],'#FFC088',11),
('nha-hang','Tại nhà hàng','Du lịch','A1','Đặt bàn, gọi món và xử lý yêu cầu đơn giản.',array['listening','roleplay'],'#F3DEA2',12),
('san-bay','Tại sân bay','Du lịch','A2','Check-in, an ninh và hỏi thông tin chuyến bay.',array['vocabulary','roleplay'],'#B8D4F2',13),
('khach-san','Tại khách sạn','Du lịch','A2','Đặt phòng, nhận phòng và báo sự cố.',array['listening','speaking'],'#C7B7F5',14),
('suc-khoe','Sức khỏe và cơ thể','Cuộc sống','A2','Mô tả triệu chứng và hiểu lời khuyên cơ bản.',array['vocabulary','speaking'],'#F5C5BD',15),
('cong-viec','Công việc hằng ngày','Công việc','A2','Mô tả trách nhiệm, lịch làm việc và đồng nghiệp.',array['vocabulary','speaking'],'#D1E8CF',16),
('email-co-ban','Email công việc cơ bản','Công việc','A2','Viết email ngắn, rõ ràng và lịch sự.',array['reading','writing'],'#9DDFD2',17),
('hop-truc-tuyen','Họp trực tuyến','Công việc','A2','Tham gia họp, xin nhắc lại và đóng góp ý kiến.',array['listening','speaking'],'#B8D4F2',18),
('cong-nghe-hang-ngay','Công nghệ hằng ngày','Công nghệ','A2','Ứng dụng, thiết bị và giải quyết lỗi đơn giản.',array['vocabulary','reading'],'#C7B7F5',19),
('hoc-tap','Học tập hiệu quả','Học tập','A2','Thảo luận phương pháp học và mục tiêu.',array['reading','speaking'],'#D8EF74',20),
('cam-xuc','Cảm xúc và phản hồi','Xã hội','A2','Bày tỏ cảm xúc, đồng tình và phản hồi.',array['vocabulary','speaking'],'#FFC088',21),
('ke-hoach-tuong-lai','Kế hoạch tương lai','Cuộc sống','A2','Nói về dự định và dự đoán.',array['grammar','speaking'],'#9DDFD2',22),
('ke-chuyen-qua-khu','Kể chuyện quá khứ','Cuộc sống','A2','Kể lại trải nghiệm theo trình tự.',array['grammar','speaking'],'#F3DEA2',23),
('giao-tiep-lien-van-hoa','Giao tiếp liên văn hóa','Xã hội','A2','Lịch sự và thích nghi trong giao tiếp quốc tế.',array['reading','roleplay'],'#D1E8CF',24)
on conflict (slug) do nothing;

insert into public.grammar_topics (slug,title,cefr_level,summary,explanation_vi,formula,examples,status) values
('to-be','Động từ to be','A0','am, is, are trong câu giới thiệu.','Dùng to be để nói tên, nghề nghiệp, trạng thái và đặc điểm.','S + am/is/are + ...','["I am a student.","She is happy.","They are ready."]','published'),
('present-simple','Present Simple','A1','Thói quen và sự thật.','Dùng hiện tại đơn cho thói quen, lịch trình và sự thật chung.','S + V(s/es)','["I study every day.","He works in marketing."]','published'),
('there-is-are','There is / There are','A1','Mô tả sự tồn tại.','Dùng there is với danh từ số ít và there are với danh từ số nhiều.','There is/are + noun','["There is a café nearby.","There are two bedrooms."]','published'),
('can-cant','Can và can’t','A1','Khả năng và yêu cầu.','Can diễn tả khả năng hoặc yêu cầu thân mật.','S + can + V','["I can speak English.","Can you help me?"]','published'),
('past-simple','Past Simple','A2','Sự việc đã kết thúc.','Dùng quá khứ đơn với thời điểm đã kết thúc trong quá khứ.','S + V2/ed','["We visited Da Nang last year.","She didn’t call."]','published'),
('present-continuous','Present Continuous','A1','Hành động đang diễn ra.','Dùng cho điều đang xảy ra quanh thời điểm nói.','S + am/is/are + V-ing','["I am studying now.","They are waiting outside."]','published'),
('comparatives','Comparatives','A2','So sánh hai người hoặc vật.','Tính từ ngắn thêm -er; tính từ dài dùng more.','A + be + adj-er/more adj + than + B','["This route is faster.","English is more useful for my job."]','published'),
('future-going-to','Be going to','A2','Kế hoạch và dự định.','Dùng be going to khi đã có ý định hoặc kế hoạch.','S + be going to + V','["I am going to practise tonight."]','published')
on conflict (slug) do nothing;

insert into public.dictionary_entries (word,phonetic,definition,vietnamese_definition,source,license) values
('hello','/həˈləʊ/','Used as a greeting.','xin chào; lời chào khi gặp hoặc bắt đầu cuộc trò chuyện','editorial','Kayeng editorial'),
('learn','/lɜːn/','To gain knowledge or skill.','học; tiếp thu kiến thức hoặc kỹ năng','editorial','Kayeng editorial'),
('speak','/spiːk/','To say words or have a conversation.','nói; trò chuyện bằng lời','editorial','Kayeng editorial'),
('practice','/ˈpræk.tɪs/','Regular activity done to improve a skill.','sự luyện tập; thực hành để cải thiện kỹ năng','editorial','Kayeng editorial'),
('confident','/ˈkɒn.fɪ.dənt/','Feeling sure about your ability.','tự tin; tin vào khả năng của bản thân','editorial','Kayeng editorial'),
('improve','/ɪmˈpruːv/','To become or make something better.','cải thiện; làm cho tốt hơn','editorial','Kayeng editorial'),
('journey','/ˈdʒɜː.ni/','The act of travelling from one place to another.','hành trình; quá trình đi đến một mục tiêu','editorial','Kayeng editorial'),
('goal','/ɡəʊl/','Something you want to achieve.','mục tiêu; điều muốn đạt được','editorial','Kayeng editorial'),
('habit','/ˈhæb.ɪt/','Something you do regularly.','thói quen; hành động được lặp lại thường xuyên','editorial','Kayeng editorial'),
('conversation','/ˌkɒn.vəˈseɪ.ʃən/','A talk between two or more people.','cuộc hội thoại; cuộc trò chuyện','editorial','Kayeng editorial')
on conflict (word) do update set
  phonetic = excluded.phonetic,
  definition = excluded.definition,
  vietnamese_definition = excluded.vietnamese_definition,
  source = excluded.source,
  license = excluded.license,
  updated_at = now();
