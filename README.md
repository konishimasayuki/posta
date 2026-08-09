# Posta — 引き継ぎ書・仕様書

最終更新：2026年8月9日

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
| 動画加工 | Creatomate | **接続済み**（Cloudinaryから方針変更） |
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
CREATOMATE_API_KEY=xxxxxxxx              設定済み
CREATOMATE_TEMPLATE_ID=e8ecbc3a-ec7d-4fe7-919a-e1a3db3ac920   設定済み（テンプレート名: posta-caption-v1）
```

※ Cloudinaryは当初の計画だったが、テロップの表現力（アニメーション・
グラデーション等）で見劣りするため、Creatomateに方針変更した。
Cloudinary関連の環境変数は使用していない。

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
│   ├── _creatomate.js         Creatomate認証・テンプレートID取得（共通）
│   ├── _creatomateStyles.js   captionStyles.jsonの色/フォントをCreatomate形式に変換
│   ├── _captionStyleDefs.js   captionStyles.jsonの色/フチ/フォント定義をサーバー用に複製
│   ├── _captionStyles.js      ⚠️不使用。generate-captions.jsに内容を直接埋め込み済み（後述）
│   ├── _animations.js         アニメーション30種の元データ（135種から厳選）
│   ├── explore.js             探索ページ（公開作品・いいね）
│   ├── users.js               ログイン認証・ユーザー登録
│   ├── projects.js            プロジェクト保存・取得
│   ├── history.js             履歴保存・取得・削除
│   ├── generate-neta.js       ネタ候補生成（画像対応）
│   ├── generate-post.js       投稿文生成（画像対応）
│   ├── generate-captions.js   テロップ設計（50種カタログを内部に直接埋め込み）
│   ├── generate-kling-prompt.js  動画用英語プロンプト生成
│   ├── generate-video.js      動画生成の開始
│   ├── video-status.js        動画生成の進捗確認
│   ├── kling-test.js          Kling接続の診断用
│   ├── creatomate-burn.js     テロップを動画に焼き込む（本番用）
│   ├── creatomate-render-test.js  焼き込みの動作確認用（手動テスト向け）
│   ├── creatomate-status.js   焼き込みの進捗確認
│   └── creatomate-test.js     Creatomate接続の診断用
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── lib/
    │   ├── fonts.js           ブランド設定→Webフォント対応づけ
    │   ├── captionStyles.json テロップスタイル50種の見た目データ（色・フチ・書体）
    │   ├── captionStyles.js   上記JSONをCSSに変換する
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
STEP5  テロップを焼き込み中   → POST /api/creatomate-burn
                              → GET /api/creatomate-status を3秒おきに確認
                              （最大2分。失敗しても文字なし動画のまま結果画面へ進む）
  ↓
結果画面 → 履歴をRedisに保存
```

焼き込みが成功すると `burnedVideoUrl` が設定され、結果画面・保存・履歴の
すべてでこちらが優先される。失敗時は `videoUrl`（文字なし）のまま進み、
画面に理由を表示する（生成全体は止めない）。

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
  emphasis: "highlight",// none | box | underline | highlight（styleId未指定のときだけ使う）
  styleId: "CJ_S041"    // 装飾スタイル。CJ_S001〜CJ_S050
}
```

`api/generate-captions.js` の `sanitize()` で以下を保証している。

- start/end が動画尺を超えない
- テロップ同士が重ならない（重なったら後ろにずらす）
- 最低0.8秒は表示される
- 不正な role / position / size / emphasis は既定値に丸める

### 装飾スタイル（50種）

Premiere Proのテキストスタイル50種をWebで再現したもの。
Claudeがテロップ1つずつに `styleId` を選び、フロントがそのとおりに描く。

```
CJ_S001〜S018  基本（ゴシック・ポップ・ふとかわ・まるゴシ・強調・グラデ）
CJ_S019〜S027  感情（怒り・ツッコミ・恐怖）
CJ_S028〜S033  装飾（2色・ストライプ・蛍光）
CJ_S034〜S050  質感（色っぽい・カッコイイ・金銀銅・派手金・レインボー）
```

**色や太さを変えたいときは `src/lib/captionStyles.json` だけを編集する。**
`captionStyles.js` はJSONをCSSに変換するだけで、見た目の値は持っていない。

```json
{ "id": "CJ_S001", "font": "gothic", "fill": "#ef4b57",
  "stroke": [[0.13, "#ffffff"]], "shadow": [[0, 0.05, 0.10, "rgba(0,0,0,0.35)"]] }
```

`stroke` `shadow` の数値は文字サイズに対する倍率（0.13 なら文字サイズの13%）。
画面サイズが変わっても比率が保たれる。

描画は「太いフチ → 細いフチ → 塗り」を重ねる2〜3層構造。
グラデーションの塗りは `background-clip:text` を使う都合で
`-webkit-text-stroke` と同居できないため、層を分けている。

IDを増減するときは `api/_captionStyles.js` も必ず一緒に直すこと。
AIに渡すカタログがそちらにあり、ズレるとAIが存在しないIDを返す。
（不正なIDは role ごとの既定スタイルに丸めるので画面は壊れない）

### フォント

`src/lib/fonts.js` がブランド設定から書体を決める。
`styleId` が付いたテロップは、この設定ではなくスタイル側の書体を使う。

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

## Creatomate連携（テロップの焼き込み）

テロップは、Claudeが設計した内容（`captions` 配列）を、Creatomateの
テンプレートに流し込んで動画に焼き込む。設計と描画を分離しているのは
「テロップ設計の仕組み」の節と同じ理由（Klingは文字を描けない）。

```
Kling      → 映像だけ生成（文字なし）
Claude     → 何を・いつ・どのスタイルで見せるか設計（styleId込み）
Creatomate → 設計どおりに実際の動画ファイルへ焼き込む
```

### テンプレート

| 項目 | 値 |
|---|---|
| テンプレート名 | posta-caption-v1 |
| template_id | `e8ecbc3a-ec7d-4fe7-919a-e1a3db3ac920` |
| 要素構成 | `background`（動画）+ テキスト8枠 |

#### テロップの枠（2026-08-09に4→8枠へ拡張）

| role | 枠名 | 上限 |
|---|---|---|
| hook | `hook` | 1個 |
| punch | `punch`, `punch2` | 2個 |
| info | `info`, `info2`, `info3`, `info4` | 4個 |
| cta | `cta` | 1個 |

既存の名前（`hook` `punch` `info` `cta`）は変えず、追加分だけ番号を付けている。
過去の履歴データとの互換性を保つため。

**枠を増やすときは3箇所を同時に直すこと。**
1. Creatomateのテンプレートに要素を追加（手作業）
2. `api/creatomate-burn.js` の `ROLE_SLOTS` と `ELEMENT_FONT_SIZE_VMIN`
3. `api/generate-captions.js` の `.slice(0, 8)` と、プロンプト内の上限説明

どれか1つでも漏れると、AIが設計したテロップが黙って捨てられる。

テンプレートは1個のみ。役割（hook/punch/info/cta）ごとに4つの枠を
あらかじめ用意しておき、そこへ内容を差し込む方式なので、デザインの
バリエーションを増やすのにテンプレートを何個も作る必要はない。
**「型」は1個、「中身」がcaptionStylesの50種類**という構造。

各要素の文字サイズ（font_sizeにvminで固定済み。変更時は下記コードも直す）

```
hook / info / cta：6.94 vmin
punch            ：16.14 vmin
```

### 対応関係（Postaのcaptions → Creatomateのmodifications）

| Postaの項目 | Creatomateの項目 |
|---|---|
| `start`（秒） | `{role}.time` |
| `end - start`（秒） | `{role}.duration` |
| `styleId` の fill | `{role}.fill_color` |
| `styleId` の stroke | `{role}.stroke_color` + `{role}.stroke_width`（vmin換算） |
| `styleId` の font | `{role}.font_family` + `{role}.font_weight` |
| `fontId`（AI選択・ブランド設定優先） | `{role}.font_family` + `{role}.font_weight` |
| `animationId`（AI選択） | `{role}.animations` |
| 動画全体の尺 | `duration`（トップレベル。無指定だとテンプレート既定の48.05秒になる） |

変換ロジックは `api/_creatomateStyles.js`、色・フォントの実データは
`api/_captionStyleDefs.js`（`src/lib/captionStyles.json` のサーバー用複製）。

### フォント検証状況

Creatomateにフォントを使うには、**事前にCreatomate側へアップロードし、
実際に持っている太さ（weight）を確認する**必要がある。未検証のまま
指定すると、エラーにはならず**黙って別フォントに差し替わる**
（Creatomateの `warnings` に出るので、レンダー結果を都度確認すること）。

未検証のfontは自動的にInter(700)にフォールバックする
（`api/_creatomateStyles.js` の `CREATOMATE_FONTS` / `verified` フラグ）。

#### captionStyles.jsonの6カテゴリ（既存の50スタイルが参照）

| captionStyles.jsonのfont | Creatomate上のフォント名 | 太さ | 状態 |
|---|---|---|---|
| pop | Dela Gothic One | 400のみ | ✅検証済み |
| round | Zen Maru Gothic | 900 | ✅検証済み |
| mincho | Shippori Mincho | 800 | ✅検証済み |
| gothic | NotoSansJP | 900 | ✅検証済み（2026-08-08） |
| reggae | Reggae One | 400（想定） | ⬜未検証 |
| brush | Yuji Syuku | 400（想定） | ⬜未検証 |

#### 拡張フォントパレット（2026-08-08 konishiさんが追加・検証済み・28種）

Creatomateへのアップロードと太さの確認を、konishiさんが一括で完了させたもの。
`api/_creatomateStyles.js` の `CREATOMATE_FONTS` に、コード上のキーで
登録済み（太さは確認できた中で一番太いものを既定値にしている）。

**現状、captionStyles.jsonの50スタイルはまだこれらを参照していない**
（既存の6カテゴリのみを使い続けている）。「今後はこのパレットから
選んで使ってほしい」という意向のため、まず対応表への登録だけ済ませてある。
実際にどのスタイル・どの場面でどのフォントを使うかの割り当ては未着手。

| フォント名 | 雰囲気 | 太さ | コード上のキー |
|---|---|---|---|
| BIZ UDGothic | 実直・公共的・事務的 | 700 | `bIZUDGothic` |
| BIZ UDPGothic | 実直だが読みやすく柔らかい | 700 | `bIZUDPGothic` |
| Dela Gothic One | 力強い・インパクト最優先・レトロポップ | 400 | `delaGothicOne` |
| DotGothic16 | レトロゲーム・8bit・ノスタルジー | 400 | `dotGothic16` |
| IBM Plex Sans JP | インダストリアル・テック・企業的 | 700 | `iBMPlexSansJP` |
| Kaisei Decol | 和モダン・レトロかわいい | 700 | `kaiseiDecol` |
| Kiwi Maru | やわらかく可憐・少しレトロ | 500 | `kiwiMaru` |
| KleeOne | 手書きの誠実さ・学校のノート・国語教材 | 600 | `kleeOne` |
| Kosugi | ニュートラル・実務的・地味 | 400 | `kosugi` |
| Kosugi Maru | 素朴・気取らない・カジュアル | 400 | `kosugiMaru` |
| M PLUS 1 | today的・都会的・力強いが冷静 | 900 | `mPLUS1` |
| M PLUS 1p | M PLUS 1と同系 | 900 | `mPLUS1p` |
| M PLUS 2 | シャープ・都会的・スタイリッシュ | 900 | `mPLUS2` |
| M PLUS Rounded 1c | やわらかいのに強い | 900 | `mPLUSRounded1c` |
| Mochiy Pop One | かわいい・元気・子供っぽいポップさ | 400 | `mochiyPopOne` |
| Murecho | 洗練・ミニマル・落ち着いたモダンさ | 900 | `murecho` |
| NotoSansJP | 中立・信頼感・汎用 | 900 | `notoSansJP` |
| RocknRollOne | 陽気・カジュアル・軽いポップさ | 400 | `rocknRollOne` |
| SawarabiGothic | 素朴で控えめ・和の落ち着き | 400 | `sawarabiGothic` |
| Shippori Mincho | 端正で凛とした和の重厚感 | 800 | `shipporiMincho` |
| ShipporiMinchoB1 | 凛とした和の重厚感・高級・伝統 | 800 | `shipporiMinchoB1` |
| Yusei Magic | 手作り感・親しみ・チラシや黒板書きの温度感 | 400 | `yuseiMagic` |
| Zen Antique Soft | 漫画の吹き出し・古書・昭和レトロ | 400 | `zenAntiqueSoft` |
| Zen Kaku Gothic Antique | レトロで温かみのある角ゴ | 900 | `zenKakuGothicAntique` |
| Zen Kaku Gothic New | 信頼感・端正・ビジネス寄り | 900 | `zenKakuGothicNew` |
| Zen Maru Gothic | やわらかいのに存在感がある | 900 | `zenMaruGothic` |
| Zen Old Mincho | 重厚・和風・格式 | 900 | `zenOldMincho` |
| ZenKurenaido | 素朴・親しみやすい・ノートの走り書き | 400 | `zenKurenaido` |

**綴りの注意**：フォント名の表記（スペースの有無）は、konishiさんが
用意した一覧の表記をそのまま使っている。Creatomateにアップロードした
際の登録名と一字一句違うと、警告付きで黙って別フォントに差し替わる
（Dela Gothic One / Zen Maru Gothicで実際に発生した現象と同じ）。
初めて使うときは必ず1回レンダーして`warnings`を確認すること。

新しいフォントを追加するたびに、Creatomateへアップロード→実際に
レンダーして`warnings`が出ないか確認→対応表の`verified`を`true`に、
という手順が要る。自動化はできていない（手作業）。

### アニメーション（30種）

テロップの動きは `api/_animations.js` に元データ（135種）があり、
そこから実用的な30種を厳選して `generate-captions.js` に埋め込んでいる。
AIがネタ・ブランドの雰囲気・表示時間を見て、テロップごとに1つ選ぶ。

**「アニメーション無し」という選択肢は用意していない。**
動きの無いテロップは素人っぽく見えるため、必ず何か付ける方針。
AIが選ばなかった・不正なIDを返した場合も、roleごとの既定に丸められる。

#### split（分割単位）の違いが重要

| split | 動き | 向いている用途 |
|---|---|---|
| letter | 1文字ずつ動く | 8文字以下の短い言葉。価格・決め台詞（punch向き） |
| word | 単語ごとに動く | 短いフレーズ。日本語は区切りが曖昧なので使い所を選ぶ |
| line | 行ごとに動く | 長めの文。落ち着いた雰囲気 |

以前「1文字ずつ動かすのは無理」と判断していたが、これは誤りだった。
`split: "letter"` を指定すれば1文字ずつ動く（23種が対応）。

#### 役割ごとの内訳

| role | 種類数 | 方向性 |
|---|---|---|
| punch | 10種 | 1文字ずつの派手な動き。roll（回転）・flying（飛来）・waving（波打ち）など |
| hook | 8種 | 読みやすく目を引く。typewriting（タイプライター）も含む |
| info | 6種 | 控えめで読みやすい。reveal・appear系 |
| cta | 6種 | 目に留まるが読める。word単位が中心 |

#### 表示時間との兼ね合い（AIへの指示に含めている）

アニメーションは約1秒かかる。表示が1.5秒未満のテロップに派手な動き
（letter系・roll系）を使うと、動き終わる前に消えてしまう。
短いテロップには素早く決まる動き（slide・appear・reveal系）を選ぶよう
プロンプトで指示している。

#### ファイル間のID一致に注意

`generate-captions.js` の `ANIMATION_CATALOG`（AIに提示する一覧）と、
`_creatomateStyles.js` の `ANIMATION_DEFS`（実際の定義）は、
**キーが完全に一致していないと動かない**。片方だけ変更すると、
AIが選んだアニメーションが黙って無視される。

---

### 色の落とし穴（要注意）

`captionStyles.json` はブラウザのCSS向けデータなので、`rgba(90,62,10,0.45)`
のようなCSS形式の色が混ざっている。Creatomateはこの形式を受け付けず
「The string did not match the expected pattern.」というエラーになる。
`api/_creatomateStyles.js` の `normalizeColor()` で必ずhex形式に変換して
から送ること（透明度の情報は失われるが、色味は保持される）。

### isBurnedの判定

履歴の各項目は `isBurned: true/false` を持ち、trueなら
`HistoryPage.jsx` はブラウザ側のCaptionOverlay（プレビュー用の重ね描画）
を表示しない。文字がすでに動画本体に焼き込まれているため、両方表示すると
二重に見えてしまう。

`isBurned` フィールドが無い古いデータ（今日この仕組みを作る前に保存された
履歴）でも壊れないよう、`isBurnedVideo(item)` 関数で動画URLの発行元
（Creatomateは backblazeb2.com にファイルを置く）からも判定できる
フォールバックを入れてある（`src/pages/HistoryPage.jsx`）。

### まだ解決していない課題

- [ ] **画質が粗い可能性大**：Creatomateは無料トライアルで検証中。
      トライアル画面に「Generate at full resolution」が有料プラン限定と
      明記されていた。`render_scale: 1` を明示送信しても改善しなかった
      ため、無料トライアルの解像度制限である可能性が高い。
      有料プランへの切り替えを検討中。
- [ ] グラデーション・ストライプ・金銀銅の質感（50種のうち約15種）は
      Creatomateでは単色に簡略化される（`degraded: true` で判定可能）
- [x] gothic（NotoSansJP）を含む28種のフォント検証完了（2026-08-08）
      `_creatomateStyles.js`に登録済み。ただしcaptionStyles.jsonの50スタイル
      からはまだ参照されていない（既存6カテゴリのみ使用中）
- [ ] reggae・brushフォントの検証がまだ（今回のリストには含まれず）
- [x] 拡張フォントパレット（28種）をAIが選べるようにした（2026-08-09）
      ブランド設定で書体を指定していればそれが最優先、
      「AIお任せ」のときだけAIが雰囲気から選ぶ
- [x] アニメーション30種をAIが選べるようにした（2026-08-09）
      全テロップに必ず何か付ける方針。表示時間・文字数も考慮して選ばせている
- [ ] 動画の再エンコードに伴う画質劣化は、Kling→Creatomateの構造上
      避けにくい（動画を一度展開して合成し、再圧縮するため）

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
| /api/creatomate-burn | POST | テロップを動画に焼き込む（本番用） |
| /api/creatomate-status | GET | 焼き込みの進捗確認 |
| /api/creatomate-test | GET | Creatomate接続の診断（クレジット消費なし） |

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
  videoUrl,            // 焼き込み成功時はCreatomate URL、失敗時はKlingの動画URL（どちらも期限あり）
  isBurned,            // true: videoUrlは焼き込み済み（プレビュー描画しない） / false: 未焼き込み
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
| Starter | ¥6,980 | 10本/月 | 5秒 | なし |
| Pro | ¥12,980 | 20本/月 | 10秒 | なし |
| Business | ¥29,800 | 50本/月 | 10秒 | ホワイトラベル可 |

投稿文は全プラン無制限。

**プラン判定は必ずサーバー側で行うこと。**
`api/_kling.js` の `PLAN_LIMITS` と `resolveDuration()` で尺を丸めている。
フロントの値は改ざんできるので信用しない。

---

## ウォーターマーク設計（未実装）

Freeプランの動画にPostaロゴを焼き込む。
Creatomateで文字入れと同じ仕組みで実装できる見込み（未着手）。

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

- [ ] **Creatomateの画質問題を解決する**
      無料トライアルの解像度制限が疑わしい。有料プランで改善するか要検証
- [ ] **動画URLの失効対策**
      KlingのURL・CreatomateのURLとも期限がある。永続化する仕組みが必要
      （履歴を開いたときに期限切れなら「保存期限が切れています」と表示する
      応急処置のみ実装済み。恒久対応は未着手）
- [ ] **残りフォントの検証**（reggae・brush）
      手順は他の3種と同じ。Creatomateにアップロード→レンダーしてwarnings
      が出ないか確認→`_creatomateStyles.js`の`verified`を`true`に
- [ ] **ウォーターマーク（Freeプラン）**
      Creatomate側で同じ仕組み（テキスト/画像要素の焼き込み）を使って実装できる見込み
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
| generate-captions.jsが本番だけ落ちる | `_captionStyles.js`をimportしていたが、GitHub上のファイルは中身も正しく・デプロイも最新なのに実行時だけ「exportが無い」と出る原因不明の現象 | 原因を追わず、50種カタログをgenerate-captions.js本体に直接埋め込んでファイル間の依存自体を無くした |
| テロップ焼き込みが「文字列の形式が違う」エラーで失敗 | captionStyles.jsonに`rgba(90,62,10,0.45)`のようなCSS形式の色が混在。Creatomateはhex形式しか受け付けない | `_creatomateStyles.js`の`normalizeColor()`で必ずhexに変換してから送る |
| 焼き込んだ動画が全部48秒になる | テンプレート自体が持つ既定のduration（48.05秒）がKlingの実際の尺（5秒）を上書きしなかった | `creatomate-burn.js`でリクエストに明示的に`duration`を含める |
| 焼き込んだ文字がボヤける | テンプレートの`render_scale`既定値が0.375（本来の37.5%サイズ）だった。それでも改善しない場合はCreatomate無料トライアルの解像度制限が濃厚 | `render_scale: 1`を明示送信。プラン起因の場合は有料化以外に解決策なし |
| 写真から動画生成すると横長になる | `generate-video.js`が image2video のときだけ `aspect_ratio` をKlingに送っていなかった | image2video/text2videoどちらでも必ず送るよう修正 |
| 履歴でテロップが二重表示される | 焼き込み済み動画の上に、ブラウザ側のCaptionOverlayも重ねて描画していた | `isBurned`フラグ＋動画URLの発行元判定（`isBurnedVideo()`）で二重描画を防止 |

---

## 設計上の決定事項

- AIサービス名は画面に出さない。「Posta AI」と表記する
- プロジェクトの受け渡しはsessionStorage、保存はRedis
- 動画に文字を焼くのはCreatomateの役割。Klingには映像だけ作らせる
  （当初はCloudinaryを想定していたが、テロップの表現力不足のため変更）
- BottomNavのPボタンは絶対配置で中央固定（タブが増えても位置が変わらない）
- /admin はBottomNavに出さない（URL直打ちでアクセス）
- 生成失敗時はフォールバックせず、エラー理由を画面に出す
  （黙って別の結果が出ると原因が分からなくなるため）
