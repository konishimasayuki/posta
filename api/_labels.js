// api/_labels.js
// ブランド設定のIDを日本語ラベルに変換する共通モジュール
// ※ ファイル名の先頭が _ のものは Vercel でAPIエンドポイントにならない

const INDUSTRIES = {
  restaurant: "飲食・カフェ",
  beauty:     "美容・サロン",
  fitness:    "フィットネス",
  education:  "教育・スクール",
  medical:    "医療・健康",
  ec:         "EC・小売",
  it:         "IT・Web",
  creative:   "クリエイティブ",
  service:    "サービス業",
  legal:      "士業",
  auto:       "自動車販売",
  realestate: "不動産",
  other:      "その他",
};

const TARGETS = {
  f_teen:   "10〜20代女性",
  f_30:     "30〜40代女性",
  f_senior: "50代以上女性",
  m_teen:   "10〜20代男性",
  m_30:     "30〜40代男性",
  m_senior: "50代以上男性",
  family:   "ファミリー",
  business: "ビジネスパーソン",
};

const TONES = {
  friendly:     "フレンドリー（親しみやすく・絵文字多め）",
  professional: "プロフェッショナル（信頼感・落ち着いた印象）",
  cute:         "かわいい系（ポップ・ガーリー）",
  cool:         "クール（スタイリッシュ・無駄なし）",
  warm:         "あたたかみ（ほっこり・寄り添う）",
  energetic:    "エネルギッシュ（テンション高め）",
};

const KEIGO = {
  desu:   "ですます調（〜しています。）",
  da:     "だよ体（〜してるよ！）",
  taikei: "体言止め（〜を実現。）",
  mixed:  "ミックス（〜してます！）",
};

const PURPOSES = {
  attract:  "集客（新規フォロワー・来店誘導）",
  product:  "商品宣伝（商品・サービスのPR）",
  vlog:     "Vlog（日常・裏側を見せる）",
  tutorial: "ハウツー（使い方・ノウハウ紹介）",
  brand:    "ブランディング（世界観・信頼感の構築）",
  campaign: "キャンペーン（セール・期間限定告知）",
  recruit:  "採用（スタッフ・メンバー募集）",
  other:    "その他",
};

const VIDEO_TYPES = {
  realpeople:   "実写・人物あり",
  realnoperson: "実写・人物なし（商品・空間・料理中心）",
  anime2d:      "アニメ（日本風2D・セル調）",
  anime3d:      "アニメ（3D・Pixar風）",
  illustration: "イラスト風（フラット・ベクター）",
  virtual:      "バーチャル人物（オリジナルキャラクター）",
};

const VIDEO_STYLES = {
  simple:    "シンプル（白背景・テキスト中心）",
  pop:       "ポップ（カラフル・アニメ多め）",
  cinematic: "シネマティック（映画風・ドラマチック）",
  vlog:      "Vlog風（日常感・リアル）",
  minimal:   "ミニマル（余白多め・高級感）",
  energetic: "エネルギッシュ（素早いカット・エフェクト）",
};

const BGM_STYLES = {
  upbeat:    "アップビート",
  calm:      "落ち着き系",
  corporate: "コーポレート",
  cute:      "キュート",
  dramatic:  "ドラマチック",
  none:      "BGMなし",
};

// ProjectListPage.jsx の COLORS 定義と同じ値（単一の定義元）
const COLORS = {
  purple: { label: "パープル", hex: "#7c3aed" },
  pink:   { label: "ピンク",   hex: "#db2777" },
  blue:   { label: "ブルー",   hex: "#2563eb" },
  green:  { label: "グリーン", hex: "#059669" },
  orange: { label: "オレンジ", hex: "#ea580c" },
  red:    { label: "レッド",   hex: "#dc2626" },
  teal:   { label: "ティール", hex: "#0d9488" },
  gray:   { label: "モノクロ", hex: "#374151" },
};

/**
 * プロジェクト設定を日本語のテキストブロックに変換する
 */
export function describeProject(project = {}) {
  const targets = (project.targets || [])
    .map(id => TARGETS[id] || id)
    .filter(Boolean)
    .join("・");

  const lines = [
    `ブランド名：${project.name || "（未設定）"}`,
    `業種：${INDUSTRIES[project.industry] || project.industry || "（未設定）"}`,
    `目的：${PURPOSES[project.purpose] || project.purpose || "（未設定）"}`,
  ];

  if (project.purposeDetail) lines.push(`目的の詳細：${project.purposeDetail}`);
  if (targets)               lines.push(`ターゲット：${targets}`);
  if (project.tone)          lines.push(`トーン：${TONES[project.tone] || project.tone}`);
  if (project.keigo)         lines.push(`文体：${KEIGO[project.keigo] || project.keigo}`);
  if (project.videoType)     lines.push(`映像タイプ：${VIDEO_TYPES[project.videoType] || project.videoType}`);
  if (project.videoStyle)    lines.push(`映像の雰囲気：${VIDEO_STYLES[project.videoStyle] || project.videoStyle}`);
  if (project.bgm)           lines.push(`BGM：${BGM_STYLES[project.bgm] || project.bgm}`);
  if (project.color && COLORS[project.color]) {
    const c = COLORS[project.color];
    lines.push(`ブランドカラー：${c.label}（${c.hex}）`);
  }
  if (project.fixedWords)    lines.push(`必ず使う固定ワード：${project.fixedWords}`);
  if (project.bannedWords)   lines.push(`使ってはいけない禁止ワード：${project.bannedWords}`);

  return lines.join("\n");
}

/**
 * 今日の日付を日本語で返す
 */
export function todayString() {
  const d = new Date();
  const days = ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"];
  return `${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）`;
}

export { INDUSTRIES, TARGETS, TONES, KEIGO, PURPOSES, VIDEO_TYPES, VIDEO_STYLES, BGM_STYLES, COLORS };
