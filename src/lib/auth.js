// src/lib/auth.js
// ログイン状態の読み書きを1か所にまとめる。
//
// なぜ必要か：
// 各ページが個別に localStorage.getItem("posta_user") を呼び、
// さらにコンポーネントの再描画のたびに JSON.parse していたため、
//   ・毎回「中身は同じだが別物」のオブジェクトが生成され、
//     useEffectの依存配列が変化したと判定されて余計に再実行される
//   ・パースが一瞬でも失敗すると currentUser が null になり、
//     ログイン画面へ強制的に飛ばされる
// という問題が起きていた。
//
// ここで読み取り結果をメモリ上にキャッシュし、
// 「一度でも読めたユーザー情報」を安定して返すようにする。

const STORAGE_KEY = "posta_user";

// 直近に読み取れたユーザー情報。localStorageが一時的に読めなくても
// これがあれば、そのまま使い続けられる（ログアウトするまで保持する）。
let cachedUser = null;

/**
 * ログイン中のユーザーを取得する。
 * localStorageが読めない・壊れている場合でも、
 * 直前に読めた情報が残っていればそれを返す。
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // idが無いデータは壊れているとみなし、キャッシュを優先する
      if (parsed && parsed.id) {
        cachedUser = parsed;
        return parsed;
      }
    }
  } catch {
    // localStorageが使えない環境・パース失敗時はキャッシュにフォールバック
  }
  return cachedUser;
}

/** ログイン時に呼ぶ。保存とキャッシュ更新を同時に行う */
export function setCurrentUser(user) {
  cachedUser = user;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // 保存できなくても、その場のセッションはキャッシュで継続できる
  }
}

/** ログアウト時に呼ぶ。キャッシュも必ず消す */
export function clearCurrentUser() {
  cachedUser = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 失敗してもキャッシュは消えているので、この画面ではログアウト状態になる
  }
}

/** ログイン中かどうか */
export function isLoggedIn() {
  return !!getCurrentUser();
}

/**
 * ユーザーIDを取得する。
 * APIのキーに使うため、未ログイン時は "guest" を返す。
 */
export function getUserId() {
  return getCurrentUser()?.id || "guest";
}
