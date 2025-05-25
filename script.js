document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const playSoundBtn = document.getElementById("playSoundBtn");
  const optionsContainer = document.getElementById("options-container");
  const inputRow = document.getElementById("input-row");
  const numberInput = document.getElementById("numberInput");
  const checkAnswerBtn = document.getElementById("checkAnswerBtn");
  const feedbackEl = document.getElementById("feedback");
  const nextQuestionBtn = document.getElementById("nextQuestionBtn");
  const audioElement = document.getElementById("numberAudio");
  const scoreEl = document.getElementById("score");
  const questionsAttemptedEl = document.getElementById("questionsAttempted");
  const totalQuestionsEl = document.getElementById("totalQuestions");
  const instructionEl = document.getElementById("instruction");
  const modeListenClickBtn = document.getElementById("modeListenClick");
  const modeListenTypeBtn = document.getElementById("modeListenType");

  // --- Game Settings ---
  let selectedNumberPool = [];
  const NUM_OPTIONS_CLICK_MODE = 4; // Number of choices for click mode
  const TOTAL_QUESTIONS_PER_SESSION = 10;

  // --- Game State ---
  let currentCorrectNumber;
  let score = 0;
  let questionsAttempted = 0;
  let numbersAlreadyAsked = [];
  let currentExerciseMode = null; // 'click' or 'type'
  let answerLog = []; // 记录每次题目和回答

  // --- Utility Functions ---
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateUniqueRandomNumberFromPool(pool, excludeArray = []) {
    const available = pool.filter((n) => !excludeArray.includes(n));
    if (available.length === 0) {
      console.warn("所有数字都已用完。重置excludeArray或扩大范围。");
      return null;
    }
    const idx = getRandomInt(0, available.length - 1);
    return available[idx];
  }

  function playNumberSound(number) {
    if (number === null || typeof number === "undefined") {
      console.error("playNumberSound called with invalid number:", number);
      feedbackEl.textContent = "错误：无法确定要播放的数字。";
      feedbackEl.className = "incorrect";
      return;
    }
    audioElement.src = `audio/${number}.mp3`;
    audioElement.play().catch((error) => {
      console.error("音频播放错误:", error);
      feedbackEl.textContent = "错误：无法播放音频。请检查音频文件。";
      feedbackEl.className = "incorrect";
    });
  }

  // --- UI Update Functions ---
  function updateScoreboard() {
    scoreEl.textContent = score;
    questionsAttemptedEl.textContent = questionsAttempted;
  }

  function resetUIForNewQuestion() {
    feedbackEl.textContent = "";
    feedbackEl.className = "";
    nextQuestionBtn.style.display = "none";
    playSoundBtn.disabled = false;
    playSoundBtn.style.display = "inline-block";
    numberInput.value = "";
    numberInput.disabled = false;
    checkAnswerBtn.disabled = false;
    optionsContainer.innerHTML = "";
    hideDownloadCsvBtn();
  }

  function showEndGameMessage() {
    feedbackEl.textContent = `练习结束! 你的最终得分是 ${score} / ${TOTAL_QUESTIONS_PER_SESSION}。`;
    playSoundBtn.style.display = "none";
    optionsContainer.style.display = "none";
    inputRow.style.display = "none";
    nextQuestionBtn.style.display = "none";
    instructionEl.textContent = `练习完成！选择一个模式重新开始。`;
    currentCorrectNumber = null; // Prevent sound play
  }

  // --- Exercise Mode Specific Logic ---
  function generateListenClickQuestion() {
    optionsContainer.style.display = "flex";
    inputRow.style.display = "none";
    instructionEl.textContent = `听声音，然后点击正确的数字。`;

    let options = [currentCorrectNumber];
    while (options.length < NUM_OPTIONS_CLICK_MODE) {
      const option = generateUniqueRandomNumberFromPool(
        selectedNumberPool,
        options
      );
      if (option === null) break; // Should not happen if NUM_OPTIONS_CLICK_MODE is less than range
      options.push(option);
    }

    for (let i = options.length - 1; i > 0; i--) {
      // Shuffle options
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    options.forEach((option) => {
      const button = document.createElement("button");
      button.classList.add("option-btn");
      button.textContent = option;
      button.addEventListener("click", () =>
        handleListenClickAnswer(option, button)
      );
      optionsContainer.appendChild(button);
    });
  }

  function generateListenTypeQuestion() {
    optionsContainer.style.display = "none";
    inputRow.style.display = "flex";
    instructionEl.textContent = `听声音，然后在框中输入数字。`;
    numberInput.focus();
  }

  // --- Core Question Generation ---
  function generateQuestion() {
    if (!currentExerciseMode) {
      instructionEl.textContent = "请先选择一个练习模式。";
      playSoundBtn.style.display = "none";
      return;
    }
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

    if (currentExerciseMode === "click") {
      generateListenClickQuestion();
    } else if (currentExerciseMode === "type") {
      generateListenTypeQuestion();
    }
  }

  // --- Answer Handling ---
  function handleAnswer(isCorrect, userAnswer = null) {
    // playSoundBtn.disabled = true; // 不再禁用播放按钮
    if (isCorrect) {
      feedbackEl.textContent = "正确! Great!";
      feedbackEl.className = "correct";
      score++;
    } else {
      feedbackEl.textContent = `错误。正确答案是 ${currentCorrectNumber}。`;
      feedbackEl.className = "incorrect";
    }
    // 记录本次答题
    answerLog.push({
      question: currentCorrectNumber,
      userAnswer: userAnswer,
      correct: isCorrect ? "正确" : "错误",
    });
    questionsAttempted++;
    updateScoreboard();
    if (questionsAttempted < TOTAL_QUESTIONS_PER_SESSION) {
      nextQuestionBtn.style.display = "inline-block";
    } else {
      showEndGameMessage();
      showDownloadCsvBtn();
    }
  }

  function handleListenClickAnswer(selectedNumber, buttonEl) {
    Array.from(optionsContainer.children).forEach(
      (btn) => (btn.disabled = true)
    );
    const isCorrect = selectedNumber === currentCorrectNumber;
    if (isCorrect) {
      buttonEl.style.backgroundColor = "#2ecc71";
    } else {
      buttonEl.style.backgroundColor = "#e74c3c";
      Array.from(optionsContainer.children).forEach((btn) => {
        if (parseInt(btn.textContent) === currentCorrectNumber) {
          btn.style.backgroundColor = "#2ecc71"; // Highlight correct one
        }
      });
    }
    handleAnswer(isCorrect, selectedNumber);
  }

  function handleListenTypeAnswer() {
    const userAnswer = parseInt(numberInput.value);
    numberInput.disabled = true;
    checkAnswerBtn.disabled = true;
    if (isNaN(userAnswer)) {
      feedbackEl.textContent = `请输入一个数字。正确答案是 ${currentCorrectNumber}。`;
      feedbackEl.className = "incorrect";
      handleAnswer(false, userAnswer); // Count as incorrect attempt
      return;
    }
    handleAnswer(userAnswer === currentCorrectNumber, userAnswer);
  }

  // --- Event Listeners ---
  playSoundBtn.addEventListener("click", () => {
    if (
      currentCorrectNumber !== null &&
      typeof currentCorrectNumber !== "undefined"
    ) {
      playNumberSound(currentCorrectNumber);
    } else {
      feedbackEl.textContent = "请先开始一个问题或选择模式。";
    }
  });

  nextQuestionBtn.addEventListener("click", () => {
    if (questionsAttempted < TOTAL_QUESTIONS_PER_SESSION) {
      generateQuestion();
    }
  });

  checkAnswerBtn.addEventListener("click", handleListenTypeAnswer);
  numberInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleListenTypeAnswer();
    }
  });

  function selectMode(mode) {
    currentExerciseMode = mode;
    score = 0;
    questionsAttempted = 0;
    numbersAlreadyAsked = [];
    answerLog = [];
    updateScoreboard();
    modeListenClickBtn.classList.toggle("active", mode === "click");
    modeListenTypeBtn.classList.toggle("active", mode === "type");
    generateQuestion(); // Start first question of the selected mode
    hideDownloadCsvBtn();
  }

  modeListenClickBtn.addEventListener("click", () => selectMode("click"));
  modeListenTypeBtn.addEventListener("click", () => selectMode("type"));

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
      const csvRows = answerLog
        .map(
          (log) =>
            `${log.question},${log.userAnswer === null ? "" : log.userAnswer},${
              log.correct
            }`
        )
        .join("\n");
      const csvContent = csvHeader + csvRows;
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "答题记录.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
  }
  function hideDownloadCsvBtn() {
    const downloadBtn = document.getElementById("downloadCsvBtn");
    if (downloadBtn) downloadBtn.style.display = "none";
  }

  // --- Range Selection (Multi-select) ---
  const rangeBtns = document.querySelectorAll(".range-btn");
  function updateSelectedNumberPool() {
    let pool = [];
    rangeBtns.forEach((btn) => {
      if (btn.classList.contains("active")) {
        const min = parseInt(btn.dataset.min);
        const max = parseInt(btn.dataset.max);
        for (let i = min; i <= max; i++) {
          pool.push(i);
        }
      }
    });
    if (pool.length === 0) {
      // 默认1-10
      for (let i = 1; i <= 10; i++) pool.push(i);
      if (rangeBtns.length > 0) rangeBtns[0].classList.add("active");
    }
    selectedNumberPool = pool;
    numbersAlreadyAsked = [];
    answerLog = [];
    score = 0;
    questionsAttempted = 0;
    updateScoreboard();
    if (currentExerciseMode) {
      generateQuestion();
    }
  }
  rangeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      this.classList.toggle("active");
      updateSelectedNumberPool();
    });
  });
  // 默认激活第一个范围
  if (rangeBtns.length > 0) rangeBtns[0].classList.add("active");
  updateSelectedNumberPool();

  // --- Initialization ---
  totalQuestionsEl.textContent = TOTAL_QUESTIONS_PER_SESSION;
  // Don't generate question initially, wait for mode selection
  instructionEl.textContent = "请选择一个练习模式开始练习。";
});
