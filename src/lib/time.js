// src/lib/time.js
// 日本時間での日時表示

const JST = "Asia/Tokyo";

/** ISO文字列などをDateに変換する。変換できなければ null */
function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value) ? null : value;

  // すでに「2時間前」などの日本語表記ならDateにしない
  if (typeof value === "string" && !/^\d{4}-\d{2}-\d{2}/.test(value)) return null;

  const d = new Date(value);
  return isNaN(d) ? null : d;
}

/** 日本時間での「年月日」を取り出す（日付の比較に使う） */
function jstDateParts(date) {
  const fmt = new Intl.DateTimeFormat("ja-JP", {
    timeZone: JST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map(p => [p.type, p.value]));
  return { y: Number(parts.year), m: Number(parts.month), d: Number(parts.day) };
}

/** 日本時間の HH:mm */
export function formatJstTime(value) {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: JST, hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(date);
}

/** 日本時間の M月D日 */
export function formatJstDate(value) {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: JST, month: "long", day: "numeric",
  }).format(date);
}

/** 日本時間の M月D日 HH:mm */
export function formatJstFull(value) {
  const date = toDate(value);
  if (!date) return "";
  return `${formatJstDate(date)} ${formatJstTime(date)}`;
}

/**
 * 「たった今」「3分前」「昨日 14:30」のような相対表記にする。
 * 日本語表記がそのまま渡された場合（デモデータ）はそのまま返す。
 */
export function formatRelative(value, now = new Date()) {
  const date = toDate(value);
  if (!date) return typeof value === "string" ? value : "";

  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 0)   return "たった今";
  if (diffSec < 60)  return "たった今";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}分前`;

  const today = jstDateParts(now);
  const target = jstDateParts(date);
  const sameDay = today.y === target.y && today.m === target.m && today.d === target.d;

  if (sameDay) return `${Math.floor(diffSec / 3600)}時間前`;

  // 昨日かどうかを日本時間で判定する
  const yesterday = jstDateParts(new Date(now.getTime() - 86400000));
  const isYesterday =
    yesterday.y === target.y && yesterday.m === target.m && yesterday.d === target.d;

  if (isYesterday) return `昨日 ${formatJstTime(date)}`;

  const diffDay = Math.floor(diffSec / 86400);
  if (diffDay < 7) return `${diffDay}日前`;

  return formatJstDate(date);
}
