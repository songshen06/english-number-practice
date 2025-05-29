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

// 进度相关变量
let completedCount = 0;
let correctCount = 0;
let totalExercises = 0;
let currentStreak = 0;
let highScore = 0;

// 添加新的功能：音频播放控制
window.playAudio = function (audioFile) {
  const audio = new Audio(`../../audio/${audioFile}`);
  audio.play().catch((error) => {
    console.error("音频播放失败:", error);
  });
};

window.selectWord = function (button, word) {
  // 如果按钮已经被使用，则取消使用状态
  if (button.classList.contains("used")) {
    button.classList.remove("used");
    button.classList.add("selected");
    selectedWord = button;
    return;
  }

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
  // 如果点击的是已填充的区域，先移除已填充的单词
  if (zone.classList.contains("filled")) {
    const existingButton = zone.querySelector(".word-button");
    if (existingButton) {
      existingButton.remove();
      zone.classList.remove("filled");

      // 找到对应的原始单词按钮并恢复其状态
      const wordButtons = zone
        .closest(".sentence-container")
        .querySelectorAll(".word-button");
      wordButtons.forEach((btn) => {
        if (btn.textContent === existingButton.textContent) {
          btn.classList.remove("used");
        }
      });
    }
    return;
  }

  // 如果没有选中的单词，直接返回
  if (!selectedWord) return;

  // 如果该区域已经有单词，先移除
  if (zone.querySelector(".word-button")) {
    const oldButton = zone.querySelector(".word-button");
    oldButton.remove();
    zone.classList.remove("filled");
  }

  // 添加新的单词按钮
  const wordButton = document.createElement("button");
  wordButton.className = "word-button";
  wordButton.textContent = selectedWord.textContent;
  wordButton.onclick = () => {
    // 点击已放置的单词时，移除它并恢复原始按钮状态
    wordButton.remove();
    zone.classList.remove("filled");
    selectedWord.classList.remove("used");
  };

  zone.appendChild(wordButton);
  zone.classList.add("filled");

  // 标记原始按钮为已使用
  selectedWord.classList.add("used");
  selectedWord.classList.remove("selected");
  selectedWord = null;

  // 启用重置按钮
  const container = zone.closest(".sentence-container");
  const resetButton = container.querySelector(".reset-button");
  if (resetButton) {
    resetButton.disabled = false;
  }
};

// 添加新的功能：提示系统
window.showHint = function (button) {
  const container = button.closest(".sentence-container");
  const hint = container.querySelector(".hint");
  if (hint) {
    hint.classList.toggle("show");
  }
};

// 添加新的功能：计时系统
let startTime = null;
let timerInterval = null;

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  document.getElementById("timer").textContent = `${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// 修改检查答案函数，添加计时和提示功能
window.checkAnswer = function (button) {
  const container = button.closest(".sentence-container");
  const dropZones = container.querySelectorAll(".drop-zone");
  const feedback = container.querySelector(".feedback");

  // 正确答案直接取 data-correct-text 属性
  const correctText = container
    .getAttribute("data-correct-text")
    .trim()
    .replace(/\s+/g, " ");

  // 用户答案拼接
  const userOrder = Array.from(dropZones).map((zone) => {
    const wordButton = zone.querySelector(".word-button");
    return wordButton ? wordButton.textContent.trim() : "";
  });
  let userText = "";
  userOrder.forEach((word, idx) => {
    if ([".", ",", "?", "!"].includes(word) && idx > 0) {
      userText = userText.trimEnd() + word;
    } else {
      userText += (userText ? " " : "") + word;
    }
  });
  userText = userText.trim().replace(/\s+/g, " ");

  if (userOrder.some((word) => word === "")) {
    feedback.textContent = "请填写所有单词！";
    feedback.className = "feedback incorrect";
    return;
  }

  const isCorrect = userText.toLowerCase() === correctText.toLowerCase();

  if (isCorrect) {
    feedback.textContent = "正确！";
    feedback.className = "feedback correct";
    score++;

    // 添加动画效果
    container.classList.add("correct-animation");
    setTimeout(() => {
      container.classList.remove("correct-animation");
    }, 1000);
  } else {
    feedback.textContent = `不正确。正确答案是：${correctText}`;
    feedback.className = "feedback incorrect";

    // 添加动画效果
    container.classList.add("incorrect-animation");
    setTimeout(() => {
      container.classList.remove("incorrect-animation");
    }, 1000);
  }

  answerLog.push({
    question: correctText,
    userAnswer: userText,
    correct: isCorrect ? "正确" : "错误",
    timeSpent: Math.floor((Date.now() - startTime) / 1000),
  });

  questionsAttempted++;
  updateScoreboard();

  if (questionsAttempted >= TOTAL_QUESTIONS) {
    stopTimer();
    showEndGameMessage();
  }

  // 更新进度
  completedCount++;
  if (isCorrect) {
    correctCount++;
    currentStreak++;
  } else {
    currentStreak = 0;
  }
  updateProgressDisplay();

  // 禁用检查按钮，启用重置按钮
  const checkButton = container.querySelector(".check-button");
  const resetButton = container.querySelector(".reset-button");
  if (checkButton) checkButton.disabled = true;
  if (resetButton) resetButton.disabled = false;
};

// 修改重置练习函数，添加计时器重置
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

  // 重置计时器
  stopTimer();
  startTimer();

  // 更新按钮状态
  const checkButton = container.querySelector(".check-button");
  const resetButton = container.querySelector(".reset-button");
  checkButton.disabled = false;
  resetButton.disabled = true;
};

// 更新记分板
function updateScoreboard() {
  document.getElementById("currentScore").textContent = score;
}

// 修改结束消息显示函数，添加时间统计
function showEndGameMessage() {
  const container = document.querySelector(".container");
  const message = document.createElement("div");
  message.className = "feedback correct";
  message.style.marginTop = "20px";

  const totalTime = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(totalTime / 60);
  const seconds = totalTime % 60;

  message.textContent = `练习结束! 你的最终得分是 ${score} / ${TOTAL_QUESTIONS}。总用时：${minutes}分${seconds}秒`;
  container.appendChild(message);

  // 添加下载按钮
  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "下载答题记录 (CSV)";
  downloadBtn.style.marginTop = "20px";
  downloadBtn.onclick = function () {
    const csvHeader = "题目,你的答案,是否正确,用时(秒)\n";
    const csvRows = answerLog.map((log) => [
      log.question,
      log.userAnswer,
      log.correct,
      log.timeSpent,
    ]);
    exportToCsv("句子排序练习记录.csv", csvHeader, csvRows);
  };
  container.appendChild(downloadBtn);
}

// 更新进度显示
function updateProgressDisplay() {
  // 更新进度条
  const progressFill = document.querySelector(".progress-fill");
  const progress = (completedCount / totalExercises) * 100;
  progressFill.style.width = `${progress}%`;

  // 更新统计数据
  document.getElementById("completedCount").textContent = completedCount;
  document.getElementById("totalCount").textContent = totalExercises;
  const accuracy =
    completedCount > 0 ? Math.round((correctCount / completedCount) * 100) : 0;
  document.getElementById("accuracy").textContent = accuracy;

  // 更新星星
  const stars = document.querySelectorAll(".star");
  const starThresholds = [5, 10, 15];
  stars.forEach((star, index) => {
    if (completedCount >= starThresholds[index]) {
      star.classList.add("active");
      if (!star.classList.contains("earned")) {
        star.classList.add("earned");
        showAchievementToast(`完成${starThresholds[index]}个句子！`);
      }
    }
  });

  // 更新最高分
  if (currentStreak > highScore) {
    highScore = currentStreak;
    document.getElementById("highScore").textContent = highScore;
    if (highScore >= 5) {
      showAchievementToast("创造新纪录！");
    }
  }
}

// 显示成就提示
function showAchievementToast(message) {
  const toast = document.querySelector(".achievement-toast");
  const toastText = toast.querySelector(".achievement-text");
  toastText.innerHTML = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// 初始化
document.addEventListener("DOMContentLoaded", async function () {
  // 返回首页
  document.getElementById("backToHome").onclick = function () {
    window.location.href = "../../index.html";
  };

  // 加载练习
  const exercises = await loadExercises();
  // 计算总句子数
  totalExercises = exercises.reduce(
    (total, exercise) => total + exercise.sentences.length,
    0
  );

  // 创建分类按钮
  const categoryButtonsContainer = document.getElementById("categoryButtons");
  exercises.forEach((exercise) => {
    const button = document.createElement("button");
    button.className = "exercise-btn";
    button.dataset.type = exercise.id;
    button.textContent = exercise.title;
    categoryButtonsContainer.appendChild(button);
  });

  // 练习类型选择
  const exerciseBtns = document.querySelectorAll(".exercise-btn");
  exerciseBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      exerciseBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      const type = this.dataset.type;
      let filteredExercises = exercises;

      if (type !== "all") {
        // 按分类筛选
        filteredExercises = exercises.filter((ex) => ex.id === type);
      }

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

  // 默认选择全部练习
  document.querySelector('.exercise-btn[data-type="all"]').click();

  // 添加计时器显示
  const timerDisplay = document.createElement("div");
  timerDisplay.id = "timer";
  timerDisplay.className = "timer";
  timerDisplay.textContent = "00:00";
  document.querySelector(".fixed-sidebar").appendChild(timerDisplay);

  // 开始计时
  startTimer();
});
