// src/lib/fontCatalog.js
// Creatomateにアップロード済み・ウェイト確認済みの28書体。
// すべてGoogle Fonts由来なので、ブラウザ側もGoogle Fontsから読み込める。
//
// name … Google Fontsの正式名称。ブラウザ読み込み・Creatomate指定の両方でこれを使う
// weight … Creatomateで実際に使える中で一番太いウェイト
// category … 選択UIでのグループ分け用

export const FONT_CATEGORIES = {
  gothic: "ゴシック系",
  mincho: "明朝系",
  round: "丸ゴシック系",
  handwrite: "手書き系",
  deco: "装飾系",
};

export const FONT_CATALOG = [
  {
    id: "bIZUDGothic",
    name: "BIZ UDGothic",
    weight: "700",
    weights: ["700"],
    category: "gothic",
    feature: "等幅のUDゴシック太字。字面が揃い、見分けやすさ設計",
    mood: "実直・公共的・事務的。資料や帳票、アクセシビリティ重視",
  },
  {
    id: "bIZUDPGothic",
    name: "BIZ UDPGothic",
    weight: "700",
    weights: ["700"],
    category: "gothic",
    feature: "上記のプロポーショナル版。仮名の詰まりが自然で文章向き",
    mood: "実直だが読みやすく柔らかい。ビジネス文書の見出し",
  },
  {
    id: "delaGothicOne",
    name: "Dela Gothic One",
    weight: "400",
    weights: ["400"],
    category: "gothic",
    feature: "超極太・字面いっぱいの角ゴシック。角が立ち、隙間がほぼ潰れるほど太い",
    mood: "力強い・インパクト最優先・レトロポップ。短い見出しやロゴ向き",
  },
  {
    id: "dotGothic16",
    name: "DotGothic16",
    weight: "400",
    weights: ["400"],
    category: "deco",
    feature: "16ドットのビットマップを再現した階段状の輪郭",
    mood: "レトロゲーム・8bit・ノスタルジー。装飾用途限定",
  },
  {
    id: "iBMPlexSansJP",
    name: "IBM Plex Sans JP",
    weight: "700",
    weights: ["700"],
    category: "gothic",
    feature: "欧文Plex由来の骨格を持つ和文ゴシック太字。低めの重心と直線的な処理",
    mood: "インダストリアル・テック・企業的。英数字が特にきれい",
  },
  {
    id: "kaiseiDecol",
    name: "Kaisei Decol",
    weight: "700",
    weights: ["400", "500", "700"],
    category: "mincho",
    feature: "明朝系の骨格に丸みを帯びた装飾的な太字。ふっくらした縦画",
    mood: "和モダン・レトロかわいい。和菓子や着物、昭和喫茶の空気",
  },
  {
    id: "kiwiMaru",
    name: "Kiwi Maru",
    weight: "500",
    weights: ["300", "400", "500"],
    category: "mincho",
    feature: "明朝の骨格に丸い線端を合わせた中太。うろこは控えめ",
    mood: "やわらかく可憐・少しレトロ。文学的でやさしい",
  },
  {
    id: "kleeOne",
    name: "Klee One",
    weight: "600",
    weights: ["400", "600"],
    category: "handwrite",
    feature: "硬筆で書いた楷書に近い教科書体系。筆の入りと払いが残り、線幅は細めで抑揚がある",
    mood: "手書きの誠実さ・学校のノート・国語教材。やさしく真面目で、ノスタルジック",
  },
  {
    id: "kosugi",
    name: "Kosugi",
    weight: "400",
    weights: ["400"],
    category: "gothic",
    feature: "中細の標準的な角ゴシック。装飾がなく可読性重視",
    mood: "ニュートラル・実務的・地味。無個性を活かしたい場面向き",
  },
  {
    id: "kosugiMaru",
    name: "Kosugi Maru",
    weight: "400",
    weights: ["400"],
    category: "round",
    feature: "中細の丸ゴシック。線幅が細く軽い",
    mood: "素朴・気取らない・カジュアル。本文寄りの丸ゴ",
  },
  {
    id: "mPLUS1",
    name: "M PLUS 1",
    weight: "900",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    category: "gothic",
    feature: "モダンな角ゴシックの極太。ふところが広く直線的",
    mood: "today的・都会的・力強いが冷静。テック系の見出し",
  },
  {
    id: "mPLUS1p",
    name: "M PLUS 1p",
    weight: "900",
    weights: ["100", "300", "400", "500", "700", "800", "900"],
    category: "gothic",
    feature: "M PLUS 1のプロポーショナル版。欧文・数字の詰まりが良い",
    mood: "M PLUS 1と同系。和欧混植の見出しで自然",
  },
  {
    id: "mPLUS2",
    name: "M PLUS 2",
    weight: "900",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    category: "gothic",
    feature: "M PLUS 1より横幅がやや狭く、縦に伸びた印象の極太ゴシック",
    mood: "シャープ・都会的・スタイリッシュ。長めの見出しでも収まる",
  },
  {
    id: "mPLUSRounded1c",
    name: "M PLUS Rounded 1c",
    weight: "900",
    weights: ["900"],
    category: "round",
    feature: "線端が丸い丸ゴシックの最太ウェイト。字形は端正でクセが少ない",
    mood: "やわらかいのに強い。親しみやすく万能、UIの見出しにも合う",
  },
  {
    id: "mochiyPopOne",
    name: "Mochiy Pop One",
    weight: "400",
    weights: ["400"],
    category: "round",
    feature: "極太で角が丸い、ぽってりした丸ゴシック",
    mood: "かわいい・元気・子供っぽいポップさ。お菓子や子供向け販促の感じ",
  },
  {
    id: "murecho",
    name: "Murecho",
    weight: "900",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    category: "gothic",
    feature: "やや縦長で線が均質な現代的ゴシックの極太",
    mood: "洗練・ミニマル・落ち着いたモダンさ。ブランド見出し向き",
  },
  {
    id: "notoSansJP",
    name: "Noto Sans JP",
    weight: "900",
    weights: ["100", "300", "400", "500", "700", "900"],
    category: "gothic",
    feature: "標準的な角ゴシックの最太ウェイト。癖がなく骨格が正統で、字面が大きく可読性が高い",
    mood: "中立・信頼感・汎用。どんな内容にも馴染む安全牌で、企業やUIの見出しに強い",
  },
  {
    id: "rocknRollOne",
    name: "RocknRoll One",
    weight: "400",
    weights: ["400"],
    category: "handwrite",
    feature: "太めの角ゴシックだが、要所に手書き風の抑揚と斜めの筆致が入る。仮名がやや踊る",
    mood: "陽気・カジュアル・軽いポップさ。POPやSNS画像など、勢いを出したい場面向き",
  },
  {
    id: "sawarabiGothic",
    name: "Sawarabi Gothic",
    weight: "400",
    weights: ["400"],
    category: "handwrite",
    feature: "中細の角ゴシック。線がやや細く、仮名に手書きの名残があって硬すぎない",
    mood: "素朴で控えめ・和の落ち着き。本文や補足テキスト向きで、主張は弱い",
  },
  {
    id: "shipporiMincho",
    name: "Shippori Mincho",
    weight: "800",
    weights: ["400", "500", "600", "700", "800"],
    category: "mincho",
    feature: "明朝体の極太。縦画と横画の太さの差（コントラスト）が大きく、うろこと払いが鋭い。仮名は小ぶりで漢字が堂々と見える",
    mood: "端正で凛とした和の重厚感。伝統的・高級・落ち着き。書籍タイトル、和食・日本酒・旅館、時代物の見出しに向く",
  },
  {
    id: "shipporiMinchoB1",
    name: "Shippori Mincho B1",
    weight: "800",
    weights: ["400", "500", "600", "700", "800"],
    category: "mincho",
    feature: "極太明朝。丸数字・記号類を拡充したB1版で、縦横のコントラストが強くうろこが鋭い",
    mood: "凛とした和の重厚感・高級・伝統。書籍タイトル、和食や日本酒、時代物の見出しに合う",
  },
  {
    id: "yuseiMagic",
    name: "Yusei Magic",
    weight: "400",
    weights: ["400"],
    category: "handwrite",
    feature: "マーカーで書いたような手書き風ゴシック。線幅が揺らぎ、字形が少し歪む",
    mood: "手作り感・親しみ・チラシや黒板書きの温度感",
  },
  {
    id: "zenAntiqueSoft",
    name: "Zen Antique Soft",
    weight: "400",
    weights: ["400"],
    category: "deco",
    feature: "アンチック体系（漢字は明朝、仮名は太めゴシック寄り）で角が柔らかい",
    mood: "漫画の吹き出し・古書・昭和レトロ。素朴で懐かしい",
  },
  {
    id: "zenKakuGothicAntique",
    name: "Zen Kaku Gothic Antique",
    weight: "900",
    weights: ["300", "400", "500", "700", "900"],
    category: "gothic",
    feature: "角ゴシックだが起筆・終筆にわずかな抑揚があり、輪郭がやや柔らかい",
    mood: "レトロで温かみのある角ゴ。和のニュアンスを少し帯びる",
  },
  {
    id: "zenKakuGothicNew",
    name: "Zen Kaku Gothic New",
    weight: "900",
    weights: ["300", "400", "500", "700", "900"],
    category: "gothic",
    feature: "癖のない角ゴシックのブラック。骨格が正統で読みやすい",
    mood: "信頼感・端正・ビジネス寄り。汎用の強調に安全牌",
  },
  {
    id: "zenMaruGothic",
    name: "Zen Maru Gothic",
    weight: "900",
    weights: ["300", "400", "500", "700", "900"],
    category: "round",
    feature: "丸ゴシックの最太ウェイト。線端と角がしっかり丸く、ふところが広くて字面が大きい",
    mood: "やわらかいのに存在感がある。穏やかで上品なかわいさ。医療・教育・ベビー・食品系の見出しに合う",
  },
  {
    id: "zenOldMincho",
    name: "Zen Old Mincho",
    weight: "900",
    weights: ["400", "700", "900"],
    category: "mincho",
    feature: "オールドスタイル明朝の極太。強いうろこと縦画の太さのコントラスト",
    mood: "重厚・和風・格式。書籍タイトル、日本酒や旅館の見出し",
  },
  {
    id: "zenKurenaido",
    name: "Zen Kurenaido",
    weight: "400",
    weights: ["400"],
    category: "handwrite",
    feature: "ペン書きのような細い手書き系ゴシック。線幅がほぼ均一で、字形がわずかに揺れる",
    mood: "素朴・親しみやすい・ノートの走り書き。かわいすぎず落ち着いた手書き感",
  },
];

export const FONT_MAP = Object.fromEntries(FONT_CATALOG.map(f => [f.id, f]));

/** 指定されたフォントをGoogle Fontsから読み込む（重複読み込みは避ける） */
export function ensureFontLoaded(font) {
  if (typeof document === "undefined" || !font?.name) return;
  const familyParam = font.name.replace(/ /g, "+");
  const id = `posta-font-${familyParam}`;
  if (document.getElementById(id)) return;

  // ウェイト指定つきで読み込む（指定しないとRegularしか来ないフォントがある）
  const weightParam = font.weights?.length > 1
    ? `:wght@${font.weights.join(";")}`
    : "";

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${familyParam}${weightParam}&display=swap`;
  document.head.appendChild(link);
}
