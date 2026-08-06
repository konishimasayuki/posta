// POST /api/generate-neta
// ブランド設定（＋任意で写真）から今日のネタ候補を生成する
import Anthropic from "@anthropic-ai/sdk";
import { describeProject, todayString } from "./_labels.js";

const MODEL = "claude-sonnet-4-6"; // モデル変更時はここだけ更新

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { project = {}, images = [] } = req.body || {};

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "APIキーが設定されていません" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const brandInfo = describeProject(project);
  const dateStr = todayString();

  const hasImages = images.length > 0;

  const instruction = `あなたはSNS・動画コンテンツの専門プランナーです。
以下のブランド設定をもとに、今日${dateStr}のSNS投稿ネタ候補を4つ提案してください。

【ブランド設定】
${brandInfo}

【条件】
- 上記の業種・目的に完全に沿ったネタだけを出す
- ブランド設定に存在しない商品・サービスを勝手に作らない
- 今日の曜日・季節・日付を考慮して毎日違うネタにする
- 「何を見せるか」「誰に向けて」「なぜ今日なのか」を含める
- 各ネタは60〜100文字
- 先頭に絵文字を1つつける
${hasImages ? "- 添付された写真に実際に写っているものを必ず活かす。写真に無いものは書かない" : ""}

JSONのみ出力（前後の説明・コードブロック不要）：
{"tips":["...","...","...","..."]}`;

  try {
    const content = [];

    if (hasImages) {
      images.slice(0, 3).forEach(img => {
        content.push({
          type: "image",
          source: { type: "base64", media_type: img.mediaType, data: img.base64 },
        });
      });
    }
    content.push({ type: "text", text: instruction });

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      messages: [{ role: "user", content }],
    });

    const text = message.content.map(b => b.text || "").join("").trim();
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (!parsed.tips || !Array.isArray(parsed.tips)) {
      return res.status(500).json({ error: "生成結果の形式が不正です" });
    }
    return res.status(200).json({ tips: parsed.tips });

  } catch (err) {
    console.error("generate-neta error:", err);
    return res.status(500).json({ error: err.message || "生成に失敗しました" });
  }
}
