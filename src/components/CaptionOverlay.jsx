// src/components/CaptionOverlay.jsx
// 動画の上にテロップを重ねて表示する（焼き込み前のプレビュー）

import { useEffect } from "react";
import { resolveFont, ensureFontLoaded } from "../lib/fonts.js";
import {
  isKnownStyleId,
  getCaptionStyle,
  buildCaptionLayers,
  ensureCaptionFontLoaded,
} from "../lib/captionStyles.js";

const SIZE_SCALE = {
  sm: 0.042,
  md: 0.058,
  lg: 0.078,
  xl: 0.105,
};

const POSITION_STYLE = {
  top:    { top: "11%" },
  center: { top: "50%" },
  bottom: { bottom: "17%" },
};

// ── イージング ──────────────────────────
const clamp01 = v => Math.max(0, Math.min(1, v));

// 行き過ぎてから戻る（跳ねる感じ）
function easeOutBack(t, overshoot = 1.5) {
  const c3 = overshoot + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
}

// なめらかに減速
function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}

/**
 * 役割ごとに入り方を変える
 * 戻り値: { opacity, transform, filter }
 */
function enterMotion(role, p) {
  switch (role) {
    // 主役: 少し大きめから吸い込まれるように決まる
    case "punch": {
      const e = easeOutBack(p, 1.8);
      const scale = 1.18 - 0.18 * e;
      return {
        opacity: clamp01(p * 2.2),
        transform: `scale(${scale.toFixed(3)})`,
        filter: p < 0.5 ? `blur(${(1 - p * 2) * 3}px)` : "none",
      };
    }
    // 引き: 下からすっと上がる
    case "hook": {
      const e = easeOutQuint(p);
      return {
        opacity: clamp01(p * 1.8),
        transform: `translateY(${((1 - e) * 18).toFixed(2)}px)`,
        filter: "none",
      };
    }
    // 行動喚起: わずかに沈んでから出る
    case "cta": {
      const e = easeOutBack(p, 1.1);
      const scale = 0.9 + 0.1 * e;
      return {
        opacity: clamp01(p * 2),
        transform: `scale(${scale.toFixed(3)})`,
        filter: "none",
      };
    }
    // 補足: 静かにフェード
    default: {
      const e = easeOutQuint(p);
      return {
        opacity: clamp01(p * 1.6),
        transform: `translateY(${((1 - e) * 8).toFixed(2)}px)`,
        filter: "none",
      };
    }
  }
}

/** テロップ1つ分の見た目 */
function captionStyle(cap, width, accent, font) {
  const fontSize = Math.round(width * (SIZE_SCALE[cap.size] || SIZE_SCALE.md));
  const isPunch = cap.role === "punch";

  const base = {
    position: "absolute",
    left: "6%",
    right: "6%",
    textAlign: "center",
    fontFamily: font.family,
    fontSize: `${fontSize}px`,
    fontWeight: font.weight,
    lineHeight: 1.32,
    letterSpacing: isPunch ? "-0.01em" : font.tracking,
    color: "#fff",
    WebkitTextStroke: `${Math.max(1, fontSize * 0.05)}px rgba(0,0,0,0.5)`,
    paintOrder: "stroke fill",
    textShadow: "0 2px 14px rgba(0,0,0,0.4)",
    pointerEvents: "none",
    willChange: "transform, opacity",
    ...POSITION_STYLE[cap.position],
  };

  if (cap.emphasis === "box") {
    return {
      ...base,
      WebkitTextStroke: "0",
      textShadow: "none",
      background: accent,
      padding: `${fontSize * 0.3}px ${fontSize * 0.55}px`,
      borderRadius: `${fontSize * 0.35}px`,
      left: "9%",
      right: "9%",
      boxShadow: `0 8px 28px ${accent}55`,
    };
  }

  if (cap.emphasis === "highlight") {
    return {
      ...base,
      WebkitTextStroke: "0",
      textShadow: "none",
      color: "#111",
      background: `linear-gradient(transparent 52%, ${accent} 52%)`,
      left: "7%",
      right: "7%",
      padding: `0 ${fontSize * 0.2}px`,
    };
  }

  if (cap.emphasis === "underline") {
    return {
      ...base,
      paddingBottom: `${fontSize * 0.2}px`,
      borderBottom: `${Math.max(2, fontSize * 0.075)}px solid ${accent}`,
      left: "11%",
      right: "11%",
    };
  }

  return base;
}

/**
 * スタイル指定（styleId）があるテロップの位置決め。
 * 見た目そのものは captionStyles.js が組み立てるので、ここは置き場所だけを決める。
 */
function styledContainer(cap) {
  return {
    position: "absolute",
    left: "6%",
    right: "6%",
    pointerEvents: "none",
    willChange: "transform, opacity",
    ...POSITION_STYLE[cap.position],
  };
}

export default function CaptionOverlay({
  captions = [],
  currentTime = 0,
  width = 200,
  accent = "#f97316",
  project = {},
}) {
  const font = resolveFont(project);

  useEffect(() => { ensureFontLoaded(font); }, [font]);

  // スタイル指定があるテロップは、そのスタイルが使う書体を先に読み込んでおく
  const styleIds = captions.map(c => c.styleId).filter(isKnownStyleId).join(",");
  useEffect(() => {
    if (!styleIds) return;
    for (const id of styleIds.split(",")) {
      ensureCaptionFontLoaded(getCaptionStyle(id));
    }
  }, [styleIds]);

  if (!captions.length) return null;

  const ENTER = 0.34; // 出現にかける秒数
  const EXIT  = 0.22; // 消えるのにかける秒数

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {captions.map(cap => {
        if (currentTime < cap.start || currentTime >= cap.end) return null;

        const age = currentTime - cap.start;
        const remain = cap.end - currentTime;

        const enterP = clamp01(age / ENTER);
        const motion = enterMotion(cap.role, enterP);

        // 終わり際はふわっと消す
        const exitP = clamp01(remain / EXIT);
        const exitEase = easeOutQuint(exitP);

        const isCenter = cap.position === "center";
        const commonMotion = {
          opacity: motion.opacity * exitEase,
          // centerのときは縦中央寄せの分を足す
          transform: `${isCenter ? "translateY(-50%) " : ""}${motion.transform} translateY(${((1 - exitEase) * -6).toFixed(2)}px)`,
          filter: motion.filter,
        };

        // ── スタイル指定あり（50種のテロップスタイル）──
        if (isKnownStyleId(cap.styleId)) {
          const spec = getCaptionStyle(cap.styleId, cap.role);
          const fontSize = Math.round(width * (SIZE_SCALE[cap.size] || SIZE_SCALE.md));
          const { wrapper, strokes, fill } = buildCaptionLayers(spec, fontSize);

          return (
            <div key={cap.id} style={{ ...styledContainer(cap), ...commonMotion }}>
              <span style={wrapper}>
                {strokes.map((s, i) => (
                  <span key={i} style={s} aria-hidden="true">{cap.text}</span>
                ))}
                <span style={fill}>{cap.text}</span>
              </span>
            </div>
          );
        }

        // ── スタイル指定なし（旧データ・ブランド設定に従う）──
        const style = captionStyle(cap, width, accent, font);

        return (
          <div key={cap.id} style={{ ...style, ...commonMotion }}>
            {cap.text}
          </div>
        );
      })}
    </div>
  );
}
