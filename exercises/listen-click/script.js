import {
  getRandomInt,
  shuffleArray,
  playNumberSound,
  exportToCsv,
  numberToWords,
} from "../../utils/utils.js";

// --- DOM Elements ---
const playSoundBtn = document.getElementById("playSoundBtn");
const optionsContainer = document.getElementById("options-container");
const feedbackEl = document.getElementById("feedback");
const audioElement = document.getElementById("numberAudio");
const scoreEl = document.getElementById("score");
const questionsAttemptedEl = document.getElementById("questionsAttempted");
const totalQuestionsEl = document.getElementById("totalQuestions");
const backToHomeBtn = document.getElementById("backToHome");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");

// --- Game Settings ---
let selectedNumberPool = [];
const NUM_OPTIONS = 4;
const TOTAL_QUESTIONS = 10;

// --- Game State ---
let currentCorrectNumber;
let score = 0;
let questionsAttempted = 0;
let numbersAlreadyAsked = [];
let answerLog = [];

// --- Utility ---
function generateUniqueRandomNumberFromPool(pool, excludeArray = []) {
  const available = pool.filter((n) => !excludeArray.includes(n));
  if (available.length === 0) return null;
  const idx = getRandomInt(0, available.length - 1);
  return available[idx];
}

function updateScoreboard() {
  scoreEl.textContent = score;
  questionsAttemptedEl.textContent = questionsAttempted;
}

function resetUIForNewQuestion() {
  feedbackEl.textContent = "";
  feedbackEl.className = "";
  optionsContainer.innerHTML = "";
  playSoundBtn.disabled = false;
  playSoundBtn.style.display = "inline-flex";
  nextQuestionBtn.style.display = "none";
  hideDownloadCsvBtn();
}

function showEndGameMessage() {
  feedbackEl.textContent = `练习结束! 你的最终得分是 ${score} / ${TOTAL_QUESTIONS}。`;
  playSoundBtn.style.display = "none";
  optionsContainer.style.display = "none";
  nextQuestionBtn.style.display = "none";
  currentCorrectNumber = null;
  showDownloadCsvBtn();
}

function generateListenClickQuestion() {
  optionsContainer.style.display = "flex";
  let options = [currentCorrectNumber];
  while (options.length < NUM_OPTIONS) {
    const option = generateUniqueRandomNumberFromPool(
      selectedNumberPool,
      options
    );
    if (option === null) break;
    options.push(option);
  }
  shuffleArray(options);
  options.forEach((option) => {
    const button = document.createElement("button");
    button.classList.add("option-btn");
    button.textContent = numberToWords(option);
    button.addEventListener("click", () =>
      handleListenClickAnswer(option, button)
    );
    optionsContainer.appendChild(button);
  });
}

function generateQuestion() {
  resetUIForNewQuestion();
  if (numbersAlreadyAsked.length >= selectedNumberPool.length) {
    numbersAlreadyAsked = [];
  }
  currentCorrectNumber = generateUniqueRandomNumberFromPool(
    selectedNumberPool,
    numbersAlreadyAsked
  );
  if (currentCorrectNumber === null) {
    showEndGameMessage();
    feedbackEl.textContent = "没有更多不重复的数字了！";
    return;
  }
  numbersAlreadyAsked.push(currentCorrectNumber);
  generateListenClickQuestion();
}

function handleAnswer(isCorrect, userAnswer = null) {
  if (isCorrect) {
    feedbackEl.textContent = "正确! Great!";
    feedbackEl.className = "correct";
    score++;
  } else {
    feedbackEl.textContent = `错误。正确答案是 ${currentCorrectNumber}。`;
    feedbackEl.className = "incorrect";
  }
  answerLog.push({
    question: currentCorrectNumber,
    userAnswer: userAnswer,
    correct: isCorrect ? "正确" : "错误",
  });
  questionsAttempted++;
  updateScoreboard();
  if (questionsAttempted < TOTAL_QUESTIONS) {
    nextQuestionBtn.style.display = "inline-block";
  } else {
    showEndGameMessage();
  }
}

function handleListenClickAnswer(selectedNumber, buttonEl) {
  Array.from(optionsContainer.children).forEach((btn) => (btn.disabled = true));
  const isCorrect = selectedNumber === currentCorrectNumber;
  if (isCorrect) {
    buttonEl.style.backgroundColor = "#2ecc71";
  } else {
    buttonEl.style.backgroundColor = "#e74c3c";
    Array.from(optionsContainer.children).forEach((btn) => {
      if (parseInt(btn.textContent) === currentCorrectNumber) {
        btn.style.backgroundColor = "#2ecc71";
      }
    });
  }
  handleAnswer(isCorrect, selectedNumber);
}

playSoundBtn.addEventListener("click", () => {
  if (
    currentCorrectNumber !== null &&
    typeof currentCorrectNumber !== "undefined"
  ) {
    playNumberSound(currentCorrectNumber, audioElement, (err) => {
      feedbackEl.textContent = "错误：无法播放音频。请检查音频文件。";
      feedbackEl.className = "incorrect";
    });
  } else {
    feedbackEl.textContent = "请先开始一个问题。";
  }
});

nextQuestionBtn.addEventListener("click", () => {
  generateQuestion();
});

backToHomeBtn.onclick = function () {
  window.location.href = "../../index.html";
};

// --- CSV 下载功能 ---
function showDownloadCsvBtn() {
  let downloadBtn = document.getElementById("downloadCsvBtn");
  if (!downloadBtn) {
    downloadBtn = document.createElement("button");
    downloadBtn.id = "downloadCsvBtn";
    downloadBtn.textContent = "下载答题记录 (CSV)";
    downloadBtn.style.marginTop = "24px";
    downloadBtn.style.fontSize = "1.2em";
    document.querySelector(".container").appendChild(downloadBtn);
  }
  downloadBtn.style.display = "inline-block";
  downloadBtn.onclick = function () {
    const csvHeader = "题目,你的答案,是否正确\n";
    const csvRows = answerLog.map((log) => [
      log.question,
      log.userAnswer ?? "",
      log.correct,
    ]);
    exportToCsv("答题记录.csv", csvHeader, csvRows);
  };
}
function hideDownloadCsvBtn() {
  const downloadBtn = document.getElementById("downloadCsvBtn");
  if (downloadBtn) downloadBtn.style.display = "none";
}

// --- Range Selection ---
const defaultRanges = [
  { min: 1, max: 10 },
  { min: 11, max: 20 },
  { min: 21, max: 30 },
  { min: 31, max: 40 },
  { min: 41, max: 50 },
  { min: 51, max: 60 },
  { min: 61, max: 70 },
  { min: 71, max: 80 },
  { min: 81, max: 90 },
  { min: 91, max: 100 },
];

function getActiveRanges() {
  const btns = document.querySelectorAll(".range-btn.active");
  let pool = [];
  btns.forEach((btn) => {
    const min = parseInt(btn.dataset.min);
    const max = parseInt(btn.dataset.max);
    for (let i = min; i <= max; i++) {
      pool.push(i);
    }
  });
  if (pool.length === 0) {
    for (let i = 1; i <= 10; i++) pool.push(i);
    const btn = document.querySelector(
      '.range-btn[data-min="1"][data-max="10"]'
    );
    if (btn) btn.classList.add("active");
  }
  return pool;
}

function updateSelectedNumberPool() {
  selectedNumberPool = getActiveRanges();
  numbersAlreadyAsked = [];
  answerLog = [];
  score = 0;
  questionsAttempted = 0;
  updateScoreboard();
  generateQuestion();
}

const rangeBtns = document.querySelectorAll(".range-btn");
rangeBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    this.classList.toggle("active");
    updateSelectedNumberPool();
  });
});
if (rangeBtns.length > 0) rangeBtns[0].classList.add("active");
updateSelectedNumberPool();

totalQuestionsEl.textContent = TOTAL_QUESTIONS;
