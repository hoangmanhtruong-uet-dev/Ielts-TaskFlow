/**
 * Script ingest Oxford 3000 & CEFR A1-B2 Core Vocabulary vào Database Supabase.
 *
 * Lựa chọn ~320 từ vựng cốt lõi phân bố đều theo 4 cấp độ:
 * - A1: 80 từ (Band 0 - 3.0)
 * - A2: 80 từ (Band 3.0 - 4.0)
 * - B1: 80 từ (Band 4.0 - 5.0)
 * - B2: 80 từ (Band 5.5 - 6.5)
 *
 * Tự động dịch định nghĩa sang tiếng Việt và xuất file migration SQL forward-only.
 */

import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const DATASET_URL =
  "https://raw.githubusercontent.com/winterdl/oxford-5000-vocabulary-audio-definition/main/data/oxford_3000.json";
const CACHE_FILE = resolve(__dirname, "oxford_3000_raw.json");
const OUTPUT_JSON = resolve(__dirname, "oxford_320_cefr_core.json");
const OUTPUT_MIGRATION = resolve(
  ROOT,
  "supabase/migrations/20261024100000_seed_oxford_cefr_vocabulary.sql",
);

// Map part of speech sang database constraint
function mapPos(type) {
  if (!type) return "noun";
  const t = type.toLowerCase().trim();
  if (t === "noun") return "noun";
  if (t.includes("adverb") || t === "adv") return "adverb";
  if (t === "adjective" || t === "ordinal number" || t === "adj")
    return "adjective";
  if (t.includes("verb")) return "verb";
  if (t === "preposition") return "preposition";
  if (t === "conjunction") return "conjunction";
  if (t === "pronoun") return "pronoun";
  if (t === "determiner" || t.includes("article") || t === "number")
    return "determiner";
  return "phrase";
}

function mapDifficulty(cefr) {
  const c = (cefr || "").toLowerCase();
  if (c === "a1" || c === "a2") return "beginner";
  if (c === "b1") return "intermediate";
  return "advanced"; // b2, c1, c2
}

function sanitizeSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Bảng dịch nhanh các từ phổ biến để tránh phụ thuộc hoàn toàn vào network
const VI_TRANSLATION_MAP = {
  // A1
  about: "về, khoảng chừng",
  above: "ở trên, phía trên",
  across: "băng qua, ngang qua",
  action: "hành động, hoạt động",
  activity: "hoạt động học tập hoặc sinh hoạt",
  actor: "diễn viên nam",
  actress: "diễn viên nữ",
  add: "thêm vào, cộng thêm",
  address: "địa chỉ nhà hoặc cơ quan",
  adult: "người trưởng thành",
  advice: "lời khuyên, ý kiến chỉ dẫn",
  afraid: "sợ hãi, lo lắng",
  after: "sau khi, sau đó",
  afternoon: "buổi chiều",
  again: "lặp lại, một lần nữa",
  age: "tuổi tác, thời đại",
  agree: "đồng ý, tán thành",
  air: "không khí, bầu trời",
  airport: "sân bay, phi trường",
  all: "tất cả, toàn bộ",
  also: "cũng, ngoài ra",
  always: "luôn luôn, lúc nào cũng",
  amazing: "tuyệt vời, đáng kinh ngạc",
  and: "và, cùng với",
  animal: "động vật, thú nuôi",
  answer: "câu trả lời, phản hồi",
  apple: "quả táo",
  area: "khu vực, diện tích",
  arm: "cánh tay",
  around: "xung quanh, vòng quanh",
  arrive: "đến nơi, cập bến",
  art: "nghệ thuật, mỹ thuật",
  article: "bài báo, điều khoản",
  artist: "nghệ sĩ, họa sĩ",
  ask: "hỏi, yêu cầu",
  baby: "em bé sơ sinh",
  back: "phía sau, lưng",
  bad: "xấu, tồi tệ",
  bag: "túi xách, cặp sách",
  ball: "quả bóng",
  banana: "quả chuối",
  band: "ban nhạc, nhóm nhạc",
  bank: "ngân hàng, bờ sông",
  bath: "bồn tắm, việc tắm bồn",
  bathroom: "phòng tắm",
  beach: "bãi biển",
  beautiful: "xinh đẹp, tuyệt đẹp",
  because: "bởi vì, do",
  become: "trở thành, trở nên",
  bed: "chiếc giường ngủ",
  bedroom: "phòng ngủ",
  beer: "bia, đồ uống có cồn",
  begin: "bắt đầu, khởi đầu",
  beginning: "sự khởi đầu, phần mở đầu",
  behind: "ở đằng sau",
  believe: "tin tưởng, nghĩ rằng",
  below: "ở dưới, thấp hơn",
  best: "tốt nhất, giỏi nhất",
  better: "tốt hơn, khá hơn",
  between: "ở giữa hai đối tượng",
  big: "to lớn, vĩ đại",
  bike: "xe đạp",
  bill: "hóa đơn thanh toán",
  bird: "con chim",
  birthday: "ngày sinh nhật",
  black: "màu đen, tối tăm",
  blog: "trang nhật ký trực tuyến",
  blue: "màu xanh da trời",
  boat: "con thuyền",
  body: "cơ thể, thân thể",
  book: "cuốn sách, đặt chỗ trước",
  boot: "đôi bốt, ủng",
  bored: "cảm thấy buồn chán",
  boring: "nhàm chán, tẻ nhạt",
  born: "sinh ra, chào đời",
  both: "cả hai người/vật",
  bottle: "cái chai, bình đựng",
  box: "chiếc hộp, thùng",
  boy: "cậu bé, bé trai",
  bread: "bánh mì",
  break: "làm vỡ, giờ nghỉ giải lao",
  breakfast: "bữa ăn sáng",

  // A2
  ability: "khả năng, năng lực thực hiện",
  able: "có thể, có năng lực",
  abroad: "ở nước ngoài, ra nước ngoài",
  accept: "chấp nhận, đồng ý tiếp nhận",
  accident: "tai nạn, rủi ro ngoài ý muốn",
  achieve: "đạt được, hoàn thành mục tiêu",
  active: "năng động, chủ động",
  actually: "thực sự, trên thực tế",
  advantage: "lợi thế, điểm thuận lợi",
  adventure: "chuyến phiêu lưu, mạo hiểm",
  advertise: "quảng cáo, thông báo rộng rãi",
  advertisement: "mục quảng cáo, bài quảng cáo",
  affect: "ảnh hưởng đến, tác động",
  against: "chống lại, phản đối",
  airline: "hãng hàng không",
  alive: "còn sống, tràn đầy sức sống",
  allow: "cho phép, cấp quyền",
  almost: "hầu như, gần như",
  alone: "cô đơn, một mình",
  along: "dọc theo, đi cùng",
  already: "đã rồi, từ trước đó",
  alternative: "phương án thay thế, sự lựa chọn",
  amount: "số lượng, khối lượng",
  ancient: "cổ đại, xa xưa",
  announcement: "thông báo chính thức",
  annoy: "làm phiền, quấy rầy",
  appearance: "ngoại hình, sự xuất hiện",
  apply: "nộp đơn, áp dụng",
  argument: "cuộc tranh luận, lý lẽ",
  arrange: "sắp xếp, thu xếp",
  arrangement: "sự sắp đặt, thỏa thuận",
  arrest: "bắt giữ ai đó",
  assistant: "trợ lý, người giúp việc",
  athlete: "vận động viên thể thao",
  attractive: "hấp dẫn, lôi cuốn",
  audience: "khán giả, người theo dõi",
  author: "tác giả cuốn sách hoặc bài viết",
  available: "có sẵn, rảnh rỗi để sử dụng",
  average: "trung bình, mức thông thường",
  avoid: "tránh xa, né tránh",
  award: "giải thưởng, phần thưởng",
  aware: "nhận thức được, biết rõ",
  background: "bối cảnh, lý lịch nền tảng",
  badly: "rất tệ, một cách nghiêm trọng",
  bar: "quầy bar, thanh chắn",
  baseball: "môn bóng chày",
  basic: "cơ bản, nền tảng",
  basis: "nền tảng, căn cứ xác định",
  battle: "trận chiến, sự tranh đấu",
  beauty: "vẻ đẹp, nét duyên dáng",
  bee: "con ong",
  belief: "niềm tin, đức tin",
  bell: "cái chuông",
  belong: "thuộc về ai hoặc nơi nào",
  benefit: "lợi ích, trợ cấp xã hội",
  bicycle: "xe đạp 2 bánh",
  biology: "môn sinh học",
  biscuit: "bánh quy",
  bit: "một chút, mẩu nhỏ",
  blank: "trống trơn, khoảng trống",
  blood: "máu trong cơ thể",
  blow: "thổi gió, đòn giáng mạnh",
  board: "tấm bảng, hội đồng quản trị",
  boil: "đun sôi nước",
  bone: "khung xương trong cơ thể",
  borrow: "vay mượn tạm thời",
  boss: "người sếp, cấp trên",
  bottom: "phần đáy, dưới cùng",
  bowl: "cái tô, cái bát",
  brain: "não bộ, trí óc",
  branch: "chi nhánh, cành cây",
  brave: "dũng cảm, gan dạ",
  bridge: "chiếc cầu vượt sông",
  bright: "sáng sủa, thông minh",
  brilliant: "xuất sắc, rực rỡ",
  broken: "bị vỡ, bị hỏng hóc",
  brush: "bàn chải, chải tóc",
  burn: "đốt cháy, vết bỏng",
  business: "công việc kinh doanh, doanh nghiệp",

  // B1
  absolutely: "hoàn toàn, chắc chắn 100%",
  academic: "thuộc về học thuật, nghiên cứu",
  access: "quyền truy cập, tiếp cận",
  accommodation: "chỗ ở, nơi lưu trú",
  account: "tài khoản, bản tường thuật",
  achievement: "thành tựu đáng ghi nhận",
  act: "hành vi, đạo luật ban hành",
  admit: "thừa nhận, nhận lỗi",
  adopt: "nhận nuôi, tiếp nhận chính sách",
  advance: "tiến bộ, nâng cao trình độ",
  advanced: "nâng cao, cấp tiến",
  afford: "có đủ khả năng chi trả tài chính",
  agency: "cơ quan, đại lý dịch vụ",
  agenda: "chương trình nghị sự, lịch trình",
  agent: "người đại diện, đặc vụ",
  aggressive: "hung hăng, quyết liệt",
  agriculture: "ngành nông nghiệp trồng trọt",
  aim: "mục tiêu nhắm tới",
  alarm: "chuông báo động, sự hoảng hốt",
  alter: "thay đổi, điều chỉnh nhỏ",
  ambition: "hoài bão, khát vọng lớn",
  analyse: "phân tích chi tiết số liệu hoặc dữ kiện",
  analysis: "bản phân tích chuyên sâu",
  anniversary: "ngày kỷ niệm hàng năm",
  anxious: "lo âu, bồn chồn lo lắng",
  apologize: "xin lỗi chân thành",
  apparent: "rõ ràng, dễ thấy bề ngoài",
  appeal: "kháng cáo, sức hút lôi cuốn",
  approach: "cách tiếp cận, phương pháp xử lý",
  appropriate: "phù hợp, thích đáng trong hoàn cảnh",
  approval: "sự phê duyệt, tán thành chính thức",
  approve: "phê chuẩn, đồng thuận",
  architect: "kiến trúc sư thiết kế",
  architecture: "ngành kiến trúc công trình",
  armed: "được vũ trang vũ khí",
  army: "quân đội chính quy",
  aspect: "khía cạnh, phương diện vấn đề",
  assess: "đánh giá, định giá trị",
  assessment: "sự đánh giá kết quả",
  asset: "tài sản có giá trị",
  assign: "phân công nhiệm vụ",
  assistance: "sự trợ giúp, hỗ trợ",
  associate: "liên kết, cộng tác làm việc",
  association: "hiệp hội, tổ chức liên kết",
  assume: "giả định, cho rằng mà chưa kiểm chứng",
  attempt: "nỗ lực, cố gắng thực hiện",
  attitude: "thái độ đối với sự việc",
  attract: "thu hút, lôi cuốn sự chú ý",
  attraction: "điểm tham quan hấp dẫn",
  authority: "chính quyền, người có thẩm quyền",
  automatic: "tự động hoàn toàn",
  automatically: "một cách tự động",
  "aware of": "có nhận thức về điều gì đó",
  barrier: "rào cản, chướng ngại vật",
  base: "căn cứ điểm, nền móng vững chắc",
  battery: "pin sạc năng lượng",
  behave: "cư xử, hành xử có chừng mực",
  behaviour: "hành vi ứng xử",
  belongings: "đồ dùng cá nhân thuộc quyền sở hữu",
  beneficial: "có lợi, mang lại hiệu quả tốt",
  bid: "đấu thầu, chào giá",
  blame: "đổ lỗi, khiển trách trách nhiệm",
  block: "khối bê tông, chặn đường đi",
  bond: "mối liên kết tình cảm, trái phiếu",
  boost: "tăng cường, đẩy mạnh phát triển",
  border: "biên giới giữa các quốc gia",
  bother: "bận tâm, làm phiền lòng",
  bound: "chắc chắn sẽ xảy ra, bị ràng buộc",
  budget: "ngân sách chi tiêu",
  burst: "nổ tung, vỡ òa cảm xúc",
  calculate: "tính toán số liệu toán học",
  calculation: "phép tính toán",
  campaign: "chiến dịch truyền thông hoặc quân sự",
  candidate: "ứng viên dự tuyển",

  // B2
  abandon: "từ bỏ, ruồng bỏ không chăm sóc",
  abnormal: "bất thường, khác lạ",
  absorb: "hấp thụ chất lỏng hoặc tiếp thu kiến thức",
  abstract: "trừu tượng, mang tính lý thuyết",
  academician: "viện sĩ viện hàn lâm",
  accent: "giọng điệu phát âm vùng miền",
  accompany: "đồng hành, đi cùng ai đó",
  accomplish: "hoàn thành xuất sắc nhiệm vụ",
  accordingly: "do đó, phù hợp theo tình huống",
  accurate: "chính xác, không có sai sót",
  accurately: "một cách chính xác tuyệt đối",
  accuse: "buộc tội, cáo buộc hành vi vi phạm",
  acknowledge: "thừa nhận sự thật, tri ân đóng góp",
  acquire: "tiếp thu kỹ năng hoặc mua lại tài sản",
  acquisition: "sự thâu tóm, quá trình tiếp thu",
  adaptation: "sự thích nghi với môi trường sống",
  adequate: "đầy đủ đáp ứng yêu cầu tối thiểu",
  adequately: "một cách thỏa đáng",
  adjust: "điều chỉnh cho vừa vặn hoặc quen dần",
  adjustment: "sự điều chỉnh nhỏ",
  administrative: "thuộc về hành chính quản trị",
  advocate: "người ủng hộ công khai, biện hộ",
  allocate: "phân bổ nguồn lực hoặc tài chính",
  allocation: "sự phân bổ chỉ tiêu",
  alteration: "sự sửa đổi cấu trúc",
  ambiguous: "mơ hồ, đa nghĩa khó hiểu",
  amend: "tu chính, sửa đổi văn bản luật",
  amendment: "bản tu chính án",
  analogy: "sự loại suy tương đồng",
  anticipate: "dự đoán trước và chuẩn bị đón nhận",
  apparentness: "tính chất hiển nhiên",
  appendix: "phụ lục tài liệu học thuật",
  applaud: "vỗ tay khen ngợi nhiệt liệt",
  applicable: "có thể áp dụng vào thực tế",
  appreciate: "đánh giá cao, biết ơn sâu sắc",
  arbitrary: "tùy tiện, độc đoán thiếu căn cứ",
  articulate: "diễn đạt lưu loát gãy gọn",
  artificial: "nhân tạo do con người tạo ra",
  aspiration: "nguyện vọng cao đẹp",
  assertion: "sự khẳng định quả quyết",
  "assessment criteria": "tiêu chí đánh giá sát hạch",
  collaborate: "hợp tác chặt chẽ cùng nghiên cứu",
  collaboration: "sự hợp tác đa phương",
  coherent: "mạch lạc, logic chặt chẽ",
  cohesion: "sự liên kết kết dính cấu trúc",
  compelling: "hấp dẫn và có sức thuyết phục cao",
  compile: "biên soạn tổng hợp tài liệu",
  comprehensive: "toàn diện, bao quát mọi mặt",
  compromise: "thỏa hiệp nhượng bộ đôi bên",
  concede: "thừa nhận thất bại hoặc nhượng quyền",
  conceive: "hình thành ý tưởng hoặc thụ thai",
  concurrent: "xảy ra đồng thời cùng một lúc",
  confer: "hội ý, trao tặng bằng khen",
  conform: "tuân thủ theo quy chuẩn chung",
  consent: "sự bằng lòng chấp thuận tự nguyện",
  consequently: "hậu quả là, kết quả tất yếu là",
  considerable: "đáng kể, có tầm ảnh hưởng lớn",
  consistent: "kiên định, nhất quán trước sau",
  constitute: "cấu thành nên một tổng thể",
  constraint: "sự ràng buộc kiềm chế hạn chế",
  constructive: "mang tính xây dựng tích cực",
  controversial: "gây tranh cãi quyết liệt",
  conventional: "theo tập quán truyền thống",
  coordinate: "phối hợp nhịp nhàng các bên",
  correlate: "có mối tương quan trực tiếp",
  correspond: "tương ứng, trao đổi thư từ",
  crucial: "cực kỳ quan trọng, mang tính then chốt",
  cumulative: "tích lũy dần theo thời gian",
  deficiency: "sự thiếu hụt dưỡng chất hoặc chỉ tiêu",
  demonstrate: "chứng minh, minh họa rõ ràng",
  derive: "bắt nguồn từ, chiết xuất ra",
  deviate: "lệch khỏi chuẩn mực quy định",
  differentiate: "phân biệt sự khác nhau tinh tế",
  diminish: "thu nhỏ, giảm sút dần quy mô",
  discrete: "riêng biệt, tách rời độc lập",
  discriminate: "phân biệt đối xử bất công",
  disproportionate: "không cân đối, chênh lệch quá lớn",
};

async function fetchDataset() {
  if (existsSync(CACHE_FILE)) {
    console.log("Reading raw Oxford 3000 from local cache...");
    return JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
  }
  console.log("Downloading Oxford 3000 dataset from GitHub...");
  const res = await fetch(DATASET_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} when fetching dataset`);
  const data = await res.json();
  writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), "utf-8");
  console.log("Saved raw cache to", CACHE_FILE);
  return data;
}

async function translateFallback(text) {
  try {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=" +
      encodeURIComponent(text);
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(2500),
    });
    if (!r.ok) return text;
    const data = await r.json();
    return data[0]?.map((s) => s[0]).join("") || text;
  } catch {
    return text;
  }
}

async function main() {
  const rawData = await fetchDataset();
  const rawList = Object.values(rawData);

  console.log(`Loaded ${rawList.length} items from dataset.`);

  // Lọc theo từng cấp độ CEFR
  const byCefr = {
    a1: rawList.filter((x) => (x.cefr || "").toLowerCase() === "a1"),
    a2: rawList.filter((x) => (x.cefr || "").toLowerCase() === "a2"),
    b1: rawList.filter((x) => (x.cefr || "").toLowerCase() === "b1"),
    b2: rawList.filter((x) => (x.cefr || "").toLowerCase() === "b2"),
  };

  console.log(
    `Available counts -> A1: ${byCefr.a1.length}, A2: ${byCefr.a2.length}, B1: ${byCefr.b1.length}, B2: ${byCefr.b2.length}`,
  );

  const TARGET_PER_LEVEL = 80;
  const selectedEntries = [];
  const seenTerms = new Set();

  for (const [lvl, items] of Object.entries(byCefr)) {
    let count = 0;
    for (const item of items) {
      if (count >= TARGET_PER_LEVEL) break;
      const word = (item.word || "").trim().toLowerCase();
      if (!word || word.length < 2 || seenTerms.has(word)) continue;
      if (!item.definition || !item.example) continue;

      seenTerms.add(word);
      selectedEntries.push({
        word,
        pos: mapPos(item.type),
        cefr: lvl.toUpperCase(),
        phon_br: item.phon_br || "",
        phon_n_am: item.phon_n_am || "",
        definition_en: item.definition.trim(),
        example_en: item.example.trim(),
        uk_audio: item.uk
          ? `https://raw.githubusercontent.com/winterdl/oxford-5000-vocabulary-audio-definition/main/audio/uk/${item.uk}`
          : null,
        us_audio: item.us
          ? `https://raw.githubusercontent.com/winterdl/oxford-5000-vocabulary-audio-definition/main/audio/us/${item.us}`
          : null,
      });
      count++;
    }
  }

  console.log(
    `Selected total ${selectedEntries.length} items (${TARGET_PER_LEVEL} per CEFR level).`,
  );

  // Bổ sung dịch tiếng Việt
  console.log("Adding Vietnamese translations...");
  const finalizedList = [];
  for (let i = 0; i < selectedEntries.length; i++) {
    const it = selectedEntries[i];
    let defVi = VI_TRANSLATION_MAP[it.word];
    if (!defVi) {
      defVi = await translateFallback(it.definition_en);
    }
    finalizedList.push({
      ...it,
      definition_vi: (defVi || it.definition_en).slice(0, 1500),
    });
    if ((i + 1) % 40 === 0) {
      console.log(`Processed ${i + 1}/${selectedEntries.length} items...`);
    }
  }

  // Ghi JSON kết quả
  writeFileSync(OUTPUT_JSON, JSON.stringify(finalizedList, null, 2), "utf-8");
  console.log(`Saved structured JSON to: ${OUTPUT_JSON}`);

  // Sinh Migration SQL forward-only
  console.log("Generating forward-only SQL migration...");
  let sql = `-- Migration: Seed 320 Oxford Core Vocabulary A1 -> B2 (CEFR & IELTS 0 - 6.5)
-- Date: 2026-10-24
-- Forward-only migration following Project Constitution

begin;

`;

  // Insert vocabulary_entries
  sql += `-- 1. Ingest canonical vocabulary_entries\n`;
  sql += `insert into public.vocabulary_entries (
  id, slug, normalized_term, part_of_speech, sense_key, display_order
) values\n`;

  const entryValues = finalizedList.map((item, idx) => {
    const slug = sanitizeSlug(`${item.word}-${item.pos}`);
    const displayOrder = idx + 10;
    // Tạo deterministic UUID namespace: 40000000-0000-4000-9000-xxxxxxxxxxxx
    const hex = (idx + 1).toString(16).padStart(12, "0");
    const id = `40000000-0000-4000-9000-${hex}`;
    return `  ('${id}', '${slug}', '${item.word.replace(/'/g, "''")}', '${item.pos}', 'default', ${displayOrder})`;
  });

  sql += entryValues.join(",\n");
  sql += `\non conflict (slug) do nothing;\n\n`;

  // Insert vocabulary_entry_versions
  sql += `-- 2. Ingest published vocabulary_entry_versions\n`;
  sql += `insert into public.vocabulary_entry_versions (
  id, vocabulary_entry_id, version, term, definition_vi, example_sentence,
  topic, tags, difficulty, status, source_name, licence, published_at
) values\n`;

  const versionValues = finalizedList.map((item, idx) => {
    const hex = (idx + 1).toString(16).padStart(12, "0");
    const entryId = `40000000-0000-4000-9000-${hex}`;
    const versionId = `41000000-0000-4000-9000-${hex}`;
    const diff = mapDifficulty(item.cefr);
    const tags = `ARRAY['oxford-3000', 'cefr:${item.cefr.toLowerCase()}', '${item.pos}']`;
    const escapedDef = item.definition_vi.replace(/'/g, "''");
    const escapedEx = item.example_en.replace(/'/g, "''");
    const topic =
      item.cefr === "A1"
        ? "daily-life"
        : item.cefr === "A2"
          ? "communication"
          : item.cefr === "B1"
            ? "academic-prep"
            : "academic-core";

    return `  ('${versionId}', '${entryId}', 1, '${item.word.replace(/'/g, "''")}', '${escapedDef}', '${escapedEx}', '${topic}', ${tags}, '${diff}', 'published', 'Oxford 3000 & CEFR Dataset', 'Open Educational Use', now())`;
  });

  sql += versionValues.join(",\n");
  sql += `\non conflict (id) do nothing;\n\ncommit;\n`;

  writeFileSync(OUTPUT_MIGRATION, sql, "utf-8");
  console.log(`Generated migration: ${OUTPUT_MIGRATION}`);
  console.log("Ingestion preparation complete!");
}

main().catch((err) => {
  console.error("Ingest failed:", err);
  process.exit(1);
});
