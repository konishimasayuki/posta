import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getUserId } from "../lib/auth.js";
import { formatRelative } from "../lib/time.js";

// 業種のラベル（api/_labels.js と対応させること）
const INDUSTRY_LABELS = {
  restaurant: "飲食・カフェ", beauty: "美容・サロン", fitness: "フィットネス",
  education: "教育・スクール", medical: "医療・健康", ec: "EC・小売",
  it: "IT・Web", creative: "クリエイティブ", service: "サービス業",
  legal: "士業", auto: "自動車販売", realestate: "不動産", other: "その他",
};

const PLATFORM_META = {
  tiktok:    { label: "TikTok",    accent: "#fe2c55" },
  instagram: { label: "Instagram", accent: "#f77737" },
  x:         { label: "X",         accent: "#111827" },
  note:      { label: "note",      accent: "#41c9b4" },
};

/**
 * 作品のサムネイル。
 * 動画の最初のコマを表示し、タップで再生する。
 * iOSは読み込んだだけでは真っ黒のままなので、再生位置をわずかにずらして
 * 実際のコマを描画させる（HistoryPage / GeneratePage と同じ対策）。
 */
function WorkThumb({ videoUrl, accent }) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  if (failed || !videoUrl) {
    return (
      <div style={{ height: "180px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "4px" }}>
        <div style={{ fontSize: "24px" }}>🎬</div>
        <div style={{ fontSize: "10px", color: "#9ca3af" }}>動画の保存期限切れ</div>
      </div>
    );
  }

  return (
    <div onClick={togglePlay} style={{ position: "relative", height: "180px", overflow: "hidden", background: "#000", cursor: "pointer" }}>
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        loop
        preload="metadata"
        onLoadedMetadata={e => { try { e.target.currentTime = Math.min(0.15, (e.target.duration || 1) / 2); } catch {} }}
        onError={() => setFailed(true)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {!playing && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.92)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        }}>
          <span style={{ fontSize: "15px", marginLeft: "3px" }}>▶</span>
        </div>
      )}
    </div>
  );
}

function WorkCard({ work, myUserId, onLike, onUseTemplate, onUnpublish }) {
  const liked = Array.isArray(work.likedBy) && work.likedBy.includes(myUserId);
  const isMine = work.userId === myUserId;
  const firstPlatform = work.platforms?.[0];
  const pmeta = PLATFORM_META[firstPlatform];

  return (
    <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px #0000000a" }}>
      <div style={{ position: "relative" }}>
        <WorkThumb videoUrl={work.videoUrl} accent={pmeta?.accent} />

        {/* 投稿先 */}
        {pmeta && (
          <div style={{ position: "absolute", bottom: "8px", left: "8px", pointerEvents: "none" }}>
            <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "10px", background: pmeta.accent, color: "#fff" }}>
              {pmeta.label}
            </span>
          </div>
        )}

        {/* 自分の作品には印をつける */}
        {isMine && (
          <div style={{ position: "absolute", top: "8px", right: "8px", pointerEvents: "none" }}>
            <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "10px", background: "#f97316", color: "#fff" }}>自分</span>
          </div>
        )}
      </div>

      <div style={{ padding: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
          <div style={{ width: "22px", height: "22px", borderRadius: "50%", overflow: "hidden", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0 }}>
            {work.projectThumb
              ? <img src={work.projectThumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : "👤"}
          </div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {work.projectName || work.userName}
          </span>
        </div>

        <div style={{ fontSize: "13px", fontWeight: 800, color: "#111827", marginBottom: "6px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {work.title}
        </div>

        <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "10px" }}>
          {INDUSTRY_LABELS[work.industry] || "その他"} · {formatRelative(work.createdAt)}
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={() => onLike(work)} style={{
            flex: 1, padding: "8px", borderRadius: "10px",
            border: `1.5px solid ${liked ? "#ef4444" : "#e5e7eb"}`,
            background: liked ? "#fef2f2" : "#fff",
            color: liked ? "#ef4444" : "#6b7280",
            fontWeight: 700, fontSize: "12px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
          }}>
            {liked ? "❤️" : "🤍"} {work.likes || 0}
          </button>
          <button onClick={() => onUseTemplate(work)} style={{
            flex: 2, padding: "8px", borderRadius: "10px", border: "none",
            background: "linear-gradient(135deg, #f97316, #ec4899)",
            color: "#fff", fontWeight: 700, fontSize: "11px", cursor: "pointer",
          }}>
            このテンプレで作る →
          </button>
        </div>

        {isMine && (
          <button onClick={() => onUnpublish(work)} style={{
            width: "100%", marginTop: "6px", padding: "6px", borderRadius: "8px",
            border: "1px solid #e5e7eb", background: "#fff", color: "#9ca3af",
            fontSize: "10px", fontWeight: 700, cursor: "pointer",
          }}>
            公開を取り消す
          </button>
        )}
      </div>
    </div>
  );
}

/** プロジェクト選択のモーダル。「このテンプレで作る」を押したあとに出す */
function ProjectSelectModal({ template, projects, onSelect, onClose }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth: "520px", margin: "0 auto", background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "18px 20px 12px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <div style={{ fontSize: "16px", fontWeight: 900, color: "#111827" }}>どのプロジェクトで作る？</div>
            <button onClick={onClose} style={{ width: "30px", height: "30px", borderRadius: "50%", border: "none", background: "#f3f4f6", fontSize: "14px", cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ fontSize: "11px", color: "#9ca3af", lineHeight: 1.7 }}>
            「{template?.title}」の<strong style={{ color: "#374151" }}>演出とテロップの構成</strong>を参考にします。<br />
            書体・色は、選んだプロジェクトのブランド設定がそのまま使われます。
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "0 20px 24px", flex: 1 }}>
          {projects.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 20px", background: "#f9fafb", borderRadius: "12px", border: "2px dashed #e5e7eb" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>📁</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>プロジェクトがありません</div>
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>先にプロジェクトを作成してください</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {projects.map(p => (
                <button key={p.id} onClick={() => onSelect(p)} style={{
                  width: "100%", padding: "14px", borderRadius: "12px", cursor: "pointer",
                  border: "1.5px solid #e5e7eb", background: "#fff", textAlign: "left", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>📁</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>
                      {INDUSTRY_LABELS[p.industry] || "その他"}
                    </div>
                  </div>
                  <span style={{ fontSize: "16px", color: "#9ca3af" }}>›</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const myUserId = getUserId();

  const [works, setWorks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [industry, setIndustry] = useState("すべて");
  const [sort, setSort] = useState("popular");
  const [toast, setToast] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      fetch("/api/explore").then(r => r.json()).catch(() => ({ works: [] })),
      fetch(`/api/projects?userId=${encodeURIComponent(myUserId)}`).then(r => r.json()).catch(() => ({ projects: [] })),
    ]).then(([exploreRes, projRes]) => {
      setWorks(Array.isArray(exploreRes.works) ? exploreRes.works : []);
      setProjects(Array.isArray(projRes.projects) ? projRes.projects : []);
    }).finally(() => setLoading(false));
  }, [myUserId]);

  const handleLike = async (work) => {
    // 先に画面を更新して、待ち時間を感じさせない
    const liked = Array.isArray(work.likedBy) && work.likedBy.includes(myUserId);
    setWorks(ws => ws.map(w => w.id === work.id ? {
      ...w,
      likedBy: liked ? w.likedBy.filter(u => u !== myUserId) : [...(w.likedBy || []), myUserId],
      likes: liked ? Math.max(0, (w.likes || 0) - 1) : (w.likes || 0) + 1,
    } : w));

    try {
      const res = await fetch("/api/explore", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: work.id, userId: myUserId }),
      });
      if (!res.ok) throw new Error("失敗");
    } catch {
      // 保存に失敗したら画面も元に戻す
      setWorks(ws => ws.map(w => w.id === work.id ? work : w));
      showToast("いいねを保存できませんでした");
    }
  };

  const handleUnpublish = async (work) => {
    if (!window.confirm("この作品の公開を取り消しますか？")) return;
    try {
      const res = await fetch(`/api/explore?id=${encodeURIComponent(work.id)}&userId=${encodeURIComponent(myUserId)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("失敗");
      setWorks(ws => ws.filter(w => w.id !== work.id));
      showToast("公開を取り消しました");
    } catch {
      showToast("取り消しに失敗しました");
    }
  };

  /**
   * テンプレを選んでプロジェクトを決めたら、生成画面へ渡す。
   *
   * 借りるのは「演出・ネタ・テロップの構成」だけ。
   * 書体や色は、選んだプロジェクトのブランド設定がそのまま使われる
   * （テンプレの見た目をコピーするとブランドの一貫性が崩れるため）。
   */
  const handleSelectProject = (project) => {
    const t = selectedTemplate;
    localStorage.setItem("posta_project", JSON.stringify(project));
    sessionStorage.setItem("posta_template", JSON.stringify({
      videoDirection: t.videoDirection || "",
      topic: t.topic || "",
      captionTexts: t.captionTexts || [],
      duration: t.duration || "xs",
      platforms: t.platforms || [],
      sourceTitle: t.title || "",
    }));
    setSelectedTemplate(null);
    showToast("テンプレートを適用しました");
    setTimeout(() => navigate("/generate"), 700);
  };

  const industries = ["すべて", ...new Set(works.map(w => w.industry).filter(Boolean))];

  const filtered = works.filter(w => industry === "すべて" || w.industry === industry);
  const sorted = [...filtered].sort((a, b) =>
    sort === "popular"
      ? (b.likes || 0) - (a.likes || 0)
      : new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif", color: "#111827", paddingBottom: "100px" }}>

      {toast && (
        <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: "#10b981", color: "#fff", padding: "11px 20px", borderRadius: "12px", fontWeight: 700, fontSize: "13px", zIndex: 500, boxShadow: "0 4px 20px #10b98140", whiteSpace: "nowrap" }}>
          ✓ {toast}
        </div>
      )}

      <div className="posta-header" style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          <div onClick={() => navigate("/projects")} style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.03em", cursor: "pointer" }}>
            <span style={{ color: "#f97316" }}>Po</span>sta
          </div>
          <div style={{ width: "1px", height: "18px", background: "#e5e7eb" }} />
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>探索</div>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={() => setSort(s => s === "popular" ? "new" : "popular")} style={{ fontSize: "11px", fontWeight: 700, padding: "5px 10px", borderRadius: "20px", border: "1px solid #e5e7eb", background: "#fff", color: "#374151", cursor: "pointer" }}>
              {sort === "popular" ? "🔥 人気順" : "🆕 新着順"}
            </button>
          </div>
        </div>

        {works.length > 0 && (
          <div style={{ maxWidth: "520px", margin: "0 auto", display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "12px", scrollbarWidth: "none" }}>
            {industries.map(ind => (
              <button key={ind} onClick={() => setIndustry(ind)} style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: "20px",
                border: `1.5px solid ${industry === ind ? "#f97316" : "#e5e7eb"}`,
                background: industry === ind ? "#fff7ed" : "#fff",
                color: industry === ind ? "#f97316" : "#6b7280",
                fontSize: "12px", fontWeight: 700, cursor: "pointer",
              }}>
                {ind === "すべて" ? "すべて" : (INDUSTRY_LABELS[ind] || ind)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "14px 16px 0" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid #f3f4f6", borderTop: "3px solid #f97316", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              <div style={{ fontSize: "13px", color: "#9ca3af" }}>読み込み中...</div>
            </div>
          </div>
        ) : works.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "#fff", borderRadius: "16px", border: "2px dashed #e5e7eb" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "6px" }}>まだ公開作品がありません</div>
            <div style={{ fontSize: "11px", color: "#9ca3af", lineHeight: 1.8 }}>
              過去の作品から動画を公開すると、<br />ここにみんなの作品が並びます
            </div>
            <button onClick={() => navigate("/history")} style={{
              marginTop: "16px", padding: "10px 20px", borderRadius: "10px", border: "none",
              background: "linear-gradient(135deg, #f97316, #ec4899)", color: "#fff",
              fontWeight: 700, fontSize: "12px", cursor: "pointer",
            }}>
              過去の作品を見る →
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
              {[
                ["🎬", "作品数", works.length + "本"],
                ["❤️", "総いいね", works.reduce((s, w) => s + (w.likes || 0), 0) + "件"],
                ["👥", "クリエイター", new Set(works.map(w => w.userId)).size + "人"],
              ].map(([icon, label, val]) => (
                <div key={label} style={{ flex: 1, background: "#fff", borderRadius: "12px", padding: "10px", border: "1px solid #e5e7eb", textAlign: "center" }}>
                  <div style={{ fontSize: "16px" }}>{icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#111827" }}>{val}</div>
                  <div style={{ fontSize: "9px", color: "#9ca3af" }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ columns: "2", gap: "10px" }}>
              {sorted.map(work => (
                <div key={work.id} style={{ breakInside: "avoid", marginBottom: "10px" }}>
                  <WorkCard
                    work={work}
                    myUserId={myUserId}
                    onLike={handleLike}
                    onUseTemplate={setSelectedTemplate}
                    onUnpublish={handleUnpublish}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedTemplate && (
        <ProjectSelectModal
          template={selectedTemplate}
          projects={projects}
          onSelect={handleSelectProject}
          onClose={() => setSelectedTemplate(null)}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
