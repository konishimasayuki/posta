// POST /api/generate-captions
// ネタとブランド設定から「テロップの設計図」を作る
//
// 返すもの: いつ・何を・どのくらいの強さで出すか
// 実際の描画はフロント側が担当する

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

const ROLES = ["hook", "punch", "info", "cta"];

/**
 * ユーザーが指定した言葉を、AIの判断を介さずに機械的に配置する保険。
 * 「500円と表示させ続けたい」のような指定を、AIが書き換えたり
 * 落としたりした場合でも確実に反映するための最終手段。
 */
function buildFallbackFromWords(words, duration) {
  const n = words.length;
  if (n === 0) return [];

  const per = duration / n;
  const hasDigit = w => /[0-9０-９]/.test(w);
  const punchIndex = words.findIndex(hasDigit); // 数字を含む言葉を主役にする

  return words.map((text, i) => {
    let role = "info";
    if (i === punchIndex) role = "punch";
    else if (i === 0 && punchIndex !== 0) role = "hook";
    else if (i === n - 1 && punchIndex !== n - 1) role = "cta";

    const isPunch = role === "punch";
    return {
      id: `cap_${i}`,
      text: text.slice(0, 20),
      start: Number((i * per).toFixed(2)),
      end: Number(((i + 1) * per).toFixed(2)),
      role,
      position: isPunch ? "center" : "bottom",
      size: isPunch ? "xl" : "md",
      emphasis: isPunch ? "highlight" : "none",
    };
  });
}

/** 生成結果に、指定した言葉がすべて（過不足なく）含まれているか確認する */
function containsAllWords(captions, words) {
  const texts = captions.map(c => c.text.trim());
  return words.every(w => texts.includes(w.trim()));
}
const POSITIONS = ["top", "center", "bottom"];
const SIZES = ["sm", "md", "lg", "xl"];
const EMPHASIS = ["none", "box", "underline", "highlight"];

/** AIの出力を安全な値に丸める */
function sanitize(captions, duration) {
  if (!Array.isArray(captions)) return [];

  const MIN_SHOW = 0.8; // 最低表示秒数

  const cleaned = captions
    .filter(c => c && typeof c.text === "string" && c.text.trim())
    .slice(0, 6)
    .map(c => {
      // 開始は「尺 - 最低表示秒」を超えないようにする
      const maxStart = Math.max(0, duration - MIN_SHOW);
      const start = Math.max(0, Math.min(Number(c.start) || 0, maxStart));

      const rawEnd = Number(c.end) || start + 2;
      // 終了は必ず尺の中に収める
      const end = Math.min(duration, Math.max(start + MIN_SHOW, rawEnd));

      return {
        text: c.text.trim().slice(0, 40),
        start,
        end,
        role:     ROLES.includes(c.role) ? c.role : "info",
        position: POSITIONS.includes(c.position) ? c.position : "bottom",
        size:     SIZES.includes(c.size) ? c.size : "md",
        emphasis: EMPHASIS.includes(c.emphasis) ? c.emphasis : "none",
      };
    })
    .sort((a, b) => a.start - b.start);

  // 前後が重なっていたらずらす（同時に2つ出ると読めない）
  const result = [];
  let prevEnd = 0;

  for (const c of cleaned) {
    const start = Math.max(c.start, prevEnd);
    if (start >= duration) break;                    // もう入らない
    const end = Math.min(duration, Math.max(start + MIN_SHOW, c.end));
    if (end - start < 0.4) continue;                 // 短すぎるものは捨てる

    result.push({
      ...c,
      id: `cap_${result.length}`,
      start: Number(start.toFixed(2)),
      end: Number(end.toFixed(2)),
    });
    prevEnd = end;
  }

  return result;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { project = {}, neta = "", duration = 5, words = [] } = req.body || {};

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "APIキーが設定されていません" });
  }

  const seconds = Number(duration) || 5;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const brandInfo = describeProject(project);

  // ユーザーがテロップの言葉を直接指定した場合は、その言葉「だけ」を材料にする。
  // AIが新しい文言を作り出すことはせず、役割の割り当てとタイミングだけを判断する。
  const userWords = Array.isArray(words)
    ? words.filter(w => typeof w === "string" && w.trim()).map(w => w.trim().slice(0, 20))
    : [];
  const hasUserWords = userWords.length > 0;

  const instruction = hasUserWords
    ? `あなたは縦型ショート動画のテロップ設計の専門家です。
${seconds}秒の動画に、以下の「指定された言葉」だけを使ってテロップを設計してください。

【ブランド設定（雰囲気の参考程度に）】
${brandInfo}

【指定された言葉（このリストの言葉だけを使うこと。書き換え・言い換え禁止）】
${userWords.map((w, i) => (i + 1) + ". " + w).join(String.fromCharCode(10))}

【設計の考え方】
- 指定された言葉を、意味が伝わりやすい順番に並べ替えてよい
- 言葉の中で一番強く伝えたいもの（価格・数字・キャッチコピーなど）を punch として最も強く見せる
- 最初に来る言葉は自然と hook の役割になりやすい
- 最後に行動を促すような言葉（「DMで」「今すぐ」等）があれば cta にする
- それ以外は info として扱う
- 新しい言葉を作らない。指定された${userWords.length}個の言葉をすべて使うこと
- 1個の言葉を複数回に分けて表示しない

【文字数の目安（新しく書かない前提なのであくまで参考）】
- 短い言葉ほど強く（xl・punch向き）、長い言葉は info や小さめサイズが読みやすい

【タイミング】
- 動画は${seconds}秒。start/end は 0 〜 ${seconds} の範囲の秒数
- テロップ同士は重ねない（前のendの後に次のstartが来る）
- 各テロップは最低1秒は表示する
- 指定された言葉の数（${userWords.length}個）ぶんだけ出力する

【各項目の意味】
- role: hook（引き）/ punch（主役）/ info（補足）/ cta（行動喚起）
- position: top / center / bottom（punchはcenter推奨）
- size: sm / md / lg / xl（punchはxl推奨）
- emphasis: none / box（枠）/ underline（下線）/ highlight（マーカー）

【出力形式】
以下のJSONだけを出力。前置き・解説・コードブロックは一切書かないこと。
{"captions":[{"text":"...","start":0,"end":1.5,"role":"hook","position":"bottom","size":"md","emphasis":"none"}]}`
    : `あなたは縦型ショート動画のテロップ設計の専門家です。
${seconds}秒の動画に載せるテロップを設計してください。

【ブランド設定】
${brandInfo}

【今回のネタ】
${neta || "ブランド設定に沿った内容"}

【設計の考え方】
- 一番伝えたい情報を1つだけ選び、それを punch として最も強く見せる
- 冒頭1〜2秒は hook で視聴者を引き止める（短く・問いかけや驚き）
- 最後は cta で行動を促す
- info は補足。無くてもよい
- ネタの内容によって構成を変えること。価格訴求なら価格を punch に、
  人物紹介なら人柄が伝わる言葉を punch にする

【文字数のルール】
- hook: 8〜14文字
- punch: 6〜12文字（数字や短い言葉ほど強い）
- info: 8〜16文字
- cta: 8〜14文字
- 1画面に長文を出さない。読み切れない

【タイミング】
- 動画は${seconds}秒。start/end は 0 〜 ${seconds} の範囲の秒数
- テロップ同士は重ねない（前のendの後に次のstartが来る）
- 各テロップは最低1秒は表示する
- 全部で3〜5個

【各項目の意味】
- role: hook（引き）/ punch（主役）/ info（補足）/ cta（行動喚起）
- position: top / center / bottom（punchはcenter推奨）
- size: sm / md / lg / xl（punchはxl推奨）
- emphasis: none / box（枠）/ underline（下線）/ highlight（マーカー）

【出力形式】
以下のJSONだけを出力。前置き・解説・コードブロックは一切書かないこと。
{"captions":[{"text":"...","start":0,"end":1.5,"role":"hook","position":"bottom","size":"md","emphasis":"none"}]}`;

  let rawText = "";

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 900,
      messages: [{ role: "user", content: instruction }],
    });

    rawText = message.content.map(b => b.text || "").join("").trim();

    const jsonStr = extractJson(rawText);
    if (!jsonStr) {
      return res.status(500).json({ error: "設計結果を読み取れませんでした", raw: rawText.slice(0, 300) });
    }

    const parsed = JSON.parse(jsonStr);
    let captions = sanitize(parsed.captions, seconds);

    if (captions.length === 0) {
      if (hasUserWords) {
        // AIが空を返した場合でも、指定された言葉だけは確実に出す
        captions = buildFallbackFromWords(userWords, seconds);
      } else {
        return res.status(500).json({ error: "テロップが空でした", raw: rawText.slice(0, 300) });
      }
    } else if (hasUserWords && !containsAllWords(captions, userWords)) {
      // AIが言葉を書き換えた・落とした場合は、指定通りの機械的な配置に差し替える
      console.warn("指定した言葉が反映されなかったためフォールバックします:", userWords, captions.map(c => c.text));
      captions = buildFallbackFromWords(userWords, seconds);
    }

    return res.status(200).json({ captions, usedFallback: hasUserWords && captions.every(c => c.id?.startsWith("cap_")) });

  } catch (err) {
    console.error("generate-captions error:", err, "\nraw:", rawText.slice(0, 300));
    return res.status(500).json({ error: err.message || "テロップの設計に失敗しました" });
  }
}
