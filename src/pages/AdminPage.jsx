import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PLAN_META = {
  free:     { label: "Free",     color: "#059669", bg: "#ecfdf5", videoLimit: 3,   duration: 15 },
  starter:  { label: "Starter",  color: "#6b7280", bg: "#f9fafb", videoLimit: 10,  duration: 15 },
  pro:      { label: "Pro",      color: "#f97316", bg: "#fff7ed", videoLimit: 20,  duration: 60 },
  business: { label: "Business", color: "#7c3aed", bg: "#f5f3ff", videoLimit: 100, duration: 180 },
};

const INITIAL_USERS = [
  { id: 1, name: "山田 太郎",   email: "taro@example.com",    plan: "pro",      videoUsage: 8,  postUsage: 47, projects: 3, joinedAt: "2026/04/01", lastActive: "今日",  status: "active" },
  { id: 2, name: "鈴木 花子",   email: "hanako@example.com",  plan: "starter",  videoUsage: 0,  postUsage: 12, projects: 1, joinedAt: "2026/04/15", lastActive: "昨日",  status: "active" },
  { id: 3, name: "田中 商事",   email: "tanaka@corp.com",     plan: "business", videoUsage: 43, postUsage: 188,projects: 8, joinedAt: "2026/03/01", lastActive: "2時間前",status: "active" },
  { id: 4, name: "佐藤 美咲",   email: "misaki@salon.com",    plan: "pro",      videoUsage: 20, postUsage: 95, projects: 4, joinedAt: "2026/04/20", lastActive: "3日前",  status: "active" },
  { id: 5, name: "カフェ Lumi", email: "cafe@lumiere.com",    plan: "pro",      videoUsage: 15, postUsage: 63, projects: 2, joinedAt: "2026/05/01", lastActive: "今日",  status: "active" },
  { id: 6, name: "橋本 健一",   email: "kenichi@gym.com",     plan: "starter",  videoUsage: 0,  postUsage: 5,  projects: 1, joinedAt: "2026/05/10", lastActive: "1週間前",status: "inactive" },
];

const VIDEO_HISTORY = {
  1: [
    { id: 101, project: "カフェ Lumière", platform: "TikTok",    topic: "週末モーニング新メニュー", duration: "15秒", time: "2時間前",  thumb: "#ea580c" },
    { id: 102, project: "FitPro",        platform: "Instagram", topic: "ビフォーアフター30日間",   duration: "60秒", time: "昨日",    thumb: "#dc2626" },
    { id: 103, project: "カフェ Lumière", platform: "TikTok",    topic: "テラス席リニューアル",     duration: "15秒", time: "3日前",   thumb: "#ea580c" },
  ],
  3: [
    { id: 301, project: "ECサイトA",     platform: "Instagram", topic: "新商品ラインナップ",       duration: "60秒", time: "今日",    thumb: "#7c3aed" },
    { id: 302, project: "ECサイトA",     platform: "TikTok",    topic: "セール告知",               duration: "15秒", time: "昨日",    thumb: "#7c3aed" },
    { id: 303, project: "飲食店B",       platform: "Instagram", topic: "ランチメニュー紹介",       duration: "60秒", time: "2日前",   thumb: "#059669" },
  ],
};

function PlanBadge({ plan }) {
  const meta = PLAN_META[plan];
  return (
    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", background: meta.bg, color: meta.color, border: `1px solid ${meta.color}33` }}>
      {meta.label}
    </span>
  );
}

function UsageBar({ usage, limit, color }) {
  if (!limit) return <span style={{ fontSize: "11px", color: "#9ca3af" }}>—</span>;
  const pct = Math.min(Math.round((usage / limit) * 100), 100);
  const barColor = pct >= 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : color;
  return (
    <div style={{ width: "80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#9ca3af", marginBottom: "3px" }}>
        <span>{usage}</span><span>{limit}</span>
      </div>
      <div style={{ height: "4px", background: "#f3f4f6", borderRadius: "2px" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: "2px", transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState(INITIAL_USERS);
  const [tab, setTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editPlan, setEditPlan] = useState(null);
  const [toast, setToast] = useState(null);
  const [filterPlan, setFilterPlan] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", plan: "free" });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    const user = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      plan: newUser.plan,
      videoUsage: 0,
      postUsage: 0,
      projects: 0,
      joinedAt: new Date().toLocaleDateString("ja-JP"),
      lastActive: "今",
      status: "active",
    };
    setUsers(prev => [...prev, user]);
    setNewUser({ name: "", email: "", plan: "free" });
    setShowAddModal(false);
    showToast(`${user.name} を追加しました`);
  };

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const filteredUsers = filterPlan === "all" ? users : users.filter(u => u.plan === filterPlan);

  const totalStats = {
    users: users.length,
    active: users.filter(u => u.status === "active").length,
    videos: users.reduce((s, u) => s + u.videoUsage, 0),
    posts:  users.reduce((s, u) => s + u.postUsage, 0),
  };

  const handlePlanSave = (userId, newPlan) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
    showToast(`プランを${PLAN_META[newPlan].label}に変更しました`);
    setEditPlan(null);
  };

  const handleSuspend = (userId, userName) => {
    if (!window.confirm(`「${userName}」を利用停止にしますか？

利用停止後はPostaが利用できなくなります。`)) return;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "suspended" } : u));
    setSelectedUser(null);
    showToast(`${userName} を利用停止にしました`);
  };

  const handleReactivate = (userId, userName) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "active" } : u));
    showToast(`${userName} の利用を再開しました`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif", color: "#111827" }}>

      {toast && (
        <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: "#10b981", color: "#fff", padding: "11px 20px", borderRadius: "12px", fontWeight: 700, fontSize: "13px", zIndex: 500, boxShadow: "0 4px 20px #10b98140", whiteSpace: "nowrap", animation: "fadeDown 0.3s ease" }}>
          ✓ {toast}
        </div>
      )}

      {/* ヘッダー */}
      <div style={{ background: "#111827", padding: "0 20px", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #374151" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => navigate("/projects")} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#9ca3af" }}>←</button>
          <div style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.03em" }}>
            <span style={{ color: "#f97316" }}>Po</span>sta
          </div>
          <div style={{ width: "1px", height: "18px", background: "#374151" }} />
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#9ca3af" }}>管理者ダッシュボード</div>
          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: "#dc2626", color: "#fff" }}>🔐 Admin</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px 16px 60px" }}>

        {/* 統計カード */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
          {[
            ["👥", totalStats.users + "人",  "総ユーザー",   "#2563eb"],
            ["✅", totalStats.active + "人", "アクティブ",   "#059669"],
            ["🎬", totalStats.videos + "本", "総動画生成",   "#f97316"],
            ["📝", totalStats.posts + "件",  "総投稿文生成", "#7c3aed"],
          ].map(([icon, val, label, color]) => (
            <div key={label} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "20px" }}>{icon}</div>
              <div style={{ fontSize: "20px", fontWeight: 900, color, marginTop: "4px" }}>{val}</div>
              <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* タブ */}
        <div style={{ display: "flex", gap: "3px", background: "#e5e7eb", borderRadius: "12px", padding: "3px", marginBottom: "16px" }}>
          {[["users","ユーザー管理"],["videos","動画一覧"]].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "9px", borderRadius: "9px", border: "none",
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#111827" : "#9ca3af",
              fontWeight: 700, fontSize: "13px", cursor: "pointer",
              boxShadow: tab === t ? "0 1px 4px #0000001a" : "none",
            }}>{l}</button>
          ))}
        </div>

        {/* ユーザー管理タブ */}
        {tab === "users" && (
          <div>
            {/* ユーザー追加ボタン */}
            <button onClick={() => setShowAddModal(true)} style={{
              width: "100%", padding: "12px", borderRadius: "12px", border: "none", marginBottom: "12px",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "#fff", fontWeight: 800, fontSize: "14px", cursor: "pointer",
              boxShadow: "0 4px 14px #f9731633",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}>
              ＋ ユーザーを追加する
            </button>

            {/* フィルター */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px", overflowX: "auto", scrollbarWidth: "none" }}>
              {[["all","すべて"],["starter","Starter"],["pro","Pro"],["business","Business"]].map(([v, l]) => (
                <button key={v} onClick={() => setFilterPlan(v)} style={{
                  flexShrink: 0, padding: "6px 14px", borderRadius: "20px",
                  border: `1.5px solid ${filterPlan === v ? "#f97316" : "#e5e7eb"}`,
                  background: filterPlan === v ? "#fff7ed" : "#fff",
                  color: filterPlan === v ? "#f97316" : "#6b7280",
                  fontSize: "12px", fontWeight: 700, cursor: "pointer",
                }}>
                  {l}
                  <span style={{ marginLeft: "5px", fontSize: "10px", color: filterPlan === v ? "#f97316" : "#9ca3af" }}>
                    {v === "all" ? users.length : users.filter(u => u.plan === v).length}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredUsers.map(user => {
                const planMeta = PLAN_META[user.plan];
                const isEditing = editPlan === user.id;
                return (
                  <div key={user.id} style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
                    <div style={{ padding: "14px 16px" }}>
                      {/* ユーザーヘッダー */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: planMeta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                          👤
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                            <span style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>{user.name}</span>
                            <PlanBadge plan={user.plan} />
                            {(user.status === "inactive" || user.status === "suspended") && (
                              <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "20px", background: user.status === "suspended" ? "#fef2f2" : "#f3f4f6", color: user.status === "suspended" ? "#ef4444" : "#9ca3af" }}>
                                {user.status === "suspended" ? "🚫 利用停止中" : "非アクティブ"}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "11px", color: "#9ca3af" }}>{user.email} · 最終アクセス：{user.lastActive}</div>
                        </div>
                        <button onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)} style={{
                          padding: "6px 12px", borderRadius: "8px", border: "1px solid #e5e7eb",
                          background: "#fff", color: "#374151", fontWeight: 700, fontSize: "11px", cursor: "pointer",
                        }}>
                          {selectedUser === user.id ? "閉じる" : "詳細"}
                        </button>
                      </div>

                      {/* 使用状況 */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                        {[["動画生成", null, planMeta.videoLimit, planMeta.color, user.videoUsage], ["投稿文", user.postUsage + "件", null, "#374151", null], ["プロジェクト", user.projects + "個", null, "#374151", null]].map(([label, text, limit, color, usage]) => (
                          <div key={label} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "4px" }}>{label}</div>
                            {limit !== null ? (
                              <UsageBar usage={usage} limit={limit} color={color} />
                            ) : (
                              <div style={{ fontSize: "13px", fontWeight: 700, color }}>{text}</div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* 詳細展開 */}
                      {selectedUser === user.id && (
                        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #f3f4f6" }}>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#374151", marginBottom: "10px" }}>⚙️ プラン設定</div>

                          {isEditing ? (
                            <div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
                                {Object.entries(PLAN_META).map(([id, p]) => (
                                  <div key={id} onClick={() => {}} style={{
                                    display: "flex", alignItems: "center", gap: "10px",
                                    padding: "10px 12px", borderRadius: "10px", cursor: "pointer",
                                    border: `1.5px solid ${user.plan === id ? p.color : "#e5e7eb"}`,
                                    background: user.plan === id ? p.bg : "#fff",
                                  }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: "13px", fontWeight: 700, color: user.plan === id ? p.color : "#111827" }}>{p.label}</div>
                                      <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                                        {id === "starter" ? "動画なし" : `動画${p.videoLimit}本・最大${p.duration}秒`}
                                      </div>
                                    </div>
                                    {user.plan === id ? (
                                      <span style={{ fontSize: "10px", fontWeight: 700, color: p.color }}>現在</span>
                                    ) : (
                                      <button onClick={() => handlePlanSave(user.id, id)} style={{
                                        padding: "5px 12px", borderRadius: "8px", border: "none",
                                        background: p.color, color: "#fff", fontWeight: 700, fontSize: "11px", cursor: "pointer",
                                      }}>変更</button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <button onClick={() => setEditPlan(null)} style={{ width: "100%", padding: "9px", borderRadius: "9px", border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                                キャンセル
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              <button onClick={() => setEditPlan(user.id)} style={{
                                flex: 1, padding: "9px", borderRadius: "9px", border: "none",
                                background: "linear-gradient(135deg, #f97316, #ea580c)",
                                color: "#fff", fontWeight: 700, fontSize: "12px", cursor: "pointer",
                              }}>
                                プランを変更する
                              </button>
                              <button onClick={() => setTab("videos")} style={{
                                flex: 1, padding: "9px", borderRadius: "9px",
                                border: "1px solid #e5e7eb", background: "#fff",
                                color: "#374151", fontWeight: 700, fontSize: "12px", cursor: "pointer",
                              }}>
                                動画を見る
                              </button>
                            </div>
                          )}
                          <div style={{ marginTop: "8px" }}>
                              {user.status === "suspended" ? (
                                <button onClick={() => handleReactivate(user.id, user.name)} style={{
                                  width: "100%", padding: "9px", borderRadius: "9px", border: "none",
                                  background: "#ecfdf5", color: "#059669",
                                  fontWeight: 700, fontSize: "12px", cursor: "pointer",
                                  border: "1px solid #a7f3d0",
                                }}>
                                  ✅ 利用を再開する
                                </button>
                              ) : (
                                <button onClick={() => handleSuspend(user.id, user.name)} style={{
                                  width: "100%", padding: "9px", borderRadius: "9px", border: "none",
                                  background: "#fef2f2", color: "#ef4444",
                                  fontWeight: 700, fontSize: "12px", cursor: "pointer",
                                  border: "1px solid #fecaca",
                                }}>
                                  🚫 利用停止にする
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 動画一覧タブ */}
        {tab === "videos" && (
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "12px" }}>ユーザーごとの生成動画</div>
            {users.filter(u => VIDEO_HISTORY[u.id]).map(user => (
              <div key={user.id} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>{user.name}</span>
                  <PlanBadge plan={user.plan} />
                  <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "auto" }}>
                    {VIDEO_HISTORY[user.id].length}本
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {VIDEO_HISTORY[user.id].map(v => (
                    <div key={v.id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "12px 14px", display: "flex", alignItems: "center", gap: "12px" }}>
                      {/* サムネイル */}
                      <div style={{ width: "40px", height: "56px", borderRadius: "6px", background: `linear-gradient(135deg, ${v.thumb}cc, ${v.thumb}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                        🎬
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.topic}</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{v.project} · {v.platform}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>{v.duration}</div>
                        <div style={{ fontSize: "10px", color: "#9ca3af" }}>{v.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        @keyframes fadeDown { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </div>
  );
}
