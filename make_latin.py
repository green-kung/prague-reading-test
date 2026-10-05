#!/usr/bin/env python3
"""產生 Williams 平衡拉丁方格順序表，印出可直接貼進 design.js 的 latinSquare。

用法：python3 make_latin.py 3        # 3 種文本類型 → 2 × 3 ＝ 6 個條件、6 列
      python3 make_latin.py 2 4     # 一次產生 2 類與 4 類兩張表

產生方式（與 design.js 註解相同）：
  ① 2N 個條件依 (寬鬆, 緊迫) × (類型一, 類型二, …) 編號 0…2N−1；
  ② 第 1 列用 Williams 平衡序列（偶數個處理時，一張方格即可平衡一階殘留效果）；
  ③ 第 i 列＝第 1 列每個編號加 i（模 2N）；
  ④ 篇別：第 i 列的類型 k，(i + k) 為偶數時「寬鬆配 A、緊迫配 B」，否則相反。
產生後會自行檢查：每列格數＝2N、每種「時間 × 文本類型」各一次、同一類型的 A／B 各一次。
"""
import sys


def williams_row0(n):
    """偶數 n 的 Williams 序列：0, 1, n−1, 2, n−2, 3, …"""
    if n % 2:
        raise ValueError('條件數必須是偶數（2 × 文本類型數）')
    out, lo, hi = [0], 1, n - 1
    while len(out) < n:
        out.append(lo)
        lo += 1
        if len(out) < n:
            out.append(hi)
            hi -= 1
    return out


def make(N):
    n = 2 * N
    row0 = williams_row0(n)
    rows = []
    for i in range(n):
        cells = []
        for idx in [(c + i) % n for c in row0]:
            k = idx // 2 + 1
            time = 'loose' if idx % 2 == 0 else 'tight'
            if (i + k) % 2 == 0:
                form = 'A' if time == 'loose' else 'B'
            else:
                form = 'B' if time == 'loose' else 'A'
            cells.append((time, f'type{k}', form))
        rows.append(cells)
    return rows


def check(rows, N):
    problems = []
    for i, row in enumerate(rows, 1):
        if len(row) != 2 * N:
            problems.append(f'第 {i} 列格數 {len(row)} ≠ {2 * N}')
        if len({(t, ty) for t, ty, _ in row}) != 2 * N:
            problems.append(f'第 {i} 列有重複的「時間 × 文本類型」')
        for k in range(1, N + 1):
            forms = sorted(f for _, ty, f in row if ty == f'type{k}')
            if forms != ['A', 'B']:
                problems.append(f'第 {i} 列 type{k} 的篇別為 {forms}，應為 A 與 B 各一次')
    return problems


def main():
    args = sys.argv[1:] or ['3']
    for arg in args:
        try:
            N = int(arg)
            if N < 1:
                raise ValueError
        except ValueError:
            print(f'略過「{arg}」：請給正整數（文本類型數）')
            continue
        rows = make(N)
        problems = check(rows, N)
        print(f'// ── {N} 類文本 → {2 * N} 個條件、{2 * N} 回合、{len(rows)} 列 ──')
        print('  latinSquare: [')
        for row in rows:
            print('    [' + ', '.join("['%s','%s','%s']" % c for c in row) + '],')
        print('  ],')
        print('// 檢查：' + ('全部通過' if not problems else '；'.join(problems)))
        print()


if __name__ == '__main__':
    main()
