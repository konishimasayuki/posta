// POST /api/generate-post
// Claude API を叩いて投稿文を生成する
import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { project, input, platforms, topic, keywords } = req.body;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const results = {};
    for (const platform of platforms) {
      const message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: buildPrompt(project, input, platform, topic, keywords),
        }],
      });
      results[platform] = message.content.map(b => b.text || "").join("");
    }
    res.status(200).json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "生成に失敗しました" });
  }
}

function buildPrompt(project, input, platform, topic, keywords) {
  const platformGuides = {
    tiktok:    "TikTok動画の台本（冒頭フック3秒・本編箇条書き・CTA・ハッシュタグ10個）",
    x:         "X投稿文3パターン（各140文字以内・ハッシュタグ3〜5個）",
    instagram: "Instagramキャプション（冒頭3行・絵文字・ハッシュタグ20〜30個）",
    note:      "noteブログ（タイトル3案・構成・書き出し400文字）",
  };
  return `ブランド：${project.name}、業種：${project.industry}、トーン：${project.tone}
ネタ：${input || "AIが考えて"}、テーマ：${topic}
${keywords ? `キーワード：${keywords}` : ""}
${platformGuides[platform]}を日本語で作成してください。`;
}
