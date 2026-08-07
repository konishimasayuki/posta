// api/_creatomate.js
// Creatomate の共通クライアント
// ※ ファイル名の先頭が _ のものは Vercel でAPIエンドポイントにならない

export const CREATOMATE_BASE = "https://api.creatomate.com/v2";

/**
 * Creatomate API を叩く共通関数
 * APIキーをそのまま Bearer トークンとして送る（Klingと同じ方式）
 */
export async function creatomateFetch(path, options = {}) {
  const apiKey = process.env.CREATOMATE_API_KEY;

  if (!apiKey) {
    throw new Error("CREATOMATE_API_KEY が設定されていません");
  }

  const res = await fetch(`${CREATOMATE_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...options.headers,
    },
  });

  const raw = await res.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    const err = new Error(`Creatomateが不正な応答を返しました (HTTP ${res.status}): ${raw.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || `Creatomate APIエラー (HTTP ${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.detail = data;
    throw err;
  }

  return data;
}

export function getTemplateId() {
  const id = process.env.CREATOMATE_TEMPLATE_ID;
  if (!id) throw new Error("CREATOMATE_TEMPLATE_ID が設定されていません");
  return id;
}
