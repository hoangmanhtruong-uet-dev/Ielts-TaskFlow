export interface CuratedWritingTask {
  id: string;
  slug: string;
  taskType: "task1" | "task2";
  category:
    | "Bar Chart"
    | "Line Graph"
    | "Process"
    | "Opinion"
    | "Discussion"
    | "Problem-Solution";
  title: string;
  topic: string;
  targetBand: number;
  timeLimitMinutes: number;
  minWords: number;
  prompt: string;
  chartDescription?: string;
  keyInstructions: string[];
  recommendedVocabulary: {
    word: string;
    meaning: string;
    band: string;
  }[];
  modelOutline: {
    paragraph: string;
    focus: string;
    starterPhrase: string;
  }[];
  sampleHighBandExcerpt?: string;
}

export interface WritingBandStage {
  band: string;
  name: string;
  taskResponseTarget: string;
  coherenceTarget: string;
  lexicalTarget: string;
}

export interface ParaphraseDrill {
  id: string;
  originalSentence: string;
  band6Attempt: string;
  band8Paraphrase: string;
  technique: string;
}

export interface CohesiveDevice {
  category:
    "Contrast" | "Causation" | "Concession" | "Exemplification" | "Addition";
  commonLinkers: string[];
  advancedBand8Linkers: string[];
  exampleSentence: string;
}

export const WRITING_BAND_STAGES: WritingBandStage[] = [
  {
    band: "5.0 - 5.5",
    name: "Emerging Writer",
    taskResponseTarget:
      "Trả lời được câu hỏi chính nhưng còn sơ sài, thiếu dẫn chứng cụ thể.",
    coherenceTarget:
      "Sử dụng từ nối cơ bản (and, but, so), các đoạn văn chưa cân đối.",
    lexicalTarget:
      "Vốn từ hạn chế, dễ lặp từ vựng trong đề bài, còn nhiều lỗi chính tả.",
  },
  {
    band: "6.0 - 6.5",
    name: "Competent Essayist",
    taskResponseTarget:
      "Bao quát được các luận điểm chính, mở bài và kết bài rõ ràng.",
    coherenceTarget:
      "Sắp xếp thông tin mạch lạc, dùng các liên từ phổ biến tương đối chính xác.",
    lexicalTarget:
      "Có vốn từ vựng học thuật cơ bản, biết cách paraphrase dù đôi chỗ còn gượng gạo.",
  },
  {
    band: "7.0 - 7.5",
    name: "Advanced Rhetorician",
    taskResponseTarget:
      "Luận điểm sâu sắc, phát triển ý chặt chẽ với các ví dụ thực tiễn thuyết phục.",
    coherenceTarget:
      "Dòng chảy lập luận tự nhiên, chuyển đoạn mượt mà không bị lạm dụng từ nối cơ học.",
    lexicalTarget:
      "Sử dụng thành thạo từ vựng ít phổ biến (uncommon lexical items) và collocations chuẩn xác.",
  },
  {
    band: "8.0 - 9.0",
    name: "Master Stylist",
    taskResponseTarget:
      "Phản hồi toàn diện mọi khía cạnh của đề thi với góc nhìn sắc bén, thông tuệ.",
    coherenceTarget:
      "Cấu trúc bài viết hoàn hảo, nghệ thuật liên kết ý tinh tế ở cấp độ câu và đoạn.",
    lexicalTarget:
      "Vốn từ phong phú, uyển chuyển, độ chính xác tuyệt đối như bài viết học thuật quốc tế.",
  },
];

export const CURATED_WRITING_TASKS: CuratedWritingTask[] = [
  {
    id: "w-01",
    slug: "renewable-energy-investment",
    taskType: "task2",
    category: "Opinion",
    title: "Government Expenditure on Renewable Energy vs Healthcare",
    topic: "Energy & Public Policy",
    targetBand: 7.5,
    timeLimitMinutes: 40,
    minWords: 250,
    prompt:
      "Some people believe that governments should spend more money on developing renewable energy sources. Others argue that immediate sectors like public health and education should take precedence. Discuss both views and give your own opinion.",
    keyInstructions: [
      "Analyze the long-term ecological benefits of clean energy infrastructure",
      "Evaluate the urgent societal necessity of healthcare and primary education",
      "State a clear, balanced perspective supported by empirical reasoning",
    ],
    recommendedVocabulary: [
      { word: "Subsidize", meaning: "Trợ cấp ngân sách nhà nước", band: "C1" },
      {
        word: "Fossil fuel dependence",
        meaning: "Sự phụ thuộc vào nhiên liệu hóa thạch",
        band: "C1",
      },
      {
        word: "Fiscal allocation",
        meaning: "Phân bổ ngân sách tài khóa",
        band: "C2",
      },
      {
        word: "Imperative",
        meaning: "Mệnh lệnh cấp bách, thiết yếu",
        band: "C1",
      },
    ],
    modelOutline: [
      {
        paragraph: "Introduction",
        focus: "Paraphrase đề bài + Thesis Statement nghiêng về phân bổ kép",
        starterPhrase: "In contemporary public administration debates...",
      },
      {
        paragraph: "Body Paragraph 1",
        focus: "Tầm quan trọng sống còn của việc đầu tư năng lượng tái tạo",
        starterPhrase:
          "Advocates of ecological investment legitimately assert that...",
      },
      {
        paragraph: "Body Paragraph 2",
        focus: "Áp lực trước mắt của hệ thống y tế và giáo dục cơ bản",
        starterPhrase:
          "Conversely, proponents of immediate public welfare maintain that...",
      },
      {
        paragraph: "Conclusion",
        focus:
          "Khẳng định đầu tư năng lượng là bảo vệ sức khỏe thế hệ tương lai",
        starterPhrase:
          "In final analysis, rather than treating these domains as mutually exclusive...",
      },
    ],
    sampleHighBandExcerpt:
      "In contemporary public administration debates, striking an equitable balance between immediate social welfare and long-term ecological security represents a formidable challenge...",
  },
  {
    id: "w-02",
    slug: "urban-transport-co2-trends",
    taskType: "task1",
    category: "Line Graph",
    title: "Carbon Emissions across European Transport Sectors (2000–2025)",
    topic: "Environment & Transportation",
    targetBand: 7.0,
    timeLimitMinutes: 20,
    minWords: 150,
    prompt:
      "The line graph illustrates carbon dioxide emissions generated by four distinct modes of transportation (Private Cars, Public Rail, Aviation, Maritime Shipping) across Western Europe between 2000 and 2025.",
    chartDescription:
      "Private cars experienced a noticeable downward trajectory from 450 Mt to 320 Mt; Aviation surged exponentially; Rail remained consistently minimal under 50 Mt.",
    keyInstructions: [
      "Summarize the information by selecting and reporting the main trends",
      "Make relevant comparisons where appropriate without giving personal opinions",
      "Ensure an explicit Overview paragraph highlighting key trends",
    ],
    recommendedVocabulary: [
      {
        word: "Downward trajectory",
        meaning: "Xu hướng đi xuống rõ rệt",
        band: "C1",
      },
      {
        word: "Exponential surge",
        meaning: "Sự tăng vọt đột biến theo cấp số nhân",
        band: "C2",
      },
      {
        word: "Plateaued",
        meaning: "Đi ngang ổn định ở mức phẳng",
        band: "C1",
      },
      {
        word: "Negligible proportion",
        meaning: "Tỷ trọng không đáng kể",
        band: "C1",
      },
    ],
    modelOutline: [
      {
        paragraph: "Introduction",
        focus: "Paraphrase đề bài và các trục tọa độ",
        starterPhrase:
          "The line chart delineates the volume of carbon emissions...",
      },
      {
        paragraph: "Overview",
        focus:
          "Nêu 2 đặc điểm nổi bật nhất (Xe cá nhân giảm, Hàng không tăng vọt)",
        starterPhrase:
          "Overall, what stands out from the graph is that while...",
      },
      {
        paragraph: "Body 1: Road & Rail",
        focus: "Chi tiết số liệu xe hơi cá nhân và tàu hỏa đường sắt",
        starterPhrase:
          "Regarding terrestrial transportation, private automobiles...",
      },
      {
        paragraph: "Body 2: Air & Sea",
        focus: "Chi tiết số liệu hàng không và hàng hải thương mại",
        starterPhrase:
          "Turning to aviation and maritime transport, a contrasting picture emerges...",
      },
    ],
  },
  {
    id: "w-03",
    slug: "remote-work-productivity-isolation",
    taskType: "task2",
    category: "Discussion",
    title: "Remote Work Revolution: Autonomy vs Social Alienation",
    topic: "Work & Modern Society",
    targetBand: 7.5,
    timeLimitMinutes: 40,
    minWords: 250,
    prompt:
      "The widespread adoption of remote work has fundamentally transformed professional life. While some praise the unprecedented flexibility it offers, others lament the erosion of workplace camaraderie and psychological isolation. Discuss both sides and state your view.",
    keyInstructions: [
      "Analyze autonomy, commute reduction and productivity metrics",
      "Examine mental health implications and collaboration friction",
      "Provide a reasoned perspective on hybrid working models",
    ],
    recommendedVocabulary: [
      {
        word: "Spatial autonomy",
        meaning: "Sự tự chủ về không gian làm việc",
        band: "C2",
      },
      {
        word: "Social alienation",
        meaning: "Sự xa lánh, cô lập xã hội",
        band: "C1",
      },
      {
        word: "Workplace cohesion",
        meaning: "Sự gắn kết trong môi trường làm việc",
        band: "C1",
      },
      {
        word: "Hybrid paradigm",
        meaning: "Mô hình kết hợp linh hoạt",
        band: "C1",
      },
    ],
    modelOutline: [
      {
        paragraph: "Introduction",
        focus: "Giới thiệu bối cảnh hậu đại dịch + Luận đề ủng hộ mô hình lai",
        starterPhrase:
          "The accelerated transition toward decentralized working environments...",
      },
      {
        paragraph: "Body Paragraph 1",
        focus:
          "Lợi ích: tiết kiệm thời gian di chuyển, tối ưu nhịp sinh học cá nhân",
        starterPhrase:
          "On the one hand, remote arrangements confer unparalleled flexibility...",
      },
      {
        paragraph: "Body Paragraph 2",
        focus:
          "Thách thức: mất ranh giới công việc - đời sống, thiếu tương tác người - người",
        starterPhrase:
          "On the other hand, prolonged telecommuting can engender subtle psychological costs...",
      },
      {
        paragraph: "Conclusion",
        focus: "Tổng kết: mô hình hybrid là giải pháp hài hòa tối ưu",
        starterPhrase:
          "To recapitulate, while the benefits of telework are indisputable...",
      },
    ],
  },
];

export const PARAPHRASE_DRILLS: ParaphraseDrill[] = [
  {
    id: "p-01",
    originalSentence:
      "Many people think that cars cause too much pollution in cities.",
    band6Attempt:
      "A lot of people believe that vehicles create pollution in urban areas.",
    band8Paraphrase:
      "A prevailing body of opinion contends that private motor transport constitutes the primary driver of atmospheric degradation in metropolitan centers.",
    technique:
      "Nâng cấp danh từ học thuật ('atmospheric degradation') và cụm từ động ('primary driver').",
  },
  {
    id: "p-02",
    originalSentence:
      "The chart shows how much money was spent on food from 2010 to 2020.",
    band6Attempt:
      "The chart displays the expenditure on food between 2010 and 2020.",
    band8Paraphrase:
      "The graph illustrates the financial outlay allocated to dietary necessities over a decade-long timeframe spanning 2010 to 2020.",
    technique:
      "Dùng 'financial outlay' thay cho 'spent money' và 'dietary necessities' thay cho 'food'.",
  },
  {
    id: "p-03",
    originalSentence:
      "Students should learn science subjects because it helps them find jobs.",
    band6Attempt:
      "Students ought to study sciences because it gives them better employment chances.",
    band8Paraphrase:
      "Prioritizing STEM disciplines equips learners with analytical competencies highly prized in the modern knowledge-driven labor market.",
    technique:
      "Thay đổi cấu trúc câu sang Danh động từ (Gerund Subject) kèm tính từ ghép ('knowledge-driven').",
  },
];

export const COHESIVE_DEVICES_MATRIX: CohesiveDevice[] = [
  {
    category: "Contrast",
    commonLinkers: ["However", "On the other hand", "But"],
    advancedBand8Linkers: [
      "Conversely",
      "By marked contrast",
      "This notwithstanding",
    ],
    exampleSentence:
      "Public investment in roads has surged; conversely, subsidization of mass rail transit has experienced stagnation.",
  },
  {
    category: "Causation",
    commonLinkers: ["Because", "So", "Therefore"],
    advancedBand8Linkers: [
      "Consequently",
      "It follows that",
      "In light of this consideration",
    ],
    exampleSentence:
      "Deforestation disrupts rainfall cycles; consequently, agricultural yields in adjacent regions suffer precipitous declines.",
  },
  {
    category: "Concession",
    commonLinkers: ["Although", "Even though"],
    advancedBand8Linkers: ["Admittedly", "Albeit", "Granting that"],
    exampleSentence:
      "Online education provides unmatched accessibility, albeit at the potential expense of spontaneous interpersonal discourse.",
  },
  {
    category: "Exemplification",
    commonLinkers: ["For example", "For instance"],
    advancedBand8Linkers: [
      "A salient illustration of this is",
      "Case in point",
      "Exemplified by",
    ],
    exampleSentence:
      "Urban densification can overwhelm infrastructure, a salient illustration of this being the severe gridlock in megacities.",
  },
];
