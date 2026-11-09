import type { CoursePlan } from "./model";

export const COURSE_PLANS: CoursePlan[] = [
  {
    slug: "stage-1-foundation",
    title: "Chặng 1: Nền Tảng Ngữ Âm & Ngữ Pháp Sơ Cấp",
    subtitle: "Foundation (0.0 - 2.5) | Xóa mù chữ cái, chuẩn hóa 44 âm IPA",
    description:
      "Xóa mù chữ cái, chuẩn hóa 44 âm IPA, 800 từ vựng cơ bản, ghép câu đơn. Giao diện tối giản, nút lớn, trợ thính & thị giác sinh động.",
    level: "stage_1",
    targetBand: "2.5 IELTS",
    startingLevel: "A0 -> A1",
    durationWeeks: 8,
    totalDays: 56,
    recommendedDailyMins: 45,
    enrolledLearnersCount: 12450,
    completionRatePercent: 92,
    iconName: "Target",
    colorScheme: "emerald",
    highlights: [
      "Ngữ âm IPA (44 âm): 20 nguyên âm, 24 phụ âm, cơ chế bật hơi",
      "Ngữ pháp cốt lõi: Động từ To Be, Đại từ nhân xưng, Thì Hiện tại/Quá khứ",
      "Từ vựng nền tảng: 800 từ A1 (Gia đình, số đếm, màu sắc, nghề nghiệp)",
    ],
    phases: [
      {
        phaseNumber: 1,
        title: "Nền Tảng Ngữ Âm & Từ Vựng Căn Bản",
        targetOutcome:
          "Phân biệt cặp âm tối thiểu (Minimal Pairs), sắp xếp câu hoàn chỉnh S+V+O.",
        weeks: [
          {
            weekNumber: 1,
            title: "Khẩu Hình 3D & Bảng Lộ Trình Âm Vị",
            summary:
              "Làm quen với mô hình 3D cắt dọc khoang miệng và bản đồ node 44 âm uốn lượn.",
            days: [
              {
                dayNumber: 1,
                title: "Phonetics Drill: Cặp âm /iː/ vs /ɪ/",
                skill: "speaking",
                durationMins: 30,
                linkHref: "/practice/speaking",
              },
              {
                dayNumber: 2,
                title: "Word-Image Pairing: 20 từ vựng",
                skill: "vocabulary",
                durationMins: 30,
                linkHref: "/learn/vocabulary/topics",
              },
              {
                dayNumber: 3,
                title: "Sentence Puzzle: Sắp xếp S+V+O",
                skill: "grammar",
                durationMins: 30,
                linkHref: "/learn/grammar",
              },
              {
                dayNumber: 4,
                title: "Dictation Starter: Nghe chép chính tả 3-5 từ",
                skill: "dictation",
                durationMins: 45,
                linkHref: "/practice/listening/dictation",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "stage-2-elementary",
    title: "Chặng 2: Mở Rộng Câu & Giao Tiếp Cơ Bản",
    subtitle:
      "Elementary (2.5 - 3.5) | Giao tiếp hội thoại ngắn, kiểm soát 5 thì",
    description:
      "Nối âm, câu ghép, câu hỏi thông dụng, nghe hội thoại đời sống. Thẻ bài tập kéo thả, hội thoại 2 kênh, trợ lý phản hồi tức thì.",
    level: "stage_2",
    targetBand: "3.5 IELTS",
    startingLevel: "A1 -> A2",
    durationWeeks: 10,
    totalDays: 70,
    recommendedDailyMins: 60,
    enrolledLearnersCount: 8900,
    completionRatePercent: 88,
    iconName: "Users",
    colorScheme: "blue",
    highlights: [
      "Ngữ âm nâng cao: Trọng âm từ, nối âm căn bản, đuôi -s, -es, -ed",
      "Ngữ pháp mở rộng: Tiếp diễn, Hoàn thành, Tương lai, Liên từ, So sánh",
      "Từ vựng chủ đề: 1.500 từ A2 (Giao thông, du lịch, mua sắm)",
    ],
    phases: [
      {
        phaseNumber: 2,
        title: "Cấu Trúc Câu & Phản Xạ Giao Tiếp",
        targetOutcome:
          "Luyện nói nhại (Shadowing), nghe điền từ khóa, nối câu đơn thành ghép.",
        weeks: [
          {
            weekNumber: 1,
            title: "Xây Dựng Câu Lego & Hội Thoại Vai",
            summary:
              "Kéo thả khối từ vựng chuẩn Lego. Nhập vai hội thoại 2 chiều với AI Persona.",
            days: [
              {
                dayNumber: 1,
                title: "Shadowing Dialogue 30s",
                skill: "speaking",
                durationMins: 45,
                linkHref: "/practice/speaking",
              },
              {
                dayNumber: 2,
                title: "Cloze Test Audio: Nghe điền từ",
                skill: "listening",
                durationMins: 45,
                linkHref: "/practice/listening",
              },
              {
                dayNumber: 3,
                title: "Compound Sentence Builder",
                skill: "grammar",
                durationMins: 30,
                linkHref: "/learn/grammar",
              },
              {
                dayNumber: 4,
                title: "Mini Story Reading (150 từ)",
                skill: "reading",
                durationMins: 30,
                linkHref: "/practice/reading",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "stage-3-pre-ielts",
    title: "Chặng 3: Định Hình Tư Duy IELTS Nền Tảng",
    subtitle:
      "Pre-IELTS (3.5 - 4.5) | Làm quen cấu trúc đề, kỹ thuật Skimming/Scanning",
    description:
      "Đọc hiểu văn bản 400 từ, viết đoạn văn mô tả, mệnh đề quan hệ, câu bị động. Giao diện 2 cột học thuật, chia đôi văn bản và bảng câu hỏi.",
    level: "stage_3",
    targetBand: "4.5 IELTS",
    startingLevel: "A2 -> B1",
    durationWeeks: 12,
    totalDays: 84,
    recommendedDailyMins: 90,
    enrolledLearnersCount: 7500,
    completionRatePercent: 82,
    iconName: "BookOpen",
    colorScheme: "violet",
    highlights: [
      "Mệnh đề quan hệ, Thể bị động, Mệnh đề trạng ngữ",
      "Kỹ năng cốt lõi: Skimming, Scanning, Paraphrase",
      "Từ vựng AWL Sublist 1-3: 2.200 từ vựng học thuật cơ bản",
    ],
    phases: [
      {
        phaseNumber: 3,
        title: "Làm Quen IELTS Format & Phân Tích AWL",
        targetOutcome:
          "Xử lý True/False/Not Given, Listening Section 1 & 2, Writing Task 1.",
        weeks: [
          {
            weekNumber: 1,
            title: "Đọc Hiểu Chia Đôi Màn Hình",
            summary:
              "Luyện Reading với giao diện Split-view, bút highlight 3 màu và đồng bộ từ khóa.",
            days: [
              {
                dayNumber: 1,
                title: "IELTS Reading Starter: T/F/NG",
                skill: "reading",
                durationMins: 60,
                linkHref: "/practice/reading",
              },
              {
                dayNumber: 2,
                title: "Listening Sec 1: Form Completion",
                skill: "listening",
                durationMins: 60,
                linkHref: "/practice/listening",
              },
              {
                dayNumber: 3,
                title: "Writing Task 1 Overview",
                skill: "writing",
                durationMins: 60,
                linkHref: "/practice/writing",
              },
              {
                dayNumber: 4,
                title: "Speaking Part 1 Drill (A-R-E)",
                skill: "speaking",
                durationMins: 45,
                linkHref: "/practice/speaking",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "stage-4-intermediate",
    title: "Chặng 4: Chuẩn Hóa Kỹ Năng & Chiến Lược",
    subtitle:
      "Intermediate (4.5 - 5.5) | Xử lý hoàn chỉnh đề thi IELTS 4 kỹ năng",
    description:
      "Cấu trúc PEEL, paraphrase logic, từ nối liên kết, phản xạ Speaking P2. Đồng hồ thi đua, thanh nhiệt tiêu chí chấm thi, trình soạn thảo chuẩn.",
    level: "stage_4",
    targetBand: "5.5 IELTS",
    startingLevel: "B1 -> B2",
    durationWeeks: 12,
    totalDays: 84,
    recommendedDailyMins: 90,
    enrolledLearnersCount: 9200,
    completionRatePercent: 85,
    iconName: "Zap",
    colorScheme: "cyan",
    highlights: [
      "Ngữ pháp phức tạp: Câu điều kiện loại 2&3, phân từ rút gọn, câu ghép phức hợp",
      "Writing Frameworks: Cấu trúc PEEL, Intro & Overview Task 1, 2",
      "Speaking Strategy: Mở rộng ý Part 2 (W-H) và duy trì trôi chảy với fillers",
    ],
    phases: [
      {
        phaseNumber: 4,
        title: "Kỹ Thuật Chiến Thuật & Áp Lực Thời Gian",
        targetOutcome:
          "Xử lý hội thoại học thuật, Summary Completion, viết Full Essay.",
        weeks: [
          {
            weekNumber: 1,
            title: "Radar Điểm Yếu & Đọc Tốc Độ",
            summary:
              "Sử dụng đồng hồ đếm ngược 20 phút cho Reading, Soạn thảo PEEL.",
            days: [
              {
                dayNumber: 1,
                title: "Listening P3: Distractor Tracking",
                skill: "listening",
                durationMins: 60,
                linkHref: "/practice/listening",
              },
              {
                dayNumber: 2,
                title: "Reading P2: Matching Info",
                skill: "reading",
                durationMins: 60,
                linkHref: "/practice/reading",
              },
              {
                dayNumber: 3,
                title: "Full Essay Writing (Task 1 & 2)",
                skill: "writing",
                durationMins: 90,
                linkHref: "/practice/writing",
              },
              {
                dayNumber: 4,
                title: "Speaking P2 Simulator (1m prep)",
                skill: "speaking",
                durationMins: 45,
                linkHref: "/practice/speaking",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "stage-5-upper-inter",
    title: "Chặng 5: Nâng Cao Biện Luận & Thuần Thục",
    subtitle: "Upper-Inter (5.5 - 6.5) | Kiểm soát ngữ cảnh học thuật phức tạp",
    description:
      "Collocations C1, cấu trúc đảo ngữ, danh từ hóa, phòng thi ảo. Giao diện phòng thi mô phỏng, phân tích phổ sóng giọng nói & radar điểm.",
    level: "stage_5",
    targetBand: "6.5 IELTS",
    startingLevel: "B2 -> B2+",
    durationWeeks: 12,
    totalDays: 84,
    recommendedDailyMins: 120,
    enrolledLearnersCount: 6300,
    completionRatePercent: 91,
    iconName: "Flame",
    colorScheme: "amber",
    highlights: [
      "Đảo ngữ với phó từ phủ định, Câu chẻ nhấn mạnh, Danh từ hóa",
      "Collocations chuyên sâu học thuật, Phrasal Verbs, tránh Idioms",
      "Speaking Part 3 Reasoning: Phản biện đa góc nhìn",
    ],
    phases: [
      {
        phaseNumber: 5,
        title: "Tối Ưu Từ Vựng C1 & Studio Biện Luận",
        targetOutcome:
          "Đọc trừu tượng, nghe bài giảng tốc ký, lập luận cân bằng Task 2.",
        weeks: [
          {
            weekNumber: 1,
            title: "Mạng Lưới Collocation & Giám Khảo AI",
            summary:
              "Tra cứu từ vựng C1, phỏng vấn Video 2 màn hình với Giám khảo AI.",
            days: [
              {
                dayNumber: 1,
                title: "Reading P3: Philosophical Texts",
                skill: "reading",
                durationMins: 90,
                linkHref: "/practice/reading",
              },
              {
                dayNumber: 2,
                title: "Listening P4: Monologue Note-taking",
                skill: "listening",
                durationMins: 60,
                linkHref: "/practice/listening",
              },
              {
                dayNumber: 3,
                title: "Writing Task 2: Nuanced Debates",
                skill: "writing",
                durationMins: 90,
                linkHref: "/practice/writing",
              },
              {
                dayNumber: 4,
                title: "Speaking Interactive Examiner",
                skill: "speaking",
                durationMins: 60,
                linkHref: "/practice/speaking",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "stage-6-advanced",
    title: "Chặng 6: Làm Chủ Bứt Phá & Tối Ưu Điểm",
    subtitle: "Advanced (6.5 - 7.0) | Tư duy sắc bén, triệt tiêu lỗi hệ thống",
    description:
      "Hedging, ngữ nghĩa tinh tế, tốc độ giải đề áp lực cao, bẫy distractors. Sa bàn thi CD-IELTS nguyên bản, phân tích dữ liệu micro-error cực đoan.",
    level: "stage_6",
    targetBand: "7.0 IELTS",
    startingLevel: "B2+ -> C1",
    durationWeeks: 8,
    totalDays: 56,
    recommendedDailyMins: 150,
    enrolledLearnersCount: 4200,
    completionRatePercent: 94,
    iconName: "Award",
    colorScheme: "rose",
    highlights: [
      "Kỹ thuật Hedging, Cấu trúc câu điều kiện hỗn hợp, Lexical Precision",
      "Chiến lược bứt phá Reading: Tốc chiến 50 phút cho 3 bài đọc",
      "Quản lý thi thử Full Mock Exam 4 kỹ năng môi trường áp lực cao",
    ],
    phases: [
      {
        phaseNumber: 6,
        title: "Sa Bàn CD-IELTS & Bản Đồ Điểm Mù",
        targetOutcome:
          "Thi thử Full Test áp lực, tinh chỉnh Task 2 tuyệt đối Coherence.",
        weeks: [
          {
            weekNumber: 1,
            title: "Trung Tâm Thi Thử & Phân Tích Vi Mô",
            summary:
              "Làm bài trên giao diện 100% CD-IELTS, phân tích Cognitive Bias.",
            days: [
              {
                dayNumber: 1,
                title: "Speed Pressure Mock Test",
                skill: "mock_test",
                durationMins: 180,
                linkHref: "/mock-tests",
                isMilestone: true,
              },
              {
                dayNumber: 2,
                title: "Forensic Error Analysis",
                skill: "reading",
                durationMins: 60,
                linkHref: "/error-notebook",
              },
              {
                dayNumber: 3,
                title: "Writing Band 7.0+ Polishing",
                skill: "writing",
                durationMins: 90,
                linkHref: "/practice/writing",
              },
              {
                dayNumber: 4,
                title: "Speaking Rapid Fire",
                skill: "speaking",
                durationMins: 60,
                linkHref: "/practice/speaking",
              },
            ],
          },
        ],
      },
    ],
  },
];

export function getCoursePlansCatalog(): CoursePlan[] {
  return COURSE_PLANS;
}

export function getCoursePlanBySlug(slug: string): CoursePlan | null {
  return COURSE_PLANS.find((plan) => plan.slug === slug) ?? null;
}
