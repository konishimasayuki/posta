// POST /api/history - 履歴保存
// GET  /api/history?userId=xxx - 履歴取得

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

  const key = `history:${userId}`;

  // GET - 履歴取得
  if (req.method === "GET") {
    try {
      const history = await redis.get(key);
      return res.status(200).json({ history: history || [] });
    } catch (err) {
      return res.status(500).json({ error: "取得に失敗しました" });
    }
  }

  // POST - 履歴追加
  if (req.method === "POST") {
    try {
      const { item } = req.body;
      const existing = await redis.get(key);
      const history = existing ? JSON.parse(existing) : [];
      const newHistory = [item, ...history].slice(0, 50); // 最大50件
      await redis.set(key, JSON.stringify(newHistory));
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: "保存に失敗しました" });
    }
  }

  return res.status(405).end();
}
