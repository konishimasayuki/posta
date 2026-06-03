import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PLAN_META = {
  free:     { label: "Free",     color: "#059669", bg: "#ecfdf5", price: "¥0",     videoLimit: 3,   postLimit: null, duration: 15 },
  starter:  { label: "Starter",  color: "#6b7280", bg: "#f9fafb", price: "¥2,980", videoLimit: 10,  postLimit: null, duration: 15 },
  pro:      { label: "Pro",      color: "#f97316", bg: "#fff7ed", price: "¥9,800", videoLimit: 20,  postLimit: null, duration: 60 },
  business: { label: "Business", color: "#7c3aed", bg: "#f5f3ff", price: "¥29,800",videoLimit: 100, postLimit: null, duration: 180 },
};

const USER = {
  name: "山田 太郎",
  email: "taro@example.com",
  avatar: "🧑",
  plan: "pro",
  billingDate: "2026年7月1日",
  usageVideo: 8,
  usagePost: 47,
  projects: 3,
  joinedAt: "2026年4月",
};

const HISTORY_PREVIEW = [
  { id: 1, projectName: "カフェ Lumière", type: "both",  platforms: ["📸","🎵"], topic: "週末モーニングの新メニュー", time: "2時間前",  color: "#ea580c" },
  { id: 2, projectName: "FitPro ジム",   type: "sns",   platforms: ["𝕏"],       topic: "入会キャンペーン告知",      time: "昨日",    color: "#dc2626" },
  { id: 3, projectName: "カフェ Lumière", type: "both",  platforms: ["📸"],       topic: "テラス席リニューアル",       time: "3日前",   color: "#ea580c" },
];

export default function MyPage() {
  const navigate = useNavigate();
  const plan = PLAN_META[USER.plan];
  const [tab, setTab] = useState("profile");
  const [avatarImg, setAvatarImg] = useState("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80");

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarImg(ev.target.result);
    reader.readAsDataURL(file);
  }; // profile | plan | history

  const videoUsagePct = USER.plan === "starter" ? 0 : Math.round((USER.usageVideo / plan.videoLimit) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif", color: "#111827" }}>

      {/* ヘッダー */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", gap: "10px" }}>
<div style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.03em" }}>
            <span style={{ color: "#f97316" }}>Po</span>sta
          </div>
          <div style={{ width: "1px", height: "18px", background: "#e5e7eb" }} />
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>マイページ</div>
        </div>
      </div>

      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "20px 16px 80px" }}>

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
                {avatarImg ? <img src={avatarImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>{USER.avatar}</span>}
              </div>
              <div style={{ position: "absolute", bottom: 0, right: 0, width: "18px", height: "18px", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>📷</div>
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
            </label>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 900 }}>{USER.name}</div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>{USER.email}</div>
              <div style={{ marginTop: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(255,255,255,0.25)", padding: "2px 10px", borderRadius: "20px" }}>
                  {plan.label}プラン
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {[["🎬", USER.usageVideo + "本", "動画生成"], ["📝", USER.usagePost + "件", "投稿文生成"], ["📁", USER.projects + "個", "プロジェクト"]].map(([icon, val, label]) => (
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
              {[["お名前", USER.name], ["メールアドレス", USER.email], ["登録日", USER.joinedAt]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>{k}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "18px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#374151", marginBottom: "12px" }}>⚙️ 設定</div>
              {[["通知設定", "→"], ["パスワード変更", "→"], ["言語設定", "日本語 →"]].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}>
                  <span style={{ fontSize: "13px", color: "#374151" }}>{label}</span>
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>{val}</span>
                </div>
              ))}
            </div>
            <button style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "1.5px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
              ログアウト
            </button>
          </div>
        )}

        {/* プランタブ */}
        {tab === "plan" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* 現在のプラン */}
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
              <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "12px" }}>次回請求日：{USER.billingDate}</div>

              {/* 使用量 */}
              {USER.plan !== "starter" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                    <span style={{ fontWeight: 700, color: "#374151" }}>動画生成</span>
                    <span style={{ color: "#374151" }}>{USER.usageVideo} / {plan.videoLimit}本</span>
                  </div>
                  <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${videoUsagePct}%`, background: videoUsagePct > 80 ? "#ef4444" : plan.color, borderRadius: "3px", transition: "width 0.5s" }} />
                  </div>
                  <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "3px" }}>残り{plan.videoLimit - USER.usageVideo}本</div>
                </div>
              )}
            </div>

            {/* プラン変更 */}
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "18px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#374151", marginBottom: "12px" }}>📋 プラン変更</div>
              {Object.entries(PLAN_META).map(([id, p]) => {
                const current = id === USER.plan;
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
                        {id === "starter" ? "投稿文無制限・動画なし" : `動画${p.videoLimit}本/月・最大${p.duration}秒`}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: current ? p.color : "#374151" }}>{p.price}</div>
                      {current ? (
                        <span style={{ fontSize: "10px", fontWeight: 700, color: p.color }}>現在のプラン</span>
                      ) : (
                        <button style={{ fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", border: "none", background: p.color, color: "#fff", cursor: "pointer", marginTop: "2px" }}>
                          変更する
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 生成履歴タブ */}
        {tab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>最近の生成（{HISTORY_PREVIEW.length}件）</div>
              <button onClick={() => navigate("/history")} style={{ fontSize: "12px", fontWeight: 700, color: "#f97316", background: "none", border: "none", cursor: "pointer" }}>
                すべて見る →
              </button>
            </div>
            {HISTORY_PREVIEW.map(h => (
              <div key={h.id} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: h.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                  {h.type === "both" ? "🎬" : "📝"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.topic}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{h.projectName} · {h.platforms.join(" ")} · {h.time}</div>
                </div>
              </div>
            ))}
            <button onClick={() => navigate("/history")} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 700, fontSize: "13px", cursor: "pointer", marginTop: "4px" }}>
              過去の作品をすべて見る →
            </button>
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
