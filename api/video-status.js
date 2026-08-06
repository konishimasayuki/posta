// GET /api/video-status?taskId=xxx&mode=text2video
// 動画生成の進捗を確認する。フロントから数秒おきに叩く
//
// レスポンス:
//   処理中   { status: "processing" }
//   完成     { status: "succeed", videoUrl, duration }
//   失敗     { status: "failed", error }

import { klingFetch } from "./_kling.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { taskId, mode = "text2video" } = req.query || {};

  if (!taskId) {
    return res.status(400).json({ error: "taskId が必要です" });
  }
  if (mode !== "text2video" && mode !== "image2video") {
    return res.status(400).json({ error: "mode が不正です" });
  }

  try {
    const data = await klingFetch(`/v1/videos/${mode}/${taskId}`, { method: "GET" });

    const task = data?.data || {};
    const status = task.task_status; // submitted / processing / succeed / failed

    if (status === "succeed") {
      const video = task.task_result?.videos?.[0];
      if (!video?.url) {
        return res.status(500).json({ status: "failed", error: "動画URLが取得できませんでした" });
      }
      return res.status(200).json({
        status: "succeed",
        videoUrl: video.url,
        duration: video.duration,
      });
    }

    if (status === "failed") {
      return res.status(200).json({
        status: "failed",
        error: task.task_status_msg || "動画生成に失敗しました",
      });
    }

    // submitted / processing
    return res.status(200).json({ status: "processing" });

  } catch (err) {
    console.error("video-status error:", err);
    return res.status(500).json({ status: "failed", error: err.message || "状況確認に失敗しました" });
  }
}
