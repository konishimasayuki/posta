// GET  /api/projects?userId=xxx  プロジェクト取得
// POST /api/projects             プロジェクト保存

import { redis, getArray } from "./_redis.js";

export default async function handler(req, res) {
  const userId = req.method === "GET" ? req.query.userId : req.body?.userId;
  if (!userId) return res.status(400).json({ error: "userId が必要です" });

  const key = `projects:${userId}`;

  // ── 取得 ──────────────────────────────
  if (req.method === "GET") {
    try {
      const raw = await redis.get(key);
      return res.status(200).json({ projects: getArray(raw) });
    } catch (err) {
      console.error("projects GET error:", err);
      return res.status(500).json({ error: "プロジェクトの取得に失敗しました" });
    }
  }

  // ── 保存 ──────────────────────────────
  if (req.method === "POST") {
    try {
      const { projects } = req.body || {};
      // 文字列で来ても配列で来ても受け付ける
      const list = typeof projects === "string" ? JSON.parse(projects) : projects;

      if (!Array.isArray(list)) {
        return res.status(400).json({ error: "projects は配列である必要があります" });
      }

      await redis.set(key, JSON.stringify(list));
      return res.status(200).json({ ok: true, count: list.length });

    } catch (err) {
      console.error("projects POST error:", err);
      return res.status(500).json({ error: "プロジェクトの保存に失敗しました" });
    }
  }

  return res.status(405).end();
}
