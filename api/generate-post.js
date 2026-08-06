// POST /api/generate-post
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { project, input, platforms, topic, keywords, images = [] } = req.body;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const results = {};
    for (const platform of platforms) {
      const content = [];

      // 画像がある場合は最大3枚添付
      if (images.length > 0) {
        images.slice(0, 3).forEach(img => {
          content.push({
            type: "image",
            source: { type: "base64", media_type: img.mediaType, data: img.base64 },
          });
        });
      }

      content.push({
        type: "text",
        text: buildPrompt(project, input, platform, topic, keywords, images.length > 0),
      });

      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 1000,
        messages: [{ role: "user", content }],
      });
      results[platform] = message.content.map(b => b.text || "").join("");
    }
    res.status(200).json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "生成に失敗しました" });
  }
}

function buildPrompt(project, input, platform, topic, keywords, hasImages) {
  const platformGuides = {
    tiktok:    "TikTok動画の台本（冒頭フック3秒・本編箇条書き・CTA・ハッシュタグ10個）",
    x:         "X投稿文3パターン（各140文字以内・ハッシュタグ3〜5個）",
    instagram: "Instagramキャプション（冒頭3行・絵文字・ハッシュタグ20〜30個）",
    note:      "noteブログ（タイトル3案・構成・書き出し400文字）",
  };
  const imageNote = hasImages ? "添付の写真の内容を具体的に投稿文に反映してください。" : "";
  return `ブランド：${project.name}、業種：${project.industry}、トーン：${project.tone}
ネタ：${input || "AIが考えて"}、テーマ：${topic}
${keywords ? `キーワード：${keywords}` : ""}
${imageNote}
${platformGuides[platform]}を日本語で作成してください。`;
}
