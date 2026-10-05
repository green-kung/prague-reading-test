#!/usr/bin/env python3
"""自動算時限：讀前導實驗下載下來的資料，算出每篇的寬鬆／緊迫秒數。

依據：緊迫＝不限時作答平均 − 1 個標準差（Benson & Beach, 1996, p.223）；
      寬鬆＝平均 ＋ 1 個標準差（本研究設定，與緊迫對稱）。

資料怎麼來：網站跑完一位前導受試者會自動下載一個 `PILOT_P01_日期-時間.zip`。
把全部前導的 zip（或解壓後的資料夾）放進同一個資料夾，然後：

  python3 pilot_limits.py 那個資料夾
  python3 pilot_limits.py ~/Downloads            # 直接掃「下載」資料夾
  python3 pilot_limits.py 資料夾 --sd 1.0        # 改標準差倍數
  python3 pilot_limits.py 資料夾 --median        # 建議值改以中位數為中心（人數少時用）
  python3 pilot_limits.py 資料夾 --all           # 連非 PILOT_ 的場次也納入

zip 不用先解壓，程式會直接讀。

輸出：每篇的人數、平均、標準差、中位數、最小／最大、極端值（離平均超過 2 個標準差者的編號）、
      建議 loose／tight、各題答對率；若前導有收自估時間（est_s），另算自估與實際時間的相關。
      最後印出一段可直接貼回 materials.js 的 limit 與 pilotMean_s。
"""
import argparse
import csv
import io
import math
import zipfile
from pathlib import Path


def mean(xs):
    return sum(xs) / len(xs) if xs else None


def sd(xs):
    """樣本標準差（n − 1）"""
    if len(xs) < 2:
        return None
    m = mean(xs)
    return math.sqrt(sum((x - m) ** 2 for x in xs) / (len(xs) - 1))


def median(xs):
    if not xs:
        return None
    s = sorted(xs)
    n = len(s)
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2


def pearson(xs, ys):
    n = len(xs)
    if n < 3:
        return None
    mx, my = mean(xs), mean(ys)
    sx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    sy = math.sqrt(sum((y - my) ** 2 for y in ys))
    if not sx or not sy:
        return None
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / (sx * sy)


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def read_csv(text):
    return list(csv.DictReader(io.StringIO(text.lstrip('﻿'))))


def find_sessions(root, pilot_only=True):
    """回傳 [(場次名稱, summary.csv 的列)]；zip 與解壓後的資料夾都支援"""
    root = Path(root)
    out, skipped = [], []
    if not root.exists():
        return out, [(str(root), '路徑不存在')]

    def want(name):
        return (not pilot_only) or name.startswith('PILOT_')

    # ① zip 檔
    for z in sorted(root.glob('*.zip')):
        if not want(z.stem):
            skipped.append((z.name, '不是 PILOT_ 開頭（要納入請加 --all）'))
            continue
        try:
            with zipfile.ZipFile(z) as zf:
                hits = [n for n in zf.namelist() if n.endswith('summary.csv')]
                if not hits:
                    skipped.append((z.name, 'zip 裡沒有 summary.csv'))
                    continue
                out.append((z.stem, read_csv(zf.read(hits[0]).decode('utf-8-sig'))))
        except (zipfile.BadZipFile, OSError) as e:
            skipped.append((z.name, f'讀不到（{e}）'))

    # ② 解壓後的資料夾
    for d in sorted(p for p in root.iterdir() if p.is_dir()):
        if not want(d.name):
            continue
        f = d / 'summary.csv'
        if f.exists():
            out.append((d.name, read_csv(f.read_text(encoding='utf-8-sig'))))
        else:
            skipped.append((d.name, '資料夾裡沒有 summary.csv'))

    # ③ 直接把這個資料夾本身當成一個場次
    if (root / 'summary.csv').exists() and want(root.name):
        out.append((root.name, read_csv((root / 'summary.csv').read_text(encoding='utf-8-sig'))))

    return out, skipped


def collect(sessions):
    """把各場次的列依文本分組；只取正式回合（round ≥ 1）且自行送出者"""
    by_passage, notes = {}, []
    for name, rows in sessions:
        for row in rows:
            try:
                rnd = int(float(row.get('round') or -1))
            except ValueError:
                continue
            if rnd < 1:                      # 練習回合（round 0）不納入時限計算
                continue
            rt = num(row.get('rt_s'))
            passage = row.get('passage_id')
            if not passage or rt is None:
                continue
            if (row.get('end_reason') or 'submit') != 'submit':
                notes.append(f"{name} 的 {passage}：end_reason={row.get('end_reason')}，不是自行送出，略過")
                continue
            by_passage.setdefault(passage, []).append(row)
    return by_passage, notes


def item_accuracy(rows):
    """各題答對率（依 correct_flags 欄的 1／0）"""
    cols = []
    for r in rows:
        flags = (r.get('correct_flags') or '').split()
        for i, f in enumerate(flags):
            while len(cols) <= i:
                cols.append([])
            cols[i].append(1 if f == '1' else 0)
    return [mean(c) for c in cols]


def main():
    ap = argparse.ArgumentParser(description='前導實驗 → 建議寬鬆／緊迫時限')
    ap.add_argument('data', nargs='?', default='.', help='放前導 zip 或解壓資料夾的路徑（預設：目前資料夾）')
    ap.add_argument('--sd', type=float, default=1.0, help='標準差倍數（預設 1.0）')
    ap.add_argument('--median', action='store_true', help='建議值以中位數為中心（預設用平均）')
    ap.add_argument('--all', action='store_true', help='連非 PILOT_ 開頭的場次也納入')
    a = ap.parse_args()

    sessions, skipped = find_sessions(a.data, pilot_only=not a.all)
    print(f'資料來源：{Path(a.data).resolve()}')
    if not sessions:
        print('找不到任何前導資料。')
        print('請把網站下載的 PILOT_*.zip（或解壓後的資料夾）放進這個路徑再執行一次；')
        print('若要納入非前導場次，加上 --all。')
        for k, v in skipped:
            print(f'  略過 {k}：{v}')
        return
    print(f'前導場次 {len(sessions)} 個：{", ".join(n for n, _ in sessions)}')
    for k, v in skipped:
        print(f'  略過 {k}：{v}')

    by_passage, notes = collect(sessions)
    for n in notes:
        print('  ' + n)
    print()

    snippet = []
    for passage in sorted(by_passage):
        rows = by_passage[passage]
        rts = [num(r['rt_s']) for r in rows]
        title = rows[0].get('passage_title', '')
        words = rows[0].get('words', '')
        m, s, md = mean(rts), sd(rts), median(rts)
        centre = md if a.median else m
        print(f'── {passage}　{title}（{words} 字）')
        print(f'   人數 {len(rts)}　平均 {m:.1f} 秒　標準差 {"—" if s is None else f"{s:.1f}"}　'
              f'中位數 {md:.1f}　最小 {min(rts):.1f}　最大 {max(rts):.1f}')
        if s and s > 0:
            out = [(r.get('pid'), num(r['rt_s'])) for r in rows if abs(num(r['rt_s']) - m) > 2 * s]
            print('   極端值（離平均 > 2 SD）：' + (', '.join(f'P{p}＝{v:.0f} 秒' for p, v in out) if out else '無'))
        acc = item_accuracy(rows)
        if acc:
            print('   各題答對率：' + '　'.join(f'第 {i + 1} 題 {v * 100:.0f}%' for i, v in enumerate(acc)))
        ests = [(num(r.get('est_s')), num(r['rt_s'])) for r in rows if num(r.get('est_s')) is not None]
        if ests:
            r_ = pearson([e for e, _ in ests], [t for _, t in ests])
            print(f'   自估 vs 實際（n＝{len(ests)}）：自估平均 {mean([e for e, _ in ests]):.1f} 秒，'
                  f'相關 r＝{"—" if r_ is None else f"{r_:.2f}"}')
        if s is None:
            print('   ⚠ 只有 1 人，無法算標準差，暫不建議秒數')
            print()
            continue
        loose, tight = round(centre + a.sd * s), round(centre - a.sd * s)
        print(f'   ★ 建議：寬鬆 {loose} 秒　緊迫 {tight} 秒　'
              f'（{"中位數" if a.median else "平均"} {centre:.1f} ± {a.sd:g} SD＝{s:.1f}）')
        if len(rts) < 5:
            print(f'   ⚠ 只有 {len(rts)} 人，標準差不穩；考慮多收幾位或加 --median')
        if tight <= 0:
            print('   ⚠ 緊迫秒數 ≤ 0，請改用中位數或縮小 --sd')
        print()
        snippet.append((passage, loose, tight, round(centre, 1)))

    print('── 可直接貼回 materials.js（覆蓋每篇的 limit 與 pilotMean_s 兩欄）──')
    for passage, loose, tight, centre in snippet:
        print(f'    {passage}: limit: {{ loose: {loose}, tight: {tight} }}, pilotMean_s: {centre},')
    print('──────────────────────────────────────────────────────────────')
    print('提醒：貼完後重新整理網頁，開始畫面的時限警告會消失，順序表會顯示新秒數。')


if __name__ == '__main__':
    main()
