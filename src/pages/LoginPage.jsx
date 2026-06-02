import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1400);
  };

  const Field = ({ label, type = "text", value, onChange, placeholder }) => {
    const [focused, setFocused] = useState(false);
    return (
      <div style={{ marginBottom: "14px" }}>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "5px" }}>{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: "10px", fontSize: "14px",
            border: `1.5px solid ${focused ? "#f97316" : "#e5e7eb"}`,
            outline: "none", fontFamily: "inherit", color: "#111827",
            boxShadow: focused ? "0 0 0 3px #f9731618" : "none", transition: "all 0.2s",
          }} />
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>

      {/* ロゴ */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <div style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "6px" }}>
          <span style={{ color: "#f97316" }}>Po</span>sta
        </div>
        <div style={{ fontSize: "12px", color: "#9ca3af", letterSpacing: "0.1em" }}>AI VIDEO & SNS GENERATOR</div>
      </div>

      <div style={{ width: "100%", maxWidth: "400px", background: "#fff", borderRadius: "20px", border: "1px solid #e5e7eb", padding: "28px 28px 24px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

        {/* タブ */}
        {mode !== "forgot" && (
          <div style={{ display: "flex", gap: "3px", background: "#f3f4f6", borderRadius: "10px", padding: "3px", marginBottom: "24px" }}>
            {[["login", "ログイン"], ["signup", "新規登録"]].map(([m, l]) => (
              <button key={m} onClick={() => { setMode(m); setDone(false); }} style={{
                flex: 1, padding: "9px", borderRadius: "8px", border: "none",
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#111827" : "#9ca3af",
                fontWeight: 700, fontSize: "13px", cursor: "pointer",
                boxShadow: mode === m ? "0 1px 4px #0000001a" : "none",
                transition: "all 0.2s",
              }}>{l}</button>
            ))}
          </div>
        )}

        {/* forgot */}
        {mode === "forgot" && (
          <div style={{ marginBottom: "20px" }}>
            <button onClick={() => setMode("login")} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "13px", cursor: "pointer", padding: 0, marginBottom: "12px" }}>← ログインに戻る</button>
            <div style={{ fontSize: "17px", fontWeight: 900, color: "#111827", marginBottom: "4px" }}>パスワードをお忘れの方</div>
            <div style={{ fontSize: "12px", color: "#9ca3af" }}>登録済みのメールアドレスにリセットリンクを送ります</div>
          </div>
        )}

        {done && mode === "forgot" ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📬</div>
            <div style={{ fontSize: "15px", fontWeight: 800, marginBottom: "6px" }}>メールを送信しました</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", lineHeight: 1.7 }}>{email} にリセットリンクを送りました。メールをご確認ください。</div>
            <button onClick={() => { setMode("login"); setDone(false); }} style={{ marginTop: "16px", fontSize: "13px", color: "#f97316", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>ログインへ →</button>
          </div>
        ) : done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
            <div style={{ fontSize: "15px", fontWeight: 800, marginBottom: "6px" }}>{mode === "signup" ? "登録完了！" : "ログイン成功！"}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af" }}>Postaへようこそ。プロジェクトを作成しましょう。</div>
            <div style={{ marginTop: "16px", padding: "12px", background: "#fff7ed", borderRadius: "10px", border: "1px solid #fed7aa", fontSize: "12px", color: "#c2410c", fontWeight: 600 }}>
              → プロジェクト一覧へリダイレクト中...
            </div>
          </div>
        ) : (
          <>
            {mode === "signup" && <Field label="お名前" value={name} onChange={setName} placeholder="山田 太郎" />}
            <Field label="メールアドレス" type="email" value={email} onChange={setEmail} placeholder="taro@example.com" />
            {mode !== "forgot" && <Field label="パスワード" type="password" value={password} onChange={setPassword} placeholder="8文字以上" />}

            {mode === "login" && (
              <div style={{ textAlign: "right", marginTop: "-8px", marginBottom: "16px" }}>
                <button onClick={() => { setMode("forgot"); setDone(false); }} style={{ fontSize: "12px", color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>
                  パスワードをお忘れの方
                </button>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading || !email || (mode !== "forgot" && !password)} style={{
              width: "100%", padding: "14px", borderRadius: "12px", border: "none",
              background: (!email || (mode !== "forgot" && !password)) ? "#e5e7eb" : "linear-gradient(135deg, #f97316, #ea580c)",
              color: (!email || (mode !== "forgot" && !password)) ? "#9ca3af" : "#fff",
              fontWeight: 800, fontSize: "14px", cursor: "pointer",
              boxShadow: email ? "0 4px 16px #f9731633" : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              transition: "all 0.2s",
            }}>
              {loading
                ? <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span> 処理中...</>
                : mode === "login" ? "ログイン →" : mode === "signup" ? "アカウントを作成 →" : "リセットリンクを送る"
              }
            </button>

            {/* Google / Apple */}
            {mode !== "forgot" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "18px 0" }}>
                  <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>または</span>
                  <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[["G", "Googleで続ける", "#fff", "#374151", "#e5e7eb"], ["🍎", "Appleで続ける", "#000", "#fff", "#000"]].map(([icon, label, bg, color, border]) => (
                    <button key={label} style={{
                      flex: 1, padding: "11px", borderRadius: "10px", border: `1.5px solid ${border}`,
                      background: bg, color: color, fontWeight: 700, fontSize: "12px", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                    }}>
                      <span style={{ fontSize: "14px" }}>{icon}</span>{label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* フッター */}
      <div style={{ marginTop: "20px", fontSize: "11px", color: "#9ca3af", textAlign: "center", lineHeight: 1.8 }}>
        ログインすることで<span style={{ color: "#374151", cursor: "pointer" }}>利用規約</span>・<span style={{ color: "#374151", cursor: "pointer" }}>プライバシーポリシー</span>に同意したものとみなします
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
