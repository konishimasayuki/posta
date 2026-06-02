import { useState } from "react";

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
const FONTS = [
  { id: "ai",     label: "AIお任せ",   desc: "毎回最適を自動選択" },
  { id: "gothic", label: "ゴシック体", desc: "読みやすい・定番" },
  { id: "mincho", label: "明朝体",     desc: "上品・高級感" },
  { id: "round",  label: "丸ゴシック", desc: "かわいい・やわらか" },
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
const PLATFORMS = [
  { id: "tiktok",    label: "TikTok",    icon: "🎵", accent: "#fe2c55", desc: "台本形式" },
  { id: "x",         label: "X",         icon: "𝕏",  accent: "#1d9bf0", desc: "140文字" },
  { id: "instagram", label: "Instagram", icon: "📸", accent: "#f77737", desc: "キャプション" },
  { id: "note",      label: "note",      icon: "📝", accent: "#41c9b4", desc: "ブログ記事" },
];
const TOPICS = ["今日の出来事", "商品・サービス紹介", "お客様の声", "スタッフ紹介", "裏側・制作過程", "キャンペーン告知"];
const VIDEO_SPECS = [
  { platform: "TikTok",          icon: "🎵", size: "1080×1920", ratio: "9:16", accent: "#fe2c55" },
  { platform: "Instagram リール", icon: "📸", size: "1080×1920", ratio: "9:16", accent: "#f77737" },
  { platform: "Instagram 投稿",   icon: "📸", size: "1080×1080", ratio: "1:1",  accent: "#e1306c" },
  { platform: "X (動画)",         icon: "𝕏",  size: "1280×720",  ratio: "16:9", accent: "#1d9bf0" },
  { platform: "YouTube Shorts",  icon: "▶️", size: "1080×1920", ratio: "9:16", accent: "#ff0000" },
];
const BRAND_STEPS = ["目的・基本", "ターゲット", "トーン・言葉", "ビジュアル", "動画設定"];
const emptyBrand = {
  name: "", industry: "", color: "", tone: "", targets: [],
  keigo: "", fixedWords: "", font: "ai", videoStyle: "", bgm: "", duration: "medium",
  purpose: "", purposeDetail: "",
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
const gf = id => FONTS.find(f => f.id === id);
const gp = id => VIDEO_PURPOSES.find(p => p.id === id);
const gk = id => KEIGO.find(k => k.id === id);

function buildPrompt(project, input, platform, topic, keywords) {
  const tone = gt(project.tone); const video = gv(project.videoStyle);
  const bgm = gb(project.bgm); const font = gf(project.font);
  const keigo = gk(project.keigo); const purpose = gp(project.purpose);
  const targets = TARGETS.filter(t => (project.targets || []).includes(t.id));
  const platformGuides = {
    tiktok:    "TikTok動画の台本（冒頭フック3秒・本編箇条書き・CTA・ハッシュタグ10個）",
    x:         "X投稿文3パターン（各140文字以内・ハッシュタグ3〜5個）",
    instagram: "Instagramキャプション（冒頭3行・絵文字・ハッシュタグ20〜30個）",
    note:      "noteブログ（タイトル3案・構成・書き出し400文字）",
  };
  return `あなたはSNSコンテンツの専門ライターです。

【ブランド設定】
プロジェクト名：${project.name}
業種：${gi(project.industry)?.label}
動画の目的：${purpose?.label}（${project.purposeDetail || ""}）
ターゲット：${targets.map(t => `${t.age}${t.gender}`).join("・")}
トーン：${tone?.label}（${tone?.desc}）
文体：${keigo?.label}
動画スタイル：${video?.label}
BGM：${bgm?.label}
フォント：${font?.label}
${project.fixedWords ? `固定ワード：${project.fixedWords}` : ""}

【今日のネタ】${input || "（未入力・AIが考えて）"}
【テーマ】${topic}
${keywords ? `【キーワード】${keywords}` : "【キーワード】AIが最適なものを選んでください"}

【出力形式】${platformGuides[platform]}

上記ブランド設定に必ず従い、日本語で作成してください。`;
}

function buildKlingPrompt(project) {
  const tone = gt(project.tone); const video = gv(project.videoStyle);
  const targets = TARGETS.filter(t => (project.targets || []).includes(t.id));
  const purpose = gp(project.purpose);
  const ageDesc = [...new Set(targets.map(t => t.age))].join(", ");
  const genderDesc = [...new Set(targets.map(t => t.gender))].join(", ");
  const styleMap = { simple: "clean minimal white background", pop: "colorful vibrant animated", cinematic: "cinematic dramatic film style", vlog: "casual vlog handheld authentic", minimal: "elegant minimal luxury", energetic: "fast cuts dynamic energetic" };
  const purposeMap = { attract: "brand awareness lifestyle", product: "product showcase promotion", vlog: "behind the scenes daily life", tutorial: "tutorial how-to educational", brand: "brand story emotional", campaign: "campaign sale announcement" };
  return `[EN] ${styleMap[project.videoStyle] || "modern"} video, ${purposeMap[project.purpose] || "promotional"}, target audience ${ageDesc} ${genderDesc}, ${gi(project.industry)?.label} industry, ${tone?.label} mood, 9:16 vertical, high quality, professional lighting, no text overlay

[JP参考] ${project.purposeDetail || project.name + "のプロモーション動画"}`;
}

// ─── 小コンポーネント ─────────────────────────────────
function Toast({ msg }) {
  return msg ? <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: "#10b981", color: "#fff", padding: "11px 20px", borderRadius: "12px", fontWeight: 700, fontSize: "13px", zIndex: 500, boxShadow: "0 4px 20px #10b98140", whiteSpace: "nowrap", animation: "fadeDown 0.3s ease" }}>✓ {msg}</div> : null;
}

function Header({ title, onBack, accentColor, rightEl }) {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", gap: "10px" }}>
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
  const [data, setData] = useState(project ? { ...emptyBrand, ...project } : emptyBrand);
  const set = (k, v) => setData(p => ({ ...p, [k]: v }));
  const toggle = (k, id) => { const cur = data[k] || []; set(k, cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]); };
  const accent = gc(data.color)?.primary || "#f97316";
  const stepValid = [
    !!data.name && !!data.industry && !!data.purpose,
    (data.targets || []).length > 0,
    !!data.tone && !!data.keigo,
    !!data.color && !!data.font,
    !!data.videoStyle && !!data.bgm,
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: "560px", margin: "0 auto", background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
                    placeholder="例：週末モーニングを近隣の30代女性に知ってもらいたい。来店したくなるような雰囲気を伝えたい。"
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
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>固定ワード・禁止ワード <span style={{ color: "#9ca3af", fontWeight: 400 }}>任意</span></div>
                <textarea value={data.fixedWords || ""} onChange={e => set("fixedWords", e.target.value)}
                  placeholder={"固定→「ブランド名」「キャッチフレーズ」\n禁止→「安い」「格安」"}
                  rows={3} style={{ width: "100%", padding: "11px 13px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "13px", outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.7, color: "#111827" }}
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
                <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px" }}>「AIお任せ」は設定を優先参照しながら毎回最適を選択</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {FONTS.map(f => {
                    const sel = data.font === f.id;
                    return (
                      <div key={f.id} onClick={() => set("font", f.id)} style={{ padding: "13px", borderRadius: "11px", cursor: "pointer", border: `1.5px solid ${sel ? accent : "#e5e7eb"}`, background: sel ? accent + "12" : "#fff", transition: "all 0.15s", position: "relative" }}>
                        {f.id === "ai" && <span style={{ position: "absolute", top: "7px", right: "7px", fontSize: "9px", fontWeight: 700, background: "#fef9c3", color: "#a16207", padding: "1px 6px", borderRadius: "10px" }}>推奨</span>}
                        <div style={{ fontSize: "18px", fontWeight: 700, color: sel ? accent : "#374151", marginBottom: "3px" }}>{f.id === "ai" ? "✨" : "Aa"}</div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: sel ? accent : "#374151" }}>{f.label}</div>
                        <div style={{ fontSize: "10px", color: "#9ca3af" }}>{f.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px", paddingBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>動画スタイル <span style={{ color: "#ef4444" }}>*</span></div>
                <ChipGrid items={VIDEO_STYLES} selected={data.videoStyle} onToggle={id => set("videoStyle", id)} cols={3} accent={accent} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>BGMスタイル <span style={{ color: "#ef4444" }}>*</span></div>
                <ChipGrid items={BGM_STYLES} selected={data.bgm} onToggle={id => set("bgm", id)} cols={3} accent={accent} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>動画の尺</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[["short", "〜15秒", "Shorts/Reels"], ["medium", "30〜60秒", "スタンダード"], ["long", "1〜3分", "解説・Vlog"]].map(([id, label, desc]) => {
                    const sel = data.duration === id;
                    return (
                      <div key={id} onClick={() => set("duration", id)} style={{ flex: 1, padding: "12px 8px", borderRadius: "11px", cursor: "pointer", textAlign: "center", border: `1.5px solid ${sel ? accent : "#e5e7eb"}`, background: sel ? accent + "12" : "#fff", transition: "all 0.15s" }}>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: sel ? accent : "#111827" }}>{label}</div>
                        <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>{desc}</div>
                      </div>
                    );
                  })}
                </div>
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
    </div>
  );
}

// ─── 画面1: プロジェクト一覧 ─────────────────────────
function ProjectList({ projects, onSelect, onNew, onEdit }) {
  return (
    <>
      <Header title="プロジェクト一覧" accentColor="#f97316"
        rightEl={<button onClick={onNew} style={{ padding: "8px 14px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", fontWeight: 700, fontSize: "12px", cursor: "pointer", boxShadow: "0 2px 10px #f9731633" }}>＋ 新規作成</button>} />
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "20px 16px 60px" }}>
        {/* ヒーロー */}
        <div style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", borderRadius: "20px", padding: "20px 22px", marginBottom: "20px", color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: "-15px", top: "-15px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ fontSize: "10px", fontWeight: 700, opacity: 0.85, letterSpacing: "0.1em", marginBottom: "6px" }}>AI VIDEO & SNS GENERATOR</div>
          <div style={{ fontSize: "20px", fontWeight: 900, marginBottom: "4px" }}>プロジェクトを選んで生成</div>
          <div style={{ fontSize: "12px", opacity: 0.85 }}>ブランド設定が自動反映 · Kling AI動画 · SNS投稿文</div>
        </div>

        <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "10px" }}>プロジェクト（{projects.length}件）</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {projects.map(p => {
            const color = gc(p.color); const industry = gi(p.industry);
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
                      <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: color?.secondary || "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{industry?.icon || "📦"}</div>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827" }}>{p.name}</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>{industry?.label} · {p.posts}件生成 · {p.lastEdit}編集</div>
                      </div>
                    </div>
                    <button onClick={() => onEdit(p)} style={{ padding: "6px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 700, fontSize: "11px", cursor: "pointer", flexShrink: 0 }}>編集</button>
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

                  {/* 生成履歴 */}
                  {(p.history || []).length > 0 && (
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginBottom: "7px", display: "flex", alignItems: "center", gap: "5px" }}>
                        <span>🕐</span> 最近の生成
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        {(p.history || []).slice(0, 3).map(h => (
                          <div key={h.id} style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "7px 10px", borderRadius: "8px",
                            background: "#f8f9fb", border: "1px solid #f3f4f6",
                            cursor: "pointer", transition: "all 0.15s",
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = color?.secondary || "#fff7ed"; e.currentTarget.style.borderColor = color?.primary + "33" || "#f9731633"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#f8f9fb"; e.currentTarget.style.borderColor = "#f3f4f6"; }}
                          >
                            {/* プラットフォームバッジ */}
                            <div style={{
                              width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                              background: h.platformAccent + "18",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "11px",
                            }}>{h.platformIcon}</div>
                            {/* タイプバッジ */}
                            <span style={{
                              fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "10px",
                              background: h.type === "video" ? "#7c3aed18" : "#05966918",
                              color: h.type === "video" ? "#7c3aed" : "#059669",
                              flexShrink: 0,
                            }}>
                              {h.type === "video" ? "動画" : "投稿文"}
                            </span>
                            {/* トピック */}
                            <div style={{ flex: 1, fontSize: "11px", color: "#374151", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {h.topic}
                            </div>
                            {/* 時間 */}
                            <div style={{ fontSize: "10px", color: "#9ca3af", flexShrink: 0 }}>{h.time}</div>
                          </div>
                        ))}
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

// ─── 画面2: 生成メニュー ─────────────────────────────
function GenerateMenu({ project, onSNS, onVideo, onBack }) {
  const color = gc(project.color); const accent = color?.primary || "#f97316";
  return (
    <>
      <Header title="生成メニュー" onBack={onBack} accentColor={accent} />
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "20px 16px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: color?.secondary || "#fff7ed", borderRadius: "14px", padding: "14px 16px", marginBottom: "20px", border: `1px solid ${accent}22` }}>
          <div style={{ fontSize: "24px" }}>{gi(project.industry)?.icon || "📦"}</div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827" }}>{project.name}</div>
            <div style={{ fontSize: "11px", color: "#9ca3af" }}>{gt(project.tone)?.label} · {gv(project.videoStyle)?.label} · {gb(project.bgm)?.label}</div>
          </div>
        </div>

        <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "12px" }}>何を生成しますか？</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { icon: "📱", title: "SNS投稿文を生成", desc: "TikTok・Instagram・X・noteの投稿文をAIが自動生成", sub: "ネタを入力するだけ · コピーしてすぐ使える", onClick: onSNS, gradient: `linear-gradient(135deg, ${accent}, ${accent}bb)` },
            { icon: "🎬", title: "AI動画を生成（Kling）", desc: "ブランド設定をもとにKling AIが動画を自動生成", sub: "プロンプト自動生成 · 最大3分 · 9:16縦動画", onClick: onVideo, gradient: "linear-gradient(135deg, #7c3aed, #2563eb)" },
          ].map(item => (
            <div key={item.title} onClick={item.onClick} style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e5e7eb", padding: "18px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 4px 16px ${accent}22`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: item.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827", marginBottom: "3px" }}>{item.title}</div>
                  <div style={{ fontSize: "12px", color: "#374151", marginBottom: "4px" }}>{item.desc}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>{item.sub}</div>
                </div>
                <div style={{ fontSize: "18px", color: "#9ca3af" }}>→</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── 画面3: SNS生成 ──────────────────────────────────
function SNSGenerate({ project, onResult, onBack }) {
  const color = gc(project.color); const accent = color?.primary || "#f97316";
  const [platform, setPlatform] = useState("instagram");
  const [topic, setTopic] = useState("今日の出来事");
  const [input, setInput] = useState("");
  const [keywords, setKeywords] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentPlatform = PLATFORMS.find(p => p.id === platform);

  const handleGenerate = async () => {
    setLoading(true); setError(null);
    try {
      const userContent = [];
      images.forEach(img => userContent.push({ type: "image", source: { type: "base64", media_type: img.type, data: img.base64 } }));
      userContent.push({ type: "text", text: buildPrompt(project, input, platform, topic, keywords) });
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: userContent }] }) });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      onResult({ type: "sns", text, platform: currentPlatform, project, images });
    } catch { setError("生成に失敗しました。もう一度お試しください。"); }
    finally { setLoading(false); }
  };

  const handleImageAdd = (files) => {
    Array.from(files).slice(0, 3 - images.length).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = e => setImages(prev => [...prev, { file, preview: e.target.result, base64: e.target.result.split(",")[1], type: file.type }]);
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <Header title="SNS投稿文を生成" onBack={onBack} accentColor={accent} />
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "16px 16px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: color?.secondary || "#fff7ed", borderRadius: "10px", padding: "10px 12px", marginBottom: "14px", border: `1px solid ${accent}22` }}>
          <span style={{ fontSize: "16px" }}>{gi(project.industry)?.icon}</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: accent }}>{project.name}</span>
          <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "auto" }}>設定反映済み</span>
        </div>

        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "16px", marginBottom: "12px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "7px" }}>📷 写真素材 <span style={{ color: "#9ca3af", fontWeight: 400 }}>最大3枚・任意</span></div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={img.preview} alt="" style={{ width: "68px", height: "68px", objectFit: "cover", borderRadius: "10px", border: "1.5px solid #e5e7eb" }} />
                  <button onClick={() => setImages(p => p.filter((_, idx) => idx !== i))} style={{ position: "absolute", top: "-5px", right: "-5px", width: "18px", height: "18px", borderRadius: "50%", background: "#ef4444", color: "#fff", border: "none", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✕</button>
                </div>
              ))}
              {images.length < 3 && (
                <label style={{ width: "68px", height: "68px", borderRadius: "10px", border: "2px dashed #d1d5db", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "18px", color: "#9ca3af", gap: "2px" }}>
                  ＋<span style={{ fontSize: "9px" }}>{3 - images.length}枚</span>
                  <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleImageAdd(e.target.files)} />
                </label>
              )}
            </div>
          </div>
          <div style={{ borderTop: "1px solid #f3f4f6" }} />
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>📝 今日のネタ <span style={{ color: "#9ca3af", fontWeight: 400 }}>任意・空ならAIが考える</span></div>
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="例：今日の新メニューが好評だった" rows={2}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "13px", outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.7, color: "#111827" }}
              onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "7px" }}>
              {TOPICS.map(t => <button key={t} onClick={() => setTopic(t)} style={{ padding: "3px 9px", borderRadius: "20px", border: `1px solid ${topic === t ? accent : "#e5e7eb"}`, background: topic === t ? color?.secondary : "#f9fafb", color: topic === t ? accent : "#6b7280", fontSize: "10px", fontWeight: 600, cursor: "pointer" }}>{t}</button>)}
            </div>
          </div>
          <div style={{ borderTop: "1px solid #f3f4f6" }} />
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>🏷 入れたいワード <span style={{ color: "#9ca3af", fontWeight: 400 }}>空ならAIが選ぶ</span></div>
            <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="例：週末限定、モーニング"
              style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "13px", outline: "none", fontFamily: "inherit", color: "#111827" }}
              onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "14px", marginBottom: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "9px" }}>📱 プラットフォーム</div>
          <div style={{ display: "flex", gap: "7px", overflowX: "auto", scrollbarWidth: "none" }}>
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id)} style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0, padding: "8px 13px", borderRadius: "20px", border: `1.5px solid ${platform === p.id ? p.accent : "#e5e7eb"}`, background: platform === p.id ? p.accent + "15" : "#fff", color: platform === p.id ? p.accent : "#6b7280", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                <span>{p.icon}</span><span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 14px", marginBottom: "12px", fontSize: "13px", color: "#ef4444" }}>⚠️ {error}</div>}

        <button onClick={handleGenerate} disabled={loading} style={{ width: "100%", padding: "15px", borderRadius: "12px", border: "none", background: loading ? "#e5e7eb" : `linear-gradient(135deg, ${currentPlatform.accent}, ${accent})`, color: loading ? "#9ca3af" : "#fff", fontWeight: 800, fontSize: "15px", cursor: loading ? "default" : "pointer", boxShadow: !loading ? `0 4px 16px ${accent}44` : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          {loading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> AIが生成中...</> : `✨ ${currentPlatform.label}用に生成する`}
        </button>
      </div>
    </>
  );
}

// ─── 画面4: 動画生成（Kling） ─────────────────────────
function VideoGenerate({ project, onResult, onBack }) {
  const color = gc(project.color); const accent = color?.primary || "#f97316";
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState(false);

  const handleGeneratePrompt = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 500, messages: [{ role: "user", content: `以下のブランド設定をもとに、Kling AIで動画生成するための英語プロンプトを1つ作成してください。プロンプトのみを出力してください。

プロジェクト名：${project.name}
業種：${gi(project.industry)?.label}
目的：${gp(project.purpose)?.label}（${project.purposeDetail || ""}）
ターゲット：${TARGETS.filter(t => (project.targets||[]).includes(t.id)).map(t => t.label).join("・")}
トーン：${gt(project.tone)?.label}
動画スタイル：${gv(project.videoStyle)?.label}
BGM雰囲気：${gb(project.bgm)?.label}
縦動画（9:16）` }] }) });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("").trim() || buildKlingPrompt(project);
      setPrompt(text);
      setGenerated(true);
    } catch { setPrompt(buildKlingPrompt(project)); setGenerated(true); }
    finally { setLoading(false); }
  };

  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <>
      <Header title="AI動画を生成" onBack={onBack} accentColor={accent} />
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "16px 16px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: color?.secondary || "#fff7ed", borderRadius: "10px", padding: "10px 12px", marginBottom: "16px", border: `1px solid ${accent}22` }}>
          <span style={{ fontSize: "16px" }}>{gi(project.industry)?.icon}</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: accent }}>{project.name}</span>
        </div>

        {/* フロー説明 */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "16px", marginBottom: "14px" }}>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#374151", marginBottom: "12px" }}>🎬 動画生成の流れ</div>
          {[
            ["1", "プロンプト自動生成", "ブランド設定をもとにClaudeが英語プロンプトを生成", "#f97316"],
            ["2", "Kling AIで動画生成", "生成されたプロンプトをKlingに貼り付けて動画を生成", "#7c3aed"],
            ["3", "ダウンロード・投稿", "完成した動画をダウンロードしてSNSに投稿", "#059669"],
          ].map(([num, title, desc, c]) => (
            <div key={num} style={{ display: "flex", gap: "12px", marginBottom: "10px", alignItems: "flex-start" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, flexShrink: 0 }}>{num}</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{title}</div>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ブランド設定サマリー */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "16px", marginBottom: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#374151", marginBottom: "10px" }}>📋 反映されるブランド設定</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {[
              ["目的", `${gp(project.purpose)?.icon} ${gp(project.purpose)?.label}`],
              ["ターゲット", TARGETS.filter(t => (project.targets||[]).includes(t.id)).map(t => t.label).join("・")],
              ["トーン", `${gt(project.tone)?.icon} ${gt(project.tone)?.label}`],
              ["動画スタイル", `${gv(project.videoStyle)?.icon} ${gv(project.videoStyle)?.label}`],
              ["BGM", `${gb(project.bgm)?.icon} ${gb(project.bgm)?.label}`],
            ].filter(([_, v]) => v && v !== "undefined undefined").map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "#9ca3af" }}>{k}</span>
                <span style={{ fontWeight: 700, color: "#374151" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* プロンプト生成 */}
        {!generated ? (
          <button onClick={handleGeneratePrompt} disabled={loading} style={{ width: "100%", padding: "15px", borderRadius: "12px", border: "none", background: loading ? "#e5e7eb" : `linear-gradient(135deg, #7c3aed, #2563eb)`, color: loading ? "#9ca3af" : "#fff", fontWeight: 800, fontSize: "15px", cursor: loading ? "default" : "pointer", boxShadow: !loading ? "0 4px 16px #7c3aed44" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {loading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> プロンプトを生成中...</> : "✨ Klingプロンプトを自動生成する"}
          </button>
        ) : (
          <div>
            <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #7c3aed33", overflow: "hidden", marginBottom: "12px" }}>
              <div style={{ background: "#7c3aed12", padding: "12px 16px", borderBottom: "1px solid #7c3aed22", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#374151" }}>🤖 生成されたプロンプト</div>
                <button onClick={handleCopy} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: copied ? "#10b981" : "#7c3aed", color: "#fff", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>{copied ? "✓ コピー済み" : "📋 コピー"}</button>
              </div>
              <div style={{ padding: "14px 16px" }}>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5}
                  style={{ width: "100%", fontSize: "13px", color: "#374151", border: "none", outline: "none", resize: "none", fontFamily: "monospace", lineHeight: 1.7, background: "transparent" }} />
              </div>
            </div>

            <div style={{ background: "#f0f9ff", borderRadius: "12px", border: "1px solid #7dd3fc", padding: "14px 16px", marginBottom: "14px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#0369a1", marginBottom: "6px" }}>📌 次のステップ</div>
              <div style={{ fontSize: "12px", color: "#0c4a6e", lineHeight: 1.8 }}>
                1. 上のプロンプトをコピー<br />
                2. <a href="https://klingai.com" target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontWeight: 700 }}>klingai.com</a> を開く<br />
                3. 「AI Video」→「Text to Video」に貼り付け<br />
                4. 9:16縦動画で生成開始
              </div>
            </div>

            {/* 動画サイズ別DL */}
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "14px", marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#374151", marginBottom: "4px" }}>📐 SNSごとの推奨サイズ</div>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "10px" }}>Klingで生成後、各サイズにトリミングして投稿</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {VIDEO_SPECS.map(spec => (
                  <div key={spec.platform} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: "#f8f9fb", border: "1px solid #e5e7eb" }}>
                    <span style={{ fontSize: "16px" }}>{spec.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#111827" }}>{spec.platform}</div>
                      <div style={{ fontSize: "10px", color: "#9ca3af" }}>{spec.size} · {spec.ratio}</div>
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", background: spec.accent + "18", color: spec.accent }}>{spec.ratio}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => { setGenerated(false); setPrompt(""); }} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
              ↩ 再生成する
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── 画面5: 生成結果 ─────────────────────────────────
function SNSResult({ result, onBack, onNew }) {
  const { text, platform, project } = result;
  const color = gc(project.color); const accent = color?.primary || "#f97316";
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2000); };
  const handleCopy = () => { navigator.clipboard.writeText(text); setCopied(true); showToast("投稿文をコピーしました"); setTimeout(() => setCopied(false), 2000); };

  const handleDownload = (spec) => {
    const canvas = document.createElement("canvas");
    const [w, h] = spec.size.split("×").map(Number);
    canvas.width = w * 0.3; canvas.height = h * 0.3;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, color?.primary || "#f97316");
    grad.addColorStop(1, "#ea580c");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff"; ctx.font = `bold ${canvas.width * 0.07}px sans-serif`; ctx.textAlign = "center";
    ctx.fillText(project.name, canvas.width/2, canvas.height * 0.45);
    ctx.font = `${canvas.width * 0.05}px sans-serif`; ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText(`${spec.platform} · ${spec.size}`, canvas.width/2, canvas.height * 0.58);
    const a = document.createElement("a"); a.href = canvas.toDataURL("image/png");
    a.download = `posta_${spec.platform.replace(/\s/g,"_")}.png`; a.click();
    showToast(`${spec.platform}用をDLしました`);
  };

  return (
    <>
      <Header title="生成結果" onBack={onBack} accentColor={accent} />
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "16px 16px 80px" }}>
        <Toast msg={toast} />
        <div style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)`, borderRadius: "16px", padding: "14px 18px", marginBottom: "14px", color: "#fff" }}>
          <div style={{ fontSize: "11px", opacity: 0.85, marginBottom: "3px" }}>✨ 生成完了 · {platform.label}用</div>
          <div style={{ fontSize: "15px", fontWeight: 900 }}>{project.name}</div>
        </div>

        <div style={{ background: "#fff", borderRadius: "16px", border: `1.5px solid ${platform.accent}33`, overflow: "hidden", marginBottom: "12px" }}>
          <div style={{ background: `${platform.accent}12`, padding: "12px 16px", borderBottom: `1px solid ${platform.accent}22`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>{platform.icon}</span>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#374151" }}>投稿文</span>
              <span style={{ fontSize: "10px", color: platform.accent, fontWeight: 700, background: platform.accent + "18", padding: "2px 7px", borderRadius: "20px" }}>{platform.desc}</span>
            </div>
            <button onClick={handleCopy} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: copied ? "#10b981" : platform.accent, color: "#fff", fontWeight: 700, fontSize: "12px", cursor: "pointer", transition: "all 0.2s" }}>
              {copied ? "✓ コピー済み" : "📋 コピー"}
            </button>
          </div>
          <div style={{ padding: "16px", fontSize: "13px", lineHeight: 1.8, color: "#374151", whiteSpace: "pre-wrap", maxHeight: "280px", overflowY: "auto" }}>{text}</div>
        </div>

        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "14px", marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#374151", marginBottom: "4px" }}>🎬 動画素材をダウンロード</div>
          <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "10px" }}>SNSごとに最適なサイズで書き出し</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {VIDEO_SPECS.map(spec => (
              <div key={spec.platform} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: "#f8f9fb", border: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: "16px" }}>{spec.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#111827" }}>{spec.platform}</div>
                  <div style={{ fontSize: "10px", color: "#9ca3af" }}>{spec.size} · {spec.ratio}</div>
                </div>
                <button onClick={() => handleDownload(spec)} style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${spec.accent}33`, background: spec.accent + "12", color: spec.accent, fontWeight: 700, fontSize: "11px", cursor: "pointer" }}>⬇ DL</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={onBack} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>← 別で生成</button>
          <button onClick={onNew} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: `linear-gradient(135deg, ${accent}, ${accent}bb)`, color: "#fff", fontWeight: 800, fontSize: "13px", cursor: "pointer", boxShadow: `0 4px 14px ${accent}33` }}>別ネタで生成 ✨</button>
        </div>
      </div>
    </>
  );
}

// ─── ルート ───────────────────────────────────────────
export default function ProjectListPage() {
  const [screen, setScreen] = useState("list");
  const [projects, setProjects] = useState(SAMPLE_PROJECTS);
  const [activeProject, setActiveProject] = useState(null);
  const [result, setResult] = useState(null);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const accentColor = activeProject ? gc(activeProject.color)?.primary || "#f97316" : "#f97316";

  const handleSave = (data) => {
    if (data.id) {
      setProjects(ps => ps.map(p => p.id === data.id ? { ...p, ...data, lastEdit: "今" } : p));
      if (activeProject?.id === data.id) setActiveProject({ ...activeProject, ...data });
      showToast("ブランド設定を更新しました");
    } else {
      const newP = { ...data, id: Date.now(), posts: 0, lastEdit: "今" };
      setProjects(ps => [...ps, newP]);
      showToast("新規プロジェクトを作成しました");
    }
    setModal(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif", color: "#111827" }}>
      <Toast msg={toast} />
      {screen === "list"    && <ProjectList projects={projects} onSelect={p => { setActiveProject(p); setScreen("sns"); }} onNew={() => setModal("new")} onEdit={p => setModal(p)} />}
      {screen === "sns"     && activeProject && <SNSGenerate project={activeProject} onResult={r => { setResult(r); setScreen("result"); }} onBack={() => setScreen("list")} />}
      {screen === "video"   && activeProject && <VideoGenerate project={activeProject} onResult={r => { setResult(r); setScreen("result"); }} onBack={() => setScreen("list")} />}
      {screen === "result"  && result && <SNSResult result={result} onBack={() => setScreen("sns")} onNew={() => { setResult(null); setScreen("sns"); }} />}
      {modal && <BrandModal project={modal === "new" ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </div>
  );
}
