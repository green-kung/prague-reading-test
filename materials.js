// ══════════════════════════════════════════════════════════════════════════════
// 實驗材料（布拉格版）── 研究者直接編輯這個檔案
// ══════════════════════════════════════════════════════════════════════════════
// 這裡放「材料層」：文本、試題、量表題目與計分。
// 「設計層」（拉丁方格順序表、時間點事件、量表清單、前導選項）在 design.js。
//
// ★ 受試者畫面一律英語。
// ★ 正式文本 6 篇來自研究者筆記庫的「考試閱讀實驗材料」（原件 @Perry，2026-10-08），只放英文版的文章與題目；
//   中文版與解答說明不放進網站。正確答案以原件「設計總覽」表格為準。練習文本仍是示範文本。

window.MATERIALS = {

  // ── 文本類型名稱（開始畫面的順序表顯示用；日後改名只改這裡）──────────────────
  // 文本類型＝答案結構；A 篇＝說明文、B 篇＝論辯文
  textTypeLabels: { type1: '唯一解', type2: '多重解', type3: '無解' },

  // ── 文本 ────────────────────────────────────────────────────────────────────
  // key＝passageId。練習文本 key 固定為 design.js 的 practicePassage（預設 'practice'）。
  // 正式文本：key＝`{textType}{form}`，例如 type1A；textType 與 form 兩欄是查表依據。
  //
  // limit: { loose: 秒, tight: 秒 }  每篇各有兩個秒數（寬鬆、緊迫）
  //   ⚠️ 目前寬鬆、緊迫都暫填 180 秒（3 分鐘，無時間壓力差），pilotMean_s 120 是**演示用隨意設定的數字**
  //      （Claude 設定，非文獻或 meeting 依據）。前導實驗後請用 pilot_limits.py
  //      算出的值覆蓋；未填時設為 null，開始畫面會顯示警告。
  // pilotMean_s: 前導實驗「不限時」的平均作答秒數 → 群體層級時間容忍度的分母。
  // demo: true 表示示範文本（目前只有練習文本）。
  // 每題：{ stem, opts: [4 個選項], ans }，選項索引 0＝A
  //   ans 為陣列＝可證成選項：[1] 唯一解（只勾 B 才對）；[0, 1] 多重解（A、B 都勾且不多勾才對）；
  //   [] 無解（沒有正解：correct 記空白、不計入 accuracy，但照常記錄選項與時間）。
  //   練習文本沿用舊寫法 ans: 數字，等同只有一個可證成選項。
  passages: {

    // ── 練習文本（不限時、無計時器、不填量表；兼作閱讀速度與眼動基準）──────────
    // 長度約正式文本三分之二、2 題（與正式文本題數相同）
    practice: {
      id: 'practice', title: 'Why Bread Rises', demo: true,
      paras: [
        'Bread dough is a mixture of flour, water, salt and yeast. Yeast is a living organism, a single-celled fungus that feeds on the sugars in flour. As it feeds, it releases carbon dioxide, and it is this gas that makes the dough rise.',
        'The gas cannot escape easily. When dough is kneaded, the proteins in the flour link together into an elastic network called gluten, and this network traps the bubbles so that the dough slowly swells. Dough that has not been kneaded enough has a weak network, the gas escapes, and the loaf stays flat.',
        'Temperature controls the speed of the process. Yeast works quickly in a warm kitchen and almost stops in a refrigerator. Some bakers use the cold on purpose: a slow rise overnight gives the bread more flavour, because other slower reactions in the dough continue while the yeast is held back.',
      ],
      questions: [
        { stem: 'According to the passage, what makes bread dough rise?', opts: ['Salt dissolving in the water', 'Water turning into steam', 'Carbon dioxide released by yeast', 'Gluten absorbing sugar'], ans: 2, kind: 'surface' },
        { stem: 'Why does dough that has not been kneaded enough stay flat?', opts: ['The gas escapes through a weak gluten network', 'The yeast dies before it can feed', 'Too much salt has been added to the flour', 'The flour contains no sugar for the yeast'], ans: 0, kind: 'inference' },
      ],
    },

    // ── 唯一解 ─────────────────────────────────────────────────────────────
    type1A: {   // 原件第 1 號（說明文）
      id: 'type1A', textType: 'type1', form: 'A', title: "Circadian Rhythm",
      limit: { loose: 180, tight: 180 }, pilotMean_s: 120,   // 2026-10-08 暫時全部統一 180 秒（3 分鐘）
      paras: [
        "A circadian rhythm is a physiological cycle of roughly twenty-four hours inside a living organism. It includes sleep and wakefulness, the rise and fall of body temperature, and the release of hormones. This rhythm is not simply produced by the outside cycle of day and night. Even when people are placed in an environment with no time cues, the rhythm keeps running, although its cycle gradually drifts away from the actual clock.",
        "In humans, the rhythm is coordinated by the suprachiasmatic nucleus in the hypothalamus. When the retina receives light, it sends signals to the suprachiasmatic nucleus, which synchronizes the body clock with the outside day and night. Light is therefore regarded as the most important time cue. In the evening, as light fades, the pineal gland begins to release melatonin, body temperature falls, and the body gradually enters a state suited to sleep. After exposure to light in the early morning, melatonin release is suppressed and the person wakes up.",
        "Besides light, meal times and regular activity can also adjust the body clock, but their influence is weaker. When a person quickly crosses several time zones, the body clock cannot immediately match the local day and night. The result is jet lag: sleepiness during the day and difficulty falling asleep at night. In general, the body needs several days to become synchronized again.",
      ],
      questions: [
        { stem: "According to the passage, which of the following statements is correct?",
          opts: ["In an environment with no time cues, the circadian rhythm stops running immediately.", "Light is the most important cue for synchronizing the body clock with the outside day and night.", "Melatonin begins to be released in large amounts after exposure to light in the early morning.", "Meal times have a stronger influence on the body clock than light does."],
          ans: [1] },
        { stem: "According to the passage, what is the main cause of jet lag?",
          opts: ["The pineal gland stops releasing melatonin during the journey.", "The suprachiasmatic nucleus stops functioning after time zones are crossed.", "The body clock cannot immediately match the local day and night.", "Meal times during the journey are too regular."],
          ans: [2] },
      ],
    },

    type1B: {   // 原件第 4 號（論辯文）
      id: 'type1B', textType: 'type1', form: 'B', title: "Remote Work",
      limit: { loose: 180, tight: 180 }, pilotMean_s: 120,   // 2026-10-08 暫時全部統一 180 秒（3 分鐘）
      paras: [
        "Whether remote work should become the norm for companies has been widely debated in recent years.",
        "Supporters argue that remote work should become the norm. First, employees save commuting time and can arrange work and life more flexibly. Second, an experiment with customer service staff at a travel company found that those who worked from home performed better and were less likely to quit. On this basis, supporters claim that remote work benefits both employees and companies.",
        "Opponents argue that the office should remain the main workplace. They point out that many new ideas come from unplanned conversations between colleagues, and that such interactions rarely happen online. A study of employees at a large technology company also found that after a full shift to remote work, employees had less contact with other departments and tended to work with the same people. In addition, new employees lose the chance to observe and consult senior colleagues nearby, so they may learn more slowly.",
        "In response to these doubts, supporters say that the drop in collaboration is not caused by remote work itself but by companies not yet having set up suitable ways of collaborating online. Opponents counter that the work in the customer service experiment consisted mostly of tasks that can be completed independently, so its results may not apply to work that requires close collaboration.",
        "The disagreement between the two sides lies in how to weigh individual flexibility against team interaction.",
      ],
      questions: [
        { stem: "According to the passage, how do opponents rebut the results of the customer service experiment?",
          opts: ["The experiment had too few participants for its results to be representative.", "The work in the experiment consisted mostly of tasks that can be completed independently, so the results may not apply to work that requires close collaboration.", "The home workers in the experiment were in fact more likely to quit.", "The experiment did not compare home workers with office workers."],
          ans: [1] },
        { stem: "According to the passage, which of the following is a view put forward by supporters?",
          opts: ["Many new ideas come from unplanned conversations between colleagues.", "New employees learn faster in a remote environment.", "The office should remain the main workplace.", "Collaboration has dropped because companies have not yet set up suitable ways of collaborating online."],
          ans: [3] },
      ],
    },

    // ── 多重解 ─────────────────────────────────────────────────────────────
    type2A: {   // 原件第 2 號（說明文）
      id: 'type2A', textType: 'type2', form: 'A', title: "Urban Heat Island",
      limit: { loose: 180, tight: 180 }, pilotMean_s: 120,   // 2026-10-08 暫時全部統一 180 秒（3 分鐘）
      paras: [
        "The urban heat island effect is the phenomenon in which temperatures in a city are clearly higher than in the surrounding countryside. The difference is usually most noticeable at night, because the heat a city stores during the day is released only slowly after dark.",
        "The effect is related to the surface materials and spatial structure of cities. Asphalt and concrete absorb and store large amounts of solar radiation during the day and release that heat into the air after nightfall. In contrast, vegetation in the countryside carries heat away through evapotranspiration, and the evaporation of water in the soil also has a cooling effect. Cities have little vegetation, so this natural cooling is weakened. In addition, densely packed tall buildings block the flow of air, which makes it harder for heat to escape, while waste heat from air conditioners, vehicles and factories raises temperatures further.",
        "The heat island effect has knock-on consequences. Higher temperatures increase the use of electricity for air conditioning, and the waste heat from air conditioners makes the outdoors even hotter, creating a cycle. High temperatures also raise the risk of heat-related illness, especially for older people. To reduce the effect, many cities add parks and street trees, install green roofs, or switch to light-coloured paving that reflects sunlight.",
      ],
      questions: [
        { stem: "According to the passage, which of the following is a cause of the urban heat island effect?",
          opts: ["Asphalt and concrete absorb and store large amounts of solar radiation during the day.", "Cities have little vegetation, which weakens the cooling effect of evapotranspiration.", "Soil in the countryside contains less water than soil in cities.", "Light-coloured paving reflects too much sunlight."],
          ans: [0, 1] },
        { stem: "According to the passage, which of the following statements is correct?",
          opts: ["The temperature difference caused by the heat island effect is usually most noticeable at noon.", "Waste heat from air conditioners raises outdoor temperatures further.", "Densely packed tall buildings help heat to escape.", "Installing green roofs is one of the measures cities use to reduce the heat island effect."],
          ans: [1, 3] },
      ],
    },

    type2B: {   // 原件第 5 號（論辯文）
      id: 'type2B', textType: 'type2', form: 'B', title: "School Phone Bans",
      limit: { loose: 180, tight: 180 }, pilotMean_s: 120,   // 2026-10-08 暫時全部統一 180 秒（3 分鐘）
      paras: [
        "Whether schools should completely ban students from using mobile phones at school is an education issue under discussion in many countries.",
        "Those in favour of a ban argue that phones are the main source of distraction in class. Even when a phone is not picked up, message notifications interrupt students' attention. A study in England found that after schools banned phones, students' exam results improved, and students who had previously had lower results improved the most. Those in favour also point out that without phones at break time, students have more chances to spend time with each other face to face.",
        "Those against a ban argue that a complete ban is not a good solution. They claim that students will eventually have to live in an environment full of digital devices, so schools should teach students to manage themselves rather than take the devices away. They also point out that phones can be used to look up information and to carry out classroom activities, which makes them useful learning tools. Another study, which compared schools with different rules, found no clear difference in students' mental health between schools that banned phones and schools that did not.",
        "In response, those in favour say that the ability to manage oneself takes time to develop, and that until students have this ability, schools have a responsibility to reduce distractions first. Those against counter that a ban works only inside school; students' habits after school do not change, so the problem is merely postponed.",
        "At the heart of this debate is whether schools should deal with phones through restriction or through guidance.",
      ],
      questions: [
        { stem: "According to the passage, which of the following is a reason given by those against a complete ban?",
          opts: ["Schools should teach students to manage themselves rather than take the devices away.", "Phones can be used to look up information and to carry out classroom activities, which makes them useful learning tools.", "Banning phones makes students who previously had lower results do worse.", "Message notifications do not interrupt students' attention."],
          ans: [0, 1] },
        { stem: "According to the passage, which of the following is a point made by those in favour of a ban?",
          opts: ["A ban works only inside school; students' habits after school do not change.", "After schools banned phones, students' exam results improved.", "There is a clear difference in students' mental health between schools that ban phones and schools that do not.", "Until students are able to manage themselves, schools have a responsibility to reduce distractions first."],
          ans: [1, 3] },
      ],
    },

    // ── 無解 ─────────────────────────────────────────────────────────────
    type3A: {   // 原件第 3 號（說明文）
      id: 'type3A', textType: 'type3', form: 'A', title: "Coral Bleaching",
      limit: { loose: 180, tight: 180 }, pilotMean_s: 120,   // 2026-10-08 暫時全部統一 180 秒（3 分鐘）
      paras: [
        "Corals look like rocks or plants, but they are in fact colonies made up of many tiny animals called polyps. Inside the tissue of reef-building corals live single-celled algae called zooxanthellae. The two have a mutually beneficial relationship: the zooxanthellae carry out photosynthesis and pass the nutrients they produce to the coral, while the coral gives the zooxanthellae a place to live and the carbon dioxide they need for photosynthesis. Most of a coral's colour also comes from these algae.",
        "When seawater stays too warm for a long time, photosynthesis in the zooxanthellae goes wrong and produces substances that harm the coral's tissue, so the coral expels the zooxanthellae from its body. Without the algae, the coral's tissue becomes transparent and the white calcium carbonate skeleton beneath it shows through. This is coral bleaching. Besides high temperature, strong sunlight and water pollution may also trigger bleaching.",
        "A bleached coral does not die immediately. If the water temperature returns to normal within a short time, the coral can regain zooxanthellae and gradually recover. If the high temperature lasts too long, however, the coral dies from a prolonged lack of nutrients. Large-scale bleaching leaves the fish and other creatures that depend on coral reefs without a habitat, and this in turn affects the whole reef ecosystem.",
      ],
      questions: [
        { stem: "According to the passage, which of the following statements is correct?",
          opts: ["Coral bleaching happens because high temperature turns the calcium carbonate skeleton white.", "Once a coral has bleached, it can never recover.", "The carbon dioxide that zooxanthellae need for photosynthesis comes mainly from seawater.", "Water pollution is the most important cause of coral bleaching."],
          ans: [] },
        { stem: "According to the passage, why do bleached corals die?",
          opts: ["The zooxanthellae multiply rapidly inside the coral and use up its nutrients.", "The coral's skeleton gradually dissolves after losing its colour.", "The coral loses its source of nutrients after the fish that depend on the reef leave.", "Strong sunlight directly destroys the coral's skeleton."],
          ans: [] },
      ],
    },

    type3B: {   // 原件第 6 號（論辯文）
      id: 'type3B', textType: 'type3', form: 'B', title: "Congestion Charge",
      limit: { loose: 180, tight: 180 }, pilotMean_s: 120,   // 2026-10-08 暫時全部統一 180 秒（3 分鐘）
      paras: [
        "To improve traffic in city centres, some cities charge a congestion fee on vehicles that enter the centre during peak hours. Opinions differ on whether this policy is worth adopting.",
        "Supporters argue that road space is limited and that a charge encourages drivers to switch to public transport or to travel at a different time. After London and Stockholm introduced a charge, the number of vehicles entering the city centre fell clearly in both cities. Supporters also point out that the revenue can be used to improve buses and metro services, so that people who do not drive benefit as well.",
        "Opponents argue that a congestion charge is unfair. People with higher incomes do not mind the fee and keep driving as usual, while people with lower incomes who have to commute by car carry a relatively heavy burden. Opponents also question whether the effect lasts: several years after London introduced its charge, driving speeds in the city centre had returned to a level close to that before the charge.",
        "In response to the fairness concern, supporters say that people with lower incomes already use public transport more often, so as long as the revenue is invested in public transport, they are in fact the group that benefits more. As for the London example, supporters argue that speeds fell because some lanes were converted into bus lanes and cycle lanes, which does not mean the charge failed. Opponents counter that if public transport in the suburbs is not convenient enough, drivers have no real alternative, and the charge simply adds to their costs.",
        "The debate centres on whether the effect of a congestion charge lasts and whether its burden is fair.",
      ],
      questions: [
        { stem: "According to the passage, which of the following statements is correct?",
          opts: ["Supporters believe that people with lower incomes carry the heaviest burden under a congestion charge.", "Opponents believe that driving speeds in London fell because some lanes were converted into bus lanes and cycle lanes.", "Several years after Stockholm introduced its charge, driving speeds returned to a level close to that before the charge.", "Opponents propose that the revenue should be used to improve public transport in the suburbs."],
          ans: [] },
        { stem: "According to the passage, how do supporters respond to the concern that a congestion charge is unfair?",
          opts: ["People with higher incomes will drive less because of the charge.", "The amount of the charge is adjusted according to the driver's income.", "Most people with lower incomes do not need to enter the city centre.", "People with lower incomes who have to commute by car can apply for an exemption."],
          ans: [] },
      ],
    },
  },

  // ── 量表 ────────────────────────────────────────────────────────────────────
  // 出現順序由 design.js 的 roundQuestionnaires／preQuestionnaires／postQuestionnaires 決定。
  questionnaires: {

    // NASA 任務負荷指標 (NASA Task Load Index, NASA-TLX)
    // 6 個分量表各一題，21 刻度（20 個等距區間），分數 0–100（每格 5 分）；
    // 不做兩兩比較加權（沿用原型計分）。題目文字為 NASA 公開的英語原版定義
    // （Hart & Staveland, 1988 的 rating scale definitions）。
    nasa: {
      title: 'Task Load',
      intro: 'Think about the round you have just finished. On each scale, click the point that best matches your experience.',
      type: 'tlx',
      items: [
        { key: 'mental', label: 'Mental Demand',
          text: 'How much mental and perceptual activity was required (e.g. thinking, deciding, calculating, remembering, looking, searching)? Was the task easy or demanding, simple or complex, exacting or forgiving?',
          low: 'Low', high: 'High' },
        { key: 'physical', label: 'Physical Demand',
          text: 'How much physical activity was required (e.g. pushing, pulling, turning, controlling, activating)? Was the task easy or demanding, slow or brisk, slack or strenuous, restful or laborious?',
          low: 'Low', high: 'High' },
        { key: 'temporal', label: 'Temporal Demand',
          text: 'How much time pressure did you feel due to the rate or pace at which the tasks or task elements occurred? Was the pace slow and leisurely or rapid and frantic?',
          low: 'Low', high: 'High' },
        { key: 'performance', label: 'Performance',
          text: 'How successful do you think you were in accomplishing the goals of the task? How satisfied were you with your performance in accomplishing these goals?',
          low: 'Good', high: 'Poor' },
        { key: 'effort', label: 'Effort',
          text: 'How hard did you have to work (mentally and physically) to accomplish your level of performance?',
          low: 'Low', high: 'High' },
        { key: 'frustration', label: 'Frustration',
          text: 'How insecure, discouraged, irritated, stressed and annoyed versus secure, gratified, content and relaxed did you feel during the task?',
          low: 'Low', high: 'High' },
      ],
    },

    // 狀態焦慮量表 6 題短版 (State-Trait Anxiety Inventory – State, 6-item short form;
    // Marteau & Bekker, 1992)：原 STAI-S 第 1、3、6、15、16、17 題。
    // 第 1、15、16 題反向計分；6 題總分 × 20 ÷ 6 換算為完整版分數（20–80）。
    // 題目文字與呈現順序由使用者提供；reverse 標記跟著題號走，換順序不影響計分。
    // ★ 下面四個作答選項是 STAI-S 慣用的英語錨點，請同時對照授權版核實。
    stai: {
      title: 'How You Feel Right Now',
      intro: 'Read each statement and choose the answer that best describes how you feel at this moment.',
      type: 'likert',
      options: [{ v: 1, t: 'Not at all' }, { v: 2, t: 'Somewhat' }, { v: 3, t: 'Moderately so' }, { v: 4, t: 'Very much so' }],
      items: [
        { no: 3, text: 'I feel tense' },
        { no: 6, text: 'I feel upset' },
        { no: 17, text: 'I am worried' },
        { no: 1, text: 'I feel calm', reverse: true },
        { no: 15, text: 'I feel relaxed', reverse: true },
        { no: 16, text: 'I feel content', reverse: true },
      ],
    },

    // 同學量表插槽：預設不在 design.js 的 roundQuestionnaires 內。
    // 要啟用就把 'peer' 加進 roundQuestionnaires，並把題目換成同學的正式題目。
    peer: {
      title: 'Your Thinking During Reading',
      intro: 'Think about the round you have just finished and choose the answer that fits best.',
      type: 'likert',
      options: [{ v: 1, t: 'Not at all' }, { v: 2, t: 'A little' }, { v: 3, t: 'Quite a lot' }, { v: 4, t: 'Very much' }],
      items: [
        { no: 1, text: '(placeholder item — to be replaced with the collaborator\'s cognitive-emotion items) While reading this passage, I found it hard to keep my attention on the text.' },
      ],
    },
  },

  // 英文字數（以空白切分段落文字；不含標題與試題）── 用於時間容忍度的預期所需時間
  words(p) {
    return (p.paras || []).join(' ').trim().split(/\s+/).filter(Boolean).length;
  },
};

// ── 計分 ──────────────────────────────────────────────────────────────────────
window.SCORING = {
  nasa(answers, q) {
    const subscales = {};
    q.items.forEach((it, i) => { subscales[it.key] = answers[i] * 5; });   // 刻度 0–20 → 0–100
    return { subscales, temporal: subscales.temporal };
  },
  stai(answers, q) {
    const raw = q.items.reduce((s, it, i) => s + (it.reverse ? 5 - answers[i] : answers[i]), 0);
    return { raw, prorated: Math.round(raw * 20 / q.items.length * 10) / 10 };
  },
  // 同學量表：先給最簡單的總分與平均；正式計分方式由同學提供後替換
  peer(answers, q) {
    const raw = answers.reduce((s, a) => s + a, 0);
    return { raw, mean: Math.round(raw / q.items.length * 100) / 100 };
  },
};
