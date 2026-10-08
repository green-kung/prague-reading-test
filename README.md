# 布拉格版閱讀測驗實驗網站

母計畫 AI-READ 在布拉格捷克理工大學執行的考試閱讀實驗系統。
設計依據與開發規格放在研究者的 Obsidian 筆記庫（不隨本倉庫公開）。

**設計**：2（時間限制：寬鬆 loose／緊迫 tight）× N（文本類型）受試者內設計，共 2N 回合。
目前設定檔為 **3 類文本、6 回合**，但程式一律**由設定檔推導**回合數與條件，**沒有寫死 6 或 3**；
改成 2 類或 4 類只要改設定檔（已實測 2 類 4 回合可正常跑完）。

## 這是一個純靜態的單頁網站

**只有受試者畫面一頁，沒有研究者儀表板、沒有伺服器、不連眼動儀。**
用瀏覽器打開 `index.html` 就能完整施測，也可以直接放上 GitHub Pages 用網址開。**不上傳任何雲端。**

研究者只做三件事：**在開始畫面輸入編號 → 按 Start → 休息點按 Shift + Enter**。
其餘由受試者自己按 Next 往下走；資料在結束時自動下載成一個 zip。

### 眼動儀不由本網站控制

Gazepoint GP3 在**同一台電腦**上由 Gazepoint 自己的軟體校正與錄製，受試者看的是那台電腦的外接螢幕。
本網站與 Gazepoint 靠**同一個系統時鐘**對齊：

- 每一筆事件都記**含時區的牆上時間到毫秒**（例如 `2026-10-20T14:02:31.123+02:00`）。
- `summary.csv` 每回合有 `wall_start`、`wall_end`。
- 每回合另記**文本區／題目區／計時器的螢幕座標**（`layout.csv`），事後可照著在 Gazepoint 資料上劃興趣區域。

⚠️ **按 Start 時會自動進入全螢幕**，`layout.csv` 的螢幕座標才會跟眼動儀看到的畫面對得上。
施測中請不要離開全螢幕（離開會寫一筆 `fullscreen_exit` 事件）。

---

## 施測流程

### 研究者（開始畫面，中文）

1. 先在 Gazepoint 的軟體完成校正並開始錄製。
2. 打開 `index.html`（連點兩下，或用 GitHub Pages 網址）。
3. 輸入**受試者編號** → 下方自動帶出該編號的回合順序（**只顯示，不提供調整**；要換順序請改 `design.js` 的順序表）。
4. 要跑前導實驗就勾選「**前導模式（不限時）**」。
5. 按 **Start** → 進入全螢幕 → 把位置讓給受試者。

順序表有格式錯誤時，開始畫面會列出是第幾列、哪裡不對，**Start 會停用**、按了也不會開始。

### 受試者（Start 之後，全英語）

```
前測問卷（STAI）
  → Next → 練習回合（不限時、無計時器）→ 計時器說明畫面（約 10 秒）
  → Next → 回合 1（數字倒數）→ NASA-TLX → STAI
  → Next → 回合 2 → 量表 …
  → 回合 3 之後：休息畫面（研究者按 Shift + Enter）
  → … → 回合 6 → 量表 → 後測問卷（清單為空則自動略過）
  → 結束畫面（自動下載資料）
```

- 每個回合前都有一個 **Next 畫面**，受試者自己按 Next 開始。
- 回合中剩餘時間到 50%／25%／10% 時**畫面完全不變**，只在背景記一筆時間點事件。
- 時間到由系統自動結束；也可以由受試者按 Submit 自行送出。

### 休息點

`design.js` 的 `restAfterRounds`（預設 `[3]`）指定的回合之後，畫面顯示 **Please wait for the researcher.**，
**只有 Shift + Enter 會繼續**（給研究者在 Gazepoint 重新校正的時間），受試者按其他鍵無效、也沒有 Next 按鈕。
要取消休息點就把它改成空陣列 `[]`；要改在第 2、4 回合後休息就寫 `[2, 4]`。

---

## 兩個設定檔（研究者要改的就是這兩個）

| 檔案 | 放什麼 | 什麼時候改 |
|---|---|---|
| `materials.js` | **材料層**：文本、試題、每篇的時限與前導平均秒數、量表題目與計分 | 文本定稿、前導實驗算出時限、貼入 STAI 授權版題目 |
| `design.js` | **設計層**：拉丁方格順序表、時間點事件比例、量表清單、練習設定、休息點、前導選項 | 重新規劃順序、改休息點、要加同學量表或後測問卷 |

改完存檔，**重新整理網頁即生效**，程式不用動。

### 順序表怎麼改（`design.js` 的 `latinSquare`）

每一列是一種回合順序，**受試者編號依序套用**：編號 1 → 第 1 列、編號 2 → 第 2 列……編號等於列數 + 1 時回到第 1 列。
每格是 `[時間限制, 文本類型, 篇別]`，時間限制只能是 `'loose'`（寬鬆）或 `'tight'`（緊迫）。

**預設表的產生方式**（3 類文本 → 6 條件、6 列）：

1. 6 個條件依 (寬鬆, 緊迫) × (類型一, 類型二, 類型三) 編號 0–5；
2. 第 1 列用 Williams 平衡序列 `[0, 1, 5, 2, 4, 3]`（處理數為偶數時，一張方格即可平衡一階殘留效果）；
3. 第 i 列 ＝ 第 1 列每個編號加 i（模 6）；
4. 篇別：第 i 列的類型 k，`(i + k)` 為偶數時「寬鬆配 A、緊迫配 B」，否則相反
   → 同一文本類型的 A／B 兩篇在不同列中輪流配寬鬆與緊迫，不會固定哪一篇總是被趕。

**這張預設表可以整張換掉**。要重新產生（例如改成 2 類或 4 類文本）：

```bash
python3 make_latin.py 4     # 印出 4 類文本的 8 列順序表，貼回 design.js
```

載入時每一列都會被檢查：**格數＝2N**、**每種「時間 × 文本類型」各出現一次**、**同一類型的 A／B 各出現一次**
（N 由 `materials.js` 的 `passages` 推導）。任何一列不合格就不能開始，並指出是第幾列、哪裡不對。

### 時限怎麼填（`materials.js` 每篇的 `limit`）

```js
type1A: { …, limit: { loose: 150, tight: 90 }, pilotMean_s: 120 }
```

- `limit.loose`／`limit.tight`：該篇在寬鬆／緊迫條件下的作答秒數。
- `pilotMean_s`：前導實驗「不限時」的平均作答秒數 → 群體層級時間容忍度的分母。
- 填 `null` 時開始畫面會顯示警告；該篇若真的沒有秒數就會以不限時進行，並在事件紀錄留一筆警告。

⚠️ **目前填的 150／90 與 `pilotMean_s: 120` 是為了演示隨意設定的數字（非文獻或 meeting 依據），前導實驗後必須換掉。**

---

## 資料怎麼存、怎麼拿

瀏覽器不能直接寫檔到專案資料夾，所以：

| 時機 | 做什麼 |
|---|---|
| 按 Start、**每完成一回合**、每份量表 | 把整個場次存進**瀏覽器本機儲存**（備援；重新整理、分頁誤關都不會遺失） |
| **場次結束** | **自動下載單一 zip** 到這台電腦的「下載」資料夾，檔名 `P編號_日期-時間.zip`（前導為 `PILOT_P…`） |
| 下載失敗時 | 結束畫面**右下角**有一個不顯眼的「**Download data again**」按鈕，按了會重下載同一個檔 |

- **只下載一個檔**（zip），避免瀏覽器跳出「允許下載多個檔案」的提示。
- zip 由 `store.js` **自己產生**（store 模式、不壓縮），**不依賴 JSZip 或任何 CDN**——離線、GitHub Pages 都能用。
- 開始畫面會顯示「瀏覽器裡暫存了 N 個場次」。暫存最多保留 30 個場次，超過會自動刪最舊的。
  **每天結束前請確認 zip 都已存到硬碟並備份。**

### zip 裡的六個檔案

| 檔案 | 內容 |
|---|---|
| `summary.csv` | 每回合一列（含練習的 `round = 0`）；欄位見下 |
| `answers.csv` | **每一次點選一列**：閱讀題、回合後量表、前後測問卷都算，含是否為改答 |
| `layout.csv` | 每回合各區域的**螢幕座標**，供事後在 Gazepoint 資料上劃興趣區域 |
| `questionnaires.csv` | 每份問卷一列：編號、場合（round／pretest／posttest）、回合、名稱、各題作答、計分值、分數、牆上時間 |
| `events.jsonl` | 所有事件；每筆都有 `client_ms`（毫秒時間戳）與 `wall_time`（含時區的 ISO 8601，到毫秒） |
| `session.json` | 場次設定、回合順序、前後測分數、各回合完整結果 |

### `summary.csv` 欄位（42 欄）

```
pid, latin_row, manual_order, pilot, round, time, text_type, form, passage_id, passage_title, words,
limit_s, pilot_mean_s, rtt_group, t_expected_s, rtt,
answers, correct_flags, correct, n_items, n_scored, accuracy, rt_s, end_reason,
t50_s, t25_s, t10_s,
nasa_mental, nasa_physical, nasa_temporal, nasa_performance, nasa_effort, nasa_frustration,
stai_raw, stai_prorated,
practice_rt_s, practice_words, sec_per_word,
est_s, wall_start, wall_end, overflow
```

- **閱讀題計分**（正確答案見 `materials.js` 每題的 `ans`，以材料原件「設計總覽」表格為準）：
  - **唯一解**（type1）：選中唯一的可證成選項才算對。
  - **多重解**（type2）：兩個可證成選項**選中任一個都算對**。
  - **無解**（type3）：沒有正解，**不計分**；選項與時間照常記錄。
  - `answers`：每題選的字母，未作答記 `-`。
  - `correct_flags`：每題 1／0；無解題記 `NA`。
  - `correct`：答對題數；`n_items`：題數；`n_scored`：**可計分題數**（無解題不算）。
  - `accuracy` ＝ `correct` ÷ `n_scored`，**只用可計分的題目計算**；無解回合 `n_scored = 0`，`accuracy` 留空。
  - 未作答的可計分題算錯（計入分母）。
- `t50_s`／`t25_s`／`t10_s`：到達各時間點的回合內秒數（欄名跟著 `design.js` 的 `timeMarks` 走）。
- `wall_start`／`wall_end`：該回合開始／結束的牆上時間（含時區、到毫秒）。
- **練習列（`round = 0`）**：量表欄位留空；另有 `practice_rt_s`、`practice_words`、`sec_per_word`。
- `manual_order` 保留在欄位裡但**恆為 0**（順序不再提供手動調整）。
- **眼動欄位已全部移除**（網站不收眼動；眼動在 Gazepoint 那邊）。

### `answers.csv` 欄位

```
pid, context, round, source, item, item_label, option, value, correct, is_change, prev_option, t_ms, wall_time
```

- `context`：`practice`／`round`／`pretest`／`posttest`。
- `source`：`reading`（閱讀題）或量表名稱（`nasa`／`stai`／`peer`）。
- `correct`：閱讀題才有（1／0）；**無解題留空**（沒有正解）；量表留空。
- `is_change` ＝ 1 表示這次點選是**改答**，`prev_option` 是改之前選的。
- `t_ms`：距**該畫面開始**的毫秒數（閱讀題＝回合開始，量表＝該份量表出現）。

### `layout.csv` 欄位

```
pid, round, region, x, y, w, h, viewport_w, viewport_h, screen_w, screen_h
```

`region` 為 `text`（文本區）／`questions`（題目區）／`timer`（計時器；練習與前導無此列）。
`x`／`y` 是**螢幕座標**（左上角為原點），全螢幕時即為眼動儀座標系；`w`／`h` 為該區塊的寬高。

### `events.jsonl` 主要事件

`session_start`、`round_start`、`layout`、`trial_start`、`answer`（每一次點選）、
`time_50`／`time_25`／`time_10`、`submit_confirm_open`、`submit_cancel`、`trial_end`（含 `endReason`＝`submit`／`timeout`）、
`questionnaire_start`、`q_click`（每一次點選）、`questionnaire`、`questionnaires_done`、
`next_pressed`、`rest_start`、`rest_end`、`timer_info_start`／`timer_info_done`、
`fullscreen_enter`／`fullscreen_exit`、`visibility`、`session_end`、`download`。全部附牆上時間到毫秒。

### 時間容忍度（RTT）兩種算法

| 欄位 | 算法 | 用途 |
|---|---|---|
| `rtt_group` | （`limit_s` − `pilot_mean_s`）÷ `pilot_mean_s` | **主分析**：群體層級，分母是前導實驗的平均作答時間 |
| `rtt` | （`limit_s` − `t_expected_s`）÷ `t_expected_s`，其中 `t_expected_s` ＝ 練習回合的 `sec_per_word` × 該篇字數 | **探索分析**：個人層級 |

字數以空白切分段落文字計算（不含標題與試題）。前導模式的回合不限時，因此 `limit_s` 與兩個 RTT 都留空。

---

## 前導模式（布拉格第 1 天）

開始畫面勾選「**前導模式（不限時）**」：

- 全部回合不限時、不顯示計時器、不出現回合後量表、不做練習後的計時器說明。
- 文本順序仍依順序表。
- `session.json` 標記 `pilot: true`，下載檔名加 `PILOT_` 前綴，不會與正式資料混在一起。
- 想順便收「自估所需時間」：把 `design.js` 的 `pilotEstimate` 改成 `true`，每篇讀前會問一題
  `This passage has N words. How many seconds do you think you will need…`，答案存成 `est_s`。

### 跑完後算時限

把全部前導的 zip（**不用解壓**）放進同一個資料夾，然後：

```bash
python3 pilot_limits.py ~/Downloads          # 直接掃「下載」資料夾
python3 pilot_limits.py 某個資料夾 --median   # 人數少、標準差不穩時改用中位數
```

輸出每篇的人數、平均、標準差、中位數、最小／最大、極端值（離平均超過 2 個標準差者的編號）、各題答對率、
建議的寬鬆（平均＋1 SD）與緊迫（平均−1 SD）秒數；若有自估時間，另算自估與實際時間的相關。
最後印出**可直接貼回 `materials.js` 的片段**。

---

## 發佈到 GitHub Pages

這個資料夾全部是靜態檔案、全部用相對路徑，可以直接放在 GitHub Pages 的子路徑下（已實測）。
`.gitignore` 已排除受試者資料（`data/`、`*.zip`、各 csv／json），不會不小心把資料推上去。

> ⚠️ GitHub Pages 是**公開**的：任何拿到網址的人都看得到文本與題目。
> 資料不會上傳（都留在施測電腦），但**題目會外流**。若不希望文本公開，就用私人倉庫 + 不開 Pages，
> 直接把這個資料夾放在實驗電腦上用檔案開啟即可（功能完全相同，也不需要網路）。

1. 在這個資料夾建立倉庫並推上去（**以下指令目前還沒執行，等你決定**）：

   ```bash
   cd prague-reading-test
   git init
   git add .
   git commit -m "布拉格版閱讀測驗網站"
   git branch -M main
   git remote add origin https://github.com/<你的帳號>/<倉庫名>.git
   git push -u origin main
   ```

2. GitHub 倉庫頁 → **Settings** → 左側 **Pages** →
   **Source** 選 `Deploy from a branch` → **Branch** 選 `main`、資料夾選 `/ (root)` → **Save**。
3. 等 1–2 分鐘，網址會是 `https://<你的帳號>.github.io/<倉庫名>/`（`index.html` 就是首頁）。
4. 用那個網址在實驗電腦上開，照上面的施測流程做即可。

**更新網站**：改完檔案 `git add . && git commit -m "..." && git push`，Pages 會自動重新發佈（約 1 分鐘）。

⚠️ 實驗當天若網路不穩，請改用「直接開檔案」——功能完全相同，不需要網路。

---

## 檔案一覽

| 檔案 | 作用 |
|---|---|
| `index.html` | **整個網站**：開始畫面（中文）＋受試者流程（英語） |
| `session.js` | 場次資料記錄：事件、每一次點選、計分彙整 |
| `store.js` | 資料保存：瀏覽器暫存、CSV、zip 打包、下載 |
| `materials.js` | 材料層設定（文本、試題、量表） |
| `design.js` | 設計層設定（順序表、時間點、量表清單、休息點） |
| `make_latin.py` | 產生 Williams 平衡順序表（只在要改文本類型數時用） |
| `pilot_limits.py` | 由前導資料算建議時限（只在前導後用） |

兩個 Python 腳本是**離線工具**，施測本身完全不需要 Python。

---

## 待補材料

### ★ 版面容量（給寫文本的人）

畫面固定 1920 × 1080、**不捲動**，所以材料長度有上限。六篇共用同一套排版（文本 22px／行距 1.6／段距 10px），實測可容納：

| 項目 | 上限 | 目前正式文本 |
|---|---|---|
| 一篇文本 | 約 **280 英文詞**、5 段（標題佔一行時；最長的 6 號剩約 20px） | 213–281 詞、3–5 段 |
| 每篇題數 | 2 題時作答區還很寬裕；3 題也放得下 | 2 題 |
| 單一選項長度 | 2 題時選項折成兩行也放得下 | 最長約 160 字元（折兩行） |
| 練習文本 | 約正式文本三分之二、2 題 | 146 詞、2 題 |

**開始畫面會自動預檢每一篇**：有文本放不下時會在警告區列出是哪幾篇，建議在施測前先換掉或縮短。
題目太多時作答區會被擠出畫面（沒有自動預檢），**換文本後請務必自己跑一次每一篇確認**。

| 項目 | 現況 | 由誰補 |
|---|---|---|
| 正式文本 6 篇 | **已放入**（2026-10-08，原件 @Perry「考試閱讀實驗材料」，只放英文文章與題目，每篇 2 題）。對應：1 號→type1A、4 號→type1B、2 號→type2A、5 號→type2B、3 號→type3A、6 號→type3B | — |
| 文本類型數與名稱 | 3 類＝答案結構：唯一解／多重解／無解；A 篇＝說明文、B 篇＝論辯文 | — |
| 練習文本 | 仍是示範文本（Why Bread Rises，2 題，`demo: true`） | 視需要 |
| 各篇寬鬆／緊迫秒數、前導平均 | 演示用暫填 150／90、`pilotMean_s: 120` | 前導實驗 → `pilot_limits.py` |
| STAI 6 題題目文字 | 已填入 `materials.js`（順序：tense, upset, worried, calm, relaxed, content）；計分邏輯（第 1、15、16 題反向、總分 × 20 ÷ 6）已完成 | —（正式施測前仍須取得授權） |
| NASA-TLX | 已用 NASA 公開的英語原版定義（6 分量表、21 刻度、0–100、不做兩兩比較加權） | — |
| 同學量表 | `materials.js` 的 `peer` 插槽有 1 題示範題；預設不在 `roundQuestionnaires` 內，要啟用就把 `'peer'` 加進去 | 同學 |
| 後測問卷 | `postQuestionnaires: []`（空清單；為空時結束畫面前自動略過） | 使用者 |
| 拉丁方格順序表 | 預設 6 列 Williams 平衡（可整張換掉，見上） | 使用者 |

## 不在本次範圍

研究者儀表板與即時監看、網站連接眼動儀（改由 Gazepoint 自己的軟體錄製）、漂移檢查與重新校正、
閱讀中跳出焦慮評分、即時生理數據串流與依狀態自動調整介面、
到場前的線上問卷（基本資料、ARHQ、RAT-A，用線上表單另收，以受試者編號對接）、事後視線重播。
