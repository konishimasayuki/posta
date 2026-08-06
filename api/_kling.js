// api/_kling.js
// Kling AI の認証と共通設定
// ※ ファイル名の先頭が _ のものは Vercel でAPIエンドポイントにならない

// リージョンによってベースURLが違う。合わない場合は環境変数 KLING_API_BASE で上書きする
export const KLING_BASE = process.env.KLING_API_BASE || "https://api-singapore.klingai.com";

/**
 * Kling API を叩く共通関数
 * APIキーをそのまま Bearer トークンとして送る
 */
export async function klingFetch(path, options = {}) {
  const apiKey = process.env.KLING_API_KEY;

  if (!apiKey) {
    throw new Error("KLING_API_KEY が設定されていません");
  }

  const res = await fetch(`${KLING_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...options.headers,
    },
  });

  const raw = await res.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    // JSONで返ってこない場合は本文をそのままエラーに含める
    const err = new Error(`Kling APIが不正な応答を返しました (HTTP ${res.status}): ${raw.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }

  if (!res.ok || (data.code !== undefined && data.code !== 0)) {
    const err = new Error(data.message || `Kling APIエラー (HTTP ${res.status})`);
    err.status = res.status;
    err.klingCode = data.code;
    err.detail = data;
    throw err;
  }

  return data;
}

/**
 * プランごとの動画尺の上限（秒）
 * ※ 判定は必ずサーバー側で行うこと（フロントの値を信用しない）
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
  const capped = Math.min(want, limit);
  return capped >= 10 ? "10" : "5";
}
