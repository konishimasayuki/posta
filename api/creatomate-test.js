// GET /api/creatomate-test
// Creatomate に接続できるか確認するための診断用エンドポイント
// 実際の動画は生成しないので、クレジットは消費しない

import { creatomateFetch, getTemplateId } from "./_creatomate.js";

export default async function handler(req, res) {
  try {
    const templateId = getTemplateId();

    // /renders/{id} で「存在しないレンダーID」を問い合わせる。
    // 認証さえ通っていれば「見つからない」系のエラーが返るはずで、
    // それが確認できれば接続成功とみなす。
    let authOk = false;
    let detail = null;

    try {
      await creatomateFetch("/renders/00000000-0000-0000-0000-000000000000", { method: "GET" });
      authOk = true; // 通常はここに来ないはず
    } catch (err) {
      // 401/403 = キーが間違っている。404など = 認証は通っている
      authOk = err.status !== 401 && err.status !== 403;
      detail = { status: err.status, message: err.message };
    }

    return res.status(200).json({
      ok: authOk,
      templateId,
      keyPrefix: (process.env.CREATOMATE_API_KEY || "").slice(0, 10) + "...",
      hint: authOk
        ? "認証は通っています。template_idも設定されています"
        : "認証に失敗しました。CREATOMATE_API_KEY を確認してください",
      detail,
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
