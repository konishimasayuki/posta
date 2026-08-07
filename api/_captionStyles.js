// api/_creatomateStyles.js
// captionStyles.json（konishiさんの50種デザイン設計図）を、
// Creatomateのmodifications形式に変換するモジュール。
//
// 重要な前提：
//   ・Creatomateのテキスト装飾は「単色＋縁取り＋影」までしか対応できない。
//     グラデーション・ストライプ・金銀銅のような質感は再現できない。
//   ・フォントは「Creatomate側に実際にアップロード済みで、
//     かつ太さ（weight）が一致するもの」だけが安全に使える。
//     アップロードしていない・太さが合わないフォントを指定すると、
//     Creatomateはエラーを出さずに黙って別のフォントへ差し替える
//     （2026-08-07 の実験で実際に確認済み）。

/**
 * フォントの対応表。
 * verified: true のものだけを実際に使う。
 * false のものは「まだConfirmしていない」ことを示す安全弁で、
 * うっかり本番で使わないようにする。
 *
 * 新しいフォントをCreatomateにアップロードして動作確認できたら、
 * ここに追記して verified を true にすること。
 */
export const CREATOMATE_FONTS = {
  // captionStyles.json の fonts.pop に対応。2026-08-07 に実機確認済み。
  pop: {
    family: "Dela Gothic One",
    weight: "400", // Regularのみ存在。700を指定すると黙って別フォントに化ける
    verified: true,
    verifiedAt: "2026-08-07",
  },
  gothic: {
    family: "Noto Sans JP",
    weight: "700",
    verified: false, // まだCreatomateにアップロード・動作確認していない
  },
  // captionStyles.json の fonts.round に対応。2026-08-07 に実機確認済み。
  // Creatomate上では 300/400/500/700/900 が選択可能。900（Black）を使用。
  round: {
    family: "Zen Maru Gothic",
    weight: "900",
    verified: true,
    verifiedAt: "2026-08-07",
  },
  reggae: {
    family: "Reggae One",
    weight: "400",
    verified: false,
  },
  // captionStyles.json の fonts.mincho に対応。2026-08-07 に実機確認済み。
  // ExtraBold（800）のみアップロード済み。
  mincho: {
    family: "Shippori Mincho",
    weight: "800",
    verified: true,
    verifiedAt: "2026-08-07",
  },
  brush: {
    family: "Yuji Syuku",
    weight: "400",
    verified: false,
  },
};

/** 未確認のフォントを使う場合のフォールバック先（Creatomate標準搭載） */
const FALLBACK_FONT = { family: "Inter", weight: "700" };

/**
 * captionStyles.json の1スタイル定義から、
 * 指定したCreatomateの要素名（hook/punch/info/cta）向けの
 * modifications断片を作る。
 *
 * @param {object} style  captionStyles.json の styles[n]（例：CJ_S001）
 * @param {string} elementName  "hook" | "punch" | "info" | "cta"
 * @returns {{ modifications: object, degraded: boolean, reason: string|null }}
 *   degraded: グラデーション等で見た目を単色に簡略化した場合 true
 *   reason:   簡略化・フォールバックの理由（ログ・デバッグ用）
 */
export function styleToModifications(style, elementName) {
  const modifications = {};
  let degraded = false;
  let reason = null;

  // ── フォント ──
  const fontEntry = CREATOMATE_FONTS[style?.font];
  if (fontEntry?.verified) {
    modifications[`${elementName}.font_family`] = fontEntry.family;
    modifications[`${elementName}.font_weight`] = fontEntry.weight;
  } else {
    modifications[`${elementName}.font_family`] = FALLBACK_FONT.family;
    modifications[`${elementName}.font_weight`] = FALLBACK_FONT.weight;
    degraded = true;
    reason = fontEntry
      ? `フォント「${style.font}」は未検証のためInterで代用`
      : `フォント「${style?.font}」が対応表に無いためInterで代用`;
  }

  // ── 塗り色（グラデーション・ストライプは非対応） ──
  if (typeof style?.fill === "string") {
    modifications[`${elementName}.fill_color`] = style.fill;
  } else if (style?.fill && typeof style.fill === "object") {
    // グラデーション/ストライプの代表色（開始色）だけを単色として使う
    const approx = extractApproximateColor(style.fill);
    modifications[`${elementName}.fill_color`] = approx;
    degraded = true;
    reason = (reason ? reason + " / " : "") +
      "グラデーション・ストライプはCreatomateで再現できないため代表色の単色に簡略化";
  }

  // ── 縁取り（複数の縁取りがあっても、Creatomateは1本しか持てないので最太のものを使う） ──
  if (Array.isArray(style?.stroke) && style.stroke.length > 0) {
    const widest = [...style.stroke].sort((a, b) => b[0] - a[0])[0];
    const [widthRatio, color] = widest;
    // captionStyles.js側は「文字サイズに対する比率」で縁取り幅を持っているが、
    // Creatomateは vmin 等の絶対単位を要求する。呼び出し側でサイズを掛け合わせる前提とし、
    // ここでは比率のまま返す（実際のpx/vmin変換は creatomate-burn.js 側で行う）。
    modifications[`${elementName}.stroke_color`] = color;
    modifications[`${elementName}._strokeWidthRatio`] = widthRatio; // 内部用の一時値
    if (style.stroke.length > 1) {
      degraded = true;
      reason = (reason ? reason + " / " : "") + "二重フチはCreatomateで1本に簡略化";
    }
  }

  return { modifications, degraded, reason };
}

/** グラデーション/ストライプ定義から、代表となる単色を1つ取り出す */
function extractApproximateColor(fillObj) {
  if (fillObj.stripe?.colors?.length) {
    return fillObj.stripe.colors[0];
  }
  if (typeof fillObj.gradient === "string") {
    // "linear-gradient(180deg,#fdf3c0 0%,#e2b33c 38%,...)" から最初の色を拾う
    const match = fillObj.gradient.match(/#[0-9a-fA-F]{3,8}/);
    if (match) return match[0];
  }
  return "#ffffff"; // 万一パースできなければ白にフォールバック
}

/**
 * styleId（例："CJ_S001"）から、指定した要素名向けのmodificationsを作る。
 * テロップ（generate-captions.jsの出力）は styleId を持っているので、
 * これが実際の呼び出し口になる。
 *
 * @param {string} styleId       例："CJ_S037"
 * @param {string} elementName   "hook" | "punch" | "info" | "cta"
 * @param {object} styleDefs     _captionStyleDefs.js の CAPTION_STYLE_DEFS
 * @param {string} fallbackRole  styleIdが不正だった場合に使う既定スタイル選びの手がかり
 */
export function styleIdToModifications(styleId, elementName, styleDefs, fallbackRole = "info") {
  const style = styleDefs[styleId];

  if (!style) {
    // 不正なstyleIdは、無地の白文字にフォールバックする（焼き込み自体は止めない）
    return {
      modifications: {
        [`${elementName}.fill_color`]: "#ffffff",
        [`${elementName}.stroke_color`]: "#000000",
        [`${elementName}.font_family`]: FALLBACK_FONT.family,
        [`${elementName}.font_weight`]: FALLBACK_FONT.weight,
      },
      degraded: true,
      reason: `styleId「${styleId}」が見つからないため既定の白文字にフォールバック`,
    };
  }

  return styleToModifications(style, elementName);
}
