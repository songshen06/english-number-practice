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

export function getRandomSentences(sentences, count) {
  const shuffled = [...sentences].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function displayExercises(exercises, container, TOTAL_QUESTIONS) {
  container.innerHTML = "";

  // 随机选择6个句子
  const allSentences = exercises.flatMap((ex) => ex.sentences);
  const selectedSentences = getRandomSentences(allSentences, TOTAL_QUESTIONS);

  selectedSentences.forEach((sentence, index) => {
    const section = document.createElement("div");
    section.className = "exercise-section";
    section.innerHTML = `
      <div class="sentence-container" data-correct-text="${sentence.text}">
        <button onclick="playAudio('${sentence.audio}')">播放音频</button>
        <div class="word-buttons">
          ${sentence.words
            .map(
              (word) => `
            <button class="word-button" onclick="selectWord(this, '${word}')">${word}</button>
          `
            )
            .join("")}
        </div>
        <div class="drop-zones">
          ${sentence.words
            .map(
              () => `
            <div class="drop-zone" onclick="selectDropZone(this)"></div>
          `
            )
            .join("")}
        </div>
        <div class="controls">
          <button class="check-button" onclick="checkAnswer(this)">检查答案</button>
          <button class="reset-button" onclick="resetExercise(this)">重置</button>
        </div>
        <div class="feedback"></div>
      </div>
    `;
    container.appendChild(section);
  });
}
