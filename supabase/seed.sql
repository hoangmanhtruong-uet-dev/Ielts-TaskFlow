insert into public.learning_modules (
  id,
  slug,
  title,
  description,
  skill,
  test_type,
  difficulty,
  display_order,
  status,
  estimated_minutes,
  published_at
) values
  (
    '10000000-0000-4000-8000-000000000001',
    'ielts-foundations-starter',
    'Nền tảng IELTS',
    'Những khái niệm cốt lõi giúp bạn hiểu bài thi và xây dựng cách học có mục đích.',
    'foundations',
    'both',
    'beginner',
    1,
    'published',
    30,
    '2026-07-16T00:00:00Z'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'reading-foundations',
    'Nền tảng Reading',
    'Rèn cách đọc có mục tiêu trước khi bước vào các dạng câu hỏi IELTS Academic.',
    'reading',
    'academic',
    'beginner',
    2,
    'published',
    40,
    '2026-07-16T00:00:00Z'
  )
on conflict (id) do nothing;

insert into public.lessons (
  id,
  module_id,
  slug,
  display_order
) values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'hieu-cau-truc-bai-thi',
    1
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'hieu-band-score',
    2
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000002',
    'doc-co-muc-dich',
    1
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000002',
    'skimming-va-scanning',
    2
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000002',
    'ghi-chu-khi-doc',
    3
  )
on conflict (id) do nothing;

insert into public.lesson_versions (
  id,
  lesson_id,
  version,
  title,
  summary,
  difficulty,
  estimated_minutes,
  status
) values
  (
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    1,
    'Hiểu cấu trúc bài thi IELTS',
    'Phân biệt bốn kỹ năng, cách tổ chức bài thi và vai trò của từng phần trong kế hoạch học.',
    'beginner',
    15,
    'draft'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    1,
    'Hiểu Band Score',
    'Đọc band score như một tập hợp bằng chứng kỹ năng, không phải nhãn đánh giá năng lực cố định.',
    'beginner',
    15,
    'draft'
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000003',
    1,
    'Đọc có mục đích',
    'Xác định thông tin cần tìm trước khi đọc để giảm việc quay lại đoạn văn không cần thiết.',
    'beginner',
    18,
    'draft'
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    '20000000-0000-4000-8000-000000000004',
    1,
    'Skimming và Scanning',
    'Phân biệt hai thao tác đọc nhanh và chọn đúng thao tác theo mục tiêu thông tin.',
    'beginner',
    22,
    'draft'
  ),
  (
    '30000000-0000-4000-8000-000000000005',
    '20000000-0000-4000-8000-000000000005',
    1,
    'Ghi chú khi đọc',
    'Bản nháp nội bộ dùng để kiểm chứng rằng learner không nhìn thấy lesson chưa publish.',
    'beginner',
    12,
    'draft'
  )
on conflict (id) do nothing;

insert into public.lesson_sections (
  id,
  lesson_version_id,
  section_type,
  title,
  body_markdown,
  display_order,
  is_required
) select
  seed.id::uuid,
  seed.lesson_version_id::uuid,
  seed.section_type,
  seed.title,
  seed.body_markdown,
  seed.display_order,
  seed.is_required
from (values
  (
    '40000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'text',
    'Bốn kỹ năng, bốn loại bằng chứng',
    'IELTS đánh giá **Listening, Reading, Writing và Speaking**. Mỗi kỹ năng tạo ra một loại bằng chứng khác nhau: câu trả lời, bài viết hoặc phần trình bày nói. Vì vậy, một kế hoạch học tốt phải chỉ rõ bạn đang rèn kỹ năng nào và bằng chứng hoàn thành là gì.',
    1,
    true
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000001',
    'checklist',
    'Kiểm tra trước khi học',
    '- Xác định Academic hay General Training.\n- Ghi lại band mục tiêu và ngày thi nếu đã có.\n- Chọn tối đa hai kỹ năng cần ưu tiên trong tuần.\n- Dành thời gian riêng cho luyện tập và xem lại lỗi.',
    2,
    true
  ),
  (
    '40000000-0000-4000-8000-000000000003',
    '30000000-0000-4000-8000-000000000001',
    'summary',
    'Điều cần nhớ',
    'Cấu trúc bài thi giúp bạn chia nhỏ mục tiêu. Nó không thay thế việc luyện tập có thời gian, nộp câu trả lời và xem lại lỗi.',
    3,
    true
  ),
  (
    '40000000-0000-4000-8000-000000000004',
    '30000000-0000-4000-8000-000000000002',
    'text',
    'Band score mô tả điều gì?',
    'Band score tóm tắt mức độ đáp ứng tiêu chí tại một thời điểm. Điểm tổng không cho biết chính xác bạn cần sửa câu nào, nên hãy kết hợp nó với bằng chứng cụ thể như dạng lỗi, độ chính xác và chất lượng bài sửa.',
    1,
    true
  ),
  (
    '40000000-0000-4000-8000-000000000005',
    '30000000-0000-4000-8000-000000000002',
    'example',
    'Một cách đọc kết quả hữu ích',
    'Thay vì ghi “Reading 6.0”, hãy ghi rõ hơn: **mất nhiều thời gian ở câu matching headings và thường chọn đáp án trước khi đọc hết ý chính của đoạn**. Mô tả này dẫn tới hành động học cụ thể.',
    2,
    true
  ),
  (
    '40000000-0000-4000-8000-000000000006',
    '30000000-0000-4000-8000-000000000002',
    'tip',
    'Theo dõi bằng chứng nhỏ',
    'Sau mỗi buổi, lưu một điều đã làm tốt và một lỗi cần xem lại. Chuỗi bằng chứng nhỏ đáng tin cậy hơn cảm giác “hôm nay học khá ổn”.',
    3,
    false
  ),
  (
    '40000000-0000-4000-8000-000000000007',
    '30000000-0000-4000-8000-000000000003',
    'text',
    'Câu hỏi quyết định cách đọc',
    'Trước khi đọc, hãy xác định bạn cần **ý chính, vị trí thông tin hay một chi tiết chính xác**. Mục tiêu này quyết định tốc độ và vùng văn bản cần chú ý.',
    1,
    true
  ),
  (
    '40000000-0000-4000-8000-000000000008',
    '30000000-0000-4000-8000-000000000003',
    'example',
    'Ví dụ ngắn',
    'Nếu câu hỏi hỏi nguyên nhân một dự án bị trì hoãn, bạn cần tìm quan hệ nguyên nhân và kết quả. Bạn không cần ghi nhớ mọi con số xuất hiện trong đoạn.',
    2,
    true
  ),
  (
    '40000000-0000-4000-8000-000000000009',
    '30000000-0000-4000-8000-000000000003',
    'checklist',
    'Quy trình ba bước',
    '1. Đọc yêu cầu và gạch chân từ khóa chức năng.\n2. Dự đoán loại thông tin cần tìm.\n3. Chỉ đọc kỹ vùng văn bản có khả năng chứa bằng chứng.',
    3,
    true
  ),
  (
    '40000000-0000-4000-8000-000000000010',
    '30000000-0000-4000-8000-000000000004',
    'text',
    'Skimming để nắm cấu trúc',
    'Skimming là đọc nhanh để nhận ra chủ đề, hướng phát triển và chức năng của từng đoạn. Hãy chú ý tiêu đề, câu đầu, câu cuối và những từ nối báo hiệu chuyển ý.',
    1,
    true
  ),
  (
    '40000000-0000-4000-8000-000000000011',
    '30000000-0000-4000-8000-000000000004',
    'text',
    'Scanning để định vị chi tiết',
    'Scanning là di chuyển mắt có chọn lọc để tìm tên riêng, mốc thời gian, thuật ngữ hoặc cách diễn đạt tương đương với câu hỏi. Sau khi định vị, hãy đọc kỹ câu xung quanh để xác nhận.',
    2,
    true
  ),
  (
    '40000000-0000-4000-8000-000000000012',
    '30000000-0000-4000-8000-000000000004',
    'warning',
    'Không dùng một kỹ thuật cho mọi câu',
    'Đọc nhanh chỉ giúp định vị. Đáp án vẫn cần bằng chứng trong ngữ cảnh. Nếu một từ khóa trùng khớp nhưng quan hệ ý nghĩa khác, đó chưa phải bằng chứng đủ.',
    3,
    true
  ),
  (
    '40000000-0000-4000-8000-000000000013',
    '30000000-0000-4000-8000-000000000005',
    'text',
    'Bản nháp chưa xuất bản',
    'Section này chỉ dùng để kiểm chứng publication isolation và không được xuất hiện với learner.',
    1,
    true
  )
) as seed (
  id,
  lesson_version_id,
  section_type,
  title,
  body_markdown,
  display_order,
  is_required
)
where not exists (
  select 1
  from public.lesson_sections as existing_section
  where existing_section.id = seed.id::uuid
);

update public.lesson_versions
set
  status = 'published',
  published_at = '2026-07-16T00:00:00Z'
where id in (
  '30000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000003',
  '30000000-0000-4000-8000-000000000004'
)
and status = 'draft';

insert into public.exercise_sets (id, slug, domain, display_order)
values
  ('30000000-0000-4000-8000-000000000001', 'academic-vocabulary-foundations', 'vocabulary', 1),
  ('30000000-0000-4000-8000-000000000002', 'grammar-accuracy-foundations', 'grammar', 2),
  ('30000000-0000-4000-8000-000000000003', 'draft-content-review', 'grammar', 99)
on conflict (id) do nothing;

insert into public.exercise_set_versions (
  id, exercise_set_id, version, title, summary, instructions_markdown,
  difficulty, status, allow_review
)
values
  (
    '31000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    1,
    'Academic Vocabulary Foundations',
    'Practice a small set of original academic words used in IELTS learning contexts.',
    'Answer all four questions. Your work is saved after each answer, and explanations open after submission.',
    'beginner',
    'draft',
    true
  ),
  (
    '31000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000002',
    1,
    'Grammar Accuracy Foundations',
    'Check subject-verb agreement, articles and sentence control.',
    'Choose or type the most accurate answer. Scoring is exact and does not use AI.',
    'beginner',
    'draft',
    true
  ),
  (
    '31000000-0000-4000-8000-000000000003',
    '30000000-0000-4000-8000-000000000003',
    1,
    'Draft Grammar Review',
    'Unpublished fixture used to prove draft content remains hidden.',
    'This content must never appear to learners before publication.',
    'beginner',
    'draft',
    false
  )
on conflict (id) do nothing;

insert into public.exercise_questions (
  id, exercise_set_version_id, position, question_type, prompt_markdown, points
)
select
  seed.id::uuid,
  seed.exercise_set_version_id::uuid,
  seed.position,
  seed.question_type,
  seed.prompt_markdown,
  seed.points
from (values
  ('32000000-0000-4000-8000-000000000001', '31000000-0000-4000-8000-000000000001', 1, 'single_choice', 'Which meaning best matches **mitigate**?', 1),
  ('32000000-0000-4000-8000-000000000002', '31000000-0000-4000-8000-000000000001', 2, 'multiple_choice', 'Select the two words that can positively describe a well-written argument.', 2),
  ('32000000-0000-4000-8000-000000000003', '31000000-0000-4000-8000-000000000001', 3, 'true_false', '**Allocate** can mean to distribute a limited resource for a particular purpose.', 1),
  ('32000000-0000-4000-8000-000000000004', '31000000-0000-4000-8000-000000000001', 4, 'short_text', 'Complete with one seeded vocabulary word: “Better planning can ___ the risk of delay.”', 1),
  ('32000000-0000-4000-8000-000000000005', '31000000-0000-4000-8000-000000000002', 1, 'single_choice', 'Choose the sentence with correct subject-verb agreement.', 1),
  ('32000000-0000-4000-8000-000000000006', '31000000-0000-4000-8000-000000000002', 2, 'multiple_choice', 'Select both sentences with correct article use.', 2),
  ('32000000-0000-4000-8000-000000000007', '31000000-0000-4000-8000-000000000002', 3, 'true_false', 'Every uncountable noun should be preceded by **a** or **an**.', 1),
  ('32000000-0000-4000-8000-000000000008', '31000000-0000-4000-8000-000000000002', 4, 'short_text', 'Complete the sentence with the correct verb: “The evidence ___ that the policy is effective.”', 1)
) as seed (id, exercise_set_version_id, position, question_type, prompt_markdown, points)
where not exists (
  select 1 from public.exercise_questions as existing where existing.id = seed.id::uuid
);

insert into public.exercise_options (id, question_id, position, label)
select
  seed.id::uuid,
  seed.question_id::uuid,
  seed.position,
  seed.label
from (values
  ('33000000-0000-4000-8000-000000000001', '32000000-0000-4000-8000-000000000001', 1, 'To make a harmful effect less severe'),
  ('33000000-0000-4000-8000-000000000002', '32000000-0000-4000-8000-000000000001', 2, 'To measure something precisely'),
  ('33000000-0000-4000-8000-000000000003', '32000000-0000-4000-8000-000000000001', 3, 'To remove every limitation'),
  ('33000000-0000-4000-8000-000000000004', '32000000-0000-4000-8000-000000000002', 1, 'coherent'),
  ('33000000-0000-4000-8000-000000000005', '32000000-0000-4000-8000-000000000002', 2, 'compelling'),
  ('33000000-0000-4000-8000-000000000006', '32000000-0000-4000-8000-000000000002', 3, 'prevalent'),
  ('33000000-0000-4000-8000-000000000007', '32000000-0000-4000-8000-000000000002', 4, 'limited'),
  ('33000000-0000-4000-8000-000000000008', '32000000-0000-4000-8000-000000000003', 1, 'True'),
  ('33000000-0000-4000-8000-000000000009', '32000000-0000-4000-8000-000000000003', 2, 'False'),
  ('33000000-0000-4000-8000-000000000010', '32000000-0000-4000-8000-000000000005', 1, 'The number of applicants increases each year.'),
  ('33000000-0000-4000-8000-000000000011', '32000000-0000-4000-8000-000000000005', 2, 'The number of applicants increase each year.'),
  ('33000000-0000-4000-8000-000000000012', '32000000-0000-4000-8000-000000000005', 3, 'A range of options is available to students.'),
  ('33000000-0000-4000-8000-000000000013', '32000000-0000-4000-8000-000000000006', 1, 'The study offers a useful explanation.'),
  ('33000000-0000-4000-8000-000000000014', '32000000-0000-4000-8000-000000000006', 2, 'Education can improve social mobility.'),
  ('33000000-0000-4000-8000-000000000015', '32000000-0000-4000-8000-000000000006', 3, 'The education is always a solution.'),
  ('33000000-0000-4000-8000-000000000016', '32000000-0000-4000-8000-000000000006', 4, 'A evidence supports the claim.'),
  ('33000000-0000-4000-8000-000000000017', '32000000-0000-4000-8000-000000000007', 1, 'True'),
  ('33000000-0000-4000-8000-000000000018', '32000000-0000-4000-8000-000000000007', 2, 'False')
) as seed (id, question_id, position, label)
where not exists (
  select 1 from public.exercise_options as existing where existing.id = seed.id::uuid
);

insert into private.exercise_answer_keys (question_id, case_sensitive, explanation_markdown)
select
  seed.question_id::uuid,
  seed.case_sensitive,
  seed.explanation_markdown
from (values
  ('32000000-0000-4000-8000-000000000001', false, '**Mitigate** means to reduce the severity or impact of something harmful.'),
  ('32000000-0000-4000-8000-000000000002', false, '**Coherent** describes clear logical organization; **compelling** describes something persuasive.'),
  ('32000000-0000-4000-8000-000000000003', false, '**Allocate** commonly means to assign or distribute a resource for a purpose.'),
  ('32000000-0000-4000-8000-000000000004', false, '**Mitigate** fits because planning can reduce the risk rather than remove it completely.'),
  ('32000000-0000-4000-8000-000000000005', false, 'The head noun **number** is singular, so it takes **increases**.'),
  ('32000000-0000-4000-8000-000000000006', false, 'Use **a** for one non-specific countable explanation. General abstract **education** takes no article here.'),
  ('32000000-0000-4000-8000-000000000007', false, 'Uncountable nouns usually do not take **a/an**. Their determiner depends on meaning and context.'),
  ('32000000-0000-4000-8000-000000000008', false, 'The singular subject **evidence** takes the singular verb **suggests**.')
) as seed (question_id, case_sensitive, explanation_markdown)
where not exists (
  select 1
  from private.exercise_answer_keys as existing
  where existing.question_id = seed.question_id::uuid
);

insert into private.exercise_correct_options (question_id, option_id)
select seed.question_id::uuid, seed.option_id::uuid
from (values
  ('32000000-0000-4000-8000-000000000001', '33000000-0000-4000-8000-000000000001'),
  ('32000000-0000-4000-8000-000000000002', '33000000-0000-4000-8000-000000000004'),
  ('32000000-0000-4000-8000-000000000002', '33000000-0000-4000-8000-000000000005'),
  ('32000000-0000-4000-8000-000000000003', '33000000-0000-4000-8000-000000000008'),
  ('32000000-0000-4000-8000-000000000005', '33000000-0000-4000-8000-000000000010'),
  ('32000000-0000-4000-8000-000000000006', '33000000-0000-4000-8000-000000000013'),
  ('32000000-0000-4000-8000-000000000006', '33000000-0000-4000-8000-000000000014'),
  ('32000000-0000-4000-8000-000000000007', '33000000-0000-4000-8000-000000000018')
) as seed (question_id, option_id)
where not exists (
  select 1
  from private.exercise_correct_options as existing
  where existing.question_id = seed.question_id::uuid
    and existing.option_id = seed.option_id::uuid
);

insert into private.exercise_correct_text_answers (
  question_id, answer_text, normalized_answer
)
select seed.question_id::uuid, seed.answer_text, seed.normalized_answer
from (values
  ('32000000-0000-4000-8000-000000000004', 'mitigate', 'mitigate'),
  ('32000000-0000-4000-8000-000000000008', 'suggests', 'suggests')
) as seed (question_id, answer_text, normalized_answer)
where not exists (
  select 1
  from private.exercise_correct_text_answers as existing
  where existing.question_id = seed.question_id::uuid
    and existing.normalized_answer = seed.normalized_answer
);

update public.exercise_set_versions
set status = 'published', published_at = '2026-07-16T00:00:00Z'
where id in (
  '31000000-0000-4000-8000-000000000001',
  '31000000-0000-4000-8000-000000000002'
)
and status = 'draft';

insert into public.vocabulary_entries (
  id, slug, normalized_term, part_of_speech, sense_key, display_order
)
values
  ('40000000-0000-4000-8000-000000000001', 'sustainable', 'sustainable', 'adjective', 'long-term', 1),
  ('40000000-0000-4000-8000-000000000002', 'mitigate', 'mitigate', 'verb', 'reduce-harm', 2),
  ('40000000-0000-4000-8000-000000000003', 'prevalent', 'prevalent', 'adjective', 'widespread', 3),
  ('40000000-0000-4000-8000-000000000004', 'allocate', 'allocate', 'verb', 'assign-resource', 4),
  ('40000000-0000-4000-8000-000000000005', 'compelling', 'compelling', 'adjective', 'persuasive', 5),
  ('40000000-0000-4000-8000-000000000006', 'coherent', 'coherent', 'adjective', 'logical', 6),
  ('40000000-0000-4000-8000-000000000007', 'constraint', 'constraint', 'noun', 'limitation', 7),
  ('40000000-0000-4000-8000-000000000008', 'evaluate', 'evaluate', 'verb', 'assess', 8)
on conflict (id) do nothing;

insert into public.vocabulary_entry_versions (
  id, vocabulary_entry_id, version, term, definition_vi, example_sentence,
  topic, tags, difficulty, status, related_exercise_set_id
)
values
  ('41000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 1, 'sustainable', 'có thể duy trì lâu dài mà không làm cạn kiệt nguồn lực', 'The city needs a sustainable transport plan that remains affordable over time.', 'environment', array['academic', 'policy'], 'beginner', 'draft', '30000000-0000-4000-8000-000000000001'),
  ('41000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 1, 'mitigate', 'làm giảm mức độ nghiêm trọng hoặc tác hại', 'Early intervention can mitigate the effects of prolonged learning loss.', 'society', array['academic', 'cause-effect'], 'intermediate', 'draft', '30000000-0000-4000-8000-000000000001'),
  ('41000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000003', 1, 'prevalent', 'phổ biến hoặc thường gặp trong một nhóm hay khu vực', 'Remote work is increasingly prevalent in knowledge-based industries.', 'work', array['academic', 'trend'], 'intermediate', 'draft', '30000000-0000-4000-8000-000000000001'),
  ('41000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000004', 1, 'allocate', 'phân bổ nguồn lực cho một mục đích cụ thể', 'Schools should allocate enough time to guided reading practice.', 'education', array['academic', 'resource'], 'beginner', 'draft', '30000000-0000-4000-8000-000000000001'),
  ('41000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000005', 1, 'compelling', 'thuyết phục mạnh nhờ lý lẽ hoặc bằng chứng rõ', 'The writer presents a compelling case for safer public spaces.', 'writing', array['argument', 'evaluation'], 'intermediate', 'draft', '30000000-0000-4000-8000-000000000001'),
  ('41000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-000000000006', 1, 'coherent', 'mạch lạc, có các ý kết nối theo trình tự hợp lý', 'A coherent paragraph develops one central idea from start to finish.', 'writing', array['cohesion', 'argument'], 'beginner', 'draft', '30000000-0000-4000-8000-000000000001'),
  ('41000000-0000-4000-8000-000000000007', '40000000-0000-4000-8000-000000000007', 1, 'constraint', 'điều kiện hoặc giới hạn làm thu hẹp lựa chọn', 'Limited funding is a major constraint on the research programme.', 'research', array['academic', 'limitation'], 'intermediate', 'draft', '30000000-0000-4000-8000-000000000001'),
  ('41000000-0000-4000-8000-000000000008', '40000000-0000-4000-8000-000000000008', 1, 'evaluate', 'đánh giá chất lượng hoặc giá trị dựa trên tiêu chí', 'Readers should evaluate whether each claim is supported by evidence.', 'study-skills', array['academic', 'critical-thinking'], 'beginner', 'draft', '30000000-0000-4000-8000-000000000001')
on conflict (id) do nothing;

update public.vocabulary_entry_versions
set status = 'published', published_at = '2026-07-16T00:00:00Z'
where id between '41000000-0000-4000-8000-000000000001' and '41000000-0000-4000-8000-000000000008'
and status = 'draft';

insert into public.grammar_topics (id, slug, display_order)
values
  ('50000000-0000-4000-8000-000000000001', 'subject-verb-agreement', 1),
  ('50000000-0000-4000-8000-000000000002', 'articles-in-academic-writing', 2),
  ('50000000-0000-4000-8000-000000000003', 'controlled-complex-sentences', 3)
on conflict (id) do nothing;

insert into public.grammar_topic_versions (
  id, grammar_topic_id, version, title, explanation_markdown, examples,
  common_mistakes, difficulty, status, related_exercise_set_id
)
values
  (
    '51000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    1,
    'Subject-verb agreement',
    'Find the **head noun** of the subject before choosing the verb. Extra phrases between the subject and verb do not change the number of the head noun.',
    '[{"correct":"The number of applicants increases each year.","note":"The head noun number is singular."},{"correct":"A range of options is available.","note":"Range is the head noun."}]'::jsonb,
    '[{"wrong":"The number of applicants increase each year.","correction":"Use increases because number is singular."}]'::jsonb,
    'beginner',
    'draft',
    '30000000-0000-4000-8000-000000000002'
  ),
  (
    '51000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000002',
    1,
    'Articles in academic writing',
    'Use **a/an** for one non-specific countable noun, **the** for a specific or already identified noun, and no article for many general plural or uncountable ideas.',
    '[{"correct":"The study offers a useful explanation.","note":"Explanation is singular and non-specific."},{"correct":"Education can improve mobility.","note":"Education is a general uncountable idea."}]'::jsonb,
    '[{"wrong":"A evidence supports the claim.","correction":"Evidence is uncountable; do not use a."}]'::jsonb,
    'beginner',
    'draft',
    '30000000-0000-4000-8000-000000000002'
  ),
  (
    '51000000-0000-4000-8000-000000000003',
    '50000000-0000-4000-8000-000000000003',
    1,
    'Controlled complex sentences',
    'A complex sentence needs one independent clause and at least one dependent clause. Choose the relationship first, then use a connector that expresses it accurately.',
    '[{"correct":"Although the policy is costly, it may reduce long-term demand.","note":"Although introduces a contrast clause."},{"correct":"Cities invest in transit because congestion is expensive.","note":"Because introduces a reason."}]'::jsonb,
    '[{"wrong":"Although the policy is costly. It may reduce demand.","correction":"Join the dependent clause to the independent clause."}]'::jsonb,
    'intermediate',
    'draft',
    '30000000-0000-4000-8000-000000000002'
  )
on conflict (id) do nothing;

update public.grammar_topic_versions
set status = 'published', published_at = '2026-07-16T00:00:00Z'
where id between '51000000-0000-4000-8000-000000000001' and '51000000-0000-4000-8000-000000000003'
and status = 'draft';
