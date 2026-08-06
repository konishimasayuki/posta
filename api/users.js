// POST /api/users - ユーザー登録・ログイン
// GET  /api/users?loginId=xxx - ユーザー取得

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {

  // GET - ログイン認証
  if (req.method === "GET") {
    const { loginId, password } = req.query;
    if (!loginId || !password) return res.status(400).json({ error: "loginId and password required" });

    try {
      // デモアカウント
      if (loginId === "posta" && password === "0383") {
        return res.status(200).json({ user: { id: "demo", name: "デモユーザー", role: "demo", plan: "pro" } });
      }
      // 管理者アカウント
      if (loginId === "admin" && password === "admin0383") {
        return res.status(200).json({ user: { id: "admin", name: "管理者", role: "admin", plan: "business" } });
      }

      // 通常ユーザー
      const user = await redis.get(`user:${loginId}`);
      if (!user) return res.status(404).json({ error: "ユーザーが見つかりません" });

      const parsed = typeof user === "string" ? JSON.parse(user) : user;
      if (parsed.password !== password) return res.status(401).json({ error: "パスワードが違います" });

      // パスワードを除いて返す
      const { password: _, ...safeUser } = parsed;
      return res.status(200).json({ user: safeUser });

    } catch (err) {
      return res.status(500).json({ error: "認証に失敗しました" });
    }
  }

  // POST - ユーザー登録（管理者が追加）
  if (req.method === "POST") {
    const { loginId, password, name, email, plan } = req.body;
    if (!loginId || !password) return res.status(400).json({ error: "loginId and password required" });

    try {
      const existing = await redis.get(`user:${loginId}`);
      if (existing) return res.status(409).json({ error: "このIDは既に使われています" });

      const user = {
        id: loginId,
        loginId,
        password,
        name: name || loginId,
        email: email || "",
        plan: plan || "free",
        role: "user",
        createdAt: new Date().toISOString(),
        status: "active",
      };
      await redis.set(`user:${loginId}`, JSON.stringify(user));

      // ユーザー一覧にも追加
      const list = await redis.get("users:list") || [];
      const parsed = typeof list === "string" ? JSON.parse(list) : list;
      await redis.set("users:list", JSON.stringify([...parsed, loginId]));

      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: "登録に失敗しました" });
    }
  }

  return res.status(405).end();
}
