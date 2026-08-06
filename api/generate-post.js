// POST /api/generate-post
// ブランド設定（＋任意で写真）から各SNSの投稿文を生成する
import Anthropic from "@anthropic-ai/sdk";
import { describeProject } from "./_labels.js";

const MODEL = "claude-sonnet-4-6"; // モデル変更時はここだけ更新

const PLATFORM_GUIDES = {
  tiktok:    "TikTok動画の台本。構成は【冒頭フック（3秒で興味を引く一言）】【本編（箇条書きで具体的に）】【CTA（行動を促す一言）】、最後にハッシュタグ10個。",
  x:         "X（旧Twitter）の投稿文を3パターン。各140文字以内。それぞれ切り口を変える。ハッシュタグは各3〜5個。",
  instagram: "Instagramのキャプション。冒頭3行で興味を引く。適度に絵文字を使う。最後にハッシュタグ20〜30個。",
  note:      "noteのブログ記事。タイトル案3つ、記事の構成（見出しリスト）、書き出し本文400文字程度。",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { project = {}, input, platforms = [], topic, keywords, images = [] } = req.body || {};

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "APIキーが設定されていません" });
  }
  if (platforms.length === 0) {
    return res.status(400).json({ error: "投稿先が選択されていません" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const brandInfo = describeProject(project);
  const hasImages = images.length > 0;

  // 画像ブロックは使い回す
  const imageBlocks = hasImages
    ? images.slice(0, 3).map(img => ({
        type: "image",
        source: { type: "base64", media_type: img.mediaType, data: img.base64 },
      }))
    : [];

  try {
    const results = {};

    for (const platform of platforms) {
      const guide = PLATFORM_GUIDES[platform];
      if (!guide) continue;

      const instruction = `あなたはSNSマーケティングの専門ライターです。
以下のブランド設定に沿って、日本語で投稿文を作成してください。

【ブランド設定】
${brandInfo}

【今回のネタ】
${input || topic || "ブランド設定に沿ってAIが提案してください"}
${keywords ? `【含めたいキーワード】\n${keywords}` : ""}
${hasImages ? "\n【写真について】\n添付された写真に実際に写っているものを具体的に投稿文に反映してください。写真に写っていないものは書かないでください。" : ""}

【作成する内容】
${guide}

【注意】
- ブランド設定のトーン・文体を厳守する
- 固定ワードがあれば必ず入れる／禁止ワードは絶対に使わない
- 業種に合わない表現（例：自動車販売なのに料理の話）は絶対に書かない
- 投稿文のみを出力し、前置きや解説は書かない`;

      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 1200,
        messages: [{
          role: "user",
          content: [...imageBlocks, { type: "text", text: instruction }],
        }],
      });

      results[platform] = message.content.map(b => b.text || "").join("").trim();
    }

    return res.status(200).json({ results });

  } catch (err) {
    console.error("generate-post error:", err);
    return res.status(500).json({ error: err.message || "生成に失敗しました" });
  }
}
