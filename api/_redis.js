// api/_redis.js
// Upstash Redis の共通クライアントとユーティリティ
// ※ ファイル名の先頭が _ のものは Vercel でAPIエンドポイントにならない

import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Upstash は保存したJSONを自動で復元して返すことがある。
 * 文字列で返る場合とオブジェクトで返る場合の両方に耐えるパーサー。
 */
export function safeParse(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return value;      // すでに復元済み
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/** 配列として安全に取り出す */
export function getArray(value) {
  const parsed = safeParse(value, []);
  return Array.isArray(parsed) ? parsed : [];
}

/** オブジェクトとして安全に取り出す */
export function getObject(value) {
  const parsed = safeParse(value, null);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
}

/**
 * 1件あたりの保存サイズを抑えるために長すぎる文字列を切り詰める
 */
export function truncate(str, max = 3000) {
  if (typeof str !== "string") return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}
