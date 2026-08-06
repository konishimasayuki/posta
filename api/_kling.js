// api/_kling.js
// Kling AI の認証と共通設定
// ※ ファイル名の先頭が _ のものは Vercel でAPIエンドポイントにならない

import jwt from "jsonwebtoken";

export const KLING_BASE = "https://api.klingai.com";

/**
 * Kling API 用のJWTトークンを生成する
 * Access Key を発行者(iss)、Secret Key を署名鍵として使う
 */
export function createKlingToken() {
  const ak = process.env.KLING_ACCESS_KEY;
  const sk = process.env.KLING_SECRET_KEY;

  if (!ak || !sk) {
    throw new Error("KLING_ACCESS_KEY / KLING_SECRET_KEY が設定されていません");
  }

  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      iss: ak,          // 誰からのリクエストか
      exp: now + 1800,  // 30分で失効
      nbf: now - 5,     // 5秒前から有効（時刻ズレ対策）
    },
    sk,
    { header: { alg: "HS256", typ: "JWT" } }
  );
}

/**
 * Kling API を叩く共通関数
 */
export async function klingFetch(path, options = {}) {
  const token = createKlingToken();

  const res = await fetch(`${KLING_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || (data.code !== undefined && data.code !== 0)) {
    const msg = data.message || `Kling APIエラー (HTTP ${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.klingCode = data.code;
    throw err;
  }

  return data;
}

/**
 * プランごとの動画尺の上限（秒）
 * ※ 判定は必ずサーバー側で行うこと
 */
export const PLAN_LIMITS = {
  free:     { maxSeconds: 5,  watermark: true  },
  starter:  { maxSeconds: 5,  watermark: false },
  pro:      { maxSeconds: 10, watermark: false },
  business: { maxSeconds: 10, watermark: false },
};

/**
 * 要求された尺をプラン上限に丸める
 * Kling が受け付けるのは "5" または "10"
 */
export function resolveDuration(requested, plan = "free") {
  const limit = PLAN_LIMITS[plan]?.maxSeconds ?? 5;
  const want = Number(requested) || 5;
  return String(Math.min(want, limit) >= 10 ? 10 : 5);
}
