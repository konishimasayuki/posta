// POST /api/creatomate-burn
// 本番用：Postaの captions 配列（hook/punch/info/cta の start/end/text）を
// Creatomateのテンプレートに流し込んで、テロップ入りの動画を1本作る。
//
// 対応関係（実測で確認済み）：
//   Postaの start        → Creatomateの time（表示が始まる秒数）
//   Postaの end - start   → Creatomateの duration（表示している長さ）
//
// リクエスト例:
// {
//   "videoUrl": "https://...kling-output.mp4",
//   "videoDuration": 5,
//   "captions": [
//     { "role": "hook",  "text": "燃費が気になる方へ",       "start": 0,   "end": 1.5 },
//     { "role": "punch", "text": "ホンダ フィット ハイブリッド","start": 1.5, "end": 3 },
//     { "role": "info",  "text": "新着入荷しました",          "start": 3,   "end": 4 },
//     { "role": "cta",   "text": "週末のお出かけ前に",        "start": 4,   "end": 5 }
//   ]
// }
//
// captions の role は "hook" "punch" "info" "cta" のいずれかを想定している。
// これは posta-caption-v1 テンプレートのレイヤー名とそのまま対応する。
// role にそれ以外の値が入っていた場合は無視する（テンプレートに無い名前を
// 送ってもCreatomate側で無視されるだけで実害はないが、念のため絞る）。

import { creatomateFetch, getTemplateId } from "./_creatomate.js";
import { styleIdToModifications, animationIdToDefinition } from "./_creatomateStyles.js";
import { CAPTION_STYLE_DEFS } from "./_captionStyleDefs.js";

const KNOWN_ROLES = new Set(["hook", "punch", "info", "cta"]);

// テンプレート（posta-caption-v1）に用意されている枠。
// 同じroleでも複数のテロップを焼き込めるよう、2026-08-09に4→8枠へ拡張した。
// 既存の名前（hook/punch/info/cta）は変えず、追加分だけ番号を付けている
// （過去の履歴データとの互換性を保つため）。
const ROLE_SLOTS = {
  hook:  ["hook"],
  punch: ["punch", "punch2"],
  info:  ["info", "info2", "info3", "info4"],
  cta:   ["cta"],
};

// テンプレート各要素の文字サイズ。2026-08-07 実測。
// 縁取り幅は「文字サイズに対する比率」で持っているため、実際のvmin値に
// 変換するのに使う。テンプレート側のfont_sizeを変えたら、ここも直すこと。
const ELEMENT_FONT_SIZE_VMIN = {
  // 2026-08-09 にkonishiさんがテンプレート側でサイズ調整したため、その実測値に合わせている。
  // hook と cta は font_size の指定が無く既定値のままなので、
  // 縁取りの計算用に妥当な値を仮置きしている。
  hook: 8,
  info: 14.14, info2: 14.14, info3: 14.14, info4: 14.14,
  cta: 8,
  punch: 17.04, punch2: 17.04,
};

/** テンプレートに存在する全ての枠名 */
const ALL_SLOTS = Object.values(ROLE_SLOTS).flat();

// 同時に表示されるテロップが画面上で重ならないよう、枠ごとの定位置を持つ。
// テンプレート側の位置設定は、複数のinfoが全く同じ位置にあるなど
// 同時表示を想定していなかったため、こちらから毎回上書きする。
//
// y は画面上からの中心位置(%)、height は占有する高さ(%)。
// 上から順に並べ、隣同士が重ならないよう間隔を空けてある。
const SLOT_LAYOUT = {
  hook:   { y: 13, height: 15 },
  punch:  { y: 40, height: 14 },
  punch2: { y: 56, height: 14 },
  info:   { y: 71, height: 10 },
  info2:  { y: 82, height: 10 },
  // info3/info4 は info/info2 と同じ位置を使い回す。
  // 補足を3つ以上「同時に」出すことは想定していないため
  // （時間をずらして出す分には問題ない）。
  info3:  { y: 71, height: 10 },
  info4:  { y: 82, height: 10 },
  cta:    { y: 93, height: 9 },
};

/**
 * 2つのテロップが時間的に重なっているか判定する。
 * 重なっていなければ、同じ位置に置いても問題ない。
 */
function isTimeOverlapping(a, b) {
  return a.start < b.end && b.start < a.end;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { videoUrl, videoDuration = 5, captions = [] } = req.body || {};

  if (!videoUrl) {
    return res.status(400).json({ error: "videoUrl が必要です" });
  }
  if (!Array.isArray(captions) || captions.length === 0) {
    return res.status(400).json({ error: "captions が必要です" });
  }

  try {
    const templateId = getTemplateId();

    const modifications = {
      "background.source": videoUrl,
      "duration": Number(videoDuration) || 5,
    };

    // 同じroleでも複数のテロップを焼き込めるよう、roleごとに複数の枠を持つ。
    // 枠を使い切ったぶんだけ skipped に記録して、消えたことが分かるようにする。
    const slotCursor = {};       // role => 次に使う枠のインデックス
    const usedSlots = new Set(); // 実際に使った枠名（未使用枠を空にするため）
    const skipped = [];
    const placed = [];           // 実際に配置したテロップ（位置決めに使う）

    const degradedNotes = []; // グラデーション簡略化・フォント未検証など、見た目が妥協された箇所の記録

    for (const cap of captions) {
      if (!cap || typeof cap.text !== "string" || !cap.text.trim()) continue;
      if (!KNOWN_ROLES.has(cap.role)) continue;

      // このroleに割り当てられた枠のうち、まだ使っていないものを取る
      const slots = ROLE_SLOTS[cap.role] || [];
      const cursor = slotCursor[cap.role] || 0;
      if (cursor >= slots.length) {
        // 枠を使い切った。テンプレートに枠を足さない限り、これ以上は焼き込めない
        skipped.push({ role: cap.role, text: cap.text.trim(), reason: "枠が不足" });
        continue;
      }
      const slot = slots[cursor];
      slotCursor[cap.role] = cursor + 1;
      usedSlots.add(slot);

      const start = Math.max(0, Number(cap.start) || 0);
      const end = Number(cap.end);
      const dur = Math.max(0.3, (Number.isFinite(end) ? end : start + 2) - start);

      modifications[`${slot}.text`] = cap.text.trim();
      modifications[`${slot}.time`] = start;
      modifications[`${slot}.duration`] = Number(dur.toFixed(2));

      // 配置した内容を覚えておく（後で位置を決めるのに使う）
      placed.push({ slot, role: cap.role, start, end: start + dur, text: cap.text.trim() });

      // 色・フォントを styleId から自動決定する
      // styleId（色・装飾）とfontId（書体）は、AIがそれぞれ別の観点で選んでいる。
      // fontIdはネタとブランドの雰囲気から選ばれたもので、styleId由来の書体より優先される。
      // styleIdToModifications は要素名を渡すと `{要素名}.xxx` の形で返すので、
      // roleではなく実際の枠名（slot）を渡す
      const styleResult = styleIdToModifications(cap.styleId, slot, CAPTION_STYLE_DEFS, cap.role, cap.fontId);
      for (const [key, value] of Object.entries(styleResult.modifications)) {
        if (key.endsWith("._strokeWidthRatio")) {
          // 比率のまま送るとCreatomateが理解できないため、
          // この要素の実際の文字サイズ(vmin)を掛けて絶対値に変換する
          const fontSizeVmin = ELEMENT_FONT_SIZE_VMIN[slot] ?? 8;
          const strokeVmin = (value * fontSizeVmin).toFixed(2);
          modifications[`${slot}.stroke_width`] = `${strokeVmin} vmin`;
        } else {
          modifications[key] = value;
        }
      }
      if (styleResult.degraded) {
        degradedNotes.push({ slot, role: cap.role, styleId: cap.styleId, reason: styleResult.reason });
      }

      // アニメーションを適用する。
      // Creatomateは要素ごとに animations 配列を持つので、そこを丸ごと差し替える。
      // 動きの無いテロップは素人っぽく見えるため、必ず何か入れる方針。
      const animDef = animationIdToDefinition(cap.animationId);
      if (animDef) {
        modifications[`${slot}.animations`] = animDef;
      } else if (cap.animationId) {
        // AIが存在しないIDを返した場合。テンプレート側の既定アニメーションが
        // そのまま使われるので致命的ではないが、記録は残す
        degradedNotes.push({
          role: cap.role,
          animationId: cap.animationId,
          reason: `アニメーション「${cap.animationId}」が対応表に無いため、テンプレート既定の動きを使用`,
        });
      }
    }

    // ── 位置の決定 ──────────────────────────────
    // 同じ時間に表示されるテロップ同士が画面上で重ならないようにする。
    //
    // テンプレート側の位置は「同時表示」を想定しておらず、
    // 特に info / info2 / info3 / info4 は全く同じ位置にある。
    // そのままでは同時に出したときに文字が重なって読めなくなるため、
    // ここで毎回、位置を明示的に指定し直す。
    //
    // ただし、時間が重ならないテロップまで無理に散らすと、
    // 単独で出るときに画面の隅に寄って不自然になる。
    // そこで「同時に出るものだけ」定位置へ振り分ける方針にしている。
    for (const item of placed) {
      // このテロップと時間が重なる他のテロップがあるか
      const hasOverlap = placed.some(other =>
        other.slot !== item.slot && isTimeOverlapping(item, other)
      );

      if (hasOverlap) {
        // 重なるものがあるので、枠ごとの定位置へ振り分ける
        const layout = SLOT_LAYOUT[item.slot];
        if (layout) {
          modifications[`${item.slot}.y`] = `${layout.y}%`;
          modifications[`${item.slot}.height`] = `${layout.height}%`;
        }
      }
      // 重なるものが無ければ、テンプレート側の位置をそのまま使う
    }

    // テンプレートには8枠が常に存在する。
    // 今回のcaptionsで使わなかった枠は、明示的に空文字で上書きしないと、
    // テンプレートに以前保存された文字（過去のテスト時に入力した「テスト」等）
    // がそのまま焼き込まれてしまう（2026-08-08 実機で確認：captionsが3個の
    // ときに、使われなかった4個目の枠の残留文字が動画に写り込んだ）。
    for (const slot of ALL_SLOTS) {
      if (!usedSlots.has(slot)) {
        modifications[`${slot}.text`] = "";
      }
    }

    const data = await creatomateFetch("/renders", {
      method: "POST",
      body: JSON.stringify({
        template_id: templateId,
        modifications,
        // テンプレート自体が render_scale: 0.375（本来の37.5%サイズ）を
        // 既定値として持っており、それを引き継ぐと文字がボヤけて見える
        // （2026-08-07 実機で確認：720x1280が270x480で書き出されていた）。
        // フルサイズで書き出すよう明示的に上書きする。
        render_scale: 1,
      }),
    });

    const render = Array.isArray(data) ? data[0] : data;

    // Creatomateは「指定したフォントが見つからないので別のフォントに差し替えた」
    // といった問題を warnings で通知してくるが、エラーにはしない（黙って別の
    // フォントでレンダリングされる）。捨てるとフォント名の綴りミスなどに
    // 気づけなくなるため、必ずログに残し、呼び出し側にも返す。
    // どのアニメーションで焼き込んだかをログに残す（Vercelで確認用）
    const appliedAnims = Object.entries(modifications)
      .filter(([k]) => k.endsWith(".animations"))
      .map(([k, v]) => `${k.replace(".animations", "")}=${v?.[0]?.type || "?"}`);
    console.log(`[creatomate-burn] 使用枠: ${[...usedSlots].join(", ") || "なし"}`);
    if (appliedAnims.length > 0) {
      console.log("[creatomate-burn] 適用したアニメーション:", appliedAnims.join(", "));
    }
    if (degradedNotes.length > 0) {
      console.warn("[creatomate-burn] 見た目が簡略化された箇所:", JSON.stringify(degradedNotes));
    }

    const warnings = Array.isArray(render?.warnings) ? render.warnings : [];
    if (warnings.length > 0) {
      console.warn("[creatomate-burn] Creatomateからの警告:", JSON.stringify(warnings));
    }

    return res.status(200).json({
      renderId: render?.id,
      status: render?.status,
      url: render?.url || null,
      modifications, // デバッグ用。実際に送った内容をそのまま返す
      skipped,        // 同じroleが重複していて焼き込まれなかったテロップ（テンプレートの枠不足）
      degradedNotes,  // グラデーション簡略化・フォント未検証などで見た目が妥協された箇所
      warnings,       // Creatomate側の警告（フォント名の不一致など）
    });

  } catch (err) {
    console.error("creatomate-burn error:", err.message, err.detail);
    return res.status(500).json({
      error: err.message || "焼き込みの開始に失敗しました",
      detail: err.detail,
    });
  }
}
