// src/components/CaptionOverlay.jsx
// 動画の上にテロップを重ねて表示する
// 実際の焼き込み前に、見た目を確認するためのプレビュー

const SIZE_SCALE = {
  sm: 0.042,
  md: 0.058,
  lg: 0.078,
  xl: 0.105,
};

const POSITION_STYLE = {
  top:    { top: "12%",  transform: "translateY(0)" },
  center: { top: "50%",  transform: "translateY(-50%)" },
  bottom: { bottom: "18%" },
};

/**
 * テロップ1つ分の見た目を組み立てる
 * width は動画の実表示幅（px）。文字サイズを比率で決めるために使う
 */
function captionStyle(cap, width, accent) {
  const fontSize = Math.round(width * (SIZE_SCALE[cap.size] || SIZE_SCALE.md));
  const isPunch = cap.role === "punch";

  const base = {
    position: "absolute",
    left: "6%",
    right: "6%",
    textAlign: "center",
    fontSize: `${fontSize}px`,
    fontWeight: 900,
    lineHeight: 1.35,
    letterSpacing: isPunch ? "-0.02em" : "0.01em",
    color: "#fff",
    // 縁取りで背景に負けないようにする
    WebkitTextStroke: `${Math.max(1, fontSize * 0.055)}px rgba(0,0,0,0.55)`,
    paintOrder: "stroke fill",
    textShadow: "0 2px 12px rgba(0,0,0,0.45)",
    pointerEvents: "none",
    ...POSITION_STYLE[cap.position],
  };

  if (cap.emphasis === "box") {
    return {
      ...base,
      WebkitTextStroke: "0",
      textShadow: "none",
      background: accent,
      color: "#fff",
      padding: `${fontSize * 0.28}px ${fontSize * 0.5}px`,
      borderRadius: `${fontSize * 0.32}px`,
      left: "10%",
      right: "10%",
      boxShadow: "0 6px 24px rgba(0,0,0,0.3)",
    };
  }

  if (cap.emphasis === "highlight") {
    return {
      ...base,
      WebkitTextStroke: "0",
      textShadow: "none",
      color: "#111",
      background: `linear-gradient(transparent 55%, ${accent}cc 55%)`,
      display: "inline-block",
      left: "8%",
      right: "8%",
      padding: `0 ${fontSize * 0.15}px`,
    };
  }

  if (cap.emphasis === "underline") {
    return {
      ...base,
      paddingBottom: `${fontSize * 0.18}px`,
      borderBottom: `${Math.max(2, fontSize * 0.08)}px solid ${accent}`,
      left: "12%",
      right: "12%",
    };
  }

  return base;
}

export default function CaptionOverlay({ captions = [], currentTime = 0, width = 200, accent = "#f97316" }) {
  if (!captions.length) return null;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {captions.map(cap => {
        const visible = currentTime >= cap.start && currentTime < cap.end;
        if (!visible) return null;

        // 表示開始からの経過で出現アニメを付ける
        const age = currentTime - cap.start;
        const appear = Math.min(1, age / 0.28);
        const eased = 1 - Math.pow(1 - appear, 3);

        return (
          <div
            key={cap.id}
            style={{
              ...captionStyle(cap, width, accent),
              opacity: eased,
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${(1 - eased) * (cap.role === "punch" ? 14 : 8)}px) scale(${0.94 + eased * 0.06})`,
              }}
            >
              {cap.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
