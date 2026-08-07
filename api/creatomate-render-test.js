// POST /api/creatomate-render-test
// 実験用：konishiさんのテンプレートに、実際の動画とテキストを1つだけ流し込んで
// 本当にレンダリングできるか確認する。
//
// これは「うまくいくかどうかの最初の実験」なので、テロップは1個だけ、
// 装飾（captionStyles）もまだ使わない。まずは素朴に文字が焼き込めるかを見る。
//
// リクエスト例:
// { "videoUrl": "https://...kling-output.mp4", "text": "テスト表示" }

import { creatomateFetch, getTemplateId } from "./_creatomate.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { videoUrl, text = "テスト表示" } = req.body || {};

  if (!videoUrl) {
    return res.status(400).json({ error: "videoUrl が必要です" });
  }

  try {
    const templateId = getTemplateId();

    // まずは背景動画とhookの文字だけを差し込む。
    // 要素名（background / hook）は、konishiさんのテンプレートの
    // レイヤー名とそのまま一致させる必要がある。
    const data = await creatomateFetch("/renders", {
      method: "POST",
      body: JSON.stringify({
        template_id: templateId,
        modifications: {
          "background.source": videoUrl,
          "hook.text": text,
        },
      }),
    });

    // Creatomateは配列で返ってくることがあるので両対応にする
    const render = Array.isArray(data) ? data[0] : data;

    return res.status(200).json({
      renderId: render?.id,
      status: render?.status,      // planned / rendering / succeeded / failed
      url: render?.url || null,    // 完成していれば直接ここに入ることもある
      raw: render,
    });

  } catch (err) {
    console.error("creatomate-render-test error:", err.message, err.detail);
    return res.status(500).json({
      error: err.message || "レンダーの開始に失敗しました",
      detail: err.detail,
    });
  }
}
