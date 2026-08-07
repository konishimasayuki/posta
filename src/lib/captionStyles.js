// src/lib/captionStyles.js
// captionStyles.json を読んで、テロップ1つ分のCSSを組み立てる。
//
// 見た目の値はすべて captionStyles.json 側にある。
// このファイルは「JSONをCSSに変換する」だけで、色や太さの定義は持たない。
//
// ── 描画のしくみ ──────────────────────────────
// グラデーションの塗りは background-clip:text を使うため、
// -webkit-text-stroke による縁取りと同じ要素には同居できない。
// そこで同じ文字を重ねて描く。
//
//   [下] 縁取り専用の層（太いものから順に重ねる）
//   [上] 塗りの層（単色・グラデ・ストライプ）
//
// この構造なら単色もグラデもメタリックも同じ扱いで書ける。

import data from "./captionStyles.json";

export const CAPTION_FONTS = data.fonts;
export const CAPTION_STYLES = data.styles;
export const CAPTION_CATEGORIES = data.categories;
export const ROLE_DEFAULT_STYLE = data.roleDefaults;

const STYLE_MAP = Object.fromEntries(data.styles.map(s => [s.id, s]));

/** 有効なスタイルIDかどうか */
export function isKnownStyleId(id) {
  return typeof id === "string" && Object.hasOwn(STYLE_MAP, id);
}

/**
 * スタイルIDから定義を引く。
 * 未知のIDや未指定のときは role に応じた既定スタイルに丸める。
 */
export function getCaptionStyle(id, role = "info") {
  if (isKnownStyleId(id)) return STYLE_MAP[id];
  const fallbackId = ROLE_DEFAULT_STYLE[role] || ROLE_DEFAULT_STYLE.info;
  return STYLE_MAP[fallbackId] || data.styles[0];
}

/** そのスタイルが使う書体の表示名（「ゴシック体」など） */
export function fontLabel(style) {
  return CAPTION_FONTS[style?.font]?.label || "";
}

/** そのスタイルが使うGoogle Fontsだけを読み込む（重複読み込みは避ける） */
export function ensureCaptionFontLoaded(style) {
  if (typeof document === "undefined") return;
  const font = CAPTION_FONTS[style?.font];
  if (!font?.google) return;

  const id = `posta-font-${font.google}`;
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`;
  document.head.appendChild(link);
}

/** ストライプの縞幅は文字サイズに追従させる */
function stripeGradient(stripe, fontSize) {
  const { angle = 45, colors = ["#ffffff", "#000000"], width = 0.16 } = stripe;
  const w = fontSize * width;
  const stops = colors
    .map((c, i) => `${c} ${(w * i).toFixed(2)}px ${(w * (i + 1)).toFixed(2)}px`)
    .join(", ");
  return `repeating-linear-gradient(${angle}deg, ${stops})`;
}

/** 塗りの指定（単色 / グラデ / ストライプ）をCSSに変換する */
function fillStyle(fill, fontSize) {
  if (!fill) return { color: "#ffffff" };
  if (typeof fill === "string") return { color: fill };

  const image = fill.gradient
    ? fill.gradient
    : fill.stripe
      ? stripeGradient(fill.stripe, fontSize)
      : null;

  if (!image) return { color: "#ffffff" };

  return {
    backgroundImage: image,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
  };
}

/**
 * スタイル定義と文字サイズから、実際に描く3種類のCSSを作る
 * 戻り値: { wrapper, strokes: [...], fill }
 */
export function buildCaptionLayers(style, fontSize) {
  const font = CAPTION_FONTS[style.font] || CAPTION_FONTS.gothic;
  const px = v => `${(fontSize * v).toFixed(2)}px`;

  // 影と発光はまとめて drop-shadow で乗せる。
  // text-shadow と違い、グラデ塗りの文字にも正しくかかる。
  const filter = (style.shadow || [])
    .map(([dx, dy, blur, color]) => `drop-shadow(${px(dx)} ${px(dy)} ${px(blur)} ${color})`)
    .join(" ");

  // 全ての層で文字の折り返し位置を揃える必要がある
  const base = {
    display: "block",
    width: "100%",
    margin: 0,
    fontFamily: font.family,
    fontWeight: style.weight || font.weight,
    fontStyle: style.italic ? "italic" : "normal",
    fontSize: `${fontSize}px`,
    lineHeight: 1.32,
    letterSpacing: style.tracking || "0.01em",
    textAlign: "center",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  // 太い縁取りを先に描き、細い縁取りをその上に重ねる（二重フチになる）
  const strokes = [...(style.stroke || [])]
    .sort((a, b) => b[0] - a[0])
    .map(([width, color]) => ({
      ...base,
      position: "absolute",
      left: 0,
      top: 0,
      color,
      WebkitTextStroke: `${px(width)} ${color}`,
      paintOrder: "stroke fill",
    }));

  return {
    wrapper: {
      position: "relative",
      display: "block",
      filter: filter || "none",
    },
    strokes,
    fill: { ...base, position: "relative", ...fillStyle(style.fill, fontSize) },
  };
}

/** 画面の選択UI用。カテゴリごとにまとめた一覧を返す */
export function captionStylesByCategory() {
  return Object.entries(CAPTION_CATEGORIES).map(([key, label]) => ({
    key,
    label,
    styles: CAPTION_STYLES.filter(s => s.category === key),
  }));
}
