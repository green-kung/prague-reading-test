// ══════════════════════════════════════════════════════════════════════════════
// 實驗材料（布拉格版）── 研究者直接編輯這個檔案
// ══════════════════════════════════════════════════════════════════════════════
// 這裡放「材料層」：文本、試題、量表題目與計分。
// 「設計層」（拉丁方格順序表、時間點事件、量表清單、前導選項）在 design.js。
//
// ★ 受試者畫面一律英語。
// ★ 標「待補」者為暫代內容：正式文本由同學提供；STAI 題目須貼入授權英語版。

window.MATERIALS = {

  // ── 文本類型名稱（開始畫面的順序表顯示用；日後改名只改這裡）──────────────────
  textTypeLabels: { type1: '文本類型一', type2: '文本類型二', type3: '文本類型三' },

  // ── 文本 ────────────────────────────────────────────────────────────────────
  // key＝passageId。練習文本 key 固定為 design.js 的 practicePassage（預設 'practice'）。
  // 正式文本：key＝`{textType}{form}`，例如 type1A；textType 與 form 兩欄是查表依據。
  //
  // limit: { loose: 秒, tight: 秒 }  每篇各有兩個秒數（寬鬆、緊迫）
  //   ⚠️ 目前填的 150／90 與 pilotMean_s 120 是**為了 10/8 演示隨意設定的數字**
  //      （Claude 設定，非文獻或 meeting 依據）。前導實驗後請用 pilot_limits.py
  //      算出的值覆蓋；未填時設為 null，開始畫面會顯示警告。
  // pilotMean_s: 前導實驗「不限時」的平均作答秒數 → 群體層級時間容忍度的分母。
  // demo: true 表示示範文本，開始畫面會顯示「示範文本」提醒。
  // 每題：{ stem, opts: [4 個選項], ans: 正確選項索引（0＝A）, kind }
  //   kind：surface（表層題）／integration（整合題）／inference（推論題）
  passages: {

    // ── 練習文本（不限時、無計時器、不填量表；兼作閱讀速度與眼動基準）──────────
    // 長度約正式文本三分之二、3 題
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
        { stem: 'Why do some bakers let dough rise overnight in a cold place?', opts: ['To kill the yeast before baking begins', 'To make the gluten network weaker', 'To stop carbon dioxide from forming', 'To develop more flavour while the yeast works slowly'], ans: 3, kind: 'inference' },
      ],
    },

    // ── 文本類型一（示範：自然科學說明文）──────────────────────────────────────
    type1A: {
      id: 'type1A', textType: 'type1', form: 'A', title: 'How Seawater Becomes Salt', demo: true,
      limit: { loose: 150, tight: 90 }, pilotMean_s: 120,
      paras: [
        'Along warm, dry coastlines, salt is still produced in shallow ponds called salt pans, using nothing but sunlight and wind. Seawater contains about three per cent salt. Leaving one large pool to dry out would be slow, and the salt would be mixed with mud, so a salt pan is divided into several connected ponds.',
        'The water first enters the evaporation ponds, which cover the largest area. The purpose of this stage is to let a great deal of water escape into the air, so that what remains becomes steadily more concentrated. Workers adjust the inflow according to the weather: on bright, windy days more water can be admitted, while on damp days less is let in.',
        'Once the water is concentrated enough, it is moved into the much smaller crystallising ponds. White grains begin to appear on the floor, but the workers do not wait until the water has dried out completely. Seawater also holds other substances with a bitter taste, and these separate out later than common salt.',
        'The grains are raked into heaps and left at the edge of the pond so that the remaining liquid drains away. Because the whole process depends on sunshine, salt is made in the drier months, and a sudden shower can dilute several days of work.',
      ],
      questions: [
        { stem: 'According to the passage, roughly how much salt does seawater contain?', opts: ['About one per cent', 'About three per cent', 'About five per cent', 'About ten per cent'], ans: 1, kind: 'surface' },
        { stem: 'Why are the evaporation ponds larger than the crystallising ponds?', opts: ['To make raking the salt into heaps easier', 'To keep mud out of the finished grains', 'To hold the extra water of the wet season', 'To let a large amount of water escape first'], ans: 3, kind: 'inference' },
        { stem: 'What would most probably happen if the crystallising ponds dried out completely?', opts: ['The salt would taste bitter', 'The harvest would be smaller', 'The grains would grow larger', 'The grains would turn darker'], ans: 0, kind: 'inference' },
      ],
    },

    type1B: {
      id: 'type1B', textType: 'type1', form: 'B', title: 'Why Fog Forms Over Cold Water', demo: true,
      limit: { loose: 150, tight: 90 }, pilotMean_s: 120,
      paras: [
        'Fog is simply a cloud that touches the ground or the surface of the sea. Air always carries a certain amount of invisible water vapour, and warm air can hold more of it than cold air. When air is cooled far enough, part of the vapour condenses into tiny droplets that scatter light and look white.',
        'The most common fog at sea forms when mild, damp air drifts across a cold current. The water chills the lowest layer of the air from below, and that layer reaches the temperature of condensation while the air above stays clear. This is why a ship\'s deck may be hidden while the top of the mast stands in sunshine.',
        'Droplets also need something to form on. The air over the sea is full of microscopic particles of salt left behind by breaking waves, and vapour condenses readily on them. Over a clean mountain lake, where such particles are scarce, the air can be cooled below the point of condensation and still remain clear.',
        'Fog disappears in two ways. Sunshine may warm the surface, so that the lowest layer of air can once again hold its vapour and the droplets evaporate. Or a stronger wind may mix the shallow damp layer with the drier air above, lifting the fog into a low sheet of cloud.',
      ],
      questions: [
        { stem: 'According to the passage, what is fog?', opts: ['A layer of salt particles in the air', 'A cloud that touches the ground or the sea', 'Warm air that has absorbed extra vapour', 'Rain that has not yet reached the ground'], ans: 1, kind: 'surface' },
        { stem: 'Why can the top of a mast stand in sunshine while the deck is hidden?', opts: ['Salt particles collect close to the water', 'Wind at that height blows the droplets away', 'Only the lowest layer of air has been chilled', 'Sunlight is scattered upwards by the droplets'], ans: 2, kind: 'inference' },
        { stem: 'What does the example of the mountain lake show?', opts: ['That cooling alone does not always produce droplets', 'That fresh water evaporates more slowly than seawater', 'That fog at high altitude is deeper than fog at sea', 'That clean air is colder than air carrying particles'], ans: 0, kind: 'inference' },
      ],
    },

    // ── 文本類型二（示範：歷史敘事）────────────────────────────────────────────
    type2A: {
      id: 'type2A', textType: 'type2', form: 'A', title: 'The Light on the Eddystone Rock', demo: true,
      limit: { loose: 150, tight: 90 }, pilotMean_s: 120,
      paras: [
        'Fourteen miles off the English port of Plymouth lies a reef that is covered by the sea at high water. For centuries it wrecked ships entering the harbour, yet no builder would go near it: the rock was too small to stand on and was washed by waves for most of the day.',
        'In 1696 a merchant named Henry Winstanley, who had lost two vessels there, began to build a tower on it himself. Work could only be done in calm summer weather. The tower that finally rose was an ornate wooden structure with a balcony, and Winstanley said he wished to be inside it during the greatest storm that ever blew. In November 1703 such a storm came, and both the tower and its builder disappeared.',
        'The next attempt, a timber structure finished in 1709, stood for nearly fifty years before it burned down. Its keeper, by then almost a hundred years old, swore that molten lead from the roof had run down his throat as he looked up at the fire; the doctors did not believe him until, after his death, a piece of lead was found in his stomach.',
        'The third tower changed engineering. John Smeaton shaped it like the trunk of an oak and cut the granite blocks so that each one locked into its neighbours. His tower served for more than a century.',
      ],
      questions: [
        { stem: 'Why had no builder worked on the reef before 1696?', opts: ['The port of Plymouth refused to pay for a tower', 'No ships had yet been wrecked on the rock', 'Stone could not be carried so far out to sea', 'It was tiny and under water much of the time'], ans: 3, kind: 'surface' },
        { stem: 'What happened to the tower that Winstanley built?', opts: ['It was destroyed in a great storm in 1703', 'It burned down after nearly fifty years', 'It was taken down and rebuilt on shore', 'It cracked when the rock beneath it gave way'], ans: 0, kind: 'surface' },
        { stem: 'Why did the doctors finally accept the old keeper\'s account?', opts: ['Another keeper had reported the same accident', 'Lead was found inside his body after his death', 'The roof of the tower was known to be lead', 'He repeated the story in exactly the same words'], ans: 1, kind: 'inference' },
      ],
    },

    type2B: {
      id: 'type2B', textType: 'type2', form: 'B', title: 'How the Pencil Got Its Shape', demo: true,
      limit: { loose: 150, tight: 90 }, pilotMean_s: 120,
      paras: [
        'In the middle of the sixteenth century, a storm in the north of England tore up a large tree and exposed a black mineral underneath. Local shepherds found that it left a dark mark, and began using lumps of it to label their sheep. The mineral was graphite, and the deposit turned out to be the purest ever found in Europe. It was so valuable that the mine was flooded on purpose between working seasons to stop thieves.',
        'Pure graphite is soft and dirty to hold, so the lumps were first wrapped in string or sheepskin. Within a few decades craftsmen were instead cutting thin rods of graphite and fitting them into a groove in a wooden stick, which was then covered with a second strip of wood.',
        'The problem was that this could only be done where pure graphite was available. It was solved during the wars of the late eighteenth century, when France was cut off from English graphite. An officer named Nicolas-Jacques Conté ground the poor local graphite to powder, mixed it with clay, and fired the mixture in a kiln. The result worked as well as the natural rods.',
        'The familiar hexagonal shape came later and for practical reasons. Round pencils roll off sloping desks, and a six-sided rod can be cut from a block of wood with less waste. Carpenters, however, kept the flat oval pencil, which does not roll at all.',
      ],
      questions: [
        { stem: 'How was the graphite deposit first discovered?', opts: ['A shepherd dug a well on the hillside', 'A storm uprooted a tree and exposed it', 'Miners were searching for lead in the area', 'A craftsman found a lump beside a stream'], ans: 1, kind: 'surface' },
        { stem: 'Why was the mine deliberately flooded between working seasons?', opts: ['To prevent people from stealing the graphite', 'To wash clay out of the graphite', 'To stop the tunnels from collapsing', 'To soften the mineral before cutting'], ans: 0, kind: 'inference' },
        { stem: 'Why was the method invented by Conté important?', opts: ['It made pencils cheaper to cover in wood', 'It allowed pencils to be made from impure graphite', 'It removed the need to fire the mixture in a kiln', 'It produced a softer line than natural graphite'], ans: 1, kind: 'inference' },
      ],
    },

    // ── 文本類型三（示範：論述比較）────────────────────────────────────────────
    type3A: {
      id: 'type3A', textType: 'type3', form: 'A', title: 'Should City Centres Be Closed to Cars?', demo: true,
      limit: { loose: 150, tight: 90 }, pilotMean_s: 120,
      paras: [
        'Several European cities have closed their central streets to private cars, and the results are often presented as an obvious success: cleaner air, fewer injuries, and squares full of people. Supporters argue that street space is public land, and that handing most of it to a vehicle that stands still for twenty-two hours a day is a poor use of a scarce resource.',
        'Shopkeepers usually object first, and their fear is reasonable. If customers arrive by car and carry heavy bags home, a barrier at the end of the street looks like a threat to the business. Yet surveys taken afterwards repeatedly show that retailers overestimate how many of their customers drive, sometimes by a factor of three, and that turnover tends to rise rather than fall.',
        'The stronger objection is about fairness. A ban affects people unequally. A resident of a well-served central district loses little, because a tram passes every few minutes. A nurse who finishes a night shift in a suburb with no late service may lose a great deal. Such bans are easiest to accept for those who can afford the alternative.',
        'That objection does not defeat the policy, but it does set a condition. A ban introduced before the alternatives exist mainly punishes the people with the fewest options, while one introduced after a frequent service is running tends to be accepted within a few years.',
      ],
      questions: [
        { stem: 'What argument do supporters make about street space?', opts: ['It is cheaper to maintain without traffic', 'It is public land poorly used by parked cars', 'It belongs to the shopkeepers who face it', 'It should be divided equally between districts'], ans: 1, kind: 'surface' },
        { stem: 'What do surveys taken after such schemes suggest about shopkeepers?', opts: ['They lose most of their regular customers', 'They overestimate how many customers drive', 'They prefer parking charges to bans', 'They move their shops to the suburbs'], ans: 1, kind: 'surface' },
        { stem: 'Why does the writer call unfairness the stronger objection?', opts: ['Because it applies to every resident equally', 'Because it has been proved by repeated surveys', 'Because the burden falls on those with fewest options', 'Because it concerns money rather than convenience'], ans: 2, kind: 'inference' },
      ],
    },

    type3B: {
      id: 'type3B', textType: 'type3', form: 'B', title: 'Paper Maps and Digital Maps', demo: true,
      limit: { loose: 150, tight: 90 }, pilotMean_s: 120,
      paras: [
        'Anyone who has followed a phone through an unfamiliar city knows how well digital maps work. They know where you are, and they correct you when you turn the wrong way. It would be strange to argue that a paper sheet is a better tool for getting from a station to a hotel. The interesting question is not which is better, but what each kind of map encourages you to do.',
        'A paper map shows a whole area at one scale, and you have to find yourself on it. That is slower, and it fails in the dark, but it forces a kind of thinking that researchers call survey knowledge: an understanding of how districts lie in relation to one another. A screen usually offers a narrow strip rotated so that your route runs upwards, which is ideal for following instructions.',
        'Experiments comparing the two tend to find the same pattern. Participants guided turn by turn reach the destination faster and with fewer mistakes, yet afterwards they draw the area less accurately and are less able to point towards places they have passed. Those who studied a plan beforehand are slower at first but need less help later.',
        'None of this is a reason to go back to paper. It is a reason to notice what the tool is doing for you. For a single visit, the fastest route is all you need; for a place you intend to return to, it may be worth an evening with a plan.',
      ],
      questions: [
        { stem: 'According to the writer, what is the interesting question about the two kinds of map?', opts: ['Which one is cheaper to produce', 'Which one is more accurate in a city', 'What each kind encourages the user to do', 'How quickly each one can be read in the dark'], ans: 2, kind: 'surface' },
        { stem: 'What does the passage say about survey knowledge?', opts: ['It is learned by following turn-by-turn instructions', 'It concerns how districts lie in relation to each other', 'It develops faster on a screen than on paper', 'It matters only to professional map makers'], ans: 1, kind: 'inference' },
        { stem: 'What did participants guided turn by turn do less well?', opts: ['Reaching the destination without mistakes', 'Following instructions in an unfamiliar city', 'Finding the route a second time', 'Drawing the area and pointing to places'], ans: 3, kind: 'surface' },
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
