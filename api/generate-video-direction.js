// POST /api/generate-video-direction
// 「動画にどんな演出をさせるか」の候補を提案する
//
// これまでの動画プロンプトは、ネタの文章（宣伝文句）の中に演出指示が
// 埋もれてしまい、AIが読み飛ばすことがあった。この欄は、演出指示だけを
// 独立させて、確実にKlingへ伝えるためのもの。
//
// 写真がある場合は、写真に写っているものを起点に具体的な演出を提案する
// （車の写真 → 人が乗り込んで走り去る、ケーキの写真 → 誰かが食べる／
//  テラス席に置いてフェードする、など）。ネタの文章も参考にする。

import Anthropic from "@anthropic-ai/sdk";
import { describeProject } from "./_labels.js";

const MODEL = "claude-sonnet-4-6";

/** AIの返答から最初のJSONオブジェクトだけを取り出す */
function extractJson(text) {
  const cleaned = String(text).replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  if (start === -1) return null;

  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) return cleaned.slice(start, i + 1); }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { project = {}, neta = "", images = [] } = req.body || {};

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "APIキーが設定されていません" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const brandInfo = describeProject(project);
  const hasImages = Array.isArray(images) && images.length > 0;

  const instruction = `動画の「演出・動き」の候補を6個提案してください。
これはKling AIという動画生成AIに渡す、具体的なシーン指示の材料になります。

【ブランド設定】
${brandInfo}

【今回のネタ（参考程度）】
${neta || "特になし"}

【条件】
${hasImages
  ? `- 添付された写真に実際に写っているものを起点に、具体的な演出を考えること。
  例：車の写真なら「人が乗り込んで走り去る」「ゆっくり回転して見せる」、
     ケーキの写真なら「誰かがフォークで食べる」「窓際の席に置いて自然光でフェード」
     のように、その被写体だからこそ成立する動きを提案する
- 写真に写っていないもの（存在しない人物や物）を勝手に登場させない`
  : `- 写真は無いので、ネタとブランド設定から一般的に想像できる演出を考える`}
- 1個あたり10〜25文字程度の短い指示文
- 「〜する」「〜させる」のような、動きが明確に伝わる書き方にする
- カメラワークの提案（ゆっくりズームする、回転する、など）も混ぜてよい
- 抽象的な感想（「素敵な雰囲気にする」等）ではなく、具体的な動作にする

【出力形式】
以下のJSONだけを出力。前置き・解説・コードブロックは一切書かないこと。
{"directions":["...","...","...","...","...","..."]}`;

  let rawText = "";

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
      max_tokens: 500,
      messages: [{ role: "user", content }],
    });

    rawText = message.content.map(b => b.text || "").join("").trim();

    const jsonStr = extractJson(rawText);
    if (!jsonStr) {
      return res.status(500).json({ error: "候補を読み取れませんでした", raw: rawText.slice(0, 300) });
    }

    const parsed = JSON.parse(jsonStr);
    const directions = Array.isArray(parsed.directions)
      ? parsed.directions.filter(d => typeof d === "string" && d.trim()).map(d => d.trim().slice(0, 30)).slice(0, 8)
      : [];

    if (directions.length === 0) {
      return res.status(500).json({ error: "候補が空でした", raw: rawText.slice(0, 300) });
    }

    return res.status(200).json({ directions });

  } catch (err) {
    console.error("generate-video-direction error:", err, "\nraw:", rawText.slice(0, 300));
    return res.status(500).json({ error: err.message || "候補の生成に失敗しました" });
  }
}
