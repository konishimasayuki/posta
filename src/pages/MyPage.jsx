import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatRelative } from "../lib/time.js";

const PLAN_META = {
  free:     { label: "Free",     color: "#059669", bg: "#ecfdf5", price: "¥0",      videoLimit: 3,   duration: 5  },
  starter:  { label: "Starter",  color: "#6b7280", bg: "#f9fafb", price: "¥6,980",  videoLimit: 10,  duration: 5  },
  pro:      { label: "Pro",      color: "#f97316", bg: "#fff7ed", price: "¥12,980", videoLimit: 20,  duration: 10 },
  business: { label: "Business", color: "#7c3aed", bg: "#f5f3ff", price: "¥29,800", videoLimit: 50,  duration: 10 },
};

const PLATFORM_ICON = { tiktok: "🎵", instagram: "📸", x: "𝕏", note: "📝" };

export default function MyPage() {
  const navigate = useNavigate();

  const currentUser = (() => {
    try { return JSON.parse(sessionStorage.getItem("posta_user")); } catch { return null; }
  })();
  const userId = currentUser?.id || "guest";
  const isDemo = currentUser?.role === "demo";

  const [tab, setTab] = useState("profile");
  const [avatarImg, setAvatarImg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);
  const [history, setHistory] = useState([]);

  const plan = PLAN_META[currentUser?.plan] || PLAN_META.free;

  // ログインしていなければログイン画面へ
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    Promise.all([
      fetch(`/api/projects?userId=${encodeURIComponent(userId)}`).then(r => r.json()).catch(() => ({ projects: [] })),
      fetch(`/api/history?userId=${encodeURIComponent(userId)}`).then(r => r.json()).catch(() => ({ history: [] })),
    ]).then(([projRes, histRes]) => {
      setProjectCount(Array.isArray(projRes.projects) ? projRes.projects.length : 0);
      setHistory(Array.isArray(histRes.history) ? histRes.history : []);
    }).finally(() => setLoading(false));
  }, [userId]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarImg(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    window.scrollTo(0, 0);
    navigate("/login");
  };

  // 実データから使用状況を集計
  const videoUsage = history.filter(h => h.videoUrl).length;
  const postUsage = history.reduce((sum, h) => sum + Object.keys(h.postTexts || {}).length, 0);
  const videoUsagePct = plan.videoLimit ? Math.min(100, Math.round((videoUsage / plan.videoLimit) * 100)) : 0;
  const recentHistory = history.slice(0, 3);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f8f9fb" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid #f3f4f6", borderTop: "3px solid #f97316", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <div style={{ fontSize: "13px", color: "#9ca3af" }}>読み込み中...</div>
        </div>
        <style>{"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif", color: "#111827", paddingBottom: "90px" }}>

      {/* ヘッダー */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          <div onClick={() => navigate("/projects")} style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.03em", cursor: "pointer" }}>
            <span style={{ color: "#f97316" }}>Po</span>sta
          </div>
          <div style={{ width: "1px", height: "18px", background: "#e5e7eb" }} />
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>マイページ</div>
        </div>
      </div>

      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "20px 16px" }}>

        {/* プロフィールカード */}
        <div style={{
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          borderRadius: "20px", padding: "20px 22px", marginBottom: "16px",
          color: "#fff", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: "-15px", top: "-15px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
            <label style={{ cursor: "pointer", position: "relative" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", overflow: "hidden", border: "2px solid rgba(255,255,255,0.4)" }}>
                {avatarImg ? <img src={avatarImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>{isDemo ? "🎭" : "👤"}</span>}
              </div>
              <div style={{ position: "absolute", bottom: 0, right: 0, width: "18px", height: "18px", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>📷</div>
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
            </label>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 900 }}>{currentUser?.name || "ゲスト"}</div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>{currentUser?.id || ""}</div>
              <div style={{ marginTop: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(255,255,255,0.25)", padding: "2px 10px", borderRadius: "20px" }}>
                  {plan.label}プラン
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {[["🎬", videoUsage + "本", "動画生成"], ["📝", postUsage + "件", "投稿文生成"], ["📁", projectCount + "個", "プロジェクト"]].map(([icon, val, label]) => (
              <div key={label} style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "10px 6px" }}>
                <div style={{ fontSize: "16px" }}>{icon}</div>
                <div style={{ fontSize: "15px", fontWeight: 800 }}>{val}</div>
                <div style={{ fontSize: "10px", opacity: 0.8 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* タブ */}
        <div style={{ display: "flex", gap: "3px", background: "#e5e7eb", borderRadius: "12px", padding: "3px", marginBottom: "16px" }}>
          {[["profile","プロフィール"],["plan","プラン"],["history","生成履歴"]].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "9px", borderRadius: "9px", border: "none",
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#111827" : "#9ca3af",
              fontWeight: 700, fontSize: "12px", cursor: "pointer",
              boxShadow: tab === t ? "0 1px 4px #0000001a" : "none", transition: "all 0.2s",
            }}>{l}</button>
          ))}
        </div>

        {/* プロフィールタブ */}
        {tab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "18px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#374151", marginBottom: "14px" }}>👤 アカウント情報</div>
              {[["ID", currentUser?.id || "-"], ["お名前", currentUser?.name || "-"], ["役割", isDemo ? "デモアカウント" : currentUser?.role === "admin" ? "管理者" : "一般ユーザー"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>{k}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={handleLogout} style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "1.5px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
              ログアウト
            </button>
          </div>
        )}

        {/* プランタブ */}
        {tab === "plan" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ background: "#fff", borderRadius: "16px", border: `2px solid ${plan.color}33`, padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: plan.color, marginBottom: "3px" }}>現在のプラン</div>
                  <div style={{ fontSize: "20px", fontWeight: 900, color: "#111827" }}>{plan.label}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: plan.color }}>{plan.price}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>/月（税込）</div>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                  <span style={{ fontWeight: 700, color: "#374151" }}>動画生成</span>
                  <span style={{ color: "#374151" }}>{videoUsage} / {plan.videoLimit}本</span>
                </div>
                <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${videoUsagePct}%`, background: videoUsagePct > 80 ? "#ef4444" : plan.color, borderRadius: "3px", transition: "width 0.5s" }} />
                </div>
                <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "3px" }}>残り{Math.max(0, plan.videoLimit - videoUsage)}本</div>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "18px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#374151", marginBottom: "12px" }}>📋 プラン一覧</div>
              {Object.entries(PLAN_META).map(([id, p]) => {
                const current = id === currentUser?.plan;
                return (
                  <div key={id} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px", borderRadius: "12px", marginBottom: "8px",
                    border: `1.5px solid ${current ? p.color : "#e5e7eb"}`,
                    background: current ? p.bg : "#fff",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: current ? p.color : "#111827" }}>{p.label}</div>
                      <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                        動画{p.videoLimit}本/月・最大{p.duration}秒
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: current ? p.color : "#374151" }}>{p.price}</div>
                      {current && <span style={{ fontSize: "10px", fontWeight: 700, color: p.color }}>現在のプラン</span>}
                    </div>
                  </div>
                );
              })}
              <div style={{ fontSize: "11px", color: "#9ca3af", textAlign: "center", marginTop: "6px" }}>
                プラン変更は管理者にお問い合わせください
              </div>
            </div>
          </div>
        )}

        {/* 生成履歴タブ */}
        {tab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>最近の生成（{history.length}件）</div>
              {history.length > 0 && (
                <button onClick={() => navigate("/history")} style={{ fontSize: "12px", fontWeight: 700, color: "#f97316", background: "none", border: "none", cursor: "pointer" }}>
                  すべて見る →
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "36px 20px", background: "#fff", borderRadius: "16px", border: "2px dashed #e5e7eb" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>🎬</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>まだ生成した作品がありません</div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>プロジェクトから動画・投稿文を作ってみましょう</div>
              </div>
            ) : (
              <>
                {recentHistory.map(h => (
                  <div key={h.id} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: (h.projectColor || "#f97316") + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                      {h.videoUrl ? "🎬" : "📝"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.topic}</div>
                      <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                        {h.projectName} · {(h.platforms || []).map(p => PLATFORM_ICON[p] || p).join(" ")} · {formatRelative(h.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => navigate("/history")} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 700, fontSize: "13px", cursor: "pointer", marginTop: "4px" }}>
                  過去の作品をすべて見る →
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
