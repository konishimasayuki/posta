// src/lib/fonts.js
// ブランド設定のフォント指定を、実際のWebフォントに対応づける

export const FONT_MAP = {
  gothic: {
    label: "ゴシック体",
    family: "'Noto Sans JP', sans-serif",
    google: "Noto+Sans+JP:wght@400;700;900",
    weight: 900,
    tracking: "0.01em",
  },
  mincho: {
    label: "明朝体",
    family: "'Shippori Mincho', 'Noto Serif JP', serif",
    google: "Shippori+Mincho:wght@600;800",
    weight: 800,
    tracking: "0.03em",
  },
  round: {
    label: "丸ゴシック",
    family: "'Zen Maru Gothic', 'M PLUS Rounded 1c', sans-serif",
    google: "Zen+Maru+Gothic:wght@700;900",
    weight: 900,
    tracking: "0.02em",
  },
  serif: {
    label: "セリフ体",
    family: "'Noto Serif JP', serif",
    google: "Noto+Serif+JP:wght@600;900",
    weight: 900,
    tracking: "0.02em",
  },
  display: {
    label: "ディスプレイ",
    family: "'Dela Gothic One', 'Noto Sans JP', sans-serif",
    google: "Dela+Gothic+One",
    weight: 400,          // このフォントは1ウェイトのみ
    tracking: "0.01em",
  },
  handwrite: {
    label: "手書き風",
    family: "'Yomogi', 'Zen Kurenaido', sans-serif",
    google: "Yomogi",
    weight: 400,
    tracking: "0.04em",
  },
  mono: {
    label: "等幅体",
    family: "'M PLUS 1 Code', monospace",
    google: "M+PLUS+1+Code:wght@500;700",
    weight: 700,
    tracking: "0.05em",
  },
};

/**
 * 「AIお任せ」のときは、ブランドのトーンから最適なフォントを選ぶ
 */
const TONE_TO_FONT = {
  friendly:     "round",
  professional: "gothic",
  cute:         "round",
  cool:         "gothic",
  warm:         "round",
  energetic:    "display",
};

/**
 * 業種による補正。トーン指定が無いときの保険
 */
const INDUSTRY_TO_FONT = {
  legal:      "mincho",
  medical:    "gothic",
  realestate: "gothic",
  beauty:     "serif",
  creative:   "display",
  it:         "mono",
};

/**
 * プロジェクト設定から使うフォントを決める
 */
export function resolveFont(project = {}) {
  const key = project.font;

  if (key && key !== "ai" && FONT_MAP[key]) {
    return FONT_MAP[key];
  }

  // AIお任せ: トーン → 業種 → ゴシック の順で決める
  const byTone = TONE_TO_FONT[project.tone];
  if (byTone && FONT_MAP[byTone]) return FONT_MAP[byTone];

  const byIndustry = INDUSTRY_TO_FONT[project.industry];
  if (byIndustry && FONT_MAP[byIndustry]) return FONT_MAP[byIndustry];

  return FONT_MAP.gothic;
}

/**
 * 必要なGoogle Fontsだけを読み込む（重複読み込みは避ける）
 */
export function ensureFontLoaded(font) {
  if (typeof document === "undefined" || !font?.google) return;

  const id = `posta-font-${font.google}`;
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`;
  document.head.appendChild(link);
}

/**
 * ブランドカラーからテロップのアクセント色を決める
 */
export const BRAND_COLORS = {
  purple: "#7c3aed",
  pink:   "#db2777",
  blue:   "#2563eb",
  green:  "#059669",
  orange: "#ea580c",
  red:    "#dc2626",
  teal:   "#0d9488",
  gray:   "#374151",
};

export function resolveAccent(project = {}, fallback = "#f97316") {
  return BRAND_COLORS[project.color] || fallback;
}
