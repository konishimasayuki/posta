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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { project = {}, input = "", duration = "xs" } = req.body || {};

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "APIキーが設定されていません" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const brandInfo = describeProject(project);
  const durationText = DURATION_TEXT[duration] || DURATION_TEXT.xs;

  const instruction = `動画生成AI（Kling）用の英語プロンプトを1つ作成してください。

【ブランド設定（雰囲気・トーンの参考）】
${brandInfo}

【今回のネタ（そのまま投稿文にも使う文章です）】
${input || "ブランド設定に沿った内容"}

【最重要ルール】
上の「今回のネタ」の中に、具体的な映像の演出・動作・シーンの指示が
含まれている場合（例：「〜な動画にして」「人が乗って走り去る」
「〜している様子を見せて」など）、それは絶対に守るべき指示です。
宣伝文句の一部として読み飛ばさず、必ずプロンプトの中心に据えてください。
指示された動作・展開を弱めたり、別の穏やかな絵に置き換えたりしないこと。

具体的な演出指示が無い場合のみ、ブランド設定と文面の雰囲気から
自然なシーンを組み立ててください。

【プロンプトの条件】
- 英語で記述する
- 日本市場向けのコンテンツなので、人物が登場する場合は必ず "Japanese" を明記する
- 構成：映像スタイル → 被写体・具体的な動作の流れ → 照明・雰囲気 → カメラワーク → 画質指定
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
    console.log("[generate-kling-prompt] neta:", input);
    console.log("[generate-kling-prompt] prompt:", prompt);

    return res.status(200).json({ prompt });

  } catch (err) {
    console.error("generate-kling-prompt error:", err);
    return res.status(500).json({ error: err.message || "生成に失敗しました" });
  }
}
