// api/_animations.js
// テロップのアニメーション30種のカタログ。
// Creatomateの実機で動作確認済みの定義をそのまま持つ。
//
// なぜファイル内に直接書くか：
//   以前 _captionStyles.js を別ファイルからimportしたところ、
//   「ファイルは存在するのにexportが見つからない」という原因不明の
//   エラーが本番でだけ発生した。同じ轍を踏まないよう、
//   generate-captions.js 側に埋め込む方針で統一する。
//
// split の意味：
//   letter … 1文字ずつ動く（短い言葉で映える。主役向き）
//   word   … 単語ごとに動く（日本語は区切りが曖昧なので使い所を選ぶ）
//   line   … 行ごとに動く（長めの文に向く）

export const ANIMATION_CATALOG = [
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

export const ANIMATION_IDS = new Set(ANIMATION_CATALOG.map(a => a.id));
export const ANIMATION_MAP = Object.fromEntries(ANIMATION_CATALOG.map(a => [a.id, a]));

/** role ごとの既定アニメーション（AIが選ばなかった・不正なIDのときの受け皿） */
export const ROLE_DEFAULT_ANIMATION = {
  hook:  "slideUpLine",
  punch: "slideUpLetter",
  info:  "appearLineRandomly",
  cta:   "slideUpWord",
};
