// src/context/GenerationContext.jsx
// 動画生成の進捗を、アプリ全体のどこからでも見えるようにする。
//
// なぜ必要か：
// GeneratePage.jsx の中でだけ state を持っていると、履歴やマイページに
// 移動した瞬間にコンポーネントがアンマウントされ、進捗が見えなくなる。
// （生成処理そのもの＝fetchやsetTimeoutは、Reactのコンポーネントの
// 生死とは関係なく動き続けるが、それを「表示する場所」がGeneratePage
// の中にしか無かった）
//
// このContextを App.jsx の一番外側に置くことで、生成中に他の画面へ
// 移動しても、進捗を保持し続けられる。
//
// 制約：あくまでブラウザのタブ・アプリが開いている間だけ有効。
// タブを完全に閉じる／スマホでアプリを終了すると、生成は途中で止まる。

import { createContext, useContext, useRef, useState, useCallback } from "react";

const GenerationContext = createContext(null);

export function useGeneration() {
  const ctx = useContext(GenerationContext);
  if (!ctx) throw new Error("useGeneration は GenerationProvider の内側で使うこと");
  return ctx;
}

export function GenerationProvider({ children }) {
  // job が null のときは「今、生成しているものは無い」という状態。
  // 一度に1件だけ生成できる想定（同時に複数動画を作る機能は無いため）。
  const [job, setJob] = useState(null);

  // 経過秒数はポーリングのたびに細かく更新されるため、
  // setJobで毎回オブジェクト全体を作り直すと画面のちらつきが出やすい。
  // 経過秒数だけは別のstateに分けている。
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef(null);

  /** 新しい生成を開始する。呼び出し側（GeneratePage）が実際の処理を行い、
      ここでは「今どのプロジェクトを、どのステップまで進めているか」の
      置き場所だけを提供する。 */
  const startJob = useCallback((initial) => {
    startedAtRef.current = Date.now();
    setElapsed(0);
    setJob({
      phase: "loading",      // "loading" | "result"
      loadStep: 0,
      viewed: true,          // 開始した本人が今まさに見ているので true
      videoUrl: null,
      burnedVideoUrl: null,
      videoError: null,
      burnError: null,
      captions: [],
      generatedTexts: {},
      klingPrompt: "",
      ...initial,            // projectId, projectName, projectColor, selected, duration など
    });
  }, []);

  /** 進捗の一部を更新する（loadStepを進める、結果を格納する、など） */
  const updateJob = useCallback((patch) => {
    setJob(prev => prev ? { ...prev, ...(typeof patch === "function" ? patch(prev) : patch) } : prev);
  }, []);

  /** 経過秒数を更新する。pollVideo等から一定間隔で呼ぶ */
  const tickElapsed = useCallback(() => {
    if (!startedAtRef.current) return;
    setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
  }, []);

  /** 完成・失敗を問わず生成が終わったことを示す */
  const finishJob = useCallback((patch) => {
    setJob(prev => prev ? { ...prev, ...patch, phase: "result", viewed: false } : prev);
  }, []);

  /** 結果画面をユーザーが実際に見たら呼ぶ（ステータスバーの強調表示を消すため） */
  const markViewed = useCallback(() => {
    setJob(prev => prev ? { ...prev, viewed: true } : prev);
  }, []);

  /** 生成結果を閉じる・破棄する（次の生成を始める前にも呼ぶ） */
  const clearJob = useCallback(() => {
    setJob(null);
    setElapsed(0);
    startedAtRef.current = null;
  }, []);

  const value = { job, elapsed, startJob, updateJob, tickElapsed, finishJob, markViewed, clearJob };

  return (
    <GenerationContext.Provider value={value}>
      {children}
    </GenerationContext.Provider>
  );
}
