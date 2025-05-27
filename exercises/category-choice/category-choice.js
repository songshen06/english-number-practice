// 题库，后续可直接扩展
const questions = [
  {
    category: "职业类 (Professions)",
    stem: ["doctor", "nurse", "firefighter"],
    options: ["before", "happy", "hospital", "police officer"],
    answer: 3,
    explanation:
      "前3个词都是职业，只有D也是职业。其余选项分别是时间词、形容词和地点。",
  },
  {
    category: "职业类 (Professions)",
    stem: ["driver", "train driver", "librarian"],
    options: ["young", "office", "played", "farmer"],
    answer: 3,
    explanation:
      "前3个词都是职业，只有D也是职业。其余选项为形容词、地点和动词。",
  },
  {
    category: "地点类 (Places)",
    stem: ["office", "factory", "shop"],
    options: ["worked", "driver", "happy", "hospital"],
    answer: 3,
    explanation:
      "前3个词都是地点，只有D也是地点。其余选项为动词、职业和形容词。",
  },
  {
    category: "乐器类 (Musical Instruments)",
    stem: ["flute", "erhu", "piano"],
    options: ["music", "player", "played", "violin"],
    answer: 3,
    explanation:
      "前3个词都是乐器，只有D也是乐器。其余选项为音乐、演奏者和动词。*piano/violin不在源材料中*",
  },
  {
    category: "动物类 (Animals)",
    stem: ["cat", "dog", "rabbit"],
    options: ["car", "teacher", "lion", "apple"],
    answer: 2,
    explanation: "cat、dog、rabbit 和 lion 都是动物，其他选项不是。",
  },
  {
    category: "食物类 (Food)",
    stem: ["meat", "rice", "vegetables"],
    options: ["wait", "chicken", "yesterday", "together"],
    answer: 1,
    explanation: "meat、rice、vegetables 和 chicken 都是食物，其他选项不是。",
  },
  {
    category: "食物类 (Food)",
    stem: ["noodles", "egg", "bread"],
    options: ["birthday", "chips", "families", "special"],
    answer: 1,
    explanation: "noodles、egg、bread 和 chips 都是食物，其他选项不是。",
  },
  {
    category: "食物类 (Food)",
    stem: ["sausages", "fish", "sandwiches"],
    options: ["hamburger", "survey", "delicious", "answer"],
    answer: 0,
    explanation:
      "sausages、fish、sandwiches 和 hamburger 都是食物，其他选项不是。",
  },
  {
    category: "食物类 (Food)",
    stem: ["apples", "muffin/cupcake", "potatoes"],
    options: ["dish", "report", "English food", "say"],
    answer: 2,
    explanation:
      "apples、muffin/cupcake、potatoes 和 English food 都是食物，其他选项不是。",
  },
  {
    category: "时间类 (Time)",
    stem: ["yesterday", "today", "Sundays"],
    options: ["when", "half past twelve", "families", "delicious"],
    answer: 1,
    explanation:
      "yesterday、today、Sundays 和 half past twelve 都是时间相关词，其他选项不是。",
  },
  {
    category: "时间类 (Time)",
    stem: ["breakfast", "lunch", "dinner"],
    options: ["hungry", "o'clock", "want", "ask"],
    answer: 1,
    explanation:
      "breakfast、lunch、dinner 和 o'clock 都与时间相关，其他选项不是。",
  },
  {
    category: "人物/代词类 (People/Pronouns)",
    stem: ["who", "families", "together"],
    options: ["wait", "other", "answer", "chicken"],
    answer: 1,
    explanation:
      "who、families、together 和 other 都可指人或群体，其他选项不是。",
  },
  {
    category: "形容词类 (Adjectives)",
    stem: ["special", "traditional", "delicious"],
    options: ["hungry", "rice", "dish", "report"],
    answer: 0,
    explanation:
      "special、traditional、delicious 和 hungry 都是形容词，其他选项不是。",
  },
  {
    category: "动词类 (Verbs)",
    stem: ["wait", "want", "ask"],
    options: ["say", "potatoes", "bread", "yesterday"],
    answer: 0,
    explanation: "wait、want、ask 和 say 都是动词，其他选项不是。",
  },
  {
    category: "名词类 (Nouns)",
    stem: ["survey", "report", "email"],
    options: ["answer", "when", "delicious", "together"],
    answer: 0,
    explanation: "survey、report、email 和 answer 都是名词，其他选项不是。",
  },
];

// 每次随机抽取的题目数量
const TOTAL_QUESTIONS = 6;

// Fisher-Yates 洗牌算法
function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 随机抽取 TOTAL_QUESTIONS 道题
let questionOrder = shuffle([...Array(questions.length).keys()]).slice(
  0,
  TOTAL_QUESTIONS
);
let current = 0;
let optionOrder = [];

// 记录用户答题
let userAnswers = [];

function updateProgressCounter() {
  let counter = document.getElementById("progress-counter");
  if (!counter) {
    counter = document.createElement("div");
    counter.id = "progress-counter";
    counter.style.marginBottom = "10px";
    counter.style.fontWeight = "bold";
    counter.style.color = "#6c3483";
    document
      .querySelector(".container")
      .insertBefore(counter, document.getElementById("question-area"));
  }
  counter.textContent = `已完成：${current} / ${TOTAL_QUESTIONS}`;
}

function renderQuestion() {
  document.getElementById("feedback").textContent = "";
  document.getElementById("next-btn").style.display = "none";
  updateProgressCounter();
  // 隐藏类别提示
  document.getElementById("category-label").style.display = "none";
  const qIdx = questionOrder[current];
  const q = questions[qIdx];
  document.getElementById("category-label").textContent = q.category;
  document.getElementById("stem").innerHTML = q.stem
    .map((w) => `<span class='stem-word'>${w}</span>`)
    .join(" ");
  // 随机选项顺序
  optionOrder = shuffle([0, 1, 2, 3]);
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  optionOrder.forEach((optIdx, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = String.fromCharCode(65 + i) + ". " + q.options[optIdx];
    btn.onclick = () => checkAnswer(optIdx, btn, i);
    optionsDiv.appendChild(btn);
  });
  document.getElementById("progress").textContent = `第 ${
    current + 1
  } / ${TOTAL_QUESTIONS} 题`;

  // --- 修复显示类别提示按钮 ---
  const showCategoryBtn = document.getElementById("show-category-btn");
  if (showCategoryBtn) {
    showCategoryBtn.style.display = "inline-block";
    showCategoryBtn.disabled = false;
    // 先移除所有旧事件（通过设置 onclick 为 null）
    showCategoryBtn.onclick = null;
    showCategoryBtn.onclick = function () {
      document.getElementById("category-label").style.display = "block";
      showCategoryBtn.style.display = "none";
    };
  }

  // --- 返回首页按钮同理 ---
  const backBtn = document.getElementById("back-to-home-btn");
  if (backBtn) {
    backBtn.disabled = false;
    backBtn.onclick = null;
    backBtn.onclick = function () {
      window.location.href = "../../index.html";
    };
  }
}

function checkAnswer(selectedIdx, btn, shownIdx) {
  const qIdx = questionOrder[current];
  const q = questions[qIdx];
  // 找到当前正确答案在乱序后的下标
  const correctOptIdx = optionOrder.indexOf(q.answer);
  const optionBtns = document.querySelectorAll(".option-btn");
  optionBtns.forEach((b, i) => {
    b.disabled = true;
    if (i === correctOptIdx) b.classList.add("correct");
    if (i === optionOrder.indexOf(selectedIdx) && i !== correctOptIdx)
      b.classList.add("wrong");
  });
  const isCorrect = selectedIdx === q.answer;
  // 记录本题
  userAnswers.push({
    question: q.stem.join(" "),
    options: optionOrder.map((idx) => q.options[idx]),
    correct: isCorrect,
    correctAnswer: q.options[q.answer],
    userAnswer: q.options[selectedIdx],
    userAnswerLabel: String.fromCharCode(65 + shownIdx),
    correctAnswerLabel: String.fromCharCode(65 + correctOptIdx),
  });
  if (isCorrect) {
    document.getElementById("feedback").innerHTML =
      "<span class='right'>✔️ 答对了！</span> " + q.explanation;
  } else {
    document.getElementById("feedback").innerHTML =
      "<span class='wrong'>❌ 答错了。</span> 正确答案是 " +
      String.fromCharCode(65 + correctOptIdx) +
      `：${q.options[q.answer]}。<br>` +
      q.explanation;
  }
  if (current < TOTAL_QUESTIONS - 1) {
    document.getElementById("next-btn").style.display = "inline-block";
  } else {
    // 最后一题，显示下载按钮和返回首页，计数器也要更新
    current++;
    updateProgressCounter();
    showDownloadBtn();
  }
}

function showDownloadBtn() {
  let btn = document.getElementById("download-csv-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "download-csv-btn";
    btn.textContent = "下载答题报告 (CSV)";
    btn.className = "option-btn";
    btn.style.marginTop = "18px";
    btn.onclick = downloadCSV;
    document.getElementById("question-area").appendChild(btn);
  } else {
    btn.style.display = "inline-block";
  }
}

function downloadCSV() {
  let csv = "题目,选项A,选项B,选项C,选项D,是否答对,正确答案,你的答案\n";
  userAnswers.forEach((ans) => {
    // 题目、4个选项、是否答对、正确答案、用户答案
    csv += `"${ans.question}","${ans.options[0]}","${ans.options[1]}","${
      ans.options[2]
    }","${ans.options[3]}","${ans.correct ? "是" : "否"}","${
      ans.correctAnswerLabel
    }: ${ans.correctAnswer}","${ans.userAnswerLabel}: ${ans.userAnswer}"
`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "category-quiz-report.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.getElementById("next-btn").onclick = function () {
  current++;
  renderQuestion();
};

// 初始渲染
renderQuestion();
