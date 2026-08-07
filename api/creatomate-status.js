// GET /api/creatomate-status?renderId=xxx
// レンダリングの進捗を確認する

import { creatomateFetch } from "./_creatomate.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { renderId } = req.query || {};
  if (!renderId) return res.status(400).json({ error: "renderId が必要です" });

  try {
    const data = await creatomateFetch(`/renders/${renderId}`, { method: "GET" });

    return res.status(200).json({
      status: data.status,      // planned / waiting / transcribing / rendering / succeeded / failed
      url: data.url || null,
      raw: data,
    });

  } catch (err) {
    console.error("creatomate-status error:", err.message, err.detail);
    return res.status(500).json({ error: err.message, detail: err.detail });
  }
}
