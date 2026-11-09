# 布拉格版閱讀測驗實驗網站

母計畫 AI-READ 在布拉格捷克理工大學執行的考試閱讀實驗系統。
設計依據與開發規格放在研究者的 Obsidian 筆記庫（不隨本倉庫公開）。

**設計**：N（文本類型）× A／B 兩篇的受試者內設計，共 2N 回合；每回合時限一律 120 秒（2026-10-08 起取消寬鬆／緊迫兩種時限；2026-10-18 起由 180 秒改為 120 秒）。
目前設定檔為 **3 類文本、6 回合**，但程式一律**由設定檔推導**回合數與條件，**沒有寫死 6 或 3**；
改成 2 類或 4 類只要改設定檔（已實測 2 類 4 回合可正常跑完）。

## 這是一個純靜態的單頁網站

**只有受試者畫面一頁，沒有研究者儀表板、沒有伺服器、不連眼動儀。**
用瀏覽器打開 `index.html` 就能完整施測，也可以直接放上 GitHub Pages 用網址開。**不上傳任何雲端。**

研究者只做兩件事：**在開始畫面輸入編號 → 按 Start**。
其餘由受試者自己按 Next 往下走；資料在結束時自動下載成一個 zip。

### 眼動儀不由本網站控制

Gazepoint GP3 在**同一台電腦**上由 Gazepoint 自己的軟體校正與錄製，受試者看的是那台電腦的外接螢幕。
本網站與 Gazepoint 靠**同一個系統時鐘**對齊：

- 每一筆事件都記**含時區的牆上時間到毫秒**（例如 `2026-10-20T14:02:31.123+02:00`）。
- `summary.csv` 每回合有開始／結束時間（`wall_start_*`、`wall_end_*`）。
- **CSV 的時間欄一律同時給台灣與捷克兩欄**（`_tw`＝Asia/Taipei、`_cz`＝Europe/Prague，2026-11-02 起），由同一時刻換算，
  與電腦設定的時區無關。台灣全年 UTC+8、無夏令時間；捷克冬令 UTC+1、夏令 UTC+2，由瀏覽器的時區資料庫自動判斷。
  布拉格施測期 11/3–12/4 整段都是冬令時間（2026 夏令時間 10/25 已結束，下次 2027-03-28 才開始），偏移固定 `+01:00`，台灣比捷克快 7 小時。
  `events.jsonl`、`session.json` 仍保留原始的 `wall_time`（這台電腦的本地時間＋偏移）與 `client_ms`。
- 興趣區域（AOI）的座標**不在每場記錄**：版面固定在 1920×1080 舞台，同一篇文本人人位置相同，
  所以用 `index.html?aoi` **每篇匯出一份固定表**（見下方「AOI 座標表」）。每場的 `layout.csv` 只記每回合是否全螢幕、縮放比例，供事後確認畫面是原尺寸。

⚠️ **按 Start 時會自動進入全螢幕**；全螢幕且螢幕為 1920×1080 時（`layout.csv` 的 `fullscreen = 1`、`scale = 1`），AOI 表的設計座標就等於眼動儀的螢幕座標。
施測中請不要離開全螢幕（離開會寫一筆 `fullscreen_exit` 事件）。

---

## 施測流程

### 研究者（開始畫面，英語）

1. 先在 Gazepoint 的軟體完成校正並開始錄製。
2. 打開 `index.html`（連點兩下，或用 GitHub Pages 網址）。
3. 在 **Participant ID** 輸入受試者編號 → 下方只顯示對應到順序表第幾列（**不顯示各回合文本類型／篇名，避免受試者看到**；要換順序請改 `design.js` 的順序表，實際順序記在資料檔）。
4. 按 **Start** → 進入全螢幕 → 把位置讓給受試者。

順序表有格式錯誤時，開始畫面會列出是第幾列、哪裡不對，**Start 會停用**、按了也不會開始。

### 受試者（Start 之後，全英語）

```
前測問卷（VAS-A 焦慮量表 → SAM 自評小人 → EES 情緒表達量表 17 題）
  → Next → 練習回合（不限時、無計時器）→ 計時器說明畫面（約 15 秒倒數，倒數完按 Next）
  → Next → 回合 1（數字倒數）→ VAS-A → SAM → NASA-TLX
  → Next → 回合 2 → 量表 …
  → … → 回合 6 → 量表 → 後測問卷（清單為空則自動略過）
  → 結束畫面（自動下載資料）
```

- 每個回合前都有一個 **Next 畫面**，受試者自己按 Next 開始。
- 回合中剩餘時間到 50%／25%／10% 時**畫面完全不變**，只在背景記一筆時間點事件。
- 時間到由系統自動結束；也可以由受試者按 Submit 自行送出。

### 休息點

**目前不設休息點**（`restAfterRounds: []`），六回合連續進行。要加回來時，`design.js` 的 `restAfterRounds` 指定的回合之後，畫面顯示 **Please wait for the researcher.**，
**只有 Shift + Enter 會繼續**（給研究者在 Gazepoint 重新校正的時間），受試者按其他鍵無效、也沒有 Next 按鈕。
要取消休息點就把它改成空陣列 `[]`；要改在第 2、4 回合後休息就寫 `[2, 4]`。

---

## 兩個設定檔（研究者要改的就是這兩個）

| 檔案 | 放什麼 | 什麼時候改 |
|---|---|---|
| `materials.js` | **材料層**：文本、試題、每篇的時限、量表題目與計分 | 文本定稿、改時限 |
| `design.js` | **設計層**：拉丁方格順序表、時間點事件比例、量表清單、螢幕實體寬度、練習設定、休息點 | 重新規劃順序、改休息點、要加同學量表或後測問卷、**到現場填螢幕寬度** |

改完存檔，**重新整理網頁即生效**，程式不用動。

### 順序表怎麼改（`design.js` 的 `latinSquare`）

每一列是一種回合順序，**受試者編號依序套用**：編號 1 → 第 1 列、編號 2 → 第 2 列……編號等於列數 + 1 時回到第 1 列。
每格是 `[文本類型, 篇別]`。

**預設表的來歷**（3 類文本 × A／B → 6 篇、6 回合、6 列；2026-11-03 起）：把 6 篇直接當 6 個處理，排 **Williams 平衡拉丁方格**：

1. 6 篇依 (1A, 2A, 3A, 1B, 2B, 3B) 編號 0–5；
2. 第 1 列用 Williams 平衡序列 `[0, 1, 5, 2, 4, 3]`；
3. 第 i 列 ＝ 第 1 列每個編號加 i（模 6）。

篇數為偶數，所以這一張 6 × 6 方格同時做到：**每篇在每個位置剛好出現一次**（拉丁方格）、
**每篇緊接在其他每一篇之後剛好一次**（30 種前後組合各一次，平衡一階殘留效果）；每個位置三種類型也各出現 2 次。
`make_latin.py` 產生表後會自動檢查這幾項。

⚠️ **2026-11-02 以前的舊表不是真正的拉丁方格**：它沿用寬鬆／緊迫時代對「時間 × 類型」排的 Williams 表，再依列號奇偶配 A／B；
取消時間操弄後，在篇的層級每篇在某些位置出現 2 次、某些位置 0 次，前後相鄰也不平衡（只有類型層級平衡）。
2026-11-03 換成上面的新表；用舊表跑過的受試者，實際順序記在各自 `session.json` 的 `plan`（`summary.csv` 每列也有 `passage_id` 與 `round`）。

**這張預設表可以整張換掉**。要重新產生（例如改成 2 類或 4 類文本）：

```bash
python3 make_latin.py 4     # 印出 4 類文本的 8 列順序表（每格 [文本類型, 篇別]），貼回 design.js
```

載入時每一列都會被檢查：**格數＝2N**、**同一類型的 A／B 各出現一次**
（N 由 `materials.js` 的 `passages` 推導）。任何一列不合格就不能開始，並指出是第幾列、哪裡不對。

### 時限怎麼填（`materials.js` 每篇的 `limit`）

```js
type1A: { …, limit: 120 }
```

- `limit`：該篇的作答秒數（目前六篇都是 120）。
- 填 `null` 時開始畫面會顯示警告；該篇若真的沒有秒數就會以不限時進行，並在事件紀錄留一筆警告。

---

## 資料怎麼存、怎麼拿

瀏覽器不能直接寫檔到專案資料夾，所以：

| 時機 | 做什麼 |
|---|---|
| 按 Start、**每完成一回合**、每份量表 | 把整個場次存進**瀏覽器本機儲存**（備援；重新整理、分頁誤關都不會遺失） |
| **場次結束** | **自動下載單一 zip** 到這台電腦的「下載」資料夾，檔名 `P編號_日期-時間.zip` |
| 下載失敗時 | 結束畫面**右下角**有一個不顯眼的「**Download data again**」按鈕，按了會重下載同一個檔 |

- **只下載一個檔**（zip），避免瀏覽器跳出「允許下載多個檔案」的提示。
- zip 由 `store.js` **自己產生**（store 模式、不壓縮），**不依賴 JSZip 或任何 CDN**——離線、GitHub Pages 都能用。
- 瀏覽器暫存最多保留 30 個場次，超過會自動刪最舊的。
  **每天結束前請確認 zip 都已存到硬碟並備份。**

### zip 裡的六個檔案

| 檔案 | 內容 |
|---|---|
| `summary.csv` | 每回合一列（含練習的 `round = 0`）；欄位見下 |
| `answers.csv` | **每一次點選一列**：閱讀題、回合後量表、前後測問卷都算，含動作類型（`action`） |
| `layout.csv` | **版面檢查**，每回合一列：是否全螢幕、縮放比例、視窗與螢幕尺寸（AOI 座標另見「AOI 座標表」） |
| `questionnaires.csv` | 每份問卷一列：編號、場合（round／pretest／posttest）、回合、名稱、各題作答、計分值、分數、`pos`／`moved`／`first_move_ms`（只有 VAS-A 有值）、`wall_time_tw`／`wall_time_cz` |
| `ees.csv` | **EES 逐題計分**（2026-11-02 起）：每題一列（題號、題目、`reverse` 是否反向、`response` 原始作答 1–6、`scored` 計分後的值＝反向題 7 − 作答），最後一列 `item = total` 給 `raw`（17–102）與 `mean` |
| `scoring.txt` | **計分說明**：這場用到的每份量表（VAS-A、EES、NASA-TLX）的計分規則與文獻出處；文字來自 `materials.js` 各量表的 `scoring` |
| `events.jsonl` | 所有事件；每筆都有 `client_ms`（毫秒時間戳）與 `wall_time`（含時區的 ISO 8601，到毫秒） |
| `session.json` | 場次設定、回合順序、前後測分數、各回合完整結果 |

### `summary.csv` 欄位（36 欄）

```
pid, latin_row, round, text_type, form, passage_id, passage_title, words, limit_s,
answers, correct_flags, correct, n_items, n_scored, accuracy, rt_s, end_reason,
first_answer_s, last_answer_s, n_remove, n_add, n_wrong_to_right, n_right_to_wrong,
nasa_mental, nasa_physical, nasa_temporal, nasa_performance, nasa_effort, nasa_frustration, nasa_rtlx,
vasa_pos, vasa_moved, ees_raw, ees_mean, pre_vasa_pos, pre_ees_raw, pre_ees_mean, practice_rt_s, practice_words, wall_start_tw, wall_start_cz, wall_end_tw, wall_end_cz, overflow
```

- **閱讀題計分**（正確答案見 `materials.js` 每題的 `ans`，以材料原件「設計總覽」表格為準）：
  - **每題都可選 1–4 個選項**（每個選項是整列切換按鈕：點一下變淺色底＋主色粗框＋粗體字、再點變回；畫面上沒有方框、✓、圓點，**不提示**可以複選，題幹維持原樣）。
  - **勾選集合完全等於可證成選項才算對**；多勾、少勾都算錯。
  - **唯一解**（type1）：只勾那一個正解才算對。
  - **多重解**（type2）：兩個可證成選項**都要勾、且不能多勾**才算對；只勾其中一個算錯。
  - **無解**（type3）：沒有正解，**不計分**；勾選與時間照常記錄。
  - `answers`：每題最後勾選的字母（如 `B`、`AB`），未作答記 `-`。
  - `correct_flags`：每題 1／0；無解題記 `NA`。
  - `correct`：答對題數；`n_items`：題數；`n_scored`：**可計分題數**（無解題不算）。
  - `accuracy` ＝ `correct` ÷ `n_scored`，**只用可計分的題目計算**；無解回合 `n_scored = 0`，`accuracy` 留空。
  - 未作答的可計分題算錯（計入分母）。
- **作答過程**（由該回合的閱讀題點選算出，見 `answers.csv` 的 `action`）：
  - `first_answer_s`／`last_answer_s`：第一次／最後一次點任何選項的回合內秒數；整回合沒點過就留空。
  - `n_remove`：取消次數＝改答次數；`n_add`：補選次數（`action = add` 的列數）。
  - `n_wrong_to_right`／`n_right_to_wrong`：該題點擊前後 `correct` 由錯變對／由對變錯的次數。
    沒有選項時以計分規則視為錯；**每題第一次點選（`first`）不算變化**（點之前還沒作答）；無解題不計入。
- `wall_start_tw`／`wall_start_cz`、`wall_end_tw`／`wall_end_cz`：該回合開始／結束時刻的台灣時間與捷克時間（各含當下 UTC 偏移、到毫秒）。
- `vasa_pos`：該回合後 VAS-A 的定位比例（0–1，小數 4 位，0＝calm、1＝anxious）；`vasa_moved`：受試者有沒有動過滑桿（1／0；目前沒動過不能按 Next，所以恆為 1）。
  切成 30 等分的整數分數只留在 `questionnaires.csv`／`answers.csv`。
- `sam_valence`／`sam_arousal`／`sam_dominance`：該回合後的 SAM 三個向度分數（各 1–9；9＝愉悅、激發、支配）。`pre_sam_*`＝前測 SAM，每列重複同一個值。
- `ees_raw`／`ees_mean`：該回合後的 EES 總分（17–102）與平均（1–6）；目前 EES 只在前測，這兩欄留空，之後把 `'ees'` 加進 `roundQuestionnaires` 就會有值。
- `pre_vasa_pos`、`pre_ees_raw`、`pre_ees_mean`：前測 VAS-A 定位比例與前測 EES 分數（2026-11-02 加入，讓分析只開 summary 就有全部分數）；同一位受試者每一列（含練習列）都重複同一個值。
- **練習列（`round = 0`）**：量表欄位留空；另有 `practice_rt_s`、`practice_words`。
- 不在 summary、改看其他檔：`manual_order`、`sec_per_word` 在 `session.json`；
  時間點事件（`time_50` 等）在 `events.jsonl`（`session.json` 各回合也有 `t50_s` 等）。
- **眼動欄位已全部移除**（網站不收眼動；眼動在 Gazepoint 那邊）。

### `answers.csv` 欄位

```
pid, context, round, source, item, item_label, option, value, correct, action, prev_option, t_ms, wall_time_tw, wall_time_cz
```

- `context`：`practice`／`round`／`pretest`／`posttest`。
- `source`：`reading`（閱讀題）或量表名稱（`vasa`／`nasa`／`peer`；`stai` 目前不施測）。
- **閱讀題每按一次選項按鈕（選取或取消）記一列**：
  - `option`：點完之後的勾選集合（如 `AB`；全部取消時留空）。
  - `value`：這次的動作，`+C`＝勾 C、`-C`＝取消 C。
  - `prev_option`：點之前的勾選集合。
  - `action`：`first`＝該題第一次點選；`add`＝之後的每一次加選（`value` 開頭是 `+`，包含全部取消後再選）；
    `remove`＝取消某個選項（`value` 開頭是 `-`），**這才算改答**。
  - `correct`：點完之後的集合是否完全等於可證成選項（1／0）；**無解題留空**。
- VAS-A：**每按下到放開記一列**（點一下或拖曳一次都算一列）；`item_label` ＝ `anxiety`，`option` ＝ 定位比例 `pos`（0–1，小數 4 位），`value` ＝ 0–30 分；`prev_option` 是上一次放開時的 `pos`。
- 量表（含 VAS-A）：`option`／`value` 是選項文字與計分值，`correct` 留空；`action` 為 `first`（該題第一次點）／`change`（改選別的）／`repeat`（再點同一個），`prev_option` 是之前選的。
- `t_ms`：距**該畫面開始**的毫秒數（閱讀題＝回合開始，量表＝該份量表出現）。

### `layout.csv` 欄位（版面檢查，每回合一列）

```
pid, round, passage_id, fullscreen, scale, viewport_w, viewport_h, screen_w, screen_h
```

`fullscreen`：該回合開始時是否全螢幕（1／0）；`scale`：舞台縮放比例（實驗螢幕 1920×1080 全螢幕時為 1）。
**`fullscreen = 1` 且 `scale = 1` 時，AOI 座標表可直接套在眼動資料上**；否則要先換算。

### AOI 座標表（每篇一份，實驗後給分析程式用）

網址加 `?aoi`（例如 `index.html?aoi`）→ 自動排出練習篇與 6 篇正式文本，量好後下載 `aoi_tables.zip`，
裡面是 `aoi_practice.csv`、`aoi_type1A.csv`……每篇一份：

```
passage_id, region, x, y, w, h
```

- 座標是 **1920×1080 設計座標**（左上角為原點），已扣掉舞台位移並除以縮放比例，與視窗大小、位置無關（已實測 1920×1080 與 1366×768 輸出完全相同）。
- `region`：
  - 整欄：`text`（整個文本欄 48, 170, 904×870，含空白處）、`questions`（整個題目欄 1088, 170, 784×870）
  - 文本：`title`、`para_1`…`para_n`
  - 題目：`q_k`（第 k 題整題＝題幹頂到最後一個選項底，不含題與題之間的分隔線與留白）、`q_k_stem`（題號＋題幹）、`q_k_opts`（全部選項合成一塊）
  - 工具列：`timer`（計時器標籤＋數字；練習篇沒有）、`round_label`（左側「Reading Test · Round 1 of 6」；練習篇為「· Practice」）
  - 送出列：`progress_submit`（已答題數＋送出鈕合成一塊）
- ⚠️ **請在實驗電腦、實驗用瀏覽器上匯出**：字型不同，換行位置與段落高度就不同。換了文本或排版也要重新匯出。
- `round_label` 一律以「Round 1 of 6」量；其他回合數字寬度不同，差距在 1～2 像素內。

### `events.jsonl` 主要事件

`session_start`、`round_start`、`layout`、`trial_start`、`answer`（每一次點選）、
`time_50`／`time_25`／`time_10`、`trial_end`（含 `endReason`＝`submit`／`timeout`）、
`questionnaire_start`、`q_click`（每一次點選）、`questionnaire`、`questionnaires_done`、
`next_pressed`、`rest_start`、`rest_end`、`timer_info_start`／`timer_info_done`、
`fullscreen_enter`／`fullscreen_exit`、`visibility`、`session_end`、`download`。全部附牆上時間到毫秒。

字數以空白切分段落文字計算（不含標題與試題）。練習回合不限時，因此 `round = 0` 的 `limit_s` 留空。
（時間容忍度 `rtt_group`／`rtt` 與 `t_expected_s` 於 2026-10-12 從 summary 移除；前導模式與 `pilotMean_s` 於 2026-10-18 移除：所有受試者都是練習題不計時、正式 6 回合各 120 秒。）

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
| `index.html` | **整個網站**：開始畫面＋受試者流程（全部英語） |
| `session.js` | 場次資料記錄：事件、每一次點選、計分彙整 |
| `store.js` | 資料保存：瀏覽器暫存、CSV、zip 打包、下載 |
| `materials.js` | 材料層設定（文本、試題、量表） |
| `design.js` | 設計層設定（順序表、時間點、量表清單、休息點） |
| `make_latin.py` | 產生 Williams 平衡拉丁方格順序表並自我檢查（只在要改文本類型數時用） |

`make_latin.py` 是**離線工具**，施測本身完全不需要 Python。

---

## 待補材料

### ★ SAM 小人圖檔（`sam/` 資料夾）

來源：使用者提供的 `The-Self-Assessment-Manikin-SAM-adapted-with-permission-from-Bradley-and-Lang-1994.webp`
（三排、每排 9 格＝5 個小人＋4 個圓圈格）。2026-11-04 依原圖格線裁成 27 張：

```
sam/valence-1.png … sam/valence-9.png      不愉悅 → 愉悅
sam/arousal-1.png … sam/arousal-9.png      平靜 → 激發
sam/dominance-1.png … sam/dominance-9.png  小（被控制）→ 大（掌控）
```

- 每格四周多留 6px：支配第 9 格的大小人在原圖就畫得比框大，不留邊會被切掉；第 1–8 格的外緣再塗白，避免沾到隔壁格的線。
- 此圖三排都是**由左到右「低 → 高」**，所以 `materials.js` 的 `highEnd` 都是 `'right'`，分數＝點選位置（1–9）。
- **畫面排法**（2026-11-04 依使用者參考圖改）：每排上方 5 個小人（用第 1、3、5、7、9 格，小人樣式不變），下方一排 **9 個圓圈**像尺一樣對齊——
  1、3、5、7、9 在小人正下方，2、4、6、8 在兩個小人之間，受試者一看就知道可以選在兩個小人中間。
  圓圈的可點範圍約 84 × 52 px（相鄰圓圈中心相距 105 px）；**點小人也可以**，等於選它正下方的圓圈，小人與圓圈同時標示。
  滑過時淺色、選定時實心主色圓；沒點的那一排按 Finish 後整排標色。第 2、4、6、8 格（原圖的圓圈格）目前沒有用到。
- **每排左側標題** Valence／Arousal／Dominance：原文 Figure 1（p.51）圖內沒有文字，向度名稱只在圖說「valence (top panel), arousal (middle panel), and dominance (bottom panel)」，採圖說用詞與上中下順序（內文另稱 pleasure）。
- ⚠️ 原文 Figure 1 的愉悅排是「笑 → 皺眉」、激發排是「興奮 → 平靜」（由左到右）；使用者提供的改作圖檔這兩排左右相反。計分依實際使用的圖檔，論文方法請寫明呈現方向。
- 圖檔載入失敗時格內顯示「向度 格號」文字，流程照常。

### ★ 版面容量（給寫文本的人）

畫面固定 1920 × 1080、**不捲動**，所以材料長度有上限。六篇共用同一套排版（考試介面：全白底、左右分欄、計時器在上方工具列；文本欄內寬 904px、y 170–1040；文本 22px／行距 1.6／段距 10px），實測可容納：

| 項目 | 上限 | 目前正式文本 |
|---|---|---|
| 一篇文本 | 約 **280 英文詞**、5 段（標題佔一行時；最長的 type2B、type3B 剩約 32px。段距試過 30px、20px 都會溢出，所以維持 10px） | 213–281 詞、3–5 段 |
| 每篇題數 | 2 題時作答區還很寬裕；3 題也放得下 | 2 題 |
| 單一選項長度 | 2 題時選項折成兩行也放得下 | 最長約 160 字元（折兩行） |
| 練習文本 | 與正式文本相當、2 題 | 240 詞、4 段、2 題（2026-10-21 由 146 詞加長） |

**開始畫面會自動預檢每一篇**：有文本放不下時會在警告區列出是哪幾篇，建議在施測前先換掉或縮短。
題目太多時作答區會被擠出畫面（沒有自動預檢），**換文本後請務必自己跑一次每一篇確認**。

| 項目 | 現況 | 由誰補 |
|---|---|---|
| 正式文本 6 篇 | **已放入**（2026-10-08，原件 @Perry「考試閱讀實驗材料」，只放英文文章與題目，每篇 2 題）。對應：1 號→type1A、4 號→type1B、2 號→type2A、5 號→type2B、3 號→type3A、6 號→type3B | — |
| 文本類型數與名稱 | 3 類＝答案結構：唯一解／多重解／無解（開始畫面顯示為 Single answer／Multiple answers／No answer，名稱在 `materials.js` 的 `textTypeLabels`）；A 篇＝說明文、B 篇＝論辯文 | — |
| 練習文本 | Why Bread Rises（說明文，240 詞、2 題，四選一單一正解），2026-10-21 收進「考試閱讀實驗材料」的「練習文本」一節；改動時兩邊要一致 | — |
| 各篇時限 | 時限一律 120 秒（2 分鐘）；練習題不限時 | — |
| 狀態焦慮：VAS-A | 2026-10-11 起改用電腦化焦慮視覺類比量表（Abend et al., 2014, p.448）：單題 “How anxious do you feel right now?”，水平線（**不照原文 100 公釐**，改用 1080 設計像素，整組置於畫面正中；計分是相對位置不受影響）、左 calm 右 anxious、游標起始在中點、不畫刻度不顯示數字；分數＝定位點到左端的相對距離四捨五入成 **0–30**（存在 `questionnaires.csv`），另存 `pos`（0–1；summary 用這個，欄名 `vasa_pos`）。本網站追加：至少點選或拖曳一次才能按 Next（記 `moved`、`first_move_ms`）。前測一次、每回合後第一個 | — |
| **螢幕實體寬度 `screenWidthMm`** | `design.js` 預設 531（24 吋 16:9）。只用來把 VAS-A 線長換算成實體公釐記在事件紀錄（預設約 299 公釐），不影響畫面與計分 | **使用者：到現場用尺量實驗螢幕「可視區」寬度（公釐）後填入** |
| 情緒狀態：SAM | 2026-11-04 加入前測與每回合後，都緊接在 VAS-A 之後（Bradley & Lang, 1994, J. Behav. Ther. Exp. Psychiatry, 25, 49–59）。愉悅、激發、支配三排，每排 5 個小人，點小人或兩個小人之間 → 每向度 9 點（p.51）；作答畫面不顯示形容詞（2026-11-04 拿掉以減少干擾；原文的形容詞只用在口頭指導語，p.53、Table 1，Figure 1 圖內也沒有文字），引導句說明怎麼點。分數 1–9，**9＝愉悅（happy）、激發（excited）、支配（in control，小人最大）**；原文沒寫數字方向，依論文討論與 IAPS 慣例；使用的圖檔三排都是左低右高，分數＝點選位置。`questionnaires.csv` 的 `answers` 是點選位置（0–8，由左到右），`values` 是換算後的分數。一頁三排不用捲動。⚠️ 引導句是本網站自擬（原文是對圖片評分，這裡改成評「現在的感受」） | —（圖檔見下） |
| 情緒表達：EES | 2026-10-21 加入前測，接在 VAS-A 之後（Kring, Smith, & Neale, 1994, JPSP, 66, 934–949）。17 題，題目文字與順序照原文 Table 1（p.938）；6 點量表 1 = never true、6 = always true（p.936，中間 2–5 沒有文字錨點，只顯示數字）；第 2、3、4、7、9、10、11、12、15、16、17 題反向（7 − 分數），分數＝總分 `raw`（17–102）與平均 `mean`，存在 `session.json` 的 `pre.ees` 與 `questionnaires.csv`（`values` 是未反向的原始作答）。矩陣版面（題目在左、1–6 排成右側六欄），17 題一頁放得下不用捲動。⚠️ 原文沒有附指導語，畫面上那一句是本網站自擬 | — |
| STAI 6 題 | 2026-10-11 起**不施測**（不在任何清單）；`materials.js` 的定義與 `stai-items.local.js` 載入先保留，要加回就把 `'stai'` 放回 `design.js` 的清單 | — |
| NASA-TLX | 定義文字與 Hart (1986) NASA-TLX v1.0 手冊附錄 A 逐字一致（2026-10-12 對照手冊補正 Mental、Physical、Performance、Frustration 四題）（6 分量表、21 刻度、0–100、不做兩兩比較加權）。整體負荷用 **Raw TLX**：6 個分量表平均，存成 `rtlx`（summary 欄名 `nasa_rtlx`，0–100）；這是 Hart (2006) 所述的常見變體，不是原始 15 組兩兩比較的加權版（2026-10-21 決定）。2026-10-12 起 6 題排成兩欄、每欄 3 題，一頁放得下不用捲動 | — |
| 同學量表 | `materials.js` 的 `peer` 插槽有 1 題示範題；預設不在 `roundQuestionnaires` 內，要啟用就把 `'peer'` 加進去 | 同學 |
| 後測問卷 | `postQuestionnaires: []`（空清單；為空時結束畫面前自動略過） | 使用者 |
| 拉丁方格順序表 | 預設 6 列 Williams 平衡（可整張換掉，見上） | 使用者 |

## 不在本次範圍

研究者儀表板與即時監看、網站連接眼動儀（改由 Gazepoint 自己的軟體錄製）、漂移檢查與重新校正、
閱讀中跳出焦慮評分、即時生理數據串流與依狀態自動調整介面、
到場前的線上問卷（基本資料、ARHQ、RAT-A，用線上表單另收，以受試者編號對接）、事後視線重播。
