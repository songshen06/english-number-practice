let questions = [];
let current = 0,
  score = 0;

async function loadQuestions() {
  const res = await fetch("questions.json");
  questions = await res.json();
}

function showTip(tip) {
  document.getElementById("assistant-tip").style.display = "flex";
  document.querySelector(".tip-content").textContent = tip;
}

function hideTip() {
  document.getElementById("assistant-tip").style.display = "none";
}

function showQuestion() {
  const q = questions[current];
  document.getElementById("question").innerHTML = q.sentence.replace(
    q.blank,
    `<span class='blank'>____</span>`
  );
  // 动词能量块
  const options = q.options
    .map(
      (opt, idx) =>
        `<button class='verb-block' data-idx='${idx}'>${opt}</button>`
    )
    .join("");
  document.getElementById("verb-options").innerHTML = options;
  // 绑定事件
  document.querySelectorAll(".verb-block").forEach((btn) => {
    btn.onclick = () => checkAnswer(btn, q);
    btn.onmouseenter = () => btn.classList.add("glow");
    btn.onmouseleave = () => btn.classList.remove("glow");
  });
  document.getElementById("feedback").textContent = "";
}

function checkAnswer(btn, q) {
  const idx = +btn.dataset.idx;
  if (q.options[idx] === q.answer) {
    score++;
    playSound("success");
    showFeedback("perfect");
    btn.classList.add("glow");
    setTimeout(() => {
      btn.classList.remove("glow");
      nextQuestion();
    }, 1200);
  } else {
    playSound("error");
    showFeedback("try-again");
    btn.classList.add("shake");
    setTimeout(() => {
      btn.classList.remove("shake");
    }, 600);
  }
  updateProgress();
}

function playSound(type) {
  if (type !== "success" && type !== "error") return;
  const audio = document.getElementById("audio-" + type);
  if (audio && audio.src) {
    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (e) {
      // 忽略播放错误
    }
  }
}

function showFeedback(type) {
  const feedback = document.getElementById("feedback");
  if (type === "perfect") {
    feedback.textContent = "完美变形！";
    feedback.className = "feedback-area perfect";
  } else if (type === "try-again") {
    feedback.textContent = "哎呀，再试一次！";
    feedback.className = "feedback-area try-again";
  } else {
    feedback.textContent = "";
    feedback.className = "feedback-area";
  }
}

function updateProgress() {
  // 剩余题数 = 总题数 - 当前题号
  const remaining = questions.length - current;
  document.getElementById(
    "score"
  ).textContent = `剩余题目：${remaining} / ${questions.length}`;
  document.getElementById("progress-bar").value = remaining;
}

function nextQuestion() {
  current++;
  if (current >= questions.length) {
    showEnd();
  } else {
    showQuestion();
    updateProgress();
  }
}

function showEnd() {
  document.getElementById("question").textContent = "冒险结束！";
  document.getElementById("verb-options").innerHTML = "";
  document.getElementById(
    "feedback"
  ).textContent = `最终得分：${score} / ${questions.length}`;
  document.getElementById("feedback").className = "feedback-area perfect";
  document.getElementById("progress-bar").value = 0;
  document.getElementById("retry-btn").style.display = "";
}

document.getElementById("close-tip").onclick = hideTip;
document.getElementById("retry-btn").onclick = () => {
  current = 0;
  score = 0;
  document.getElementById("retry-btn").style.display = "none";
  showTip("动词变身口诀：动词过去式要记牢，规则加ed，不规则要背好！");
};

window.onload = async () => {
  await loadQuestions();
  document.getElementById("progress-bar").max = questions.length;
  document.getElementById("progress-bar").value = questions.length;
  showTip(
    `讲习惯，说事实 (一般现在时):\n\n"天天做，常常有；he, she, it，动词后，S 要牵手。"\n\n过去事，已发生 (一般过去时):\n\n"昨天事，用过去；动词变身：或加 ed，或变特殊形态记！"\n\n现在正做，别忘记 (现在进行时):\n\n"眼前事，正发生；be 动词，加 ing。"`
  );
  document.getElementById("close-tip").onclick = () => {
    hideTip();
    showQuestion();
    updateProgress();
  };
};
