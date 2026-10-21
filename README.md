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
- `summary.csv` 每回合有 `wall_start`、`wall_end`。
- 興趣區域（AOI）的座標**不在每場記錄**：版面固定在 1920×1080 舞台，同一篇文本人人位置相同，
  所以用 `index.html?aoi` **每篇匯出一份固定表**（見下方「AOI 座標表」）。每場的 `layout.csv` 只記每回合是否全螢幕、縮放比例，供事後確認畫面是原尺寸。

⚠️ **按 Start 時會自動進入全螢幕**；全螢幕且螢幕為 1920×1080 時（`layout.csv` 的 `fullscreen = 1`、`scale = 1`），AOI 表的設計座標就等於眼動儀的螢幕座標。
施測中請不要離開全螢幕（離開會寫一筆 `fullscreen_exit` 事件）。

---

## 施測流程

### 研究者（開始畫面，英語）

1. 先在 Gazepoint 的軟體完成校正並開始錄製。
2. 打開 `index.html`（連點兩下，或用 GitHub Pages 網址）。
3. 在 **Participant ID** 輸入受試者編號 → 下方自動帶出該編號的回合順序（**只顯示，不提供調整**；要換順序請改 `design.js` 的順序表）。
4. 按 **Start** → 進入全螢幕 → 把位置讓給受試者。

順序表有格式錯誤時，開始畫面會列出是第幾列、哪裡不對，**Start 會停用**、按了也不會開始。

### 受試者（Start 之後，全英語）

```
前測問卷（VAS-A 焦慮量表 → EES 情緒表達量表 17 題）
  → Next → 練習回合（不限時、無計時器）→ 計時器說明畫面（約 10 秒）
  → Next → 回合 1（數字倒數）→ VAS-A → NASA-TLX
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

**預設表的來歷**（3 類文本 × A／B → 6 回合、6 列）：沿用舊版 2（寬鬆／緊迫）× 3 的 Williams 平衡表，
2026-10-12 拿掉時間這一項，**6 列的文本順序完全不變**。舊表的排法：

1. 6 個格位依 (寬鬆, 緊迫) × (類型一, 類型二, 類型三) 編號 0–5；
2. 第 1 列用 Williams 平衡序列 `[0, 1, 5, 2, 4, 3]`（處理數為偶數時，一張方格即可平衡一階殘留效果）；
3. 第 i 列 ＝ 第 1 列每個編號加 i（模 6）；
4. 篇別：第 i 列的類型 k，`(i + k)` 為偶數時「寬鬆格配 A、緊迫格配 B」，否則相反。

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
| `questionnaires.csv` | 每份問卷一列：編號、場合（round／pretest／posttest）、回合、名稱、各題作答、計分值、分數、`pos`／`moved`／`first_move_ms`（只有 VAS-A 有值）、牆上時間 |
| `events.jsonl` | 所有事件；每筆都有 `client_ms`（毫秒時間戳）與 `wall_time`（含時區的 ISO 8601，到毫秒） |
| `session.json` | 場次設定、回合順序、前後測分數、各回合完整結果 |

### `summary.csv` 欄位（36 欄）

```
pid, latin_row, round, text_type, form, passage_id, passage_title, words, limit_s,
answers, correct_flags, correct, n_items, n_scored, accuracy, rt_s, end_reason,
first_answer_s, last_answer_s, n_remove, n_add, n_wrong_to_right, n_right_to_wrong,
nasa_mental, nasa_physical, nasa_temporal, nasa_performance, nasa_effort, nasa_frustration, nasa_rtlx,
vasa_pos, vasa_moved, practice_rt_s, practice_words, wall_start, wall_end, overflow
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
- `wall_start`／`wall_end`：該回合開始／結束的牆上時間（含時區、到毫秒）。
- `vasa_pos`：該回合後 VAS-A 的定位比例（0–1，小數 4 位，0＝calm、1＝anxious）；`vasa_moved`：受試者有沒有動過滑桿（1／0；目前沒動過不能按 Next，所以恆為 1）。
  切成 30 等分的整數分數只留在 `questionnaires.csv`／`answers.csv`。
- **練習列（`round = 0`）**：量表欄位留空；另有 `practice_rt_s`、`practice_words`。
- 不在 summary、改看其他檔：`manual_order`、`sec_per_word` 在 `session.json`；
  時間點事件（`time_50` 等）在 `events.jsonl`（`session.json` 各回合也有 `t50_s` 等）。
- **眼動欄位已全部移除**（網站不收眼動；眼動在 Gazepoint 那邊）。

### `answers.csv` 欄位

```
pid, context, round, source, item, item_label, option, value, correct, action, prev_option, t_ms, wall_time
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
| `make_latin.py` | 產生 Williams 平衡順序表（只在要改文本類型數時用） |

`make_latin.py` 是**離線工具**，施測本身完全不需要 Python。

---

## 待補材料

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
