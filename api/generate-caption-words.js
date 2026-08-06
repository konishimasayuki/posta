// POST /api/generate-caption-words
// 「テロップに入れたい言葉」の候補を提案する
//
// ユーザーが自由入力する前に、たたき台としてAIが候補を出す。
// ここで出す言葉はまだ「役割（hook/punch等）」も「表示順」も決まっていない、
// ただの材料。役割と順番の判断は generate-captions.js が担当する。

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

  const { project = {}, neta = "" } = req.body || {};

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "APIキーが設定されていません" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const brandInfo = describeProject(project);

  const instruction = `動画のテロップに入れる「言葉の候補」を6個提案してください。
まだ表示順や強調の強さは決めなくてよい。使えそうな短い言葉を並べるだけでよい。

【ブランド設定】
${brandInfo}

【今回のネタ】
${neta || "ブランド設定に沿った内容"}

【条件】
- 1個あたり4〜14文字程度の短い言葉やフレーズ
- 価格・数字・キャッチコピー・商品名・行動喚起など、種類はバラバラでよい
- ネタや設定に存在しない情報は作らない
- 絵文字は付けない（テロップにそのまま使うため）

【出力形式】
以下のJSONだけを出力。前置き・解説・コードブロックは一切書かないこと。
{"words":["...","...","...","...","...","..."]}`;

  let rawText = "";

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      messages: [{ role: "user", content: instruction }],
    });

    rawText = message.content.map(b => b.text || "").join("").trim();

    const jsonStr = extractJson(rawText);
    if (!jsonStr) {
      return res.status(500).json({ error: "候補を読み取れませんでした", raw: rawText.slice(0, 300) });
    }

    const parsed = JSON.parse(jsonStr);
    const words = Array.isArray(parsed.words)
      ? parsed.words.filter(w => typeof w === "string" && w.trim()).map(w => w.trim().slice(0, 20)).slice(0, 8)
      : [];

    if (words.length === 0) {
      return res.status(500).json({ error: "候補が空でした", raw: rawText.slice(0, 300) });
    }

    return res.status(200).json({ words });

  } catch (err) {
    console.error("generate-caption-words error:", err, "\nraw:", rawText.slice(0, 300));
    return res.status(500).json({ error: err.message || "候補の生成に失敗しました" });
  }
}
