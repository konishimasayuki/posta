// src/components/CaptionStylePicker.jsx
// テロップの装飾スタイルを、実際の見た目を見ながら選ぶモーダル。
//
// 名前だけの一覧では「どんな書体か」「どんな色か」が分からないため、
// 選択中のテロップの文字をそのまま使って50種すべてを描いて見せる。

import { useEffect, useState } from "react";
import {
  CAPTION_STYLES,
  CAPTION_CATEGORIES,
  buildCaptionLayers,
  ensureCaptionFontLoaded,
  fontLabel,
} from "../lib/captionStyles.js";

/** 一覧に並べる1つ分の見本。描画のしかたは本番のテロップと同じ */
function StyleSample({ style, text, fontSize }) {
  const { wrapper, strokes, fill } = buildCaptionLayers(style, fontSize);
  return (
    <span style={wrapper}>
      {strokes.map((s, i) => (
        <span key={i} style={s} aria-hidden="true">{text}</span>
      ))}
      <span style={fill}>{text}</span>
    </span>
  );
}

const TABS = [["all", "すべて"], ...Object.entries(CAPTION_CATEGORIES)];

export default function CaptionStylePicker({ text = "サンプル", value, onSelect, onClose }) {
  const [tab, setTab] = useState("all");

  // 一覧を開いた時点で6書体すべてを読み込む（見本が既定フォントで出ないように）
  useEffect(() => {
    for (const style of CAPTION_STYLES) ensureCaptionFontLoaded(style);
  }, []);

  // 長い文は先頭だけ使い、文字数に応じて見本のサイズを詰めて枠に収める
  const sample = (text || "サンプル").trim().slice(0, 10) || "サンプル";
  const sampleSize = Math.max(11, Math.min(20, Math.round(20 * 6 / Math.max(6, sample.length))));
  const list = tab === "all" ? CAPTION_STYLES : CAPTION_STYLES.filter(s => s.category === tab);

  const choose = (styleId) => {
    onSelect(styleId);
    onClose();
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth: "520px", margin: "0 auto", background: "#fff",
        borderRadius: "24px 24px 0 0", maxHeight: "86vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* ヘッダー */}
        <div style={{ padding: "16px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <div style={{ fontSize: "16px", fontWeight: 900, color: "#111827" }}>テロップの装飾を選ぶ</div>
            <button onClick={onClose} style={{ width: "30px", height: "30px", borderRadius: "50%", border: "none", background: "#f3f4f6", fontSize: "14px", cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "12px" }}>
            「{sample}」で表示しています・全{CAPTION_STYLES.length}種
          </div>

          {/* カテゴリ */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "12px", scrollbarWidth: "none" }}>
            {TABS.map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: "20px",
                border: `1.5px solid ${tab === key ? "#f97316" : "#e5e7eb"}`,
                background: tab === key ? "#fff7ed" : "#fff",
                color: tab === key ? "#f97316" : "#6b7280",
                fontSize: "12px", fontWeight: 700, cursor: "pointer",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* 一覧 */}
        <div style={{ overflowY: "auto", padding: "0 20px 24px", flex: 1 }}>
          {/* ブランド設定に従う（装飾なし） */}
          {tab === "all" && (
            <button
              onClick={() => choose("")}
              style={{
                width: "100%", marginBottom: "10px", padding: "12px 14px", borderRadius: "12px",
                border: `1.5px solid ${!value ? "#f97316" : "#e5e7eb"}`,
                background: !value ? "#fff7ed" : "#fff",
                textAlign: "left", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 800, color: !value ? "#f97316" : "#111827" }}>
                ブランド設定に従う{!value && " ✓"}
              </div>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                プロジェクトで設定した書体・カラーをそのまま使う
              </div>
            </button>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {list.map(style => {
              const selected = value === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => choose(style.id)}
                  style={{
                    padding: "0", borderRadius: "12px", overflow: "hidden", cursor: "pointer",
                    border: `2px solid ${selected ? "#f97316" : "#e5e7eb"}`,
                    background: "#fff", fontFamily: "inherit", textAlign: "left",
                  }}
                >
                  {/* 見本（動画の上に乗る想定なので背景は暗め） */}
                  <div style={{
                    background: "#565b63", padding: "10px 8px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    height: "64px", overflow: "hidden",
                  }}>
                    <StyleSample style={style} text={sample} fontSize={sampleSize} />
                  </div>

                  <div style={{ padding: "7px 9px 8px", background: selected ? "#fff7ed" : "#fff" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: selected ? "#f97316" : "#111827" }}>
                      {style.label}{selected && " ✓"}
                    </div>
                    <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "1px" }}>
                      {fontLabel(style)}
                    </div>
                    <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "3px", lineHeight: 1.5, minHeight: "30px" }}>
                      {style.use}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
