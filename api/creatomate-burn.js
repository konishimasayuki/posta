// POST /api/creatomate-burn
// 本番用：Postaの captions 配列（hook/punch/info/cta の start/end/text）を
// Creatomateのテンプレートに流し込んで、テロップ入りの動画を1本作る。
//
// 対応関係（実測で確認済み）：
//   Postaの start        → Creatomateの time（表示が始まる秒数）
//   Postaの end - start   → Creatomateの duration（表示している長さ）
//
// リクエスト例:
// {
//   "videoUrl": "https://...kling-output.mp4",
//   "videoDuration": 5,
//   "captions": [
//     { "role": "hook",  "text": "燃費が気になる方へ",       "start": 0,   "end": 1.5 },
//     { "role": "punch", "text": "ホンダ フィット ハイブリッド","start": 1.5, "end": 3 },
//     { "role": "info",  "text": "新着入荷しました",          "start": 3,   "end": 4 },
//     { "role": "cta",   "text": "週末のお出かけ前に",        "start": 4,   "end": 5 }
//   ]
// }
//
// captions の role は "hook" "punch" "info" "cta" のいずれかを想定している。
// これは posta-caption-v1 テンプレートのレイヤー名とそのまま対応する。
// role にそれ以外の値が入っていた場合は無視する（テンプレートに無い名前を
// 送ってもCreatomate側で無視されるだけで実害はないが、念のため絞る）。

import { creatomateFetch, getTemplateId } from "./_creatomate.js";

const KNOWN_ROLES = new Set(["hook", "punch", "info", "cta"]);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { videoUrl, videoDuration = 5, captions = [] } = req.body || {};

  if (!videoUrl) {
    return res.status(400).json({ error: "videoUrl が必要です" });
  }
  if (!Array.isArray(captions) || captions.length === 0) {
    return res.status(400).json({ error: "captions が必要です" });
  }

  try {
    const templateId = getTemplateId();

    const modifications = {
      "background.source": videoUrl,
      "duration": Number(videoDuration) || 5,
    };

    // テンプレートには hook/punch/info/cta が1枠ずつしか無い。
    // Postaが設計するテロップは、同じroleが複数（例：infoが2個）になることが
    // 普通にある。1枠に2つ流し込むと後勝ちで静かに消えてしまうため、
    // 各roleは最初の1件だけを使い、残りは skipped として明示的に記録する。
    const usedRoles = new Set();
    const skipped = [];

    for (const cap of captions) {
      if (!cap || typeof cap.text !== "string" || !cap.text.trim()) continue;
      if (!KNOWN_ROLES.has(cap.role)) continue;

      if (usedRoles.has(cap.role)) {
        skipped.push({ role: cap.role, text: cap.text.trim() });
        continue;
      }
      usedRoles.add(cap.role);

      const start = Math.max(0, Number(cap.start) || 0);
      const end = Number(cap.end);
      const dur = Math.max(0.3, (Number.isFinite(end) ? end : start + 2) - start);

      modifications[`${cap.role}.text`] = cap.text.trim();
      modifications[`${cap.role}.time`] = start;
      modifications[`${cap.role}.duration`] = Number(dur.toFixed(2));
    }

    const data = await creatomateFetch("/renders", {
      method: "POST",
      body: JSON.stringify({
        template_id: templateId,
        modifications,
      }),
    });

    const render = Array.isArray(data) ? data[0] : data;

    return res.status(200).json({
      renderId: render?.id,
      status: render?.status,
      url: render?.url || null,
      modifications, // デバッグ用。実際に送った内容をそのまま返す
      skipped,        // 同じroleが重複していて焼き込まれなかったテロップ（テンプレートの枠不足）
    });

  } catch (err) {
    console.error("creatomate-burn error:", err.message, err.detail);
    return res.status(500).json({
      error: err.message || "焼き込みの開始に失敗しました",
      detail: err.detail,
    });
  }
}
