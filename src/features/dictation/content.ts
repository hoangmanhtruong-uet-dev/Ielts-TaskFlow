import type { DictationExercise } from "./model";

export const DICTATION_CATALOG: DictationExercise[] = [
  {
    slug: "community-library-visit",
    title: "Community Library Registration",
    description:
      "Luyện nghe dialogue hội thoại đăng ký thẻ thư viện cộng đồng (IELTS Listening Section 1).",
    category: "Campus & Daily Life",
    difficulty: "intermediate",
    audioUrl: "/audio/listening/community-library-visit.wav",
    durationSeconds: 165,
    sentences: [
      {
        id: "s1",
        position: 1,
        text: "Good morning. How can I help you today?",
        startTime: 0,
        endTime: 4,
        translation: "Xin chào buổi sáng. Tôi có thể giúp gì cho bạn hôm nay?",
        hint: "Greeting question by librarian",
      },
      {
        id: "s2",
        position: 2,
        text: "Hi, I'd like to register for a library card.",
        startTime: 4.5,
        endTime: 9,
        translation: "Xin chào, tôi muốn đăng ký làm thẻ thư viện.",
        hint: "Student stating request",
      },
      {
        id: "s3",
        position: 3,
        text: "I just moved into the neighborhood last week.",
        startTime: 9.5,
        endTime: 14,
        translation: "Tôi vừa chuyển đến khu xóm này vào tuần trước.",
        hint: "Reason for registering",
      },
      {
        id: "s4",
        position: 4,
        text: "Certainly. I'll just need to see some proof of address.",
        startTime: 14.5,
        endTime: 20,
        translation:
          "Chắc chắn rồi. Tôi sẽ cần xem giấy tờ chứng minh địa chỉ.",
        hint: "Librarian requesting document",
      },
      {
        id: "s5",
        position: 5,
        text: "A utility bill or a driver's license will be fine.",
        startTime: 20.5,
        endTime: 26,
        translation: "Hóa đơn điện nước hoặc bằng lái xe đều được.",
        hint: "Examples of proof of address",
      },
      {
        id: "s6",
        position: 6,
        text: "I have my electricity bill right here in my bag.",
        startTime: 26.5,
        endTime: 32,
        translation: "Tôi có hóa đơn tiền điện ngay đây trong túi xách.",
        hint: "Student providing document",
      },
    ],
  },
  {
    slug: "daily-greetings-breakfast",
    title: "Morning Routine & Breakfast",
    description:
      "Luyện chép chính tả hội thoại ngắn hàng ngày về thói quen buổi sáng.",
    category: "Daily Life",
    difficulty: "beginner",
    audioUrl: "/audio/listening/community-library-visit.wav",
    durationSeconds: 90,
    sentences: [
      {
        id: "d1",
        position: 1,
        text: "What time do you usually wake up in the morning?",
        startTime: 0,
        endTime: 5,
        translation: "Bạn thường thức dậy lúc mấy giờ vào buổi sáng?",
      },
      {
        id: "d2",
        position: 2,
        text: "I usually get up at six thirty and drink a glass of water.",
        startTime: 5.5,
        endTime: 11,
        translation: "Tôi thường dậy lúc 6:30 và uống một cốc nước.",
      },
      {
        id: "d3",
        position: 3,
        text: "Do you prefer coffee or fresh tea with your breakfast?",
        startTime: 11.5,
        endTime: 17,
        translation: "Bạn thích cà phê hay trà tươi cùng bữa sáng?",
      },
      {
        id: "d4",
        position: 4,
        text: "I prefer hot green tea because it makes me feel refreshed.",
        startTime: 17.5,
        endTime: 24,
        translation: "Tôi thích trà xanh nóng vì nó giúp tôi thấy sảng khoái.",
      },
    ],
  },
  {
    slug: "job-interview-prep",
    title: "Professional Job Interview",
    description:
      "Chép chính tả hội thoại phỏng vấn xin việc tiếng Anh môi trường công sở.",
    category: "Business & Work",
    difficulty: "intermediate",
    audioUrl: "/audio/listening/community-library-visit.wav",
    durationSeconds: 120,
    sentences: [
      {
        id: "j1",
        position: 1,
        text: "Could you tell me a little bit about your background experience?",
        startTime: 0,
        endTime: 6,
        translation:
          "Bạn có thể chia sẻ một chút về kinh nghiệm làm việc của bạn không?",
      },
      {
        id: "j2",
        position: 2,
        text: "I have worked as a software developer for over three years.",
        startTime: 6.5,
        endTime: 12,
        translation: "Tôi đã làm lập trình viên phần mềm hơn ba năm.",
      },
      {
        id: "j3",
        position: 3,
        text: "My core strength is solving complex technical challenges efficiently.",
        startTime: 12.5,
        endTime: 19,
        translation:
          "Thế mạnh cốt lõi của tôi là giải quyết các thách thức kỹ thuật phức tạp một cách hiệu quả.",
      },
      {
        id: "j4",
        position: 4,
        text: "We are looking for someone who communicates well in a team.",
        startTime: 19.5,
        endTime: 25,
        translation:
          "Chúng tôi đang tìm kiếm người có khả năng giao tiếp tốt trong đội ngũ.",
      },
    ],
  },
  {
    slug: "academic-climate-change",
    title: "Renewable Energy & Climate Action",
    description:
      "Luyện nghe chép chính tả bài giảng học thuật chủ đề năng lượng tái tạo.",
    category: "Academic & IELTS",
    difficulty: "advanced",
    audioUrl: "/audio/listening/community-library-visit.wav",
    durationSeconds: 150,
    sentences: [
      {
        id: "a1",
        position: 1,
        text: "Global climate initiatives require rapid transition toward renewable energy sources.",
        startTime: 0,
        endTime: 7,
        translation:
          "Các sáng kiến khí hậu toàn cầu đòi hỏi sự chuyển dịch nhanh chóng sang năng lượng tái tạo.",
      },
      {
        id: "a2",
        position: 2,
        text: "Solar and wind infrastructure reduced greenhouse gas emissions significantly.",
        startTime: 7.5,
        endTime: 14,
        translation:
          "Cơ sở hạ tầng điện mặt trời và gió đã làm giảm đáng kể lượng khí thải nhà kính.",
      },
      {
        id: "a3",
        position: 3,
        text: "Researchers suggest policy makers incentivize clean technology investments nationwide.",
        startTime: 14.5,
        endTime: 22,
        translation:
          "Các nhà nghiên cứu kiến nghị các nhà chính sách nên khuyến khích đầu tư công nghệ sạch toàn quốc.",
      },
    ],
  },
];

export function getDictationCatalog(): DictationExercise[] {
  return DICTATION_CATALOG;
}

export function getDictationBySlug(slug: string): DictationExercise | null {
  return DICTATION_CATALOG.find((item) => item.slug === slug) ?? null;
}
