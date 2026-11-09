import type { LucideIcon } from "lucide-react";
import { Users, Compass, Radio, BookOpen, Map, FileText } from "lucide-react";

export interface TranscriptLine {
  time: number;
  text: string;
}

export interface KeyVocab {
  word: string;
  meaning: string;
  ipa: string;
}

export interface PracticeQuestion {
  id: number;
  q: string;
  answer: string;
  hint: string;
}

export interface CuratedExercise {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  accent: string;
  accentFlag: string;
  band: string;
  bandGroup: "Band 4.5 - 6.5" | "Band 6.5 - 7.5" | "Band 7.5 - 9.0";
  duration: string;
  durationSec: number;
  questionsCount: number;
  category: string;
  section: "Section 1" | "Section 2" | "Section 3" | "Section 4";
  isSpeedRun: boolean;
  completed: boolean;
  paraphraseTraps?: number;
  sampleSentence: string;
  audioUrl?: string;
  transcript: TranscriptLine[];
  vocab: KeyVocab[];
  questions: PracticeQuestion[];
}

export interface DictationSentence {
  id: string;
  text: string;
  accent: string;
  lang: "en-GB" | "en-US" | "en-AU";
  band: string;
  traps: string[];
}

export interface ParaphrasePair {
  id: string;
  audio: string;
  question: string;
  explanation: string;
}

export interface TopicTrack {
  id: string;
  title: string;
  subtitle: string;
  exercisesCount: number;
  focusBadge: string;
  icon: LucideIcon;
  accentColor: string;
  skills: string[];
}

export interface DiagnosticSkill {
  label: string;
  weight: string;
  focusLevel: string;
  description: string;
  color: string;
}

export interface BandStage {
  id: string;
  bandRange: string;
  name: string;
  vietnameseTitle: string;
  minBand: number;
  maxBand: number;
  accent: string;
  description: string;
  focus: string;
}

export const BAND_STAGES: BandStage[] = [
  {
    id: "starter",
    bandRange: "0.0 - 2.5",
    name: "Starter",
    vietnameseTitle: "Mất gốc Listening",
    minBand: 0,
    maxBand: 2.5,
    accent: "UK / Slow",
    description:
      "Nhận diện bảng chữ cái, đánh vần tên riêng, số điện thoại, ngày tháng.",
    focus: "Chính tả số, tên người, từ vựng sinh hoạt hàng ngày",
  },
  {
    id: "elementary",
    bandRange: "2.5 - 3.5",
    name: "Elementary",
    vietnameseTitle: "Nhập môn Nghe IELTS",
    minBand: 2.5,
    maxBand: 3.5,
    accent: "UK Standard",
    description:
      "Nghe hiểu các thông báo đơn giản, hội thoại ngắn ở quầy dịch vụ.",
    focus: "Điền form thông tin, nhận biết mốc thời gian và địa điểm",
  },
  {
    id: "pre-ielts",
    bandRange: "3.5 - 4.5",
    name: "Pre-IELTS",
    vietnameseTitle: "Nền tảng Listening",
    minBand: 3.5,
    maxBand: 4.5,
    accent: "UK / US",
    description:
      "Bắt đầu làm quen với các đoạn hội thoại Section 1 và Section 2 ngắn.",
    focus: "Section 1 Form completion & Section 2 Hướng dẫn du lịch",
  },
  {
    id: "foundation",
    bandRange: "4.5 - 5.5",
    name: "Foundation",
    vietnameseTitle: "Chinh phục B1+",
    minBand: 4.5,
    maxBand: 5.5,
    accent: "UK / US / AUS",
    description:
      "Phát triển kỹ năng nghe bắt từ khóa (keywords) và nhận diện bẫy phổ biến.",
    focus: "Trắc nghiệm Section 2 & Độc thoại Section 3 thảo luận nhóm",
  },
  {
    id: "intermediate",
    bandRange: "5.5 - 6.5",
    name: "Intermediate",
    vietnameseTitle: "Bứt phá Band 6.5",
    minBand: 5.5,
    maxBand: 6.5,
    accent: "Global Accents",
    description:
      "Nghe hiểu bài giảng học thuật Section 4, liên kết ý và xử lý câu hỏi Matching.",
    focus: "Paraphrase phức tạp & Điền tóm tắt bài giảng Section 4",
  },
  {
    id: "upper-intermediate",
    bandRange: "6.5 - 7.5",
    name: "Upper-Intermediate",
    vietnameseTitle: "Mục tiêu Du học & Định cư",
    minBand: 6.5,
    maxBand: 7.5,
    accent: "Native Speed",
    description:
      "Làm chủ tốc độ nói tự nhiên, nuốt âm, nối âm và ngữ điệu người bản ngữ.",
    focus: "Full Section 1-4 với độ chính xác cao > 30/40 câu",
  },
  {
    id: "advanced",
    bandRange: "7.5 - 8.5",
    name: "Advanced",
    vietnameseTitle: "Chuyên sâu Học thuật",
    minBand: 7.5,
    maxBand: 8.5,
    accent: "Diverse Accents",
    description:
      "Nhận biết thái độ, hàm ý ngầm của người nói trong các bài thuyết trình chuyên sâu.",
    focus: "Multiple Choice nhiều bẫy Section 3 & Lecture trừu tượng",
  },
  {
    id: "expert",
    bandRange: "8.5 - 9.0",
    name: "Expert",
    vietnameseTitle: "Master Tuyệt đối",
    minBand: 8.5,
    maxBand: 9.0,
    accent: "Complex Native",
    description:
      "Hoàn thiện tối đa độ nhạy âm thanh, phản xạ tức thì, điểm số 38-40/40 tuyệt đối.",
    focus: "Tốc độ 1.25x - 1.5x, từ vựng hiếm và bẫy logic tinh vi",
  },
];

export const CURATED_EXERCISES: CuratedExercise[] = [
  {
    id: "ex-1",
    slug: "community-library-visit",
    title: "Community Library Visit",
    subtitle:
      "Listen to an original library conversation and announcement, then answer 8 questions.",
    badge: "VERIFIED",
    badgeColor:
      "from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30",
    accent: "UK Accent",
    accentFlag: "🇬🇧",
    band: "5.5 - 6.5",
    bandGroup: "Band 4.5 - 6.5",
    duration: "1m 48s",
    durationSec: 108,
    questionsCount: 8,
    category: "IELTS Practice",
    section: "Section 1",
    isSpeedRun: true,
    completed: false,
    paraphraseTraps: 5,
    sampleSentence:
      "The community library requires a valid residential proof before issuing a permanent borrowing card.",
    audioUrl: "/audio/listening/community-library-visit.wav",
    transcript: [
      {
        time: 0,
        text: "Good morning, Westside Community Library. How can I help you today?",
      },
      {
        time: 18,
        text: "I just moved to the neighborhood and would like to inquire about library membership.",
      },
      {
        time: 42,
        text: "Certainly! Our standard membership is completely free for all local residents.",
      },
      {
        time: 68,
        text: "However, the community library requires a valid residential proof before issuing a permanent borrowing card.",
      },
      {
        time: 92,
        text: "You can also register for our digital archive which grants access to over ten thousand audiobooks.",
      },
    ],
    vocab: [
      {
        word: "Residential proof",
        meaning: "Giấy xác nhận cư trú",
        ipa: "/ˌrez.ɪˈden.ʃəl pruːf/",
      },
      {
        word: "Permanent borrowing card",
        meaning: "Thẻ mượn sách cố định",
        ipa: "/ˈpɜː.mə.nənt ˈbɒr.əʊ.ɪŋ kɑːd/",
      },
      {
        word: "Digital archive",
        meaning: "Kho lưu trữ kỹ thuật số",
        ipa: "/ˈdɪdʒ.ɪ.təl ˈɑː.kaɪv/",
      },
    ],
    questions: [
      {
        id: 1,
        q: "Standard library membership costs ______ for local residents.",
        answer: "nothing",
        hint: 'Paraphrase của "completely free"',
      },
      {
        id: 2,
        q: "Applicants must bring a valid ______ to get a permanent card.",
        answer: "residential proof",
        hint: "Nghe kỹ cụm danh từ sau động từ requires",
      },
      {
        id: 3,
        q: "The digital archive provides access to more than ______ audiobooks.",
        answer: "10000",
        hint: "ten thousand = 10000",
      },
    ],
  },
  {
    id: "ex-2",
    slug: "community-library-membership",
    title: "Community Library Visit & Membership",
    subtitle:
      "Đăng ký thẻ thư viện và hỏi giờ mở cửa, quy định mượn sách chuyên sâu.",
    badge: "HOT",
    badgeColor:
      "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40",
    accent: "UK Accent",
    accentFlag: "🇬🇧",
    band: "5.5 - 6.5",
    bandGroup: "Band 4.5 - 6.5",
    duration: "3m 05s",
    durationSec: 185,
    questionsCount: 10,
    category: "Daily Conversations",
    section: "Section 1",
    isSpeedRun: false,
    completed: false,
    paraphraseTraps: 7,
    sampleSentence:
      "Late returns will incur a nominal fine of fifty pence per day excluding weekends.",
    audioUrl: "/audio/listening/community-library-visit.wav",
    transcript: [
      {
        time: 0,
        text: "Welcome back to the main desk. Let us go over the borrowing regulations together.",
      },
      {
        time: 35,
        text: "Adult members are permitted to borrow up to twelve items simultaneously for three weeks.",
      },
      {
        time: 75,
        text: "Late returns will incur a nominal fine of fifty pence per day excluding weekends.",
      },
      {
        time: 120,
        text: "If you wish to reserve a high-demand textbook, please use the self-service kiosk near the entrance.",
      },
    ],
    vocab: [
      {
        word: "Incur a nominal fine",
        meaning: "Chịu một khoản phạt nhỏ",
        ipa: "/ɪnˈkɜːr ə ˈnɒm.ɪ.nəl faɪn/",
      },
      {
        word: "Simultaneously",
        meaning: "Cùng một lúc",
        ipa: "/ˌsɪm.əlˈteɪ.ni.əs.li/",
      },
    ],
    questions: [
      {
        id: 1,
        q: "Maximum number of books borrowed at one time: ______ items.",
        answer: "12",
        hint: "twelve items simultaneously",
      },
      {
        id: 2,
        q: "Overdue fine is 50 pence per day, not counting ______.",
        answer: "weekends",
        hint: "excluding = not counting",
      },
    ],
  },
  {
    id: "ex-3",
    slug: "university-accommodation-services",
    title: "University Accommodation Services",
    subtitle:
      "Sinh viên năm nhất trao đổi về việc thuê ký túc xá và homestay ngoại ô.",
    badge: "BAND 6.5+",
    badgeColor:
      "from-cyan-500/20 to-teal-500/20 text-cyan-300 border-cyan-500/30",
    accent: "AUS Accent",
    accentFlag: "🇦🇺",
    band: "6.0 - 7.0",
    bandGroup: "Band 6.5 - 7.5",
    duration: "4m 00s",
    durationSec: 240,
    questionsCount: 10,
    category: "Campus Life",
    section: "Section 2",
    isSpeedRun: false,
    completed: false,
    paraphraseTraps: 8,
    sampleSentence:
      "Students opting for suburban homestays generally report higher satisfaction with culinary arrangements.",
    transcript: [
      {
        time: 0,
        text: "G'day! Looking to sort out your on-campus or off-campus housing for the upcoming semester?",
      },
      {
        time: 50,
        text: "The northern dormitory was recently refurbished, though rent has gone up slightly.",
      },
      {
        time: 110,
        text: "Students opting for suburban homestays generally report higher satisfaction with culinary arrangements.",
      },
    ],
    vocab: [
      {
        word: "Refurbished",
        meaning: "Được tân trang lại",
        ipa: "/ˌriːˈfɜː.bɪʃt/",
      },
      {
        word: "Culinary arrangements",
        meaning: "Sắp xếp bữa ăn / ẩm thực",
        ipa: "/ˈkʌl.ɪ.nər.i əˈreɪndʒ.mənts/",
      },
    ],
    questions: [
      {
        id: 1,
        q: "The northern dormitory has recently been ______.",
        answer: "refurbished",
        hint: "Chú ý âm đuôi -ed",
      },
      {
        id: 2,
        q: "Homestay students are usually happier with the ______ arrangements.",
        answer: "culinary",
        hint: "Từ học thuật chỉ food/meals",
      },
    ],
  },
  {
    id: "ex-4",
    slug: "tidal-wave-energy-lecture",
    title: "Tidal & Wave Energy Research Lecture",
    subtitle:
      "Bài giảng học thuật về công nghệ khai thác năng lượng thủy triều ngoài khơi Scotland.",
    badge: "BAND 7.5+",
    badgeColor:
      "from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/40",
    accent: "UK Accent",
    accentFlag: "🇬🇧",
    band: "7.0 - 8.5",
    bandGroup: "Band 7.5 - 9.0",
    duration: "5m 20s",
    durationSec: 320,
    questionsCount: 10,
    category: "Academic Lectures",
    section: "Section 4",
    isSpeedRun: false,
    completed: false,
    paraphraseTraps: 12,
    sampleSentence:
      "Unlike solar photovoltaics, tidal turbines operate with remarkable predictability regardless of meteorological fluctuations.",
    transcript: [
      {
        time: 0,
        text: "In today’s marine engineering seminar, we examine sub-surface tidal turbines off the Scottish coast.",
      },
      {
        time: 65,
        text: "Unlike solar photovoltaics, tidal turbines operate with remarkable predictability regardless of meteorological fluctuations.",
      },
      {
        time: 140,
        text: "Nevertheless, bio-fouling on rotor blades remains a formidable maintenance bottleneck.",
      },
    ],
    vocab: [
      {
        word: "Meteorological fluctuations",
        meaning: "Biến động thời tiết",
        ipa: "/ˌmiː.ti.ər.əˈlɒdʒ.ɪ.kəl ˌflʌk.tʃuˈeɪ.ʃənz/",
      },
      {
        word: "Maintenance bottleneck",
        meaning: "Điểm nghẽn trong bảo trì",
        ipa: "/ˈmeɪn.tən.əns ˈbɒt.əl.nek/",
      },
    ],
    questions: [
      {
        id: 1,
        q: "Tidal turbines function predictably despite weather or ______ changes.",
        answer: "meteorological",
        hint: "Đồng nghĩa với weather",
      },
      {
        id: 2,
        q: "Marine organism buildup on ______ blades causes maintenance issues.",
        answer: "rotor",
        hint: "Danh từ đứng trước blades",
      },
    ],
  },
  {
    id: "ex-5",
    slug: "public-cycling-route-scheme",
    title: "City Council: Public Cycling Route Scheme",
    subtitle:
      "Thảo luận quy hoạch đường đạp xe đô thị, trắc nghiệm và gắn nhãn bản đồ Section 2.",
    badge: "MAP / DIAGRAM",
    badgeColor:
      "from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/40",
    accent: "US Accent",
    accentFlag: "🇺🇸",
    band: "6.0 - 7.5",
    bandGroup: "Band 6.5 - 7.5",
    duration: "3m 30s",
    durationSec: 210,
    questionsCount: 10,
    category: "Maps & Plans",
    section: "Section 2",
    isSpeedRun: true,
    completed: false,
    paraphraseTraps: 9,
    sampleSentence:
      "Directly adjacent to the pedestrian overpass, a solar-powered bike docking station will be erected.",
    transcript: [
      {
        time: 0,
        text: "Thank you all for attending the municipality briefing on the new green corridor.",
      },
      {
        time: 55,
        text: "Directly adjacent to the pedestrian overpass, a solar-powered bike docking station will be erected.",
      },
      {
        time: 120,
        text: "Heading northeast past the botanical conservatory, cyclists will have a segregated two-way lane.",
      },
    ],
    vocab: [
      {
        word: "Directly adjacent to",
        meaning: "Ngay sát cạnh",
        ipa: "/daɪˈrekt.li əˈdʒeɪ.sənt tuː/",
      },
      {
        word: "Pedestrian overpass",
        meaning: "Cầu vượt bộ hành",
        ipa: "/pəˈdes.tri.ən ˈəʊ.və.pɑːs/",
      },
    ],
    questions: [
      {
        id: 1,
        q: "The bike docking station will be built right next to the pedestrian ______.",
        answer: "overpass",
        hint: "adjacent to = right next to",
      },
      {
        id: 2,
        q: "A separated two-way lane runs northeast past the botanical ______.",
        answer: "conservatory",
        hint: "Nghe kỹ danh từ sau botanical",
      },
    ],
  },
  {
    id: "ex-6",
    slug: "global-coffee-farming",
    title: "Global Coffee Farming & Fair Trade",
    subtitle:
      "Tác động kinh tế của phong trào thương mại công bằng đối với nông dân trồng cà phê.",
    badge: "SECTION 4",
    badgeColor:
      "from-fuchsia-500/20 to-pink-500/20 text-fuchsia-300 border-fuchsia-500/40",
    accent: "US Accent",
    accentFlag: "🇺🇸",
    band: "7.5 - 9.0",
    bandGroup: "Band 7.5 - 9.0",
    duration: "4m 50s",
    durationSec: 290,
    questionsCount: 10,
    category: "Academic Lectures",
    section: "Section 4",
    isSpeedRun: false,
    completed: false,
    paraphraseTraps: 11,
    sampleSentence:
      "Smallholder cooperatives leverage collective bargaining to insulate farmers from volatile commodity markets.",
    transcript: [
      {
        time: 0,
        text: "Coffee is one of the most heavily traded agricultural commodities on the planet.",
      },
      {
        time: 70,
        text: "Smallholder cooperatives leverage collective bargaining to insulate farmers from volatile commodity markets.",
      },
    ],
    vocab: [
      {
        word: "Collective bargaining",
        meaning: "Thương lượng tập thể",
        ipa: "/kəˈlek.tɪv ˈbɑː.ɡɪ.nɪŋ/",
      },
      {
        word: "Volatile markets",
        meaning: "Thị trường biến động mạnh",
        ipa: "/ˈvɒl.ə.taɪl ˈmɑː.kɪts/",
      },
    ],
    questions: [
      {
        id: 1,
        q: "Cooperatives protect farmers from unstable ______ markets.",
        answer: "commodity",
        hint: "volatile = unstable",
      },
    ],
  },
  {
    id: "ex-7",
    slug: "airport-lost-property-hotline",
    title: "Airport Lost Property Hotline",
    subtitle:
      "Báo mất hành lý tại sân bay Sydney: màu sắc vali, thương hiệu, giấy tờ bên trong.",
    badge: "STARTER",
    badgeColor:
      "from-slate-500/20 to-zinc-500/20 text-slate-300 border-slate-500/40",
    accent: "AUS Accent",
    accentFlag: "🇦🇺",
    band: "4.5 - 5.5",
    bandGroup: "Band 4.5 - 6.5",
    duration: "2m 30s",
    durationSec: 150,
    questionsCount: 6,
    category: "Daily Conversations",
    section: "Section 1",
    isSpeedRun: true,
    completed: false,
    paraphraseTraps: 4,
    sampleSentence:
      "The hardshell suitcase has a distinctive metallic strap and two scratched spinner wheels.",
    transcript: [
      {
        time: 0,
        text: "Sydney Kingsford Smith Airport Baggages Desk, speaking. What is your reference number?",
      },
      {
        time: 45,
        text: "The hardshell suitcase has a distinctive metallic strap and two scratched spinner wheels.",
      },
    ],
    vocab: [
      {
        word: "Distinctive",
        meaning: "Dễ phân biệt, đặc trưng",
        ipa: "/dɪˈstɪŋk.tɪv/",
      },
    ],
    questions: [
      {
        id: 1,
        q: "The suitcase features a unique ______ strap.",
        answer: "metallic",
        hint: "distinctive = unique",
      },
    ],
  },
];

export const DICTATION_SENTENCES: DictationSentence[] = [
  {
    id: "d1",
    text: "The metropolitan council has allocated substantial funding for sustainable public transport.",
    accent: "🇬🇧 UK Accent",
    lang: "en-GB",
    band: "Band 7.5",
    traps: [
      "allocated (-ed âm đuôi)",
      "substantial (trọng âm 2)",
      "sustainable (nối âm)",
    ],
  },
  {
    id: "d2",
    text: "Applicants are required to submit two certified copies of their academic transcripts by Friday.",
    accent: "🇺🇸 US Accent",
    lang: "en-US",
    band: "Band 6.5",
    traps: [
      "Applicants (-s số nhiều)",
      "certified (-ed)",
      "transcripts (-s âm cuối)",
    ],
  },
  {
    id: "d3",
    text: "Archaeological excavations revealed several prehistoric settlements along the southern coastline.",
    accent: "🇦🇺 AUS Accent",
    lang: "en-AU",
    band: "Band 8.5",
    traps: [
      "Archaeological (chính tả khó)",
      "excavations (-s)",
      "settlements (-s)",
    ],
  },
];

export const PARAPHRASE_PAIRS: ParaphrasePair[] = [
  {
    id: "p1",
    audio: "prohibitively expensive",
    question: "too costly to afford",
    explanation:
      'Cấu trúc "prohibitively + adj" diễn tả mức độ đắt đỏ vượt khả năng chi trả.',
  },
  {
    id: "p2",
    audio: "a decade and a half ago",
    question: "fifteen years back",
    explanation: "1 decade (10 năm) + a half (5 năm) = 15 năm.",
  },
  {
    id: "p3",
    audio: "initially met with skepticism",
    question: "doubted at first",
    explanation:
      '"initially" = "at first", "skepticism" (sự hoài nghi) = "doubted".',
  },
  {
    id: "p4",
    audio: "mandatory orientation session",
    question: "compulsory introductory meeting",
    explanation:
      '"mandatory" = "compulsory" (bắt buộc), "orientation" = "introductory".',
  },
];

export const TOPIC_TRACKS: TopicTrack[] = [
  {
    id: "track-1",
    title: "Daily Conversations",
    subtitle: "Hội thoại đời sống (Section 1)",
    exercisesCount: 14,
    focusBadge: "Section 1",
    icon: Users,
    accentColor: "indigo",
    skills: ["Spelling & Numbers", "Dates & Postcodes", "Form Completion"],
  },
  {
    id: "track-2",
    title: "Campus & Student Services",
    subtitle: "Môi trường học thuật (Section 2)",
    exercisesCount: 12,
    focusBadge: "Section 2",
    icon: Compass,
    accentColor: "violet",
    skills: ["Multiple Choice", "Short Answer", "Matching Information"],
  },
  {
    id: "track-3",
    title: "Academic Group Discussions",
    subtitle: "Thảo luận đề tài (Section 3)",
    exercisesCount: 10,
    focusBadge: "Section 3",
    icon: Radio,
    accentColor: "cyan",
    skills: ["Speaker Attitude", "Agreement/Disagreement", "Distractor Traps"],
  },
  {
    id: "track-4",
    title: "Academic Lectures",
    subtitle: "Bài giảng học thuật (Section 4)",
    exercisesCount: 16,
    focusBadge: "Section 4",
    icon: BookOpen,
    accentColor: "purple",
    skills: ["Signposting Words", "Summary Completion", "Academic Paraphrase"],
  },
  {
    id: "track-5",
    title: "Maps & Diagram Labeling",
    subtitle: "Định hướng không gian (Section 2)",
    exercisesCount: 9,
    focusBadge: "Section 2",
    icon: Map,
    accentColor: "amber",
    skills: ["Prepositions of Place", "Compass Directions", "Landmarks"],
  },
  {
    id: "track-6",
    title: "Form & Table Completion",
    subtitle: "Điền thông tin cá nhân (Section 1)",
    exercisesCount: 10,
    focusBadge: "Section 1",
    icon: FileText,
    accentColor: "emerald",
    skills: [
      "Word Limit Control",
      "Singular vs Plural (-s)",
      "Unit Measurements",
    ],
  },
];

export const DIAGNOSTIC_SKILLS: DiagnosticSkill[] = [
  {
    label: "Form & Note Completion",
    weight: "25–35%",
    focusLevel: "Trọng tâm Section 1 & 4",
    description:
      "Nghe chính xác số, tên riêng, đơn vị đo và quy định giới hạn từ (Word Limit).",
    color: "from-emerald-500 to-teal-400",
  },
  {
    label: "Multiple Choice (Đa lựa chọn)",
    weight: "25–30%",
    focusLevel: "Trọng tâm Section 2 & 3",
    description:
      "Phát hiện thông tin gây nhiễu (distractors) và thay đổi quyết định của người nói.",
    color: "from-indigo-500 to-blue-400",
  },
  {
    label: "Connected Speech (Nối âm)",
    weight: "Cốt lõi Band 7.0+",
    focusLevel: "Phản xạ âm thanh",
    description:
      "Nhận diện nối âm, nuốt âm và âm đuôi -s / -ed trong hội thoại tốc độ tự nhiên.",
    color: "from-violet-500 to-purple-400",
  },
  {
    label: "Map & Diagram Labeling",
    weight: "10–15%",
    focusLevel: "Section 2 chuyên biệt",
    description:
      "Theo dấu chỉ dẫn không gian, la bàn và các mốc vị trí xoay quanh bản đồ.",
    color: "from-amber-500 to-rose-500",
  },
];
