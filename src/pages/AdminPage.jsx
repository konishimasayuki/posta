import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PLAN_META = {
  free:     { label: "Free",     color: "#059669", bg: "#ecfdf5", videoLimit: 3,   duration: 15 },
  starter:  { label: "Starter",  color: "#6b7280", bg: "#f9fafb", videoLimit: 10,  duration: 15 },
  pro:      { label: "Pro",      color: "#f97316", bg: "#fff7ed", videoLimit: 20,  duration: 60 },
  business: { label: "Business", color: "#7c3aed", bg: "#f5f3ff", videoLimit: 100, duration: 180 },
};

const INITIAL_USERS = [
  { id: 1, name: "山田 太郎",   email: "taro@example.com",    plan: "pro",      videoUsage: 8,  postUsage: 47, projects: 3, joinedAt: "2026/04/01", lastActive: "今日",   status: "active" },
  { id: 2, name: "鈴木 花子",   email: "hanako@example.com",  plan: "starter",  videoUsage: 0,  postUsage: 12, projects: 1, joinedAt: "2026/04/15", lastActive: "昨日",   status: "active" },
  { id: 3, name: "田中 商事",   email: "tanaka@corp.com",     plan: "business", videoUsage: 43, postUsage: 188,projects: 8, joinedAt: "2026/03/01", lastActive: "2時間前", status: "active" },
  { id: 4, name: "佐藤 美咲",   email: "misaki@salon.com",    plan: "pro",      videoUsage: 20, postUsage: 95, projects: 4, joinedAt: "2026/04/20", lastActive: "3日前",  status: "active" },
  { id: 5, name: "カフェ Lumi", email: "cafe@lumiere.com",    plan: "pro",      videoUsage: 15, postUsage: 63, projects: 2, joinedAt: "2026/05/01", lastActive: "今日",   status: "active" },
  { id: 6, name: "橋本 健一",   email: "kenichi@gym.com",     plan: "starter",  videoUsage: 0,  postUsage: 5,  projects: 1, joinedAt: "2026/05/10", lastActive: "1週間前", status: "inactive" },
  { id: 7, name: "デモユーザー", email: "demo",                plan: "pro",      videoUsage: 2,  postUsage: 8,  projects: 3, joinedAt: "2026/06/01", lastActive: "今日",   status: "active", isDemo: true },
];

const VIDEO_HISTORY = {
  1: [
    { id: 101, project: "カフェ Lumière", platform: "TikTok",    topic: "週末モーニング新メニュー", duration: "15秒", time: "2時間前", thumb: "#ea580c" },
    { id: 102, project: "FitPro",        platform: "Instagram", topic: "ビフォーアフター30日間",   duration: "60秒", time: "昨日",    thumb: "#dc2626" },
  ],
  3: [
    { id: 301, project: "ECサイトA",  platform: "Instagram", topic: "新商品ラインナップ", duration: "60秒", time: "今日",  thumb: "#7c3aed" },
    { id: 302, project: "飲食店B",    platform: "TikTok",    topic: "ランチメニュー紹介", duration: "60秒", time: "2日前", thumb: "#059669" },
  ],
};

function PlanBadge({ plan }) {
  const meta = PLAN_META[plan] || PLAN_META.free;
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
        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: "2px" }} />
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
  const [newUser, setNewUser] = useState({ name: "", email: "", loginId: "", password: "", plan: "free" });
  const [demoAccounts, setDemoAccounts] = useState([
    { id: 1, loginId: "posta", password: "0383", plan: "pro", name: "デモユーザー" },
  ]);
  const [newDemo, setNewDemo] = useState({ loginId: "", password: "", plan: "pro", name: "" });
  const [showDemoAdd, setShowDemoAdd] = useState(false);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const filteredUsers = filterPlan === "all" ? users : users.filter(u => u.plan === filterPlan);

  const totalStats = {
    users:  users.length,
    active: users.filter(u => u.status === "active").length,
    videos: users.reduce((s, u) => s + u.videoUsage, 0),
    posts:  users.reduce((s, u) => s + u.postUsage, 0),
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.loginId || !newUser.password) return;
    const user = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      loginId: newUser.loginId,
      password: newUser.password,
      plan: newUser.plan,
      videoUsage: 0,
      postUsage: 0,
      projects: 0,
      joinedAt: new Date().toLocaleDateString("ja-JP"),
      lastActive: "今",
      status: "active",
    };
    setUsers(prev => [...prev, user]);
    setNewUser({ name: "", email: "", loginId: "", password: "", plan: "free" });
    setShowAddModal(false);
    showToast(`${user.name} を追加しました`);
  };

  const handlePlanSave = (userId, newPlan) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
    showToast(`プランを${PLAN_META[newPlan].label}に変更しました`);
    setEditPlan(null);
  };

  const handleSuspend = (userId, userName) => {
    if (!window.confirm(`「${userName}」を利用停止にしますか？\n利用停止後はPostaが利用できなくなります。`)) return;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "suspended" } : u));
    setSelectedUser(null);
    showToast(`${userName} を利用停止にしました`);
  };

  const handleReactivate = (userId, userName) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "active" } : u));
    showToast(`${userName} の利用を再開しました`);
  };

  const handleAddDemo = () => {
    if (!newDemo.loginId || !newDemo.password) return;
    setDemoAccounts(prev => [...prev, { ...newDemo, id: Date.now() }]);
    setNewDemo({ loginId: "", password: "", plan: "pro", name: "" });
    setShowDemoAdd(false);
    showToast("デモアカウントを追加しました");
  };

  const handleDeleteDemo = (id) => {
    if (!window.confirm("このデモアカウントを削除しますか？")) return;
    setDemoAccounts(prev => prev.filter(a => a.id !== id));
    showToast("削除しました");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif", color: "#111827" }}>

      {toast && (
        <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: "#10b981", color: "#fff", padding: "11px 20px", borderRadius: "12px", fontWeight: 700, fontSize: "13px", zIndex: 500, boxShadow: "0 4px 20px #10b98140", whiteSpace: "nowrap" }}>
          ✓ {toast}
        </div>
      )}

      {/* ヘッダー */}
      <div style={{ background: "#111827", padding: "0 20px", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #374151" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          <div onClick={() => navigate("/projects")} style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.03em", cursor: "pointer" }}>
            <span style={{ color: "#f97316" }}>Po</span><span style={{ color: "#fff" }}>sta</span>
          </div>
          <div style={{ width: "1px", height: "18px", background: "#374151" }} />
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#9ca3af" }}>管理者ダッシュボード</div>
          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: "#dc2626", color: "#fff" }}>🔐 Admin</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px 16px 80px" }}>

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
          {[["users","ユーザー管理"],["videos","動画一覧"],["settings","設定"]].map(([t, l]) => (
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
            <button onClick={() => setShowAddModal(true)} style={{
              width: "100%", padding: "13px", borderRadius: "12px", border: "none", marginBottom: "12px",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "#fff", fontWeight: 800, fontSize: "14px", cursor: "pointer",
              boxShadow: "0 4px 14px #f9731633",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}>
              ＋ ユーザーを追加する
            </button>

            {/* フィルター */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px", overflowX: "auto", scrollbarWidth: "none" }}>
              {[["all","すべて"],["free","Free"],["starter","Starter"],["pro","Pro"],["business","Business"]].map(([v, l]) => (
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
                const planMeta = PLAN_META[user.plan] || PLAN_META.free;
                const isEditing = editPlan === user.id;
                return (
                  <div key={user.id} style={{ background: "#fff", borderRadius: "16px", border: `1.5px solid ${user.status === "suspended" ? "#fecaca" : "#e5e7eb"}`, overflow: "hidden" }}>
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: planMeta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                          {user.isDemo ? "🎭" : "👤"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>{user.name}</span>
                            <PlanBadge plan={user.plan} />
                            {user.isDemo && (
                              <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "20px", background: "#fef9c3", color: "#a16207" }}>🎭 デモ</span>
                            )}
                            {user.status === "suspended" && (
                              <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "20px", background: "#fef2f2", color: "#ef4444" }}>🚫 利用停止中</span>
                            )}
                            {user.status === "inactive" && (
                              <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "20px", background: "#f3f4f6", color: "#9ca3af" }}>非アクティブ</span>
                            )}
                          </div>
                          <div style={{ fontSize: "11px", color: "#9ca3af" }}>{user.email} · ID: {user.loginId || "-"} · 最終: {user.lastActive}</div>
                        </div>
                        <button onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)} style={{
                          padding: "6px 12px", borderRadius: "8px", border: "1px solid #e5e7eb",
                          background: "#fff", color: "#374151", fontWeight: 700, fontSize: "11px", cursor: "pointer", flexShrink: 0,
                        }}>
                          {selectedUser === user.id ? "閉じる" : "詳細"}
                        </button>
                      </div>

                      {/* 使用状況 */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "4px" }}>動画生成</div>
                          <UsageBar usage={user.videoUsage} limit={planMeta.videoLimit} color={planMeta.color} />
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "4px" }}>投稿文</div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>{user.postUsage}件</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "4px" }}>プロジェクト</div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>{user.projects}個</div>
                        </div>
                      </div>

                      {/* 詳細展開 */}
                      {selectedUser === user.id && (
                        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #f3f4f6" }}>
                          {isEditing ? (
                            <div>
                              <div style={{ fontSize: "12px", fontWeight: 800, color: "#374151", marginBottom: "10px" }}>プラン変更</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
                                {Object.entries(PLAN_META).map(([id, p]) => (
                                  <div key={id} style={{
                                    display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                                    borderRadius: "10px", cursor: "pointer",
                                    border: `1.5px solid ${user.plan === id ? p.color : "#e5e7eb"}`,
                                    background: user.plan === id ? p.bg : "#fff",
                                  }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: "13px", fontWeight: 700, color: user.plan === id ? p.color : "#111827" }}>{p.label}</div>
                                      <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                                        {id === "free" ? "動画3本・ショートのみ" : id === "starter" ? "動画10本・ショートのみ" : `動画${p.videoLimit}本・最大${p.duration}秒`}
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
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <div style={{ display: "flex", gap: "8px" }}>
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
                              {user.status === "suspended" ? (
                                <button onClick={() => handleReactivate(user.id, user.name)} style={{
                                  width: "100%", padding: "9px", borderRadius: "9px",
                                  border: "1px solid #a7f3d0", background: "#ecfdf5",
                                  color: "#059669", fontWeight: 700, fontSize: "12px", cursor: "pointer",
                                }}>
                                  ✅ 利用を再開する
                                </button>
                              ) : (
                                <button onClick={() => handleSuspend(user.id, user.name)} style={{
                                  width: "100%", padding: "9px", borderRadius: "9px",
                                  border: "1px solid #fecaca", background: "#fef2f2",
                                  color: "#ef4444", fontWeight: 700, fontSize: "12px", cursor: "pointer",
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
                  <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "auto" }}>{VIDEO_HISTORY[user.id].length}本</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {VIDEO_HISTORY[user.id].map(v => (
                    <div key={v.id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "12px 14px", display: "flex", alignItems: "center", gap: "12px" }}>
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

        {/* 設定タブ */}
        {tab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* デモアカウント管理 */}
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>🎭 デモアカウント管理</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>営業・デモ用のID・パスワードを管理</div>
                </div>
                <button onClick={() => setShowDemoAdd(true)} style={{ padding: "7px 12px", borderRadius: "9px", border: "none", background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                  ＋ 追加
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {demoAccounts.map(account => {
                  const meta = PLAN_META[account.plan] || PLAN_META.free;
                  return (
                    <div key={account.id} style={{ background: "#f8f9fb", borderRadius: "12px", padding: "12px 14px", border: "1px solid #e5e7eb" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{account.name || "デモユーザー"}</span>
                            <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "20px", background: meta.bg, color: meta.color }}>{meta.label}</span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>
                            ID: <strong style={{ color: "#111827" }}>{account.loginId}</strong>　
                            PW: <strong style={{ color: "#111827" }}>{account.password}</strong>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteDemo(account.id)} style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
                          削除
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {showDemoAdd && (
                <div style={{ marginTop: "12px", background: "#fff7ed", borderRadius: "12px", padding: "14px", border: "1px solid #fed7aa" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "10px" }}>新しいデモアカウント</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <input value={newDemo.name} onChange={e => setNewDemo(p => ({ ...p, name: e.target.value }))} placeholder="名前" style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                    <input value={newDemo.loginId} onChange={e => setNewDemo(p => ({ ...p, loginId: e.target.value }))} placeholder="ログインID（例：demo01）" style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                    <input value={newDemo.password} onChange={e => setNewDemo(p => ({ ...p, password: e.target.value }))} placeholder="パスワード" style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                    <div style={{ display: "flex", gap: "6px" }}>
                      {Object.entries(PLAN_META).map(([id, p]) => (
                        <div key={id} onClick={() => setNewDemo(prev => ({ ...prev, plan: id }))} style={{ flex: 1, padding: "7px 4px", borderRadius: "8px", textAlign: "center", cursor: "pointer", border: `1.5px solid ${newDemo.plan === id ? p.color : "#e5e7eb"}`, background: newDemo.plan === id ? p.bg : "#fff", fontSize: "10px", fontWeight: 700, color: newDemo.plan === id ? p.color : "#6b7280" }}>
                          {p.label}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => setShowDemoAdd(false)} style={{ flex: 1, padding: "9px", borderRadius: "9px", border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>キャンセル</button>
                      <button onClick={handleAddDemo} disabled={!newDemo.loginId || !newDemo.password} style={{ flex: 2, padding: "9px", borderRadius: "9px", border: "none", background: (!newDemo.loginId || !newDemo.password) ? "#e5e7eb" : "linear-gradient(135deg, #f97316, #ea580c)", color: (!newDemo.loginId || !newDemo.password) ? "#9ca3af" : "#fff", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                        追加する
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 管理者情報 */}
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "18px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#111827", marginBottom: "12px" }}>🔐 管理者アカウント</div>
              <div style={{ background: "#f8f9fb", borderRadius: "10px", padding: "12px 14px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  ID: <strong style={{ color: "#111827" }}>admin</strong>　
                  PW: <strong style={{ color: "#111827" }}>admin0383</strong>
                </div>
                <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "4px" }}>※ 本番実装時はパスワードを変更してください</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ユーザー追加モーダル */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }}
          onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div style={{ width: "100%", maxWidth: "520px", margin: "0 auto", background: "#fff", borderRadius: "24px 24px 0 0", padding: "24px 20px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#111827" }}>ユーザーを追加</div>
              <button onClick={() => setShowAddModal(false)} style={{ width: "30px", height: "30px", borderRadius: "50%", border: "none", background: "#f3f4f6", fontSize: "14px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "5px" }}>お名前 *</div>
                <input value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} placeholder="例：山田 太郎 / カフェ Lumière" style={{ width: "100%", padding: "11px 13px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "14px", outline: "none", fontFamily: "inherit", color: "#111827" }} />
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "5px" }}>メールアドレス *</div>
                <input type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="例：taro@example.com" style={{ width: "100%", padding: "11px 13px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "14px", outline: "none", fontFamily: "inherit", color: "#111827" }} />
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "5px" }}>ログインID *</div>
                <input value={newUser.loginId} onChange={e => setNewUser(p => ({ ...p, loginId: e.target.value }))} placeholder="例：yamada01" style={{ width: "100%", padding: "11px 13px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "14px", outline: "none", fontFamily: "inherit", color: "#111827" }} />
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "5px" }}>パスワード *</div>
                <input value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="例：1234" style={{ width: "100%", padding: "11px 13px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "14px", outline: "none", fontFamily: "inherit", color: "#111827" }} />
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>プラン</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[
                    ["free",     "Free",     "¥0",      "動画3本・Postaロゴ入り"],
                    ["starter",  "Starter",  "¥2,980",  "動画10本・ショートのみ"],
                    ["pro",      "Pro",      "¥9,800",  "動画20本・最大60秒"],
                    ["business", "Business", "¥29,800", "動画100本・最大3分"],
                  ].map(([id, label, price, desc]) => {
                    const sel = newUser.plan === id;
                    const meta = PLAN_META[id];
                    return (
                      <div key={id} onClick={() => setNewUser(p => ({ ...p, plan: id }))} style={{
                        display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px",
                        borderRadius: "10px", cursor: "pointer",
                        border: `1.5px solid ${sel ? meta.color : "#e5e7eb"}`,
                        background: sel ? meta.bg : "#fff",
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: sel ? meta.color : "#111827" }}>{label}</div>
                          <div style={{ fontSize: "11px", color: "#9ca3af" }}>{desc}</div>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: sel ? meta.color : "#374151" }}>{price}</div>
                        {sel && <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: meta.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff", fontWeight: 700 }}>✓</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ background: "#fff7ed", borderRadius: "10px", padding: "10px 12px", border: "1px solid #fed7aa" }}>
                <div style={{ fontSize: "11px", color: "#c2410c", fontWeight: 700, marginBottom: "2px" }}>💡 Tips</div>
                <div style={{ fontSize: "11px", color: "#92400e", lineHeight: 1.6 }}>Proプランを無料で付与して営業先に試してもらうのがおすすめ。使ってもらえれば継続率が高まります。</div>
              </div>
              <button onClick={handleAddUser} disabled={!newUser.name || !newUser.email || !newUser.loginId || !newUser.password} style={{
                width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                background: (!newUser.name || !newUser.email || !newUser.loginId || !newUser.password) ? "#e5e7eb" : "linear-gradient(135deg, #f97316, #ea580c)",
                color: (!newUser.name || !newUser.email || !newUser.loginId || !newUser.password) ? "#9ca3af" : "#fff",
                fontWeight: 800, fontSize: "14px", cursor: (!newUser.name || !newUser.email || !newUser.loginId || !newUser.password) ? "default" : "pointer",
              }}>
                ユーザーを追加する
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
