document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const playSoundBtn = document.getElementById("playSoundBtn");
  const nextQuestionBtn = document.getElementById("nextQuestionBtn");
  const optionsContainer = document.getElementById("options-container");
  const feedbackEl = document.getElementById("feedback");
  const flashTextEl = document.getElementById("flashText");
  const audioElement = document.getElementById("audioElement");
  const scoreEl = document.getElementById("score");
  const currentQuestionEl = document.getElementById("currentQuestion");
  const totalQuestionsEl = document.getElementById("totalQuestions");

  // Game State
  let currentQuestion = 0;
  let score = 0;
  let questions = [];
  let currentQuestionData = null;

  // Load questions from JSON file
  async function loadQuestions() {
    try {
      const response = await fetch("questions.json");
      const data = await response.json();
      questions = data.questions;
      totalQuestionsEl.textContent = questions.length;
      initGame();
    } catch (error) {
      console.error("Error loading questions:", error);
      feedbackEl.textContent = "加载题目失败，请刷新页面重试。";
      feedbackEl.className = "incorrect";
    }
  }

  // Initialize game
  function initGame() {
    shuffleArray(questions);
    currentQuestion = 0;
    score = 0;
    updateScoreboard();
    generateQuestion();
  }

  // Shuffle array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Generate question
  function generateQuestion() {
    if (currentQuestion >= questions.length) {
      showEndGameMessage();
      return;
    }

    currentQuestionData = questions[currentQuestion];
    resetUI();
    showFlashText();
    generateOptions();
    updateScoreboard();
  }

  // Reset UI
  function resetUI() {
    feedbackEl.textContent = "";
    feedbackEl.className = "";
    nextQuestionBtn.style.display = "none";
    playSoundBtn.disabled = false;
    optionsContainer.innerHTML = "";
    optionsContainer.style.display = "grid";
    flashTextEl.style.display = "flex";
  }

  // Show flash text
  function showFlashText() {
    flashTextEl.textContent = currentQuestionData.flashText;
    flashTextEl.style.display = "flex";
    setTimeout(() => {
      flashTextEl.textContent = "";
    }, 2000);
  }

  // Generate options
  function generateOptions() {
    const shuffledOptions = [...currentQuestionData.options];
    shuffleArray(shuffledOptions);

    shuffledOptions.forEach((option) => {
      const button = document.createElement("button");
      button.className = "option-btn";
      button.textContent = option;
      button.addEventListener("click", () => handleAnswer(option, button));
      optionsContainer.appendChild(button);
    });
  }

  // Handle answer
  function handleAnswer(selectedAnswer, buttonEl) {
    const isCorrect = selectedAnswer === currentQuestionData.correctAnswer;

    // Disable all buttons
    Array.from(optionsContainer.children).forEach((btn) => {
      btn.disabled = true;
      if (btn.textContent === currentQuestionData.correctAnswer) {
        btn.classList.add("correct");
      }
    });

    if (isCorrect) {
      buttonEl.classList.add("correct");
      feedbackEl.textContent = "正确! Great!";
      feedbackEl.className = "correct";
      score++;
    } else {
      buttonEl.classList.add("incorrect");
      feedbackEl.textContent = `错误。正确答案是 ${currentQuestionData.correctAnswer}。`;
      feedbackEl.className = "incorrect";
    }

    updateScoreboard();
    nextQuestionBtn.style.display = "inline-block";
  }

  // Update scoreboard
  function updateScoreboard() {
    scoreEl.textContent = score;
    currentQuestionEl.textContent = currentQuestion + 1;
    totalQuestionsEl.textContent = questions.length;
  }

  // Show end game message
  function showEndGameMessage() {
    feedbackEl.textContent = `练习结束! 你的最终得分是 ${score} / ${questions.length}。`;
    playSoundBtn.style.display = "none";
    optionsContainer.style.display = "none";
    nextQuestionBtn.style.display = "none";
    flashTextEl.textContent = "";
  }

  // Play audio
  function playAudio() {
    const audioPath = `../../audio/M1/sentences/${currentQuestionData.audio}`;
    console.log("Playing audio:", audioPath); // 调试用
    audioElement.src = audioPath;
    audioElement.play().catch((error) => {
      console.error("音频播放错误:", error);
      feedbackEl.textContent = "错误：无法播放音频。请检查音频文件。";
      feedbackEl.className = "incorrect";
    });
  }

  // Event Listeners
  playSoundBtn.addEventListener("click", playAudio);
  nextQuestionBtn.addEventListener("click", () => {
    currentQuestion++;
    generateQuestion();
  });

  // Start the game by loading questions
  loadQuestions();
});
