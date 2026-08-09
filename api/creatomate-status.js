// GET /api/creatomate-status?renderId=xxx
// レンダリングの進捗を確認する

import { creatomateFetch } from "./_creatomate.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { renderId } = req.query || {};
  if (!renderId) return res.status(400).json({ error: "renderId が必要です" });

  try {
    const data = await creatomateFetch(`/renders/${renderId}`, { method: "GET" });

    // フォント名の不一致などの警告は、レンダリングを止めずに進行するため
    // 気づかれにくい。完了時にも必ずログへ残す。
    const warnings = Array.isArray(data.warnings) ? data.warnings : [];
    if (warnings.length > 0) {
      console.warn(`[creatomate-status] renderId=${renderId} の警告:`, JSON.stringify(warnings));
    }

    return res.status(200).json({
      status: data.status,      // planned / waiting / transcribing / rendering / succeeded / failed
      url: data.url || null,
      warnings,
      raw: data,
    });

  } catch (err) {
    console.error("creatomate-status error:", err.message, err.detail);
    return res.status(500).json({ error: err.message, detail: err.detail });
  }
}
