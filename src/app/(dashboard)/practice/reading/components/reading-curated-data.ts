import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Compass,
  Search,
  FileText,
  Layers,
  BrainCircuit,
} from "lucide-react";

export interface PassageParagraph {
  id: string;
  label: string; // e.g., "Paragraph A"
  text: string;
}

export interface KeyReadingVocab {
  word: string;
  meaning: string;
  ipa: string;
  context: string;
}

export interface ReadingQuestion {
  id: number;
  type: "true_false_not_given" | "multiple_choice" | "matching_headings";
  q: string;
  answer: string;
  hint: string;
  options?: string[];
}

export interface CuratedPassage {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  passageNumber: 1 | 2 | 3;
  category: string;
  bandRange: string;
  bandGroup: "Band 4.5 - 6.5" | "Band 6.5 - 7.5" | "Band 7.5 - 9.0";
  wordCount?: number;
  estimatedMinutes: number;
  questionsCount: number;
  completed: boolean;
  paraphraseTraps?: number;
  paragraphs: PassageParagraph[];
  vocab: KeyReadingVocab[];
  questions: ReadingQuestion[];
}

export interface TrueFalseTrap {
  id: string;
  passageSnippet: string;
  statement: string;
  answer: "TRUE" | "FALSE" | "NOT GIVEN";
  explanation: string;
  trapType:
    | "Direct Contradiction"
    | "Missing Degree/Frequency"
    | "Plausible but Unmentioned";
}

export interface SpeedReadingText {
  id: string;
  title: string;
  text: string;
  wordCount: number;
  checkQuestion: {
    q: string;
    options: string[];
    answer: string;
  };
}

export interface MatchingHeadingTrap {
  id: string;
  paragraphLabel: string;
  paragraphText: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    reason: string;
  }[];
}

export interface ReadingTopicTrack {
  id: string;
  title: string;
  subtitle: string;
  passagesCount: number;
  focusBadge: string;
  icon: LucideIcon;
  skills: string[];
}

export interface ReadingBandStage {
  id: string;
  bandRange: string;
  name: string;
  vietnameseTitle: string;
  minBand: number;
  maxBand: number;
  description: string;
  focus: string;
}

export const READING_BAND_STAGES: ReadingBandStage[] = [
  {
    id: "foundation",
    bandRange: "4.5 - 5.5",
    name: "Foundation",
    vietnameseTitle: "Nền tảng Đọc hiểu",
    minBand: 4.5,
    maxBand: 5.5,
    description:
      "Làm quen với Passage 1, kỹ năng Skimming tìm ý chính và quét số liệu đơn giản.",
    focus: "Passage 1 Fact-finding & Điền từ vào bảng tóm tắt",
  },
  {
    id: "intermediate",
    bandRange: "5.5 - 6.5",
    name: "Intermediate",
    vietnameseTitle: "Bứt phá Band 6.5",
    minBand: 5.5,
    maxBand: 6.5,
    description:
      "Xử lý dạng bài True/False/Not Given không bị nhầm lẫn và Matching Headings.",
    focus: "Bẫy True/False/Not Given & Định vị đại từ thay thế",
  },
  {
    id: "upper-intermediate",
    bandRange: "6.5 - 7.5",
    name: "Upper-Intermediate",
    vietnameseTitle: "Mục tiêu Học thuật 7.0+",
    minBand: 6.5,
    maxBand: 7.5,
    description:
      "Tăng tốc độ đọc lên 250 WPM, phân tích lập luận học thuật Passage 2 và 3.",
    focus: "Multiple Choice 4 phương án & Phân tích thái độ tác giả",
  },
  {
    id: "advanced",
    bandRange: "7.5 - 9.0",
    name: "Advanced / Master",
    vietnameseTitle: "Chinh phục Band 8.0 - 9.0",
    minBand: 7.5,
    maxBand: 9.0,
    description:
      "Làm chủ bài đọc Passage 3 có độ trừu tượng cao, từ vựng hiếm và bẫy logic sâu sắc.",
    focus: "Hoàn thiện 38-40/40 câu trong 50 phút thay vì 60 phút",
  },
];

export const CURATED_PASSAGES: CuratedPassage[] = [
  {
    id: "rd-1",
    slug: "urban-microclimates-cool-roofs",
    title: "Urban Microclimates & The Cool Roofs Initiative",
    subtitle:
      "Nghiên cứu kiến trúc đô thị bền vững: tác động của sơn phản xạ nhiệt và thảm thực vật mái.",
    badge: "PASSAGE 1",
    badgeColor:
      "from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30",
    passageNumber: 1,
    category: "Architecture & Environment",
    bandRange: "5.5 - 6.5",
    bandGroup: "Band 4.5 - 6.5",
    wordCount: 780,
    estimatedMinutes: 14,
    questionsCount: 8,
    completed: false,
    paraphraseTraps: 5,
    paragraphs: [
      {
        id: "p1",
        label: "Paragraph A",
        text: "The phenomenon known as the Urban Heat Island (UHI) effect causes metropolitan centers to experience substantially higher temperatures than their surrounding rural peripheries. Dense concentrations of asphalt, concrete, and dark masonry absorb solar radiation throughout the day and steadily re-radiate thermal energy into the atmosphere well into the evening hours.",
      },
      {
        id: "p2",
        label: "Paragraph B",
        text: "In response to escalating summer energy demands for indoor air conditioning, civil engineers have implemented large-scale 'cool roof' retrofits. By coating conventional rooftop membranes with high-albedo elastomeric paint, surfaces can reflect upwards of eighty percent of incoming sunlight back into space, thereby curtailing heat transfer into the building interior.",
      },
      {
        id: "p3",
        label: "Paragraph C",
        text: "Furthermore, municipal pilot studies in Athens and Melbourne have shown that when cool roofs are paired with extensive green vegetation trays, ambient street-level temperatures decrease by up to two point three degrees Celsius. However, critics caution that during winter months, highly reflective surfaces may inadvertently increase domestic space heating requirements.",
      },
    ],
    vocab: [
      {
        word: "Albedo",
        meaning: "Suất phản chiếu của bề mặt",
        ipa: "/ælˈbiː.dəʊ/",
        context: "high-albedo elastomeric paint",
      },
      {
        word: "Periphery",
        meaning: "Vùng ngoại vi, ven đô",
        ipa: "/pəˈrɪf.ər.i/",
        context: "surrounding rural peripheries",
      },
      {
        word: "Curtail",
        meaning: "Cắt giảm, hạn chế",
        ipa: "/kɜːˈteɪl/",
        context: "thereby curtailing heat transfer",
      },
    ],
    questions: [
      {
        id: 1,
        type: "true_false_not_given",
        q: "Rural areas absorb more daytime solar radiation than major metropolitan centers.",
        answer: "FALSE",
        hint: "Đoạn A nêu rõ đô thị hấp thụ nhiều nhiệt hơn ngoại ô (UHI effect).",
      },
      {
        id: 2,
        type: "true_false_not_given",
        q: "Cool roofs can reflect more than 75% of solar radiation.",
        answer: "TRUE",
        hint: "Đoạn B ghi 'upwards of eighty percent', 80% > 75% nên khẳng định là TRUE.",
      },
      {
        id: 3,
        type: "true_false_not_given",
        q: "The Athens municipal government funded 100% of the cool roof retrofit costs.",
        answer: "NOT GIVEN",
        hint: "Đoạn C có nhắc nghiên cứu ở Athens nhưng không hề đề cập nguồn tiền hay tỉ lệ tài trợ.",
      },
    ],
  },
  {
    id: "rd-2",
    slug: "cetacean-vocal-learning",
    title: "Vocal Learning & Cultural Dialects in Cetaceans",
    subtitle:
      "Khám phá ngôn ngữ âm thanh học và hành vi truyền tải văn hóa ở cá voi sát thủ và cá heo.",
    badge: "PASSAGE 2",
    badgeColor:
      "from-cyan-500/20 to-teal-500/20 text-cyan-300 border-cyan-500/30",
    passageNumber: 2,
    category: "Marine Biology",
    bandRange: "6.5 - 7.5",
    bandGroup: "Band 6.5 - 7.5",
    wordCount: 890,
    estimatedMinutes: 18,
    questionsCount: 10,
    completed: false,
    paraphraseTraps: 7,
    paragraphs: [
      {
        id: "p1",
        label: "Paragraph A",
        text: "Unlike the vast majority of mammalian communication systems, which are largely genetically hardwired from birth, cetaceans—notably bottlenose dolphins and killer whales—exhibit sophisticated vocal production learning. Young calves acquire distinctive pod-specific click trains and whistles through direct auditory imitation of matrilineal elders.",
      },
      {
        id: "p2",
        label: "Paragraph B",
        text: "Bioacousticians operating hydrophone arrays in the Pacific Northwest have mapped discrete vocal repertoires among resident orca pods. Astonishingly, pods that share overlapping geographic hunting grounds maintain completely distinct dialects, suggesting that vocal divergence acts as a social boundary mechanism to prevent inbreeding.",
      },
      {
        id: "p3",
        label: "Paragraph C",
        text: "Laboratory experiments further demonstrate that dolphins can copy novel synthetic computer-generated acoustic frequencies within mere hours of exposure. Such empirical evidence firmly dismantles the long-held anthropocentric assumption that linguistic imitation is unique to primates.",
      },
    ],
    vocab: [
      {
        word: "Matrilineal",
        meaning: "Theo dòng mẹ",
        ipa: "/ˌmæt.rɪˈlɪn.i.əl/",
        context: "imitation of matrilineal elders",
      },
      {
        word: "Anthropocentric",
        meaning: "Lấy con người làm trung tâm",
        ipa: "/ˌæn.θrə.pəˈsen.trɪk/",
        context: "anthropocentric assumption",
      },
      {
        word: "Discrete",
        meaning: "Riêng biệt, rời rạc",
        ipa: "/dɪˈskriːt/",
        context: "mapped discrete vocal repertoires",
      },
    ],
    questions: [
      {
        id: 1,
        type: "matching_headings",
        q: "What is the primary function of distinctive dialects among overlapping orca pods?",
        answer: "A social barrier to discourage inbreeding",
        hint: "Xem câu cuối Đoạn B: 'acts as a social boundary mechanism to prevent inbreeding'.",
      },
      {
        id: 2,
        type: "true_false_not_given",
        q: "Most mammal communication sounds are acquired through vocal imitation after birth.",
        answer: "FALSE",
        hint: "Đoạn A nói 'vast majority... genetically hardwired from birth', cá voi mới là ngoại lệ.",
      },
    ],
  },
  {
    id: "rd-3",
    slug: "space-archaeology-remote-sensing",
    title: "Space Archaeology: Satellite Remote Sensing",
    subtitle:
      "Ứng dụng vệ tinh quang phổ hồng ngoại và radar LiDAR để phát hiện di tích cổ bị chôn vùi.",
    badge: "PASSAGE 3",
    badgeColor:
      "from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/40",
    passageNumber: 3,
    category: "Archaeology & Tech",
    bandRange: "7.5 - 9.0",
    bandGroup: "Band 7.5 - 9.0",
    wordCount: 1050,
    estimatedMinutes: 20,
    questionsCount: 10,
    completed: false,
    paraphraseTraps: 11,
    paragraphs: [
      {
        id: "p1",
        label: "Paragraph A",
        text: "The discipline of archaeology has undergone a profound paradigm shift. Where past excavators relied almost exclusively on destructive trenching and localized surface surveys, contemporary researchers increasingly harness orbital multispectral sensors and airborne Light Detection and Ranging (LiDAR) instrumentation to unmask anthropogenic earthworks invisible to the naked terrestrial eye.",
      },
      {
        id: "p2",
        label: "Paragraph B",
        text: "Subsurface architectural ruins, such as subterranean stone foundations or compacted ancient roadways, subtly alter the density, moisture retention, and chemical composition of the overlying topsoil. Consequently, vegetation flourishing directly above these buried structures exhibits differentiated infrared reflectance—manifesting as distinctive 'crop marks' detectable from orbit.",
      },
      {
        id: "p3",
        label: "Paragraph C",
        text: "In the densely forested Maya biosphere of northern Guatemala, LiDAR pulses penetrating the dense rainforest canopy revealed more than sixty thousand previously undocumented structures, radically overturning demographic models regarding pre-Columbian urban population density.",
      },
    ],
    vocab: [
      {
        word: "Anthropogenic",
        meaning: "Do con người tạo ra",
        ipa: "/ˌæn.θrə.pəˈdʒen.ɪk/",
        context: "anthropogenic earthworks",
      },
      {
        word: "Overlying",
        meaning: "Nằm đè lên phía trên",
        ipa: "/ˌəʊ.vəˈlaɪ.ɪŋ/",
        context: "overlying topsoil",
      },
      {
        word: "Paradigm shift",
        meaning: "Sự thay đổi bước ngoặt về tư duy",
        ipa: "/ˈpær.ə.daɪm ʃɪft/",
        context: "undergone a profound paradigm shift",
      },
    ],
    questions: [
      {
        id: 1,
        type: "true_false_not_given",
        q: "Traditional archaeology relied primarily on non-invasive satellite observations.",
        answer: "FALSE",
        hint: "Đoạn A: Phương pháp cũ là destructive trenching (đào rãnh), vệ tinh là công nghệ hiện đại.",
      },
      {
        id: 2,
        type: "true_false_not_given",
        q: "LiDAR revealed that the ancient Maya population was significantly smaller than previously assumed.",
        answer: "FALSE",
        hint: "Đoạn C: 60.000 công trình mới cho thấy mật độ đô thị cao hơn nhiều, đảo ngược giả thuyết cũ.",
      },
    ],
  },
  {
    id: "rd-4",
    slug: "biomimicry-architecture-termites",
    title: "Biomimetic Architecture: The Eastgate Centre",
    subtitle:
      "Bài học từ cấu trúc tổ mối châu Phi giúp tòa nhà tại Zimbabwe làm mát tự nhiên không cần máy lạnh.",
    badge: "POPULAR",
    badgeColor:
      "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40",
    passageNumber: 2,
    category: "Engineering & Biology",
    bandRange: "6.5 - 7.5",
    bandGroup: "Band 6.5 - 7.5",
    wordCount: 820,
    estimatedMinutes: 16,
    questionsCount: 8,
    completed: false,
    paraphraseTraps: 6,
    paragraphs: [
      {
        id: "p1",
        label: "Paragraph A",
        text: "Architect Mick Pearce achieved an engineering landmark with the Eastgate Centre in Harare, Zimbabwe. Seeking to curtail electricity consumption in a region with severe diurnal temperature swings, Pearce eschewed conventional air-conditioning units, instead drawing inspiration from the self-cooling mounds built by indigenous Macrotermes bellicosus termites.",
      },
      {
        id: "p2",
        label: "Paragraph B",
        text: "Termite mounds constantly vent warm air upwards through a complex network of internal flues, drawing cooler nocturnal air in at the base. By embedding porous concrete blocks and automated low-wattage extraction fans, Eastgate consumes thirty-five percent less energy than comparable conventional structures, yielding substantial operational cost savings.",
      },
    ],
    vocab: [
      {
        word: "Eschew",
        meaning: "Tránh né, từ bỏ việc sử dụng",
        ipa: "/ɪsˈtʃuː/",
        context: "Pearce eschewed conventional air-conditioning",
      },
      {
        word: "Diurnal",
        meaning: "Diễn ra trong chu kỳ ngày-đêm",
        ipa: "/daɪˈɜː.nəl/",
        context: "severe diurnal temperature swings",
      },
    ],
    questions: [
      {
        id: 1,
        type: "true_false_not_given",
        q: "The Eastgate Centre relies entirely on standard electric air conditioning compressors.",
        answer: "FALSE",
        hint: "Đoạn A: Pearce đã 'eschewed conventional air-conditioning units'.",
      },
    ],
  },
];

export const TRUE_FALSE_TRAPS: TrueFalseTrap[] = [
  {
    id: "tf-1",
    passageSnippet:
      "The council unanimously approved funding for secondary school renovations, while deliberately postponing decisions on community recreation facilities.",
    statement:
      "The council decided to allocate budget to community recreation facilities immediately.",
    answer: "FALSE",
    explanation:
      "Bài đọc dùng 'deliberately postponing' (cố tình hoãn lại), trái ngược hoàn toàn với khẳng định 'allocate budget immediately' (cấp tiền ngay).",
    trapType: "Direct Contradiction",
  },
  {
    id: "tf-2",
    passageSnippet:
      "Scientists observed that adolescent chimpanzees frequently shared foraging tools with younger siblings under laboratory conditions.",
    statement:
      "Chimpanzees always share their tools with other members of their troop in the wild.",
    answer: "FALSE",
    explanation:
      "Bài đọc dùng từ chỉ tần suất 'frequently' (thường xuyên) trong 'laboratory' (phòng thí nghiệm), câu hỏi nâng thành 'always' (luôn luôn) và đổi bối cảnh sang 'in the wild' (ngoài tự nhiên).",
    trapType: "Missing Degree/Frequency",
  },
  {
    id: "tf-3",
    passageSnippet:
      "Extensive archaeological excavations at the coastal settlement uncovered imported glass beads dating to the late Bronze Age.",
    statement:
      "The coastal settlement was conquered by Mediterranean merchants during the Bronze Age.",
    answer: "NOT GIVEN",
    explanation:
      "Bài đọc xác nhận có tìm thấy 'imported glass beads' (hạt thủy tinh nhập khẩu), chứng tỏ có giao thương, nhưng hoàn toàn KHÔNG đề cập việc bị 'conquered' (xâm chiếm).",
    trapType: "Plausible but Unmentioned",
  },
  {
    id: "tf-4",
    passageSnippet:
      "While photovoltaic panels can generate substantial energy on cloudy days, their peak efficiency drops by approximately forty percent compared to direct sunshine.",
    statement:
      "Solar panels cease functioning completely when cloud cover is present.",
    answer: "FALSE",
    explanation:
      "Bài đọc nói vẫn sinh điện đáng kể ('generate substantial energy'), chỉ là hiệu suất giảm 40%, không phải ngừng hoạt động hoàn toàn ('cease functioning completely').",
    trapType: "Direct Contradiction",
  },
];

export const SPEED_READING_TEXTS: SpeedReadingText[] = [
  {
    id: "speed-1",
    title: "The Physics of Deep-Sea Hydrothermal Vents",
    wordCount: 112,
    text: "Deep-sea hydrothermal vents are fissures on the ocean floor that geothermally heat water up to four hundred degrees Celsius without boiling, due to immense hydrostatic pressure. Despite total darkness and toxic dissolved minerals, rich ecosystems thrive around these vents. Bacteria utilize chemosynthesis rather than photosynthesis to convert sulfur compounds into organic matter, forming the foundational trophic level for giant tube worms, vent crabs, and blind shrimp.",
    checkQuestion: {
      q: "What primary biochemical process fuels vent ecosystems instead of photosynthesis?",
      options: [
        "Cellular respiration",
        "Chemosynthesis",
        "Photolysis",
        "Anaerobic fermentation",
      ],
      answer: "Chemosynthesis",
    },
  },
  {
    id: "speed-2",
    title: "Neuroplasticity and Second Language Acquisition",
    wordCount: 105,
    text: "Neuroplasticity refers to the brain's capacity to reorganize neural pathways across the lifespan. In adult language learners, intensive immersion stimulates gray matter density in the left inferior parietal cortex. Although younger children acquire phonetic nuances effortlessly due to open critical periods, adult learners leverage cognitive metacognition to master complex syntactic rules at an accelerated pace when provided structured analytical feedback.",
    checkQuestion: {
      q: "Which cognitive advantage allows adults to learn complex grammar rules efficiently?",
      options: [
        "Genetic predispositions",
        "Metacognition and analytical feedback",
        "Rote memorization",
        "Sensory cortex expansion",
      ],
      answer: "Metacognition and analytical feedback",
    },
  },
];

export const MATCHING_HEADING_TRAPS: MatchingHeadingTrap[] = [
  {
    id: "mh-1",
    paragraphLabel: "Paragraph A",
    paragraphText:
      "Throughout antiquity, obsidian—a naturally occurring volcanic glass—was prized above all other minerals for crafting surgical-grade blades and ritual ornamentation. Because each volcanic caldera produces glass with a unique trace element signature, modern geochemical spectrometry allows archaeologists to track ancient trade routes spanning thousands of kilometers across prehistoric Mesoamerica.",
    options: [
      {
        id: "opt-1",
        text: "The aesthetic brilliance of ancient ritual artifacts",
        isCorrect: false,
        reason:
          "Bẫy chi tiết phụ: Đoạn văn chỉ nhắc đến 'ritual ornamentation' như một ví dụ nhỏ, không phải ý chính.",
      },
      {
        id: "opt-2",
        text: "Tracing prehistoric commerce through geochemical signatures of obsidian",
        isCorrect: true,
        reason:
          "Chính xác: Toàn bộ đoạn văn giải thích cách phân tích nguyên tố vết trong đá obsidian để vẽ bản đồ lộ trình thương mại cổ đại.",
      },
      {
        id: "opt-3",
        text: "The modern geological formation of volcanic calderas",
        isCorrect: false,
        reason:
          "Bẫy lạc đề: Đoạn văn không giảng dạy về cách núi lửa hình thành mà nói về khảo cổ học.",
      },
    ],
  },
];

export const READING_TOPIC_TRACKS: ReadingTopicTrack[] = [
  {
    id: "rt-1",
    title: "Environmental Science & Sustainability",
    subtitle:
      "Biến đổi khí hậu, năng lượng tái tạo, đô thị xanh (Passage 1 & 2)",
    passagesCount: 15,
    focusBadge: "Passage 1 & 2",
    icon: Compass,
    skills: [
      "True/False/Not Given",
      "Summary Completion",
      "Flowchart Matching",
    ],
  },
  {
    id: "rt-2",
    title: "Psychology & Cognitive Science",
    subtitle: "Hành vi con người, trí nhớ, phản xạ ngôn ngữ (Passage 2 & 3)",
    passagesCount: 12,
    focusBadge: "Passage 2 & 3",
    icon: BrainCircuit,
    skills: ["Matching Headings", "Writer's Views", "Multiple Choice"],
  },
  {
    id: "rt-3",
    title: "History, Archaeology & Anthropology",
    subtitle: "Văn minh cổ đại, khảo cổ học công nghệ cao (Passage 1 & 3)",
    passagesCount: 14,
    focusBadge: "Passage 1 & 3",
    icon: BookOpen,
    skills: ["Timeline Matching", "Classification", "Note Completion"],
  },
  {
    id: "rt-4",
    title: "Biotechnology & Marine Ecology",
    subtitle: "Hệ sinh thái biển sâu, sinh vật học tiến hóa (Passage 2)",
    passagesCount: 10,
    focusBadge: "Passage 2",
    icon: Layers,
    skills: ["Technical Vocab", "Sentence Completion", "Cause & Effect"],
  },
  {
    id: "rt-5",
    title: "Engineering & Applied Technology",
    subtitle: "Vật liệu sinh học, AI, khám phá không gian (Passage 3)",
    passagesCount: 16,
    focusBadge: "Passage 3",
    icon: Search,
    skills: ["Diagram Labelling", "Academic Paraphrase", "Dense Inference"],
  },
  {
    id: "rt-6",
    title: "Economics & Global Commerce",
    subtitle: "Thương mại quốc tế, logistics, chuỗi cung ứng (Passage 1 & 2)",
    passagesCount: 11,
    focusBadge: "Passage 1 & 2",
    icon: FileText,
    skills: ["Statistical Trends", "Fact Checking", "Short Answer"],
  },
];
