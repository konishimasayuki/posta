// GET /api/kling-test
// Kling API に接続できるか確認するための診断用エンドポイント
// 動画は生成しないのでクレジットを消費しない（はず）
//
// ブラウザで https://<あなたのURL>/api/kling-test を開くだけで確認できる

export default async function handler(req, res) {
  const apiKey = process.env.KLING_API_KEY;
  const base = process.env.KLING_API_BASE || "https://api-singapore.klingai.com";

  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      step: "env",
      error: "KLING_API_KEY が設定されていません。Vercelの環境変数を確認してください",
    });
  }

  // 存在しないタスクIDを問い合わせて、認証だけ通るかを見る
  // 認証NG → 401など / 認証OK → 「タスクが無い」系のエラー
  const testPath = "/v1/videos/text2video/connection-test-dummy-id";

  try {
    const r = await fetch(`${base}${testPath}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const raw = await r.text();
    let body;
    try { body = JSON.parse(raw); } catch { body = raw.slice(0, 300); }

    const authOk = r.status !== 401 && r.status !== 403;

    return res.status(200).json({
      ok: authOk,
      base,
      httpStatus: r.status,
      keyPrefix: apiKey.slice(0, 12) + "...",
      hint: authOk
        ? "認証は通っています。ベースURLとパスも正しそうです"
        : "認証に失敗しました。APIキーかベースURLを確認してください",
      response: body,
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      step: "fetch",
      base,
      error: err.message,
      hint: "ベースURLが間違っている可能性があります。KLING_API_BASE を設定して切り替えてください",
    });
  }
}
