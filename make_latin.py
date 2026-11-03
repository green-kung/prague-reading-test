#!/usr/bin/env python3
"""產生 Williams 平衡拉丁方格順序表，印出可直接貼進 design.js 的 latinSquare。

用法：python3 make_latin.py 3        # 3 種文本類型 × A／B ＝ 6 篇 → 6 列
      python3 make_latin.py 2 4     # 一次產生 2 類與 4 類兩張表

排法（2026-11-03 起；以「篇」為處理單位）：
  ① 2N 篇依 (類型一A, 類型二A, …, 類型N A, 類型一B, …, 類型N B) 編號 0…2N−1；
  ② 第 1 列用 Williams 平衡序列 0, 1, 2N−1, 2, 2N−2, 3, …；
  ③ 第 i 列＝第 1 列每個編號加 i（模 2N）。
篇數 2N 必為偶數，所以一張 2N × 2N 方格即同時滿足：
  - 拉丁方格：每篇在每個位置剛好出現一次；
  - Williams 平衡：每篇緊接在其他每一篇之後剛好一次（平衡一階殘留效果）。
每格輸出 [文本類型, 篇別]；產生後會自行檢查上述兩項與「每列同一類型的 A／B 各一次」。

（舊版 2026-10-12 之前是對「寬鬆／緊迫 × 類型」排 Williams，再依列號奇偶配 A／B；
  取消時間操弄後，那張表在「篇」的層級既不是拉丁方格、也沒有平衡殘留效果，已於 2026-11-03 換掉。）
"""
import sys


def williams_row0(n):
    """偶數 n 的 Williams 序列：0, 1, n−1, 2, n−2, 3, …"""
    if n % 2:
        raise ValueError('處理數必須是偶數')
    out, lo, hi = [0], 1, n - 1
    while len(out) < n:
        out.append(lo)
        lo += 1
        if len(out) < n:
            out.append(hi)
            hi -= 1
    return out


def passages(N):
    return [(f'type{k}', 'A') for k in range(1, N + 1)] + [(f'type{k}', 'B') for k in range(1, N + 1)]


def make(N):
    n, P = 2 * N, passages(N)
    row0 = williams_row0(n)
    return [[P[(c + i) % n] for c in row0] for i in range(n)]


def check(rows, N):
    n, P = 2 * N, passages(N)
    problems = []
    for i, row in enumerate(rows, 1):
        if len(row) != n:
            problems.append(f'第 {i} 列格數 {len(row)} ≠ {n}')
        for k in range(1, N + 1):
            forms = sorted(f for ty, f in row if ty == f'type{k}')
            if forms != ['A', 'B']:
                problems.append(f'第 {i} 列 type{k} 的篇別為 {forms}，應為 A 與 B 各一次')
    for pos in range(n):
        col = [r[pos] for r in rows]
        if sorted(col) != sorted(P):
            problems.append(f'第 {pos + 1} 個位置不是每篇各一次')
    pairs = {}
    for r in rows:
        for a, b in zip(r, r[1:]):
            pairs[(a, b)] = pairs.get((a, b), 0) + 1
    if len(pairs) != n * (n - 1) or max(pairs.values()) != 1:
        problems.append('前後相鄰的篇對沒有各出現一次（殘留效果未平衡）')
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
        print(f'// ── {N} 類文本 × A／B → {2 * N} 回合、{len(rows)} 列 ──')
        print('  latinSquare: [')
        for row in rows:
            print('    [' + ', '.join("['%s','%s']" % c for c in row) + '],')
        print('  ],')
        print('// 檢查：' + ('全部通過' if not problems else '；'.join(problems)))
        print()


if __name__ == '__main__':
    main()
