// POST /api/generate-kling-prompt
// ブランド設定から動画生成用の英語プロンプトを作る
import Anthropic from "@anthropic-ai/sdk";
import { describeProject } from "./_labels.js";

const MODEL = "claude-sonnet-4-6"; // モデル変更時はここだけ更新

// duration は GeneratePage の DURATION_OPTIONS（xs/sm/md/lg）と対応させる
const DURATION_TEXT = {
  xs: "5 seconds",
  sm: "10 seconds",
  md: "10-15 seconds",
  lg: "10-15 seconds",
};

// 映像タイプ → Klingが理解できる英語のスタイル指定
// 日本語ラベルを渡すだけではAIが正しく解釈できないことがあるため、
// ここで明示的な英語の描写ルールに変換する
const VIDEO_TYPE_DIRECTIVE = {
  realpeople:
    `Photorealistic live-action footage. Real human(s) may appear naturally in the scene. ` +
    `This is a Japanese-market video, so any person shown must be Japanese in appearance and styling.`,
  realnoperson:
    `Photorealistic live-action footage, but absolutely NO humans, hands, or human silhouettes in the frame. ` +
    `Focus entirely on the product, space, food, or environment itself. If a human would normally appear ` +
    `in this kind of scene, remove them and keep the camera on the subject instead.`,
  anime2d:
    `Japanese 2D anime style, cel-shaded, hand-drawn animation aesthetic similar to a Japanese TV anime or ` +
    `Studio Ghibli-inspired art direction. NOT photorealistic. Flat colors with anime-style shading and linework.`,
  anime3d:
    `3D CGI animation, Pixar/Disney-style rendering with soft global illumination, stylized proportions, ` +
    `NOT photorealistic. Smooth 3D animated character or object motion.`,
  illustration:
    `Flat vector illustration style, non-photorealistic, clean shapes and bold colors, ` +
    `like a modern animated explainer video. NOT live-action, NOT 3D.`,
  virtual:
    `A stylized original virtual character (CGI or 2D), clearly artificial/animated in appearance. ` +
    `Do NOT depict a real or realistic-looking human — the character must look distinctly virtual/illustrated, ` +
    `to avoid resembling any real person.`,
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { project = {}, input = "", duration = "xs" } = req.body || {};

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "APIキーが設定されていません" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const brandInfo = describeProject(project);
  const durationText = DURATION_TEXT[duration] || DURATION_TEXT.xs;

  const videoTypeDirective =
    VIDEO_TYPE_DIRECTIVE[project.videoType] ||
    `No specific visual style was set for this project. Use photorealistic live-action footage as the default, ` +
    `and if any person appears, they must be Japanese in appearance.`;

  const instruction = `動画生成AI（Kling）用の英語プロンプトを1つ作成してください。

【ブランド設定（雰囲気・トーンの参考）】
${brandInfo}

【今回のネタ（そのまま投稿文にも使う文章です）】
${input || "ブランド設定に沿った内容"}

【最重要ルール①：映像タイプは絶対に守ること】
このプロジェクトの映像タイプの指定は以下です。プロンプトの冒頭で、
必ずこの指定に従ったスタイルを明記してください。他のどんな要素より優先します。

${videoTypeDirective}

【最重要ルール②：ネタの中の具体的な演出指示】
「今回のネタ」の中に、具体的な映像の演出・動作・シーンの指示が
含まれている場合（例：「〜な動画にして」「人が乗って走り去る」
「〜している様子を見せて」など）、それも絶対に守るべき指示です。
宣伝文句の一部として読み飛ばさず、必ずプロンプトの中心に据えてください。

【①と②が矛盾する場合】
例：映像タイプが「人物なし」なのに、ネタに「人が乗って走り去る」と書かれている場合。
この場合はネタの具体的な指示（②）を優先してください。今回1回だけの
特別な演出依頼だと判断し、その通りに描写してください。

具体的な演出指示が無い場合は、映像タイプの指定を守りながら、
ブランド設定と文面の雰囲気から自然なシーンを組み立ててください。

【プロンプトの条件】
- 英語で記述する
- 構成：映像タイプ・スタイル → 被写体・具体的な動作の流れ → 照明・雰囲気 → カメラワーク → 画質指定
- 指示された動作がある場合は、時系列（最初に何が起き、次に何が起きるか）を
  明確に書く（例：「歩いてくる → ドアを開ける → 乗り込む → 発進して去っていく」）
- カメラの動きを具体的に指定する（slow pan / orbit / push in / handheld など）
- 縦動画なので "9:16 vertical" を含める
- 動画の長さは "${durationText}" 程度で収まる内容にする
- 60〜130単語程度

英語プロンプトのみを出力してください。前置きや解説は不要です。`;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 350,
      messages: [{ role: "user", content: instruction }],
    });

    const prompt = message.content.map(b => b.text || "").join("").trim();

    // Vercelのログで実際の生成結果を確認できるようにする
    console.log("[generate-kling-prompt] videoType:", project.videoType, "→", videoTypeDirective.slice(0, 60));
    console.log("[generate-kling-prompt] neta:", input);
    console.log("[generate-kling-prompt] prompt:", prompt);

    return res.status(200).json({ prompt });

  } catch (err) {
    console.error("generate-kling-prompt error:", err);
    return res.status(500).json({ error: err.message || "生成に失敗しました" });
  }
}
