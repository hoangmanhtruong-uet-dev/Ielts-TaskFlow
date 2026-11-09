/**
 * Ingestion Script: Seed 20 Lessons, 120 Questions (20 Exercise Sets x 6 questions),
 * and 10 Grammar Topics into Supabase Migration & Seed SQL.
 *
 * Follows:
 * - CONTENT_OPERATIONS.md
 * - Plan Go-Live v1.0.2
 * - Phase 4 & Phase 5 Database Schema
 */

import { writeFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const OUTPUT_MIGRATION = resolve(
  ROOT,
  "supabase/migrations/20261025000000_seed_mvp_learning_curriculum.sql",
);
const SEED_FILE = resolve(ROOT, "supabase/seed.sql");

// Helper to escape single quotes in SQL strings
function esc(str) {
  if (str === null || str === undefined) return "''";
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function escJson(obj) {
  return esc(JSON.stringify(obj)) + "::jsonb";
}

// 4 Learning Modules
const MODULES = [
  {
    id: "10000000-0000-4000-c000-000000000001",
    slug: "ielts-foundations",
    title: "IELTS Foundations & Test Architecture",
    description:
      "Nắm vững toàn diện cấu trúc 4 kỹ năng bài thi IELTS, tiêu chí chấm điểm Cambridge, kỹ thuật làm bài thi trên máy và phương pháp ghi nhận lỗi sai chủ động.",
    skill: "foundations",
    test_type: "both",
    difficulty: "beginner",
    display_order: 1,
    estimated_minutes: 120,
  },
  {
    id: "10000000-0000-4000-c000-000000000002",
    slug: "academic-grammar",
    title: "Academic Grammar Mastery",
    description:
      "Làm chủ ngữ pháp học thuật trọng điểm: sự hòa hợp chủ-vị phức tạp, câu ghép-câu phức, mệnh đề quan hệ rút gọn, thể bị động học thuật, đảo ngữ và phương tiện liên kết Cohesion.",
    skill: "grammar",
    test_type: "academic",
    difficulty: "intermediate",
    display_order: 2,
    estimated_minutes: 150,
  },
  {
    id: "10000000-0000-4000-c000-000000000003",
    slug: "academic-vocabulary",
    title: "Essential Academic Vocabulary & Collocations",
    description:
      "Bộ từ vựng học thuật C1/C2 theo 4 chủ đề lớn: Môi trường & Khí hậu, Đô thị & Công nghệ, Giáo dục & Việc làm, Xã hội toàn cầu hóa, kèm các cặp Collocations ăn điểm Lexical Resource.",
    skill: "vocabulary",
    test_type: "academic",
    difficulty: "intermediate",
    display_order: 3,
    estimated_minutes: 150,
  },
  {
    id: "10000000-0000-4000-c000-000000000004",
    slug: "core-strategies",
    title: "Core Exam Strategies & Trap Avoidance",
    description:
      "Chiến thuật thực chiến đỉnh cao: Giải mã bẫy True/False/Not Given, Matching Headings, nhận diện Paraphrase trong Listening, tư duy phát triển ý Writing Task 2 và phản xạ lưu loát Speaking.",
    skill: "foundations",
    test_type: "academic",
    difficulty: "advanced",
    display_order: 4,
    estimated_minutes: 140,
  },
];

// 20 Lessons Data with Full Markdown Sections and 6-Question Exercise Sets
const LESSONS = [
  // Module 1 (Lessons 1-5)
  {
    moduleId: MODULES[0].id,
    lessonNum: 1,
    slug: "cau-truc-4-ky-nang-cambridge",
    title: "Cấu trúc 4 kỹ năng & Tiêu chuẩn chấm điểm Cambridge IELTS",
    summary:
      "Hiểu rõ format từng kỹ năng thi, số lượng câu hỏi, thời gian quy định và sự khác biệt giữa Academic và General Training.",
    difficulty: "beginner",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Tổng quan cấu trúc bài thi IELTS chuẩn quốc tế",
        body: "Bài thi IELTS bao gồm 4 kỹ năng bắt buộc: **Listening (30 phút + 10 phút chuyển đáp án hoặc 2 phút kiểm tra trên máy)**, **Reading (60 phút - 40 câu)**, **Writing (60 phút - 2 Tasks)**, và **Speaking (11-14 phút)**. Điểm tổng (Overall Band Score) là trung bình cộng của 4 kỹ năng, làm tròn tới 0.5 gần nhất.\n\nTrong bài thi Academic, phần Reading bao gồm 3 bài đọc học thuật dài với tổng cộng 40 câu hỏi, trong khi Writing gồm Task 1 (báo cáo dữ liệu đồ thị) và Task 2 (bài luận nghị luận xã hội).",
      },
      {
        type: "example",
        title: "Quy tắc làm tròn điểm Overall",
        body: "- Nghe: 6.5, Đọc: 6.5, Viết: 6.0, Nói: 6.0 → Trung bình: 6.25 → Làm tròn lên **Band 6.5**.\n- Nghe: 6.5, Đọc: 6.0, Viết: 6.0, Nói: 6.0 → Trung bình: 6.125 → Làm tròn xuống **Band 6.0**.\n- Nghe: 7.0, Đọc: 7.5, Viết: 6.5, Nói: 6.0 → Trung bình: 6.75 → Làm tròn lên **Band 7.0**.",
      },
      {
        type: "checklist",
        title: "Quy tắc vàng trước khi bắt đầu luyện thi",
        body: "1. Xác định chính xác mục tiêu: Academic (du học, nghiên cứu) hay General Training (định cư, việc làm).\n2. Ghi nhớ thời gian thi từng phần: Listening và Reading không có giải lao giữa giờ.\n3. Đối với bài thi máy tính (Computer-delivered), thời gian đọc và kiểm tra đáp án khác với bài thi giấy.",
      },
    ],
    exercise: {
      slug: "ex-cau-truc-4-ky-nang",
      title: "Luyện tập: Cấu trúc 4 kỹ năng & Cách tính điểm",
      summary:
        "Kiểm tra độ hiểu về format đề thi IELTS, cách làm tròn điểm và phân bổ thời gian chuẩn.",
      domain: "grammar",
      difficulty: "beginner",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Tổng thời gian làm bài chính thức của kỹ năng Reading trong kỳ thi IELTS là bao nhiêu phút?",
          options: ["45 phút", "60 phút", "75 phút", "90 phút"],
          correctOptionIndex: 1,
          explanation:
            "Phần thi IELTS Reading kéo dài chính xác 60 phút cho cả 3 bài đọc với 40 câu hỏi, không có thêm thời gian chuyển đáp án.",
        },
        {
          type: "single_choice",
          prompt:
            "Nếu thí sinh có điểm các kỹ năng: L: 6.5, R: 7.0, W: 6.0, S: 6.5, điểm Overall sẽ là bao nhiêu?",
          options: ["6.0", "6.5", "7.0", "6.25"],
          correctOptionIndex: 1,
          explanation:
            "Trung bình cộng là (6.5 + 7.0 + 6.0 + 6.5) / 4 = 6.5. Điểm Overall chính thức là 6.5.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 kỹ năng thi diễn ra liên tục KHÔNG có thời gian nghỉ giữa giờ trong buổi thi chính thức:",
          options: ["Listening", "Reading", "Speaking", "Interview"],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "Ba phần thi Listening, Reading và Writing diễn ra liên tiếp trong 2 giờ 45 phút mà không có giải lao giữa giờ.",
        },
        {
          type: "true_false",
          prompt:
            "Bài thi IELTS Academic Writing Task 1 yêu cầu viết thư gửi một người bạn hoặc cơ quan chức năng.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. Viết thư là yêu cầu của IELTS General Training Task 1. Academic Task 1 yêu cầu mô tả và phân tích biểu đồ, bản đồ hoặc quy trình.",
        },
        {
          type: "short_text",
          prompt:
            "Điền từ thích hợp: Điểm trung bình cộng kết thúc bằng đuôi .25 hoặc .75 sẽ được làm tròn ___ lên mức nửa band tiếp theo.",
          correctAnswer: "up",
          explanation:
            "Theo quy chế chấm điểm IELTS, đuôi .25 làm tròn lên .5, và đuôi .75 làm tròn lên 1.0 (round up).",
        },
        {
          type: "short_text",
          prompt:
            "Tổng số câu hỏi trong toàn bộ bài thi IELTS Listening là bao nhiêu câu? (Nhập số)",
          correctAnswer: "40",
          explanation:
            "IELTS Listening có 4 phần (Parts) với tổng cộng đúng 40 câu hỏi.",
        },
      ],
    },
  },

  {
    moduleId: MODULES[0].id,
    lessonNum: 2,
    slug: "phan-tich-band-descriptors",
    title: "Phân tích Band Descriptors (Từ 5.0 lên 7.0+ cần gì?)",
    summary:
      "Bóc tách 4 tiêu chí chấm điểm Writing và Speaking: Task Achievement/Response, Coherence & Cohesion, Lexical Resource, và Grammatical Range & Accuracy.",
    difficulty: "beginner",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Bản chất của 4 tiêu chí chấm điểm IELTS chính thức",
        body: "Giám khảo IELTS chấm điểm Writing và Speaking dựa trên bảng tiêu chí công khai (Band Descriptors):\n- **Task Achievement (Task 1) / Task Response (Task 2)**: Trả lời đầy đủ các phần của đề bài, có lập trường rõ ràng xuyên suốt.\n- **Coherence & Cohesion (CC)**: Bố cục đoạn hợp lý, ý tưởng phát triển tuần tự, sử dụng liên từ tự nhiên không gượng ép.\n- **Lexical Resource (LR)**: Vốn từ rộng, dùng từ ngữ học thuật chính xác theo ngữ cảnh, có collocations và nhận thức về phong cách trang trọng.\n- **Grammatical Range & Accuracy (GRA)**: Sử dụng linh hoạt nhiều kiểu câu (đơn, ghép, phức) với tỉ lệ câu không mắc lỗi cao.",
      },
      {
        type: "example",
        title:
          "Sự khác biệt giữa Band 6.0 và Band 7.0 trong tiêu chí Lexical Resource",
        body: "- **Band 6.0**: Sử dụng vốn từ đủ để diễn đạt ý nhưng còn lặp từ, thỉnh thoảng dùng collocations sai ngữ cảnh hoặc mắc lỗi chính tả nhỏ không cản trở thông điệp.\n- **Band 7.0**: Sử dụng linh hoạt các từ vựng ít phổ biến (less common vocabulary), nắm chắc phong cách diễn đạt và collocations, hiếm khi mắc lỗi lựa chọn từ.",
      },
      {
        type: "tip",
        title: "Cách tối ưu điểm Grammatical Range",
        body: "Để đạt Band 7.0+ GRA, bạn không cần phải cố viết toàn những câu cực dài 50 từ. Điều quan trọng là sự đa dạng cấu trúc (mệnh đề quan hệ, thể bị động, câu điều kiện, cấu trúc đảo ngữ) và bảo đảm hơn 50% số câu hoàn toàn không có lỗi ngữ pháp (error-free sentences).",
      },
    ],
    exercise: {
      slug: "ex-phan-tich-band-descriptors",
      title: "Luyện tập: Tiêu chí chấm điểm Band Descriptors",
      summary:
        "Nhận diện yêu cầu cụ thể của từng tiêu chí chấm thi IELTS Writing & Speaking.",
      domain: "grammar",
      difficulty: "beginner",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Tiêu chí nào trong IELTS Writing đánh giá việc sử dụng liên từ và tính mạch lạc của các đoạn văn?",
          options: [
            "Task Response",
            "Coherence & Cohesion",
            "Lexical Resource",
            "Grammatical Range",
          ],
          correctOptionIndex: 1,
          explanation:
            "Coherence & Cohesion (CC) đánh giá tính mạch lạc của bài viết và sự liên kết logic giữa các câu, các đoạn.",
        },
        {
          type: "single_choice",
          prompt:
            "Để đạt Band 7.0 tiêu chí Grammatical Range & Accuracy, yêu cầu cốt lõi nào sau đây là bắt buộc?",
          options: [
            "100% các câu phải là câu ghép",
            "Đa phần các câu phải không có lỗi ngữ pháp (error-free sentences)",
            "Không được sử dụng thì hiện tại đơn",
            "Mỗi câu phải dài tối thiểu 30 từ",
          ],
          correctOptionIndex: 1,
          explanation:
            "Band 7.0 GRA yêu cầu người viết thường xuyên tạo ra các câu không có lỗi ngữ pháp ('frequent error-free sentences').",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 yếu tố thuộc tiêu chí Lexical Resource (LR) giúp tăng điểm từ 6.0 lên 7.0+:",
          options: [
            "Sử dụng collocations chính xác theo ngữ cảnh",
            "Sử dụng các từ vựng ít phổ biến (less common lexical items)",
            "Nói với tốc độ thật nhanh bất kể phát âm",
            "Tránh hoàn toàn việc sử dụng đại từ nhân xưng",
          ],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "Lexical Resource 7.0 nhấn mạnh việc dùng từ vựng ít phổ biến và thể hiện nhận thức về collocations cũng như phong cách học thuật.",
        },
        {
          type: "true_false",
          prompt:
            "Trong IELTS Writing Task 2, việc không đưa ra quan điểm rõ ràng ở phần kết luận vẫn có thể đạt Band 8.0 Task Response.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. Để đạt Band 7.0+ Task Response, bài viết bắt buộc phải thể hiện lập trường rõ ràng xuyên suốt bài viết ('a clear position throughout').",
        },
        {
          type: "short_text",
          prompt:
            "Viết tên viết tắt của tiêu chí đánh giá độ mạch lạc và liên kết trong bài viết IELTS Writing: ___ (2 chữ cái)",
          correctAnswer: "CC",
          explanation: "Coherence and Cohesion thường được viết tắt là CC.",
        },
        {
          type: "short_text",
          prompt:
            "Viết tên viết tắt của tiêu chí đánh giá vốn từ vựng học thuật trong IELTS: ___ (2 chữ cái)",
          correctAnswer: "LR",
          explanation: "Lexical Resource thường được viết tắt là LR.",
        },
      ],
    },
  },

  {
    moduleId: MODULES[0].id,
    lessonNum: 3,
    slug: "chien-luoc-quan-ly-thoi-gian-thi-may",
    title: "Quản lý thời gian thi máy (Computer-delivered IELTS)",
    summary:
      "Nắm vững kỹ thuật thao tác trên giao diện thi máy: highlight, note, split-screen, phím tắt và chiến thuật chia thời gian 20-40 phút.",
    difficulty: "beginner",
    estimated_minutes: 20,
    sections: [
      {
        type: "text",
        title: "Lợi thế và thách thức khi thi IELTS trên máy tính",
        body: "Thi IELTS trên máy tính ngày càng phổ biến nhờ kết quả nhanh (1-5 ngày) và tai nghe riêng biệt. Tuy nhiên, thí sinh phải làm quen với việc đọc trên màn hình máy tính liên tục 60 phút và kỹ năng gõ phím.\n\nTrong phần Reading, giao diện chia làm 2 cột: Cột trái là văn bản bài đọc, cột phải là phiếu câu hỏi. Bạn có thể bôi đen (highlight) và thêm ghi chú (note) trực tiếp trên văn bản.",
      },
      {
        type: "example",
        title: "Quy tắc phân bổ thời gian chuẩn trong IELTS Reading",
        body: "- **Passage 1**: 15 - 17 phút (Dạng bài dễ nhất, mục tiêu lấy trọn điểm).\n- **Passage 2**: 20 phút (Độ khó trung bình, chủ đề nghiên cứu hoặc sự kiện văn hóa).\n- **Passage 3**: 23 - 25 phút (Bài đọc học thuật trừu tượng nhất, lập luận phức tạp).\n- Tuyệt đối không dành quá 20 phút cho Passage 1 khiến Passage 3 không kịp làm bài.",
      },
      {
        type: "checklist",
        title: "Checklist phím tắt và thao tác trên máy",
        body: "1. `Ctrl + C` và `Ctrl + V` dùng được trong bài thi Writing.\n2. Phím `Tab` để di chuyển nhanh giữa các ô điền từ trong Listening và Reading.\n3. Nhấp chuột phải để Highlight từ khóa và chọn Note để ghi chú ý nghĩa.",
      },
    ],
    exercise: {
      slug: "ex-quan-ly-thoi-gian-thi-may",
      title: "Luyện tập: Kỹ thuật và Thời gian thi máy tính",
      summary:
        "Kiểm tra kiến thức về giao diện thi máy và chiến thuật phân bổ thời gian từng phần.",
      domain: "grammar",
      difficulty: "beginner",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Trong kỳ thi IELTS Academic Writing, thời gian đề xuất hợp lý nhất cho Task 1 và Task 2 là:",
          options: [
            "Task 1: 30 phút, Task 2: 30 phút",
            "Task 1: 20 phút, Task 2: 40 phút",
            "Task 1: 15 phút, Task 2: 45 phút",
            "Task 1: 10 phút, Task 2: 50 phút",
          ],
          correctOptionIndex: 1,
          explanation:
            "Task 2 chiếm 2/3 tổng số điểm Writing, do đó phân bổ chuẩn là 20 phút cho Task 1 và 40 phút cho Task 2.",
        },
        {
          type: "single_choice",
          prompt:
            "Sau khi kết thúc 4 phần thi Listening trên máy tính, thí sinh có bao nhiêu phút để kiểm tra lại câu trả lời?",
          options: ["10 phút", "5 phút", "2 phút", "Không có thời gian"],
          correctOptionIndex: 2,
          explanation:
            "Khác với thi giấy có 10 phút chép đáp án, thi máy tính chỉ có 2 phút để xem lại toàn bộ câu trả lời trước khi hệ thống khóa bài.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 thao tác có sẵn trên giao diện thi IELTS Reading trên máy tính:",
          options: [
            "Highlight văn bản bài đọc",
            "Tạo Note ghi chú bên cạnh",
            "Sử dụng công cụ dịch tự động Google",
            "Chụp ảnh màn hình lưu vào máy",
          ],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "Hệ thống thi máy cho phép thí sinh bôi đen văn bản (Highlight) và thêm ghi chú (Note) bằng cách nhấp chuột phải.",
        },
        {
          type: "true_false",
          prompt:
            "Trong bài thi máy, đồng hồ đếm ngược trên màn hình sẽ chuyển sang màu đỏ và nhấp nháy khi còn 10 phút và 5 phút cuối cùng.",
          options: ["True", "False"],
          correctOptionIndex: 0,
          explanation:
            "True. Đồng hồ trên phần mềm thi chính thức sẽ cảnh báo màu đỏ khi thời gian còn lại dưới 10 phút và 5 phút.",
        },
        {
          type: "short_text",
          prompt:
            "Điền phím trên bàn phím giúp chuyển nhanh sang ô điền câu trả lời kế tiếp trong bài thi máy: phím ___",
          correctAnswer: "tab",
          explanation:
            "Phím Tab cho phép nhảy nhanh sang trường nhập liệu tiếp theo mà không cần dùng chuột.",
        },
        {
          type: "short_text",
          prompt:
            "Thời gian tối đa (phút) khuyến nghị dành cho Passage 1 trong IELTS Reading để không bị thiếu giờ ở Passage 3: ___ phút",
          correctAnswer: "17",
          explanation:
            "Khuyến nghị không dành quá 17 phút cho Passage 1 để đảm bảo đủ thời gian cho Passage 3 phức tạp hơn.",
        },
      ],
    },
  },

  {
    moduleId: MODULES[0].id,
    lessonNum: 4,
    slug: "ky-thuat-ghi-chep-kiem-soat-loi-sai",
    title: "Kỹ thuật ghi chép và kiểm soát lỗi sai (Active Error-Logging)",
    summary:
      "Xây dựng sổ tay lỗi sai cá nhân hóa: phân loại lỗi do từ vựng, ngữ pháp, bẫy logic hay bất cẩn để chặn đứng việc lặp lại lỗi sai.",
    difficulty: "beginner",
    estimated_minutes: 20,
    sections: [
      {
        type: "text",
        title: "Vì sao luyện nhiều đề không tăng điểm nếu thiếu Error Log?",
        body: "Nhiều người học làm hàng chục bộ đề Cam nhưng điểm số vẫn giậm chân tại chỗ. Lý do là họ chỉ chấm điểm lấy số đúng mà không phân tích nguyên nhân vì sao sai. Phương pháp **Active Error-Logging** yêu cầu bạn ghi lại mọi câu sai vào sổ tay với 4 thông tin bắt buộc:\n1. Câu hỏi và đáp án bạn đã chọn.\n2. Đáp án đúng của bài.\n3. Bằng chứng trích xuất từ bài đọc/bài nghe (Evidence).\n4. Phân loại nguyên nhân sai (Error Taxonomy).",
      },
      {
        type: "example",
        title: "Bảng phân loại nguyên nhân sai chuẩn Cambridge",
        body: "- **Lỗi từ vựng (Vocabulary Gap)**: Không biết nghĩa của từ hoặc từ bị paraphrase.\n- **Lỗi bẫy logic (Logic / Trap)**: Nhầm lẫn giữa False (thông tin mâu thuẫn) và Not Given (thông tin không đề cập).\n- **Lỗi chính tả/Ngữ pháp (Spelling/Grammar)**: Quên thêm số nhiều `-s`, viết sai chính tả từ quen thuộc.\n- **Lỗi định vị (Locating Failure)**: Tìm sai đoạn văn chứa thông tin do bám vào từ khóa bẫy.",
      },
      {
        type: "tip",
        title: "Quy tắc 24 giờ xem lại",
        body: "Sau khi ghi nhận một câu sai vào Sổ tay lỗi sai (Error Notebook), hãy đặt lịch làm lại đúng câu hỏi đó sau 24-48 giờ mà không nhìn vào đáp án. Nếu bạn giải thích được bằng chứng tại sao đáp án đó đúng, bạn đã thực sự làm chủ kiến thức.",
      },
    ],
    exercise: {
      slug: "ex-ky-thuat-ghi-chep-loi-sai",
      title: "Luyện tập: Phân loại lỗi sai và Phân tích dẫn chứng",
      summary:
        "Rèn luyện kỹ năng phân loại lỗi sai và trích xuất bằng chứng khách quan trong bài thi.",
      domain: "grammar",
      difficulty: "beginner",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Trong kỹ thuật Active Error-Logging, bước quan trọng nhất sau khi làm sai một câu hỏi là:",
          options: [
            "Xóa bài làm và làm lại đề khác ngay lập tức",
            "Đối chiếu transcript/bài đọc để tìm đúng câu chứa bằng chứng và phân loại nguyên nhân sai",
            "Học thuộc lòng cả đoạn văn",
            "Đoán xem đề thi thật có ra câu này không",
          ],
          correctOptionIndex: 1,
          explanation:
            "Phân tích câu chứa bằng chứng và tìm ra lý do khiến mình mắc bẫy là cốt lõi để không lặp lại lỗi sai.",
        },
        {
          type: "single_choice",
          prompt:
            "Thí sinh nghe được từ 'library' nhưng khi viết vào phiếu trả lời lại viết thành 'libary'. Đây là loại lỗi nào?",
          options: [
            "Vocabulary Gap",
            "Spelling Mistake",
            "Distractor Trap",
            "Locating Failure",
          ],
          correctOptionIndex: 1,
          explanation:
            "Đây là lỗi chính tả (Spelling Mistake) do thiếu chữ 'r', khiến câu trả lời bị chấm 0 điểm dù đã nghe đúng.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 việc cần ghi lại trong Sổ tay lỗi sai (Error Notebook) hiệu quả:",
          options: [
            "Đoạn văn trích dẫn chứng (Evidence quote)",
            "Quy tắc phòng ngừa để không tái phạm lần sau",
            "Điểm số của các thí sinh khác cùng thi",
            "Màu mực viết bút bi khi làm bài",
          ],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "Evidence trích dẫn và bài học rút ra phòng ngừa lỗi là 2 yếu tố trọng tâm của một cuốn error log chất lượng.",
        },
        {
          type: "true_false",
          prompt:
            "Nếu không biết nghĩa của từ khóa chính trong câu hỏi, ta nên bỏ trống thay vì vận dụng ngữ cảnh xung quanh để suy đoán.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. Luôn vận dụng ngữ cảnh (context clues) và không bao giờ bỏ trống bất kỳ câu trả lời nào trong kỳ thi IELTS vì không bị trừ điểm câu sai.",
        },
        {
          type: "short_text",
          prompt:
            "Điền thuật ngữ chỉ từ gây xao nhãng làm thí sinh chọn nhầm đáp án trong bài nghe Listening: ___ (1 từ)",
          correctAnswer: "distractor",
          explanation:
            "Distractor là từ/ý gây nhiễu, thường xuất hiện trước khi người nói sửa lại thông tin chính xác.",
        },
        {
          type: "short_text",
          prompt:
            "Phần thi IELTS không áp dụng việc trừ điểm khi chọn sai, do đó thí sinh nên điền đáp án cho bao nhiêu phần trăm câu hỏi? (Nhập số kèm dấu % hoặc chỉ số: 100)",
          correctAnswer: "100",
          explanation:
            "Thí sinh phải trả lời 100% các câu hỏi, kể cả phỏng đoán ở những câu không chắc chắn.",
        },
      ],
    },
  },

  {
    moduleId: MODULES[0].id,
    lessonNum: 5,
    slug: "chien-luoc-skimming-va-scanning",
    title: "Chiến lược đọc lướt định vị (Skimming & Scanning Protocol)",
    summary:
      "Phân biệt rõ ràng giữa Skimming (đọc nắm ý chính cấu trúc) và Scanning (quét tìm định vị dữ liệu cụ thể) để tối ưu tốc độ đọc hiểu.",
    difficulty: "beginner",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Bản chất của Skimming vs Scanning",
        body: "- **Skimming (Đọc lướt)**: Là kỹ thuật đọc nhanh với tốc độ 300-400 từ/phút nhằm nắm được chủ đề tổng quan, cấu trúc phát triển của văn bản và ý chính của từng đoạn (thường nằm ở Topic Sentence - câu đầu hoặc câu cuối đoạn).\n- **Scanning (Đọc quét)**: Là thao tác di chuyển mắt có định hướng để tìm kiếm các dữ liệu cụ thể như tên riêng, con số, mốc năm, thuật ngữ viết hoa hoặc từ đồng nghĩa với câu hỏi mà không cần đọc hiểu toàn bộ câu xung quanh.",
      },
      {
        type: "example",
        title: "Khi nào dùng Skimming, khi nào dùng Scanning?",
        body: "- **Dùng Skimming**: Cho dạng bài *Matching Headings* (Nối tiêu đề đoạn) hoặc *Main Idea* (Ý chính của bài viết).\n- **Dùng Scanning**: Cho dạng bài *Sentence Completion* (Điền từ), *Short Answer Questions* hoặc *Table/Flowchart Completion* nơi bạn cần tìm chính xác một dữ liệu cụ thể.",
      },
      {
        type: "warning",
        title: "Cảnh báo bẫy trùng khớp từ vựng (Word-matching trap)",
        body: "Trong IELTS Reading, câu chứa từ khóa trùng khớp 100% với đề bài thường là **BẪY**. Đáp án đúng hầu như luôn được diễn đạt bằng **Paraphrase** (từ đồng nghĩa hoặc thay đổi cấu trúc ngữ pháp). Đừng vội chọn đáp án chỉ vì thấy có từ y hệt trong đề!",
      },
    ],
    exercise: {
      slug: "ex-skimming-va-scanning",
      title: "Luyện tập: Skimming và Scanning trong Reading",
      summary:
        "Kiểm tra kỹ năng chọn đúng thao tác đọc theo dạng câu hỏi và nhận diện bẫy từ khóa.",
      domain: "grammar",
      difficulty: "beginner",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Dạng bài nào sau đây trong IELTS Reading yêu cầu kỹ thuật Skimming để nắm ý chính của toàn đoạn văn?",
          options: [
            "Sentence Completion",
            "Matching Headings",
            "Short-answer Questions",
            "Labelling a diagram",
          ],
          correctOptionIndex: 1,
          explanation:
            "Matching Headings đòi hỏi hiểu ý chính và mục đích của toàn bộ đoạn văn, phù hợp với thao tác Skimming.",
        },
        {
          type: "single_choice",
          prompt:
            "Khi cần tìm năm diễn ra một sự kiện lịch sử trong đoạn văn dài 800 từ, thao tác đọc nào hiệu quả nhất?",
          options: [
            "Đọc kỹ từng câu từ đầu đến cuối",
            "Scanning tìm con số có 4 chữ số",
            "Tra từ điển mọi từ mới",
            "Dịch cả bài sang tiếng Việt",
          ],
          correctOptionIndex: 1,
          explanation:
            "Scanning di chuyển mắt tìm nhanh các ký tự số (ví dụ: 1845, 1999) giúp định vị vị trí câu trả lời trong vài giây.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 loại từ khóa dễ định vị nhất khi thực hiện kỹ thuật Scanning:",
          options: [
            "Tên riêng viết hoa (tên người, địa danh)",
            "Các con số, ngày tháng, tỉ lệ phần trăm",
            "Từ nối chung chung như 'however', 'moreover'",
            "Mạo từ 'the', 'a', 'an'",
          ],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "Tên riêng viết hoa và các con số/thống kê là những 'mỏ neo thị giác' (visual anchors) nổi bật nhất trên trang văn bản.",
        },
        {
          type: "true_false",
          prompt:
            "Nếu một câu trong đoạn văn chứa đúng từ khóa giống hệt đề bài, câu đó chắc chắn chứa đáp án đúng.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. Đây là bẫy phổ biến trong Cambridge. Người ra đề thường đặt từ khóa giống hệt trong câu nhiễu, còn thông tin đúng lại dùng paraphrase.",
        },
        {
          type: "short_text",
          prompt:
            "Điền thuật ngữ chỉ kỹ thuật đọc nhanh để nắm ý chính tổng quát của văn bản: ___ (1 từ tiếng Anh)",
          correctAnswer: "skimming",
          explanation: "Skimming là kỹ thuật đọc lướt nắm ý chính.",
        },
        {
          type: "short_text",
          prompt:
            "Điền thuật ngữ chỉ kỹ thuật rà mắt nhanh để tìm một chi tiết cụ thể như con số hay tên riêng: ___ (1 từ tiếng Anh)",
          correctAnswer: "scanning",
          explanation: "Scanning là kỹ thuật đọc quét định vị chi tiết.",
        },
      ],
    },
  },

  // Module 2 (Lessons 6-10: Academic Grammar)
  {
    moduleId: MODULES[1].id,
    lessonNum: 6,
    slug: "su-hoa-hop-chu-ngu-dong-tu",
    title: "Sự hòa hợp Chủ ngữ - Động từ trong cấu trúc phức tạp",
    summary:
      "Xác định chính xác danh từ trung tâm (head noun) khi có cụm giới từ chen ngang, đại từ bất định và cấu trúc 'The number of' vs 'A number of'.",
    difficulty: "intermediate",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Quy tắc cốt lõi: Tìm Head Noun thực sự của chủ ngữ",
        body: "Lỗi hòa hợp chủ-vị (Subject-Verb Agreement - SVA) là lỗi mất điểm phổ biến nhất trong IELTS Writing và Speaking ở band 5.0-6.0. Nguyên nhân chính là người học bị đánh lừa bởi các cụm từ nằm giữa chủ ngữ chính và động từ.\n\n**Quy tắc:** Hãy loại bỏ các thành phần bổ nghĩa (cụm giới từ, mệnh đề quan hệ rút gọn) để tìm ra **Head Noun** (danh từ trung tâm).",
      },
      {
        type: "example",
        title: "Ví dụ kinh điển về Head Noun",
        body: "- *Câu sai:* The quality of the urban public transport systems have improved.\n- *Phân tích:* Danh từ trung tâm là **The quality** (số ít), cụm 'of the urban public transport systems' chỉ là bổ ngữ giới từ.\n- *Câu đúng:* The quality of the urban public transport systems **has** improved.",
      },
      {
        type: "tip",
        title: "Phân biệt 'The number of' vs 'A number of'",
        body: "- **The number of + N(số nhiều) + V(số ít)**: Nhấn mạnh vào con số (The number is increasing).\n- **A number of + N(số nhiều) + V(số nhiều)**: Đồng nghĩa với 'many / several' (A number of students are participating).",
      },
    ],
    exercise: {
      slug: "ex-su-hoa-hop-chu-ngu-dong-tu",
      title: "Luyện tập: Subject-Verb Agreement nâng cao",
      summary:
        "Xử lý các bẫy hòa hợp chủ-vị phức tạp thường gặp trong Academic Writing.",
      domain: "grammar",
      difficulty: "intermediate",
      questions: [
        {
          type: "single_choice",
          prompt: "Chọn câu có sự hòa hợp Chủ ngữ - Động từ chính xác:",
          options: [
            "The impact of greenhouse gas emissions on coastal areas are severe.",
            "The impact of greenhouse gas emissions on coastal areas is severe.",
            "The impact of greenhouse gas emissions on coastal areas have been severe.",
            "The impact of greenhouse gas emissions on coastal areas were severe yesterday.",
          ],
          correctOptionIndex: 1,
          explanation:
            "Head noun là 'The impact' (danh từ số ít), do đó động từ to be phải chia số ít là 'is'.",
        },
        {
          type: "single_choice",
          prompt:
            "Điền động từ thích hợp: 'The number of overseas applicants ___ significantly over the last three years.'",
          options: ["have risen", "has risen", "are rising", "were rising"],
          correctOptionIndex: 1,
          explanation:
            "Cấu trúc 'The number of' đi với động từ số ít, kết hợp với 'over the last three years' dùng hiện tại hoàn thành -> 'has risen'.",
        },
        {
          type: "multiple_choice",
          prompt: "Chọn 2 câu có ngữ pháp hoàn toàn chính xác:",
          options: [
            "A number of researchers have questioned the validity of the survey.",
            "Every student in both international universities is required to attend.",
            "Each of the participants were given a questionnaire.",
            "Neither of the proposals have been accepted by the committee.",
          ],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "'A number of' + V số nhiều (have questioned) là đúng. 'Every + N số ít' + V số ít (is required) là đúng. 'Each of' và 'Neither of' chuẩn học thuật phải đi với V số ít.",
        },
        {
          type: "true_false",
          prompt:
            "Trong câu 'Economics is an essential discipline for policymakers', từ 'Economics' kết thúc bằng 's' nên động từ phải chia ở dạng số nhiều.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. Economics (ngành kinh tế học), Physics, Mathematics là tên môn học, luôn là danh từ không đếm được và đi với động từ số ít.",
        },
        {
          type: "short_text",
          prompt:
            "Điền dạng đúng của động từ 'provide' trong ngoặc: A wide range of educational resources (provide) ___ support for underprivileged students.",
          correctAnswer: "provides",
          explanation:
            "Head noun là 'A wide range' (danh từ số ít chỉ tập hợp), động từ chia 'provides'.",
        },
        {
          type: "short_text",
          prompt:
            "Hoàn thành câu: 'Neither the teacher nor the students ___ (be) prepared for the sudden examination.'",
          correctAnswer: "were",
          explanation:
            "Quy tắc 'Neither... nor...': Động từ hòa hợp với chủ ngữ gần nó nhất. 'the students' là số nhiều, thì quá khứ chia 'were'.",
        },
      ],
    },
  },

  {
    moduleId: MODULES[1].id,
    lessonNum: 7,
    slug: "kiem-soat-cau-phuc-menh-de-quan-he",
    title: "Kiểm soát câu phức và Mệnh đề quan hệ (Complex Sentences)",
    summary:
      "Xây dựng các câu phức học thuật chuẩn xác bằng mệnh đề quan hệ xác định/không xác định, mệnh đề trạng ngữ chỉ sự nhượng bộ và nguyên nhân.",
    difficulty: "intermediate",
    estimated_minutes: 30,
    sections: [
      {
        type: "text",
        title: "Bản chất câu phức trong tiêu chí Grammatical Range",
        body: "Để đạt Band 6.0+ tiêu chí Ngữ pháp, bài viết bắt buộc phải có sự kết hợp linh hoạt giữa câu đơn, câu ghép và câu phức. Một câu phức (Complex Sentence) bao gồm **một mệnh đề độc lập (Independent Clause)** và **ít nhất một mệnh đề phụ thuộc (Dependent Clause)** bắt đầu bằng các liên từ phụ thuộc như *although, because, while, whereas, since* hoặc đại từ quan hệ *which, who, that*.",
      },
      {
        type: "example",
        title: "Ví dụ chuyển đổi câu đơn sang câu phức học thuật",
        body: "- *2 câu đơn:* Renewable energy is expensive initially. It reduces carbon emissions substantially.\n- *Câu phức dùng Although:* **Although** renewable energy requires substantial initial capital investment, it provides considerable long-term environmental benefits.\n- *Câu phức dùng Mệnh đề quan hệ:* Governments should subsidise green energy sources, **which** can drastically accelerate the transition to sustainable economies.",
      },
      {
        type: "warning",
        title: "Tránh lỗi Run-on Sentences và Comma Splices",
        body: "Lỗi Comma Splice xảy ra khi nối hai mệnh đề độc lập chỉ bằng một dấu phẩy mà không có liên từ kết hợp (FANBOYS: for, and, nor, but, or, yet, so).\n- *Sai:* The project was delayed, the budget was insufficient.\n- *Đúng:* The project was delayed **because** the budget was insufficient. HOẶC: The project was delayed**;** the budget was insufficient.",
      },
    ],
    exercise: {
      slug: "ex-kiem-soat-cau-phuc",
      title: "Luyện tập: Câu phức và Mệnh đề quan hệ",
      summary:
        "Thực hành nối câu, nhận diện lỗi Comma Splice và sử dụng mệnh đề quan hệ học thuật.",
      domain: "grammar",
      difficulty: "intermediate",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Chọn câu phức học thuật có liên kết ý và dấu câu chính xác nhất:",
          options: [
            "Although governments invest heavily in public healthcare, but epidemics still occur.",
            "Although governments invest heavily in public healthcare, epidemics still occur.",
            "Although governments invest heavily in public healthcare epidemics still occur.",
            "Governments invest heavily in public healthcare, epidemics still occur.",
          ],
          correctOptionIndex: 1,
          explanation:
            "Trong tiếng Anh, đã dùng 'Although' ở mệnh đề phụ thì mệnh đề chính KHÔNG dùng 'but' và phải có dấu phẩy ngăn cách 2 mệnh đề.",
        },
        {
          type: "single_choice",
          prompt:
            "Đại từ quan hệ nào phù hợp để thay thế cho cả một mệnh đề đứng trước trong câu sau: 'Urbanisation is accelerating, ___ places enormous pressure on local infrastructure.'",
          options: ["that", "which", "where", "what"],
          correctOptionIndex: 1,
          explanation:
            "Mệnh đề quan hệ không xác định dùng 'which' đứng sau dấu phẩy để bổ nghĩa cho toàn bộ ý của mệnh đề đứng trước.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 liên từ phụ thuộc dùng để diễn đạt quan hệ tương phản / nhượng bộ trong câu phức:",
          options: ["Whereas", "While", "Furthermore", "Consequently"],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "'Whereas' và 'While' là hai liên từ phụ thuộc đắt giá để chỉ sự đối lập trong câu phức. 'Furthermore' và 'Consequently' là trạng từ liên kết.",
        },
        {
          type: "true_false",
          prompt:
            "Trong mệnh đề quan hệ không xác định (Non-defining relative clause), ta có thể sử dụng 'that' thay cho 'which' hoặc 'who'.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. 'That' tuyệt đối không bao giờ được sử dụng trong mệnh đề quan hệ có dấu phẩy (non-defining).",
        },
        {
          type: "short_text",
          prompt:
            "Điền liên từ thích hợp chỉ sự nhượng bộ: '___ high inflation posed severe economic challenges, consumer spending remained surprisingly resilient.' (1 từ bắt đầu bằng A)",
          correctAnswer: "although",
          explanation:
            "'Although' là liên từ nhượng bộ phổ biến và chuẩn mực nhất trong văn viết học thuật.",
        },
        {
          type: "short_text",
          prompt:
            "Rút gọn mệnh đề quan hệ chủ động: 'The committee, which consists of seven experts, published the report.' -> 'The committee, ___ of seven experts, published the report.'",
          correctAnswer: "consisting",
          explanation:
            "Mệnh đề quan hệ chủ động được rút gọn bằng cách chuyển động từ sang dạng V-ing ('consisting').",
        },
      ],
    },
  },

  {
    moduleId: MODULES[1].id,
    lessonNum: 8,
    slug: "the-bi-dong-hoc-thuat-hedging",
    title: "Thể bị động học thuật và Kỹ thuật Hedging",
    summary:
      "Tạo lập giọng văn khách quan, trang trọng bằng Passive Voice khách quan và kỹ thuật ngôn ngữ cẩn trọng (Hedging) tránh khẳng định tuyệt đối.",
    difficulty: "intermediate",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Vai trò của Thể bị động và Hedging trong văn phong IELTS",
        body: "Trong bài viết IELTS Academic, thí sinh thường bị trừ điểm Task Response và Lexical Resource khi đưa ra các nhận định mang tính tuyệt đối hóa như *'Everyone knows that...'* hoặc *'Technology always causes unemployment.'*.\n\nĐể đạt tính học thuật cao, bạn cần sử dụng:\n1. **Thể bị động khách quan (Impersonal Passive)**: Giấu chủ thể cá nhân, tập trung vào hiện tượng.\n2. **Kỹ thuật Hedging (Ngôn ngữ cẩn trọng)**: Sử dụng các động từ khuyết thiếu (modal verbs: *may, could, tend to*) và trạng từ chỉ khả năng (*presumably, arguably, likely*).",
      },
      {
        type: "example",
        title: "Ví dụ so sánh câu tuyệt đối hóa vs câu có Hedging",
        body: "- *Tuyệt đối hóa (Kém học thuật):* Excessive screen time destroys children's mental development.\n- *Có Hedging học thuật:* Excessive screen time **is widely believed to have a detrimental effect on** children's cognitive development, **potentially leading to** attention deficits.\n- *Thể bị động khách quan:* **It is often asserted that** remote learning cannot fully replace traditional classroom instruction.",
      },
      {
        type: "tip",
        title: "Công thức Impersonal Passive kinh điển",
        body: "- `It is widely acknowledged / contended / argued that + Clause`\n- `X is considered / deemed / believed to be + Adjective/Noun`",
      },
    ],
    exercise: {
      slug: "ex-the-bi-dong-hedging",
      title: "Luyện tập: Passive Voice và Cautious Language",
      summary:
        "Biến đổi các câu nói tuyệt đối hóa thành văn phong học thuật khách quan và trang trọng.",
      domain: "grammar",
      difficulty: "intermediate",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Câu nào sau đây thể hiện văn phong học thuật khách quan (Academic Hedging) tốt nhất?",
          options: [
            "Smartphones completely destroy human communication skills.",
            "Evidence suggests that excessive smartphone usage may impair interpersonal communication.",
            "Everybody knows that smartphones are bad for society.",
            "Smartphones will certainly eradicate all social interactions in the near future.",
          ],
          correctOptionIndex: 1,
          explanation:
            "Câu dùng 'Evidence suggests that... may impair' thể hiện tính cẩn trọng khoa học, không phán xét phiến diện.",
        },
        {
          type: "single_choice",
          prompt:
            "Chọn dạng bị động khách quan chính xác cho câu: 'Experts believe that the climate is changing rapidly.'",
          options: [
            "It is believed that the climate is changing rapidly.",
            "The climate is believed changing rapidly.",
            "It believes that climate changes rapidly.",
            "Climate was believed to change rapidly.",
          ],
          correctOptionIndex: 0,
          explanation:
            "Cấu trúc chuẩn: 'It is believed that + S + V' truyền tải thông tin khách quan một cách tự nhiên.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 động từ/cụm từ thể hiện kỹ thuật Hedging trong bài luận Task 2:",
          options: [
            "Tend to",
            "Are likely to",
            "Will definitely",
            "Undeniably prove that",
          ],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "'Tend to' (có xu hướng) và 'Are likely to' (có khả năng) làm giảm bớt tính khẳng định tuyệt đối, đúng chuẩn mực viết học thuật.",
        },
        {
          type: "true_false",
          prompt:
            "Trong IELTS Writing Task 1 miêu tả quy trình sản xuất (Process), thể bị động nên được sử dụng cho phần lớn các bước.",
          options: ["True", "False"],
          correctOptionIndex: 0,
          explanation:
            "True. Dạng bài Process tập trung vào đối tượng được xử lý (ví dụ: 'The tea leaves are harvested, dried and packaged') nên thể bị động là bắt buộc.",
        },
        {
          type: "short_text",
          prompt:
            "Điền động từ phân từ hai thích hợp: 'It is widely ___ (accept) that early childhood education plays a pivotal role in long-term development.'",
          correctAnswer: "accepted",
          explanation:
            "Cụm 'It is widely accepted that...' mang nghĩa 'Người ta thừa nhận rộng rãi rằng...'.",
        },
        {
          type: "short_text",
          prompt:
            "Chuyển từ 'probable' sang trạng từ tương ứng để dùng trong kỹ thuật Hedging: ___",
          correctAnswer: "probably",
          explanation: "Trạng từ của 'probable' là 'probably'.",
        },
      ],
    },
  },

  {
    moduleId: MODULES[1].id,
    lessonNum: 9,
    slug: "dao-ngu-cau-truc-nhan-manh",
    title: "Đảo ngữ và Cấu trúc nhấn mạnh C1/C2 (Inversion & Cleft Sentences)",
    summary:
      "Nâng band điểm Grammatical Range với cấu trúc đảo ngữ với trạng từ phủ định (Not only, Rarely, Under no circumstances) và câu chẻ (It is... that...).",
    difficulty: "advanced",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Sức mạnh của Inversion và Cleft Sentences trong bài luận",
        body: "Để gây ấn tượng với giám khảo ở tiêu chí Grammatical Range (Band 7.5 - 8.5), việc đưa vào 1-2 cấu trúc nhấn mạnh đúng ngữ cảnh sẽ chứng minh bạn làm chủ cấu trúc câu nâng cao.\n\n1. **Đảo ngữ với trạng từ phủ định/bán phủ định**: Khi đặt các từ như *Not only, Seldom, Rarely, Hardly, Under no circumstances* lên đầu câu, trật tự từ bị đảo giống như câu hỏi (Trợ động từ + Chủ ngữ + Động từ chính).\n2. **Câu chẻ (Cleft Sentence)**: `It is/was + Thành phần nhấn mạnh + that/who + Mệnh đề`.",
      },
      {
        type: "example",
        title: "Ví dụ câu đảo ngữ chuẩn mực",
        body: "- *Câu thường:* Automation not only boosts productivity, but it also creates high-skilled jobs.\n- *Câu đảo ngữ:* **Not only does automation boost** industrial productivity, **but it also fosters** the emergence of novel high-skilled occupations.\n- *Câu chẻ:* **It is the government that** must assume primary responsibility for infrastructure upgrades.",
      },
      {
        type: "warning",
        title: "Không lạm dụng đảo ngữ gượng ép",
        body: "Chỉ nên dùng tối đa 1 câu đảo ngữ trong toàn bộ bài viết Task 2, thường là ở câu mở rộng luận điểm hoặc phần kết bài. Lạm dụng 3-4 câu đảo ngữ sẽ làm bài viết trở nên kịch tính hóa (melodramatic) và mất đi vẻ tự nhiên học thuật.",
      },
    ],
    exercise: {
      slug: "ex-dao-ngu-cau-nhan-manh",
      title: "Luyện tập: Inversion và Cleft Sentences nâng cao",
      summary:
        "Chuyển đổi câu xuôi sang cấu trúc đảo ngữ và câu chẻ ăn điểm ngữ pháp cao.",
      domain: "grammar",
      difficulty: "advanced",
      questions: [
        {
          type: "single_choice",
          prompt: "Chọn câu đảo ngữ với 'Not only' được chia đúng ngữ pháp:",
          options: [
            "Not only renewable energy reduces pollution, but it also creates green jobs.",
            "Not only does renewable energy reduce pollution, but it also creates green jobs.",
            "Not only renewable energy does reduce pollution, but it also creates green jobs.",
            "Not only is renewable energy reduce pollution, but it also creates green jobs.",
          ],
          correctOptionIndex: 1,
          explanation:
            "Công thức đảo ngữ với hiện tại đơn: 'Not only + does + S + V(nguyên mẫu)... but S also...'.",
        },
        {
          type: "single_choice",
          prompt:
            "Chọn phương án đúng: 'Under no circumstances ___ confidential user data without explicit consent.'",
          options: [
            "companies should disclose",
            "should companies disclose",
            "companies disclose",
            "do companies disclosed",
          ],
          correctOptionIndex: 1,
          explanation:
            "'Under no circumstances' (Trong bất kỳ trường hợp nào cũng không) bắt buộc đảo trợ động từ lên trước chủ ngữ: 'should companies disclose'.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 trạng từ phủ định/bán phủ định bắt buộc đảo ngữ khi đứng ở đầu câu:",
          options: ["Seldom", "Rarely", "Frequently", "Usually"],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "'Seldom' và 'Rarely' mang nghĩa hiếm khi, phủ định bán phần nên bắt buộc dùng đảo ngữ khi đứng đầu câu.",
        },
        {
          type: "true_false",
          prompt:
            "Trong câu chẻ 'It is education that empowers underprivileged communities', từ 'that' có thể được thay thế bằng 'what'.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. Cấu trúc câu chẻ cố định là 'It is/was + X + that/who...', không dùng 'what'.",
        },
        {
          type: "short_text",
          prompt:
            "Hoàn thành câu đảo ngữ: 'Hardly ___ the policy been implemented when public protests erupted.' (Điền trợ động từ quá khứ hoàn thành)",
          correctAnswer: "had",
          explanation: "Cấu trúc: 'Hardly had + S + V3/ed + when + S + V2/ed'.",
        },
        {
          type: "short_text",
          prompt:
            "Viết từ còn thiếu trong cấu trúc câu chẻ: 'It ___ (be - hiện tại) individual consumer habits that drive market demand.'",
          correctAnswer: "is",
          explanation:
            "Cấu trúc câu chẻ ở hiện tại luôn bắt đầu bằng 'It is', bất kể thành phần được nhấn mạnh là số ít hay số nhiều.",
        },
      ],
    },
  },

  {
    moduleId: MODULES[1].id,
    lessonNum: 10,
    slug: "lien-tu-cohesive-devices",
    title: "Phương tiện liên kết đoạn Cohesive Devices & Discourse Markers",
    summary:
      "Nâng cao điểm số Coherence & Cohesion bằng cách sử dụng linh hoạt các liên từ chỉ nguyên nhân, hệ quả, bổ sung và tương phản thay vì lặp lại 'Furthermore' và 'Moreover'.",
    difficulty: "intermediate",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Bẫy 'Mechanical Linking' trong tiêu chí Cohesion",
        body: "Bảng Band Descriptors nêu rõ rằng thí sinh Band 6.0 thường mắc lỗi **'mechanical linking'** (sử dụng liên từ một cách máy móc: câu nào cũng mở đầu bằng *Firstly, Secondly, Furthermore, In addition, In conclusion*).\n\nĐể đạt Band 7.0-8.0 CC, bạn cần sử dụng liên kết tự nhiên thông qua đại từ thay thế (*this phenomenon, these measures*), danh từ hóa (Nominalization), và đặt trạng từ liên kết vào giữa câu thay vì luôn đặt ở đầu câu.",
      },
      {
        type: "example",
        title: "Kỹ thuật đặt liên từ linh hoạt vào giữa câu",
        body: "- *Cách viết thông thường (Band 6):* Public transport is heavily subsidized. **However**, many residents still prefer private cars.\n- *Cách viết linh hoạt (Band 7+):* Public transport is heavily subsidized; many residents, **however**, continue to rely on private vehicles.\n- *Liên kết bằng danh từ thay thế:* The government recently introduced congestion charges. **This policy** has proven effective in mitigating peak-hour bottlenecks.",
      },
      {
        type: "checklist",
        title: "Bảng từ vựng liên kết học thuật thay thế",
        body: "1. Thay cho 'Therefore': *Consequently, As a consequence, Hence, Thus*.\n2. Thay cho 'Furthermore': *Moreover, Additionally, What is more*.\n3. Thay cho 'For example': *For instance, To illustrate this point, A case in point is...*.",
      },
    ],
    exercise: {
      slug: "ex-cohesive-devices",
      title: "Luyện tập: Cohesive Devices & Discourse Markers",
      summary:
        "Sử dụng liên từ tự nhiên, đúng dấu câu và tránh lỗi liên kết máy móc.",
      domain: "grammar",
      difficulty: "intermediate",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Chọn liên từ thích hợp nhất để diễn đạt kết quả logic trong câu sau: 'Funding was withdrawn; ___, the research project was terminated.'",
          options: ["nevertheless", "consequently", "whereas", "in contrast"],
          correctOptionIndex: 1,
          explanation:
            "'Consequently' (do đó, kết quả là) thể hiện quan hệ nhân quả phù hợp với ngữ cảnh việc nghiên cứu bị hủy do rút vốn.",
        },
        {
          type: "single_choice",
          prompt:
            "Cụm từ nào sau đây dùng để giới thiệu một ví dụ điển hình một cách tự nhiên nhất?",
          options: [
            "A case in point is",
            "Example is that",
            "I take example of",
            "Like for example",
          ],
          correctOptionIndex: 0,
          explanation:
            "'A case in point is [Noun]' là cụm diễn đạt học thuật rất tự nhiên ở band 7.0-8.0.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 trạng từ liên kết (Conjunctive Adverbs) yêu cầu có dấu chấm phẩy hoặc dấu chấm phía trước và dấu phẩy phía sau khi nối 2 câu độc lập:",
          options: ["However", "Furthermore", "Although", "Because"],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "'However' và 'Furthermore' là trạng từ liên kết, cần dùng sau dấu chấm/chấm phẩy và có dấu phẩy đi kèm. 'Although' và 'Because' là liên từ phụ thuộc.",
        },
        {
          type: "true_false",
          prompt:
            "Bắt đầu mỗi câu văn trong một đoạn bằng các từ nối 'Firstly', 'Secondly', 'Thirdly' là phong cách viết được khuyến khích ở Band 8.0.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. Đây là dấu hiệu của liên kết máy móc (mechanical linking), thường bị giới hạn điểm CC ở mức 6.0.",
        },
        {
          type: "short_text",
          prompt:
            "Điền trạng từ 4 chữ cái đồng nghĩa với 'therefore' mang tính học thuật cao: 'The city expanded rapidly; ___, demand for housing soared.'",
          correctAnswer: "thus",
          explanation:
            "'Thus' là trạng từ ngắn gọn, rất trang trọng trong văn phong học thuật.",
        },
        {
          type: "short_text",
          prompt:
            "Hoàn thành cụm từ chỉ ví dụ: 'To ___ this point, consider the case of Scandinavian countries.' (Điền 1 động từ bắt đầu bằng 'i')",
          correctAnswer: "illustrate",
          explanation:
            "Cụm 'To illustrate this point' nghĩa là 'Để minh họa cho điểm này'.",
        },
      ],
    },
  },

  // Module 3 (Lessons 11-15: Academic Vocabulary)
  {
    moduleId: MODULES[2].id,
    lessonNum: 11,
    slug: "tu-vung-moi-truong-khi-hau",
    title: "Từ vựng Chủ đề Môi trường & Biến đổi khí hậu",
    summary:
      "Nạp bộ từ vựng và Collocations C1/C2 chủ đề Environmental Degradation, Renewable Energy, Biodiversity Loss và Carbon Footprint.",
    difficulty: "intermediate",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Bộ từ vựng cốt lõi Chủ đề Môi trường",
        body: "Môi trường là một trong những chủ đề xuất hiện với tần suất cao nhất trong cả 4 kỹ năng thi IELTS. Thay vì dùng các từ đơn giản như *pollution, dirty, save animals*, bạn cần sử dụng các thuật ngữ chuyên sâu:\n- **Ecological degradation**: Sự suy thoái hệ sinh thái.\n- **Carbon-neutral economy**: Nền kinh tế trung hòa carbon.\n- **Habitat fragmentation**: Sự phân mảnh môi trường sống của động vật.\n- **Depletion of natural resources**: Sự cạn kiệt tài nguyên thiên nhiên.",
      },
      {
        type: "example",
        title: "Các Collocations đắt giá chủ đề Môi trường",
        body: "- **To mitigate the catastrophic impacts of climate change**: Giảm thiểu các tác động thảm khốc của biến đổi khí hậu.\n- **To transition to renewable energy sources**: Chuyển đổi sang các nguồn năng lượng tái tạo.\n- **Irreversible environmental damage**: Thiệt hại môi trường không thể phục hồi.\n- **Unsustainable consumption patterns**: Mô hình tiêu thụ không bền vững.",
      },
      {
        type: "tip",
        title: "Ứng dụng vào đề Writing Task 2",
        body: "Ví dụ mở bài: *'The relentless expansion of industrial activities has precipitated severe ecological degradation, prompting urgent debate over whether governments or individuals should bear primary accountability.'*",
      },
    ],
    exercise: {
      slug: "ex-tu-vung-moi-truong",
      title: "Luyện tập: Từ vựng Môi trường & Biến đổi khí hậu",
      summary:
        "Kiểm tra nghĩa, cách dùng collocations và hoàn thành câu với từ vựng môi trường C1/C2.",
      domain: "vocabulary",
      difficulty: "intermediate",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Từ nào sau đây mang nghĩa 'làm giảm mức độ nghiêm trọng hoặc tác hại của một hiện tượng tiêu cực'?",
          options: ["Exacerbate", "Mitigate", "Deteriorate", "Precipitate"],
          correctOptionIndex: 1,
          explanation:
            "'Mitigate' có nghĩa là làm dịu bớt, làm giảm nhẹ mức độ nghiêm trọng (ví dụ: mitigate climate change).",
        },
        {
          type: "single_choice",
          prompt:
            "Chọn collocation chính xác: 'Overexploitation has led to the severe ___ of marine fish stocks.'",
          options: ["depletion", "allocation", "enhancement", "retention"],
          correctOptionIndex: 0,
          explanation:
            "'Depletion of resources/stocks' nghĩa là sự cạn kiệt nguồn tài nguyên.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 nguồn năng lượng thuộc nhóm 'Renewable Energy' (Năng lượng tái tạo):",
          options: ["Solar power", "Wind energy", "Fossil fuel", "Natural gas"],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "Năng lượng mặt trời (Solar) và gió (Wind) là năng lượng tái tạo. Nhiên liệu hóa thạch và khí tự nhiên là năng lượng hữu hạn.",
        },
        {
          type: "true_false",
          prompt:
            "Thuật ngữ 'Biodiversity' dùng để chỉ sự thống nhất của một giống loài duy nhất trong khu vực rừng nhiệt đới.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. 'Biodiversity' (đa dạng sinh học) chỉ sự phong phú của nhiều loài sinh vật khác nhau trong một hệ sinh thái.",
        },
        {
          type: "short_text",
          prompt:
            "Điền tính từ trái nghĩa với 'sustainable' mô tả các hoạt động khai thác tàn phá tài nguyên: ___ (1 từ)",
          correctAnswer: "unsustainable",
          explanation:
            "'Unsustainable' nghĩa là không bền vững, không thể duy trì lâu dài.",
        },
        {
          type: "short_text",
          prompt:
            "Điền danh từ vào cụm từ chỉ tổng lượng khí thải nhà kính của một cá nhân: 'carbon ___' (9 chữ cái, bắt đầu bằng F)",
          correctAnswer: "footprint",
          explanation:
            "'Carbon footprint' nghĩa là dấu chân carbon, lượng phát thải cá nhân.",
        },
      ],
    },
  },

  {
    moduleId: MODULES[2].id,
    lessonNum: 12,
    slug: "tu-vung-do-thi-hoa-smart-cities",
    title: "Từ vựng Chủ đề Đô thị hóa, Giao thông & Nhà ở",
    summary:
      "Trang bị các thuật ngữ học thuật về quy hoạch đô thị: Urban Sprawl, Traffic Congestion, Affordable Housing và Pedestrianisation.",
    difficulty: "intermediate",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Từ vựng trọng tâm về Quy hoạch & Đô thị hóa",
        body: "Đô thị hóa (Urbanisation) gắn liền với các vấn đề xã hội như quá tải hạ tầng, giá nhà leo thang và ô nhiễm tiếng ồn. Các thuật ngữ quan trọng:\n- **Urban sprawl**: Sự mở rộng đô thị thiếu kiểm soát ra vùng ven.\n- **High-density residential development**: Phát triển khu dân cư mật độ cao (chung cư cao tầng).\n- **Integrated public transit network**: Mạng lưới giao thông công cộng tích hợp (tàu điện ngầm kết nối xe bus).\n- **Pedestrianisation**: Quy hoạch phố đi bộ, cấm phương tiện cơ giới.",
      },
      {
        type: "example",
        title: "Collocations hữu ích cho đề bài Urban Living",
        body: "- **To alleviate chronic traffic congestion**: Giảm bớt tắc nghẽn giao thông kinh niên.\n- **The acute shortage of affordable housing**: Tình trạng thiếu hụt trầm trọng nhà ở giá vừa túi tiền.\n- **To decentralise commercial hubs**: Phân tán các trung tâm thương mại ra khỏi lõi nội đô.\n- **Gentrification**: Hiện tượng tái thiết đô thị khiến tầng lớp thượng lưu chuyển đến và đẩy giá sinh hoạt lên cao.",
      },
      {
        type: "tip",
        title: "Áp dụng vào câu luận điểm",
        body: "*'Investing in integrated rail systems not only alleviates chronic gridlock but also curbs vehicular emissions in metropolitan centres.'*",
      },
    ],
    exercise: {
      slug: "ex-tu-vung-do-thi-hoa",
      title: "Luyện tập: Từ vựng Đô thị hóa & Giao thông",
      summary: "Kiểm tra vốn từ về quy hoạch thành phố, giao thông và nhà ở.",
      domain: "vocabulary",
      difficulty: "intermediate",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Hiện tượng thành phố lan rộng ra vùng nông thôn ngoại ô một cách thiếu quy hoạch được gọi là:",
          options: [
            "Urban sprawl",
            "Urban density",
            "Pedestrianisation",
            "Decentralisation",
          ],
          correctOptionIndex: 0,
          explanation:
            "'Urban sprawl' là thuật ngữ chỉ sự bành trướng đô thị không kiểm soát ra vùng ven.",
        },
        {
          type: "single_choice",
          prompt:
            "Động từ nào sau đây đi cùng với 'traffic congestion' mang nghĩa 'làm giảm bớt' tắc nghẽn?",
          options: ["Alleviate", "Aggravate", "Exacerbate", "Accelerate"],
          correctOptionIndex: 0,
          explanation:
            "'Alleviate congestion' nghĩa là làm giảm nhẹ tình trạng tắc nghẽn giao thông.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 giải pháp thường được đề xuất để giải quyết ùn tắc giao thông đô thị:",
          options: [
            "Expanding integrated public transport networks",
            "Imposing congestion charges in city centres",
            "Subsidising private car purchases",
            "Eliminating all bicycle lanes",
          ],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "Mở rộng giao thông công cộng và thu phí ùn tắc nội đô (congestion charges) là 2 giải pháp tiêu chuẩn trong các bài luận IELTS.",
        },
        {
          type: "true_false",
          prompt:
            "Từ 'infrastructure' là danh từ đếm được, ta có thể viết 'many infrastructures' trong bài viết học thuật.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. 'Infrastructure' là danh từ không đếm được. Muốn chỉ số nhiều, dùng 'infrastructure projects' hoặc 'infrastructure systems'.",
        },
        {
          type: "short_text",
          prompt:
            "Điền từ thích hợp: 'The government plans to ___ (cấm xe cơ giới, biến thành phố đi bộ) the historic downtown area.'",
          correctAnswer: "pedestrianise",
          explanation:
            "'Pedestrianise' (UK) hoặc 'pedestrianize' (US) nghĩa là biến thành khu vực dành riêng cho người đi bộ.",
        },
        {
          type: "short_text",
          prompt:
            "Điền tính từ vào cụm từ chỉ nhà ở có giá cả phù hợp với người có thu nhập thấp: '___ housing' (10 chữ cái, bắt đầu bằng A)",
          correctAnswer: "affordable",
          explanation: "'Affordable housing' nghĩa là nhà ở giá vừa túi tiền.",
        },
      ],
    },
  },

  {
    moduleId: MODULES[2].id,
    lessonNum: 13,
    slug: "tu-vung-giao-duc-tri-tue-nhan-tao",
    title: "Từ vựng Chủ đề Giáo dục, AI & Công nghệ",
    summary:
      "Vốn từ học thuật về chuyển đổi số trong giáo dục: Artificial Intelligence, Algorithmic Bias, Digital Literacy và Blended Learning.",
    difficulty: "intermediate",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Các khái niệm công nghệ mới trong đề thi IELTS gần đây",
        body: "Các đề thi IELTS gần đây thường xuyên đề cập tới tác động của Trí tuệ nhân tạo (AI), Tự động hóa (Automation) và Giáo dục từ xa đối với xã hội:\n- **Technological disruption**: Sự đột phá công nghệ làm thay đổi toàn bộ thị trường truyền thống.\n- **Digital literacy**: Kỹ năng sử dụng công nghệ số và an toàn thông tin.\n- **Blended learning**: Mô hình học tập kết hợp giữa trực tiếp trên lớp và trực tuyến.\n- **Algorithmic bias**: Định kiến trong thuật toán máy học do dữ liệu huấn luyện thiên vị.",
      },
      {
        type: "example",
        title: "Collocations chuyên sâu chủ đề AI & Giáo dục",
        body: "- **To cultivate critical thinking skills**: Nuôi dưỡng và rèn luyện kỹ năng tư duy phản biện.\n- **To bridge the digital divide**: Thu hẹp khoảng cách tiếp cận công nghệ giữa các tầng lớp xã hội.\n- **Personalised learning pathways**: Lộ trình học tập được cá nhân hóa theo năng lực từng học viên.\n- **Ethical implications of AI**: Các hệ lụy đạo đức của trí tuệ nhân tạo.",
      },
      {
        type: "tip",
        title: "Tư duy phản biện trong đề bài AI thay thế giáo viên",
        body: "Khi bàn về AI trong giáo dục: AI có thể cung cấp phản hồi tức thì và bài tập thích ứng (adaptive exercises), nhưng không thể thay thế giáo viên ở khả năng thấu cảm (empathy), truyền cảm hứng (mentorship) và giáo dục nhân cách đạo đức (moral guidance).",
      },
    ],
    exercise: {
      slug: "ex-tu-vung-ai-giao-duc",
      title: "Luyện tập: Từ vựng Công nghệ, AI & Giáo dục",
      summary:
        "Ứng dụng vốn từ về trí tuệ nhân tạo, tự động hóa và phương pháp sư phạm hiện đại.",
      domain: "vocabulary",
      difficulty: "intermediate",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Cụm từ nào chỉ khoảng cách về cơ hội tiếp cận công nghệ giữa người giàu và người nghèo?",
          options: [
            "Digital literacy",
            "Digital divide",
            "Digital native",
            "Digital footprint",
          ],
          correctOptionIndex: 1,
          explanation:
            "'The digital divide' (khoảng cách số) là thuật ngữ chỉ sự bất bình đẳng trong việc tiếp cận máy tính và internet.",
        },
        {
          type: "single_choice",
          prompt:
            "Mô hình giảng dạy kết hợp giữa học trực tiếp tại lớp học truyền thống và học qua nền tảng online được gọi là:",
          options: [
            "Rote learning",
            "Blended learning",
            "Passive learning",
            "Exclusive learning",
          ],
          correctOptionIndex: 1,
          explanation:
            "'Blended learning' là phương pháp học tập kết hợp cả online và offline.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 kỹ năng cốt lõi của con người mà công nghệ AI hiện nay khó có thể thay thế hoàn toàn:",
          options: [
            "Emotional empathy and mentorship",
            "Complex ethical decision-making",
            "Storing millions of data records",
            "Calculating numerical calculations instantly",
          ],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "Sự thấu cảm con người (Empathy) và việc ra quyết định đạo đức phức tạp là những phẩm chất đặc trưng của con người mà AI chưa thể thay thế.",
        },
        {
          type: "true_false",
          prompt:
            "Thuật ngữ 'Rote learning' (học vẹt, học thuộc lòng máy móc) được xem là phương pháp sư phạm tiến bộ được khuyến khích ở bậc đại học.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. 'Rote learning' là học vẹt, trái ngược với 'critical thinking' (tư duy phản biện) và thường bị phê phán trong môi trường học thuật.",
        },
        {
          type: "short_text",
          prompt:
            "Điền động từ thích hợp: 'Schools must ___ (nuôi dưỡng/phát triển) critical thinking skills in young learners.' (9 chữ cái, bắt đầu bằng C)",
          correctAnswer: "cultivate",
          explanation:
            "'Cultivate skills' nghĩa là nuôi dưỡng, trau dồi kỹ năng.",
        },
        {
          type: "short_text",
          prompt:
            "Điền từ còn thiếu vào cụm từ: 'artificial ___' (12 chữ cái, viết bằng tiếng Anh: intelligence)",
          correctAnswer: "intelligence",
          explanation: "Artificial Intelligence nghĩa là trí tuệ nhân tạo.",
        },
      ],
    },
  },

  {
    moduleId: MODULES[2].id,
    lessonNum: 14,
    slug: "tu-vung-xa-hoi-toan-cau-hoa",
    title: "Từ vựng Chủ đề Xã hội, Việc làm & Toàn cầu hóa",
    summary:
      "Nắm vững bộ từ vựng về thị trường lao động hiện đại: Gig Economy, Automation, Wealth Disparity và Cultural Homogenisation.",
    difficulty: "intermediate",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Các chuyển dịch lớn trong xã hội và thị trường lao động",
        body: "Các bài đọc và đề viết IELTS thường xuyên khảo sát sự biến đổi của việc làm và văn hóa trong kỷ nguyên toàn cầu hóa:\n- **Gig economy**: Nền kinh tế việc làm tự do / thời vụ (freelancer, tài xế công nghệ) không gắn liền với hợp đồng biên chế dài hạn.\n- **Socio-economic disparity**: Sự chênh lệch giàu nghèo trong xã hội.\n- **Cultural homogenisation**: Hiện tượng đồng nhất hóa văn hóa (văn hóa phương Tây du nhập làm mờ nhạt bản sắc truyền thống).\n- **Brain drain**: Hiện tượng chảy máu chất xám (nhân lực tay nghề cao di cư sang các quốc gia phát triển).",
      },
      {
        type: "example",
        title: "Collocations nâng cao chủ đề Việc làm & Xã hội",
        body: "- **To widen the gap between the affluent and the underprivileged**: Nới rộng khoảng cách giữa người giàu và người yếu thế.\n- **Flexible working arrangements**: Chế độ làm việc linh hoạt (làm việc từ xa kết hợp văn phòng).\n- **To preserve indigenous traditions**: Gìn giữ các truyền thống bản địa.\n- **Job displacement due to automation**: Sự mất việc làm hàng loạt do tự động hóa máy móc.",
      },
      {
        type: "tip",
        title: "Từ đồng nghĩa nâng cấp điểm Lexical Resource",
        body: "- Thay vì dùng 'Rich and poor': Dùng **'The affluent and the underprivileged'**.\n- Thay vì dùng 'Old people': Dùng **'The elderly'** hoặc **'Senior citizens'**.\n- Thay vì dùng 'Young people': Dùng **'Adolescents'** hoặc **'The younger demographic'**.",
      },
    ],
    exercise: {
      slug: "ex-tu-vung-xa-hoi-toan-cau-hoa",
      title: "Luyện tập: Xã hội, Việc làm & Toàn cầu hóa",
      summary:
        "Kiểm tra từ vựng về thị trường việc làm, chênh lệch xã hội và bảo tồn văn hóa.",
      domain: "vocabulary",
      difficulty: "intermediate",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Hiện tượng nhân tài và lao động có trình độ cao di cư ra nước ngoài làm việc được gọi là:",
          options: [
            "Brain drain",
            "Cultural erosion",
            "Gig economy",
            "Social mobility",
          ],
          correctOptionIndex: 0,
          explanation:
            "'Brain drain' (chảy máu chất xám) là thuật ngữ chỉ sự thất thoát nhân lực trình độ cao.",
        },
        {
          type: "single_choice",
          prompt:
            "Từ nào sau đây là tính từ trang trọng đồng nghĩa với 'wealthy / rich'?",
          options: ["Affluent", "Destitute", "Impecunious", "Impoverished"],
          correctOptionIndex: 0,
          explanation:
            "'Affluent' là tính từ học thuật chỉ sự giàu có, khá giả (the affluent = người giàu).",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 lợi ích thường được đề cập của việc làm việc từ xa (Remote work / Telecommuting):",
          options: [
            "Greater work-life balance and schedule flexibility",
            "Elimination of daily commuting time and transport costs",
            "Complete guarantee of rapid corporate promotion",
            "Total elimination of all computer-related security risks",
          ],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "Cân bằng cuộc sống - công việc tốt hơn và tiết kiệm thời gian di chuyển hàng ngày là 2 ưu điểm lớn của làm việc từ xa.",
        },
        {
          type: "true_false",
          prompt:
            "Thuật ngữ 'Cultural homogenisation' chỉ quá trình làm phong phú thêm sự đa dạng văn hóa độc đáo của từng vùng miền.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. 'Cultural homogenisation' là sự đồng nhất hóa, làm mất dần bản sắc riêng và khiến mọi nơi trở nên giống nhau.",
        },
        {
          type: "short_text",
          prompt:
            "Điền từ thích hợp vào cụm từ chỉ nền kinh tế lao động tự do/thời vụ: 'the ___ economy' (3 chữ cái, bắt đầu bằng G)",
          correctAnswer: "gig",
          explanation: "'Gig economy' là nền kinh tế việc làm tự do/ngắn hạn.",
        },
        {
          type: "short_text",
          prompt:
            "Điền danh từ chỉ sự di cư của dân cư từ nông thôn lên thành phố sinh sống: 'rural-urban ___' (9 chữ cái, bắt đầu bằng M)",
          correctAnswer: "migration",
          explanation:
            "'Rural-urban migration' nghĩa là sự di cư từ nông thôn ra thành thị.",
        },
      ],
    },
  },

  {
    moduleId: MODULES[2].id,
    lessonNum: 15,
    slug: "academic-collocations-paraphrase",
    title: "Academic Collocations & Paraphrase linh hoạt",
    summary:
      "Rèn luyện nghệ thuật Paraphrase 4 cấp độ (từ đồng nghĩa, biến đổi từ loại, chuyển thể chủ động/bị động, đổi cấu trúc câu) để bứt phá band 7.0+.",
    difficulty: "intermediate",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Bản chất của kỹ năng Paraphrase trong IELTS",
        body: "Paraphrase không chỉ đơn thuần là dùng từ điển đồng nghĩa (Thesaurus) thay thế từng từ một. Việc thay từ cơ học thường dẫn đến câu văn ngô nghê và sai collocations.\n\nMột bài paraphrase xuất sắc kết hợp đồng thời **4 kỹ thuật**:\n1. Sử dụng từ đồng nghĩa phù hợp ngữ cảnh (*Synonyms*).\n2. Biến đổi dạng từ (*Word Form Transformation*: Động từ thành Danh từ hóa).\n3. Chuyển đổi giữa thể Chủ động và Bị động (*Voice Changing*).\n4. Tái cấu trúc hoàn toàn trật tự ý của câu (*Sentence Structure Reorganization*).",
      },
      {
        type: "example",
        title: "Phân tích ví dụ Paraphrase 4 cấp độ",
        body: "- *Đề bài:* The consumption of fast food has increased dramatically among adolescents.\n- *Cấp độ 1 (Thay từ đơn giản):* The intake of junk food has grown significantly among teenagers.\n- *Cấp độ 2 (Danh từ hóa + Đổi cấu trúc - Band 7.5+):* There has been **a dramatic surge in fast food consumption** within the younger demographic.\n- *Cấp độ 3 (Bị động + Tái cấu trúc):* Fast food is being consumed **at unprecedented rates by teenagers** in recent years.",
      },
      {
        type: "tip",
        title: "Nguyên tắc 'Bảo toàn ý nghĩa gốc'",
        body: "Khi paraphrase, hãy luôn kiểm tra xem thông điệp ban đầu có bị thay đổi mức độ hay không. Ví dụ: 'always' không thể thay bằng 'often'; 'prohibit' (cấm hoàn toàn) không thể thay bằng 'discourage' (không khuyến khích).",
      },
    ],
    exercise: {
      slug: "ex-collocations-paraphrase",
      title: "Luyện tập: Academic Collocations và Paraphrasing",
      summary:
        "Thực hành nhận diện và viết lại câu sử dụng collocations tự nhiên và biến đổi cấu trúc linh hoạt.",
      domain: "vocabulary",
      difficulty: "intermediate",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Đâu là câu paraphrase chuẩn mực học thuật nhất cho: 'The government should spend more money on building schools'?",
          options: [
            "Authorities should allocate greater financial resources to the construction of educational institutions.",
            "Government must pay huge cash to make learning houses.",
            "Schools should be spent more money by rulers.",
            "Spending more money on building schools is what government must do.",
          ],
          correctOptionIndex: 0,
          explanation:
            "Câu dùng 'allocate financial resources to the construction of educational institutions' thay thế tự nhiên và trang trọng.",
        },
        {
          type: "single_choice",
          prompt: "Chọn collocation tự nhiên nhất trong văn phong học thuật:",
          options: [
            "Play a pivotal role in",
            "Do a big role in",
            "Make an important action in",
            "Have a heavy part in",
          ],
          correctOptionIndex: 0,
          explanation:
            "'Play a pivotal/crucial role in' là collocation học thuật chuẩn mực nghĩa là 'đóng vai trò then chốt trong...'.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 cặp từ đồng nghĩa có thể thay thế an toàn cho nhau trong ngữ cảnh bàn về xu hướng phát triển:",
          options: [
            "A sharp increase = A dramatic surge",
            "Drop slightly = Decline marginally",
            "Always = Occasionally",
            "Ban completely = Mildly discourage",
          ],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "'Sharp increase' tương đương 'dramatic surge' (tăng vọt); 'drop slightly' tương đương 'decline marginally' (giảm nhẹ).",
        },
        {
          type: "true_false",
          prompt:
            "Mọi từ trong đề bài IELTS Writing đều bắt buộc phải được thay thế bằng từ đồng nghĩa ở phần Mở bài.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. Các từ chuyên môn cốt lõi (như 'Internet', 'students', 'climate') không bắt buộc phải cố tìm từ thay thế ngớ ngẩn (như đổi 'Internet' thành 'cyberspace information superhighway').",
        },
        {
          type: "short_text",
          prompt:
            "Danh từ hóa của động từ 'consume' để dùng trong câu mô tả biểu đồ: 'The ___ of electricity' (11 chữ cái)",
          correctAnswer: "consumption",
          explanation: "Danh từ của consume là 'consumption' (sự tiêu thụ).",
        },
        {
          type: "short_text",
          prompt:
            "Điền tính từ vào collocation chỉ tác động có hại sâu sắc: 'a ___ effect' (11 chữ cái, bắt đầu bằng D: detrimental)",
          correctAnswer: "detrimental",
          explanation: "'Detrimental effect' nghĩa là tác động gây hại.",
        },
      ],
    },
  },

  // Module 4 (Lessons 16-20: Core Exam Strategies)
  {
    moduleId: MODULES[3].id,
    lessonNum: 16,
    slug: "bay-logic-true-false-not-given",
    title: "Bóc tách bẫy logic True / False / Not Given trong Reading",
    summary:
      "Quy tắc bất biến phân biệt giữa False (thông tin mâu thuẫn trực tiếp) và Not Given (thông tin không đề cập hoặc thiếu cơ sở so sánh).",
    difficulty: "advanced",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Quy tắc vàng phân biệt True, False và Not Given",
        body: "Dạng bài T/F/NG là nỗi ám ảnh lớn nhất của thí sinh IELTS Reading. Nguyên tắc xác định chân lý khách quan của Cambridge gồm 3 định luật:\n- **TRUE (Đúng)**: Ý của nhận định hoàn toàn trùng khớp với thông tin trong bài đọc (dù được diễn đạt bằng ngôn ngữ paraphrase).\n- **FALSE (Sai)**: Bài đọc đưa ra thông tin **MÂU THUẪN HOÀN TOÀN** hoặc phủ định trực tiếp nhận định (Nếu nhận định là A, bài đọc nói rõ là Không phải A hoặc Ngược lại).\n- **NOT GIVEN (Không có thông tin)**: Bài đọc có thể nhắc tới chủ đề đó, nhưng **KHÔNG CÓ ĐỦ DỮ KIỆN** để khẳng định nhận định là Đúng hay Sai.",
      },
      {
        type: "example",
        title: "Bẫy mức độ so sánh (Comparison Trap)",
        body: "- *Bài đọc:* The new library opened in 2022 and attracted over 5,000 visitors in its first month.\n- *Nhận định 1:* The library welcomed more visitors than the local museum. → **NOT GIVEN** (Bài đọc chỉ nêu số lượng khách của thư viện, hoàn toàn không so sánh với bảo tàng địa phương!).\n- *Nhận định 2:* The library remained closed to the public throughout 2022. → **FALSE** (Mâu thuẫn trực tiếp vì bài đọc ghi rõ thư viện đã mở cửa năm 2022).",
      },
      {
        type: "warning",
        title: "Cảnh báo bẫy Qualifier (Từ chỉ mức độ tuyệt đối)",
        body: "Hãy đặc biệt chú ý các từ giới hạn phạm vi như *all, only, always, never, completely*. Nếu bài đọc nói *'Many students prefer online lectures'*, nhưng nhận định nói *'ALL students prefer online lectures'* → Đáp án là **FALSE** (vì bài đọc giới hạn là many chứ không phải all)!",
      },
    ],
    exercise: {
      slug: "ex-bay-logic-tfng",
      title: "Luyện tập: Giải mã bẫy True / False / Not Given",
      summary:
        "Xác minh logic dựa trên đoạn trích văn bản và phân loại chính xác T/F/NG.",
      domain: "grammar",
      difficulty: "advanced",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Đoạn văn: 'Solar panels were installed on 40 residential roofs in the southern district.' Nhận định: 'Solar panels were placed on all roofs across the entire city.' Nhận định này là:",
          options: ["TRUE", "FALSE", "NOT GIVEN", "Cannot be determined"],
          correctOptionIndex: 1,
          explanation:
            "FALSE. Bài đọc nêu rõ chỉ lắp trên 40 mái nhà ở quận phía nam, mâu thuẫn hoàn toàn với khẳng định 'all roofs across the entire city'.",
        },
        {
          type: "single_choice",
          prompt:
            "Đoạn văn: 'The research was conducted by Professor Davies over a three-month period.' Nhận định: 'Professor Davies found the project more stressful than his previous research.' Nhận định này là:",
          options: ["TRUE", "FALSE", "NOT GIVEN", "Cannot be determined"],
          correctOptionIndex: 2,
          explanation:
            "NOT GIVEN. Bài đọc chỉ cung cấp thời gian nghiên cứu (3 tháng), hoàn toàn không nhắc tới việc giáo sư có cảm thấy căng thẳng hơn dự án trước hay không.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 'từ chỉ mức độ tuyệt đối' (Absolute Qualifiers) trong câu nhận định thường là dấu hiệu cảnh báo bẫy False/Not Given:",
          options: [
            "Exclusively (chỉ duy nhất)",
            "Inevitably (chắc chắn xảy ra)",
            "Occasionally (thỉnh thoảng)",
            "Frequently (thường xuyên)",
          ],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "'Exclusively' và 'Inevitably' mang tính tuyệt đối hóa cực đoan. Nếu bài đọc chỉ dùng từ chỉ mức độ vừa phải, câu nhận định này thường là False.",
        },
        {
          type: "true_false",
          prompt:
            "Nếu ta biết một nhận định là đúng dựa vào kiến thức thực tế ngoài đời sống, ta có thể chọn TRUE ngay mà không cần tìm bằng chứng trong bài đọc.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. Bài thi IELTS chỉ chấm điểm dựa trên thông tin có trong văn bản (according to the text). Kiến thức bên ngoài không có giá trị nếu bài đọc không đề cập.",
        },
        {
          type: "short_text",
          prompt:
            "Nếu nhận định đưa ra một phép so sánh hơn (ví dụ: A rẻ hơn B), nhưng trong bài đọc chỉ nhắc đến giá của A mà không nói giá của B, đáp án là: ___ (2 từ tiếng Anh viết tắt: NG hoặc viết đầy đủ)",
          correctAnswer: "not given",
          explanation:
            "Thiếu vế so sánh trong bài đọc thì nhận định là NOT GIVEN.",
        },
        {
          type: "short_text",
          prompt:
            "Trong bài thi Academic Reading, nếu đề bài yêu cầu 'YES / NO / NOT GIVEN', thí sinh viết nhầm thành 'TRUE' thì có nguy cơ bị trừ điểm không? (Điền: co hoặc khong)",
          correctAnswer: "co",
          explanation:
            "Có. Quy chế thi khuyên thí sinh viết đúng format YES/NO/NOT GIVEN theo yêu cầu của đề để tránh tranh chấp quy chuẩn chấm điểm.",
        },
      ],
    },
  },

  {
    moduleId: MODULES[3].id,
    lessonNum: 17,
    slug: "chien-thuat-matching-headings",
    title: "Chiến thuật xử lý Matching Headings & Bẫy tiêu đề",
    summary:
      "Kỹ thuật định vị Topic Sentence, bóc tách cấu trúc đoạn văn và loại bỏ bẫy tiêu đề chỉ chứa chi tiết phụ.",
    difficulty: "advanced",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Bản chất dạng bài Matching Headings",
        body: "Matching Headings (Nối tiêu đề với đoạn văn) là dạng bài kiểm tra khả năng đọc hiểu ý nghĩa tổng thể (Global Comprehension). Một tiêu đề đúng phải bao quát được **toàn bộ nội dung cốt lõi của đoạn**, chứ không phải chỉ nhắc lại một ví dụ hay một con số xuất hiện trong một câu đơn lẻ.",
      },
      {
        type: "example",
        title: "Bẫy chi tiết phụ (Detail Trap)",
        body: "- *Đoạn văn:* Cả đoạn bàn về sự phát triển của công nghệ in 3D trong xây dựng nhà ở giá rẻ. Trong câu cuối, tác giả lấy ví dụ về một công ty tại Hà Lan đã in thử một cây cầu bê tông.\n- *Tiêu đề bẫy:* 'The construction of bridges in the Netherlands' (Đây là bẫy chi tiết phụ!)\n- *Tiêu đề đúng:* 'A revolutionary approach to low-cost housing construction'.",
      },
      {
        type: "tip",
        title: "Quy trình 3 bước xử lý Matching Headings chuẩn",
        body: "1. Đọc lướt danh sách Headings, gạch chân các từ khóa phân biệt sự khác nhau giữa các tiêu đề.\n2. Đọc câu đầu, câu thứ hai và câu cuối của đoạn văn (vị trí thường chứa Topic Sentence hoặc kết luận của đoạn).\n3. Tự tóm tắt ý chính của đoạn bằng một câu tiếng Việt trong đầu, sau đó đối chiếu tìm tiêu đề tương ứng nhất.",
      },
    ],
    exercise: {
      slug: "ex-matching-headings",
      title: "Luyện tập: Chiến thuật Matching Headings",
      summary:
        "Rèn luyện khả năng phân biệt ý chính bao quát vs chi tiết phụ trong đoạn văn.",
      domain: "grammar",
      difficulty: "advanced",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Vị trí nào trong một đoạn văn học thuật chuẩn thường chứa Topic Sentence (câu chủ đề nêu ý chính)?",
          options: [
            "Câu đầu tiên hoặc câu thứ hai",
            "Chính giữa đoạn văn",
            "Câu chứa nhiều con số nhất",
            "Trong phần chú thích cuối trang",
          ],
          correctOptionIndex: 0,
          explanation:
            "Các đoạn văn học thuật tiếng Anh thường phát triển theo cấu trúc diễn dịch, câu chủ đề nằm ở câu 1 hoặc 2 của đoạn.",
        },
        {
          type: "single_choice",
          prompt:
            "Một tiêu đề chứa đúng tên riêng xuất hiện trong đoạn văn nhưng chỉ đề cập đến ví dụ minh họa của một câu thì:",
          options: [
            "Chắc chắn là tiêu đề đúng",
            "Nhiều khả năng là bẫy chi tiết phụ (Detail Trap)",
            "Nên chọn ngay lập tức để tiết kiệm giờ",
            "Là tiêu đề cho cả bài viết",
          ],
          correctOptionIndex: 1,
          explanation:
            "Đây là bẫy kinh điển. Tiêu đề phải bao quát toàn đoạn chứ không phải tóm tắt một ví dụ nhỏ.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 bước nên làm trước khi đọc đoạn văn trong dạng bài Matching Headings:",
          options: [
            "Đọc lướt toàn bộ danh sách các Headings đã cho",
            "Gạch chân các từ khóa tạo nên sự khác biệt giữa các Headings",
            "Điền bừa đáp án theo cảm tính",
            "Đọc thuộc lòng từng con số thống kê",
          ],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "Đọc qua danh sách tiêu đề và gạch chân từ khóa phân biệt giúp bạn định hướng trước khi đọc vào bài đọc.",
        },
        {
          type: "true_false",
          prompt:
            "Mỗi đoạn văn luôn có thể ghép với hai tiêu đề khác nhau trong bài thi thật.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. Mỗi đoạn văn chỉ có DUY NHẤT một tiêu đề chính xác nhất. Số lượng tiêu đề trong danh sách luôn nhiều hơn số lượng đoạn văn (để làm bẫy nhiễu).",
        },
        {
          type: "short_text",
          prompt:
            "Thuật ngữ chỉ câu mang ý nghĩa chủ đề tóm lược toàn đoạn văn tiếng Anh là: '___ sentence' (5 chữ cái, bắt đầu bằng T)",
          correctAnswer: "topic",
          explanation: "Topic sentence là câu chủ đề của đoạn.",
        },
        {
          type: "short_text",
          prompt:
            "Số lượng tiêu đề (Headings) trong đề bài luôn ___ (nhiều hơn / ít hơn) số lượng đoạn văn cần nối.",
          correctAnswer: "nhiều hơn",
          explanation:
            "Luôn có các tiêu đề thừa làm nhiệm vụ gây nhiễu (distractors).",
        },
      ],
    },
  },

  {
    moduleId: MODULES[3].id,
    lessonNum: 18,
    slug: "nhan-dien-paraphrase-distractor-listening",
    title: "Nhận diện Distractors và Paraphrase trong Listening Section 1-3",
    summary:
      "Bắt trọn tín hiệu người nói tự đính chính thông tin (Self-correction), nhận diện bẫy số nhiều/số ít và từ gây nhiễu trong bài nghe.",
    difficulty: "advanced",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Bẫy tự đính chính (Self-correction Trap) trong Listening",
        body: "Trong bài thi IELTS Listening, người nói rất hiếm khi đọc thẳng đáp án mà không có yếu tố gây nhiễu (Distractor). Một kịch bản phổ biến là **người nói đưa ra một thông tin ban đầu, sau đó lập tức sửa lại** bằng các từ nối chuyển hướng như *'Oh, sorry, I gave you the wrong date'*, *'Actually, it has changed to...'*, hoặc *'I used to live there, but I moved last year.'*.",
      },
      {
        type: "example",
        title: "Ví dụ kịch bản thoại có Distractor",
        body: "- *Đề bài:* Meeting time: [___]\n- *Audio:* Clerk: 'We normally hold the workshop at 10 a.m.' (Thí sinh vội ghi 10:00). 'However, because the room is being renovated, we have pushed it back to **11:30**.'\n- *Phân tích:* 10:00 a.m là bẫy nhiễu. Đáp án đúng là **11:30**.",
      },
      {
        type: "tip",
        title: "Thời gian đọc trước câu hỏi (Pre-reading)",
        body: "Tận dụng tối đa khoảng thời gian 30-45 giây trước mỗi section để gạch chân từ khóa và **dự đoán loại từ** cần điền: Danh từ số ít hay số nhiều? Tên riêng? Con số hay ngày tháng? Sự chuẩn bị này giúp não bộ tự động kích hoạt bộ lọc âm thanh khi audio phát.",
      },
    ],
    exercise: {
      slug: "ex-listening-distractors",
      title: "Luyện tập: Bẫy nhiễu và Paraphrase trong Listening",
      summary:
        "Nhận diện từ gây nhiễu và đính chính thông tin trong đoạn hội thoại bài nghe.",
      domain: "grammar",
      difficulty: "advanced",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Đoạn thoại: 'I was planning to travel on Tuesday, but the tickets were sold out, so I booked Wednesday instead.' Ngày đi thực tế là:",
          options: ["Tuesday", "Wednesday", "Thursday", "Not mentioned"],
          correctOptionIndex: 1,
          explanation:
            "Tuesday chỉ là dự định ban đầu, vé hết nên đã chuyển sang đặt vé ngày Wednesday. Wednesday là đáp án đúng.",
        },
        {
          type: "single_choice",
          prompt:
            "Từ nối nào sau đây thường báo hiệu người nói sắp tự sửa lại thông tin sai trước đó?",
          options: ["Actually", "Furthermore", "Likewise", "Similarly"],
          correctOptionIndex: 0,
          explanation:
            "'Actually' hoặc 'In fact' là từ nối điển hình báo hiệu việc đính chính sự thật hoặc sửa đổi thông tin.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 việc bắt buộc phải làm trong thời gian chuẩn bị trước khi audio phát:",
          options: [
            "Đọc kỹ giới hạn số từ được phép điền (ví dụ: NO MORE THAN TWO WORDS)",
            "Dự đoán loại từ cần điền (danh từ, động từ, con số, tên riêng)",
            "Tháo tai nghe ra để tập trung",
            "Viết sẵn bất kỳ từ nào mình thích vào phiếu trả lời",
          ],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "Kiểm tra giới hạn số từ (Word limit) và dự đoán loại từ là 2 thao tác sống còn trong IELTS Listening.",
        },
        {
          type: "true_false",
          prompt:
            "Nếu yêu cầu đề bài là 'NO MORE THAN ONE WORD AND/OR A NUMBER', câu trả lời 'two cars' là hợp lệ và được tính điểm.",
          options: ["True", "False"],
          correctOptionIndex: 1,
          explanation:
            "False. 'Two cars' gồm 2 từ ('two' là chữ số viết bằng chữ + 'cars'), vi phạm quy tắc 'NO MORE THAN ONE WORD'. Viết '2 cars' mới hợp lệ (1 number + 1 word).",
        },
        {
          type: "short_text",
          prompt:
            "Khi nghe chính tả một số điện thoại có số 0 lặp lại 2 lần (ví dụ: 00), người bản xứ thường phát âm là: 'double ___' (1 từ tiếng Anh chỉ số 0)",
          correctAnswer: "zero",
          explanation:
            "Người bản xứ thường đọc là 'double zero' hoặc 'double oh'.",
        },
        {
          type: "short_text",
          prompt:
            "Nếu câu hỏi yêu cầu điền danh từ chỉ nơi chốn trong trường đại học, người nghe ghi 'librarys' thay vì 'libraries' thì có được điểm không? (Điền: co hoặc khong)",
          correctAnswer: "khong",
          explanation:
            "Không. Lỗi sai chính tả dù chỉ 1 ký tự trong IELTS Listening đều bị tính là 0 điểm.",
        },
      ],
    },
  },

  {
    moduleId: MODULES[3].id,
    lessonNum: 19,
    slug: "dan-y-phat-trien-luan-diem-writing-task-2",
    title:
      "Tư duy lập dàn ý và Phát triển luận điểm Writing Task 2 (PEEL paragraph)",
    summary:
      "Xây dựng thân bài chuẩn cấu trúc PEEL (Point - Explanation - Example - Link) để đạt điểm tuyệt đối về tính phát triển ý trong Task Response.",
    difficulty: "advanced",
    estimated_minutes: 30,
    sections: [
      {
        type: "text",
        title: "Cấu trúc đoạn thân bài chuẩn PEEL",
        body: "Lỗi phổ biến nhất khiến bài luận Task 2 bị kẹt ở Band 5.5-6.0 là **'liệt kê ý tưởng'** (đưa ra quá nhiều ý tưởng nhưng không đào sâu giải thích nguyên nhân và hệ quả).\n\nCấu trúc **PEEL** giúp bạn phát triển một luận điểm sâu sắc và thuyết phục:\n- **P - Point (Luận điểm)**: Câu mở đoạn nêu rõ ý kiến chính.\n- **E - Explanation (Giải thích)**: Tại sao điều đó xảy ra? Cơ chế vận hành như thế nào? (Trả lời câu hỏi Why? How?).\n- **E - Example (Ví dụ minh họa)**: Dẫn chứng thực tế, số liệu hoặc nghiên cứu cụ thể để chứng minh.\n- **L - Link (Câu kết nối)**: Tóm tắt ý nghĩa và kết nối ngược trở lại câu hỏi của đề bài.",
      },
      {
        type: "example",
        title: "Ví dụ triển khai một đoạn thân bài PEEL hoàn chỉnh",
        body: "- **[Point]:** The primary benefit of subsidising public transport is the marked reduction in traffic congestion.\n- **[Explanation]:** When fares are lowered and service frequency is upgraded, commuters are economically incentivised to abandon private motor vehicles in favour of buses and trains. This significantly diminishes the volume of automobiles circulating on urban roadways during rush hours.\n- **[Example]:** A pertinent example is Luxembourg, which became the first nation to offer entirely free public transit, resulting in a noticeable decline in downtown gridlock.\n- **[Link]:** Consequently, targeted state subsidies can function as a potent mechanism for enhancing urban mobility.",
      },
      {
        type: "tip",
        title: "Quy tắc 5 phút lập dàn ý trước khi viết",
        body: "Dành 5 phút đầu tiên để phân tích đề bài, xác định dạng câu hỏi (Opinion, Discussion, Problem-Solution, Two-part) và gạch đầu dòng 2 luận điểm chính cho 2 đoạn thân bài. Đừng bao giờ bắt tay vào viết ngay khi chưa có dàn ý!",
      },
    ],
    exercise: {
      slug: "ex-dan-y-peel-writing-task-2",
      title: "Luyện tập: Phát triển luận điểm chuẩn PEEL",
      summary:
        "Sắp xếp và hoàn thiện đoạn thân bài lập luận chặt chẽ trong Task 2.",
      domain: "grammar",
      difficulty: "advanced",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Trong mô hình PEEL, chữ cái 'E' thứ nhất đại diện cho thành phần nào sau đây?",
          options: [
            "Emotion (Cảm xúc cá nhân)",
            "Explanation (Giải thích lý do/cơ chế)",
            "Exaggeration (Nói quá)",
            "Evaluation (Đánh giá đề thi)",
          ],
          correctOptionIndex: 1,
          explanation:
            "E thứ nhất là Explanation - giải thích tại sao luận điểm đó lại đúng và dẫn đến hệ quả gì.",
        },
        {
          type: "single_choice",
          prompt:
            "Một đoạn thân bài đưa ra 5 ý tưởng khác nhau nhưng mỗi ý chỉ viết đúng 1 câu ngắn thì thường bị giới hạn điểm Task Response ở band nào?",
          options: ["Band 5.0 - 5.5", "Band 7.5 - 8.0", "Band 8.5", "Band 9.0"],
          correctOptionIndex: 0,
          explanation:
            "Liệt kê ý mà thiếu phát triển chiều sâu là đặc trưng của Band 5.0-5.5 ('presents some main ideas but these are limited and not sufficiently developed').",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 dạng đề luận phổ biến nhất trong IELTS Writing Task 2:",
          options: [
            "To what extent do you agree or disagree? (Opinion)",
            "Discuss both views and give your opinion (Discussion)",
            "Write a formal letter to your landlord",
            "Describe a process of manufacturing chocolate",
          ],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "Opinion và Discussion là 2 dạng đề Task 2 phổ biến nhất. Viết thư là Task 1 General, mô tả quy trình là Task 1 Academic.",
        },
        {
          type: "true_false",
          prompt:
            "Trong IELTS Writing Task 2, độ dài bài viết tối thiểu được quy định là 250 từ.",
          options: ["True", "False"],
          correctOptionIndex: 0,
          explanation:
            "True. Viết dưới 250 từ sẽ bị phạt điểm Task Response vì không phát triển đủ độ dài yêu cầu.",
        },
        {
          type: "short_text",
          prompt:
            "Viết số từ tối thiểu được khuyến nghị cho bài thi IELTS Writing Task 2: ___ từ",
          correctAnswer: "250",
          explanation:
            "Độ dài tối thiểu là 250 từ (khuyến nghị viết từ 260 - 290 từ).",
        },
        {
          type: "short_text",
          prompt:
            "Thời gian làm bài khuyến nghị tối ưu dành cho Task 2 trong tổng số 60 phút là: ___ phút",
          correctAnswer: "40",
          explanation:
            "Khuyến nghị phân bổ 40 phút cho Task 2 và 20 phút cho Task 1.",
        },
      ],
    },
  },

  {
    moduleId: MODULES[3].id,
    lessonNum: 20,
    slug: "phan-xa-speaking-fluency-part-1-2",
    title: "Phản xạ mở rộng câu trả lời và Duy trì Fluency Speaking",
    summary:
      "Công thức kéo dài câu trả lời tự nhiên cho Speaking Part 1 & Part 2 bằng quy tắc AREA (Answer, Reason, Example, Alternative) và kỹ thuật câu giờ thông minh.",
    difficulty: "advanced",
    estimated_minutes: 25,
    sections: [
      {
        type: "text",
        title: "Bản chất tiêu chí Fluency & Coherence trong Speaking",
        body: "Nhiều thí sinh hiểu nhầm rằng Fluency là phải bắn tiếng Anh thật nhanh như gió. Thực chất, **Fluency (Độ trôi chảy)** là khả năng duy trì dòng nói liên tục, tốc độ ổn định, không ngập ngừng quá lâu để tìm từ vựng và câu trả lời có độ dài tương xứng.\n\nTrong Part 1, câu trả lời lý tưởng kéo dài từ **2 đến 4 câu**. Đừng chỉ trả lời cộc lốc *'Yes, I do'* hoặc *'No, I don't'*.",
      },
      {
        type: "example",
        title: "Công thức AREA mở rộng câu trả lời tự nhiên",
        body: "- **A - Answer (Trả lời trực tiếp)**: *'Yes, I absolutely enjoy cooking at home.'*\n- **R - Reason (Nêu nguyên nhân)**: *'Mainly because it gives me full control over nutritional ingredients and helps me unwind after a demanding workday.'*\n- **E - Example (Ví dụ cụ thể)**: *'For instance, on weekends, I often experiment with authentic pasta dishes for my family.'*\n- **A - Alternative (Ý kiến mở rộng/ngược lại)**: *'That being said, on hectic weekdays, I sometimes order food delivery to save time.'*",
      },
      {
        type: "tip",
        title: "Kỹ thuật câu giờ tự nhiên (Fillers & Discourse Markers)",
        body: "Khi cần thêm 2-3 giây suy nghĩ, hãy dùng các cụm tự nhiên thay vì phát ra âm thanh ngập ngừng 'uhm, ahh':\n- *'Well, to be perfectly honest, that's not something I've thought about before, but...'* \n- *'That's an intriguing question. I would say that...'*",
      },
    ],
    exercise: {
      slug: "ex-speaking-fluency-area",
      title: "Luyện tập: Phản xạ và Mở rộng câu Speaking",
      summary:
        "Áp dụng công thức AREA và kỹ thuật liên kết ý trong Speaking Part 1 & 2.",
      domain: "grammar",
      difficulty: "advanced",
      questions: [
        {
          type: "single_choice",
          prompt:
            "Độ dài lý tưởng cho một câu trả lời trong phần thi IELTS Speaking Part 1 là:",
          options: [
            "1 từ duy nhất (Yes/No)",
            "2 đến 4 câu hoàn chỉnh có lý do hoặc ví dụ",
            "Nói liên tục 3 phút không ngừng",
            "Đọc thuộc một bài văn dài 200 từ",
          ],
          correctOptionIndex: 1,
          explanation:
            "Trong Part 1, 2-4 câu là độ dài vừa vặn nhất, vừa đủ ý vừa không biến thành bài diễn thuyết đơn điệu.",
        },
        {
          type: "single_choice",
          prompt:
            "Cụm từ nào sau đây là Filler tự nhiên giúp kéo dài thời gian suy nghĩ hợp lý trong Speaking?",
          options: [
            "Well, that's an interesting question, I suppose...",
            "Wait teacher, let me think five minutes",
            "I don't know the answer so next question please",
            "Uhm uhm uhm uhm",
          ],
          correctOptionIndex: 0,
          explanation:
            "'Well, that's an interesting question...' giúp người nói có thêm thời gian sắp xếp ý tưởng mà không làm đứt gãy luồng nói.",
        },
        {
          type: "multiple_choice",
          prompt:
            "Chọn 2 tiêu chí chính thức được chấm trong bài thi IELTS Speaking:",
          options: [
            "Fluency and Coherence (Độ trôi chảy và mạch lạc)",
            "Pronunciation (Phát âm chuẩn xác, ngữ điệu, trọng âm)",
            "Body Language and Hand Gestures (Cử chỉ tay và điệu bộ)",
            "Typing Speed (Tốc độ gõ phím)",
          ],
          correctOptionIndices: [0, 1],
          points: 2,
          explanation:
            "4 tiêu chí Speaking gồm: Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, và Pronunciation. Cử chỉ tay không được tính điểm.",
        },
        {
          type: "true_false",
          prompt:
            "Trong Speaking Part 2, thí sinh có đúng 1 phút để đọc Cue Card và ghi chú dàn ý trên giấy nháp trước khi nói.",
          options: ["True", "False"],
          correctOptionIndex: 0,
          explanation:
            "True. Part 2 luôn dành cho thí sinh đúng 1 phút chuẩn bị và phát giấy bút để ghi chú (take notes).",
        },
        {
          type: "short_text",
          prompt:
            "Thời gian nói tối đa cho phần thi Speaking Part 2 là: ___ phút (Nhập số)",
          correctAnswer: "2",
          explanation:
            "Speaking Part 2 yêu cầu nói từ 1 đến 2 phút (tối ưu là nói cho đến khi giám khảo ra hiệu dừng ở mốc 2 phút).",
        },
        {
          type: "short_text",
          prompt:
            "Viết tên chữ cái thứ 4 trong công thức mở rộng câu trả lời AREA: ___ (Ý kiến mở rộng/ngược lại: Alternative)",
          correctAnswer: "alternative",
          explanation:
            "A cuối cùng là Alternative (ý kiến mở rộng hoặc trường hợp ngoại lệ).",
        },
      ],
    },
  },
];

// 10 Grammar Topics
const GRAMMAR_TOPICS = [
  {
    id: "50000000-0000-4000-c000-000000000001",
    slug: "subject-verb-agreement-advanced",
    display_order: 1,
    title: "Subject-Verb Agreement nâng cao",
    difficulty: "intermediate",
    explanation:
      "Quy tắc xác định danh từ trung tâm (Head Noun) khi có cụm giới từ chen ngang, đại từ bất định và cấu trúc 'The number of' vs 'A number of'.",
    examples: [
      {
        correct: "The quality of these experimental programs has improved.",
        note: "Quality là danh từ trung tâm số ít.",
      },
      {
        correct: "A number of applicants have submitted their dossiers.",
        note: "A number of đi với động từ số nhiều.",
      },
    ],
    common_mistakes: [
      {
        wrong: "The number of students are increasing.",
        correction: "Dùng 'is increasing' vì 'The number' là số ít.",
      },
    ],
  },
  {
    id: "50000000-0000-4000-c000-000000000002",
    slug: "complex-sentences-and-subordination",
    display_order: 2,
    title: "Câu phức và Mệnh đề phụ thuộc",
    difficulty: "intermediate",
    explanation:
      "Xây dựng các câu phức học thuật chuẩn mực sử dụng liên từ phụ thuộc nhượng bộ (Although, Whereas) và quan hệ nguyên nhân - hệ quả (Since, Given that).",
    examples: [
      {
        correct:
          "Although capital costs are substantial, long-term savings are guaranteed.",
        note: "Dùng Although ở mệnh đề phụ thì không dùng But ở mệnh đề chính.",
      },
    ],
    common_mistakes: [
      {
        wrong: "Although it was raining, but we still went out.",
        correction: "Bỏ 'but' khi đã có 'Although'.",
      },
    ],
  },
  {
    id: "50000000-0000-4000-c000-000000000003",
    slug: "academic-passive-and-impersonal-style",
    display_order: 3,
    title: "Thể bị động khách quan và Impersonal Style",
    difficulty: "intermediate",
    explanation:
      "Ứng dụng cấu trúc 'It is widely believed that...' và 'X is deemed to be...' để tạo giọng văn học thuật khách quan, không thiên vị cá nhân.",
    examples: [
      {
        correct:
          "It is widely acknowledged that early childhood education is vital.",
        note: "Cấu trúc bị động khách quan trang trọng.",
      },
    ],
    common_mistakes: [
      {
        wrong: "People believes that technology is bad.",
        correction:
          "Dùng 'It is argued that excessive technology usage has negative impacts.'",
      },
    ],
  },
  {
    id: "50000000-0000-4000-c000-000000000004",
    slug: "inversion-for-emphasis",
    display_order: 4,
    title: "Đảo ngữ với trạng từ phủ định (Inversion)",
    difficulty: "advanced",
    explanation:
      "Cấu trúc đảo trợ động từ lên trước chủ ngữ khi đứng đầu câu bằng 'Not only', 'Rarely', 'Seldom', 'Under no circumstances'.",
    examples: [
      {
        correct:
          "Not only does automation increase productivity, but it also reduces errors.",
        note: "Đảo trợ động từ does lên trước automation.",
      },
    ],
    common_mistakes: [
      {
        wrong: "Not only automation increases productivity, but...",
        correction: "Phải đảo ngữ: 'Not only does automation increase...'",
      },
    ],
  },
  {
    id: "50000000-0000-4000-c000-000000000005",
    slug: "cohesive-devices-and-discourse-markers",
    display_order: 5,
    title: "Phương tiện liên kết đoạn Cohesive Devices",
    difficulty: "intermediate",
    explanation:
      "Sử dụng linh hoạt các trạng từ liên kết (Consequently, Thus, Nevertheless) và đặt liên từ vào giữa câu để tránh bẫy máy móc.",
    examples: [
      {
        correct:
          "Public transport is subsidised; many residents, however, still drive.",
        note: "Đặt however vào giữa câu tự nhiên.",
      },
    ],
    common_mistakes: [
      {
        wrong: "Firstly, X. Secondly, Y. Thirdly, Z.",
        correction:
          "Hạn chế liệt kê cơ học; hãy dùng các liên từ chỉ nhân quả và tương phản.",
      },
    ],
  },
  {
    id: "50000000-0000-4000-c000-000000000006",
    slug: "relative-clauses-and-participle-clauses",
    display_order: 6,
    title: "Mệnh đề quan hệ và Mệnh đề phân từ rút gọn",
    difficulty: "intermediate",
    explanation:
      "Rút gọn mệnh đề quan hệ chủ động sang V-ing và bị động sang V3/ed để câu văn cô đọng, súc tích chuẩn học thuật.",
    examples: [
      {
        correct:
          "The proposal submitted by the municipal committee was approved.",
        note: "Rút gọn của 'which was submitted'.",
      },
    ],
    common_mistakes: [
      {
        wrong: "The proposal which submitted yesterday was approved.",
        correction: "Thiếu 'was' trong câu bị động chưa rút gọn.",
      },
    ],
  },
  {
    id: "50000000-0000-4000-c000-000000000007",
    slug: "conditional-sentences-and-mixed-conditionals",
    display_order: 7,
    title: "Câu điều kiện nâng cao & Mixed Conditionals",
    difficulty: "advanced",
    explanation:
      "Sử dụng câu điều kiện loại 2, 3 và câu điều kiện hỗn hợp để lập luận các kịch bản giả định trong Writing Task 2.",
    examples: [
      {
        correct:
          "Had governments acted earlier, coastal communities would not face relocation today.",
        note: "Đảo ngữ câu điều kiện loại 3 kết hợp hiện tại.",
      },
    ],
    common_mistakes: [
      {
        wrong: "If governments acted earlier, they will save money.",
        correction:
          "Lệch thì: 'If governments acted earlier, they would save money.'",
      },
    ],
  },
  {
    id: "50000000-0000-4000-c000-000000000008",
    slug: "articles-in-academic-writing-advanced",
    display_order: 8,
    title: "Mạo từ A, An, The trong văn cảnh học thuật",
    difficulty: "intermediate",
    explanation:
      "Sử dụng mạo từ xác định 'The' cho các đối tượng duy nhất hoặc đã xác định, và không dùng mạo từ trước danh từ số nhiều/không đếm được mang nghĩa tổng quát.",
    examples: [
      {
        correct: "Education is a fundamental human right.",
        note: "Education mang nghĩa chung không dùng 'The'.",
      },
    ],
    common_mistakes: [
      {
        wrong: "The education is vital for all people.",
        correction: "Bỏ 'The' khi nói về giáo dục nói chung.",
      },
    ],
  },
  {
    id: "50000000-0000-4000-c000-000000000009",
    slug: "nominalization-academic-style",
    display_order: 9,
    title: "Kỹ thuật Danh từ hóa (Nominalization)",
    difficulty: "advanced",
    explanation:
      "Biến đổi động từ hoặc tính từ thành danh từ tương ứng để tăng mật độ thông tin học thuật (Lexical Density).",
    examples: [
      {
        correct:
          "The rapid expansion of metropolitan areas has strained local utilities.",
        note: "Thay vì 'Because cities expand rapidly, they strain...'",
      },
    ],
    common_mistakes: [
      {
        wrong: "We need to make our transport better.",
        correction:
          "Dùng: 'The enhancement of public transport infrastructure is imperative.'",
      },
    ],
  },
  {
    id: "50000000-0000-4000-c000-00000000000a",
    slug: "hedging-and-cautious-language",
    display_order: 10,
    title: "Kỹ thuật Ngôn ngữ cẩn trọng (Hedging)",
    difficulty: "intermediate",
    explanation:
      "Sử dụng modal verbs (may, could), trạng từ (presumably, potentially) và động từ chỉ xu hướng (tend to) để tránh tuyệt đối hóa phiến diện.",
    examples: [
      {
        correct:
          "Excessive smartphone usage may potentially impair cognitive attention spans.",
        note: "Ngôn ngữ cẩn trọng khoa học.",
      },
    ],
    common_mistakes: [
      {
        wrong: "Smartphones definitely ruin human intellect.",
        correction: "Nói quá tuyệt đối, thiếu tính học thuật khách quan.",
      },
    ],
  },
];

// Generator logic to produce SQL strings
function generateSql() {
  const statements = [];
  statements.push(
    "-- ==========================================================================",
  );
  statements.push(
    "-- Migration: Seed 20 Lessons, 120 Questions & 10 Grammar Topics (MVP Scope)",
  );
  statements.push("-- Generated by scripts/content/seed-mvp-curriculum.mjs");
  statements.push("-- Forward-only, idempotent migration");
  statements.push(
    "-- ==========================================================================\n",
  );
  statements.push("begin;\n");

  // 1. Insert Learning Modules
  statements.push("-- 1. Ingest Learning Modules");
  statements.push(`insert into public.learning_modules (
  id, slug, title, description, skill, test_type, difficulty, display_order, status, estimated_minutes, published_at
) values`);
  const modValues = MODULES.map(
    (m) =>
      `  (${esc(m.id)}::uuid, ${esc(m.slug)}, ${esc(m.title)}, ${esc(m.description)}, ${esc(m.skill)}, ${esc(m.test_type)}, ${esc(m.difficulty)}, ${m.display_order}, 'published', ${m.estimated_minutes}, '2026-10-25T00:00:00Z')`,
  );
  statements.push(modValues.join(",\n"));
  statements.push(`on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  skill = excluded.skill,
  status = excluded.status,
  published_at = excluded.published_at;\n`);

  // 2. Insert Lessons & Lesson Versions
  statements.push("-- 2. Ingest Lessons");
  statements.push(
    `insert into public.lessons (id, module_id, slug, display_order) values`,
  );
  const lessonRows = [];
  LESSONS.forEach((l, idx) => {
    const lessonId = `20000000-0000-4000-c000-${String(idx + 1).padStart(12, "0")}`;
    l.dbId = lessonId;
    lessonRows.push(
      `  (${esc(lessonId)}::uuid, ${esc(l.moduleId)}::uuid, ${esc(l.slug)}, ${l.lessonNum})`,
    );
  });
  statements.push(lessonRows.join(",\n"));
  statements.push(`on conflict (id) do nothing;\n`);

  statements.push(
    "-- 3. Ingest Lesson Versions (as draft first to allow adding sections)",
  );
  statements.push(`insert into public.lesson_versions (
  id, lesson_id, version, title, summary, difficulty, estimated_minutes, status, published_at
) values`);
  const versionRows = [];
  LESSONS.forEach((l, idx) => {
    const verId = `30000000-0000-4000-c000-${String(idx + 1).padStart(12, "0")}`;
    l.dbVersionId = verId;
    versionRows.push(
      `  (${esc(verId)}::uuid, ${esc(l.dbId)}::uuid, 1, ${esc(l.title)}, ${esc(l.summary)}, ${esc(l.difficulty)}, ${l.estimated_minutes}, 'draft', null)`,
    );
  });
  statements.push(versionRows.join(",\n"));
  statements.push(`on conflict (id) do nothing;\n`);

  // 4. Ingest Lesson Sections
  statements.push("-- 4. Ingest Lesson Sections");
  statements.push(`insert into public.lesson_sections (
  id, lesson_version_id, section_type, title, body_markdown, display_order, is_required
) values`);
  const sectionRows = [];
  let secCounter = 1;
  LESSONS.forEach((l) => {
    l.sections.forEach((s, sIdx) => {
      const secId = `40000000-0000-4000-c000-${String(secCounter++).padStart(12, "0")}`;
      sectionRows.push(
        `  (${esc(secId)}::uuid, ${esc(l.dbVersionId)}::uuid, ${esc(s.type)}, ${esc(s.title)}, ${esc(s.body)}, ${sIdx + 1}, true)`,
      );
    });
  });
  statements.push(sectionRows.join(",\n"));
  statements.push(`on conflict (id) do nothing;\n`);

  // Publish Lesson Versions now that sections are populated
  statements.push("-- Publish Lesson Versions");
  statements.push(`update public.lesson_versions
set status = 'published', published_at = '2026-10-25T00:00:00Z'
where id between '30000000-0000-4000-c000-000000000001' and '30000000-0000-4000-c000-000000000020'
  and status = 'draft';\n`);

  // 5. Ingest Exercise Sets & Exercise Set Versions
  statements.push("-- 5. Ingest Exercise Sets");
  statements.push(
    `insert into public.exercise_sets (id, slug, domain, display_order) values`,
  );
  const setRows = [];
  LESSONS.forEach((l, idx) => {
    const setId = `70000000-0000-4000-c000-${String(idx + 1).padStart(12, "0")}`;
    l.exercise.dbId = setId;
    setRows.push(
      `  (${esc(setId)}::uuid, ${esc(l.exercise.slug)}, ${esc(l.exercise.domain)}, ${idx + 1})`,
    );
  });
  statements.push(setRows.join(",\n"));
  statements.push(`on conflict (id) do nothing;\n`);

  statements.push(
    "-- 6. Ingest Exercise Set Versions (as draft first to allow adding questions)",
  );
  statements.push(`insert into public.exercise_set_versions (
  id, exercise_set_id, version, title, summary, instructions_markdown, difficulty, status, allow_review, published_at
) values`);
  const setVerRows = [];
  LESSONS.forEach((l, idx) => {
    const setVerId = `71000000-0000-4000-c000-${String(idx + 1).padStart(12, "0")}`;
    l.exercise.dbVersionId = setVerId;
    setVerRows.push(
      `  (${esc(setVerId)}::uuid, ${esc(l.exercise.dbId)}::uuid, 1, ${esc(l.exercise.title)}, ${esc(l.exercise.summary)}, ${esc("Hoàn thành tất cả 6 câu hỏi. Bài làm tự động lưu sau mỗi câu và giải thích mở sau khi nộp.")}, ${esc(l.exercise.difficulty)}, 'draft', true, null)`,
    );
  });
  statements.push(setVerRows.join(",\n"));
  statements.push(`on conflict (id) do nothing;\n`);

  // 6. Ingest Questions, Options, Answer Keys, Correct Options, and Text Answers
  statements.push("-- 7. Ingest Exercise Questions");
  statements.push(`insert into public.exercise_questions (
  id, exercise_set_version_id, position, question_type, prompt_markdown, points
) values`);
  const qRows = [];
  let qCounter = 1;
  LESSONS.forEach((l) => {
    l.exercise.questions.forEach((q, qIdx) => {
      const qId = `72000000-0000-4000-c000-${String(qCounter++).padStart(12, "0")}`;
      q.dbId = qId;
      qRows.push(
        `  (${esc(qId)}::uuid, ${esc(l.exercise.dbVersionId)}::uuid, ${qIdx + 1}, ${esc(q.type)}, ${esc(q.prompt)}, ${q.points || 1})`,
      );
    });
  });
  statements.push(qRows.join(",\n"));
  statements.push(`on conflict (id) do nothing;\n`);

  statements.push("-- 8. Ingest Exercise Options");
  statements.push(
    `insert into public.exercise_options (id, question_id, position, label) values`,
  );
  const optRows = [];
  let optCounter = 1;
  LESSONS.forEach((l) => {
    l.exercise.questions.forEach((q) => {
      if (q.options && q.options.length > 0) {
        q.dbOptionIds = [];
        q.options.forEach((optText, optIdx) => {
          const optId = `73000000-0000-4000-c000-${String(optCounter++).padStart(12, "0")}`;
          q.dbOptionIds.push(optId);
          optRows.push(
            `  (${esc(optId)}::uuid, ${esc(q.dbId)}::uuid, ${optIdx + 1}, ${esc(optText)})`,
          );
        });
      }
    });
  });
  statements.push(optRows.join(",\n"));
  statements.push(`on conflict (id) do nothing;\n`);

  statements.push("-- 9. Ingest Answer Keys (private schema)");
  statements.push(
    `insert into private.exercise_answer_keys (question_id, case_sensitive, explanation_markdown) values`,
  );
  const keyRows = [];
  LESSONS.forEach((l) => {
    l.exercise.questions.forEach((q) => {
      keyRows.push(`  (${esc(q.dbId)}::uuid, false, ${esc(q.explanation)})`);
    });
  });
  statements.push(keyRows.join(",\n"));
  statements.push(`on conflict (question_id) do nothing;\n`);

  statements.push("-- 10. Ingest Correct Options (private schema)");
  statements.push(
    `insert into private.exercise_correct_options (question_id, option_id) values`,
  );
  const correctOptRows = [];
  LESSONS.forEach((l) => {
    l.exercise.questions.forEach((q) => {
      if (q.type === "single_choice" || q.type === "true_false") {
        const correctOptId = q.dbOptionIds[q.correctOptionIndex];
        correctOptRows.push(
          `  (${esc(q.dbId)}::uuid, ${esc(correctOptId)}::uuid)`,
        );
      } else if (q.type === "multiple_choice") {
        q.correctOptionIndices.forEach((cIdx) => {
          const correctOptId = q.dbOptionIds[cIdx];
          correctOptRows.push(
            `  (${esc(q.dbId)}::uuid, ${esc(correctOptId)}::uuid)`,
          );
        });
      }
    });
  });
  statements.push(correctOptRows.join(",\n"));
  statements.push(`on conflict (question_id, option_id) do nothing;\n`);

  statements.push("-- 11. Ingest Correct Text Answers (private schema)");
  statements.push(
    `insert into private.exercise_correct_text_answers (question_id, answer_text, normalized_answer) values`,
  );
  const textRows = [];
  LESSONS.forEach((l) => {
    l.exercise.questions.forEach((q) => {
      if (q.type === "short_text") {
        textRows.push(
          `  (${esc(q.dbId)}::uuid, ${esc(q.correctAnswer)}, ${esc(q.correctAnswer.toLowerCase().trim())})`,
        );
      }
    });
  });
  statements.push(textRows.join(",\n"));
  statements.push(`on conflict do nothing;\n`);

  // Publish Exercise Set Versions now that questions and answers are populated
  statements.push("-- Publish Exercise Set Versions");
  statements.push(`update public.exercise_set_versions
set status = 'published', published_at = '2026-10-25T00:00:00Z'
where id between '71000000-0000-4000-c000-000000000001' and '71000000-0000-4000-c000-000000000020'
  and status = 'draft';\n`);

  // 12. Ingest Grammar Topics & Grammar Topic Versions
  statements.push("-- 12. Ingest Grammar Topics");
  statements.push(
    `insert into public.grammar_topics (id, slug, display_order) values`,
  );
  const gTopicRows = GRAMMAR_TOPICS.map(
    (g, idx) => `  (${esc(g.id)}::uuid, ${esc(g.slug)}, ${g.display_order})`,
  );
  statements.push(gTopicRows.join(",\n"));
  statements.push(`on conflict (id) do nothing;\n`);

  statements.push(
    "-- 13. Ingest Grammar Topic Versions (as draft then publish)",
  );
  statements.push(`insert into public.grammar_topic_versions (
  id, grammar_topic_id, version, title, explanation_markdown, examples, common_mistakes, difficulty, status, related_exercise_set_id, published_at
) values`);
  const gTopicVerRows = GRAMMAR_TOPICS.map((g, idx) => {
    const verId = `51000000-0000-4000-c000-${String(idx + 1).padStart(12, "0")}`;
    // Link to corresponding exercise set if exists, or first grammar set
    const relatedSetId = LESSONS[idx < LESSONS.length ? idx : 0].exercise.dbId;
    return `  (${esc(verId)}::uuid, ${esc(g.id)}::uuid, 1, ${esc(g.title)}, ${esc(g.explanation)}, ${escJson(g.examples)}, ${escJson(g.common_mistakes)}, ${esc(g.difficulty)}, 'draft', ${esc(relatedSetId)}::uuid, null)`;
  });
  statements.push(gTopicVerRows.join(",\n"));
  statements.push(`on conflict (id) do nothing;\n`);

  statements.push("-- Publish Grammar Topic Versions");
  statements.push(`update public.grammar_topic_versions
set status = 'published', published_at = '2026-10-25T00:00:00Z'
where id between '51000000-0000-4000-c000-000000000001' and '51000000-0000-4000-c000-000000000010'
  and status = 'draft';\n`);

  statements.push("commit;");
  return statements.join("\n");
}

console.log("Generating 20 Lessons, 120 Questions and 10 Grammar Topics...");
const sql = generateSql();
writeFileSync(OUTPUT_MIGRATION, sql, "utf-8");
console.log(`Generated migration: ${OUTPUT_MIGRATION}`);

// Append to seed.sql if not already present
let seedContent = readFileSync(SEED_FILE, "utf-8");
if (!seedContent.includes("10000000-0000-4000-c000-000000000001")) {
  console.log("Appending new MVP curriculum to supabase/seed.sql...");
  seedContent +=
    "\n\n-- ==========================================================================\n";
  seedContent +=
    "-- MVP CURRICULUM: 20 Lessons, 120 Questions & 10 Grammar Topics\n";
  seedContent +=
    "-- ==========================================================================\n";
  seedContent += sql.replace("begin;\n", "").replace("\ncommit;", "");
  writeFileSync(SEED_FILE, seedContent, "utf-8");
  console.log("Updated supabase/seed.sql successfully!");
} else {
  console.log("seed.sql already contains MVP curriculum identifiers.");
}

console.log("Summary of generated content:");
console.log(`- Learning Modules: ${MODULES.length}`);
console.log(`- Lessons: ${LESSONS.length}`);
console.log(`- Exercise Sets: ${LESSONS.length}`);
console.log(`- Questions: ${LESSONS.length * 6} (6 questions per set)`);
console.log(`- Grammar Topics: ${GRAMMAR_TOPICS.length}`);
