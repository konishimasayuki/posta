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
  // captionStyles.json の6カテゴリ（pop/gothic/round/reggae/mincho/brush）用。
  // 2026-08-07・08 に実機確認済み。
  pop: {
    family: "Dela Gothic One",
    weight: "400", // Regularのみ存在。700を指定すると黙って別フォントに化ける
    verified: true,
    verifiedAt: "2026-08-07",
  },
  // 2026-08-08：konishiさんが実際にCreatomateへアップロードし、
  // ウェイトを確認済み（NotoSansJPとして登録。900まで使用可）。
  gothic: {
    family: "Noto Sans JP",
    weight: "900",
    verified: true,
    verifiedAt: "2026-08-08",
  },
  round: {
    family: "Zen Maru Gothic",
    weight: "900",
    verified: true,
    verifiedAt: "2026-08-07",
  },
  reggae: {
    family: "Reggae One",
    weight: "400",
    verified: false, // 今回のフォント一覧には含まれていない。未検証のまま
  },
  mincho: {
    family: "Shippori Mincho",
    weight: "800",
    verified: true,
    verifiedAt: "2026-08-07",
  },
  brush: {
    family: "Yuji Syuku",
    weight: "400",
    verified: false, // 今回のフォント一覧には含まれていない。未検証のまま
  },

  // ── ここから、2026-08-08にkonishiさんが追加した28種類 ──────────
  // captionStyles.json の50種スタイルはまだこれらを参照していないが、
  // konishiさんの意向で「今後はここから選ぶ」ための拡張パレットとして
  // 登録しておく。将来的にスタイル側の font 指定をこのキーに変えれば
  // すぐ使える状態にしてある。
  //
  // 注意：フォント名の綴り（スペースの有無）はkonishiさんが用意した
  // 一覧の表記そのまま。Creatomateにアップロードした際の登録名と
  // 一字一句違うと、警告付きで黙って別フォントに差し替わる
  // （2026-08-07にDela Gothic One / Zen Maru Gothicで実際に発生した現象と同じ）。
  // 初めて使うときは必ず1回、実際にレンダーしてwarningsが出ないか確認すること。
  bIZUDGothic: { family: "BIZ UDGothic", weight: "700", verified: true, verifiedAt: "2026-08-08" }, // 実直・公共的・事務的
  bIZUDPGothic: { family: "BIZ UDPGothic", weight: "700", verified: true, verifiedAt: "2026-08-08" }, // 実直だが読みやすく柔らかい
  delaGothicOne: { family: "Dela Gothic One", weight: "400", verified: true, verifiedAt: "2026-08-08" }, // 力強い・インパクト最優先・レトロポップ
  dotGothic16: { family: "DotGothic16", weight: "400", verified: true, verifiedAt: "2026-08-08" }, // レトロゲーム・8bit・ノスタルジー
  iBMPlexSansJP: { family: "IBM Plex Sans JP", weight: "700", verified: true, verifiedAt: "2026-08-08" }, // インダストリアル・テック・企業的
  kaiseiDecol: { family: "Kaisei Decol", weight: "700", verified: true, verifiedAt: "2026-08-08" }, // 和モダン・レトロかわいい
  kiwiMaru: { family: "Kiwi Maru", weight: "500", verified: true, verifiedAt: "2026-08-08" }, // やわらかく可憐・少しレトロ
  kleeOne: { family: "Klee One", weight: "600", verified: true, verifiedAt: "2026-08-08" }, // 手書きの誠実さ・学校のノート・国語教材
  kosugi: { family: "Kosugi", weight: "400", verified: true, verifiedAt: "2026-08-08" }, // ニュートラル・実務的・地味
  kosugiMaru: { family: "Kosugi Maru", weight: "400", verified: true, verifiedAt: "2026-08-08" }, // 素朴・気取らない・カジュアル
  mPLUS1: { family: "M PLUS 1", weight: "900", verified: true, verifiedAt: "2026-08-08" }, // today的・都会的・力強いが冷静
  mPLUS1p: { family: "M PLUS 1p", weight: "900", verified: true, verifiedAt: "2026-08-08" }, // M PLUS 1と同系
  mPLUS2: { family: "M PLUS 2", weight: "900", verified: true, verifiedAt: "2026-08-08" }, // シャープ・都会的・スタイリッシュ
  mPLUSRounded1c: { family: "M PLUS Rounded 1c", weight: "900", verified: true, verifiedAt: "2026-08-08" }, // やわらかいのに強い
  mochiyPopOne: { family: "Mochiy Pop One", weight: "400", verified: true, verifiedAt: "2026-08-08" }, // かわいい・元気・子供っぽいポップさ
  murecho: { family: "Murecho", weight: "900", verified: true, verifiedAt: "2026-08-08" }, // 洗練・ミニマル・落ち着いたモダンさ
  notoSansJP: { family: "Noto Sans JP", weight: "900", verified: true, verifiedAt: "2026-08-08" }, // 中立・信頼感・汎用
  rocknRollOne: { family: "RocknRoll One", weight: "400", verified: true, verifiedAt: "2026-08-08" }, // 陽気・カジュアル・軽いポップさ
  sawarabiGothic: { family: "Sawarabi Gothic", weight: "400", verified: true, verifiedAt: "2026-08-08" }, // 素朴で控えめ・和の落ち着き
  shipporiMincho: { family: "Shippori Mincho", weight: "800", verified: true, verifiedAt: "2026-08-08" }, // 端正で凛とした和の重厚感
  shipporiMinchoB1: { family: "Shippori Mincho B1", weight: "800", verified: true, verifiedAt: "2026-08-08" }, // 凛とした和の重厚感・高級・伝統
  yuseiMagic: { family: "Yusei Magic", weight: "400", verified: true, verifiedAt: "2026-08-08" }, // 手作り感・親しみ・チラシや黒板書きの温度感
  zenAntiqueSoft: { family: "Zen Antique Soft", weight: "400", verified: true, verifiedAt: "2026-08-08" }, // 漫画の吹き出し・古書・昭和レトロ
  zenKakuGothicAntique: { family: "Zen Kaku Gothic Antique", weight: "900", verified: true, verifiedAt: "2026-08-08" }, // レトロで温かみのある角ゴ
  zenKakuGothicNew: { family: "Zen Kaku Gothic New", weight: "900", verified: true, verifiedAt: "2026-08-08" }, // 信頼感・端正・ビジネス寄り
  zenMaruGothic: { family: "Zen Maru Gothic", weight: "900", verified: true, verifiedAt: "2026-08-08" }, // やわらかいのに存在感がある
  zenOldMincho: { family: "Zen Old Mincho", weight: "900", verified: true, verifiedAt: "2026-08-08" }, // 重厚・和風・格式
  zenKurenaido: { family: "Zen Kurenaido", weight: "400", verified: true, verifiedAt: "2026-08-08" }, // 素朴・親しみやすい・ノートの走り書き
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
    modifications[`${elementName}.fill_color`] = normalizeColor(style.fill, "#ffffff");
  } else if (style?.fill && typeof style.fill === "object") {
    // グラデーション/ストライプの代表色（開始色）だけを単色として使う
    const approx = extractApproximateColor(style.fill);
    modifications[`${elementName}.fill_color`] = normalizeColor(approx, "#ffffff");
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
    modifications[`${elementName}.stroke_color`] = normalizeColor(color, "#000000");
    modifications[`${elementName}._strokeWidthRatio`] = widthRatio; // 内部用の一時値
    if (style.stroke.length > 1) {
      degraded = true;
      reason = (reason ? reason + " / " : "") + "二重フチはCreatomateで1本に簡略化";
    }
  }

  return { modifications, degraded, reason };
}

/**
 * 色をCreatomateが解釈できるhex形式に正規化する。
 *
 * captionStyles.json はブラウザ向けの定義なので、CSSの rgba() 記法が
 * 混ざっている（例: CJ_S047 の "rgba(90,62,10,0.45)"）。
 * Creatomateは rgba() を受け付けず「The string did not match the
 * expected pattern.」というエラーになるため、必ずここを通すこと。
 *
 * 透明度は落ちるが、Creatomate側で縁取りの透明度を表現する手段が
 * 無いため、色味だけを保持する。
 */
function normalizeColor(color, fallback = "#000000") {
  if (typeof color !== "string") return fallback;
  const trimmed = color.trim();

  // すでにhex形式ならそのまま使う（#RGB / #RRGGBB / #RRGGBBAA）
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) return trimmed;

  // rgb() / rgba() を hex に変換する
  const m = trimmed.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (m) {
    const toHex = n => {
      const v = Math.max(0, Math.min(255, Math.round(Number(n))));
      return v.toString(16).padStart(2, "0");
    };
    return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`;
  }

  return fallback;
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
export function styleIdToModifications(styleId, elementName, styleDefs, fallbackRole = "info", fontId = null) {
  const style = styleDefs[styleId];

  if (!style) {
    // 不正なstyleIdは、無地の白文字にフォールバックする（焼き込み自体は止めない）
    // ただし書体だけはAIの選択（fontId）を尊重する
    const fontEntry = fontId ? CREATOMATE_FONTS[fontId] : null;
    const useFont = fontEntry?.verified ? fontEntry : FALLBACK_FONT;
    return {
      modifications: {
        [`${elementName}.fill_color`]: "#ffffff",
        [`${elementName}.stroke_color`]: "#000000",
        [`${elementName}.font_family`]: useFont.family,
        [`${elementName}.font_weight`]: useFont.weight,
      },
      degraded: true,
      reason: `styleId「${styleId}」が見つからないため既定の白文字にフォールバック`,
    };
  }

  const result = styleToModifications(style, elementName);

  // AIがネタとブランドの雰囲気から選んだ書体があれば、
  // styleId由来の書体より優先して上書きする。
  // （styleIdは「色・装飾」を、fontIdは「書体」を担当する分業）
  if (fontId) {
    const fontEntry = CREATOMATE_FONTS[fontId];
    if (fontEntry?.verified) {
      result.modifications[`${elementName}.font_family`] = fontEntry.family;
      result.modifications[`${elementName}.font_weight`] = fontEntry.weight;
    } else {
      result.degraded = true;
      result.reason = (result.reason ? result.reason + " / " : "") +
        `書体「${fontId}」は未検証または未登録のため既定書体で代用`;
    }
  }

  return result;
}

// ── アニメーション定義 ─────────────────────────────
// generate-captions.js が選んだ animationId を、Creatomateに送る
// 実際のアニメーション定義に変換するための対応表。
// 中身は別班が実機で確認した定義をそのまま使っている。
//
// ※ generate-captions.js 側の ANIMATION_CATALOG とキーを必ず一致させること。
//   片方だけ変更すると、AIが選んだアニメーションが反映されなくなる。
const ANIMATION_DEFS = {
  slideUpLetter: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"up","split":"letter","scope":"element","distance":"200%","background_effect":"disabled"}], // Slide up letter by letter
  slideUpLetterClipped: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"up","split":"letter","scope":"split-clip"}], // Slide up letter by letter clipped
  rollLetters360: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-spin","split":"letter","distance":"0%","rotation":"360°"}], // Roll letters 360
  rollLettersUp: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-spin","split":"letter","direction":"left"}], // Roll letters up
  rollLetters200down: [{"time":0,"duration":1,"easing":"elastic-out","type":"text-spin","split":"letter","distance":"200%","direction":"down"}], // Roll letters 200down
  flyingLetter: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-fly","split":"letter"}], // Flying in letter by letter
  wavingLetter: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-wave","split":"letter","overlap":"50%"}], // Waving in letter by letter
  appearLetterRandomly: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-appear","split":"letter","order":"random"}], // Appear letter by letter randomly
  textScaleCenter: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-scale","split":"line"}], // Text scale center
  textScaleUp: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-scale","split":"line","axis":"y","y_anchor":"100%"}], // Text scale up
  slideUpLine: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"up","split":"line","scope":"element","distance":"200%","background_effect":"disabled"}], // Slide up line by line
  slideUpLineClipped: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"up","split":"line","scope":"split-clip"}], // Slide up line by line clipped
  slideLeftLine: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"left","split":"line","scope":"element","distance":"200%","background_effect":"disabled"}], // Slide left line by line
  slideRightLine: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"right","split":"line","scope":"element","distance":"200%","background_effect":"disabled"}], // Slide right line by line
  textRevealUp: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-reveal","split":"line","axis":"y","y_anchor":"100%"}], // Text reveal up
  textRevealLeft: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-reveal","split":"line","axis":"x","x_anchor":"100%"}], // Text reveal left
  textTypewriting: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-typewriter"}], // Text typewriting
  appearLine: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-appear","split":"line"}], // Appear line by line
  appearLineRandomly: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-appear","split":"line","order":"random"}], // Appear line by line randomly
  textRevealCenter: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-reveal","split":"line"}], // Text reveal center
  textRevealHorizontal: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-reveal","split":"line","axis":"x"}], // Text reveal horizontal
  slideDownLine: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"down","split":"line","scope":"element","distance":"200%","background_effect":"disabled"}], // Slide down line by line
  textScaleCenterVertical: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-scale","split":"line","axis":"y"}], // Text scale center vertical
  wavingLine: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-wave","split":"line","overlap":"50%"}], // Waving in line by line
  slideUpWord: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"up","split":"word","scope":"element","distance":"200%","background_effect":"disabled"}], // Slide up word by word
  appearWord: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-appear","split":"word"}], // Appear word by word
  textScaleCorner: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-scale","split":"line","x_anchor":"0%","y_anchor":"100%"}], // Text scale corner
  flyingLine: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-fly","split":"line"}], // Flying in line by line
  wavingWord: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-wave","split":"word","overlap":"50%"}], // Waving in word by word
  textRevealDown: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-reveal","split":"line","axis":"y","y_anchor":"0%"}], // Text reveal down
};

/**
 * animationId から、Creatomateのmodificationsに入れるアニメーション定義を返す。
 * 不正なIDや未指定の場合は null を返す（呼び出し側で既定値を使う）。
 */
export function animationIdToDefinition(animationId) {
  return ANIMATION_DEFS[animationId] || null;
}
