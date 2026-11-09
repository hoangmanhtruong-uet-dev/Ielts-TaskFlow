export interface SpeakingCueCard {
  id: string;
  slug: string;
  part: 1 | 2 | 3;
  title: string;
  topic: string;
  targetBand: number;
  estimatedMinutes: number;
  prompt: string;
  bulletPoints?: string[];
  followUpQuestions?: string[];
  vocabularyHighlights: {
    word: string;
    ipa: string;
    meaning: string;
    band: string;
  }[];
  sampleBand8Response?: string;
}

export interface IPAPhonemePair {
  id: string;
  title: string;
  soundA: { symbol: string; word: string; ipa: string };
  soundB: { symbol: string; word: string; ipa: string };
  trapExplanation: string;
  nativeTip: string;
}

export interface FluencyFillerFix {
  id: string;
  badFiller: string;
  category: "Hesitation" | "Overused" | "Informal";
  academicAlternatives: string[];
  bandBoostTip: string;
}

export interface SpeakingBandStage {
  band: string;
  name: string;
  fluencyDescriptor: string;
  pronunciationTarget: string;
  lexicalTarget: string;
}

export const SPEAKING_BAND_STAGES: SpeakingBandStage[] = [
  {
    band: "5.0 - 5.5",
    name: "Foundation Speaker",
    fluencyDescriptor:
      "Nói lưu loát ở câu đơn, còn ngập ngừng khi triển khai ý phức tạp.",
    pronunciationTarget: "Phát âm rõ ràng, sửa triệt để âm đuôi /s/, /t/, /d/.",
    lexicalTarget:
      "Sử dụng từ vựng quen thuộc chính xác, tránh dịch thô từ tiếng Việt.",
  },
  {
    band: "6.0 - 6.5",
    name: "Competent Communicator",
    fluencyDescriptor:
      "Duy trì mạch nói dài, thỉnh thoảng dùng từ nối chưa tự nhiên.",
    pronunciationTarget:
      "Kiểm soát tốt trọng âm từ và ngữ điệu câu hỏi/khẳng định.",
    lexicalTarget:
      "Bắt đầu sử dụng collocations và thành ngữ theo chủ đề có kiểm soát.",
  },
  {
    band: "7.0 - 7.5",
    name: "Advanced Rhetorician",
    fluencyDescriptor:
      "Nói tự nhiên, hiếm khi ngập ngừng để tìm từ, phản xạ sắc bén.",
    pronunciationTarget:
      "Ngữ điệu tự nhiên, nuốt âm (linking words) và nhịp thở chuẩn bản xứ.",
    lexicalTarget:
      "Vốn từ học thuật phong phú, paraphrase linh hoạt và chính xác.",
  },
  {
    band: "8.0 - 9.0",
    name: "Master Orator",
    fluencyDescriptor:
      "Độ trôi chảy tuyệt đối, ngữ điệu giàu sắc thái biểu cảm và cảm xúc.",
    pronunciationTarget:
      "Hoàn hảo ở cấp độ âm vị và âm tiết, không có lỗi cấu âm.",
    lexicalTarget:
      "Sử dụng ngôn ngữ tự nhiên, uyển chuyển, tinh tế như người bản xứ có học thức.",
  },
];

export const CURATED_SPEAKING_CUE_CARDS: SpeakingCueCard[] = [
  {
    id: "spk-01",
    slug: "sustainable-lifestyle-habit",
    part: 2,
    title: "Describe an eco-friendly habit you adopted",
    topic: "Environment & Ecology",
    targetBand: 7.5,
    estimatedMinutes: 4,
    prompt:
      "Describe an environmental habit or change you have made in your daily life to protect the environment.",
    bulletPoints: [
      "What the habit is and when you adopted it",
      "How easy or challenging it was to begin",
      "What resources or methods you used",
      "And explain how you feel this habit impacts the planet.",
    ],
    followUpQuestions: [
      "Do you think individual actions can combat climate change effectively?",
      "How can governments incentivize green consumer habits?",
    ],
    vocabularyHighlights: [
      {
        word: "Carbon footprint",
        ipa: "/ˈkɑː.bən ˌfʊt.prɪnt/",
        meaning: "Lượng khí thải carbon của cá nhân",
        band: "C1",
      },
      {
        word: "Biodegradable",
        ipa: "/ˌbaɪ.əʊ.dɪˈɡreɪ.də.bəl/",
        meaning: "Có thể phân hủy sinh học",
        band: "C1",
      },
      {
        word: "Sustainable paradigm",
        ipa: "/səˈsteɪ.nə.bəl ˈpær.ə.daɪm/",
        meaning: "Mô hình phát triển bền vững",
        band: "C2",
      },
      {
        word: "Mitigate",
        ipa: "/ˈmɪt.ɪ.ɡeɪt/",
        meaning: "Làm giảm thiểu mức độ nghiêm trọng",
        band: "C1",
      },
    ],
    sampleBand8Response:
      "To be completely frank, adopting an eco-conscious lifestyle felt daunting initially. About two years ago, I decided to drastically curtail single-use plastics...",
  },
  {
    id: "spk-02",
    slug: "ai-revolution-impact",
    part: 3,
    title: "The Role of Artificial Intelligence in Education",
    topic: "Technology & Society",
    targetBand: 7.0,
    estimatedMinutes: 5,
    prompt:
      "How is artificial intelligence reshaping traditional classrooms, and what are the potential pitfalls?",
    bulletPoints: [
      "Explain the shift toward personalized adaptive learning",
      "Evaluate the risk of diminishing critical thinking skills",
      "Propose an ideal synergy between human educators and AI",
    ],
    followUpQuestions: [
      "Will automated systems eventually replace school teachers?",
      "How can equal access to high-tech tools be preserved across demographics?",
    ],
    vocabularyHighlights: [
      {
        word: "Pedagogical",
        ipa: "/ˌped.əˈɡɒdʒ.ɪ.kəl/",
        meaning: "Thuộc về phương pháp sư phạm",
        band: "C2",
      },
      {
        word: "Cognitive overload",
        ipa: "/ˈkɒɡ.nə.tɪv ˌəʊ.vəˈləʊd/",
        meaning: "Quá tải nhận thức",
        band: "C1",
      },
      {
        word: "Synergistic",
        ipa: "/ˌsɪn.əˈdʒɪs.tɪk/",
        meaning: "Có tính tương hỗ, cộng hưởng",
        band: "C2",
      },
      {
        word: "Disruptive",
        ipa: "/dɪsˈrʌp.tɪv/",
        meaning: "Đột phá, thay đổi hoàn toàn cục diện",
        band: "C1",
      },
    ],
  },
  {
    id: "spk-03",
    slug: "work-life-balance-urban",
    part: 1,
    title: "Daily Routine & Work-Life Equilibrium",
    topic: "Lifestyle & Wellbeing",
    targetBand: 6.5,
    estimatedMinutes: 3,
    prompt:
      "Tell me about your typical morning routine and how you decompress after demanding days.",
    bulletPoints: [
      "Time you wake up and first morning action",
      "How you prioritize tasks under deadlines",
      "Favorite evening wind-down activity",
    ],
    followUpQuestions: [
      "Do you prefer working early in the morning or late at night?",
      "Has your schedule changed noticeably over the past two years?",
    ],
    vocabularyHighlights: [
      {
        word: "Circadian rhythm",
        ipa: "/sɜːˈkeɪ.di.ən ˈrɪð.əm/",
        meaning: "Nhịp sinh học cơ thể",
        band: "C1",
      },
      {
        word: "Decompress",
        ipa: "/ˌdiː.kəmˈpres/",
        meaning: "Xả hơi, thư giãn sau căng thẳng",
        band: "B2",
      },
      {
        word: "Multitask",
        ipa: "/ˌmʌl.tiˈtɑːsk/",
        meaning: "Làm nhiều việc cùng lúc",
        band: "B2",
      },
    ],
  },
  {
    id: "spk-04",
    slug: "cultural-heritage-preservation",
    part: 2,
    title: "Describe a historical landmark in your country",
    topic: "History & Heritage",
    targetBand: 7.5,
    estimatedMinutes: 4,
    prompt:
      "Describe an architectural or historical site that has played an important role in your nation's history.",
    bulletPoints: [
      "Where it is situated and its architectural characteristics",
      "What historical event or era it is associated with",
      "Why people visit it today",
      "And explain why preserving such landmarks matters to future generations.",
    ],
    followUpQuestions: [
      "Should commercial tourism be restricted around delicate ancient ruins?",
      "How can modern virtual reality bridge the gap between youth and history?",
    ],
    vocabularyHighlights: [
      {
        word: "Architectural grandeur",
        ipa: "/ˌɑː.kɪˈtek.tʃər.əl ˈɡræn.dʒər/",
        meaning: "Sự tráng lệ về mặt kiến trúc",
        band: "C2",
      },
      {
        word: "Intangible heritage",
        ipa: "/ɪnˈtæn.dʒə.bəl ˈher.ɪ.tɪdʒ/",
        meaning: "Di sản phi vật thể",
        band: "C1",
      },
      {
        word: "Venerable",
        ipa: "/ˈven.ər.ə.bəl/",
        meaning: "Cổ kính, đáng tôn kính",
        band: "C2",
      },
    ],
  },
];

export const IPA_PHONEME_PAIRS: IPAPhonemePair[] = [
  {
    id: "ipa-01",
    title: "Âm ma sát răng: /θ/ vs /s/",
    soundA: { symbol: "/θ/", word: "Thought", ipa: "/θɔːt/" },
    soundB: { symbol: "/s/", word: "Sought", ipa: "/sɔːt/" },
    trapExplanation:
      "Người Việt hay rút lưỡi quá nhanh và biến âm /θ/ thành /s/ hoặc /t/ khiến giám khảo trừ điểm Pronunciation nặng.",
    nativeTip:
      "Đặt đầu lưỡi nhẹ giữa hai hàng răng, thở luồng khí êm không rung thanh quản trước khi phát âm nguyên âm.",
  },
  {
    id: "ipa-02",
    title: "Nguyên âm ngắn vs dài: /i:/ vs /ɪ/",
    soundA: { symbol: "/i:/", word: "Sheep", ipa: "/ʃiːp/" },
    soundB: { symbol: "/ɪ/", word: "Ship", ipa: "/ʃɪp/" },
    trapExplanation:
      "Nhầm lẫn giữa nguyên âm căng (tense) và lỏng (lax) làm sai nghĩa câu hoàn toàn (ví dụ: 'leave' vs 'live').",
    nativeTip:
      "Với /i:/, khóe miệng kéo dẹt sang hai bên như đang cười; với /ɪ/, thả lỏng cơ miệng và bật âm dứt khoát.",
  },
  {
    id: "ipa-03",
    title: "Cặp âm lướt: /w/ vs /v/",
    soundA: { symbol: "/w/", word: "West", ipa: "/west/" },
    soundB: { symbol: "/v/", word: "Vest", ipa: "/vest/" },
    trapExplanation:
      "Âm /v/ cần răng trên chạm môi dưới, còn /w/ chỉ chu tròn môi mà không để răng chạm môi.",
    nativeTip:
      "Tập nhìn gương: nếu phát âm 'water' mà răng cắn vào môi là sai cấu âm.",
  },
];

export const FLUENCY_FILLER_FIXES: FluencyFillerFix[] = [
  {
    id: "fix-01",
    badFiller: "Um... Uh... You know...",
    category: "Hesitation",
    academicAlternatives: [
      "That's a thought-provoking inquiry...",
      "If I were to look at this from another angle...",
      "To put it into clearer perspective...",
    ],
    bandBoostTip:
      "Giúp kéo dài 2-3 giây để não bộ suy nghĩ mà vẫn chứng minh vốn từ C1 mượt mà.",
  },
  {
    id: "fix-02",
    badFiller: "Like, like...",
    category: "Informal",
    academicAlternatives: [
      "To exemplify this phenomenon...",
      "A case in point would be...",
      "For instance, consider the situation where...",
    ],
    bandBoostTip:
      "Loại bỏ hoàn toàn thói quen dùng 'like' vô tội vạ của văn nói giao tiếp đường phố.",
  },
  {
    id: "fix-03",
    badFiller: "I think that... I think that...",
    category: "Overused",
    academicAlternatives: [
      "From my vantage point...",
      "I am inclined to believe that...",
      "Evidence strongly suggests that...",
    ],
    bandBoostTip:
      "Nâng cấp tiêu chí Lexical Resource từ Band 5.5 lên 7.5+ ngay tức thì.",
  },
];
