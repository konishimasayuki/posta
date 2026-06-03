import { useState } from "react";
import { useNavigate } from "react-router-dom";

const WORKS = [
  { id: 1,  user: "カフェ Lumière",  avatar: "🍽", plan: "Pro",     likes: 114, liked: false, type: "video", duration: "15秒", platform: "TikTok",    accent: "#fe2c55", thumb: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80", title: "週末モーニングの朝",         prompt: "Warm cozy cafe interior, morning sunlight streaming through windows, steam rising from coffee cup, slow cinematic pan, 9:16 vertical", tags: ["カフェ","朝活","Vlog風"] },
  { id: 2,  user: "FitPro ジム",      avatar: "💪", plan: "Pro",     likes: 87,  liked: false, type: "video", duration: "60秒", platform: "Instagram", accent: "#f77737", thumb: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80", title: "30日間ビフォーアフター",      prompt: "Athletic transformation montage, gym training, before and after comparison, energetic fast cuts, motivational, 9:16 vertical", tags: ["筋トレ","変化","エネルギッシュ"] },
  { id: 3,  user: "Atelier Blanc",    avatar: "💅", plan: "Business",likes: 203, liked: true,  type: "video", duration: "30秒", platform: "Instagram", accent: "#f77737", thumb: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80", title: "オーガニックスキンケア",      prompt: "Elegant minimalist beauty product showcase, soft natural lighting, organic textures, slow reveal, luxury feel, 9:16 vertical", tags: ["美容","ナチュラル","ミニマル"] },
  { id: 4,  user: "旅人 Kenji",       avatar: "✈️", plan: "Starter", likes: 56,  liked: false, type: "video", duration: "15秒", platform: "TikTok",    accent: "#fe2c55", thumb: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80", title: "京都の朝散歩",               prompt: "Early morning Kyoto streets, traditional architecture, golden hour light, gentle walk through bamboo, cinematic vlog style, 9:16", tags: ["旅行","京都","Vlog"] },
  { id: 5,  user: "ECショップ Hana",  avatar: "🛍", plan: "Pro",     likes: 142, liked: false, type: "video", duration: "30秒", platform: "Instagram", accent: "#f77737", thumb: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80", title: "新作アクセサリー",            prompt: "Elegant jewelry product reveal, macro close-up, sparkling diamonds, dark luxury background, slow rotation, 9:16 vertical", tags: ["アクセサリー","商品PR","高級感"] },
  { id: 6,  user: "料理人 Sato",      avatar: "👨‍🍳", plan: "Pro",    likes: 98,  liked: true,  type: "video", duration: "60秒", platform: "TikTok",    accent: "#fe2c55", thumb: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80", title: "ラーメンの仕込み工程",       prompt: "Traditional ramen cooking process, close-up of ingredients, steam rising, chef hands preparing broth, warm kitchen atmosphere, 9:16", tags: ["料理","ラーメン","仕込み"] },
  { id: 7,  user: "ヨガ Misa",        avatar: "🧘", plan: "Starter", likes: 73,  liked: false, type: "video", duration: "15秒", platform: "Instagram", accent: "#f77737", thumb: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80", title: "朝ヨガルーティン",           prompt: "Peaceful morning yoga session, golden sunrise light, serene nature background, graceful movements, calm atmosphere, 9:16 vertical", tags: ["ヨガ","朝活","癒し"] },
  { id: 8,  user: "不動産 Tanaka",    avatar: "🏠", plan: "Business",likes: 167, liked: false, type: "video", duration: "60秒", platform: "YouTube",   accent: "#ff0000", thumb: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80", title: "新築マンション内覧",         prompt: "Luxury apartment interior tour, wide angle shots, modern furniture, natural light through large windows, smooth camera movement, 9:16", tags: ["不動産","内覧","高級"] },
];

const CATEGORIES = ["すべて", "カフェ", "フィットネス", "美容", "旅行", "料理", "EC"];

function WorkCard({ work, onLike, onUseTemplate }) {
  return (
    <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px #0000000a" }}>
      {/* サムネイル */}
      <div style={{ position: "relative", height: "180px", overflow: "hidden", background: "#f3f4f6" }}>
        <img src={work.thumb} alt={work.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        {/* 再生アイコン */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "14px", marginLeft: "2px" }}>▶</span>
        </div>
        {/* プラットフォーム・尺 */}
        <div style={{ position: "absolute", bottom: "8px", left: "8px", display: "flex", gap: "4px" }}>
          <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "10px", background: work.accent, color: "#fff" }}>{work.platform}</span>
          <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "10px", background: "rgba(0,0,0,0.6)", color: "#fff" }}>{work.duration}</span>
        </div>

        {/* プラン */}
        <div style={{ position: "absolute", top: "8px", right: "8px" }}>
          <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "10px", background: work.plan === "Business" ? "#7c3aed" : work.plan === "Pro" ? "#f97316" : "#6b7280", color: "#fff" }}>{work.plan}</span>
        </div>
      </div>

      <div style={{ padding: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
          <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: work.thumb + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>{work.avatar}</div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>{work.user}</span>
        </div>

        {/* タイトル */}
        <div style={{ fontSize: "13px", fontWeight: 800, color: "#111827", marginBottom: "8px" }}>{work.title}</div>

        {/* タグ */}
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "10px" }}>
          {work.tags.map(tag => (
            <span key={tag} style={{ fontSize: "9px", fontWeight: 600, padding: "2px 7px", borderRadius: "20px", background: "#f3f4f6", color: "#6b7280" }}>#{tag}</span>
          ))}
        </div>

        {/* アクション */}
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={() => onLike(work.id)} style={{
            flex: 1, padding: "8px", borderRadius: "10px",
            border: `1.5px solid ${work.liked ? "#ef4444" : "#e5e7eb"}`,
            background: work.liked ? "#fef2f2" : "#fff",
            color: work.liked ? "#ef4444" : "#6b7280",
            fontWeight: 700, fontSize: "12px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
          }}>
            {work.liked ? "❤️" : "🤍"} {work.likes}
          </button>
          <button onClick={() => onUseTemplate(work)} style={{
            flex: 2, padding: "8px", borderRadius: "10px", border: "none",
            background: "linear-gradient(135deg, #f97316, #ec4899)",
            color: "#fff", fontWeight: 700, fontSize: "11px", cursor: "pointer",
          }}>
            このテンプレで作る →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const navigate = useNavigate();

  const currentUser = (() => {
    try { return JSON.parse(sessionStorage.getItem("posta_user")); } catch { return null; }
  })();
  const isDemo = currentUser?.role === "demo";

  // 探索は全ユーザーが見れる（いいねはデモのみ全機能）
  const [works, setWorks] = useState(WORKS);
  const [category, setCategory] = useState("すべて");
  const [sort, setSort] = useState("popular");
  const [toast, setToast] = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const handleLike = (id) => {
    setWorks(ws => ws.map(w => w.id === id ? { ...w, liked: !w.liked, likes: w.liked ? w.likes - 1 : w.likes + 1 } : w));
  };

  const handleUseTemplate = (work) => {
    sessionStorage.setItem("posta_prompt_template", work.prompt);
    showToast("テンプレートを適用しました！");
    setTimeout(() => navigate("/generate"), 1000);
  };

  const sorted = [...works].sort((a, b) => sort === "popular" ? b.likes - a.likes : b.id - a.id);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif", color: "#111827", paddingBottom: "100px" }}>

      {toast && (
        <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: "#10b981", color: "#fff", padding: "11px 20px", borderRadius: "12px", fontWeight: 700, fontSize: "13px", zIndex: 500, boxShadow: "0 4px 20px #10b98140", whiteSpace: "nowrap" }}>
          ✓ {toast}
        </div>
      )}

      {/* ヘッダー */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.03em" }}>
            <span style={{ color: "#f97316" }}>Po</span>sta
          </div>
          <div style={{ width: "1px", height: "18px", background: "#e5e7eb" }} />
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>探索</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
            <button onClick={() => setSort(s => s === "popular" ? "new" : "popular")} style={{ fontSize: "11px", fontWeight: 700, padding: "5px 10px", borderRadius: "20px", border: "1px solid #e5e7eb", background: "#fff", color: "#374151", cursor: "pointer" }}>
              {sort === "popular" ? "🔥 人気順" : "🆕 新着順"}
            </button>
          </div>
        </div>

        {/* カテゴリフィルター */}
        <div style={{ maxWidth: "520px", margin: "0 auto", display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "12px", scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              flexShrink: 0, padding: "6px 14px", borderRadius: "20px",
              border: `1.5px solid ${category === cat ? "#f97316" : "#e5e7eb"}`,
              background: category === cat ? "#fff7ed" : "#fff",
              color: category === cat ? "#f97316" : "#6b7280",
              fontSize: "12px", fontWeight: 700, cursor: "pointer",
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* 統計バー */}
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "14px 16px 0" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          {[["🎬", "作品数", works.length + "本"], ["❤️", "総いいね", works.reduce((s,w) => s + w.likes, 0) + "件"], ["👥", "クリエイター", "8人"]].map(([icon, label, val]) => (
            <div key={label} style={{ flex: 1, background: "#fff", borderRadius: "12px", padding: "10px", border: "1px solid #e5e7eb", textAlign: "center" }}>
              <div style={{ fontSize: "16px" }}>{icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#111827" }}>{val}</div>
              <div style={{ fontSize: "9px", color: "#9ca3af" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* マソンリーグリッド */}
        <div style={{ columns: "2", gap: "10px" }}>
          {sorted.map(work => (
            <div key={work.id} style={{ breakInside: "avoid", marginBottom: "10px" }}>
              <WorkCard work={work} onLike={handleLike} onUseTemplate={handleUseTemplate} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
