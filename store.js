// ══════════════════════════════════════════════════════════════════════════════
// 資料保存與下載（純瀏覽器，不上傳任何雲端）
// ══════════════════════════════════════════════════════════════════════════════
// ① 每完成一回合就把整個場次存進瀏覽器本機儲存（localStorage）——重新整理、當掉都不會遺失。
// ② 場次結束時自動下載**單一 zip**到這台電腦的「下載」資料夾（只下載一個檔，
//    避免瀏覽器跳出「允許下載多個檔案」）；結束畫面另有「Download data again」按鈕。
// ③ zip 由本檔自行產生（store 模式、不壓縮），不依賴任何外部函式庫或 CDN。
// 資料只存在這台電腦的瀏覽器裡，不會送到任何伺服器。

window.Store = (() => {
  const PREFIX = 'prague-session::';
  const MAX_KEPT = 30;                 // 瀏覽器裡最多保留幾個場次（超過時刪最舊的）

  // ── 牆上時間（含時區，到毫秒）：供事後與 Gazepoint、Garmin 對齊 ──────────────
  function wall(d) {
    d = d || new Date();
    const p = (n, w = 2) => String(n).padStart(w, '0');
    const off = -d.getTimezoneOffset(), sign = off < 0 ? '-' : '+';
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:`
      + `${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}${sign}${p(Math.floor(Math.abs(off) / 60))}:${p(Math.abs(off) % 60)}`;
  }
  function stamp(d) {
    d = d || new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  }
  const tzName = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ''; } };
  const tzOffset = () => wall().slice(-6);

  // ── CSV ─────────────────────────────────────────────────────────────────────
  const esc = v => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const csv = (cols, rows) => [cols.join(',')].concat(rows.map(r => r.map(esc).join(','))).join('\r\n') + '\r\n';
  const num = v => (v === null || v === undefined || v === '' || isNaN(+v)) ? null : +v;

  // ── 最小 zip（不壓縮，只打包）：不需要任何外部函式庫 ─────────────────────────
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function makeZip(files, date) {
    date = date || new Date();
    const enc = new TextEncoder();
    const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
    const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    const parts = [], central = [];
    let offset = 0;
    files.forEach(f => {
      const name = enc.encode(f.name), data = enc.encode(f.text);
      const crc = crc32(data);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true);
      lh.setUint16(6, 0x0800, true);                 // 檔名為 UTF-8
      lh.setUint16(8, 0, true);                      // 不壓縮（store）
      lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
      ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
      ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
      ch.setUint16(28, name.length, true);
      ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + data.length;
    });
    const centralSize = central.reduce((a, b) => a + b.length, 0);
    const eo = new DataView(new ArrayBuffer(22));
    eo.setUint32(0, 0x06054b50, true);
    eo.setUint16(8, files.length, true); eo.setUint16(10, files.length, true);
    eo.setUint32(12, centralSize, true); eo.setUint32(16, offset, true);
    return new Blob([...parts, ...central, new Uint8Array(eo.buffer)], { type: 'application/zip' });
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 4000);
  }

  // ── 由場次資料產生各個檔案 ──────────────────────────────────────────────────
  // D = { session, rounds, events, answers, layouts, qRows }
  // summary.csv：一列＝一個回合（含練習 round 0）。manual_order、時間點事件等只在 session.json／events.jsonl
  function summaryColumns() {
    return ['pid', 'latin_row', 'round', 'text_type', 'form', 'passage_id', 'passage_title', 'words', 'limit_s',
      'answers', 'correct_flags', 'correct', 'n_items', 'n_scored', 'accuracy', 'rt_s', 'end_reason',
      'first_answer_s', 'last_answer_s', 'n_remove', 'n_add', 'n_wrong_to_right', 'n_right_to_wrong',
      'nasa_mental', 'nasa_physical', 'nasa_temporal', 'nasa_performance', 'nasa_effort', 'nasa_frustration', 'nasa_rtlx',
      'vasa_pos', 'vasa_moved', 'practice_rt_s', 'practice_words', 'wall_start', 'wall_end', 'overflow'];
  }

  function summaryRows(d) {
    const s = d.session || {}, rounds = d.rounds || {};
    return Object.keys(rounds).map(Number).sort((a, b) => a - b).map(k => {
      const r = rounds[k];
      const nasa = (r.nasa || {}).subscales || {};
      const isP = r.round === 0;
      return [s.pid, s.latinRow, r.round, r.textType || '', r.form || '', r.passageId || '', r.passageTitle || '', r.words,
        r.limit_s,
        (r.answers || []).map(a => a || '-').join(' '),
        (r.correctFlags || []).map(f => f === null || f === undefined ? 'NA' : (f ? 1 : 0)).join(' '),   // NA＝無解題
        r.correct, r.nItems, r.nScored, r.accuracy, r.rt_s, r.endReason,
        r.first_answer_s, r.last_answer_s, r.n_remove, r.n_add, r.n_wrong_to_right, r.n_right_to_wrong,
        nasa.mental, nasa.physical, nasa.temporal, nasa.performance, nasa.effort, nasa.frustration, (r.nasa || {}).rtlx,
        r.vasa_pos, r.vasa_moved === undefined ? null : (r.vasa_moved ? 1 : 0),
        isP ? r.practice_rt_s : '', isP ? r.practice_words : '',
        r.wall_start, r.wall_end, r.overflow]
        .map(v => v === undefined || v === null ? '' : v);
    });
  }

  // answers.csv：一列＝受試者的一次點選（閱讀題、量表、前後測問卷都算）
  const ANSWER_COLS = ['pid', 'context', 'round', 'source', 'item', 'item_label', 'option', 'value',
    'correct', 'action', 'prev_option', 't_ms', 'wall_time'];
  // layout.csv：一列＝一個回合的版面檢查（AOI 座標改由 index.html?aoi 每篇匯出一份固定表）
  const LAYOUT_COLS = ['pid', 'round', 'passage_id', 'fullscreen', 'scale',
    'viewport_w', 'viewport_h', 'screen_w', 'screen_h'];
  // VAS-A：score＝0–30 整數；pos＝定位比例（0–1）、moved＝是否動過、first_move_ms＝第一次移動前的毫秒數（其他量表留空）
  const QUEST_COLS = ['pid', 'context', 'round', 'name', 'answers', 'values', 'score', 'pos', 'moved', 'first_move_ms', 'wall_time'];

  function buildFiles(d) {
    const pid = (d.session || {}).pid;
    const flat = sc => {
      sc = sc || {};
      return sc.subscales || Object.fromEntries(Object.entries(sc).filter(([, v]) => typeof v !== 'object'));
    };
    return [
      { name: 'summary.csv', text: '﻿' + csv(summaryColumns(), summaryRows(d)) },
      { name: 'answers.csv', text: '﻿' + csv(ANSWER_COLS, (d.answers || []).map(a =>
          [pid, a.context, a.round, a.source, a.item, a.itemLabel, a.option, a.value,
           a.correct === null || a.correct === undefined ? '' : (a.correct ? 1 : 0),
           a.action, a.prevOption, a.t_ms, a.wall_time])) },
      { name: 'layout.csv', text: '﻿' + csv(LAYOUT_COLS, (d.layouts || []).map(l =>
          [pid, l.round, l.passageId, l.fullscreen ? 1 : 0, l.scale, l.viewport_w, l.viewport_h, l.screen_w, l.screen_h])) },
      { name: 'questionnaires.csv', text: '﻿' + csv(QUEST_COLS, (d.qRows || []).map(q =>
          [pid, q.context, q.round === null || q.round === undefined ? '' : q.round, q.name,
           (q.answers || []).join(' '), (q.values || []).join(' '),
           q.vas ? q.score.score : JSON.stringify(flat(q.score)),
           q.vas ? q.vas.pos : '', q.vas ? (q.vas.moved ? 1 : 0) : '', q.vas ? q.vas.firstMoveMs : '',
           q.wall_time])) },
      { name: 'events.jsonl', text: (d.events || []).map(e => JSON.stringify(e)).join('\n') + '\n' },
      { name: 'session.json', text: JSON.stringify({ session: d.session, rounds: d.rounds }, null, 2) },
    ];
  }

  const folderName = d => {
    const s = d.session || {};
    return `P${String(s.pid).padStart(2, '0')}_${s.created}`;
  };

  function downloadSession(d) {
    const base = folderName(d);
    const files = buildFiles(d).map(f => ({ name: `${base}/${f.name}`, text: f.text }));
    download(makeZip(files), `${base}.zip`);
    return `${base}.zip`;
  }

  // ── 瀏覽器本機儲存 ──────────────────────────────────────────────────────────
  function save(d) {
    if (!d.session) return false;
    const key = PREFIX + folderName(d);
    try {
      localStorage.setItem(key, JSON.stringify({ ...d, savedAt: wall() }));
      prune();
      return true;
    } catch (e) {
      console.warn('本機儲存失敗（可能已滿）', e);
      return false;
    }
  }
  function listKeys() {
    const out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) out.push(k);
    }
    return out.sort();
  }
  function list() {
    return listKeys().map(k => {
      try {
        const d = JSON.parse(localStorage.getItem(k));
        const rounds = d.rounds || {};
        const total = ((d.session || {}).plan || []).length;
        return { key: k, name: k.slice(PREFIX.length), pid: (d.session || {}).pid,
          savedAt: d.savedAt,
          done: Object.keys(rounds).filter(r => +r !== 0 && rounds[r].status === 'done').length, total,
          bytes: (localStorage.getItem(k) || '').length };
      } catch (e) { return { key: k, name: k.slice(PREFIX.length), broken: true }; }
    }).sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
  }
  const load = key => { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } };
  const remove = key => localStorage.removeItem(key);
  function prune() {
    const keys = listKeys();
    if (keys.length <= MAX_KEPT) return;
    list().slice(MAX_KEPT).forEach(x => localStorage.removeItem(x.key));
  }

  return { wall, stamp, tzName, tzOffset, csv, makeZip, download, buildFiles, summaryColumns, summaryRows,
           folderName, downloadSession, save, list, load, remove,
           downloadStored(key) { const d = load(key); return d ? downloadSession(d) : null; } };
})();
