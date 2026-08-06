import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CaptionOverlay from "../components/CaptionOverlay.jsx";
import { resolveAccent, resolveFont } from "../lib/fonts.js";

const PLATFORMS = [
  { id: "tiktok",    label: "TikTok",    icon: "🎵", accent: "#fe2c55", bg: "#fff0f3" },
  { id: "instagram", label: "Instagram", icon: "📸", accent: "#f77737", bg: "#fff7f0" },
  { id: "x",         label: "X",         icon: "𝕏",  accent: "#1d9bf0", bg: "#f0f8ff" },
  { id: "note",      label: "note",      icon: "📝", accent: "#41c9b4", bg: "#f0fdfb" },
];

const ROLE_META = {
  hook:  { label: "引き",   color: "#2563eb", bg: "#eff6ff" },
  punch: { label: "主役",   color: "#f97316", bg: "#fff7ed" },
  info:  { label: "補足",   color: "#6b7280", bg: "#f3f4f6" },
  cta:   { label: "行動",   color: "#059669", bg: "#ecfdf5" },
};

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
function LoadingScreen({ steps, currentStep, elapsed = 0 }) {
  const isVideoStep = currentStep === 3;
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
      <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: isVideoStep ? "14px" : "28px" }}>
        投稿文と動画を生成しています
      </div>

      {isVideoStep && (
        <div style={{ marginBottom: "24px", padding: "12px 14px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "12px", maxWidth: "280px", margin: "0 auto 24px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#c2410c", marginBottom: "3px" }}>
            動画を生成しています（{Math.floor(elapsed / 60)}分{String(elapsed % 60).padStart(2, "0")}秒経過）
          </div>
          <div style={{ fontSize: "11px", color: "#9a3412", lineHeight: 1.6 }}>
            完成まで1〜3分ほどかかります。<br />このまま画面を開いたままお待ちください。
          </div>
        </div>
      )}

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
  const navigate = useNavigate();

  // 画面遷移時に先頭にスクロール
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // sessionStorageからプロジェクトを取得
  const savedProject = (() => {
    try { return JSON.parse(sessionStorage.getItem("posta_project")); } catch { return null; }
  })();
  // ログインユーザー（プラン判定に使う。最終判定はサーバー側で行う）
  const currentUser = (() => {
    try { return JSON.parse(sessionStorage.getItem("posta_user")); } catch { return null; }
  })();
  const USER_PLAN = currentUser?.plan || "free";

  // プランごとの動画尺の上限（秒）
  const PLAN_DURATION_LIMIT = {
    free:     5,
    starter:  5,
    pro:      10,
    business: 10,
  };
  const durationLimit = PLAN_DURATION_LIMIT[USER_PLAN] ?? 5; // 実際に生成できる秒数の上限（Kling基準）
  // Klingは1回の生成で5秒か10秒しか作れない。
  // 11秒以上は複数クリップの結合（Cloudinary導入後）が必要なため、現状はロック。
  const DURATION_OPTIONS = [
    { id: "xs",  label: "〜5秒",    seconds: 5,  klingSeconds: 5,  available: true  },
    { id: "sm",  label: "6〜10秒",  seconds: 10, klingSeconds: 10, available: true  },
    { id: "md",  label: "11〜20秒", seconds: 15, klingSeconds: 10, available: false },
    { id: "lg",  label: "21〜30秒", seconds: 25, klingSeconds: 10, available: false },
  ];
  const DURATION_SECONDS = Object.fromEntries(DURATION_OPTIONS.map(d => [d.id, d.klingSeconds]));

  const PROJECT = savedProject || {
    id: 1, name: "カフェ Lumière", industry: "restaurant", color: "orange",
    tone: "warm", targets: ["f_30","family"], videoStyle: "vlog", bgm: "calm",
    font: "round", keigo: "desu", purpose: "attract",
    purposeDetail: "近隣の30〜40代女性・ファミリー層に来店してもらう。",
    fixedWords: "Lumière、週末モーニング",
  };

  // ブランド設定から色とフォントを引く
  const brandAccent = resolveAccent(PROJECT);
  const brandFont = resolveFont(PROJECT);

  const [selected, setSelected] = useState(["tiktok", "instagram"]);
  const [phase, setPhase] = useState("input");   // input | loading | result
  const [loadStep, setLoadStep] = useState(0);
  const [activeTab, setActiveTab] = useState("tiktok");
  const [copied, setCopied] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [downloaded, setDownloaded] = useState(false);
  const [duration, setDuration] = useState("xs");
  const [generateVideo, setGenerateVideo] = useState(true); // 動画も作るかどうか
  const [netaTips, setNetaTips] = useState([]);
  const [netaTipsLoading, setNetaTipsLoading] = useState(false);
  const [netaError, setNetaError] = useState(null);
  const [neta, setNeta] = useState("");
  const [generatedTexts, setGeneratedTexts] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]); // {file, url, base64}
  const [videoUrl, setVideoUrl] = useState(null);        // 完成した動画のURL
  const [videoError, setVideoError] = useState(null);    // 動画生成の失敗理由
  const [klingPrompt, setKlingPrompt] = useState("");    // 生成に使った英語プロンプト
  const [videoElapsed, setVideoElapsed] = useState(0);   // 動画生成の経過秒数

  // テロップ
  const [captions, setCaptions] = useState([]);
  const [showCaptions, setShowCaptions] = useState(true);
  const [captionsLoading, setCaptionsLoading] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const videoRef = useRef(null);

  // setStateの反映を待たずに最新値を参照するためのref
  const generatedTextsRef = useRef({});
  const videoUrlRef = useRef(null);
  const klingPromptRef = useRef("");
  const captionsRef = useRef([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - uploadedImages.length;
    const toAdd = files.slice(0, remaining);
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedImages(prev => [...prev, {
          file,
          url: ev.target.result,
          base64: ev.target.result.split(",")[1],
          mediaType: file.type,
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageRemove = (idx) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== idx));
  };

  const LOAD_STEPS = generateVideo
    ? ["ブランド設定を読み込み中", "投稿文を生成中", "動画プロンプトを生成中", "オリジナル動画を生成中", "テロップを設計中"]
    : ["ブランド設定を読み込み中", "投稿文を生成中", "仕上げ処理中", "仕上げ処理中", "仕上げ処理中"];

  const toggle = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // ネタ候補をAPI Route経由で生成（画像があればVisionで読み取り）
  const generateNetaTips = async () => {
    setNetaTipsLoading(true);
    setNetaError(null);
    try {
      const res = await fetch("/api/generate-neta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: PROJECT,
          images: uploadedImages.map(img => ({ base64: img.base64, mediaType: img.mediaType })),
        }),
      });
      const data = await res.json();
      if (data.tips && data.tips.length > 0) {
        setNetaTips(data.tips);
        setNetaError(null);
      } else {
        console.error("neta API error:", data.error, data.raw);
        setNetaTips([]);
        setNetaError(data.error || "候補を生成できませんでした");
      }
    } catch (err) {
      console.error("neta fetch error:", err);
      setNetaTips([]);
      setNetaError("通信エラーが発生しました");
    }
    setNetaTipsLoading(false);
  };

  // ステータスを数秒おきに確認して動画の完成を待つ
  const pollVideo = async (taskId, mode) => {
    const INTERVAL = 5000;   // 5秒おき
    const MAX_TRIES = 72;    // 最大6分
    let consecutiveErrors = 0;

    for (let i = 0; i < MAX_TRIES; i++) {
      await new Promise(r => setTimeout(r, INTERVAL));
      setVideoElapsed((i + 1) * (INTERVAL / 1000));

      try {
        const res = await fetch(`/api/video-status?taskId=${encodeURIComponent(taskId)}&mode=${mode}`);
        const data = await res.json();

        if (data.status === "succeed") return data.videoUrl;
        if (data.status === "failed") throw new Error(data.error || "動画生成に失敗しました");
        consecutiveErrors = 0;
      } catch (err) {
        consecutiveErrors++;
        console.error("poll error:", err);
        // 通信エラーが3回続いたら諦める
        if (consecutiveErrors >= 3) throw err;
      }
    }
    throw new Error("動画の生成に時間がかかりすぎています。しばらくしてから再度お試しください");
  };

  const handleGenerate = async () => {
    setPhase("loading");
    setLoadStep(0);
    setVideoUrl(null);
    setVideoError(null);
    setVideoElapsed(0);
    setCaptions([]);
    setVideoTime(0);
    videoUrlRef.current = null;
    generatedTextsRef.current = {};
    klingPromptRef.current = "";
    captionsRef.current = [];

    const wait = ms => new Promise(r => setTimeout(r, ms));
    const imagePayload = uploadedImages.map(img => ({ base64: img.base64, mediaType: img.mediaType }));

    // ── STEP 0: ブランド設定を読み込み中 ──
    await wait(600);

    // ── STEP 1: 投稿文を生成中 ──
    setLoadStep(1);
    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: PROJECT,
          input: neta,
          platforms: selected,
          topic: neta || "今日のネタ",
          images: imagePayload,
        }),
      });
      const data = await res.json();
      if (data.results) { setGeneratedTexts(data.results); generatedTextsRef.current = data.results; }
      else console.error("generate-post error:", data.error);
    } catch (err) {
      console.error("generate-post fetch error:", err);
    }

    if (generateVideo) {
      // ── STEP 2: 動画プロンプトを生成中 ──
      setLoadStep(2);
      let prompt = "";
      try {
        const res = await fetch("/api/generate-kling-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project: PROJECT, input: neta, duration }),
        });
        const data = await res.json();
        prompt = data.prompt || "";
        setKlingPrompt(prompt);
        klingPromptRef.current = prompt;
      } catch (err) {
        console.error("kling-prompt error:", err);
      }

      // ── STEP 3: オリジナル動画を生成中 ──
      setLoadStep(3);
      if (!prompt) {
        setVideoError("動画プロンプトの生成に失敗しました");
      } else {
        try {
          const startRes = await fetch("/api/generate-video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt,
              image: imagePayload[0]?.base64 || null,
              duration: DURATION_SECONDS[duration] || 5,
              plan: USER_PLAN,
              aspectRatio: "9:16",
            }),
          });
          const startData = await startRes.json();

          if (!startRes.ok || !startData.taskId) {
            throw new Error(startData.error || "動画生成を開始できませんでした");
          }
          const url = await pollVideo(startData.taskId, startData.mode);
          setVideoUrl(url);
          videoUrlRef.current = url;
        } catch (err) {
          console.error("video error:", err);
          setVideoError(err.message || "動画生成に失敗しました");
        }
      }

      // ── STEP 4: 仕上げ処理中（テロップを設計） ──
      setLoadStep(4);
      try {
        const res = await fetch("/api/generate-captions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project: PROJECT,
            neta,
            duration: DURATION_SECONDS[duration] || 5,
          }),
        });
        const data = await res.json();
        if (data.captions?.length) {
          setCaptions(data.captions);
          captionsRef.current = data.captions;
        } else {
          console.error("captions error:", data.error);
        }
      } catch (err) {
        console.error("captions fetch error:", err);
      }
    } else {
      // 動画を作らない場合はステップだけ進めて自然に見せる
      setLoadStep(2);
      await wait(300);
      setLoadStep(3);
      await wait(300);
      setLoadStep(4);
    }
    await wait(300);

    setPhase("result");
    setActiveTab(selected[0]);

    // ── 履歴を保存 ──
    if (currentUser?.id) {
      // この時点の生成結果を確実に拾う
      const finalTexts = generatedTextsRef.current;
      const finalVideo = videoUrlRef.current;

      const historyItem = {
        id: Date.now(),
        projectId: PROJECT.id,
        projectName: PROJECT.name,
        projectColor: "#ea580c",
        projectIcon: "📁",
        type: (generateVideo && finalVideo) ? "both" : "sns",
        platforms: selected,
        topic: neta || "AI生成",
        createdAt: new Date().toISOString(),
        time: "たった今",
        duration,
        videoUrl: finalVideo || null,
        videoThumb: finalVideo || null,
        klingPrompt: klingPromptRef.current || "",
        captions: captionsRef.current || [],
        brand: {
          font:     PROJECT.font || "ai",
          tone:     PROJECT.tone || "",
          industry: PROJECT.industry || "",
          color:    PROJECT.color || "orange",
        },
        postTexts: finalTexts || {},
        postText: finalTexts?.[selected[0]] || "",
      };
      try {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser.id, item: historyItem }),
        });
      } catch {}
    }
  };

  // 動画を保存する。共有シートが使える環境（主にiPhone）ではそちらを優先し、
  // 「写真に保存」までワンタップで届くようにする。使えない環境ではファイルとしてDLする。
  const [saving, setSaving] = useState(false);
  const handleSaveVideo = async (url) => {
    if (!url || saving) return;
    setSaving(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("動画の取得に失敗しました");
      const blob = await res.blob();
      const fileName = `posta_${Date.now()}.mp4`;
      const file = new File([blob], fileName, { type: blob.type || "video/mp4" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // iPhone等：共有シートから「動画を保存」を選べる
        await navigator.share({ files: [file], title: "Posta" });
      } else {
        // PC等：そのままダウンロード開始
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
      }
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (err) {
      console.error("save video error:", err);
      // 取得できない場合（CORS等）は最終手段として新しいタブで開く
      window.open(url, "_blank", "noopener,noreferrer");
    }
    setSaving(false);
  };

  const seekTo = (t) => {
    if (videoRef.current) {
      videoRef.current.currentTime = t + 0.05;
      videoRef.current.play().catch(() => {});
    }
  };

  const updateCaptionText = (index, text) => {
    setCaptions(prev => {
      const next = prev.map((c, i) => i === index ? { ...c, text: text.slice(0, 40) } : c);
      captionsRef.current = next;
      return next;
    });
  };

  const regenerateCaptions = async () => {
    setCaptionsLoading(true);
    try {
      const res = await fetch("/api/generate-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: PROJECT,
          neta,
          duration: DURATION_SECONDS[duration] || 5,
        }),
      });
      const data = await res.json();
      if (data.captions?.length) {
        setCaptions(data.captions);
        captionsRef.current = data.captions;
      } else {
        console.error("captions error:", data.error);
      }
    } catch (err) {
      console.error("captions fetch error:", err);
    }
    setCaptionsLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedTexts[activeTab] || DUMMY_TEXTS[activeTab] || "");
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
            <button onClick={() => navigate("/projects")} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#6b7280" }}>←</button>
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
                📷 写真・動画素材
                <span style={{ color: "#9ca3af", fontWeight: 400, marginLeft: "6px" }}>最大5枚・任意</span>
                {uploadedImages.length > 0 && (
                  <span style={{ marginLeft: "6px", fontSize: "11px", color: "#f97316", fontWeight: 700 }}>{uploadedImages.length}枚選択中</span>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {uploadedImages.map((img, i) => (
                  <div key={i} style={{ width: "64px", height: "64px", borderRadius: "10px", overflow: "hidden", position: "relative", flexShrink: 0 }}>
                    <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={() => handleImageRemove(i)} style={{
                      position: "absolute", top: "-4px", right: "-4px",
                      width: "18px", height: "18px", borderRadius: "50%",
                      background: "#ef4444", color: "#fff", border: "2px solid #fff",
                      fontSize: "9px", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", fontWeight: 700,
                    }}>✕</button>
                  </div>
                ))}
                {uploadedImages.length < 5 && (
                  <label style={{
                    width: "64px", height: "64px", borderRadius: "10px",
                    border: "2px dashed #d1d5db", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", cursor: "pointer",
                    color: "#9ca3af", fontSize: "20px", gap: "2px", flexShrink: 0,
                  }}>
                    ＋<span style={{ fontSize: "9px" }}>{5 - uploadedImages.length}枚</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: "none" }} />
                  </label>
                )}
              </div>
              {uploadedImages.length > 0 && (
                <div style={{ marginTop: "8px", fontSize: "11px", color: "#f97316", fontWeight: 600, background: "#fff7ed", padding: "6px 10px", borderRadius: "8px" }}>
                  📸 写真の内容をAIが読み取ってネタ候補・投稿文に反映します
                </div>
              )}
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
                    fontSize: "10px", fontWeight: 700, padding: "4px 8px", borderRadius: "20px",
                    border: "1px solid #f97316", background: netaTipsLoading ? "#f3f4f6" : "#fff7ed",
                    color: netaTipsLoading ? "#9ca3af" : "#f97316", cursor: netaTipsLoading ? "default" : "pointer",
                    display: "flex", alignItems: "center", gap: "3px", whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    {netaTipsLoading
                      ? <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span> 生成中</>
                      : netaTips.length > 0 ? "🔄 更新" : "✨ 候補を生成"
                    }
                  </button>
                </div>

                {netaTips.length === 0 && !netaTipsLoading && !netaError && (
                  <div style={{ textAlign: "center", padding: "16px", background: "#f9fafb", borderRadius: "10px", border: "1px dashed #e5e7eb" }}>
                    <div style={{ fontSize: "20px", marginBottom: "4px" }}>🤖</div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>「候補を生成」でAIがブランドに合ったネタを提案します</div>
                  </div>
                )}

                {netaError && !netaTipsLoading && (
                  <div style={{ padding: "12px 14px", background: "#fef2f2", borderRadius: "10px", border: "1px solid #fecaca" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#ef4444", marginBottom: "3px" }}>
                      候補を生成できませんでした
                    </div>
                    <div style={{ fontSize: "11px", color: "#b91c1c", lineHeight: 1.6, marginBottom: "8px" }}>
                      {netaError}
                    </div>
                    <button onClick={generateNetaTips} style={{
                      fontSize: "11px", fontWeight: 700, padding: "5px 12px", borderRadius: "8px",
                      border: "1px solid #ef4444", background: "#fff", color: "#ef4444", cursor: "pointer",
                    }}>
                      もう一度試す
                    </button>
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
                  {selected.length}媒体を選択
                </div>
              )}
            </div>

            {/* 動画を作るかどうか */}
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={generateVideo}
                  onChange={e => setGenerateVideo(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#f97316" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>🎬 動画も生成する</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                    オフにすると投稿文だけを生成します（動画のプラン消費なし）
                  </div>
                </div>
              </label>
            </div>

            {/* 動画の長さ */}
            {generateVideo && (
              <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "10px" }}>⏱ 動画の長さ</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {DURATION_OPTIONS.map(d => {
                    const overPlan = durationLimit === null || d.klingSeconds > durationLimit;
                    const locked = !d.available || overPlan;
                    return (
                    <div key={d.id} onClick={() => !locked && setDuration(d.id)} style={{
                      padding: "12px 8px", borderRadius: "12px",
                      cursor: locked ? "default" : "pointer", textAlign: "center",
                      border: `1.5px solid ${locked ? "#e5e7eb" : duration === d.id ? "#f97316" : "#e5e7eb"}`,
                      background: locked ? "#f9fafb" : duration === d.id ? "#fff7ed" : "#fff",
                      opacity: locked ? 0.55 : 1,
                      transition: "all 0.15s", position: "relative",
                    }}>
                      {locked && (
                        <div style={{ position: "absolute", top: "4px", right: "4px", fontSize: "9px", fontWeight: 700, background: "#f3f4f6", color: "#9ca3af", padding: "1px 5px", borderRadius: "8px" }}>
                          🔒
                        </div>
                      )}
                      <div style={{ fontSize: "13px", fontWeight: 800, color: locked ? "#9ca3af" : duration === d.id ? "#f97316" : "#111827" }}>{d.label}</div>
                      <div style={{ fontSize: "9px", color: "#9ca3af", marginTop: "3px" }}>
                        {!d.available ? "近日対応" : overPlan ? "プランUPで利用可" : "選択できます"}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

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
            <LoadingScreen steps={LOAD_STEPS} currentStep={loadStep} elapsed={videoElapsed} />
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
                <span style={{ fontSize: "10px", fontWeight: 400, color: "#9ca3af" }}>· Posta AI · 9:16</span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: videoUrl ? "#10b981" : "#f59e0b" }} />
                  <span style={{ fontSize: "10px", color: videoUrl ? "#10b981" : "#f59e0b", fontWeight: 700 }}>
                    {videoUrl ? "生成完了" : "デモ表示"}
                  </span>
                </div>
              </div>

              {/* 動画生成に失敗した場合のお知らせ */}
              {videoError && (
                <div style={{ marginBottom: "12px", padding: "10px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", fontSize: "11px", color: "#92400e", lineHeight: 1.7 }}>
                  ⚠️ 動画の生成に失敗したため、デモ映像を表示しています<br />
                  <span style={{ color: "#b45309", fontSize: "10px" }}>{videoError}</span>
                </div>
              )}

              {/* 動画プレビュー + DLボタン */}
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{
                  borderRadius: "12px", overflow: "hidden", flexShrink: 0,
                  boxShadow: `0 6px 24px ${currentPlatform.accent}33`,
                  border: `2px solid ${currentPlatform.accent}44`,
                  position: "relative", width: "168px", height: "299px",
                  background: "#000",
                }}>
                  {videoUrl ? (
                    <>
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        loop
                        playsInline
                        onTimeUpdate={e => setVideoTime(e.target.currentTime)}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      {showCaptions && (
                        <CaptionOverlay
                          captions={captions}
                          currentTime={videoTime}
                          width={168}
                          accent={brandAccent}
                          project={PROJECT}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <VideoCanvas platform={activeTab} playing={videoPlaying} />
                      <button onClick={() => setVideoPlaying(p => !p)} style={{
                        position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)",
                        background: "rgba(0,0,0,0.6)", color: "#fff", border: "none",
                        borderRadius: "20px", padding: "4px 10px", fontSize: "10px",
                        fontWeight: 700, cursor: "pointer",
                      }}>
                        {videoPlaying ? "⏸" : "▶"} {videoPlaying ? "停止" : "再生"}
                      </button>
                    </>
                  )}
                </div>

                {/* 動画情報 + DL */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
                    {currentPlatform.icon} {currentPlatform.label}用
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "12px" }}>
                    {[
                      ["形式", "MP4"],
                      ["尺", `約${DURATION_SECONDS[duration] || 5}秒`],
                      ["比率", "9:16"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                        <span style={{ color: "#9ca3af" }}>{k}</span>
                        <span style={{ fontWeight: 700, color: "#374151" }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {videoUrl ? (
                    <button
                      onClick={() => handleSaveVideo(videoUrl)}
                      disabled={saving}
                      style={{
                        display: "block", width: "100%", padding: "9px", borderRadius: "9px", border: "none",
                        background: downloaded ? "#10b981" : `linear-gradient(135deg, ${currentPlatform.accent}, ${currentPlatform.accent}cc)`,
                        color: "#fff", fontWeight: 700, fontSize: "11px", textAlign: "center",
                        cursor: saving ? "default" : "pointer", transition: "all 0.2s",
                      }}
                    >
                      {saving ? "保存中..." : downloaded ? "✓ 保存しました" : "⬇ 動画を保存"}
                    </button>
                  ) : (
                    <button disabled style={{
                      width: "100%", padding: "9px", borderRadius: "9px", border: "none",
                      background: "#e5e7eb", color: "#9ca3af",
                      fontWeight: 700, fontSize: "11px", cursor: "default",
                    }}>
                      動画がありません
                    </button>
                  )}

                  {/* 使用したプロンプト */}
                  {klingPrompt && (
                    <details style={{ marginTop: "8px" }}>
                      <summary style={{ fontSize: "10px", color: "#9ca3af", cursor: "pointer" }}>
                        使用したプロンプト
                      </summary>
                      <div style={{ marginTop: "5px", padding: "8px", background: "#f8f9fb", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "9px", color: "#6b7280", lineHeight: 1.6, wordBreak: "break-word" }}>
                        {klingPrompt}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>

            {/* ── テロップ ── */}
            {videoUrl && (
              <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "16px", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#374151" }}>💬 テロップ</span>
                  <span style={{ fontSize: "10px", color: "#9ca3af" }}>
                    {brandFont.label}
                    <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: brandAccent, marginLeft: "5px", verticalAlign: "middle" }} />
                  </span>

                  <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={showCaptions}
                      onChange={e => setShowCaptions(e.target.checked)}
                      style={{ accentColor: "#f97316", width: "14px", height: "14px" }}
                    />
                    <span style={{ fontSize: "11px", fontWeight: 700, color: showCaptions ? "#f97316" : "#9ca3af" }}>
                      表示
                    </span>
                  </label>
                </div>

                {captions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "16px", background: "#f9fafb", borderRadius: "10px", border: "1px dashed #e5e7eb" }}>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px" }}>テロップがまだありません</div>
                    <button onClick={regenerateCaptions} disabled={captionsLoading} style={{
                      fontSize: "11px", fontWeight: 700, padding: "6px 14px", borderRadius: "8px",
                      border: "1px solid #f97316", background: captionsLoading ? "#f3f4f6" : "#fff7ed",
                      color: captionsLoading ? "#9ca3af" : "#f97316", cursor: captionsLoading ? "default" : "pointer",
                    }}>
                      {captionsLoading ? "設計中..." : "✨ テロップを作る"}
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {captions.map((cap, i) => {
                        const roleMeta = ROLE_META[cap.role] || ROLE_META.info;
                        return (
                          <div key={cap.id} style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "8px 10px", borderRadius: "10px",
                            background: "#f8f9fb", border: "1px solid #f3f4f6",
                          }}>
                            <div style={{ fontSize: "9px", fontWeight: 700, color: "#9ca3af", width: "52px", flexShrink: 0 }}>
                              {cap.start}〜{cap.end}s
                            </div>
                            <span style={{
                              fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "20px",
                              background: roleMeta.bg, color: roleMeta.color, flexShrink: 0, whiteSpace: "nowrap",
                            }}>
                              {roleMeta.label}
                            </span>
                            <input
                              value={cap.text}
                              onChange={e => updateCaptionText(i, e.target.value)}
                              style={{
                                flex: 1, minWidth: 0, padding: "5px 8px", borderRadius: "7px",
                                border: "1px solid #e5e7eb", fontSize: "12px", fontFamily: "inherit",
                                color: "#111827", outline: "none",
                              }}
                            />
                            <button onClick={() => seekTo(cap.start)} title="ここから再生" style={{
                              flexShrink: 0, width: "26px", height: "26px", borderRadius: "7px",
                              border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "10px",
                            }}>▶</button>
                          </div>
                        );
                      })}
                    </div>

                    <button onClick={regenerateCaptions} disabled={captionsLoading} style={{
                      width: "100%", marginTop: "10px", padding: "9px", borderRadius: "10px",
                      border: "1.5px solid #e5e7eb", background: "#fff",
                      color: captionsLoading ? "#9ca3af" : "#374151",
                      fontWeight: 700, fontSize: "12px", cursor: captionsLoading ? "default" : "pointer",
                    }}>
                      {captionsLoading ? "設計中..." : "↻ 別のパターンで作り直す"}
                    </button>
                  </>
                )}
              </div>
            )}

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
                {generatedTexts[activeTab] || DUMMY_TEXTS[activeTab]}
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
