import { useNavigate, useLocation } from "react-router-dom";

const P_ICON = (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <defs>
      <clipPath id="l"><rect x="0" y="0" width="20" height="40"/></clipPath>
      <clipPath id="r"><rect x="20" y="0" width="20" height="40"/></clipPath>
    </defs>
    <path d="M11 8 L11 32 M11 8 L21 8 Q30 8 30 17 Q30 26 21 26 L11 26"
      stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" clipPath="url(#l)"/>
    <path d="M11 8 L11 32 M11 8 L21 8 Q30 8 30 17 Q30 26 21 26 L11 26"
      stroke="rgba(255,255,255,0.45)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" clipPath="url(#r)"/>
  </svg>
);

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const handleNavigate = (to) => {
    window.scrollTo(0, 0);
    navigate(to);
  };

  const isActive = (p) => path === p;

  const Tab = ({ to, icon, label }) => (
    <div onClick={() => handleNavigate(to)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "10px 0 6px", cursor: "pointer" }}>
      <span style={{ fontSize: "22px" }}>{icon}</span>
      <span style={{ fontSize: "10px", fontWeight: isActive(to) ? 700 : 400, color: isActive(to) ? "#f97316" : "#9ca3af" }}>{label}</span>
      {isActive(to) && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#f97316" }} />}
    </div>
  );

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(255, 247, 237, 0.92)",
      borderTop: "1px solid #fed7aa",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", display: "flex", alignItems: "center", paddingBottom: "6px" }}>

        <Tab to="/history" icon="🕐" label="履歴" />

        {/* 中央：ホーム */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div onClick={() => handleNavigate("/projects")} style={{
            width: "62px", height: "62px", borderRadius: "50%",
            background: "linear-gradient(135deg, #f97316, #ec4899)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginTop: "-26px", cursor: "pointer",
            boxShadow: "0 6px 24px rgba(249,115,22,0.4)",
            border: "3px solid #fff",
            transition: "transform 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            {P_ICON}
          </div>
        </div>

        <Tab to="/mypage" icon="👤" label="マイページ" />

      </div>
    </div>
  );
}
