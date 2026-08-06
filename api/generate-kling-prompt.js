// POST /api/generate-kling-prompt
// ブランド設定から動画生成用の英語プロンプトを作る
import Anthropic from "@anthropic-ai/sdk";
import { describeProject } from "./_labels.js";

const MODEL = "claude-sonnet-4-6"; // モデル変更時はここだけ更新

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { project = {}, input, duration = "short" } = req.body || {};

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "APIキーが設定されていません" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const brandInfo = describeProject(project);

  const durationText = { short: "5-10 seconds", medium: "10-15 seconds", long: "15-20 seconds" }[duration] || "5-10 seconds";

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `動画生成AI用の英語プロンプトを1つ作成してください。

【ブランド設定】
${brandInfo}

【今回のネタ】
${input || "ブランド設定に沿った内容"}

【プロンプトの条件】
- 英語で記述する
- 日本市場向けのコンテンツなので、人物が登場する場合は必ず "Japanese" を明記する
- 構成：映像スタイル → 被写体・シーン → 照明・雰囲気 → カメラワーク → 画質指定
- カメラの動きを具体的に指定する（slow pan / orbit / push in / handheld など）
- 縦動画なので "9:16 vertical" を含める
- "${durationText}" 相当の1シーンに収まる内容にする
- 50〜120単語程度

英語プロンプトのみを出力してください。前置きや解説は不要です。`,
      }],
    });

    const prompt = message.content.map(b => b.text || "").join("").trim();
    return res.status(200).json({ prompt });

  } catch (err) {
    console.error("generate-kling-prompt error:", err);
    return res.status(500).json({ error: err.message || "生成に失敗しました" });
  }
}
