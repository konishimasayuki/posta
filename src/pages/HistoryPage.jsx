import { useState } from "react";

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

const DURATION_LABEL = { short: "〜15秒", medium: "30〜60秒", long: "1〜3分" };

function VideoThumb({ color, small }) {
  const size = small ? 56 : 80;
  const isUrl = color && color.startsWith("http");
  return (
    <div style={{
      width: `${size}px`, height: `${size * 16/9 * (small ? 1 : 0.8)}px`,
      borderRadius: "8px", flexShrink: 0, position: "relative", overflow: "hidden",
      background: isUrl ? "#f3f4f6" : `linear-gradient(135deg, ${color}dd, ${color}88)`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {isUrl
        ? <img src={color} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : <div style={{ fontSize: small ? "18px" : "24px" }}>🎬</div>
      }
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
    navigator.clipboard.writeText(item.postText);
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
            <div style={{ fontSize: "10px", color: "#9ca3af" }}>{item.createdAt}</div>
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
          {item.videoThumb && <VideoThumb color={item.videoThumb} small />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#111827", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.topic}
            </div>
            <div style={{ fontSize: "11px", color: "#6b7280", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {item.postText}
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
  const [activeTab, setActiveTab] = useState(item.platforms[0]);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const currentP = PLATFORM_META[activeTab];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: "520px", margin: "0 auto", background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* ヘッダー */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827" }}>{item.topic}</div>
            <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{item.projectName} · {item.createdAt}</div>
          </div>
          <button onClick={onClose} style={{ width: "30px", height: "30px", borderRadius: "50%", border: "none", background: "#f3f4f6", fontSize: "14px", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ overflowY: "auto", padding: "16px 20px 24px" }}>
          {/* 動画 */}
          {item.videoThumb && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#374151", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                🎬 生成された動画
                <span style={{ fontSize: "10px", fontWeight: 600, color: "#9ca3af" }}>· {DURATION_LABEL[item.duration]}</span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <VideoThumb color={item.videoThumb} />
                <div style={{ flex: 1 }}>
                  {[["サイズ","1080×1920"],["形式","MP4"],["比率","9:16"]].map(([k,v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "5px" }}>
                      <span style={{ color: "#9ca3af" }}>{k}</span>
                      <span style={{ fontWeight: 700, color: "#374151" }}>{v}</span>
                    </div>
                  ))}
                  <button onClick={() => { setDownloaded(true); setTimeout(() => setDownloaded(false), 2000); }} style={{
                    width: "100%", marginTop: "8px", padding: "9px", borderRadius: "9px", border: "none",
                    background: downloaded ? "#10b981" : `linear-gradient(135deg, ${item.projectColor}, ${item.projectColor}cc)`,
                    color: "#fff", fontWeight: 700, fontSize: "11px", cursor: "pointer",
                  }}>
                    {downloaded ? "✓ DL完了" : "⬇ 動画をDL"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 投稿文タブ */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#374151", marginBottom: "10px" }}>📝 投稿文</div>
            <div style={{ display: "flex", gap: "0", background: "#f3f4f6", borderRadius: "10px", padding: "3px", marginBottom: "10px" }}>
              {item.platforms.map(p => {
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
                <button onClick={() => { navigator.clipboard.writeText(item.postText); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
                  padding: "5px 12px", borderRadius: "8px", border: "none",
                  background: copied ? "#10b981" : currentP?.accent, color: "#fff",
                  fontWeight: 700, fontSize: "11px", cursor: "pointer",
                }}>
                  {copied ? "✓ コピー済み" : "📋 コピー"}
                </button>
              </div>
              <div style={{ padding: "12px 14px", fontSize: "12px", lineHeight: 1.9, color: "#374151", whiteSpace: "pre-wrap" }}>
                {item.postText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState(null);

  const projects = [...new Set(HISTORY.map(h => h.projectName))];
  const filtered = filter === "all" ? HISTORY : HISTORY.filter(h => h.projectName === filter);

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
            ["🎬", "動画", HISTORY.filter(h => h.videoThumb).length + "本"],
            ["📝", "投稿文", HISTORY.length + "件"],
            ["📅", "最終生成", "2時間前"],
          ].map(([icon, label, val]) => (
            <div key={label} style={{ background: "#fff", borderRadius: "12px", padding: "12px", border: "1px solid #e5e7eb", textAlign: "center" }}>
              <div style={{ fontSize: "18px" }}>{icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#111827" }}>{val}</div>
              <div style={{ fontSize: "10px", color: "#9ca3af" }}>{label}</div>
            </div>
          ))}
        </div>

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
