// GET    /api/history?userId=xxx          履歴取得
// POST   /api/history                     履歴追加
// DELETE /api/history?userId=xxx&id=yyy   履歴削除

import { redis, getArray, truncate } from "./_redis.js";

const MAX_ITEMS = 50;          // 1ユーザーあたりの保存件数
const MAX_TEXT_LENGTH = 3000;  // 投稿文1件あたりの上限文字数

export default async function handler(req, res) {
  const userId =
    req.method === "GET" || req.method === "DELETE"
      ? req.query.userId
      : req.body?.userId;

  if (!userId) return res.status(400).json({ error: "userId が必要です" });

  const key = `history:${userId}`;

  // ── 取得 ──────────────────────────────
  if (req.method === "GET") {
    try {
      const raw = await redis.get(key);
      return res.status(200).json({ history: getArray(raw) });
    } catch (err) {
      console.error("history GET error:", err);
      return res.status(500).json({ error: "履歴の取得に失敗しました" });
    }
  }

  // ── 追加 ──────────────────────────────
  if (req.method === "POST") {
    try {
      const { item } = req.body || {};
      if (!item) return res.status(400).json({ error: "item が必要です" });

      // 保存サイズを抑えるため長文は切り詰める
      const cleaned = {
        ...item,
        postTexts: item.postTexts
          ? Object.fromEntries(
              Object.entries(item.postTexts).map(([k, v]) => [k, truncate(v, MAX_TEXT_LENGTH)])
            )
          : {},
        klingPrompt: truncate(item.klingPrompt, 1000),
        topic: truncate(item.topic, 200),
      };

      const history = getArray(await redis.get(key));
      const next = [cleaned, ...history].slice(0, MAX_ITEMS);

      await redis.set(key, JSON.stringify(next));
      return res.status(200).json({ ok: true, count: next.length });

    } catch (err) {
      console.error("history POST error:", err);
      return res.status(500).json({ error: "履歴の保存に失敗しました" });
    }
  }

  // ── 更新 ──────────────────────────────
  // 履歴からテロップを作り直したときなど、既存の1件を書き換える。
  // idで対象を特定し、渡されたフィールドだけを上書きする（差分更新）。
  if (req.method === "PUT") {
    try {
      const { id, patch } = req.body || {};
      if (!id) return res.status(400).json({ error: "id が必要です" });
      if (!patch || typeof patch !== "object") {
        return res.status(400).json({ error: "patch が必要です" });
      }

      const history = getArray(await redis.get(key));
      const index = history.findIndex(h => String(h.id) === String(id));
      if (index === -1) {
        return res.status(404).json({ error: "対象の履歴が見つかりません" });
      }

      // 保存サイズを抑えるため、長文は既存の追加処理と同じ基準で切り詰める
      const cleanedPatch = { ...patch };
      if (cleanedPatch.postTexts) {
        cleanedPatch.postTexts = Object.fromEntries(
          Object.entries(cleanedPatch.postTexts).map(([k, v]) => [k, truncate(v, MAX_TEXT_LENGTH)])
        );
      }
      if (cleanedPatch.klingPrompt) cleanedPatch.klingPrompt = truncate(cleanedPatch.klingPrompt, 1000);
      if (cleanedPatch.topic) cleanedPatch.topic = truncate(cleanedPatch.topic, 200);

      history[index] = { ...history[index], ...cleanedPatch };
      await redis.set(key, JSON.stringify(history));

      return res.status(200).json({ ok: true, item: history[index] });

    } catch (err) {
      console.error("history PUT error:", err);
      return res.status(500).json({ error: "履歴の更新に失敗しました" });
    }
  }

  // ── 削除 ──────────────────────────────
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "id が必要です" });

      const history = getArray(await redis.get(key));
      const next = history.filter(h => String(h.id) !== String(id));

      await redis.set(key, JSON.stringify(next));
      return res.status(200).json({ ok: true, count: next.length });

    } catch (err) {
      console.error("history DELETE error:", err);
      return res.status(500).json({ error: "削除に失敗しました" });
    }
  }

  return res.status(405).end();
}
