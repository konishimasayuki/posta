import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
const FONTS = [
  { id: "ai",       label: "AIお任せ",   desc: "毎回最適を自動選択" },
  { id: "gothic",   label: "ゴシック体", desc: "読みやすい・定番" },
  { id: "mincho",   label: "明朝体",     desc: "上品・高級感" },
  { id: "round",    label: "丸ゴシック", desc: "かわいい・やわらか" },
  { id: "serif",    label: "セリフ体",   desc: "欧文・エレガント" },
  { id: "display",  label: "ディスプレイ",desc: "インパクト・見出し向け" },
  { id: "handwrite",label: "手書き風",   desc: "温かみ・親近感" },
  { id: "mono",     label: "等幅体",     desc: "テック・クール・無機質" },
];
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
const emptyBrand = {
  name: "", industry: "", color: "", tone: "", targets: [],
  keigo: "", fixedWords: "", bannedWords: "", font: "ai", videoType: "", videoStyle: "", bgm: "",
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
    <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 16px", position: "sticky", top: 0, zIndex: 100 }}>
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
  const [data, setData] = useState(project ? { ...emptyBrand, ...project } : emptyBrand);
  const set = (k, v) => setData(p => ({ ...p, [k]: v }));
  const toggle = (k, id) => { const cur = data[k] || []; set(k, cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]); };
  const accent = gc(data.color)?.primary || "#f97316";
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
    </div>
  );
}

// ─── 画面1: プロジェクト一覧 ─────────────────────────
function ProjectList({ projects, onSelect, onNew, onEdit, isDemo }) {
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

// ─── ルート ───────────────────────────────────────────
export default function ProjectListPage() {
  const navigate = useNavigate();

  // デモユーザー判定
  const currentUser = (() => {
    try { return JSON.parse(sessionStorage.getItem("posta_user")); } catch { return null; }
  })();
  const isDemo = currentUser?.role === "demo";

  const [projects, setProjects] = useState(isDemo ? SAMPLE_PROJECTS : []);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleSelect = (project) => {
    sessionStorage.setItem("posta_project", JSON.stringify(project));
    navigate("/generate");
  };

  const handleSave = (data) => {
    if (data.id) {
      setProjects(ps => ps.map(p => p.id === data.id ? { ...p, ...data, lastEdit: "今" } : p));
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
      <ProjectList projects={projects} onSelect={handleSelect} onNew={() => setModal("new")} onEdit={p => setModal(p)} isDemo={isDemo} />
      {modal && <BrandModal project={modal === "new" ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />}
    </div>
  );
}
