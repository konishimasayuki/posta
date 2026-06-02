import { useState, useRef, useEffect, useCallback } from "react";

const PLATFORMS = [
  { id: "tiktok",    label: "TikTok",    icon: "🎵", accent: "#fe2c55", bg: "#fff0f3" },
  { id: "instagram", label: "Instagram", icon: "📸", accent: "#f77737", bg: "#fff7f0" },
  { id: "x",         label: "X",         icon: "𝕏",  accent: "#1d9bf0", bg: "#f0f8ff" },
  { id: "note",      label: "note",      icon: "📝", accent: "#41c9b4", bg: "#f0fdfb" },
];

const DUMMY_TEXTS = {
  tiktok: `【冒頭フック】
「え、これ本当に1時間でできたの？」

【本編】
✅ 今日の作業内容
→ Excelデータの整理・集計
→ 50行のデータをクリーニング

✅ かかった時間：約45分
✅ 今日の報酬：¥3,600

在宅ワーク、思ってたより全然いける。
remotyで仕事とって、好きな時間に稼ぐ生活、最高すぎる。

【CTA】
気になった人はプロフのリンクからチェックしてみて！

#在宅ワーク #副業 #スキマ時間 #remoty #データ入力 #在宅 #在宅副業 #フリーランス #収入アップ #副業初心者`,

  instagram: `📊 今日のお仕事記録

Excelのデータ整理をお任せいただきました✨
50行のデータクリーニング、約45分で完了！

💰 本日の報酬：¥3,600
⏰ 所要時間：45分
📍 作業場所：自宅のカフェスペース

スキマ時間を使って、こんな風に稼げるって知ってた？
remotyなら登録したその日から仕事が始められます🙌

#在宅ワーク #スキマ時間副業 #remoty #データ入力 #副業 #フリーランス女子 #在宅ワーカー #収入アップ #副業初心者`,

  x: `【パターン1】
Excelのデータ整理、45分で¥3,600。
スキマ時間って、こんな使い方もあるんだ。 #remoty #在宅ワーク

---
【パターン2】
「在宅で稼ぐ」って難しそうに聞こえるけど、今日やったのはExcelのデータ整理だけ。45分・¥3,600。案外誰でもできる。 #副業

---
【パターン3】
今日のremoty成果↓
✅ データ整理 45分
✅ 報酬 ¥3,600
✅ 場所 自宅
これが毎日積み重なる。 #在宅ワーク #remoty`,

  note: `【タイトル案】
① 「在宅ワーク1ヶ月目の正直な話」
② 「remotyを使って気づいた、時間の使い方が変わる瞬間」
③ 「データ入力だけで月収アップした話」

【書き出し】
「在宅で稼げる」という言葉を聞くたびに、どこか胡散臭さを感じていた。でも今日、Excelのデータを45分整理して¥3,600を手にしたとき、その感覚が少し変わった。`,
};

// ─── デモ動画をCanvasで生成 ───────────────────────────
function VideoCanvas({ platform, playing }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  const p = PLATFORMS.find(x => x.id === platform) || PLATFORMS[0];

  const colorMap = {
    tiktok:    ["#1a0010", "#3d0020"],
    instagram: ["#1a0800", "#3d1500"],
    x:         ["#00101a", "#00253d"],
    note:      ["#001a16", "#003d30"],
  };

  const draw = useCallback((ts) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    if (!startRef.current) startRef.current = ts;
    const t = ((ts - startRef.current) % 5000) / 5000;

    // 背景グラデ
    const [c1, c2] = colorMap[platform] || colorMap.tiktok;
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, c1); grad.addColorStop(1, c2);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    // パーティクル
    for (let i = 0; i < 8; i++) {
      const angle = t * Math.PI * 2 + i * Math.PI / 4;
      const r = Math.min(W, H) * 0.3;
      const x = W/2 + Math.cos(angle) * r;
      const y = H/2 + Math.sin(angle) * r * 0.6;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.accent + "88"; ctx.fill();
    }

    // グロー
    const glow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.4);
    glow.addColorStop(0, p.accent + "33"); glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    // 枠線
    ctx.strokeStyle = p.accent + "55"; ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, W-16, H-16);

    // プラットフォームアイコン
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = `bold ${W*0.12}px sans-serif`; ctx.textAlign = "center";
    ctx.fillText(p.icon, W/2, H * 0.38);

    // 波形アニメ
    ctx.beginPath(); ctx.strokeStyle = p.accent + "aa"; ctx.lineWidth = 2;
    for (let x2 = 0; x2 < W; x2++) {
      const y2 = H*0.55 + Math.sin((x2/W)*Math.PI*4 + t*Math.PI*6) * H*0.05;
      x2 === 0 ? ctx.moveTo(x2, y2) : ctx.lineTo(x2, y2);
    }
    ctx.stroke();

    // テキスト
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${W*0.07}px 'Noto Sans JP', sans-serif`;
    ctx.fillText(p.label, W/2, H*0.72);
    ctx.font = `${W*0.055}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("AI生成動画", W/2, H*0.82);

    // Posta ロゴ
    ctx.font = `bold ${W*0.055}px sans-serif`;
    ctx.fillStyle = p.accent + "cc";
    ctx.fillText("Posta", W/2, H-12);

    if (playing) rafRef.current = requestAnimationFrame(draw);
  }, [platform, playing]);

  useEffect(() => {
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (playing) rafRef.current = requestAnimationFrame(draw);
    else draw(0);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [platform, playing, draw]);

  return (
    <canvas ref={canvasRef} width={270} height={480}
      style={{ width: "135px", height: "240px", borderRadius: "12px", display: "block" }} />
  );
}

// ─── ローディングアニメーション ──────────────────────
function LoadingScreen({ steps, currentStep }) {
  return (
    <div style={{ padding: "32px 20px", textAlign: "center" }}>
      {/* スピナー */}
      <div style={{
        width: "56px", height: "56px", borderRadius: "50%",
        border: "3px solid #f3f4f6",
        borderTop: "3px solid #f97316",
        animation: "spin 0.8s linear infinite",
        margin: "0 auto 20px",
      }} />

      <div style={{ fontSize: "16px", fontWeight: 800, color: "#111827", marginBottom: "6px" }}>
        自動生成中...
      </div>
      <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "28px" }}>
        投稿文と動画を同時に生成しています
      </div>

      {/* ステップ */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", maxWidth: "280px", margin: "0 auto" }}>
        {steps.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div key={step} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 700,
                background: done ? "#10b981" : active ? "#f97316" : "#f3f4f6",
                color: done || active ? "#fff" : "#9ca3af",
                transition: "all 0.3s",
              }}>
                {done ? "✓" : i + 1}
              </div>
              <div style={{
                fontSize: "13px", fontWeight: done || active ? 700 : 400,
                color: done ? "#10b981" : active ? "#f97316" : "#9ca3af",
                transition: "all 0.3s",
              }}>
                {step}
                {active && <span style={{ animation: "blink 1s infinite" }}> ...</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── メイン ───────────────────────────────────────────
export default function GeneratePage() {
  const [selected, setSelected] = useState(["tiktok", "instagram"]);
  const [phase, setPhase] = useState("input");   // input | loading | result
  const [loadStep, setLoadStep] = useState(0);
  const [activeTab, setActiveTab] = useState("tiktok");
  const [copied, setCopied] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [downloaded, setDownloaded] = useState(false);
  const [duration, setDuration] = useState("short");
  const [netaTips, setNetaTips] = useState([]);
  const [netaTipsLoading, setNetaTipsLoading] = useState(false);
  const [neta, setNeta] = useState("");

  const LOAD_STEPS = [
    "ブランド設定を読み込み中",
    "投稿文を生成中",
    "動画プロンプトを生成中",
    "オリジナル動画を生成中",
    "仕上げ処理中",
  ];

  const toggle = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // ネタ候補をClaude APIで生成
  const generateNetaTips = async () => {
    setNetaTipsLoading(true);
    const today = new Date();
    const days = ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"];
    const months = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
    const dateStr = `${months[today.getMonth()]}${today.getDate()}日（${days[today.getDay()]}）`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          messages: [{
            role: "user",
            content: `あなたはSNS・動画コンテンツの専門プランナーです。以下のブランド設定と今日の日付をもとに、SNS・動画投稿のネタ候補を4つ提案してください。

今日：${dateStr}
ブランド名：カフェ Lumière
業種：飲食・カフェ
動画スタイル：Vlog風
目的：集客（近隣30〜40代女性・ファミリーに来店促進）
ターゲット：30〜40代女性・ファミリー

条件：
- このブランドに合うネタだけを選ぶ（存在しない設定は出さない）
- 今日の曜日・季節・日付を必ず考慮して毎日違うネタにする
- 各ネタは「そのまま動画・投稿文の素材として使える」くらい具体的に書く
- 曖昧な表現NG。「何を見せるか」「誰に向けて」「なぜ今日なのか」を含める
- 絵文字を先頭に1つつける
- 各ネタは60〜100文字程度で記述

JSONのみ出力（前後の説明・バッククォート不要）：
{"tips": ["🌧 具体的なネタ内容...", "☕ 具体的なネタ内容...", "📸 具体的なネタ内容...", "✨ 具体的なネタ内容..."]}`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("").trim();
      const clean = text.replace(/\`\`\`json|\`\`\`/g, "").trim();
      const parsed = JSON.parse(clean);
      setNetaTips(parsed.tips || []);
    } catch {
      // フォールバック：日付ベースで固定候補
      const day = today.getDay();
      const fallbacks = [
        [
          "🌅 日曜の朝だからこそ刺さる「ゆっくりブランチ」提案。週末に特別感を演出したい30〜40代女性に向けて、テーブルセッティングとドリンクを丁寧に見せるVlogを撮影してみては。",
          "☕ 仕込みの裏側をリアルに見せるネタ。開店前のコーヒー豆を挽く音・香り・こだわりを30秒で伝えるだけで「このカフェに行きたい」と思わせられる。",
          "🍰 今週の新作スイーツを実食レポ形式で。「どんな素材を使ったか」「どんな人に食べてほしいか」まで話すと情報量が増えてコメントが増えやすい。",
          "📍 初めて来るお客様向けの「アクセス動画」。駅から徒歩ルートを歩きながら撮影するだけで、来店のハードルが下がり予約・来店につながりやすい。"
        ],
        [
          "📅 月曜の朝という「憂鬱な時間帯」に刺さるネタ。「週明けはここのカフェで始めよう」というコンセプトで、静かな店内・温かいコーヒー・朝の光を映したVlog。",
          "☕ モーニングセットの「見せ方」を変えるネタ。価格・内容だけでなく「誰と・どんな気持ちで食べてほしいか」をナレーションで伝えると共感が得やすい。",
          "🌿 今週仕入れた季節食材をそのまま紹介するネタ。市場や農家から届いた新鮮な素材をカメラの前で見せるだけで「こだわりのある店」という印象を与えられる。",
          "✨ 先週来てくれたお客様への感謝を込めた投稿。具体的なエピソード（「常連さんが誕生日に来てくれた」など）を話すと人間味が出てファンが増える。"
        ],
        [
          "🌸 火曜日の「静かな午後」をテーマにしたネタ。混んでいない平日の穴場時間帯をあえて紹介することで、ゆっくり来たいお客様にリーチできる。",
          "📷 テラス席の今日の様子をそのまま撮影。天気・植物・光の加減をそのまま見せるだけで「今すぐ行きたい」という衝動を引き出せる。",
          "🧁 手作りスコーンの製造工程を30秒Vlogに。こねる・焼く・盛り付けるの流れを見せることで「手作りの温かさ」が伝わり来店動機になる。",
          "💬 よくある質問「予約はできますか？」「駐車場はありますか？」に動画で答えるネタ。SEO効果もあり、初来店のハードルを下げられる。"
        ],
        [
          "🍽 ランチメニューの「今日のおすすめ」を実食形式で紹介。食べた瞬間の表情・感想をリアルに伝えることで、見た人が「食べてみたい」と感じやすくなる。",
          "☀️ 「今日も営業しています」ではなく「今日の空席状況と今日のおすすめ」をセットで伝えるネタ。来店の意思決定に必要な情報をすべて1本に入れる。",
          "🫖 紅茶のラインナップを紹介するネタ。種類ごとの特徴・おすすめの飲み方・合うフードを話しながら見せることで、紅茶好きの新規層にリーチできる。",
          "🏡 「カフェ選びで迷ったらここ」という切り口で店内の魅力を伝えるネタ。ソファ席・テーブル席・テラス席それぞれの雰囲気を30秒で見せるツアー動画。"
        ],
        [
          "🎉 週末限定メニューの先行発表ネタ。「明日から2日間だけ」という希少性と「どんな素材を使ったか」という情報を組み合わせると予約・来店促進になる。",
          "🌙 夕方〜夜の「ゆったりタイム」をテーマにしたネタ。照明・音楽・静かな雰囲気を映像で伝えることで、仕事帰りの30〜40代女性へのアプローチができる。",
          "👩‍🍳 食材へのこだわりを語るネタ。「どこから仕入れているか」「なぜこの素材を選んだか」をオーナー自身が話すことで信頼感と個性が伝わる。",
          "💝 「ご来店ありがとう」の気持ちを込めたネタ。今週印象に残ったシーン・お客様との会話（許可を得た上で）をVlogに収めることで、温かみのあるブランドイメージを作れる。"
        ],
        [
          "🎊 土曜の朝という特別感を最大限に活かすネタ。「今日だけの特別モーニング」を前面に出し、普段より少しリッチな朝食シーンを撮影することで週末来店を促進。",
          "🌺 土曜限定プレートの「誕生ストーリー」を語るネタ。なぜこのメニューを作ったか・どんな人に食べてほしいかを話すだけで、メニューへの愛着と共感を生み出せる。",
          "📸 「今日の1枚」として店内の一番好きな景色を切り取るネタ。毎週土曜にこれをやると定点観測的なコンテンツになり継続視聴者が増えやすい。",
          "🏡 「週末の過ごし方、Lumièreはいかがですか」という提案型ネタ。近隣のスポットと組み合わせた「半日コース」を紹介することで新しい層にリーチできる。"
        ],
        [
          "🌞 日曜ブランチを「今週一番のご褒美時間」として提案するネタ。家族連れ・カップル・一人時間それぞれの楽しみ方を見せることでファミリー層にも届く。",
          "☕ 「週末だけ」出す特別なコーヒーを紹介するネタ。産地・焙煎度・おすすめの飲み方をていねいに話すことで、コーヒー好きの新規フォロワー獲得につながる。",
          "🍃 今週使った旬の素材まとめネタ。「今週はこんな食材を使いました」というふりかえり形式は作りやすく、毎週続けることでブランドの誠実さが伝わる。",
          "✨ 来週の予告ネタ。「来週月曜から新メニュー登場」「来週末はイベントあり」という情報を日曜の夜に出すことで、月曜以降の来店につなげるフックになる。"
        ],
      ];
      setNetaTips(fallbacks[day] || fallbacks[0]);
    }
    setNetaTipsLoading(false);
  };

  const handleGenerate = () => {
    setPhase("loading");
    setLoadStep(0);
    let step = 0;
    const delays = [800, 1200, 800, 2000, 600];
    const next = () => {
      step++;
      setLoadStep(step);
      if (step < LOAD_STEPS.length) {
        setTimeout(next, delays[step]);
      } else {
        setTimeout(() => {
          setPhase("result");
          setActiveTab(selected[0]);
        }, 500);
      }
    };
    setTimeout(next, delays[0]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(DUMMY_TEXTS[activeTab] || "");
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const currentPlatform = PLATFORMS.find(p => p.id === activeTab);
  const selectedPlatforms = PLATFORMS.filter(p => selected.includes(p.id));

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif", color: "#111827" }}>

      {/* ヘッダー */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          {phase === "result" && (
            <button onClick={() => setPhase("input")} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#6b7280" }}>←</button>
          )}
          <div style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.03em" }}>
            <span style={{ color: "#f97316" }}>Po</span>sta
          </div>
          <div style={{ width: "1px", height: "18px", background: "#e5e7eb" }} />
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>
            {phase === "input" ? "SNS投稿内容を生成" : phase === "loading" ? "自動生成中..." : "生成完了"}
          </div>
          {phase === "result" && (
            <div style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 700, background: "#ecfdf5", color: "#059669", padding: "3px 10px", borderRadius: "20px", border: "1px solid #a7f3d0" }}>
              ✓ 生成完了
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "16px 16px 80px" }}>

        {/* ── INPUT ── */}
        {phase === "input" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* プロジェクト */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff7ed", borderRadius: "12px", padding: "12px 14px", border: "1px solid #fed7aa" }}>
              <span style={{ fontSize: "22px" }}>🍽</span>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#f97316" }}>カフェ Lumière</div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>あたたかみ · Vlog風 · 落ち着き系BGM</div>
              </div>
            </div>

            {/* 写真・動画素材 */}
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                📷 写真・動画素材 <span style={{ color: "#9ca3af", fontWeight: 400 }}>最大5枚・任意</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {/* ダミーアップロード済み画像 */}
                {["☀️", "☕"].map((emoji, i) => (
                  <div key={i} style={{ width: "64px", height: "64px", borderRadius: "10px", background: "#fff7ed", border: "1.5px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", position: "relative" }}>
                    {emoji}
                    <div style={{ position: "absolute", top: "-5px", right: "-5px", width: "16px", height: "16px", borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✕</div>
                  </div>
                ))}
                <label style={{ width: "64px", height: "64px", borderRadius: "10px", border: "2px dashed #d1d5db", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9ca3af", fontSize: "20px", gap: "2px" }}>
                  ＋<span style={{ fontSize: "9px" }}>3枚</span>
                </label>
              </div>
            </div>

            {/* ネタ入力 */}
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>
                  📝 今日のネタ <span style={{ color: "#9ca3af", fontWeight: 400 }}>空ならAIが考える</span>
                </div>
              </div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#f97316", marginBottom: "8px", background: "#fff7ed", padding: "6px 10px", borderRadius: "8px", border: "1px solid #fed7aa", lineHeight: 1.6 }}>
                💡 具体的に書くほど、クオリティの高い動画・投稿文が生成されます。<br />
                <span style={{ color: "#9ca3af", fontWeight: 400 }}>例：「新メニューのパンケーキ3種を追加。30代女性に特に反響大」</span>
              </div>
              <textarea value={neta} onChange={e => setNeta(e.target.value)} rows={3}
                placeholder="ここにネタを入力、または下の候補から選ぶ"
                style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "13px", outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.7, color: "#111827" }} />

              {/* ネタ候補 */}
              <div style={{ marginTop: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>
                    💡 今日のネタ候補
                    <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 400, marginLeft: "6px" }}>
                      ブランド設定×今日の日付でAIが生成
                    </span>
                  </div>
                  <button onClick={generateNetaTips} disabled={netaTipsLoading} style={{
                    fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px",
                    border: "1px solid #f97316", background: netaTipsLoading ? "#f3f4f6" : "#fff7ed",
                    color: netaTipsLoading ? "#9ca3af" : "#f97316", cursor: netaTipsLoading ? "default" : "pointer",
                    display: "flex", alignItems: "center", gap: "4px",
                  }}>
                    {netaTipsLoading
                      ? <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span> 生成中</>
                      : netaTips.length > 0 ? "🔄 更新" : "✨ 候補を生成"
                    }
                  </button>
                </div>

                {netaTips.length === 0 && !netaTipsLoading && (
                  <div style={{ textAlign: "center", padding: "16px", background: "#f9fafb", borderRadius: "10px", border: "1px dashed #e5e7eb" }}>
                    <div style={{ fontSize: "20px", marginBottom: "4px" }}>🤖</div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>「候補を生成」でAIがブランドに合ったネタを提案します</div>
                  </div>
                )}

                {netaTipsLoading && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ height: "52px", borderRadius: "10px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite" }} />
                    ))}
                  </div>
                )}

                {netaTips.length > 0 && !netaTipsLoading && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {netaTips.map((tip, i) => (
                      <button key={i} onClick={() => setNeta(tip)} style={{
                        padding: "11px 12px", borderRadius: "10px", cursor: "pointer", textAlign: "left",
                        border: `1.5px solid ${neta === tip ? "#f97316" : "#e5e7eb"}`,
                        background: neta === tip ? "#fff7ed" : "#f9fafb",
                        color: neta === tip ? "#c2410c" : "#374151",
                        fontSize: "12px", fontWeight: 500,
                        lineHeight: 1.7, transition: "all 0.15s",
                        fontFamily: "inherit",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                          <span style={{ flex: 1 }}>{tip}</span>
                          {neta === tip && <span style={{ fontSize: "10px", fontWeight: 700, color: "#f97316", flexShrink: 0, marginTop: "2px" }}>選択中 ✓</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* プラットフォーム */}
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "10px" }}>
                📱 投稿先を選択 <span style={{ color: "#9ca3af", fontWeight: 400 }}>複数OK</span>
              </div>
              <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                {PLATFORMS.map(p => {
                  const sel = selected.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => toggle(p.id)} style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "8px 14px", borderRadius: "20px",
                      border: `1.5px solid ${sel ? p.accent : "#e5e7eb"}`,
                      background: sel ? p.bg : "#fff",
                      color: sel ? p.accent : "#6b7280",
                      fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                    }}>
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                      {sel && <span style={{ fontSize: "9px", background: p.accent, color: "#fff", borderRadius: "50%", width: "14px", height: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>}
                    </button>
                  );
                })}
              </div>
              {selected.length > 0 && (
                <div style={{ marginTop: "10px", fontSize: "11px", color: "#9ca3af" }}>
                  {selected.length}媒体を選択 · 動画と投稿文を同時に生成します
                </div>
              )}
            </div>

            {/* 動画の長さ */}
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "10px" }}>⏱ 動画の長さ</div>
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { id: "short",  label: "ショート",     sub: "〜15秒",   desc: "Shorts/Reels向け", icon: "⚡" },
                  { id: "medium", label: "スタンダード",  sub: "30〜60秒", desc: "SNS標準",          icon: "▶" },
                  { id: "long",   label: "ロング",        sub: "1〜3分",   desc: "解説・Vlog向け",  icon: "🎬" },
                ].map(d => (
                  <div key={d.id} onClick={() => setDuration(d.id)} style={{
                    flex: 1, padding: "12px 8px", borderRadius: "12px", cursor: "pointer", textAlign: "center",
                    border: `1.5px solid ${duration === d.id ? "#f97316" : "#e5e7eb"}`,
                    background: duration === d.id ? "#fff7ed" : "#fff",
                    transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: "18px", marginBottom: "3px" }}>{d.icon}</div>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: duration === d.id ? "#f97316" : "#111827" }}>{d.label}</div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: duration === d.id ? "#f97316" : "#374151", marginTop: "1px" }}>{d.sub}</div>
                    <div style={{ fontSize: "9px", color: "#9ca3af", marginTop: "2px" }}>{d.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 生成ボタン */}
            <button onClick={handleGenerate} disabled={selected.length === 0}
              style={{
                width: "100%", padding: "16px", borderRadius: "14px", border: "none",
                background: selected.length > 0 ? "linear-gradient(135deg, #f97316, #ea580c)" : "#e5e7eb",
                color: selected.length > 0 ? "#fff" : "#9ca3af",
                fontWeight: 800, fontSize: "15px", cursor: selected.length > 0 ? "pointer" : "default",
                boxShadow: selected.length > 0 ? "0 6px 20px #f9731644" : "none",
                transition: "all 0.2s",
              }}>
              ✨ 動画と投稿文を自動生成する
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {phase === "loading" && (
          <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #e5e7eb", marginTop: "20px" }}>
            <LoadingScreen steps={LOAD_STEPS} currentStep={loadStep} />
          </div>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && currentPlatform && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>

            {/* ── 動画（上部） ── */}
            <div style={{
              background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb",
              padding: "16px", marginBottom: "12px",
            }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#374151", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                🎬 生成された動画
                <span style={{ fontSize: "10px", fontWeight: 600, color: "#9ca3af", fontWeight: 400 }}>· Kling AI · 9:16</span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
                  <span style={{ fontSize: "10px", color: "#10b981", fontWeight: 700 }}>生成完了</span>
                </div>
              </div>

              {/* 動画プレビュー + DLボタン */}
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                {/* Canvas動画 */}
                <div style={{
                  borderRadius: "12px", overflow: "hidden", flexShrink: 0,
                  boxShadow: `0 6px 24px ${currentPlatform.accent}33`,
                  border: `2px solid ${currentPlatform.accent}44`,
                  position: "relative",
                }}>
                  <VideoCanvas platform={activeTab} playing={videoPlaying} />
                  {/* 再生ボタン */}
                  <button onClick={() => setVideoPlaying(p => !p)} style={{
                    position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)",
                    background: "rgba(0,0,0,0.6)", color: "#fff", border: "none",
                    borderRadius: "20px", padding: "4px 10px", fontSize: "10px",
                    fontWeight: 700, cursor: "pointer", backdropFilter: "blur(4px)",
                  }}>
                    {videoPlaying ? "⏸" : "▶"} {videoPlaying ? "停止" : "再生"}
                  </button>
                </div>

                {/* 動画情報 + DL */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
                    {currentPlatform.icon} {currentPlatform.label}用
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "12px" }}>
                    {[["サイズ", "1080×1920"], ["形式", "MP4 / H.264"], ["尺", "約30秒"], ["比率", "9:16"]].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                        <span style={{ color: "#9ca3af" }}>{k}</span>
                        <span style={{ fontWeight: 700, color: "#374151" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setDownloaded(true); setTimeout(() => setDownloaded(false), 2000); }} style={{
                    width: "100%", padding: "9px", borderRadius: "9px", border: "none",
                    background: downloaded ? "#10b981" : `linear-gradient(135deg, ${currentPlatform.accent}, ${currentPlatform.accent}cc)`,
                    color: "#fff", fontWeight: 700, fontSize: "11px", cursor: "pointer", transition: "all 0.2s",
                  }}>
                    {downloaded ? "✓ DL完了" : "⬇ 動画をDL"}
                  </button>

                  {/* 他のSNS用サイズDL */}
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "5px" }}>他サイズで出力</div>
                    {[["1:1", "Instagram投稿"], ["16:9", "YouTube・X"]].map(([ratio, label]) => (
                      <button key={ratio} style={{ width: "100%", marginBottom: "4px", padding: "6px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151", fontSize: "10px", fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                        {ratio} — {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 投稿文 タブ（下部） ── */}
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
              {/* タブ */}
              <div style={{ display: "flex", gap: "0", background: "#f3f4f6", padding: "3px", margin: "12px 12px 0", borderRadius: "11px", overflowX: "auto" }}>
                {selectedPlatforms.map(p => (
                  <button key={p.id} onClick={() => setActiveTab(p.id)} style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                    padding: "7px 10px", borderRadius: "8px", border: "none",
                    background: activeTab === p.id ? "#fff" : "transparent",
                    color: activeTab === p.id ? p.accent : "#9ca3af",
                    fontWeight: 700, fontSize: "11px", cursor: "pointer",
                    boxShadow: activeTab === p.id ? "0 1px 4px #0000001a" : "none",
                    transition: "all 0.2s", flexShrink: 0,
                  }}>
                    <span style={{ fontSize: "13px" }}>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>

              {/* 投稿文ヘッダー */}
              <div style={{
                padding: "12px 16px 10px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderBottom: `1px solid ${currentPlatform.accent}22`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <span style={{ fontSize: "16px" }}>{currentPlatform.icon}</span>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#111827" }}>{currentPlatform.label}用投稿文</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, background: currentPlatform.bg, color: currentPlatform.accent, padding: "2px 7px", borderRadius: "20px" }}>
                    {activeTab === "tiktok" ? "台本形式" : activeTab === "x" ? "3パターン" : activeTab === "instagram" ? "キャプション" : "ブログ記事"}
                  </span>
                </div>
                <button onClick={handleCopy} style={{
                  padding: "6px 14px", borderRadius: "8px", border: "none",
                  background: copied ? "#10b981" : currentPlatform.accent,
                  color: "#fff", fontWeight: 700, fontSize: "11px", cursor: "pointer", transition: "all 0.2s",
                }}>
                  {copied ? "✓ コピー済み" : "📋 コピー"}
                </button>
              </div>

              {/* 投稿文本文 */}
              <div style={{ padding: "14px 16px", fontSize: "12px", lineHeight: 1.9, color: "#374151", whiteSpace: "pre-wrap", maxHeight: "220px", overflowY: "auto" }}>
                {DUMMY_TEXTS[activeTab]}
              </div>

              {/* ページインジケーター */}
              <div style={{ display: "flex", justifyContent: "center", gap: "5px", padding: "10px 0 14px" }}>
                {selectedPlatforms.map(p => (
                  <div key={p.id} onClick={() => setActiveTab(p.id)} style={{
                    width: activeTab === p.id ? "18px" : "5px", height: "5px", borderRadius: "3px",
                    background: activeTab === p.id ? currentPlatform.accent : "#d1d5db",
                    cursor: "pointer", transition: "all 0.2s",
                  }} />
                ))}
              </div>
            </div>

            {/* 再生成 */}
            <button onClick={() => setPhase("input")} style={{
              width: "100%", marginTop: "10px", padding: "12px", borderRadius: "12px",
              border: "1.5px solid #e5e7eb", background: "#fff",
              color: "#374151", fontWeight: 700, fontSize: "13px", cursor: "pointer",
            }}>
              ↩ 別ネタで再生成する
            </button>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </div>
  );
}
