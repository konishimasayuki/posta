// POST /api/generate-captions
// ネタとブランド設定から「テロップの設計図」を作る
//
// 返すもの: いつ・何を・どのくらいの強さで出すか
// 実際の描画はフロント側が担当する

import Anthropic from "@anthropic-ai/sdk";
import { describeProject } from "./_labels.js";

// ── テロップスタイル50種のカタログ ──────────────────────────
// 本来は ./_captionStyles.js に分けていたが、原因不明のまま
// 「ファイルは存在する・デプロイも最新なのにimportでexportが
// 見つからない」というエラーが解消しなかったため、ファイルを
// またぐ読み込みそのものをやめて、このファイルの中に直接埋め込む。
// 見た目（色・縁取り・フォント）の定義は src/lib/captionStyles.json 側にある。
// IDと用途の説明はそちらと必ず一致させること。IDを増減するときは両方を直す。
const CAPTION_STYLE_CATALOG = [
  { id: "CJ_S001", label: "ゴシック_赤",   use: "定番。読みやすさ優先の基本テロップ" },
  { id: "CJ_S002", label: "ゴシック_黄",   use: "定番。明るく目に入りやすい" },
  { id: "CJ_S003", label: "ゴシック_青",   use: "定番。落ち着いた印象・信頼感" },
  { id: "CJ_S004", label: "ポップ_赤",     use: "太くて元気。若年層向け・テンポの速い動画" },
  { id: "CJ_S005", label: "ポップ_黄",     use: "太くて元気。キャンペーン・お得情報" },
  { id: "CJ_S006", label: "ポップ_青",     use: "太くて元気。爽やか・清潔感" },
  { id: "CJ_S007", label: "ふとかわ_赤",   use: "太い丸文字。かわいい・親しみやすい" },
  { id: "CJ_S008", label: "ふとかわ_緑",   use: "太い丸文字。ナチュラル・健康" },
  { id: "CJ_S009", label: "ふとかわ_青",   use: "太い丸文字。やわらかい・安心感" },
  { id: "CJ_S010", label: "まるゴシ_赤",   use: "細めの丸ゴシック。上品なかわいさ" },
  { id: "CJ_S011", label: "まるゴシ_黄",   use: "細めの丸ゴシック。やさしい印象" },
  { id: "CJ_S012", label: "まるゴシ_青",   use: "細めの丸ゴシック。落ち着いたかわいさ" },
  { id: "CJ_S013", label: "ゴシ強調_黒",   use: "黒＋白フチ。どんな映像でも読める万能型" },
  { id: "CJ_S014", label: "ゴシ強調_赤",   use: "赤＋白フチ。冒頭の引きに強い" },
  { id: "CJ_S015", label: "ゴシ強調_青",   use: "青＋白フチ。行動喚起に落ち着きを出す" },
  { id: "CJ_S016", label: "ゴシグラデ_黒", use: "黒のグラデ。重厚・高級感のある補足" },
  { id: "CJ_S017", label: "ゴシグラデ_赤", use: "赤〜橙のグラデ。熱量を出したいとき" },
  { id: "CJ_S018", label: "ゴシグラデ_青", use: "水色〜青のグラデ。爽快感・清涼感" },
  { id: "CJ_S019", label: "怒り1",         use: "筆文字＋赤い滲み。強い怒り・告発トーン" },
  { id: "CJ_S020", label: "怒り2",         use: "明朝の赤。憤り・強い否定" },
  { id: "CJ_S021", label: "怒り3",         use: "黒＋黄緑の発光。毒気のあるツッコミ" },
  { id: "CJ_S022", label: "ツッコミ1",     use: "金〜橙の極太。大声のツッコミ" },
  { id: "CJ_S023", label: "ツッコミ2",     use: "黒＋黄フチ。冷たく突き放すツッコミ" },
  { id: "CJ_S024", label: "ツッコミ3",     use: "紺＋黄フチ＋赤発光。勢いのあるツッコミ" },
  { id: "CJ_S025", label: "恐怖1",         use: "紫の明朝。不穏・ホラー寄りの導入" },
  { id: "CJ_S026", label: "恐怖2",         use: "黒＋赤発光。危険・警告" },
  { id: "CJ_S027", label: "恐怖3",         use: "紫＋黒フチ。妖しさ・怪しい話題" },
  { id: "CJ_S028", label: "2色1",          use: "黒＋水色のずらし影。ポップで軽快" },
  { id: "CJ_S029", label: "2色2",          use: "黒＋緑のずらし影。カジュアル" },
  { id: "CJ_S030", label: "ストライプ1",   use: "水色×ピンクの縞。にぎやか・イベント告知" },
  { id: "CJ_S031", label: "ストライプ2",   use: "青紫×ピンクの縞。ポップで甘い印象" },
  { id: "CJ_S032", label: "蛍光_ピンク",   use: "白＋ピンクのネオン発光。夜・暗い映像で映える" },
  { id: "CJ_S033", label: "蛍光_ブルー",   use: "白＋青のネオン発光。テック・近未来" },
  { id: "CJ_S034", label: "色っぽい",       use: "淡いピンクの明朝。やわらかく艶っぽい" },
  { id: "CJ_S035", label: "セクシー",       use: "白＋淡紫の発光。大人っぽい・美容向け" },
  { id: "CJ_S036", label: "カッコイイ",     use: "白〜水色のグラデ。スタイリッシュ・クール" },
  { id: "CJ_S037", label: "強調_赤",       use: "明朝の赤＋二重フチ。最も強い主役" },
  { id: "CJ_S038", label: "強調_青",       use: "明朝の青＋二重フチ。信頼感のある主役" },
  { id: "CJ_S039", label: "拒否",          use: "くすんだ青灰。否定・NG例の提示" },
  { id: "CJ_S040", label: "しんどい",       use: "灰色のグラデ。疲れ・共感を誘う悩みの提示" },
  { id: "CJ_S041", label: "目立つ_赤",     use: "極太明朝の赤。価格・数字を一撃で見せる" },
  { id: "CJ_S042", label: "目立つ_緑",     use: "極太明朝の緑。お得・安心・成果" },
  { id: "CJ_S043", label: "目立つ_青",     use: "極太明朝の青。実績・データの提示" },
  { id: "CJ_S044", label: "金",            use: "本格的な金の質感。高級・特別感・受賞" },
  { id: "CJ_S045", label: "銀",            use: "銀の質感。上質・洗練・2位表現" },
  { id: "CJ_S046", label: "銅",            use: "銅の質感。温かみのある高級感・3位表現" },
  { id: "CJ_S047", label: "あっさり金",     use: "細めの金。控えめな高級感・ミニマル向け" },
  { id: "CJ_S048", label: "あっさり銀",     use: "細めの銀。上品・余白を活かす場面" },
  { id: "CJ_S049", label: "派手金",         use: "極太の金＋発光。セール・キャンペーンの主役" },
  { id: "CJ_S050", label: "レインボー",     use: "虹色グラデの斜体。祝い・記念・楽しさの最大化" },
];

const CAPTION_STYLE_IDS = new Set(CAPTION_STYLE_CATALOG.map(s => s.id));

/** role ごとの既定スタイル（AIが選ばなかった・不正なIDを返したときの受け皿） */
const ROLE_DEFAULT_STYLE = {
  hook:  "CJ_S014",
  punch: "CJ_S037",
  info:  "CJ_S013",
  cta:   "CJ_S015",
};

/** プロンプトに埋め込む一覧テキスト */
function styleCatalogText() {
  return CAPTION_STYLE_CATALOG.map(s => `${s.id}｜${s.label}｜${s.use}`).join("\n");
}

// ── アニメーションカタログ ─────────────────────────
// Creatomateで実機確認済みの30種。テロップの見せ方を決める重要な要素。
// 「動きが無い＝素人っぽい」ので、原則すべてのテロップに何かしら付ける。
//
// split の意味：
//   letter … 1文字ずつ動く（短い言葉で映える。主役向き）
//   word   … 単語ごとに動く（日本語は区切りが曖昧なので使い所を選ぶ）
//   line   … 行ごとに動く（長めの文に向く）
//
// ※ 実際のアニメーション定義は api/_creatomateStyles.js 側が持ち、
//   ここではAIに選ばせるためのIDと用途だけを提示する。
const ANIMATION_CATALOG = [
  {
    id: "slideUpLetter",
    label: "Slide up letter by letter",
    role: "punch",
    use: "1文字ずつ下から現れる。定番で外さない",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"up","split":"letter","scope":"element","distance":"200%","background_effect":"disabled"}],
  },
  {
    id: "slideUpLetterClipped",
    label: "Slide up letter by letter clipped",
    role: "punch",
    use: "1文字ずつ下から。切り抜き付きで引き締まる",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"up","split":"letter","scope":"split-clip"}],
  },
  {
    id: "rollLetters360",
    label: "Roll letters 360",
    role: "punch",
    use: "1文字ずつ1回転。強いインパクト",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-spin","split":"letter","distance":"0%","rotation":"360°"}],
  },
  {
    id: "rollLettersUp",
    label: "Roll letters up",
    role: "punch",
    use: "1文字ずつ縦に回転。数字や価格に映える",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-spin","split":"letter","direction":"left"}],
  },
  {
    id: "rollLetters200down",
    label: "Roll letters 200down",
    role: "punch",
    use: "1文字ずつ上から回転落下。勢いがある",
    animations: [{"time":0,"duration":1,"easing":"elastic-out","type":"text-spin","split":"letter","distance":"200%","direction":"down"}],
  },
  {
    id: "flyingLetter",
    label: "Flying in letter by letter",
    role: "punch",
    use: "1文字ずつ飛んでくる。躍動感",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-fly","split":"letter"}],
  },
  {
    id: "wavingLetter",
    label: "Waving in letter by letter",
    role: "punch",
    use: "1文字ずつ波打つ。楽しい・かわいい",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-wave","split":"letter","overlap":"50%"}],
  },
  {
    id: "appearLetterRandomly",
    label: "Appear letter by letter randomly",
    role: "punch",
    use: "1文字ずつランダムに出現。意外性",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-appear","split":"letter","order":"random"}],
  },
  {
    id: "textScaleCenter",
    label: "Text scale center",
    role: "punch",
    use: "中央から拡大。王道の強調",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-scale","split":"line"}],
  },
  {
    id: "textScaleUp",
    label: "Text scale up",
    role: "punch",
    use: "下から拡大しながら出る",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-scale","split":"line","axis":"y","y_anchor":"100%"}],
  },
  {
    id: "slideUpLine",
    label: "Slide up line by line",
    role: "hook",
    use: "下からスライド。最も自然で読みやすい",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"up","split":"line","scope":"element","distance":"200%","background_effect":"disabled"}],
  },
  {
    id: "slideUpLineClipped",
    label: "Slide up line by line clipped",
    role: "hook",
    use: "下からスライド＋切り抜き。締まった印象",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"up","split":"line","scope":"split-clip"}],
  },
  {
    id: "slideLeftLine",
    label: "Slide left line by line",
    role: "hook",
    use: "右から流れ込む",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"left","split":"line","scope":"element","distance":"200%","background_effect":"disabled"}],
  },
  {
    id: "slideRightLine",
    label: "Slide right line by line",
    role: "hook",
    use: "左から流れ込む",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"right","split":"line","scope":"element","distance":"200%","background_effect":"disabled"}],
  },
  {
    id: "textRevealUp",
    label: "Text reveal up",
    role: "hook",
    use: "下から徐々に現れる。上品",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-reveal","split":"line","axis":"y","y_anchor":"100%"}],
  },
  {
    id: "textRevealLeft",
    label: "Text reveal left",
    role: "hook",
    use: "右から徐々に現れる",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-reveal","split":"line","axis":"x","x_anchor":"100%"}],
  },
  {
    id: "textTypewriting",
    label: "Text typewriting",
    role: "hook",
    use: "タイプライター風。じらして引き込む",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-typewriter"}],
  },
  {
    id: "appearLine",
    label: "Appear line by line",
    role: "hook",
    use: "静かに出現。落ち着いた導入",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-appear","split":"line"}],
  },
  {
    id: "appearLineRandomly",
    label: "Appear line by line randomly",
    role: "info",
    use: "ふわっと出現。主張しすぎない",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-appear","split":"line","order":"random"}],
  },
  {
    id: "textRevealCenter",
    label: "Text reveal center",
    role: "info",
    use: "中央から広がる。上品",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-reveal","split":"line"}],
  },
  {
    id: "textRevealHorizontal",
    label: "Text reveal horizontal",
    role: "info",
    use: "横に広がる",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-reveal","split":"line","axis":"x"}],
  },
  {
    id: "slideDownLine",
    label: "Slide down line by line",
    role: "info",
    use: "上からスライド",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"down","split":"line","scope":"element","distance":"200%","background_effect":"disabled"}],
  },
  {
    id: "textScaleCenterVertical",
    label: "Text scale center vertical",
    role: "info",
    use: "縦方向に開く",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-scale","split":"line","axis":"y"}],
  },
  {
    id: "wavingLine",
    label: "Waving in line by line",
    role: "info",
    use: "軽く波打つ。柔らかい",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-wave","split":"line","overlap":"50%"}],
  },
  {
    id: "slideUpWord",
    label: "Slide up word by word",
    role: "cta",
    use: "単語ごとに下から。読ませたい文に",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-slide","direction":"up","split":"word","scope":"element","distance":"200%","background_effect":"disabled"}],
  },
  {
    id: "appearWord",
    label: "Appear word by word",
    role: "cta",
    use: "単語ごとに出現。テンポが出る",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-appear","split":"word"}],
  },
  {
    id: "textScaleCorner",
    label: "Text scale corner",
    role: "cta",
    use: "角から拡大。動きが目に留まる",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-scale","split":"line","x_anchor":"0%","y_anchor":"100%"}],
  },
  {
    id: "flyingLine",
    label: "Flying in line by line",
    role: "cta",
    use: "飛び込んでくる。行動を促す勢い",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-fly","split":"line"}],
  },
  {
    id: "wavingWord",
    label: "Waving in word by word",
    role: "cta",
    use: "単語ごとに波打つ。親しみやすい",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-wave","split":"word","overlap":"50%"}],
  },
  {
    id: "textRevealDown",
    label: "Text reveal down",
    role: "cta",
    use: "上から現れる。締めに使いやすい",
    animations: [{"time":0,"duration":1,"easing":"quadratic-out","type":"text-reveal","split":"line","axis":"y","y_anchor":"0%"}],
  },
];

const ANIMATION_IDS = new Set(ANIMATION_CATALOG.map(a => a.id));

/** role ごとの既定アニメーション（AIが選ばなかった・不正なIDのときの受け皿） */
const ROLE_DEFAULT_ANIMATION = {
  hook:  "slideUpLine",
  punch: "slideUpLetter",
  info:  "appearLineRandomly",
  cta:   "slideUpWord",
};

/** プロンプトに埋め込むアニメーション一覧テキスト（roleごとに分けて見せる） */
function animationCatalogText() {
  const byRole = { punch: [], hook: [], info: [], cta: [] };
  for (const a of ANIMATION_CATALOG) {
    if (byRole[a.role]) byRole[a.role].push(`  ${a.id}｜${a.use}`);
  }
  const roleLabel = { punch: "punch（主役）向き", hook: "hook（引き）向き", info: "info（補足）向き", cta: "cta（行動喚起）向き" };
  return Object.entries(byRole)
    .map(([role, items]) => `【${roleLabel[role]}】\n${items.join(String.fromCharCode(10))}`)
    .join(String.fromCharCode(10) + String.fromCharCode(10));
}

// ── フォントカタログ ───────────────────────────────
// konishiさんがCreatomateへアップロードし、ウェイトまで確認済みの28種類。
// AIに「ネタとブランドの雰囲気に合うフォント」を選ばせるために使う。
// 実際のフォント名・太さへの変換は api/_creatomateStyles.js が担当する
// （ここのidと、_creatomateStyles.js の CREATOMATE_FONTS のキーを必ず一致させること）。
const FONT_CATALOG = [
  { id: "bIZUDGothic", label: "BIZ UDGothic", use: "実直・公共的・事務的。資料や帳票、アクセシビリティ重視" },
  { id: "bIZUDPGothic", label: "BIZ UDPGothic", use: "実直だが読みやすく柔らかい。ビジネス文書の見出し" },
  { id: "delaGothicOne", label: "Dela Gothic One", use: "力強い・インパクト最優先・レトロポップ。短い見出しやロゴ向き" },
  { id: "dotGothic16", label: "DotGothic16", use: "レトロゲーム・8bit・ノスタルジー。装飾用途限定" },
  { id: "iBMPlexSansJP", label: "IBM Plex Sans JP", use: "インダストリアル・テック・企業的。英数字が特にきれい" },
  { id: "kaiseiDecol", label: "Kaisei Decol", use: "和モダン・レトロかわいい。和菓子や着物、昭和喫茶の空気" },
  { id: "kiwiMaru", label: "Kiwi Maru", use: "やわらかく可憐・少しレトロ。文学的でやさしい" },
  { id: "kleeOne", label: "Klee One", use: "手書きの誠実さ・学校のノート・国語教材。やさしく真面目で、ノスタルジック" },
  { id: "kosugi", label: "Kosugi", use: "ニュートラル・実務的・地味。無個性を活かしたい場面向き" },
  { id: "kosugiMaru", label: "Kosugi Maru", use: "素朴・気取らない・カジュアル。本文寄りの丸ゴ" },
  { id: "mPLUS1", label: "M PLUS 1", use: "today的・都会的・力強いが冷静。テック系の見出し" },
  { id: "mPLUS1p", label: "M PLUS 1p", use: "M PLUS 1と同系。和欧混植の見出しで自然" },
  { id: "mPLUS2", label: "M PLUS 2", use: "シャープ・都会的・スタイリッシュ。長めの見出しでも収まる" },
  { id: "mPLUSRounded1c", label: "M PLUS Rounded 1c", use: "やわらかいのに強い。親しみやすく万能、UIの見出しにも合う" },
  { id: "mochiyPopOne", label: "Mochiy Pop One", use: "かわいい・元気・子供っぽいポップさ。お菓子や子供向け販促の感じ" },
  { id: "murecho", label: "Murecho", use: "洗練・ミニマル・落ち着いたモダンさ。ブランド見出し向き" },
  { id: "notoSansJP", label: "Noto Sans JP", use: "中立・信頼感・汎用。どんな内容にも馴染む安全牌で、企業やUIの見出しに強い" },
  { id: "rocknRollOne", label: "RocknRoll One", use: "陽気・カジュアル・軽いポップさ。POPやSNS画像など、勢いを出したい場面向き" },
  { id: "sawarabiGothic", label: "Sawarabi Gothic", use: "素朴で控えめ・和の落ち着き。本文や補足テキスト向きで、主張は弱い" },
  { id: "shipporiMincho", label: "Shippori Mincho", use: "端正で凛とした和の重厚感。伝統的・高級・落ち着き。書籍タイトル、和食・日本酒・旅館、時代物の見出しに向く" },
  { id: "shipporiMinchoB1", label: "Shippori Mincho B1", use: "凛とした和の重厚感・高級・伝統。書籍タイトル、和食や日本酒、時代物の見出しに合う" },
  { id: "yuseiMagic", label: "Yusei Magic", use: "手作り感・親しみ・チラシや黒板書きの温度感" },
  { id: "zenAntiqueSoft", label: "Zen Antique Soft", use: "漫画の吹き出し・古書・昭和レトロ。素朴で懐かしい" },
  { id: "zenKakuGothicAntique", label: "Zen Kaku Gothic Antique", use: "レトロで温かみのある角ゴ。和のニュアンスを少し帯びる" },
  { id: "zenKakuGothicNew", label: "Zen Kaku Gothic New", use: "信頼感・端正・ビジネス寄り。汎用の強調に安全牌" },
  { id: "zenMaruGothic", label: "Zen Maru Gothic", use: "やわらかいのに存在感がある。穏やかで上品なかわいさ。医療・教育・ベビー・食品系の見出しに合う" },
  { id: "zenOldMincho", label: "Zen Old Mincho", use: "重厚・和風・格式。書籍タイトル、日本酒や旅館の見出し" },
  { id: "zenKurenaido", label: "Zen Kurenaido", use: "素朴・親しみやすい・ノートの走り書き。かわいすぎず落ち着いた手書き感" },
];

const FONT_IDS = new Set(FONT_CATALOG.map(f => f.id));

/** role ごとの既定フォント（AIが選ばなかった・不正なIDを返したときの受け皿） */
const ROLE_DEFAULT_FONT = {
  hook:  "zenKakuGothicNew",   // 端正で読みやすい、引きに使う汎用
  punch: "notoSansJP",         // 最太で視認性が高く、主役に耐える
  info:  "zenKakuGothicNew",   // 補足は素直で読みやすいものに
  cta:   "zenKakuGothicNew",   // 行動喚起も可読性優先
};

/** プロンプトに埋め込むフォント一覧テキスト */
function fontCatalogText() {
  return FONT_CATALOG.map(f => `${f.id}｜${f.label}｜${f.use}`).join("\n");
}

const MODEL = "claude-sonnet-4-6";

/** AIの返答から最初のJSONオブジェクトだけを取り出す */
function extractJson(text) {
  const cleaned = String(text).replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  if (start === -1) return null;

  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) return cleaned.slice(start, i + 1); }
  }
  return null;
}

const ROLES = ["hook", "punch", "info", "cta"];

/**
 * ユーザーが指定した言葉を、AIの判断を介さずに機械的に配置する保険。
 * 「500円と表示させ続けたい」のような指定を、AIが書き換えたり
 * 落としたりした場合でも確実に反映するための最終手段。
 */
function buildFallbackFromWords(words, duration, brandFontId = null) {
  const n = words.length;
  if (n === 0) return [];

  const per = duration / n;
  const hasDigit = w => /[0-9０-９]/.test(w);
  const punchIndex = words.findIndex(hasDigit); // 数字を含む言葉を主役にする

  return words.map((text, i) => {
    let role = "info";
    if (i === punchIndex) role = "punch";
    else if (i === 0 && punchIndex !== 0) role = "hook";
    else if (i === n - 1 && punchIndex !== n - 1) role = "cta";

    const isPunch = role === "punch";
    return {
      id: `cap_${i}`,
      text: text.slice(0, 20),
      start: Number((i * per).toFixed(2)),
      end: Number(((i + 1) * per).toFixed(2)),
      role,
      position: isPunch ? "center" : "bottom",
      size: isPunch ? "xl" : "md",
      emphasis: isPunch ? "highlight" : "none",
      styleId: ROLE_DEFAULT_STYLE[role] || ROLE_DEFAULT_STYLE.info,
      fontId:  brandFontId || ROLE_DEFAULT_FONT[role] || ROLE_DEFAULT_FONT.info,
      animationId: ROLE_DEFAULT_ANIMATION[role] || ROLE_DEFAULT_ANIMATION.info,
    };
  });
}

/** 生成結果に、指定した言葉がすべて（過不足なく）含まれているか確認する */
function containsAllWords(captions, words) {
  const texts = captions.map(c => c.text.trim());
  return words.every(w => texts.includes(w.trim()));
}
const POSITIONS = ["top", "center", "bottom"];
const SIZES = ["sm", "md", "lg", "xl"];
const EMPHASIS = ["none", "box", "underline", "highlight"];

/** AIの出力を安全な値に丸める */
function sanitize(captions, duration, brandFontId = null) {
  if (!Array.isArray(captions)) return [];

  const MIN_SHOW = 0.8; // 最低表示秒数

  const cleaned = captions
    .filter(c => c && typeof c.text === "string" && c.text.trim())
    .slice(0, 6)
    .map(c => {
      // 開始は「尺 - 最低表示秒」を超えないようにする
      const maxStart = Math.max(0, duration - MIN_SHOW);
      const start = Math.max(0, Math.min(Number(c.start) || 0, maxStart));

      const rawEnd = Number(c.end) || start + 2;
      // 終了は必ず尺の中に収める
      const end = Math.min(duration, Math.max(start + MIN_SHOW, rawEnd));

      const role = ROLES.includes(c.role) ? c.role : "info";

      return {
        text: c.text.trim().slice(0, 40),
        start,
        end,
        role,
        position: POSITIONS.includes(c.position) ? c.position : "bottom",
        size:     SIZES.includes(c.size) ? c.size : "md",
        emphasis: EMPHASIS.includes(c.emphasis) ? c.emphasis : "none",
        // 存在しないスタイルIDを返してきた場合は role ごとの既定に丸める
        styleId:  CAPTION_STYLE_IDS.has(c.styleId) ? c.styleId : (ROLE_DEFAULT_STYLE[role] || ROLE_DEFAULT_STYLE.info),
        // 書体の決定順：
        //   ① ブランド設定で具体的な書体が指定されていれば、それを最優先
        //      （ユーザーが「このブランドはこの書体」と意図的に決めたルールなので、
        //        AIが毎回変えるとブランドの一貫性が崩れる）
        //   ② 「AIお任せ」の場合のみ、AIが雰囲気から選んだ書体を使う
        //   ③ どちらも無効ならroleごとの既定フォント
        fontId:   brandFontId
                    ? brandFontId
                    : (FONT_IDS.has(c.fontId) ? c.fontId : (ROLE_DEFAULT_FONT[role] || ROLE_DEFAULT_FONT.info)),
        // アニメーションは必ず何か付ける（無しだと素人っぽく見えるため）。
        // AIが不正なIDを返した場合も、roleごとの既定アニメーションに丸める
        animationId: ANIMATION_IDS.has(c.animationId)
                    ? c.animationId
                    : (ROLE_DEFAULT_ANIMATION[role] || ROLE_DEFAULT_ANIMATION.info),
      };
    })
    .sort((a, b) => a.start - b.start);

  // 前後が重なっていたらずらす（同時に2つ出ると読めない）
  const result = [];
  let prevEnd = 0;

  for (const c of cleaned) {
    const start = Math.max(c.start, prevEnd);
    if (start >= duration) break;                    // もう入らない
    const end = Math.min(duration, Math.max(start + MIN_SHOW, c.end));
    if (end - start < 0.4) continue;                 // 短すぎるものは捨てる

    result.push({
      ...c,
      id: `cap_${result.length}`,
      start: Number(start.toFixed(2)),
      end: Number(end.toFixed(2)),
    });
    prevEnd = end;
  }

  return result;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { project = {}, neta = "", duration = 5, words = [] } = req.body || {};

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "APIキーが設定されていません" });
  }

  const seconds = Number(duration) || 5;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const brandInfo = describeProject(project);

  // ブランド設定で具体的な書体が指定されているか判定する。
  // "ai"（AIお任せ）や、対応表に無い値の場合は null にして、AIに選ばせる。
  const brandFontId = (project.font && project.font !== "ai" && FONT_IDS.has(project.font))
    ? project.font
    : null;

  // ユーザーがテロップの言葉を直接指定した場合は、その言葉「だけ」を材料にする。
  // AIが新しい文言を作り出すことはせず、役割の割り当てとタイミングだけを判断する。
  const userWords = Array.isArray(words)
    ? words.filter(w => typeof w === "string" && w.trim()).map(w => w.trim().slice(0, 20))
    : [];
  const hasUserWords = userWords.length > 0;

  // スタイルの選び方は「言葉の指定あり／なし」で共通なので1箇所にまとめる
  const styleSection = `【テロップの装飾スタイル（styleId）】
1つ1つのテロップに、以下の一覧から最も合うスタイルを1つ選んでIDを指定してください。

${styleCatalogText()}

【スタイル選びの考え方】
- ブランド設定のトーン・業種・ターゲットに合うものを選ぶ
- punch（主役）には強いスタイル（強調・目立つ・金・派手金など）を当てる
- info（補足）は読みやすい基本スタイル（ゴシ強調_黒など）に寄せる
- 感情系（怒り・ツッコミ・恐怖）は、ネタが実際にその感情を扱うときだけ使う
- 1本の動画の中でスタイルをバラバラにしすぎない。基本は2〜3種類までに抑え、
  punchだけ別格の1つを当てるのが読みやすい
- 迷ったら基本カテゴリ（CJ_S001〜CJ_S018, CJ_S037, CJ_S038）から選ぶ

【テロップの書体（fontId）】
1つ1つのテロップに、以下の一覧から最も合う書体を1つ選んでIDを指定してください。

${fontCatalogText()}

【書体選びの考え方】
- ブランド設定の業種・トーン・ターゲット層と、ネタの内容の両方に合うものを選ぶ
  （例：和食店や旅館なら明朝系、子供向けやお菓子ならポップな丸ゴシック、
   士業や医療なら実直な角ゴシック、テック系ならモダンなゴシック）
- punch（主役）は視認性が命。細い書体や手書き風は避け、太くて字面が大きいものを選ぶ
- info（補足）は文字数が多くなりがちなので、癖が少なく読みやすいものを選ぶ
- 装飾用途に振り切った書体（DotGothic16のようなドット絵風など）は、
  ネタが実際にその世界観を扱うときだけ使う
- 1本の動画の中で書体をバラバラにしすぎない。基本は1〜2種類に統一し、
  punchだけ別の書体で目立たせる程度に抑えるのが読みやすい

【テロップのアニメーション（animationId）】
1つ1つのテロップに、以下の一覧から必ず1つ選んでIDを指定してください。

${animationCatalogText()}

【アニメーション選びの考え方】

■ 大原則：必ず何かしらのアニメーションを付けること
  動きの無いテロップは、ただ文字が出ているだけで素人っぽく見えます。
  「無し」という選択肢はありません。全てのテロップに必ず指定してください。

■ 動きの性格を理解して選ぶこと
  - 「letter（1文字ずつ）」は動きが派手で目を引くが、文字数が多いと
    全部出るまで時間がかかる。**8文字以下の短い言葉**に使うこと。
    価格・数字・決め台詞など、一番見せたいものに最適。
  - 「line（行ごと）」は落ち着いていて読みやすい。**長めの文**や、
    落ち着いた雰囲気を出したいときに使う。
  - 「word（単語ごと）」は日本語だと区切りが不自然になることがあるので、
    短いフレーズに限って使う。

■ 表示時間との兼ね合い
  アニメーションは約1秒かかります。表示時間が1.5秒未満のテロップに
  派手な動き（letter系・roll系）を使うと、動き終わる前に消えてしまいます。
  **表示が短いテロップには、素早く決まる動き（slide・appear・reveal系）**を選ぶこと。

■ ブランドの雰囲気に合わせる
  - かわいい・楽しい系（カフェ、子供向け、雑貨）
    → waving（波打つ）、roll（回転）、flying（飛んでくる）
  - 落ち着き・信頼系（士業、医療、不動産、高級店）
    → reveal（徐々に現れる）、appear（静かに出現）、slide（すっと動く）
  - 勢い・元気系（ジム、セール、若年層向け）
    → roll360、flying、scale（拡大）
  - じらして引き込みたいとき
    → typewriting（タイプライター風）。ただし1本に1回まで

■ 1本の動画の中でのバランス
  全部を派手にすると目が疲れて、どれも印象に残りません。
  **punchだけ派手に、他は控えめに**するのが基本です。
  同じアニメーションを2つ以上のテロップで使い回さないこと。`;

  const instruction = hasUserWords
    ? `あなたは縦型ショート動画のテロップ設計の専門家です。
${seconds}秒の動画に、以下の「指定された言葉」だけを使ってテロップを設計してください。

【ブランド設定（雰囲気の参考程度に）】
${brandInfo}

【指定された言葉（このリストの言葉だけを使うこと。書き換え・言い換え禁止）】
${userWords.map((w, i) => (i + 1) + ". " + w).join(String.fromCharCode(10))}

【設計の考え方】
- 指定された言葉を、意味が伝わりやすい順番に並べ替えてよい
- 言葉の中で一番強く伝えたいもの（価格・数字・キャッチコピーなど）を punch として最も強く見せる
- 最初に来る言葉は自然と hook の役割になりやすい
- 最後に行動を促すような言葉（「DMで」「今すぐ」等）があれば cta にする
- それ以外は info として扱う
- 新しい言葉を作らない。指定された${userWords.length}個の言葉をすべて使うこと
- 1個の言葉を複数回に分けて表示しない

【文字数の目安（新しく書かない前提なのであくまで参考）】
- 短い言葉ほど強く（xl・punch向き）、長い言葉は info や小さめサイズが読みやすい

【タイミング】
- 動画は${seconds}秒。start/end は 0 〜 ${seconds} の範囲の秒数
- テロップ同士は重ねない（前のendの後に次のstartが来る）
- 各テロップは最低1秒は表示する
- 指定された言葉の数（${userWords.length}個）ぶんだけ出力する

【各項目の意味】
- role: hook（引き）/ punch（主役）/ info（補足）/ cta（行動喚起）
- position: top / center / bottom（punchはcenter推奨）
- size: sm / md / lg / xl（punchはxl推奨）
- emphasis: none / box（枠）/ underline（下線）/ highlight（マーカー）

${styleSection}

【出力形式】
以下のJSONだけを出力。前置き・解説・コードブロックは一切書かないこと。
{"captions":[{"text":"...","start":0,"end":1.5,"role":"hook","position":"bottom","size":"md","emphasis":"none","styleId":"CJ_S014","fontId":"zenKakuGothicNew","animationId":"slideUpLine"}]}`
    : `あなたは縦型ショート動画のテロップ設計の専門家です。
${seconds}秒の動画に載せるテロップを設計してください。

【ブランド設定】
${brandInfo}

【今回のネタ】
${neta || "ブランド設定に沿った内容"}

【設計の考え方】
- 一番伝えたい情報を1つだけ選び、それを punch として最も強く見せる
- 冒頭1〜2秒は hook で視聴者を引き止める（短く・問いかけや驚き）
- 最後は cta で行動を促す
- info は補足。無くてもよい
- ネタの内容によって構成を変えること。価格訴求なら価格を punch に、
  人物紹介なら人柄が伝わる言葉を punch にする

【文字数のルール】
- hook: 8〜14文字
- punch: 6〜12文字（数字や短い言葉ほど強い）
- info: 8〜16文字
- cta: 8〜14文字
- 1画面に長文を出さない。読み切れない

【タイミング】
- 動画は${seconds}秒。start/end は 0 〜 ${seconds} の範囲の秒数
- テロップ同士は重ねない（前のendの後に次のstartが来る）
- 各テロップは最低1秒は表示する
- 全部で3〜5個

【各項目の意味】
- role: hook（引き）/ punch（主役）/ info（補足）/ cta（行動喚起）
- position: top / center / bottom（punchはcenter推奨）
- size: sm / md / lg / xl（punchはxl推奨）
- emphasis: none / box（枠）/ underline（下線）/ highlight（マーカー）

${styleSection}

【出力形式】
以下のJSONだけを出力。前置き・解説・コードブロックは一切書かないこと。
{"captions":[{"text":"...","start":0,"end":1.5,"role":"hook","position":"bottom","size":"md","emphasis":"none","styleId":"CJ_S014","fontId":"zenKakuGothicNew","animationId":"slideUpLine"}]}`;

  let rawText = "";

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 900,
      messages: [{ role: "user", content: instruction }],
    });

    rawText = message.content.map(b => b.text || "").join("").trim();

    const jsonStr = extractJson(rawText);
    if (!jsonStr) {
      return res.status(500).json({ error: "設計結果を読み取れませんでした", raw: rawText.slice(0, 300) });
    }

    const parsed = JSON.parse(jsonStr);
    let captions = sanitize(parsed.captions, seconds, brandFontId);

    if (captions.length === 0) {
      if (hasUserWords) {
        // AIが空を返した場合でも、指定された言葉だけは確実に出す
        captions = buildFallbackFromWords(userWords, seconds, brandFontId);
      } else {
        return res.status(500).json({ error: "テロップが空でした", raw: rawText.slice(0, 300) });
      }
    } else if (hasUserWords && !containsAllWords(captions, userWords)) {
      // AIが言葉を書き換えた・落とした場合は、指定通りの機械的な配置に差し替える
      console.warn("指定した言葉が反映されなかったためフォールバックします:", userWords, captions.map(c => c.text));
      captions = buildFallbackFromWords(userWords, seconds, brandFontId);
    }

    // Vercelのログで「AIが何を選んだか」を追えるようにする。
    // フォント・アニメーションが意図通り選ばれているかは、
    // 実際に動画を見るまで分からないため、記録を残しておく。
    console.log("[generate-captions] 設計結果:", JSON.stringify(
      captions.map(c => ({
        role: c.role,
        text: c.text,
        time: `${c.start}-${c.end}s`,
        style: c.styleId,
        font: c.fontId,
        anim: c.animationId,
      }))
    ));

    return res.status(200).json({ captions, usedFallback: hasUserWords && captions.every(c => c.id?.startsWith("cap_")) });

  } catch (err) {
    console.error("generate-captions error:", err, "\nraw:", rawText.slice(0, 300));
    return res.status(500).json({ error: err.message || "テロップの設計に失敗しました" });
  }
}
