// ══════════════════════════════════════════════════════════════════════════════
// 場次資料記錄（單頁版）
// ══════════════════════════════════════════════════════════════════════════════
// 網站只有受試者畫面一頁，沒有研究者儀表板、沒有伺服器、不連眼動儀。
// 這個模組負責：保存場次狀態、記錄每一筆事件與每一次點選、計分彙整，
// 以及呼叫 store.js 存進瀏覽器並打包成 zip 下載。
//
// 眼動由 Gazepoint 自己的軟體在同一台電腦錄製，兩邊靠同一個系統時鐘對齊：
// 每筆事件都附含時區的牆上時間到毫秒，每回合另記各區域的螢幕座標（layout.csv）。

window.Session = (() => {
  const S = {
    session: null,          // 場次設定
    rounds: {},             // 回合 → 結果
    events: [], answers: [], layouts: [], qRows: [],
    lastSaved: null, lastDownload: null,
  };

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
    isPilot: () => !!(S.session || {}).pilot,

    // ── 建立場次 ──────────────────────────────────────────────────────────────
    create({ pid, pilot, latinRow, plan, practice, design }) {
      S.session = {
        pid, created: Store.stamp(), startedWall: W(),
        timezone: Store.tzName(), tzOffset: Store.tzOffset(),
        pilot: !!pilot, latinRow,
        // 順序一律由順序表帶出，不提供手動調整（2026-10-05 規格第 11 項）
        manualOrder: false,
        plan: plan.map((p, i) => ({ ...p, round: i + 1 })),
        roundQuestionnaires: design.roundQuestionnaires || [],
        preQuestionnaires: design.preQuestionnaires || [],
        postQuestionnaires: design.postQuestionnaires || [],
        timeMarks: design.timeMarks || [],
        restAfterRounds: design.restAfterRounds || [],
        practice, timerInfoSeconds: design.timerInfoSeconds || 10,
        pilotEstimate: !!design.pilotEstimate,
        userAgent: navigator.userAgent, notes: [], pre: {}, post: {},
      };
      S.rounds = {}; S.events = []; S.answers = []; S.layouts = []; S.qRows = [];
      S.lastSaved = null; S.lastDownload = null;
      log({ type: 'session_start', pid, pilot: !!pilot, latinRow,
        order: S.session.plan.map(p => `${p.time}·${p.passageId}`),
        screen_w: screen.width, screen_h: screen.height });
      persist();
      return S.session;
    },

    // ── 回合 ──────────────────────────────────────────────────────────────────
    startRound(r, cfg) {
      const rec = { round: r, time: cfg.time, textType: cfg.textType, form: cfg.form,
        passageId: cfg.passageId, status: 'running' };
      if (r !== 0) {
        const p = this.plan[r - 1];
        Object.assign(rec, { pilotMean_s: p.pilotMean_s, passageTitle: p.passageTitle, words: p.words });
        if (!this.isPilot()) rec.limit_s = p.limit_s;   // 前導不限時，不寫入時限
      }
      S.rounds[r] = rec;
      log({ type: 'round_start', round: r, time: cfg.time || '', passageId: cfg.passageId });
      return rec;
    },
    // 版面：各區域的螢幕座標 → layout.csv
    recordLayout(r, info) {
      const rec = S.rounds[r];
      if (rec) { rec.passageTitle = info.passageTitle; rec.overflow = info.overflow; rec.words = info.words; }
      (info.regions || []).forEach(g => S.layouts.push({ round: r, region: g.region, x: g.x, y: g.y, w: g.w, h: g.h,
        viewport_w: info.viewport_w, viewport_h: info.viewport_h, screen_w: info.screen_w, screen_h: info.screen_h }));
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
    // 閱讀題的每一次點選都記一列（含是否為改答）
    readingClick(r, { q, opt, correct, prevOpt, t_ms, answered }) {
      const e = log({ type: 'answer', round: r, q, opt, correct, prevOpt: prevOpt || null, t_ms, answered });
      S.answers.push({ context: r === 0 ? 'practice' : 'round', round: r, source: 'reading',
        item: q, itemLabel: '', option: opt, value: '', correct,
        isChange: !!prevOpt, prevOption: prevOpt || '', t_ms, wall_time: e.wall_time });
    },
    timeMark(r, name, info) {
      const e = log({ type: name, round: r, ...info });
      const rec = S.rounds[r];
      if (rec) rec[`t${name.split('_')[1]}_s`] = Math.round(info.t_ms || 0) / 1000;
      return e;
    },
    estimate(r, info) {
      const e = log({ type: 'estimate', round: r, ...info });
      (S.rounds[r] = S.rounds[r] || { round: r }).est_s = info.est_s;
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
    // 量表的每一次點選都記一列（含是否為改答）
    questionnaireClick(info) {
      const e = log({ type: 'q_click', ...info });
      S.answers.push({ context: info.context, round: info.round === undefined ? '' : info.round,
        source: info.name, item: info.item, itemLabel: info.itemLabel || '',
        option: info.optionText, value: info.value, correct: null,
        isChange: !!info.isChange, prevOption: info.prevOptionText || '',
        t_ms: info.t_ms, wall_time: e.wall_time });
    },
    questionnaireDone(info) {
      const e = log({ type: 'questionnaire', ...info });
      const rec = info.round !== undefined && info.round !== null ? S.rounds[info.round] : null;
      if (info.context === 'round' && rec) rec[info.name] = info.score;
      else if (info.context === 'pretest' || info.context === 'posttest') {
        S.session[info.context === 'pretest' ? 'pre' : 'post'][info.name] = info.score;
      }
      S.qRows.push({ context: info.context, round: info.round, name: info.name,
        answers: info.answers, values: info.values, score: info.score, wall_time: e.wall_time });
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
