// POST /api/creatomate-render-test
// 実験用：konishiさんのテンプレートに、実際の動画とテキストを1つだけ流し込んで
// 本当にレンダリングできるか確認する。
//
// これは「うまくいくかどうかの最初の実験」なので、テロップは1個だけ、
// 装飾（captionStyles）もまだ使わない。まずは素朴に文字が焼き込めるかを見る。
//
// リクエスト例:
// { "videoUrl": "https://...kling-output.mp4", "text": "テスト表示", "duration": 5 }
//
// duration を渡さない場合、テンプレート自体が持つ長さ（48秒）が
// そのまま使われてしまい、背景動画が終わったあとも真っ黒な画面が
// 続いてしまう。必ずKling動画の実際の長さを指定すること。

import { creatomateFetch, getTemplateId } from "./_creatomate.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    videoUrl,
    text = "テスト表示",
    duration = 5,
    hookFillColor,    // captionStyles.json の fill に相当
    hookStrokeColor,  // captionStyles.json の stroke[1] に相当
  } = req.body || {};

  if (!videoUrl) {
    return res.status(400).json({ error: "videoUrl が必要です" });
  }

  try {
    const templateId = getTemplateId();

    // 背景動画・hookの文字・動画全体の長さを差し込む。
    // 要素名（background / hook）は、konishiさんのテンプレートの
    // レイヤー名とそのまま一致させる必要がある。
    // duration はテンプレート全体（トップレベル）のプロパティなので、
    // 要素名を付けずそのまま指定する。
    const modifications = {
      "background.source": videoUrl,
      "hook.text": text,
      "duration": Number(duration) || 5,
    };

    // 色は指定があるときだけ上書きする（無ければテンプレートの既定色のまま）
    if (hookFillColor)   modifications["hook.fill_color"] = hookFillColor;
    if (hookStrokeColor) modifications["hook.stroke_color"] = hookStrokeColor;

    const data = await creatomateFetch("/renders", {
      method: "POST",
      body: JSON.stringify({
        template_id: templateId,
        modifications,
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
