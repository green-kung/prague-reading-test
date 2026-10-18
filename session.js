// ══════════════════════════════════════════════════════════════════════════════
// 場次資料記錄（單頁版）
// ══════════════════════════════════════════════════════════════════════════════
// 網站只有受試者畫面一頁，沒有研究者儀表板、沒有伺服器、不連眼動儀。
// 這個模組負責：保存場次狀態、記錄每一筆事件與每一次點選、計分彙整，
// 以及呼叫 store.js 存進瀏覽器並打包成 zip 下載。
//
// 眼動由 Gazepoint 自己的軟體在同一台電腦錄製，兩邊靠同一個系統時鐘對齊：
// 每筆事件都附含時區的牆上時間到毫秒。各區域的座標不在這裡記，見 index.html 的 ?aoi 匯出（每篇一份固定表）。

window.Session = (() => {
  const S = {
    session: null,          // 場次設定
    rounds: {},             // 回合 → 結果
    events: [], answers: [], layouts: [], qRows: [],
    lastSaved: null, lastDownload: null,
  };

  const seenQ = new Set();   // 已點過的「回合:題號」→ 分辨 first 與 add
  const num = v => (v === null || v === undefined || v === '' || isNaN(+v)) ? null : +v;
  const W = () => Store.wall();
  const data = () => ({ session: S.session, rounds: S.rounds, events: S.events,
    answers: S.answers, layouts: S.layouts, qRows: S.qRows });

  function log(ev) {
    const e = { client_ms: Date.now(), wall_time: W(), ...ev };
    S.events.push(e);
    return e;
  }
  function persist() {                       // 存進瀏覽器本機儲存（備援）
    if (!S.session) return;
    if (Store.save(data())) S.lastSaved = W();
  }
  function download() {                      // 打包成單一 zip 下載
    if (!S.session) return null;
    const name = Store.downloadSession(data());
    S.lastDownload = W();
    log({ type: 'download', file: name });
    persist();
    return name;
  }

  return {
    get state() { return S; },
    data, log, persist, download,
    get plan() { return (S.session || {}).plan || []; },
    get total() { return ((S.session || {}).plan || []).length; },

    // ── 建立場次 ──────────────────────────────────────────────────────────────
    create({ pid, latinRow, plan, practice, design }) {
      S.session = {
        pid, created: Store.stamp(), startedWall: W(),
        timezone: Store.tzName(), tzOffset: Store.tzOffset(),
        latinRow,
        // 順序一律由順序表帶出，不提供手動調整（2026-10-05 規格第 11 項）
        manualOrder: false,
        plan: plan.map((p, i) => ({ ...p, round: i + 1 })),
        roundQuestionnaires: design.roundQuestionnaires || [],
        preQuestionnaires: design.preQuestionnaires || [],
        postQuestionnaires: design.postQuestionnaires || [],
        timeMarks: design.timeMarks || [],
        restAfterRounds: design.restAfterRounds || [],
        practice, timerInfoSeconds: design.timerInfoSeconds || 10,
        userAgent: navigator.userAgent, notes: [], pre: {}, post: {},
      };
      seenQ.clear();
      S.rounds = {}; S.events = []; S.answers = []; S.layouts = []; S.qRows = [];
      S.lastSaved = null; S.lastDownload = null;
      log({ type: 'session_start', pid, latinRow,
        order: S.session.plan.map(p => p.passageId),
        screen_w: screen.width, screen_h: screen.height });
      persist();
      return S.session;
    },

    // ── 回合 ──────────────────────────────────────────────────────────────────
    startRound(r, cfg) {
      const rec = { round: r, textType: cfg.textType, form: cfg.form,
        passageId: cfg.passageId, status: 'running',
        // 作答過程（readingClick 累加）：first_answer_s／last_answer_s＝第一次／最後一次點選項的秒數
        first_answer_s: null, last_answer_s: null, n_remove: 0, n_add: 0, n_wrong_to_right: 0, n_right_to_wrong: 0 };
      if (r !== 0) {
        const p = this.plan[r - 1];
        Object.assign(rec, { passageTitle: p.passageTitle, words: p.words, limit_s: p.limit_s });
      }
      S.rounds[r] = rec;
      log({ type: 'round_start', round: r, passageId: cfg.passageId });
      return rec;
    },
    // 版面檢查 → layout.csv（每回合一列：是否全螢幕、縮放比例、視窗與螢幕尺寸）
    recordLayout(r, info) {
      const rec = S.rounds[r];
      if (rec) { rec.passageTitle = info.passageTitle; rec.overflow = info.overflow; rec.words = info.words; }
      S.layouts.push({ round: r, passageId: info.passageId, fullscreen: info.fullscreen, scale: info.scale,
        viewport_w: info.viewport_w, viewport_h: info.viewport_h, screen_w: info.screen_w, screen_h: info.screen_h });
      log({ type: 'layout', round: r, ...info });
    },
    trialStart(r, info) {
      const rec = S.rounds[r], e = log({ type: 'trial_start', round: r, ...info });
      if (rec) {
        rec.wall_start = e.wall_time;
        rec.start_client_ms = e.client_ms;
        if (info.limit_s !== null && info.limit_s !== undefined) rec.limit_s = info.limit_s;
        if (info.words !== null && info.words !== undefined) rec.words = info.words;
      }
      return e;
    },
    // 閱讀題每選／取消一個選項都記一列：opt＝點完後的選取集合（如 AC），toggle＝+C／-C，
    // prevOpt＝點之前的選取集合；correct／prevCorrect＝點完後／點之前的集合是否完全等於可證成選項（無解題為 null）
    // action：first＝該題第一次點選；add＝之後的每一次加選（+）；remove＝取消（-），這才算改答
    readingClick(r, { q, opt, toggle, correct, prevCorrect, prevOpt, t_ms, answered }) {
      const rec = S.rounds[r];
      const action = toggle[0] === '-' ? 'remove' : seenQ.has(`${r}:${q}`) ? 'add' : 'first';
      seenQ.add(`${r}:${q}`);
      const e = log({ type: 'answer', round: r, q, opt, toggle, action, correct, prevCorrect, prevOpt: prevOpt || null, t_ms, answered });
      S.answers.push({ context: r === 0 ? 'practice' : 'round', round: r, source: 'reading',
        item: q, itemLabel: '', option: opt, value: toggle, correct,
        action, prevOption: prevOpt || '', t_ms, wall_time: e.wall_time });
      if (rec) {
        const s = Math.round(t_ms) / 1000;
        if (rec.first_answer_s === null) rec.first_answer_s = s;
        rec.last_answer_s = s;
        if (action === 'remove') rec.n_remove++;
        if (action === 'add') rec.n_add++;
        // 對錯變化：該題第一次點選之前沒有作答，不算變化；無解題（correct 為 null）不計
        if (action !== 'first' && correct !== null && prevCorrect !== null) {
          if (!prevCorrect && correct) rec.n_wrong_to_right++;
          if (prevCorrect && !correct) rec.n_right_to_wrong++;
        }
      }
    },
    timeMark(r, name, info) {
      const e = log({ type: name, round: r, ...info });
      const rec = S.rounds[r];
      if (rec) rec[`t${name.split('_')[1]}_s`] = Math.round(info.t_ms || 0) / 1000;
      return e;
    },
    trialEnd(r, info) {
      const rec = S.rounds[r], e = log({ type: 'trial_end', round: r, ...info });
      if (rec) {
        ['endReason', 'rt_s', 'elapsed_s', 'answers', 'correctFlags', 'correct', 'nItems', 'nScored', 'accuracy',
          'passageTitle', 'words'].forEach(k => { rec[k] = info[k]; });
        rec.wall_end = e.wall_time;
        rec.status = 'done';
        if (r === 0) {   // 練習回合＝個人閱讀速度基準
          const rt = num(rec.rt_s) !== null ? num(rec.rt_s) : num(rec.elapsed_s), w = num(rec.words);
          rec.practice_rt_s = rt; rec.practice_words = w;
          rec.sec_per_word = (rt && w) ? Math.round(rt / w * 1e5) / 1e5 : null;
        }
      }
      persist();                                   // ★ 每完成一回合就存一次
      return e;
    },

    // ── 量表／問卷 ────────────────────────────────────────────────────────────
    questionnaireStart(name, context, round) {
      return log({ type: 'questionnaire_start', name, context, round });
    },
    // 量表的每一次點選都記一列；action：first＝該題第一次點、change＝改選別的、repeat＝再點同一個
    questionnaireClick(info) {
      const e = log({ type: 'q_click', ...info });
      S.answers.push({ context: info.context, round: info.round === undefined ? '' : info.round,
        source: info.name, item: info.item, itemLabel: info.itemLabel || '',
        option: info.optionText, value: info.value, correct: null,
        action: info.action, prevOption: info.prevOptionText || '',
        t_ms: info.t_ms, wall_time: e.wall_time });
    },
    questionnaireDone(info) {
      const e = log({ type: 'questionnaire', ...info });
      const rec = info.round !== undefined && info.round !== null ? S.rounds[info.round] : null;
      if (info.context === 'round' && rec) {
        rec[info.name] = info.score;
        if (info.vas) { rec[`${info.name}_pos`] = info.vas.pos; rec[`${info.name}_moved`] = info.vas.moved; }
      }
      else if (info.context === 'pretest' || info.context === 'posttest') {
        S.session[info.context === 'pretest' ? 'pre' : 'post'][info.name] = info.score;
      }
      S.qRows.push({ context: info.context, round: info.round, name: info.name,
        answers: info.answers, values: info.values, score: info.score, vas: info.vas || null, wall_time: e.wall_time });
      persist();
      return e;
    },

    // ── 結束 ──────────────────────────────────────────────────────────────────
    end() {
      log({ type: 'session_end' });
      persist();
      let file = null;
      try { file = download(); } catch (e) { log({ type: 'download_failed', error: String(e) }); }
      return file;
    },
  };
})();
