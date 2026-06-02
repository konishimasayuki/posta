// POST /api/generate-kling-prompt
// Kling AI用の動画プロンプトを生成する
import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { project, input } = req.body;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `Kling AI動画生成用の英語プロンプトを1つ作成してください。プロンプトのみ出力。
ブランド：${project.name}、業種：${project.industry}
目的：${project.purpose}（${project.purposeDetail || ""}）
ターゲット：${project.targets?.join("・")}
トーン：${project.tone}、動画スタイル：${project.videoStyle}
ネタ：${input || ""}
縦動画9:16`,
      }],
    });
    const prompt = message.content.map(b => b.text || "").join("").trim();
    res.status(200).json({ prompt });
  } catch (err) {
    res.status(500).json({ error: "生成に失敗しました" });
  }
}
