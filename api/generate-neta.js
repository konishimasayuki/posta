// POST /api/generate-neta
// 今日のネタ候補を生成する
import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { project } = req.body;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const today = new Date();
  const days = ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"];
  const months = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const dateStr = `${months[today.getMonth()]}${today.getDate()}日（${days[today.getDay()]}）`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `今日${dateStr}、ブランド「${project.name}」（${project.industry}）向けの
SNS投稿ネタ候補を4つ提案してください。
目的：${project.purpose}、ターゲット：${project.targets?.join("・")}
動画スタイル：${project.videoStyle}
条件：ブランドに存在しない設定は出さない。今日の曜日・季節を考慮。各60〜100文字。絵文字1つ先頭。
JSONのみ出力：{"tips":["...","...","...","..."]}`,
      }],
    });
    const text = message.content.map(b => b.text || "").join("").trim();
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: "生成に失敗しました" });
  }
}
