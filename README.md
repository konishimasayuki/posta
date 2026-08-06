# Posta — 引き継ぎ書・仕様書

最終更新：2026年8月6日

---

## このドキュメントの使い方

新しいトークで作業を始めるときは、このファイルを貼り付けて
「この仕様書をもとに続きをお願いします」と伝えれば引き継げます。

---

## プロジェクト概要

**Posta**（ポスタ）
ブランド設定を一度するだけで、SNS投稿文とAI動画を自動生成するツール。

**コアバリュー**
- 時短・ブレない・管理できる
- AIサービス名（Claude / Kling）は画面に出さない。「Posta AI」と表記する
- ネタを具体的に書くほどクオリティが上がる設計

---

## 本番URL・リポジトリ

| 項目 | 内容 |
|---|---|
| 本番URL | https://posta-two-ruby.vercel.app |
| GitHub | konishimasayuki/posta（mainブランチ） |
| デプロイ | Vercel（GitHubにpushで自動デプロイ） |

デモサイトは本番に統合済み。demoブランチは不要。

---

## ログインアカウント

| 種類 | ID | パスワード | 遷移先 |
|---|---|---|---|
| デモ | posta | 0383 | /projects（サンプルデータあり） |
| 管理者 | admin | admin0383 | /admin |
| 通常ユーザー | 任意 | 任意 | /projects |

デモ・管理者は `api/users.js` にハードコード。
通常ユーザーはRedisに保存される。

---

## 技術スタック

| 項目 | 技術 | 状態 |
|---|---|---|
| フロント | React + Vite | 稼働中 |
| ルーティング | React Router v6 | 稼働中 |
| デプロイ | Vercel | 稼働中 |
| コード品質 | Biome | 稼働中 |
| 文章生成 | Claude API（@anthropic-ai/sdk） | **接続済み** |
| 動画生成 | Kling AI API | **接続済み** |
| データ保存 | Upstash Redis | **接続済み** |
| 動画加工 | Cloudinary | 未接続（次の課題） |
| 認証 | 自前（Redis） | 簡易実装 |
| 決済 | 未実装 | Stripe予定 |

---

## 環境変数（Vercel）

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx        設定済み
KLING_API_KEY=api-key-kling-xxxxxxxx     設定済み
UPSTASH_REDIS_REST_URL=https://...       設定済み
UPSTASH_REDIS_REST_TOKEN=xxxxxxxx        設定済み

KLING_API_BASE=https://api-singapore.klingai.com   ※未設定。既定値で動作中
CLOUDINARY_CLOUD_NAME=xxxxxxxx           未設定
CLOUDINARY_API_KEY=xxxxxxxx              未設定
CLOUDINARY_API_SECRET=xxxxxxxx           未設定
```

---

## ファイル構成

```
/
├── index.html                 PWA metaタグ・ファビコン設定
├── package.json
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── pwa-icon-192.png
│   └── pwa-icon-512.png
├── api/
│   ├── _labels.js             設定IDを日本語に変換（共通）
│   ├── _redis.js              Redisクライアント・安全なJSON処理（共通）
│   ├── _kling.js              Kling認証・プラン上限（共通）
│   ├── users.js               ログイン認証・ユーザー登録
│   ├── projects.js            プロジェクト保存・取得
│   ├── history.js             履歴保存・取得・削除
│   ├── generate-neta.js       ネタ候補生成（画像対応）
│   ├── generate-post.js       投稿文生成（画像対応）
│   ├── generate-captions.js   テロップ設計
│   ├── generate-kling-prompt.js  動画用英語プロンプト生成
│   ├── generate-video.js      動画生成の開始
│   ├── video-status.js        動画生成の進捗確認
│   └── kling-test.js          Kling接続の診断用
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── lib/
    │   ├── fonts.js           ブランド設定→Webフォント対応づけ
    │   └── time.js            日本時間の表示
    ├── components/
    │   ├── BottomNav.jsx
    │   └── CaptionOverlay.jsx テロップ描画
    └── pages/
        ├── LoginPage.jsx
        ├── ProjectListPage.jsx
        ├── GeneratePage.jsx
        ├── ResultPage.jsx
        ├── HistoryPage.jsx
        ├── MyPage.jsx
        ├── AdminPage.jsx
        └── ExplorePage.jsx
```

**注意：** `api/` 内で先頭が `_` のファイルはVercelがAPIエンドポイントにしない。
共通モジュール用の命名規則なので変更しないこと。

---

## 画面一覧

| パス | 画面名 | 状態 |
|---|---|---|
| /login | ログイン | API認証済み |
| /projects | プロジェクト一覧 | Redis連携済み |
| /generate | 生成 | 全API接続済み |
| /result | 生成結果 | /generateにリダイレクト |
| /history | 過去の作品 | Redis連携済み |
| /mypage | マイページ | ローカルのみ |
| /admin | 管理者 | **ローカルのみ・Redis未連携** |
| /explore | 探索 | **ダミーデータのまま** |

---

## BottomNav

```
[🕐履歴] [🔍探索]   P（中央・絶対配置）   [👤マイページ]
```

- 背景：薄オレンジ `rgba(255,247,237,0.92)` + blur
- Pボタン：グラデスプリット（オレンジ×ピンク）、`position:absolute; left:50%` で中央固定
- Pボタン押下 → `/projects?new=1` で新規プロジェクトモーダルが開く
- ページ移動時 `window.scrollTo(0,0)`
- ログイン画面のみ非表示
- 将来5タブになってもPの位置は変わらない設計

---

## 生成フロー（/generate）

```
「動画と投稿文を自動生成する」を押す
  ↓
STEP0  ブランド設定を読み込み中
  ↓
STEP1  投稿文を生成中        → POST /api/generate-post
  ↓
STEP2  動画プロンプトを生成中  → POST /api/generate-kling-prompt
  ↓
STEP3  オリジナル動画を生成中  → POST /api/generate-video
                              → GET /api/video-status を5秒おきに確認
                              （最大6分・経過時間を画面表示）
  ↓
STEP4  テロップを設計中       → POST /api/generate-captions
  ↓
結果画面 → 履歴をRedisに保存
```

**重要：** `setState` は即時反映されないため、履歴保存時に最新値を確実に拾えるよう
`useRef`（`generatedTextsRef` `videoUrlRef` `klingPromptRef` `captionsRef`）を併用している。

---

## テロップ設計の仕組み

Klingに文字を描かせると日本語が崩壊するため、**映像と文字を分離**している。

```
Kling   → 映像だけ生成（文字なし）
Claude  → テロップの構成を設計
フロント → 設計どおりに描画（CaptionOverlay）
```

### 役割（role）

| role | 意味 | 目安 |
|---|---|---|
| hook | 冒頭の引き | 8〜14文字 |
| punch | 一番見せたいもの | 6〜12文字・特大・センター |
| info | 補足情報 | 8〜16文字 |
| cta | 行動喚起 | 8〜14文字 |

ネタの内容によって構成が変わる。価格訴求なら価格がpunch、
人物紹介なら人柄の言葉がpunchになる。

### データ構造

```js
{
  id: "cap_0",
  text: "月々29,000円〜",
  start: 1.4,           // 秒
  end: 3.2,
  role: "punch",        // hook | punch | info | cta
  position: "center",   // top | center | bottom
  size: "xl",           // sm | md | lg | xl
  emphasis: "highlight" // none | box | underline | highlight
}
```

`api/generate-captions.js` の `sanitize()` で以下を保証している。

- start/end が動画尺を超えない
- テロップ同士が重ならない（重なったら後ろにずらす）
- 最低0.8秒は表示される
- 不正な role / position / size / emphasis は既定値に丸める

### フォント

`src/lib/fonts.js` がブランド設定から書体を決める。

| 設定 | 実フォント |
|---|---|
| ゴシック体 | Noto Sans JP |
| 明朝体 | Shippori Mincho |
| 丸ゴシック | Zen Maru Gothic |
| セリフ体 | Noto Serif JP |
| ディスプレイ | Dela Gothic One |
| 手書き風 | Yomogi |
| 等幅体 | M PLUS 1 Code |

「AIお任せ」の場合はトーンから自動選択する。

```
フレンドリー       → 丸ゴシック
エネルギッシュ     → ディスプレイ
プロフェッショナル → ゴシック
```

トーン未設定なら業種で判断（士業→明朝、IT→等幅 など）。
Google Fontsは必要なものだけ動的に読み込む。

---

## API一覧

| エンドポイント | メソッド | 用途 |
|---|---|---|
| /api/users | GET | ログイン認証 |
| /api/users | POST | ユーザー登録 |
| /api/projects | GET/POST | プロジェクト取得・保存 |
| /api/history | GET/POST/DELETE | 履歴取得・追加・削除 |
| /api/generate-neta | POST | ネタ候補4件（画像対応） |
| /api/generate-post | POST | 媒体別の投稿文（画像対応） |
| /api/generate-captions | POST | テロップ設計 |
| /api/generate-kling-prompt | POST | 動画用の英語プロンプト |
| /api/generate-video | POST | 動画生成の開始（task_idを返す） |
| /api/video-status | GET | 動画生成の進捗確認 |
| /api/kling-test | GET | Kling接続の診断（クレジット消費なし） |

### Claudeのモデル名

各APIファイル冒頭の定数で管理している。

```js
const MODEL = "claude-sonnet-4-6"; // モデル変更時はここだけ更新
```

モデルが古いと404エラーになるので、エラー時はまずここを疑う。

### Kling APIの仕様

- 認証：APIキーをそのままBearerトークンで送る（JWT不要）
- 非同期：生成開始とステータス確認の2段階
- 尺：`"5"` または `"10"` のみ
- 画像あり → `image2video` / 画像なし → `text2video`
- ベースURL：`https://api-singapore.klingai.com`

---

## Redisのデータ構造

```
user:{loginId}      → ユーザー情報（パスワード含む）
users:list          → ユーザーIDの配列
projects:{userId}   → プロジェクトの配列
history:{userId}    → 生成履歴の配列（最大50件）
```

### 履歴1件の中身

```js
{
  id, projectId, projectName, projectColor, projectIcon,
  type: "both" | "sns",
  platforms: ["tiktok", "instagram"],
  topic,
  createdAt,           // ISO文字列（表示時にJST変換）
  duration,
  videoUrl,            // Klingの動画URL（期限あり）
  klingPrompt,
  postTexts: { tiktok: "...", instagram: "..." },
  captions: [...],     // テロップ設計
  brand: { font, tone, industry, color }  // テロップ再現用
}
```

### 容量の見積もり

1件あたり約3KB、上限50件で1ユーザー150KB。
Upstash無料枠256MBに対して十分小さい。
投稿文は3000文字で切り詰めている。

### 重要な注意

**Upstashは保存したJSONを自動で復元して返す。**
`redis.get()` の結果に `JSON.parse()` をかけると、
オブジェクトが返ってきたときにエラーになる。

必ず `api/_redis.js` の `getArray()` / `safeParse()` を使うこと。
過去にこれが原因で履歴の2件目以降が保存できないバグが発生した。

---

## ビジネスモデル・プラン

| プラン | 月額 | 動画 | 最大尺 | ロゴ |
|---|---|---|---|---|
| Free | ¥0 | 3本/月 | 5秒 | Postaロゴ入り |
| Starter | ¥2,980 | 10本/月 | 5秒 | なし |
| Pro | ¥9,800 | 20本/月 | 10秒 | なし |
| Business | ¥29,800 | 100本/月 | 10秒 | ホワイトラベル可 |

投稿文は全プラン無制限。

**プラン判定は必ずサーバー側で行うこと。**
`api/_kling.js` の `PLAN_LIMITS` と `resolveDuration()` で尺を丸めている。
フロントの値は改ざんできるので信用しない。

---

## ウォーターマーク設計（未実装）

Freeプランの動画にPostaロゴを焼き込む。
Cloudinary導入時に文字入れと同じ仕組みで実装する。

- [ ] Freeプランの動画にロゴをオーバーレイ
- [ ] Starter以上はスキップ
- [ ] Businessはホワイトラベル（自社ロゴ差し替え）
- [ ] 判定はサーバーサイドで（フロント判定禁止）

ビジネス的な意図：無料ユーザーが投稿するたびにPostaの宣伝になる。
「ロゴを消したければ有料に」という自然なアップグレード動線。
Canva・CapCutと同じ手法。

---

## 未実装・今後やること

### 優先度：高

- [ ] **Cloudinary導入**
      - 動画URLの失効対策（Klingのリンクは数日で切れる）
      - テロップの焼き込み（現状はプレビューのみ・DLしたMP4に文字は入らない）
      - ウォーターマーク
      - ※日本語フォントのアップロードが必要か要検証
- [ ] **管理画面のRedis連携**
      現在ユーザー追加・プラン変更が画面上だけでDBに反映されない
- [ ] **探索ページの実データ化**
      いまダミーデータ（Unsplash画像）

### 優先度：中

- [ ] 探索「このテンプレで作る」→ 自分のブランド設定で生成する設計
- [ ] マイページのプラン変更を実際に反映
- [ ] 独自ドメイン取得（posta.jp など）
- [ ] 決済実装（Stripe）
- [ ] パスワードのハッシュ化（現在は平文でRedisに保存）

### 優先度：低

- [ ] 自動投稿（X / Instagram / TikTok API）
- [ ] ホワイトラベル販売
- [ ] スマホアプリ化

---

## 動画プロンプトのコツ（Kling）

実運用で確認済みの知見。

```
✅ 日本向けなので人物は必ず "Japanese" を明記する
✅ 構成：映像スタイル → 被写体 → 照明 → カメラワーク → 画質
✅ カメラの動きを具体的に（slow pan / orbit / push in / handheld）
✅ 縦動画は "9:16 vertical"
✅ 尺は5秒か10秒
❌ 文字を入れさせない（日本語が崩壊する）
```

### 実例（中古車販売）

外観写真から：
```
Cinematic car commercial, silver Honda Fit Hybrid parked in front of
a clean Japanese used car dealership, bright sunny day, slow smooth
camera orbit, chrome details glistening in sunlight, professional
automotive photography style, shallow depth of field, 9:16 vertical, 4K
```

人物あり：
```
A Japanese woman in casual clothes walks toward a silver Honda Fit,
opens the driver door, gets in, car smoothly drives away, Japanese
suburban street, sunny day, cinematic car commercial style, realistic, 4K
```

---

## 開発ルール（厳守）

### コード出力前の必須チェック

```bash
esbuild ファイル名.jsx --bundle=false        # JSX
node --input-type=module --check < file.js   # API
```

- ✅ 通れば出力してよい
- ❌ エラーなら自分で直して再チェックしてから出す

### 必ず確認すること

1. **括弧の対応**（`()` `{}`）
2. **import漏れ**
   使っているフック（useState / useEffect / useRef / useNavigate など）が
   import文に含まれているか。過去に何度もこれで画面が真っ白になった
3. **変数の置き換え漏れ**（例：USERS → users）
4. **重複ブロック**（同じJSXが2回入っていないか）

### Vercelのデプロイ回数

無料プランは100回/日。エラーを出すたびに1回消費するので、
構文チェックを怠らないこと。

### ファイルの渡し方

差分ではなく**必ず全コード**を出す。
GitHubのWeb UIで全選択して貼り替える運用のため。

---

## 過去にハマった問題と対処

| 症状 | 原因 | 対処 |
|---|---|---|
| 画面が真っ白 | import漏れ（useEffect等） | import文を確認 |
| 履歴が2件目から保存されない | Upstashの自動復元に `JSON.parse` を重ねていた | `_redis.js` の `getArray()` を使う |
| ネタ候補が別業種の内容になる | フロントから直接Anthropic APIを叩いてCORS失敗→フォールバック表示 | API Route経由に統一 |
| 生成結果が読み取れない | AIがJSONの後ろに説明文を付ける | 括弧の対応を数えてJSON部分だけ抽出 |
| Claude APIが404 | モデル名が古い | 各APIの `MODEL` 定数を更新 |
| ログイン入力が1文字で切れる | 入力コンポーネントを関数内に定義していた | コンポーネントの外に出す |
| iOSで文字が拡大される | Safariの自動調整 | `index.css` に `-webkit-text-size-adjust: 100%` |
| 履歴の時刻がおかしい | UTCのISO文字列をそのまま表示 | `src/lib/time.js` でJST変換 |

---

## 設計上の決定事項

- AIサービス名は画面に出さない。「Posta AI」と表記する
- プロジェクトの受け渡しはsessionStorage、保存はRedis
- 動画に文字を焼くのはCloudinaryの役割。Klingには映像だけ作らせる
- BottomNavのPボタンは絶対配置で中央固定（タブが増えても位置が変わらない）
- /admin はBottomNavに出さない（URL直打ちでアクセス）
- 生成失敗時はフォールバックせず、エラー理由を画面に出す
  （黙って別の結果が出ると原因が分からなくなるため）
