// 通用工具函数

// 生成[min, max]之间的随机整数
export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 洗牌数组
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 播放数字音频
export function playNumberSound(number, audioElement, onError) {
  audioElement.src = `../../audio/${number}.mp3`;
  audioElement.play().catch((error) => {
    if (onError) onError(error);
  });
}

// 导出CSV
export function exportToCsv(filename, header, rows) {
  const csvContent = header + rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 数字转英文单词（1-100）
export function numberToWords(n) {
  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  if (n === 100) return "one hundred";
  if (n >= 1 && n <= 9) return ones[n];
  if (n >= 10 && n <= 19) return teens[n - 10];
  if (n >= 20 && n <= 99) {
    const ten = Math.floor(n / 10);
    const one = n % 10;
    return tens[ten] + (one ? "-" + ones[one] : "");
  }
  return "";
}
