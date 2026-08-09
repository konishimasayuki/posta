import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CaptionOverlay from "../components/CaptionOverlay.jsx";
import { resolveAccent } from "../lib/fonts.js";
import { formatRelative, formatJstFull } from "../lib/time.js";
import { getCurrentUser, getUserId } from "../lib/auth.js";

const HISTORY = [
  { id: 1, projectName: "カフェ Lumière", projectColor: "#ea580c", projectSecondary: "#fff7ed", projectIcon: "🍽",
    type: "both", platforms: ["instagram", "tiktok"], topic: "週末モーニングの新メニューが好評だった",
    createdAt: "2時間前", duration: "short",
    videoThumb: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
    postText: "週末モーニング、新メニュー登場です☕✨ パンケーキ3種を新しく追加しました。 #カフェ #モーニング #週末",
  },
  { id: 2, projectName: "カフェ Lumière", projectColor: "#ea580c", projectSecondary: "#fff7ed", projectIcon: "🍽",
    type: "sns", platforms: ["x", "note"], topic: "テラス席のリニューアルが完了した",
    createdAt: "昨日", duration: null,
    videoThumb: null,
    postText: "テラス席、生まれ変わりました☀️ 新しい植栽と日よけで、より快適な空間に。 #カフェ #テラス席",
  },
  { id: 3, projectName: "FitPro ジム", projectColor: "#dc2626", projectSecondary: "#fef2f2", projectIcon: "💪",
    type: "both", platforms: ["tiktok", "instagram"], topic: "ビフォーアフター30日間の変化を公開",
    createdAt: "2日前", duration: "medium",
    videoThumb: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
    postText: "30日間のトレーニング成果🔥 体重-4.2kg・体脂肪率-3.1% 結果にコミット！ #FitPro #筋トレ",
  },
  { id: 4, projectName: "Atelier Blanc", projectColor: "#db2777", projectSecondary: "#fdf2f8", projectIcon: "💅",
    type: "both", platforms: ["instagram", "note"], topic: "新商品ラインナップ紹介",
    createdAt: "3日前", duration: "long",
    videoThumb: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80",
    postText: "新しいオーガニックラインが登場✨ 自然由来の成分にこだわった3アイテム。 #AtelierBlanc #自然派",
  },
  { id: 5, projectName: "FitPro ジム", projectColor: "#dc2626", projectSecondary: "#fef2f2", projectIcon: "💪",
    type: "sns", platforms: ["x"], topic: "入会キャンペーン告知",
    createdAt: "4日前", duration: null,
    videoThumb: null,
    postText: "【入会キャンペーン】今月末まで入会金0円！ 定員まで残り5名。お急ぎください🔥 #FitPro",
  },
  { id: 6, projectName: "カフェ Lumière", projectColor: "#ea580c", projectSecondary: "#fff7ed", projectIcon: "🍽",
    type: "both", platforms: ["tiktok"], topic: "カフェの朝の準備風景をVlogで",
    createdAt: "5日前", duration: "short",
    videoThumb: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&q=80",
    postText: "開店前の静かな時間が好きです☕ 豆を挽く香り、光の入り方、全部好き。 #カフェVlog #朝活",
  },
];

const PLATFORM_META = {
  tiktok:    { icon: "🎵", label: "TikTok",    accent: "#fe2c55" },
  instagram: { icon: "📸", label: "Instagram", accent: "#f77737" },
  x:         { icon: "𝕏",  label: "X",         accent: "#1d9bf0" },
  note:      { icon: "📝", label: "note",       accent: "#41c9b4" },
};

// GeneratePage の DURATION_OPTIONS と対応させること。
// Klingは5秒か10秒しか生成できないため、実尺は xs=5 / sm=10 に丸められる。
const DURATION_LABEL = {
  xs: "〜5秒", sm: "6〜10秒", md: "11〜20秒", lg: "21〜30秒",
  // 旧データ互換（この仕組みより前に保存された履歴用）
  short: "〜5秒", medium: "〜10秒", long: "〜10秒",
};
const DURATION_SECONDS = {
  xs: 5, sm: 10, md: 10, lg: 10,
  short: 5, medium: 10, long: 10,
};

/**
 * この動画が「すでに文字を焼き込み済み」かどうかを判定する。
 *
 * item.isBurned フラグを最優先で見るが、それが無い（＝この項目が
 * isBurned フィールドを持つ前に保存された古いデータ）場合でも、
 * 動画URLの発行元を見て判定する保険をかける。
 * CreatomateはBackblaze（backblazeb2.com）にファイルを置くため、
 * KlingのURL（klingai.com）と区別できる。
 */
function isBurnedVideo(item) {
  if (typeof item?.isBurned === "boolean") return item.isBurned;
  const url = item?.videoUrl || "";
  return url.includes("backblazeb2.com") || url.includes("creatomate");
}

function VideoThumb({ color, small }) {
  const size = small ? 56 : 80;
  const isUrl = color && color.startsWith("http");
  // 拡張子だけでは動画か画像か判定できないURLがあるため、まず動画として試し、
  // 失敗したら画像として再試行する（どちらでも壊れずに表示するため）
  const [mode, setMode] = useState(isUrl ? "video" : "none");
  const videoTagRef = useRef(null);

  return (
    <div style={{
      width: `${size}px`, height: `${size * 16/9 * (small ? 1 : 0.8)}px`,
      borderRadius: "8px", flexShrink: 0, position: "relative", overflow: "hidden",
      background: isUrl ? "#111" : `linear-gradient(135deg, ${color}dd, ${color}88)`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {mode === "video" && (
        <video
          ref={videoTagRef}
          src={color}
          muted
          playsInline
          preload="metadata"
          // iOSは読み込んだだけだと真っ黒のままなので、わずかに再生位置をずらして
          // 実際のコマを描画させる（サムネイル代わり）
          onLoadedMetadata={e => { try { e.target.currentTime = Math.min(0.15, (e.target.duration || 1) / 2); } catch {} }}
          onError={() => setMode("image")}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}
      {mode === "image" && (
        <img src={color} alt="" onError={() => setMode("none")} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      )}
      {mode === "none" && (
        <div style={{ fontSize: small ? "18px" : "24px" }}>🎬</div>
      )}
      <div style={{
        position: "absolute", bottom: "4px", right: "4px",
        background: "rgba(0,0,0,0.6)", borderRadius: "4px",
        padding: "1px 5px", fontSize: "8px", color: "#fff", fontWeight: 700,
      }}>9:16</div>
    </div>
  );
}

function HistoryCard({ item, onDetail }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.postTexts?.[item.platforms?.[0]] || item.postText || "");
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div onClick={() => onDetail(item)} style={{
      background: "#fff", borderRadius: "16px", border: "1.5px solid #e5e7eb",
      overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
      boxShadow: "0 1px 4px #0000000a",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = item.projectColor; e.currentTarget.style.boxShadow = `0 4px 16px ${item.projectColor}22`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "0 1px 4px #0000000a"; }}
    >
      <div style={{ height: "3px", background: item.projectColor }} />
      <div style={{ padding: "14px" }}>
        {/* ヘッダー */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: item.projectSecondary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
            {item.projectIcon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>{item.projectName}</div>
            <div style={{ fontSize: "10px", color: "#9ca3af" }}>{formatRelative(item.createdAt)}</div>
          </div>
          {/* タイプバッジ */}
          <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "20px",
            background: item.type === "both" ? "#f5f3ff" : "#f0fdf4",
            color: item.type === "both" ? "#7c3aed" : "#059669" }}>
            {item.type === "both" ? "🎬 動画+投稿文" : "📝 投稿文のみ"}
          </span>
        </div>

        {/* コンテンツ */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          {(item.videoUrl || item.videoThumb) && <VideoThumb color={item.videoUrl || item.videoThumb} small />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#111827", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.topic}
            </div>
            <div style={{ fontSize: "11px", color: "#6b7280", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {item.postTexts?.[item.platforms?.[0]] || item.postText || ""}
            </div>
          </div>
        </div>

        {/* フッター */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {item.platforms.map(p => {
              const meta = PLATFORM_META[p];
              return (
                <span key={p} style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "20px", background: meta.accent + "15", color: meta.accent }}>
                  {meta.icon} {meta.label}
                </span>
              );
            })}
            {item.duration && (
              <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "20px", background: "#f3f4f6", color: "#6b7280" }}>
                ⏱ {DURATION_LABEL[item.duration]}
              </span>
            )}
          </div>
          <button onClick={handleCopy} style={{
            padding: "5px 10px", borderRadius: "8px", border: "1px solid #e5e7eb",
            background: copied ? "#10b981" : "#fff", color: copied ? "#fff" : "#374151",
            fontWeight: 700, fontSize: "10px", cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
          }}>
            {copied ? "✓" : "📋"} {copied ? "コピー済み" : "投稿文コピー"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 詳細モーダル
function DetailModal({ item, onClose }) {
  // 初期値は引数の item を使う（current はこの下で定義されるため、ここではまだ使えない）
  const [activeTab, setActiveTab] = useState(item.platforms[0]);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [showCaptions, setShowCaptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenStep, setRegenStep] = useState("");   // 進行状況の表示用
  const [regenError, setRegenError] = useState(null);
  const [localItem, setLocalItem] = useState(item); // 作り直し後の内容を即座に反映するため
  const videoRef = useRef(null);

  // 作り直し後は localItem を参照する（元の item は書き換わらないため）
  const current = localItem;

  /** Creatomateの焼き込み完了を待つ */
  const pollBurn = async (renderId) => {
    const INTERVAL = 3000;
    const MAX_TRIES = 40;   // 最大2分
    let consecutiveErrors = 0;

    for (let i = 0; i < MAX_TRIES; i++) {
      await new Promise(r => setTimeout(r, INTERVAL));
      try {
        const res = await fetch(`/api/creatomate-status?renderId=${encodeURIComponent(renderId)}`);
        const data = await res.json();
        if (data.status === "succeeded") return data.url;
        if (data.status === "failed") throw new Error(data.error || "焼き込みに失敗しました");
        consecutiveErrors = 0;
      } catch (err) {
        consecutiveErrors++;
        if (consecutiveErrors >= 3) throw err;
      }
    }
    throw new Error("焼き込みに時間がかかりすぎています");
  };

  /**
   * テロップを作り直して、動画に焼き込み直す。
   * 焼き込みはCreatomateのクレジットを消費するため、必ず確認を取る。
   */
  const handleRegenerate = async () => {
    // 元のKling動画（文字なし）が無いと、焼き込み直せない。
    // 焼き込み済みの動画に再度焼くと文字が二重になるため。
    const source = current.rawVideoUrl;
    if (!source) {
      setRegenError("この作品には元動画が保存されていないため、作り直せません（この機能より前に作られた作品です）");
      return;
    }

    const ok = window.confirm(
      "テロップを作り直して、動画に焼き込み直します。\n" +
      "動画の生成クレジットを消費します。よろしいですか？"
    );
    if (!ok) return;

    setRegenerating(true);
    setRegenError(null);

    try {
      // ① テロップを設計し直す
      setRegenStep("テロップを設計中...");
      const capRes = await fetch("/api/generate-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: { ...(current.brand || {}), name: current.projectName },
          neta: current.topic,
          duration: DURATION_SECONDS[current.duration] || 5,
        }),
      });
      const capData = await capRes.json();
      if (!capData.captions?.length) {
        throw new Error(capData.error || "テロップの設計に失敗しました");
      }

      // ② 焼き込み直す
      setRegenStep("動画に焼き込み中...");
      const burnRes = await fetch("/api/creatomate-burn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: source,
          videoDuration: DURATION_SECONDS[current.duration] || 5,
          captions: capData.captions,
        }),
      });
      const burnData = await burnRes.json();
      if (!burnRes.ok || !burnData.renderId) {
        throw new Error(burnData.error || "焼き込みを開始できませんでした");
      }
      if (burnData.warnings?.length > 0) {
        console.warn("Creatomateからの警告:", burnData.warnings);
      }

      const newUrl = await pollBurn(burnData.renderId);

      // ③ 履歴を更新する
      setRegenStep("保存中...");
      const patch = {
        videoUrl: newUrl,
        videoThumb: newUrl,
        captions: capData.captions,
        isBurned: true,
      };
      await fetch("/api/history", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: getUserId(), id: current.id, patch }),
      });

      // 画面にも即座に反映する
      setLocalItem(prev => ({ ...prev, ...patch }));
      setRegenStep("");

    } catch (err) {
      console.error("regenerate error:", err);
      setRegenError(err.message || "作り直しに失敗しました");
      setRegenStep("");
    }
    setRegenerating(false);
  };

  const handleSaveVideo = async (url) => {
    if (!url || saving) return;
    setSaving(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("動画の取得に失敗しました");
      const blob = await res.blob();
      const fileName = `posta_${Date.now()}.mp4`;
      const file = new File([blob], fileName, { type: blob.type || "video/mp4" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Posta" });
      } else {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
      }
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (err) {
      console.error("save video error:", err);
      window.open(url, "_blank", "noopener,noreferrer");
    }
    setSaving(false);
  };
  const currentP = PLATFORM_META[activeTab];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: "520px", margin: "0 auto", background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* ヘッダー */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827" }}>{current.topic}</div>
            <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{current.projectName} · {formatJstFull(current.createdAt) || current.createdAt}</div>
          </div>
          <button onClick={onClose} style={{ width: "30px", height: "30px", borderRadius: "50%", border: "none", background: "#f3f4f6", fontSize: "14px", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ overflowY: "auto", padding: "16px 20px 24px" }}>
          {/* 動画 */}
          {(current.videoUrl || current.videoThumb) && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#374151", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                🎬 生成された動画
                <span style={{ fontSize: "10px", fontWeight: 600, color: "#9ca3af" }}>· {DURATION_LABEL[current.duration]}</span>
                {/* 焼き込み済みの動画は文字を消せない（映像そのものに含まれるため）
                    ので、トグル自体を出さない */}
                {!isBurnedVideo(item) && current.captions?.length > 0 && (
                  <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={showCaptions}
                      onChange={e => setShowCaptions(e.target.checked)}
                      style={{ accentColor: "#f97316", width: "13px", height: "13px" }}
                    />
                    <span style={{ fontSize: "10px", fontWeight: 700, color: showCaptions ? "#f97316" : "#9ca3af" }}>
                      テロップ
                    </span>
                  </label>
                )}
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                {current.videoUrl ? (
                  <div style={{ position: "relative", width: "150px", height: "267px", borderRadius: "10px", overflow: "hidden", background: "#000", flexShrink: 0 }}>
                    <video
                      ref={videoRef}
                      src={current.videoUrl}
                      controls
                      loop
                      playsInline
                      onTimeUpdate={e => setVideoTime(e.target.currentTime)}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    {/* 焼き込み済みの動画は、文字がすでに映像そのものに含まれているため
                        プレビュー用のCaptionOverlayは重ねない（二重表示防止） */}
                    {!isBurnedVideo(item) && showCaptions && current.captions?.length > 0 && (
                      <CaptionOverlay
                        captions={current.captions}
                        currentTime={videoTime}
                        width={150}
                        accent={resolveAccent(current.brand || {}, current.projectColor)}
                        project={current.brand || {}}
                      />
                    )}
                  </div>
                ) : (
                  <VideoThumb color={current.videoThumb} />
                )}
                <div style={{ flex: 1 }}>
                  {[["形式","MP4"],["比率","9:16"]].map(([k,v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "5px" }}>
                      <span style={{ color: "#9ca3af" }}>{k}</span>
                      <span style={{ fontWeight: 700, color: "#374151" }}>{v}</span>
                    </div>
                  ))}
                  {current.videoUrl ? (
                    <button
                      onClick={() => handleSaveVideo(current.videoUrl)}
                      disabled={saving}
                      style={{
                        display: "block", width: "100%", marginTop: "8px", padding: "9px", borderRadius: "9px", border: "none",
                        background: downloaded ? "#10b981" : `linear-gradient(135deg, ${current.projectColor}, ${current.projectColor}cc)`,
                        color: "#fff", fontWeight: 700, fontSize: "11px", textAlign: "center",
                        cursor: saving ? "default" : "pointer",
                      }}
                    >
                      {saving ? "保存中..." : downloaded ? "✓ 保存しました" : "⬇ 動画を保存"}
                    </button>
                  ) : (
                    <div style={{ marginTop: "8px", padding: "8px", borderRadius: "8px", background: "#f8f9fb", border: "1px solid #e5e7eb", fontSize: "10px", color: "#9ca3af", textAlign: "center", lineHeight: 1.6 }}>
                      動画の保存期限が<br />切れています
                    </div>
                  )}
                </div>
              </div>

              {/* テロップを作り直す（焼き込みまでやり直すのでクレジットを消費する） */}
              {current.rawVideoUrl && (
                <>
                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    style={{
                      width: "100%", marginTop: "12px", padding: "10px", borderRadius: "10px",
                      border: "1.5px solid #e5e7eb", background: regenerating ? "#f9fafb" : "#fff",
                      color: regenerating ? "#9ca3af" : "#374151",
                      fontWeight: 700, fontSize: "12px", cursor: regenerating ? "default" : "pointer",
                    }}
                  >
                    {regenerating ? (regenStep || "処理中...") : "↻ 別のパターンで作り直す"}
                  </button>
                  <div style={{ fontSize: "10px", color: "#9ca3af", textAlign: "center", marginTop: "5px", lineHeight: 1.6 }}>
                    テロップを設計し直して、動画に焼き込み直します（クレジットを消費します）
                  </div>
                </>
              )}

              {regenError && (
                <div style={{ marginTop: "8px", padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", fontSize: "11px", color: "#b91c1c", lineHeight: 1.7 }}>
                  {regenError}
                </div>
              )}
            </div>
          )}

          {/* 投稿文タブ */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#374151", marginBottom: "10px" }}>📝 投稿文</div>
            <div style={{ display: "flex", gap: "0", background: "#f3f4f6", borderRadius: "10px", padding: "3px", marginBottom: "10px" }}>
              {current.platforms.map(p => {
                const meta = PLATFORM_META[p];
                return (
                  <button key={p} onClick={() => setActiveTab(p)} style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                    padding: "7px 8px", borderRadius: "7px", border: "none",
                    background: activeTab === p ? "#fff" : "transparent",
                    color: activeTab === p ? meta.accent : "#9ca3af",
                    fontWeight: 700, fontSize: "11px", cursor: "pointer",
                    boxShadow: activeTab === p ? "0 1px 4px #0000001a" : "none",
                    transition: "all 0.2s",
                  }}>
                    <span>{meta.icon}</span><span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ background: currentP?.accent + "10", borderRadius: "12px", border: `1px solid ${currentP?.accent}22`, overflow: "hidden" }}>
              <div style={{ padding: "12px 14px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${currentP?.accent}22` }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>{currentP?.icon} {currentP?.label}用</span>
                <button onClick={() => { navigator.clipboard.writeText(current.postTexts?.[activeTab] || current.postText || ""); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
                  padding: "5px 12px", borderRadius: "8px", border: "none",
                  background: copied ? "#10b981" : currentP?.accent, color: "#fff",
                  fontWeight: 700, fontSize: "11px", cursor: "pointer",
                }}>
                  {copied ? "✓ コピー済み" : "📋 コピー"}
                </button>
              </div>
              <div style={{ padding: "12px 14px", fontSize: "12px", lineHeight: 1.9, color: "#374151", whiteSpace: "pre-wrap" }}>
                {current.postTexts?.[activeTab] || current.postText || "（投稿文が保存されていません）"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();

  const currentUser = getCurrentUser();
  const isDemo = currentUser?.role === "demo";
  const userId = currentUser?.id || "guest";

  const [items, setItems] = useState(isDemo ? HISTORY : []);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    fetch(`/api/history?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => {
        if (data.history) {
          const parsed = typeof data.history === "string" ? JSON.parse(data.history) : data.history;
          if (parsed.length > 0) setItems(parsed);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [userId]);

  if (loadingHistory) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f8f9fb" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid #f3f4f6", borderTop: "3px solid #f97316", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
        <div style={{ fontSize: "13px", color: "#9ca3af" }}>読み込み中...</div>
        <style>{"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"}</style>
      </div>
    </div>
  );

  const projects = [...new Set(items.map(h => h.projectName))];
  const filtered = filter === "all" ? items : items.filter(h => h.projectName === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif", color: "#111827" }}>
      {/* ヘッダー */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          <button style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#6b7280" }}>←</button>
          <div onClick={() => navigate("/projects")} style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.03em", cursor: "pointer" }}>
            <span style={{ color: "#f97316" }}>Po</span>sta
          </div>
          <div style={{ width: "1px", height: "18px", background: "#e5e7eb" }} />
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>過去の作品</div>
          <div style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 700, background: "#f3f4f6", color: "#374151", padding: "3px 10px", borderRadius: "20px" }}>
            {filtered.length}件
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "16px 16px 60px" }}>
        {/* フィルター */}
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px", marginBottom: "14px", scrollbarWidth: "none" }}>
          {["all", ...projects].map(p => (
            <button key={p} onClick={() => setFilter(p)} style={{
              flexShrink: 0, padding: "7px 14px", borderRadius: "20px",
              border: `1.5px solid ${filter === p ? "#f97316" : "#e5e7eb"}`,
              background: filter === p ? "#fff7ed" : "#fff",
              color: filter === p ? "#f97316" : "#6b7280",
              fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
            }}>
              {p === "all" ? "すべて" : p}
            </button>
          ))}
        </div>

        {/* 統計 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          {[
            ["🎬", "動画", items.filter(h => h.videoUrl || h.videoThumb).length + "本"],
            ["📝", "投稿文", items.length + "件"],
            ["📅", "最終生成", "2時間前"],
          ].map(([icon, label, val]) => (
            <div key={label} style={{ background: "#fff", borderRadius: "12px", padding: "12px", border: "1px solid #e5e7eb", textAlign: "center" }}>
              <div style={{ fontSize: "18px" }}>{icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#111827" }}>{val}</div>
              <div style={{ fontSize: "10px", color: "#9ca3af" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* 空の状態 */}
        {items.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: "16px", border: "2px dashed #e5e7eb" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎬</div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827", marginBottom: "6px" }}>まだ生成した作品がありません</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "16px", lineHeight: 1.7 }}>プロジェクトを作成して<br />動画・投稿文を生成してみましょう</div>
            <button onClick={() => navigate("/projects")} style={{ padding: "10px 24px", borderRadius: "20px", border: "none", background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
              プロジェクト一覧へ
            </button>
          </div>
        )}

        {/* リスト */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map(item => (
            <HistoryCard key={item.id} item={item} onDetail={setDetail} />
          ))}
        </div>
      </div>

      {detail && <DetailModal item={detail} onClose={() => setDetail(null)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
