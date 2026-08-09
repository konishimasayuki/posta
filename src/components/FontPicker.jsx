// src/components/FontPicker.jsx
// ブランド設定のフォントを、実際の見た目を見ながら選ぶモーダル。
//
// フォント名だけ並べても「どんな文字か」が分からないため、
// 各フォントを「素の文字／袋文字／影付き」の3パターンで描いて見せる。
// テロップは動画の上に乗るので、袋文字・影付きの見え方が特に重要になる。

import { useEffect, useState } from "react";
import { FONT_CATALOG, FONT_CATEGORIES, ensureFontLoaded } from "../lib/fontCatalog.js";

/** 見本1つ分。同じ文字を3パターンの装飾で並べる */
function FontSample({ font, text }) {
  const base = {
    fontFamily: `'${font.name}', sans-serif`,
    fontWeight: font.weight,
    fontSize: "22px",
    lineHeight: 1.4,
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", flexWrap: "nowrap" }}>
      {/* 素の文字 */}
      <span style={{ ...base, color: "#111827" }}>{text}</span>

      {/* 袋文字（白フチ）。動画の上に乗せる想定なので背景を暗くして確認する */}
      <span style={{
        ...base,
        color: "#f97316",
        WebkitTextStroke: "3px #ffffff",
        paintOrder: "stroke fill",
      }}>{text}</span>

      {/* 影付き */}
      <span style={{
        ...base,
        color: "#ffffff",
        textShadow: "2px 2px 0 #111827, 3px 3px 6px rgba(0,0,0,0.4)",
      }}>{text}</span>
    </div>
  );
}

const TABS = [["all", "すべて"], ...Object.entries(FONT_CATEGORIES)];

export default function FontPicker({ value, onSelect, onClose, sampleText = "あア亜" }) {
  const [tab, setTab] = useState("all");

  // 一覧を開いた時点で全書体を読み込む（見本が既定フォントで出ないように）
  useEffect(() => {
    for (const font of FONT_CATALOG) ensureFontLoaded(font);
  }, []);

  const list = tab === "all" ? FONT_CATALOG : FONT_CATALOG.filter(f => f.category === tab);

  const choose = (id) => {
    onSelect(id);
    onClose();
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth: "520px", margin: "0 auto", background: "#fff",
        borderRadius: "24px 24px 0 0", maxHeight: "88vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* ヘッダー */}
        <div style={{ padding: "16px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <div style={{ fontSize: "16px", fontWeight: 900, color: "#111827" }}>書体を選ぶ</div>
            <button onClick={onClose} style={{ width: "30px", height: "30px", borderRadius: "50%", border: "none", background: "#f3f4f6", fontSize: "14px", cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "12px" }}>
            素の文字・袋文字・影付きの3パターンで表示しています・全{FONT_CATALOG.length}種
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
          {/* AIお任せ */}
          {tab === "all" && (
            <button
              onClick={() => choose("ai")}
              style={{
                width: "100%", marginBottom: "10px", padding: "14px", borderRadius: "12px",
                border: `2px solid ${value === "ai" ? "#f97316" : "#e5e7eb"}`,
                background: value === "ai" ? "#fff7ed" : "#fff",
                textAlign: "left", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 800, color: value === "ai" ? "#f97316" : "#111827" }}>
                🔤 AIお任せ{value === "ai" && " ✓"}
              </div>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "3px", lineHeight: 1.6 }}>
                ネタの内容とブランドの雰囲気に合わせて、AIが毎回最適な書体を選びます
              </div>
            </button>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {list.map(font => {
              const selected = value === font.id;
              return (
                <button
                  key={font.id}
                  onClick={() => choose(font.id)}
                  style={{
                    padding: "0", borderRadius: "12px", overflow: "hidden", cursor: "pointer",
                    border: `2px solid ${selected ? "#f97316" : "#e5e7eb"}`,
                    background: "#fff", fontFamily: "inherit", textAlign: "left", width: "100%",
                  }}
                >
                  {/* 見本（暗めの背景で、動画に乗せたときの見え方に近づける） */}
                  <div style={{
                    background: "#6b7280", padding: "14px 10px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflowX: "auto",
                  }}>
                    <FontSample font={font} text={sampleText} />
                  </div>

                  <div style={{ padding: "9px 12px 11px", background: selected ? "#fff7ed" : "#fff" }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: selected ? "#f97316" : "#111827" }}>
                      {font.name}{selected && " ✓"}
                    </div>
                    <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "3px", lineHeight: 1.6 }}>
                      {font.mood}
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
