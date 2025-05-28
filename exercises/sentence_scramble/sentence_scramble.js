import { loadExercises, displayExercises } from "./exercises.js";
import { exportToCsv } from "../../utils/utils.js";

let currentExercise = null;
let selectedWord = null;
let currentSentence = null;
let score = 0;
let questionsAttempted = 0;
const TOTAL_QUESTIONS = 6;
let answerLog = [];
let selectedExercises = [];

// 将函数定义为全局函数
window.playAudio = function (audioFile) {
  const audio = new Audio(`../../audio/${audioFile}`);
  audio.play();
};

window.selectWord = function (button, word) {
  if (button.classList.contains("used")) return;

  const allWordButtons = button.parentElement.querySelectorAll(".word-button");
  allWordButtons.forEach((btn) => btn.classList.remove("selected"));

  const allDropZones = button
    .closest(".sentence-container")
    .querySelectorAll(".drop-zone");
  allDropZones.forEach((zone) => zone.classList.remove("selected"));

  button.classList.add("selected");
  selectedWord = button;
};

window.selectDropZone = function (zone) {
  if (!selectedWord) return;

  if (zone.querySelector(".word-button")) {
    const oldButton = zone.querySelector(".word-button");
    oldButton.classList.remove("used");
    zone.innerHTML = "";
  }

  const wordButton = document.createElement("button");
  wordButton.className = "word-button";
  wordButton.textContent = selectedWord.textContent;

  zone.appendChild(wordButton);
  zone.classList.add("filled");

  selectedWord.classList.add("used");
  selectedWord.classList.remove("selected");
  selectedWord = null;
};

window.checkAnswer = function (button) {
  const container = button.closest(".sentence-container");
  const dropZones = container.querySelectorAll(".drop-zone");
  const feedback = container.querySelector(".feedback");

  const correctText = container.getAttribute("data-correct-text");
  const correctOrder = correctText
    .split(" ")
    .map((word) => word.replace(/[.,!?]$/, ""));

  const userOrder = Array.from(dropZones).map((zone) => {
    const wordButton = zone.querySelector(".word-button");
    return wordButton ? wordButton.textContent.trim() : "";
  });

  if (userOrder.some((word) => word === "")) {
    feedback.textContent = "请填写所有单词！";
    feedback.className = "feedback incorrect";
    return;
  }

  const isCorrect = correctOrder.every(
    (word, index) => word === userOrder[index]
  );

  if (isCorrect) {
    feedback.textContent = "正确！";
    feedback.className = "feedback correct";
    score++;
  } else {
    feedback.textContent = `不正确。正确答案是：${correctText}`;
    feedback.className = "feedback incorrect";
  }

  answerLog.push({
    question: correctText,
    userAnswer: userOrder.join(" "),
    correct: isCorrect ? "正确" : "错误",
  });

  questionsAttempted++;
  updateScoreboard();

  if (questionsAttempted >= TOTAL_QUESTIONS) {
    showEndGameMessage();
  }
};

window.resetExercise = function (button) {
  const container = button.closest(".sentence-container");
  const dropZones = container.querySelectorAll(".drop-zone");
  const feedback = container.querySelector(".feedback");
  const wordButtons = container.querySelectorAll(".word-button");

  wordButtons.forEach((button) => {
    button.classList.remove("used", "selected");
  });

  dropZones.forEach((zone) => {
    zone.innerHTML = "";
    zone.classList.remove("filled", "selected");
  });

  feedback.textContent = "";
  feedback.className = "feedback";
  selectedWord = null;
};

// 更新记分板
function updateScoreboard() {
  document.getElementById("score").textContent = score;
  document.getElementById("questionsAttempted").textContent =
    questionsAttempted;
}

// 显示结束消息
function showEndGameMessage() {
  const container = document.querySelector(".container");
  const message = document.createElement("div");
  message.className = "feedback correct";
  message.style.marginTop = "20px";
  message.textContent = `练习结束! 你的最终得分是 ${score} / ${TOTAL_QUESTIONS}。`;
  container.appendChild(message);

  // 添加下载按钮
  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "下载答题记录 (CSV)";
  downloadBtn.style.marginTop = "20px";
  downloadBtn.onclick = function () {
    const csvHeader = "题目,你的答案,是否正确\n";
    const csvRows = answerLog.map((log) => [
      log.question,
      log.userAnswer,
      log.correct,
    ]);
    exportToCsv("句子排序练习记录.csv", csvHeader, csvRows);
  };
  container.appendChild(downloadBtn);
}

// 初始化
document.addEventListener("DOMContentLoaded", function () {
  // 返回首页
  document.getElementById("backToHome").onclick = function () {
    window.location.href = "../../index.html";
  };

  // 练习类型选择
  const exerciseBtns = document.querySelectorAll(".exercise-btn");
  exerciseBtns.forEach((btn) => {
    btn.addEventListener("click", async function () {
      this.classList.toggle("active");
      const exercises = await loadExercises();
      const selectedTypes = Array.from(
        document.querySelectorAll(".exercise-btn.active")
      ).map((btn) => btn.dataset.type);

      if (selectedTypes.length === 0) {
        selectedTypes.push("family_present");
        document
          .querySelector('.exercise-btn[data-type="family_present"]')
          .classList.add("active");
      }

      const filteredExercises = exercises.filter((ex) =>
        selectedTypes.includes(ex.id)
      );
      score = 0;
      questionsAttempted = 0;
      answerLog = [];
      updateScoreboard();
      displayExercises(
        filteredExercises,
        document.getElementById("exercises"),
        TOTAL_QUESTIONS
      );
    });
  });

  // 初始化第一个练习
  document
    .querySelector('.exercise-btn[data-type="family_present"]')
    .classList.add("active");
  loadExercises().then((exercises) => {
    const filteredExercises = exercises.filter(
      (ex) => ex.id === "family_present"
    );
    displayExercises(
      filteredExercises,
      document.getElementById("exercises"),
      TOTAL_QUESTIONS
    );
  });
});
