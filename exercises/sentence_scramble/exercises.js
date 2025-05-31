// 练习相关的功能
export async function loadExercises() {
  try {
    const response = await fetch("sentence_scramble.json");
    const data = await response.json();
    return data.exercises;
  } catch (error) {
    console.error("Error loading exercises:", error);
    return [];
  }
}

export function getRandomSentences(exercises, count) {
  // 从所有练习中获取所有句子
  const allSentences = exercises.flatMap((exercise) =>
    exercise.sentences.map((sentence) => ({
      ...sentence,
      category: exercise.title,
    }))
  );

  // 随机打乱并选择指定数量的句子
  const shuffled = [...allSentences].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function displayExercises(exercises, container, count = 6) {
  // 清空容器
  container.innerHTML = "";

  // 选择指定数量的随机句子
  const selectedSentences = getRandomSentences(exercises, count);

  // 为每个句子创建练习
  selectedSentences.forEach((sentence) => {
    const exerciseSection = document.createElement("div");
    exerciseSection.className = "exercise-section";

    // 创建句子容器
    const sentenceContainer = document.createElement("div");
    sentenceContainer.className = "sentence-container";

    // 从 words 数组中构建完整的句子文本，标点前不加空格
    const sentenceText = sentence.words
      .map((word) => word.text)
      .reduce((acc, cur) => {
        if ([".", ",", "?", "!"].includes(cur)) {
          return acc.trimEnd() + cur;
        }
        return acc + (acc ? " " : "") + cur;
      }, "");
    sentenceContainer.setAttribute("data-correct-text", sentenceText);
    sentenceContainer.dataset.sentence = JSON.stringify(sentence);

    // 保存当前句子对象，用于后续的词性标记
    window.currentSentence = sentence;

    // 添加音频播放按钮
    const audioButton = document.createElement("button");
    audioButton.className = "audio-button";
    audioButton.innerHTML = "🔊";
    audioButton.onclick = () => window.playAudio(sentence.audio);
    sentenceContainer.appendChild(audioButton);

    // 创建单词按钮容器
    const wordButtonsContainer = document.createElement("div");
    wordButtonsContainer.className = "word-buttons";

    // 使用预定义的单词顺序
    const shuffledWords = [...sentence.words].sort(() => Math.random() - 0.5);

    // 创建单词按钮
    shuffledWords.forEach((word) => {
      const wordButton = document.createElement("button");
      wordButton.className = "word-button";
      wordButton.textContent = word.text;
      wordButton.onclick = () => window.selectWord(wordButton, word);
      wordButtonsContainer.appendChild(wordButton);
    });

    sentenceContainer.appendChild(wordButtonsContainer);

    // 创建放置区域
    const dropZonesContainer = document.createElement("div");
    dropZonesContainer.className = "drop-zones";

    // 创建放置区域
    sentence.words.forEach(() => {
      const dropZone = document.createElement("div");
      dropZone.className = "drop-zone";
      dropZone.onclick = () => window.selectDropZone(dropZone);
      dropZonesContainer.appendChild(dropZone);
    });

    sentenceContainer.appendChild(dropZonesContainer);

    // 添加反馈区域
    const feedback = document.createElement("div");
    feedback.className = "feedback";
    sentenceContainer.appendChild(feedback);

    // 添加控制按钮
    const controls = document.createElement("div");
    controls.className = "controls";

    const checkButton = document.createElement("button");
    checkButton.className = "check-button";
    checkButton.textContent = "检查答案";
    checkButton.addEventListener("click", function () {
      console.log("Check button clicked"); // 调试日志
      if (typeof window.checkAnswer === "function") {
        window.checkAnswer(this);
      } else {
        console.error("checkAnswer function is not defined"); // 调试日志
      }
    });

    const resetButton = document.createElement("button");
    resetButton.className = "reset-button";
    resetButton.textContent = "重置";
    resetButton.disabled = true;
    resetButton.addEventListener("click", function () {
      console.log("Reset button clicked"); // 调试日志
      if (typeof window.resetExercise === "function") {
        window.resetExercise(this);
      } else {
        console.error("resetExercise function is not defined"); // 调试日志
      }
    });

    controls.appendChild(checkButton);
    controls.appendChild(resetButton);
    sentenceContainer.appendChild(controls);

    exerciseSection.appendChild(sentenceContainer);
    container.appendChild(exerciseSection);
  });
}
