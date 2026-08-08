// src/components/GenerationStatusBar.jsx
// Pボタンのすぐ上に固定表示する、生成状況のバー。
// 生成中でなければ何も表示しない（return null）。

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGeneration } from "../context/GenerationContext.jsx";

const LOAD_LABELS = [
  "ブランド設定を読み込み中",
  "投稿文を生成中",
  "動画プロンプトを生成中",
  "オリジナル動画を生成中",
  "テロップを設計中",
  "テロップを焼き込み中",
];

export default function GenerationStatusBar() {
  const { job, elapsed } = useGeneration();
  const navigate = useNavigate();
  const location = useLocation();

  // ログイン画面ではBottomNav自体が無いので、ここも出さない
  if (location.pathname === "/login") return null;
  if (!job) return null;

  const isDone = job.phase === "result";
  const isFailed = isDone && !job.videoUrl && !job.burnedVideoUrl && job.videoError;
  // 今まさにこの画面（結果画面）を見ている最中は、バーを重ねて出す必要がない
  const isOnGeneratePage = location.pathname === "/generate";
  if (isOnGeneratePage && isDone && job.viewed) return null;
  if (isOnGeneratePage && !isDone) return null;

  const mm = String(Math.floor(elapsed / 60)).padStart(1, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const label = isFailed
    ? "生成に失敗しました"
    : isDone
      ? "完成しました！タップして見る"
      : (LOAD_LABELS[job.loadStep] || "生成中");

  return (
    <div
      onClick={() => navigate("/generate")}
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "78px", // BottomNavの高さぶん、その少し上に置く
        zIndex: 150,
        width: "calc(100% - 32px)",
        maxWidth: "480px",
        background: isFailed ? "#fef2f2" : isDone ? "#ecfdf5" : "#fff",
        border: `1.5px solid ${isFailed ? "#fecaca" : isDone ? "#a7f3d0" : "#fed7aa"}`,
        borderRadius: "16px",
        padding: "10px 14px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
      }}
    >
      {isDone ? (
        <div style={{
          width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
          background: isFailed ? "#ef4444" : "#10b981",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: "12px", fontWeight: 900,
        }}>
          {isFailed ? "!" : "✓"}
        </div>
      ) : (
        <div style={{
          width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
          border: "2.5px solid #fed7aa", borderTop: "2.5px solid #f97316",
          animation: "spin 0.8s linear infinite",
        }} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "12px", fontWeight: 800,
          color: isFailed ? "#dc2626" : isDone ? "#059669" : "#111827",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {job.projectName || "プロジェクト"}
        </div>
        <div style={{ fontSize: "11px", color: "#9ca3af" }}>
          {label}
        </div>
      </div>

      {!isDone && (
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#f97316", flexShrink: 0 }}>
          {mm}:{ss}
        </div>
      )}
    </div>
  );
}
