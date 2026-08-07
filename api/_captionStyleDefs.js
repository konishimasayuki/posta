// api/_captionStyleDefs.js
// captionStyles.json（konishiさんの50種デザイン設計図）の、
// 焼き込みに必要な部分（fill/stroke/font）だけを複製したサーバー用モジュール。
//
// なぜ複製するか：
//   src/lib/captionStyles.json はブラウザ側（プレビュー描画）で使うファイル。
//   api/ 配下のサーバー関数からは、Vercelのビルド時に確実に含まれる保証がないため
//   （fsで動的に読むとバンドルに含まれず本番で読めない場合がある）、
//   既存の api/_captionStyles.js と同じ方針で、必要なデータだけをJSとして複製する。
//
// ※ captionStyles.json 側でスタイルを追加・変更したら、必ずこちらも直すこと。

export const CAPTION_STYLE_DEFS = {
  "CJ_S001": { font: "gothic", fill: "#ef4b57", stroke: [[0.13, "#ffffff"]] }, // ゴシック_赤
  "CJ_S002": { font: "gothic", fill: "#f7d84b", stroke: [[0.13, "#ffffff"]] }, // ゴシック_黄
  "CJ_S003": { font: "gothic", fill: "#4a9de8", stroke: [[0.13, "#ffffff"]] }, // ゴシック_青
  "CJ_S004": { font: "pop", fill: "#f2545b", stroke: [[0.14, "#ffffff"]] }, // ポップ_赤
  "CJ_S005": { font: "pop", fill: "#ffd426", stroke: [[0.14, "#ffffff"]] }, // ポップ_黄
  "CJ_S006": { font: "pop", fill: "#4d9de0", stroke: [[0.14, "#ffffff"]] }, // ポップ_青
  "CJ_S007": { font: "round", fill: "#ff5a6e", stroke: [[0.15, "#ffffff"]] }, // ふとかわ_赤
  "CJ_S008": { font: "round", fill: "#3ec46d", stroke: [[0.15, "#ffffff"]] }, // ふとかわ_緑
  "CJ_S009": { font: "round", fill: "#4aa3f0", stroke: [[0.15, "#ffffff"]] }, // ふとかわ_青
  "CJ_S010": { font: "round", fill: "#e8505b", stroke: [[0.11, "#ffffff"]] }, // まるゴシ_赤
  "CJ_S011": { font: "round", fill: "#f5c518", stroke: [[0.11, "#ffffff"]] }, // まるゴシ_黄
  "CJ_S012": { font: "round", fill: "#3d9be9", stroke: [[0.11, "#ffffff"]] }, // まるゴシ_青
  "CJ_S013": { font: "gothic", fill: "#121212", stroke: [[0.13, "#ffffff"]] }, // ゴシ強調_黒
  "CJ_S014": { font: "gothic", fill: "#e0323f", stroke: [[0.13, "#ffffff"]] }, // ゴシ強調_赤
  "CJ_S015": { font: "gothic", fill: "#2f6fd0", stroke: [[0.13, "#ffffff"]] }, // ゴシ強調_青
  "CJ_S016": { font: "gothic", fill: {"gradient": "linear-gradient(180deg,#7b8595 0%,#111827 100%)"}, stroke: [[0.13, "#ffffff"]] }, // ゴシグラデ_黒
  "CJ_S017": { font: "gothic", fill: {"gradient": "linear-gradient(180deg,#ffa053 0%,#e01e37 100%)"}, stroke: [[0.13, "#ffffff"]] }, // ゴシグラデ_赤
  "CJ_S018": { font: "gothic", fill: {"gradient": "linear-gradient(180deg,#9ceaf5 0%,#2563eb 100%)"}, stroke: [[0.13, "#ffffff"]] }, // ゴシグラデ_青
  "CJ_S019": { font: "brush", fill: "#161616", stroke: [[0.09, "#c81e1e"], [0.17, "#f2f2f2"]] }, // 怒り1
  "CJ_S020": { font: "mincho", fill: "#e11d48", stroke: [[0.08, "#141414"], [0.16, "#ffffff"]] }, // 怒り2
  "CJ_S021": { font: "gothic", fill: "#121212", stroke: [[0.1, "#d9e021"]] }, // 怒り3
  "CJ_S022": { font: "reggae", fill: {"gradient": "linear-gradient(180deg,#ffe066 0%,#e8a33d 55%,#b76a17 100%)"}, stroke: [[0.1, "#7f1d1d"], [0.18, "#1a0505"]] }, // ツッコミ1
  "CJ_S023": { font: "pop", fill: "#121212", stroke: [[0.1, "#facc15"], [0.18, "#3f2d00"]] }, // ツッコミ2
  "CJ_S024": { font: "pop", fill: "#3b1e8f", stroke: [[0.1, "#facc15"], [0.18, "#7f1d1d"]] }, // ツッコミ3
  "CJ_S025": { font: "mincho", fill: "#4c1d95", stroke: [[0.08, "#141414"], [0.15, "#e5e7eb"]] }, // 恐怖1
  "CJ_S026": { font: "mincho", fill: "#141414", stroke: [[0.09, "#7f1d1d"]] }, // 恐怖2
  "CJ_S027": { font: "mincho", fill: "#7c3aed", stroke: [[0.1, "#141414"]] }, // 恐怖3
  "CJ_S028": { font: "gothic", fill: "#121212", stroke: [] }, // 2色1
  "CJ_S029": { font: "gothic", fill: "#121212", stroke: [] }, // 2色2
  "CJ_S030": { font: "gothic", fill: {"stripe": {"angle": 45, "colors": ["#22d3ee", "#f472b6"], "width": 0.16}}, stroke: [[0.14, "#ffffff"]] }, // ストライプ1
  "CJ_S031": { font: "gothic", fill: {"stripe": {"angle": 45, "colors": ["#818cf8", "#f9a8d4"], "width": 0.16}}, stroke: [[0.14, "#ffffff"]] }, // ストライプ2
  "CJ_S032": { font: "gothic", fill: "#ffffff", stroke: [[0.07, "#f472b6"]] }, // 蛍光_ピンク
  "CJ_S033": { font: "gothic", fill: "#ffffff", stroke: [[0.07, "#38bdf8"]] }, // 蛍光_ブルー
  "CJ_S034": { font: "mincho", fill: "#f4a8c8", stroke: [[0.09, "#ffffff"]] }, // 色っぽい
  "CJ_S035": { font: "mincho", fill: "#ffffff", stroke: [[0.05, "#f0abfc"]] }, // セクシー
  "CJ_S036": { font: "gothic", fill: {"gradient": "linear-gradient(180deg,#ffffff 0%,#7dd3fc 100%)"}, stroke: [[0.1, "#0369a1"]] }, // カッコイイ
  "CJ_S037": { font: "mincho", fill: "#dc2626", stroke: [[0.08, "#141414"], [0.16, "#ffffff"]] }, // 強調_赤
  "CJ_S038": { font: "mincho", fill: "#1d4ed8", stroke: [[0.08, "#141414"], [0.16, "#ffffff"]] }, // 強調_青
  "CJ_S039": { font: "gothic", fill: "#64748b", stroke: [[0.1, "#ffffff"]] }, // 拒否
  "CJ_S040": { font: "mincho", fill: {"gradient": "linear-gradient(180deg,#b7bec9 0%,#4b5563 100%)"}, stroke: [[0.1, "#ffffff"]] }, // しんどい
  "CJ_S041": { font: "mincho", fill: "#dc2626", stroke: [[0.09, "#141414"], [0.17, "#ffffff"]] }, // 目立つ_赤
  "CJ_S042": { font: "mincho", fill: "#16a34a", stroke: [[0.09, "#141414"], [0.17, "#ffffff"]] }, // 目立つ_緑
  "CJ_S043": { font: "mincho", fill: "#0284c7", stroke: [[0.09, "#141414"], [0.17, "#ffffff"]] }, // 目立つ_青
  "CJ_S044": { font: "mincho", fill: {"gradient": "linear-gradient(180deg,#fdf3c0 0%,#e2b33c 38%,#8a5a12 56%,#f6dd8a 100%)"}, stroke: [[0.08, "#4a3208"], [0.15, "#ffffff"]] }, // 金
  "CJ_S045": { font: "mincho", fill: {"gradient": "linear-gradient(180deg,#ffffff 0%,#c7ccd4 38%,#6b7280 56%,#f3f4f6 100%)"}, stroke: [[0.08, "#374151"], [0.15, "#ffffff"]] }, // 銀
  "CJ_S046": { font: "mincho", fill: {"gradient": "linear-gradient(180deg,#ffd9b0 0%,#c2703a 42%,#7c3f16 60%,#f0b183 100%)"}, stroke: [[0.08, "#4a2409"], [0.15, "#ffffff"]] }, // 銅
  "CJ_S047": { font: "gothic", fill: {"gradient": "linear-gradient(180deg,#f7e3a8 0%,#c9992f 100%)"}, stroke: [[0.03, "rgba(90,62,10,0.45)"]] }, // あっさり金
  "CJ_S048": { font: "gothic", fill: {"gradient": "linear-gradient(180deg,#ffffff 0%,#9ca3af 100%)"}, stroke: [[0.03, "rgba(55,65,81,0.45)"]] }, // あっさり銀
  "CJ_S049": { font: "pop", fill: {"gradient": "linear-gradient(180deg,#fff6c9 0%,#f0c04a 45%,#a06a10 62%,#ffe89a 100%)"}, stroke: [[0.09, "#5b3a06"], [0.18, "#ffe89a"]] }, // 派手金
  "CJ_S050": { font: "gothic", fill: {"gradient": "linear-gradient(90deg,#f472b6 0%,#a78bfa 25%,#60a5fa 50%,#34d399 75%,#fbbf24 100%)"}, stroke: [[0.11, "#ffffff"]] }, // レインボー
};
