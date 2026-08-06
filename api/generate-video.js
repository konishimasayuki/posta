// POST /api/generate-video
// 動画生成を開始する（すぐには完成しない。task_id が返る）
//
// リクエスト例:
// {
//   "prompt": "Cinematic orbit around a silver car...",
//   "image": "<base64文字列>",   // 省略可。あれば image2video になる
//   "duration": 5,               // 5 or 10
//   "plan": "pro",
//   "aspectRatio": "9:16"
// }
//
// レスポンス: { taskId, mode }

import { klingFetch, resolveDuration } from "./_kling.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    prompt,
    image,
    negativePrompt = "",
    duration = 5,
    plan = "free",
    aspectRatio = "9:16",
    modelName = "kling-v1",
  } = req.body || {};

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "プロンプトが空です" });
  }

  // 画像があれば image2video、なければ text2video
  const mode = image ? "image2video" : "text2video";
  const path = `/v1/videos/${mode}`;

  const body = {
    model_name: modelName,
    prompt: prompt.trim(),
    negative_prompt: negativePrompt,
    cfg_scale: 0.5,
    mode: "std",
    duration: resolveDuration(duration, plan),
  };

  if (image) {
    // image2video は image に base64（データURLの接頭辞なし）を渡す
    body.image = image;
  } else {
    // text2video のみ縦横比を指定できる
    body.aspect_ratio = aspectRatio;
  }

  try {
    const data = await klingFetch(path, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const taskId = data?.data?.task_id;
    if (!taskId) {
      return res.status(500).json({ error: "task_id が取得できませんでした" });
    }

    return res.status(200).json({
      taskId,
      mode,
      status: data?.data?.task_status || "submitted",
    });

  } catch (err) {
    console.error("generate-video error:", err);
    return res.status(500).json({ error: err.message || "動画生成の開始に失敗しました" });
  }
}
