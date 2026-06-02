# Posta — AI Video & SNS Generator

ブランド設定を一度するだけで、動画プロンプトとSNS投稿文を自動生成するツール。

## セットアップ

```bash
npm install
cp .env.example .env.local
# .env.local に各種APIキーを設定
npm run dev
```

## デプロイ（Vercel）

1. GitHubにpush
2. Vercel でリポジトリを連携
3. Environment Variables に .env.example の値を設定
4. Deploy

## 画面構成

| ページ | パス | ファイル |
|--------|------|---------|
| ログイン | /login | src/pages/LoginPage.jsx |
| プロジェクト一覧 | /projects | src/pages/ProjectListPage.jsx |
| SNS投稿内容を生成 | /generate | src/pages/GeneratePage.jsx |
| 生成結果 | /result | src/pages/ResultPage.jsx |
| 過去の作品 | /history | src/pages/HistoryPage.jsx |

## API Routes（Vercel）

| エンドポイント | 用途 |
|----------------|------|
| POST /api/generate-post | 投稿文生成（Claude API） |
| POST /api/generate-neta | ネタ候補生成 |
| POST /api/generate-kling-prompt | Kling用プロンプト生成 |

## デモファイルの使い方

`/mnt/user-data/outputs/` の jsx ファイルが各画面のデモです。
`src/pages/` の各ページファイルにコードを移植してください。

| デモファイル | 対応ページ |
|---|---|
| posta-login.jsx | LoginPage.jsx |
| posta-app.jsx | ProjectListPage.jsx + GeneratePage.jsx |
| generate-result.jsx | GeneratePage.jsx + ResultPage.jsx |
| posta-history.jsx | HistoryPage.jsx |
