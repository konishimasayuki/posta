import { useState, useEffect } from "react";
import FontPicker from "../components/FontPicker.jsx";
import { FONT_MAP, ensureFontLoaded } from "../lib/fontCatalog.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser } from "../lib/auth.js";
import { formatRelative } from "../lib/time.js";

// ─── 定数 ─────────────────────────────────────────────
const INDUSTRIES = [
  { id: "restaurant", icon: "🍽", label: "飲食・カフェ" },
  { id: "beauty",     icon: "💅", label: "美容・サロン" },
  { id: "fitness",    icon: "💪", label: "フィットネス" },
  { id: "education",  icon: "📚", label: "教育・スクール" },
  { id: "medical",    icon: "🏥", label: "医療・健康" },
  { id: "ec",         icon: "🛍", label: "EC・小売" },
  { id: "it",         icon: "💻", label: "IT・Web" },
  { id: "creative",   icon: "🎨", label: "クリエイティブ" },
  { id: "service",    icon: "🤝", label: "サービス業" },
  { id: "legal",      icon: "⚖️", label: "士業" },
  { id: "auto",       icon: "🚗", label: "自動車販売" },
  { id: "realestate", icon: "🏠", label: "不動産" },
  { id: "other",      icon: "📦", label: "その他" },
];
const TARGETS = [
  { id: "f_teen",   icon: "👧", label: "10〜20代女性", age: "10〜20代", gender: "女性" },
  { id: "f_30",     icon: "👩", label: "30〜40代女性", age: "30〜40代", gender: "女性" },
  { id: "f_senior", icon: "👵", label: "50代以上女性", age: "50代以上", gender: "女性" },
  { id: "m_teen",   icon: "👦", label: "10〜20代男性", age: "10〜20代", gender: "男性" },
  { id: "m_30",     icon: "👨", label: "30〜40代男性", age: "30〜40代", gender: "男性" },
  { id: "m_senior", icon: "👴", label: "50代以上男性", age: "50代以上", gender: "男性" },
  { id: "family",   icon: "👨‍👩‍👧", label: "ファミリー",    age: "全年代",   gender: "問わず" },
  { id: "business", icon: "🤝", label: "ビジネスパーソン", age: "30〜50代", gender: "問わず" },
];
const TONES = [
  { id: "friendly",     icon: "😊", label: "フレンドリー",      desc: "親しみやすく・絵文字多め" },
  { id: "professional", icon: "💼", label: "プロフェッショナル", desc: "信頼感・落ち着いた印象" },
  { id: "cute",         icon: "🌸", label: "かわいい系",        desc: "ポップ・ガーリー" },
  { id: "cool",         icon: "😎", label: "クール",            desc: "スタイリッシュ・無駄なし" },
  { id: "warm",         icon: "🤗", label: "あたたかみ",        desc: "ほっこり・寄り添う" },
  { id: "energetic",    icon: "🔥", label: "エネルギッシュ",    desc: "テンション高め" },
];
const KEIGO = [
  { id: "desu",   label: "ですます調", example: "〜しています。" },
  { id: "da",     label: "だよ体",     example: "〜してるよ！" },
  { id: "taikei", label: "体言止め",   example: "〜を実現。" },
  { id: "mixed",  label: "ミックス",   example: "〜してます！" },
];
const COLORS = [
  { id: "purple", primary: "#7c3aed", secondary: "#f5f3ff", label: "パープル" },
  { id: "pink",   primary: "#db2777", secondary: "#fdf2f8", label: "ピンク" },
  { id: "blue",   primary: "#2563eb", secondary: "#eff6ff", label: "ブルー" },
  { id: "green",  primary: "#059669", secondary: "#ecfdf5", label: "グリーン" },
  { id: "orange", primary: "#ea580c", secondary: "#fff7ed", label: "オレンジ" },
  { id: "red",    primary: "#dc2626", secondary: "#fef2f2", label: "レッド" },
  { id: "teal",   primary: "#0d9488", secondary: "#f0fdfa", label: "ティール" },
  { id: "gray",   primary: "#374151", secondary: "#f9fafb", label: "モノクロ" },
];
// フォントの選択肢は src/lib/fontCatalog.js の28種に移行済み。
// 旧FONTS定数（7種類）はどこからも参照されなくなったため削除した。
const VIDEO_TYPES = [
  { id: "realpeople",  icon: "🎥", label: "実写・人物あり",     desc: "自撮り・スタッフ・お客様" },
  { id: "realnoperson",icon: "🏠", label: "実写・人物なし",     desc: "商品・空間・料理・景色" },
  { id: "anime2d",     icon: "🌸", label: "アニメ（日本風）",   desc: "2Dアニメ・セル調" },
  { id: "anime3d",     icon: "✨", label: "アニメ（3D）",       desc: "Pixar風・CGIレンダリング" },
  { id: "illustration",icon: "🎨", label: "イラスト風",         desc: "フラット・ベクター・カラフル" },
  { id: "virtual",     icon: "🤖", label: "バーチャル人物",     desc: "オリジナルキャラクター" },
];

const VIDEO_STYLES = [
  { id: "simple",    icon: "⬜", label: "シンプル",       desc: "白背景・テキスト中心" },
  { id: "pop",       icon: "🌈", label: "ポップ",         desc: "カラフル・アニメ多め" },
  { id: "cinematic", icon: "🎬", label: "シネマティック",  desc: "映画風・ドラマチック" },
  { id: "vlog",      icon: "📹", label: "Vlog風",         desc: "日常感・リアル" },
  { id: "minimal",   icon: "◻️", label: "ミニマル",       desc: "余白多め・高級感" },
  { id: "energetic", icon: "⚡", label: "エネルギッシュ",  desc: "素早いカット・エフェクト" },
];
const BGM_STYLES = [
  { id: "upbeat",    icon: "🎵", label: "アップビート",   desc: "元気・テンポ良い" },
  { id: "calm",      icon: "🎶", label: "落ち着き系",     desc: "ゆったり・リラックス" },
  { id: "corporate", icon: "🎼", label: "コーポレート",   desc: "信頼・ビジネス感" },
  { id: "cute",      icon: "🎀", label: "キュート",       desc: "ポップ・かわいい" },
  { id: "dramatic",  icon: "🎸", label: "ドラマチック",   desc: "感動・引き込む" },
  { id: "none",      icon: "🔇", label: "BGMなし",        desc: "音声・ASMR重視" },
];
const VIDEO_PURPOSES = [
  { id: "attract",   icon: "🧲", label: "集客",          desc: "新規フォロワー・来店誘導" },
  { id: "product",   icon: "🛍", label: "商品宣伝",      desc: "商品・サービスのPR" },
  { id: "vlog",      icon: "📹", label: "Vlog",          desc: "日常・裏側を見せる" },
  { id: "tutorial",  icon: "📖", label: "ハウツー",      desc: "使い方・ノウハウ紹介" },
  { id: "brand",     icon: "✨", label: "ブランディング", desc: "世界観・信頼感の構築" },
  { id: "campaign",  icon: "🎁", label: "キャンペーン",  desc: "セール・期間限定告知" },
  { id: "recruit",   icon: "🤝", label: "採用",          desc: "スタッフ・メンバー募集" },
  { id: "other",     icon: "💬", label: "その他",        desc: "自由に入力" },
];
const BRAND_STEPS = ["目的・基本", "ターゲット", "トーン・言葉", "ビジュアル", "動画設定"];
/**
 * サムネイル画像を、Redisに保存できるサイズまで小さくする。
 *
 * 元の画像をそのまま保存すると数MBになり、Upstashの容量を圧迫するうえ
 * プロジェクト一覧の読み込みも重くなる。
 * 一覧では小さくしか表示しないので、192pxの正方形に切り詰めて十分。
 */
function compressThumbnail(file, size = 192, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // 中央を正方形に切り出す（縦横比が崩れないように）
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("画像を読み込めませんでした"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("ファイルを読み込めませんでした"));
    reader.readAsDataURL(file);
  });
}

/** サムネイル選択時の処理 */
async function handleThumbnailChange(e, set) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const compressed = await compressThumbnail(file);
    set("thumbnail", compressed);
  } catch (err) {
    console.error("サムネイルの処理に失敗:", err);
    alert("画像を読み込めませんでした。別の画像を試してください。");
  }
  // 同じファイルを選び直せるようにリセットする
  e.target.value = "";
}

// 「最近の生成」でプラットフォームのアイコンを出すために使う
const PLATFORM_META = {
  tiktok:    { icon: "🎵", accent: "#fe2c55" },
  instagram: { icon: "📸", accent: "#f77737" },
  x:         { icon: "𝕏",  accent: "#1d9bf0" },
  note:      { icon: "📝", accent: "#41c9b4" },
};

const emptyBrand = {
  name: "", industry: "", color: "", tone: "", targets: [],
  keigo: "", fixedWords: "", bannedWords: "", font: "ai", videoType: "", videoStyle: "", bgm: "",
  purpose: "", purposeDetail: "",
  thumbnail: null,  // 192px・JPEG圧縮済みのdataURL（未設定なら業種アイコンを表示）
};
const SAMPLE_PROJECTS = [
  { id: 1, name: "カフェ Lumière", industry: "restaurant", color: "orange", tone: "warm", targets: ["f_30", "family"], videoStyle: "vlog", bgm: "calm", font: "round", keigo: "desu", duration: "short", purpose: "attract", purposeDetail: "近隣の30〜40代女性・ファミリー層に来店してもらう。週末のモーニングをPRしたい。", fixedWords: "Lumière、週末モーニング", posts: 18, lastEdit: "今日",
    history: [
      { id: 101, type: "sns",   platform: "instagram", platformIcon: "📸", platformAccent: "#f77737", topic: "週末モーニング新メニュー登場",  time: "2時間前" },
      { id: 102, type: "video", platform: "tiktok",    platformIcon: "🎵", platformAccent: "#fe2c55", topic: "カフェの朝の準備風景",          time: "昨日" },
      { id: 103, type: "sns",   platform: "x",         platformIcon: "𝕏",  platformAccent: "#1d9bf0", topic: "お客様の声・口コミ紹介",        time: "3日前" },
    ],
  },
  { id: 2, name: "FitPro ジム", industry: "fitness", color: "red", tone: "energetic", targets: ["m_30", "m_teen"], videoStyle: "energetic", bgm: "upbeat", font: "gothic", keigo: "da", duration: "short", purpose: "attract", purposeDetail: "20〜40代男性に入会を促したい。トレーニング成果のビフォーアフターを見せる。", fixedWords: "FitPro、結果にコミット", posts: 32, lastEdit: "昨日",
    history: [
      { id: 201, type: "video", platform: "tiktok",    platformIcon: "🎵", platformAccent: "#fe2c55", topic: "ビフォーアフター30日間の変化",   time: "昨日" },
      { id: 202, type: "sns",   platform: "instagram", platformIcon: "📸", platformAccent: "#f77737", topic: "トレーナー紹介・スタッフ特集",  time: "2日前" },
      { id: 203, type: "video", platform: "tiktok",    platformIcon: "🎵", platformAccent: "#fe2c55", topic: "入会キャンペーン告知",           time: "4日前" },
    ],
  },
  { id: 3, name: "Atelier Blanc", industry: "beauty", color: "pink", tone: "cute", targets: ["f_teen", "f_30"], videoStyle: "minimal", bgm: "cute", font: "round", keigo: "desu", duration: "medium", purpose: "brand", purposeDetail: "10〜30代女性へ世界観を伝えたい。ナチュラル・オーガニックのブランドイメージ構築。", fixedWords: "Atelier Blanc、自然派", posts: 7, lastEdit: "3日前",
    history: [
      { id: 301, type: "sns",   platform: "note",      platformIcon: "📝", platformAccent: "#41c9b4", topic: "ブランドストーリー・誕生秘話",   time: "3日前" },
      { id: 302, type: "video", platform: "instagram", platformIcon: "📸", platformAccent: "#f77737", topic: "新商品ラインナップ紹介",         time: "5日前" },
    ],
  },
];

// ─── utils ────────────────────────────────────────────
const gc = id => COLORS.find(c => c.id === id);
const gi = id => INDUSTRIES.find(i => i.id === id);
const gt = id => TONES.find(t => t.id === id);
const gv = id => VIDEO_STYLES.find(v => v.id === id);
const gb = id => BGM_STYLES.find(b => b.id === id);
// フォントは新しいカタログ（28種）を参照する。
// "ai"（AIお任せ）や、旧設定の値（gothic/mincho等）はカタログに無いので、
// その場合は「AIお任せ」として表示する。
const gf = id => {
  if (!id || id === "ai") return { label: "AIお任せ" };
  const f = FONT_MAP[id];
  return f ? { label: f.name } : { label: "AIお任せ" };
};
const gp = id => VIDEO_PURPOSES.find(p => p.id === id);
const gk = id => KEIGO.find(k => k.id === id);

// ─── 小コンポーネント ─────────────────────────────────
function Toast({ msg }) {
  return msg ? (
    <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: "#10b981", color: "#fff", padding: "11px 20px", borderRadius: "12px", fontWeight: 700, fontSize: "13px", zIndex: 500, boxShadow: "0 4px 20px #10b98140", whiteSpace: "nowrap" }}>
      ✓ {msg}
    </div>
  ) : null;
}

function Header({ title, onBack, accentColor, rightEl }) {
  return (
    <div className="posta-header" style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 16px", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ width: "100%", padding: "14px 0", display: "flex", alignItems: "center", gap: "10px" }}>
        {onBack && <button onClick={onBack} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#6b7280", padding: "0 4px 0 0" }}>←</button>}
        <div style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.03em" }}>
          <span style={{ color: accentColor || "#f97316" }}>Po</span>sta
        </div>
        <div style={{ width: "1px", height: "18px", background: "#e5e7eb" }} />
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>{title}</div>
        {rightEl && <div style={{ marginLeft: "auto" }}>{rightEl}</div>}
      </div>
    </div>
  );
}

function ChipGrid({ items, selected, onToggle, multi = false, cols = 3, accent = "#f97316" }) {
  const isSel = id => multi ? (selected || []).includes(id) : selected === id;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "7px" }}>
      {items.map(item => {
        const sel = isSel(item.id);
        return (
          <div key={item.id} onClick={() => onToggle(item.id)} style={{
            padding: "10px 7px", borderRadius: "11px", cursor: "pointer", textAlign: "center",
            border: `1.5px solid ${sel ? accent : "#e5e7eb"}`,
            background: sel ? accent + "15" : "#fff", transition: "all 0.15s",
          }}>
            {item.icon && <div style={{ fontSize: "18px", marginBottom: "3px" }}>{item.icon}</div>}
            <div style={{ fontSize: "11px", fontWeight: 700, color: sel ? accent : "#374151" }}>{item.label}</div>
            {item.desc && <div style={{ fontSize: "9px", color: "#9ca3af", marginTop: "1px", lineHeight: 1.3 }}>{item.desc}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ─── ブランド設定モーダル ─────────────────────────────
function BrandModal({ project, onSave, onClose }) {
  const [step, setStep] = useState(0);
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  const [data, setData] = useState(project ? { ...emptyBrand, ...project } : emptyBrand);
  const set = (k, v) => setData(p => ({ ...p, [k]: v }));
  const toggle = (k, id) => { const cur = data[k] || []; set(k, cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]); };
  const accent = gc(data.color)?.primary || "#f97316";

  // 選択中のフォントを、プレビュー表示のために読み込んでおく
  useEffect(() => {
    const f = FONT_MAP[data.font];
    if (f) ensureFontLoaded(f);
  }, [data.font]);
  const stepValid = [
    !!data.name && !!data.industry && !!data.purpose,
    (data.targets || []).length > 0,
    !!data.tone && !!data.keigo,
    !!data.color && !!data.font,
    !!data.videoType && !!data.videoStyle && !!data.bgm,
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ fontSize: "16px", fontWeight: 900 }}>{project?.id ? "ブランド設定を編集" : "新規プロジェクト作成"}</div>
            <button onClick={onClose} style={{ width: "30px", height: "30px", borderRadius: "50%", border: "none", background: "#f3f4f6", fontSize: "14px", cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: "4px", marginBottom: "14px" }}>
            {BRAND_STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px", alignItems: "center" }}>
                <div style={{ height: "3px", width: "100%", borderRadius: "2px", background: i <= step ? accent : "#e5e7eb", transition: "background 0.3s" }} />
                <div style={{ fontSize: "9px", fontWeight: 600, color: i <= step ? accent : "#9ca3af", whiteSpace: "nowrap" }}>{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "0 20px", flex: 1 }}>
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px", paddingBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>🎯 この動画で何をしたいか <span style={{ color: "#ef4444" }}>*</span></div>
                <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px" }}>具体的に書くほどAIの精度が上がります</div>
                <ChipGrid items={VIDEO_PURPOSES} selected={data.purpose} onToggle={id => set("purpose", id)} cols={4} accent={accent} />
                {data.purpose && (
                  <textarea value={data.purposeDetail || ""} onChange={e => set("purposeDetail", e.target.value)}
                    placeholder={`例：${{"attract":"近隣の30〜40代女性に来店してもらいたい。週末の雰囲気を伝えたい。","product":"新商品の魅力を20〜30代に伝えたい。使用シーンを動画で見せたい。","vlog":"日常の裏側を見せてファンを増やしたい。スタッフの人柄を伝えたい。","tutorial":"サービスの使い方を丁寧に説明したい。初心者向けにわかりやすく。","brand":"ブランドの世界観・こだわりを伝えたい。高級感・信頼感を構築したい。","campaign":"期間限定セールを告知したい。来店・購入のきっかけを作りたい。","recruit":"スタッフ募集。職場の雰囲気・働きやすさを伝えたい。","other":"目的を自由に記入してください。"}[data.purpose] || "具体的な目的を入力してください。"}`}
                    rows={3} style={{ width: "100%", marginTop: "10px", padding: "11px 13px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "13px", outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.7, color: "#111827" }}
                    onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
                )}
              </div>
              <div style={{ borderTop: "1px solid #f3f4f6" }} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>プロジェクト名 <span style={{ color: "#ef4444" }}>*</span></div>
                <input value={data.name} onChange={e => set("name", e.target.value)} placeholder="例：カフェ〇〇 / FitProジム"
                  style={{ width: "100%", padding: "11px 13px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "14px", outline: "none", fontFamily: "inherit", color: "#111827" }}
                  onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
              </div>

              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>サムネイル画像 <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "11px" }}>任意</span></div>
                <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px" }}>プロジェクト一覧や探索ページで表示されます</div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <label style={{ cursor: "pointer", flexShrink: 0 }}>
                    <div style={{
                      width: "64px", height: "64px", borderRadius: "14px", overflow: "hidden",
                      border: `2px dashed ${data.thumbnail ? accent : "#e5e7eb"}`,
                      background: data.thumbnail ? "transparent" : "#f9fafb",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {data.thumbnail
                        ? <img src={data.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontSize: "22px", color: "#9ca3af" }}>📷</span>}
                    </div>
                    <input type="file" accept="image/*" onChange={e => handleThumbnailChange(e, set)} style={{ display: "none" }} />
                  </label>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "11px", color: "#6b7280", lineHeight: 1.7 }}>
                      {data.thumbnail ? "タップして変更できます" : "タップして画像を選択"}
                    </div>
                    {data.thumbnail && (
                      <button onClick={() => set("thumbnail", null)} style={{
                        marginTop: "6px", padding: "4px 10px", borderRadius: "8px",
                        border: "1px solid #e5e7eb", background: "#fff", color: "#9ca3af",
                        fontSize: "10px", fontWeight: 700, cursor: "pointer",
                      }}>削除</button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>業種 <span style={{ color: "#ef4444" }}>*</span></div>
                <ChipGrid items={INDUSTRIES} selected={data.industry} onToggle={id => set("industry", id)} cols={3} accent={accent} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ paddingBottom: "16px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>🎯 ターゲット層 <span style={{ color: "#ef4444" }}>*</span> <span style={{ color: "#9ca3af", fontWeight: 400 }}>複数可</span></div>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "10px" }}>年齢・性別でAIが最適な表現・映像スタイルを判断します</div>
              <ChipGrid items={TARGETS} selected={data.targets} multi onToggle={id => toggle("targets", id)} cols={4} accent={accent} />
              {(data.targets || []).length > 0 && (() => {
                const sel = TARGETS.filter(t => data.targets.includes(t.id));
                return (
                  <div style={{ marginTop: "14px", padding: "12px 14px", background: accent + "12", borderRadius: "12px", border: `1px solid ${accent}33` }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: accent, marginBottom: "4px" }}>🤖 AIへの自動反映</div>
                    <div style={{ fontSize: "12px", color: "#374151", lineHeight: 1.7 }}>
                      {[...new Set(sel.map(t => t.age))].join("・")} / {[...new Set(sel.map(t => t.gender))].join("・")}<br />
                      <span style={{ color: "#6b7280" }}>→ 言葉遣い・映像の雰囲気・テンポを自動調整</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px", paddingBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>ブランドのトーン <span style={{ color: "#ef4444" }}>*</span></div>
                <ChipGrid items={TONES} selected={data.tone} onToggle={id => set("tone", id)} cols={3} accent={accent} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>文体・口調 <span style={{ color: "#ef4444" }}>*</span></div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {KEIGO.map(k => {
                    const sel = data.keigo === k.id;
                    return (
                      <div key={k.id} onClick={() => set("keigo", k.id)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px", borderRadius: "10px", cursor: "pointer", border: `1.5px solid ${sel ? accent : "#e5e7eb"}`, background: sel ? accent + "12" : "#fff", transition: "all 0.15s" }}>
                        <div style={{ width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0, border: `2px solid ${sel ? accent : "#d1d5db"}`, background: sel ? accent : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff", fontWeight: 700 }}>{sel ? "✓" : ""}</div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: sel ? accent : "#111827" }}>{k.label}</div>
                          <div style={{ fontSize: "11px", color: "#9ca3af" }}>{k.example}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>固定ワード <span style={{ color: "#9ca3af", fontWeight: 400 }}>任意</span></div>
                <textarea value={data.fixedWords || ""} onChange={e => set("fixedWords", e.target.value)}
                  placeholder="例：ブランド名・キャッチフレーズ・必ず使う言葉"
                  rows={2} style={{ width: "100%", padding: "11px 13px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "13px", outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.7, color: "#111827" }}
                  onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>禁止ワード <span style={{ color: "#9ca3af", fontWeight: 400 }}>任意</span></div>
                <textarea value={data.bannedWords || ""} onChange={e => set("bannedWords", e.target.value)}
                  placeholder="例：安い・格安・激安（ブランドイメージに合わない言葉）"
                  rows={2} style={{ width: "100%", padding: "11px 13px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "13px", outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.7, color: "#111827" }}
                  onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px", paddingBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>ブランドカラー <span style={{ color: "#ef4444" }}>*</span></div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                  {COLORS.map(c => {
                    const sel = data.color === c.id;
                    return (
                      <div key={c.id} onClick={() => set("color", c.id)} style={{ padding: "10px 6px", borderRadius: "11px", cursor: "pointer", textAlign: "center", border: `2px solid ${sel ? c.primary : "#e5e7eb"}`, background: sel ? c.secondary : "#fff", transition: "all 0.15s" }}>
                        <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: c.primary, margin: "0 auto 4px", boxShadow: sel ? `0 2px 8px ${c.primary}66` : "none" }} />
                        <div style={{ fontSize: "10px", fontWeight: 700, color: sel ? c.primary : "#6b7280" }}>{c.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>フォント <span style={{ color: "#ef4444" }}>*</span></div>
                <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px" }}>「AIお任せ」はネタと設定に合わせて毎回最適な書体を選択</div>

                <div onClick={() => setFontPickerOpen(true)} style={{
                  padding: "0", borderRadius: "12px", cursor: "pointer", overflow: "hidden",
                  border: `1.5px solid ${accent}`, background: "#fff",
                }}>
                  {data.font === "ai" || !FONT_MAP[data.font] ? (
                    <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "20px" }}>✨</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: accent }}>AIお任せ</div>
                        <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>タップして書体を選ぶ（全28種）</div>
                      </div>
                      <span style={{ fontSize: "16px", color: "#9ca3af" }}>›</span>
                    </div>
                  ) : (
                    <>
                      {/* 選択中の書体を、実際の見た目で表示する */}
                      <div style={{ background: "#6b7280", padding: "14px 10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                        <span style={{ fontFamily: `'${FONT_MAP[data.font].name}', sans-serif`, fontWeight: FONT_MAP[data.font].weight, fontSize: "20px", color: "#111827" }}>あア亜</span>
                        <span style={{ fontFamily: `'${FONT_MAP[data.font].name}', sans-serif`, fontWeight: FONT_MAP[data.font].weight, fontSize: "20px", color: accent, WebkitTextStroke: "3px #ffffff", paintOrder: "stroke fill" }}>あア亜</span>
                        <span style={{ fontFamily: `'${FONT_MAP[data.font].name}', sans-serif`, fontWeight: FONT_MAP[data.font].weight, fontSize: "20px", color: "#fff", textShadow: "2px 2px 0 #111827" }}>あア亜</span>
                      </div>
                      <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: accent }}>{FONT_MAP[data.font].name}</div>
                          <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>タップして変更</div>
                        </div>
                        <span style={{ fontSize: "16px", color: "#9ca3af" }}>›</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px", paddingBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>映像タイプ <span style={{ color: "#ef4444" }}>*</span></div>
                <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px" }}>動画に何を登場させるか</div>
                <ChipGrid items={VIDEO_TYPES} selected={data.videoType} onToggle={id => set("videoType", id)} cols={2} accent={accent} />
              </div>
              <div style={{ borderTop: "1px solid #f3f4f6" }} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>雰囲気・テンポ <span style={{ color: "#ef4444" }}>*</span></div>
                <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px" }}>動画全体のトーン</div>
                <ChipGrid items={VIDEO_STYLES} selected={data.videoStyle} onToggle={id => set("videoStyle", id)} cols={3} accent={accent} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>BGMスタイル <span style={{ color: "#ef4444" }}>*</span></div>
                <ChipGrid items={BGM_STYLES} selected={data.bgm} onToggle={id => set("bgm", id)} cols={3} accent={accent} />
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "12px 20px 24px", borderTop: "1px solid #f3f4f6", flexShrink: 0, display: "flex", gap: "8px" }}>
          {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>← 戻る</button>}
          {step < BRAND_STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!stepValid[step]} style={{ flex: 2, padding: "12px", borderRadius: "10px", border: "none", background: stepValid[step] ? `linear-gradient(135deg, ${accent}, ${accent}bb)` : "#e5e7eb", color: stepValid[step] ? "#fff" : "#9ca3af", fontWeight: 800, fontSize: "14px", cursor: stepValid[step] ? "pointer" : "default", boxShadow: stepValid[step] ? `0 4px 14px ${accent}33` : "none" }}>次へ →</button>
          ) : (
            <button onClick={() => onSave(data)} disabled={!stepValid[step]} style={{ flex: 2, padding: "12px", borderRadius: "10px", border: "none", background: stepValid[step] ? `linear-gradient(135deg, ${accent}, ${accent}bb)` : "#e5e7eb", color: stepValid[step] ? "#fff" : "#9ca3af", fontWeight: 800, fontSize: "14px", cursor: stepValid[step] ? "pointer" : "default" }}>💾 保存する</button>
          )}
        </div>
      </div>

      {fontPickerOpen && (
        <FontPicker
          value={data.font}
          onSelect={id => set("font", id)}
          onClose={() => setFontPickerOpen(false)}
        />
      )}
    </div>
  );
}

// ─── 画面1: プロジェクト一覧 ─────────────────────────
function ProjectList({ projects, onSelect, onNew, onEdit, onDelete, isDemo, getStats }) {
  return (
    <>
      <Header title="プロジェクト一覧" accentColor="#f97316"
        rightEl={<button onClick={onNew} style={{ padding: "8px 14px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", fontWeight: 700, fontSize: "12px", cursor: "pointer", boxShadow: "0 2px 10px #f9731633" }}>＋ 新規プロジェクト作成</button>} />
      <div style={{ width: "100%", padding: "20px 16px 60px" }}>
        {/* ヒーロー */}
        <div style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", borderRadius: "20px", padding: "20px 22px", marginBottom: "20px", color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: "-15px", top: "-15px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, opacity: 0.85, letterSpacing: "0.1em" }}>AI VIDEO & SNS GENERATOR</div>
            {isDemo && <span style={{ fontSize: "9px", fontWeight: 700, background: "rgba(255,255,255,0.25)", padding: "1px 8px", borderRadius: "20px" }}>🎭 デモ</span>}
          </div>
          <div style={{ fontSize: "20px", fontWeight: 900, marginBottom: "4px" }}>プロジェクトを選んで生成</div>
          <div style={{ fontSize: "12px", opacity: 0.85 }}>ブランド設定が自動反映 · Posta AI動画 · SNS投稿文</div>
        </div>

        <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "10px" }}>プロジェクト（{projects.length}件）</div>

        {projects.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: "16px", border: "2px dashed #e5e7eb", marginBottom: "10px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📁</div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827", marginBottom: "6px" }}>プロジェクトがまだありません</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "16px", lineHeight: 1.7 }}>「＋ 新規プロジェクト作成」から<br />最初のブランドを設定しましょう</div>
            <button onClick={onNew} style={{ padding: "10px 24px", borderRadius: "20px", border: "none", background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
              ＋ 新規プロジェクト作成
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {projects.map(p => {
            const color = gc(p.color); const industry = gi(p.industry);
            // 実際の生成履歴から集計した実績（件数・最近の生成）
            const stats = getStats ? getStats(p) : { count: 0, recent: [] };
            const tone = gt(p.tone); const video = gv(p.videoStyle);
            const bgm = gb(p.bgm); const font = gf(p.font);
            const purpose = gp(p.purpose); const keigo = gk(p.keigo);
            const targets = TARGETS.filter(t => (p.targets || []).includes(t.id));
            return (
              <div key={p.id} style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px #0000000a" }}>
                <div style={{ height: "3px", background: color?.primary || "#f97316" }} />
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "11px", overflow: "hidden", background: color?.secondary || "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                        {p.thumbnail
                          ? <img src={p.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : (industry?.icon || "📦")}
                      </div>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827" }}>{p.name}</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                          {industry?.label} · {stats.count}件生成
                          {p.updatedAt && ` · ${formatRelative(p.updatedAt)}編集`}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button onClick={() => onEdit(p)} style={{ padding: "6px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 700, fontSize: "11px", cursor: "pointer" }}>編集</button>
                      <button onClick={() => onDelete(p)} style={{ padding: "6px 10px", borderRadius: "8px", border: "1.5px solid #fecaca", background: "#fff", color: "#ef4444", fontWeight: 700, fontSize: "11px", cursor: "pointer" }}>削除</button>
                    </div>
                  </div>
                  {purpose && (
                    <div style={{ background: color?.secondary || "#fff7ed", borderRadius: "10px", padding: "9px 12px", marginBottom: "10px", border: `1px solid ${color?.primary || "#f97316"}22` }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: color?.primary || "#f97316", marginBottom: "2px" }}>{purpose.icon} {purpose.label}</div>
                      {p.purposeDetail && <div style={{ fontSize: "11px", color: "#374151", lineHeight: 1.6 }}>{p.purposeDetail}</div>}
                    </div>
                  )}
                  {targets.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                      {targets.map(t => <span key={t.id} style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", background: "#f3f4f6", color: "#374151" }}>{t.icon} {t.label}</span>)}
                    </div>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                    {[tone && `${tone.icon} ${tone.label}`, keigo && `📝 ${keigo.label}`, font && `🔤 ${font.label}`, video && `${video.icon} ${video.label}`, bgm && `${bgm.icon} ${bgm.label}`].filter(Boolean).map(label => (
                      <span key={label} style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", background: color?.secondary || "#fff7ed", color: color?.primary || "#f97316" }}>{label}</span>
                    ))}
                  </div>

                  {/* 最近の生成（実際の履歴から） */}
                  {stats.recent.length > 0 && (
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginBottom: "7px", display: "flex", alignItems: "center", gap: "5px" }}>
                        <span>🕐</span> 最近の生成
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        {stats.recent.map(h => {
                          const firstPlatform = (h.platforms || [])[0];
                          const pm = PLATFORM_META[firstPlatform] || { icon: "📄", accent: "#9ca3af" };
                          const hasVideo = !!h.videoUrl;
                          return (
                            <div key={h.id} style={{
                              display: "flex", alignItems: "center", gap: "8px",
                              padding: "7px 10px", borderRadius: "8px",
                              background: "#f8f9fb", border: "1px solid #f3f4f6",
                            }}>
                              <div style={{
                                width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                                background: pm.accent + "18",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "11px",
                              }}>{pm.icon}</div>
                              <span style={{
                                fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "10px",
                                background: hasVideo ? "#7c3aed18" : "#05966918",
                                color: hasVideo ? "#7c3aed" : "#059669",
                                flexShrink: 0,
                              }}>
                                {hasVideo ? "動画" : "投稿文"}
                              </span>
                              <div style={{ flex: 1, minWidth: 0, fontSize: "11px", color: "#374151", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {h.topic}
                              </div>
                              <div style={{ fontSize: "10px", color: "#9ca3af", flexShrink: 0 }}>
                                {formatRelative(h.createdAt)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button onClick={() => onSelect(p)} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "none", background: `linear-gradient(135deg, ${color?.primary || "#f97316"}, ${color?.primary || "#f97316"}cc)`, color: "#fff", fontWeight: 800, fontSize: "13px", cursor: "pointer", boxShadow: `0 3px 10px ${color?.primary || "#f97316"}33` }}>
                    このプロジェクトで生成 →
                  </button>
                </div>
              </div>
            );
          })}
          <button onClick={onNew} style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "2px dashed #d1d5db", background: "#fff", color: "#9ca3af", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.color = "#f97316"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#9ca3af"; }}>
            ＋ 新しいプロジェクトを追加
          </button>
        </div>
      </div>
    </>
  );
}

// ─── ルート ───────────────────────────────────────────
export default function ProjectListPage() {
  const navigate = useNavigate();

  const currentUser = getCurrentUser();
  const isDemo = currentUser?.role === "demo";
  const userId = currentUser?.id || "guest";

  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 実際の生成履歴（プロジェクトごとの実績を出すために使う）
  const [historyItems, setHistoryItems] = useState([]);

  // APIからプロジェクトと履歴を取得
  useEffect(() => {
    Promise.all([
      fetch(`/api/projects?userId=${encodeURIComponent(userId)}`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/history?userId=${encodeURIComponent(userId)}`).then(r => r.json()).catch(() => ({ history: [] })),
    ])
      .then(([projData, histData]) => {
        if (projData.projects) {
          const parsed = typeof projData.projects === "string" ? JSON.parse(projData.projects) : projData.projects;
          if (parsed.length > 0) {
            setProjects(parsed);
          } else if (isDemo) {
            setProjects(SAMPLE_PROJECTS);
          }
        } else if (isDemo) {
          setProjects(SAMPLE_PROJECTS);
        }
        setHistoryItems(Array.isArray(histData.history) ? histData.history : []);
      })
      .catch(() => { if (isDemo) setProjects(SAMPLE_PROJECTS); })
      .finally(() => setLoading(false));
  }, [userId]);

  /**
   * プロジェクトごとの実績を、実際の生成履歴から集計する。
   * 履歴には projectId が入っているので、それで紐づける。
   * （この仕組みより前に作られた履歴には projectId が無いため、
   *   その場合は projectName でも照合する）
   */
  const getProjectStats = (project) => {
    const related = historyItems.filter(h =>
      (h.projectId != null && String(h.projectId) === String(project.id)) ||
      (h.projectId == null && h.projectName === project.name)
    );
    return {
      count: related.length,
      // 新しい順に3件だけ「最近の生成」として見せる
      recent: related.slice(0, 3),
    };
  };

  // BottomNavのPボタンから来た時モーダルを開く
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setModal("new");
      setSearchParams({});
    }
  }, [searchParams]);

  // プロジェクトをAPIに保存
  const saveProjects = async (newProjects) => {
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, projects: JSON.stringify(newProjects) }),
      });
    } catch {}
  };
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleSelect = (project) => {
    // タスクを切っても選択状態が消えないよう、localStorageに保存する
    // （sessionStorageだとタブを閉じた時点で消え、次に開いたときに
    //   プロジェクト未選択の状態になってしまう）
    localStorage.setItem("posta_project", JSON.stringify(project));
    navigate("/generate");
  };

  /**
   * プロジェクトを削除する。
   *
   * 生成履歴（過去の作品）はプロジェクトとは別に保存されているため、
   * ここでは消さない。履歴は履歴ページから個別に消せる。
   * その方針をダイアログにも明記して、誤解が起きないようにする。
   */
  const handleDelete = (project) => {
    const stats = getProjectStats(project);
    const message =
      `「${project.name}」を削除しますか？\n\n` +
      (stats.count > 0
        ? `このプロジェクトで生成した${stats.count}件の作品は、過去の作品に残ります。\n`
        : "") +
      "この操作は取り消せません。";

    if (!window.confirm(message)) return;

    const newProjects = projects.filter(p => p.id !== project.id);
    setProjects(newProjects);
    saveProjects(newProjects);
    showToast("プロジェクトを削除しました");

    // 削除したプロジェクトが選択中だった場合、選択状態も消す
    // （そのまま生成画面へ行くと、存在しないプロジェクトを参照してしまうため）
    try {
      const selected = JSON.parse(localStorage.getItem("posta_project"));
      if (selected && String(selected.id) === String(project.id)) {
        localStorage.removeItem("posta_project");
      }
    } catch {}
  };

  const handleSave = (data) => {
    let newProjects;
    if (data.id) {
      // lastEdit は "今" のような固定文字列だったため、実際の日時に置き換える
      // （表示側で formatRelative を使って「3日前」等に変換する）
      newProjects = projects.map(p => p.id === data.id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
      setProjects(newProjects);
      showToast("ブランド設定を更新しました");
    } else {
      const newP = { ...data, id: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      newProjects = [...projects, newP];
      setProjects(newProjects);
      showToast("新規プロジェクトを作成しました");
    }
    saveProjects(newProjects);
    setModal(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif", color: "#111827" }}>
      <Toast msg={toast} />
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid #f3f4f6", borderTop: "3px solid #f97316", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <div style={{ fontSize: "13px", color: "#9ca3af" }}>読み込み中...</div>
          </div>
        </div>
      ) : (
        <ProjectList projects={projects} onSelect={handleSelect} onNew={() => setModal("new")} onEdit={p => setModal(p)} onDelete={handleDelete} isDemo={isDemo} getStats={getProjectStats} />
      )}
      {modal && <BrandModal project={modal === "new" ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />}
    </div>
  );
}
