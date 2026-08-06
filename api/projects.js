// POST /api/projects - プロジェクト保存
// GET  /api/projects?userId=xxx - プロジェクト取得

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  const userId = req.method === "GET"
    ? req.query.userId
    : req.body?.userId;

  if (!userId) return res.status(400).json({ error: "userId required" });

  const key = `projects:${userId}`;

  // GET - プロジェクト一覧取得
  if (req.method === "GET") {
    try {
      const projects = await redis.get(key);
      return res.status(200).json({ projects: projects || [] });
    } catch (err) {
      return res.status(500).json({ error: "取得に失敗しました" });
    }
  }

  // POST - プロジェクト保存
  if (req.method === "POST") {
    try {
      const { projects } = req.body;
      await redis.set(key, JSON.stringify(projects));
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: "保存に失敗しました" });
    }
  }

  return res.status(405).end();
}
