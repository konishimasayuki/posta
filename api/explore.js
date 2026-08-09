// GET    /api/explore                作品一覧を取得
// POST   /api/explore                作品を公開する
// PUT    /api/explore                いいねの増減
// DELETE /api/explore?id=xxx&userId=  公開を取り消す（本人のみ）
//
// 全ユーザーの公開作品を1つのリストにまとめて保存する。
// 作品数が増えたらページングやRedisのSorted Setへの移行が必要になるが、
// まずは履歴と同じ「配列を丸ごと読み書きする」方式で始める。

import { redis, getArray, truncate } from "./_redis.js";

const KEY = "explore:works";
const MAX_WORKS = 200;        // 全体で保持する上限
const MAX_PER_USER = 20;      // 1ユーザーが公開できる上限

export default async function handler(req, res) {
  // ── 一覧取得 ──────────────────────────────
  if (req.method === "GET") {
    try {
      const works = getArray(await redis.get(KEY));
      return res.status(200).json({ works });
    } catch (err) {
      console.error("explore GET error:", err);
      return res.status(500).json({ error: "作品の取得に失敗しました" });
    }
  }

  // ── 公開する ──────────────────────────────
  if (req.method === "POST") {
    try {
      const { userId, work } = req.body || {};
      if (!userId) return res.status(400).json({ error: "userId が必要です" });
      if (!work?.videoUrl) return res.status(400).json({ error: "動画が無い作品は公開できません" });

      const works = getArray(await redis.get(KEY));

      // 同じ履歴を二重に公開させない
      if (work.sourceId && works.some(w => w.userId === userId && w.sourceId === work.sourceId)) {
        return res.status(409).json({ error: "この作品はすでに公開されています" });
      }

      // 1ユーザーあたりの上限
      const myCount = works.filter(w => w.userId === userId).length;
      if (myCount >= MAX_PER_USER) {
        return res.status(429).json({ error: `公開できるのは${MAX_PER_USER}件までです。古いものを取り消してください` });
      }

      const entry = {
        id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        userId,
        sourceId: work.sourceId || null,        // 元になった履歴のid（重複公開の判定用）
        userName: truncate(work.userName, 40) || "名無し",
        projectName: truncate(work.projectName, 40) || "",
        title: truncate(work.title, 60) || "無題",
        videoUrl: work.videoUrl,
        // ▼ ここがテンプレとして「借りられる」中身。
        //   フォントや色は含めない（利用者自身のブランド設定を使うため）
        videoDirection: truncate(work.videoDirection, 200) || "",
        klingPrompt: truncate(work.klingPrompt, 1000) || "",
        captionTexts: Array.isArray(work.captionTexts)
          ? work.captionTexts.slice(0, 6).map(t => truncate(t, 30))
          : [],
        topic: truncate(work.topic, 200) || "",
        platforms: Array.isArray(work.platforms) ? work.platforms.slice(0, 4) : [],
        duration: work.duration || "xs",
        industry: work.industry || "other",      // カテゴリ絞り込み用
        likes: 0,
        likedBy: [],                             // 誰が押したか（重複いいね防止）
        createdAt: new Date().toISOString(),
      };

      const next = [entry, ...works].slice(0, MAX_WORKS);
      await redis.set(KEY, JSON.stringify(next));

      return res.status(200).json({ ok: true, work: entry });

    } catch (err) {
      console.error("explore POST error:", err);
      return res.status(500).json({ error: "作品の公開に失敗しました" });
    }
  }

  // ── いいね ──────────────────────────────
  if (req.method === "PUT") {
    try {
      const { id, userId } = req.body || {};
      if (!id || !userId) return res.status(400).json({ error: "id と userId が必要です" });

      const works = getArray(await redis.get(KEY));
      const index = works.findIndex(w => w.id === id);
      if (index === -1) return res.status(404).json({ error: "作品が見つかりません" });

      const work = works[index];
      const likedBy = Array.isArray(work.likedBy) ? work.likedBy : [];
      const alreadyLiked = likedBy.includes(userId);

      // 同じユーザーが2回押したら取り消しになる（トグル）
      const nextLikedBy = alreadyLiked
        ? likedBy.filter(u => u !== userId)
        : [...likedBy, userId];

      works[index] = { ...work, likedBy: nextLikedBy, likes: nextLikedBy.length };
      await redis.set(KEY, JSON.stringify(works));

      return res.status(200).json({ ok: true, likes: nextLikedBy.length, liked: !alreadyLiked });

    } catch (err) {
      console.error("explore PUT error:", err);
      return res.status(500).json({ error: "いいねの更新に失敗しました" });
    }
  }

  // ── 公開を取り消す ──────────────────────────────
  if (req.method === "DELETE") {
    try {
      const { id, userId } = req.query || {};
      if (!id || !userId) return res.status(400).json({ error: "id と userId が必要です" });

      const works = getArray(await redis.get(KEY));
      const target = works.find(w => w.id === id);
      if (!target) return res.status(404).json({ error: "作品が見つかりません" });

      // 自分の作品しか消せない
      if (target.userId !== userId) {
        return res.status(403).json({ error: "他のユーザーの作品は取り消せません" });
      }

      const next = works.filter(w => w.id !== id);
      await redis.set(KEY, JSON.stringify(next));

      return res.status(200).json({ ok: true, count: next.length });

    } catch (err) {
      console.error("explore DELETE error:", err);
      return res.status(500).json({ error: "公開の取り消しに失敗しました" });
    }
  }

  return res.status(405).end();
}
