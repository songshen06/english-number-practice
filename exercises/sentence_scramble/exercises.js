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
    sentenceContainer.setAttribute("data-correct-text", sentence.text);

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
      wordButton.textContent = word;
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
    checkButton.onclick = () => window.checkAnswer(checkButton);

    const resetButton = document.createElement("button");
    resetButton.className = "reset-button";
    resetButton.textContent = "重置";
    resetButton.disabled = true;
    resetButton.onclick = () => window.resetExercise(resetButton);

    controls.appendChild(checkButton);
    controls.appendChild(resetButton);
    sentenceContainer.appendChild(controls);

    exerciseSection.appendChild(sentenceContainer);
    container.appendChild(exerciseSection);
  });
}
