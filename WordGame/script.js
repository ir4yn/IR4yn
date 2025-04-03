let words = {};
let secretWord = "";
let displayedWord = [];
let wrongLetters = [];
let remainingAttempts = 0;
let currentCategory = "";
let username = "";
let attemptsLobby = 5; // ثابت 5 محاولات
let hintUsed = false;  // للتحقق من استخدام التلميح

// تحميل الكلمات من ملف JSON
fetch('words.json')
  .then(response => response.json())
  .then(data => {
    words = data;
    updateCategoryCounts();
  })
  .catch(error => console.error('خطأ في تحميل الكلمات:', error));

function loadUsedWords(user) {
  const key = "usedWords_" + user;
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  } else {
    return { games: [], countries: [], names: [], foods: [], movies: [], cities: [], animals: [], sports: [], songs: [] };
  }
}

function saveUsedWords(user, usedWords) {
  const key = "usedWords_" + user;
  localStorage.setItem(key, JSON.stringify(usedWords));
}

function normalizeLetter(letter) {
  return letter.replace(/[أإآ]/g, "ا");
}

function alreadyGuessed(letter) {
  const normalizedInput = normalizeLetter(letter);
  for (const char of displayedWord) {
    if (char !== "_" && normalizeLetter(char) === normalizedInput) {
      return true;
    }
  }
  for (const char of wrongLetters) {
    if (normalizeLetter(char) === normalizedInput) {
      return true;
    }
  }
  return false;
}

document.getElementById("settingsForm").addEventListener("submit", function(e) {
  e.preventDefault();
  username = document.getElementById("username").value.trim();
  if (username === "") {
    alert("يرجى إدخال اسم المستخدم.");
    return;
  }
  // يتم تعيين عدد المحاولات 5 دائماً واللعب بدون وقت
  document.getElementById("displayUsername").innerText = username;
  document.getElementById("categories-container").style.display = "block";
  document.getElementById("settings-container").style.display = "none";
  updateCategoryCounts();
});

document.querySelectorAll('.category-box').forEach(box => {
  box.addEventListener('click', function() {
    document.querySelectorAll('.category-box').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
  });
});

document.getElementById("startGameBtn").addEventListener("click", function() {
  let selectedCategoryBox = document.querySelector('.category-box.selected');
  if (!selectedCategoryBox) {
    alert("اختر الفئة !!!!!!!!");
    return;
  }
  currentCategory = selectedCategoryBox.getAttribute("data-category");
  
  // التحقق من عدد الكلمات المتبقية في الفئة
  let remainingCount = parseInt(selectedCategoryBox.querySelector(".remaining-count").innerText);
  if(remainingCount <= 0){
    alert("قريبا");
    return;
  }
  
  document.getElementById("gameTitle").innerText = selectedCategoryBox.querySelector("span").innerText;
  document.getElementById("categories-container").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  startGame();
});

document.getElementById("backToCategoriesBtn").addEventListener("click", function() {
  document.getElementById("game-container").style.display = "none";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("nextWordBtn").style.display = "none";
  document.getElementById("retryBtn").style.display = "none";
  document.getElementById("showAnswerBtn").style.display = "none";
  document.getElementById("message").innerText = "";
  document.getElementById("categories-container").style.display = "block";
  updateCategoryCounts();
});

document.getElementById("nextWordBtn").addEventListener("click", function() {
  document.getElementById("nextWordBtn").style.display = "none";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("message").innerText = "";

  const hintBtn = document.getElementById("hintBtn");
  hintBtn.disabled = false;
  hintBtn.style.backgroundColor = "";
  
  startGame();
});

function updateCategoryCounts() {
  if (!words || Object.keys(words).length === 0) return;
  document.querySelectorAll('.category-box').forEach(box => {
    let category = box.getAttribute("data-category");
    let total = words[category] ? words[category].length : 0;
    let usedWords = loadUsedWords(username);
    let usedCount = usedWords[category] ? usedWords[category].length : 0;
    let remaining = total - usedCount;
    let smallElem = box.querySelector(".remaining-count");
    if (smallElem) {
      smallElem.innerText = remaining;
    }
  });
}

document.getElementById("backBtn").addEventListener("click", function() {
  document.getElementById("game-container").style.display = "none";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("nextWordBtn").style.display = "none";
  document.getElementById("retryBtn").style.display = "none";
  document.getElementById("showAnswerBtn").style.display = "none";
  document.getElementById("message").innerText = "";
  document.getElementById("categories-container").style.display = "block";
  updateCategoryCounts();
});

function startGame() {
  // عند اختيار فئة معينة
  if (Object.keys(words).length === 0) {
    document.getElementById("message").innerText = "لم يتم تحميل الكلمات بعد، حاول مرة أخرى.";
    return;
  }
  let usedWords = loadUsedWords(username);
  let wordList = words[currentCategory];
  let availableWords = wordList.filter(w => !usedWords[currentCategory].includes(w));
  
  if (availableWords.length === 0) {
    usedWords[currentCategory] = [];
    saveUsedWords(username, usedWords);
    availableWords = wordList;
    document.getElementById("message").innerText = "لقد انتهت الكلمات، تم إعادة تعيين الكلمات.";
  }
  
  secretWord = availableWords[Math.floor(Math.random() * availableWords.length)];
  usedWords[currentCategory].push(secretWord);
  saveUsedWords(username, usedWords);
  let remainingQuestions = wordList.length - usedWords[currentCategory].length;
  document.getElementById("remainingQuestions").innerText = "باقي " + remainingQuestions;
  
  initializeGame();
}

function initializeGame() {
  // إعادة تعيين المتغيرات لكل جولة جديدة
  hintUsed = false;
  displayedWord = secretWord.split("").map(char => char === " " ? " " : "_");
  wrongLetters = [];
  remainingAttempts = attemptsLobby;
  
  document.getElementById("letterInput").disabled = false;
  document.getElementById("guessBtn").disabled = false;
  document.getElementById("retryBtn").style.display = "none";
  document.getElementById("showAnswerBtn").style.display = "none";
  document.getElementById("nextWordBtn").style.display = "none";
  document.getElementById("message").innerText = "";
  document.getElementById("hintBtn").disabled = false;
  
  updateDisplay();
}

function updateDisplay() {
  document.getElementById("wordDisplay").innerText = displayedWord.join(" ");
  let container = document.getElementById("wrongLettersContainer");
  container.innerHTML = "";
  wrongLetters.forEach(letter => {
    let span = document.createElement("span");
    span.className = "wrong-letter-box";
    span.innerText = letter;
    container.appendChild(span);
  });
  document.getElementById("remainingAttempts").innerText = remainingAttempts;
}

function disableInput() {
  document.getElementById("letterInput").disabled = true;
  document.getElementById("guessBtn").disabled = true;
}

function guessLetter() {
  const input = document.getElementById("letterInput");
  let letter = input.value;
  input.value = "";
  if (!letter) return;
  letter = letter.trim();
  if (!/^[\u0621-\u064A]$/.test(letter)) {
    document.getElementById("message").innerText = "";
    return;
  }
  if (alreadyGuessed(letter)) {
    document.getElementById("message").innerText = "لقد اخترت هذا الحرف من قبل.";
    return;
  }
  let correctGuess = false;
  for (let i = 0; i < secretWord.length; i++) {
    if (normalizeLetter(secretWord[i]) === normalizeLetter(letter)) {
      displayedWord[i] = secretWord[i];
      correctGuess = true;
    }
  }
  if (!correctGuess) {
    wrongLetters.push(letter);
    remainingAttempts--;
  }
  updateDisplay();
  
  if (!displayedWord.includes("_")) {
    // اللاعب فاز، نعرض الكلمة الكاملة
    document.getElementById("wordDisplay").innerText = secretWord;
    
    // قائمة برسائل احتفالية متنوعة
    const winMessages = [
      "صح يامجنوووووووووون",
      " يا اسطوووووورة",
      "ياااا قوووووتك",
      " انت كيييييييف",
      "استمر",
      "ياسلاااااام",
      "احسنت",
      "وااااااااااو",
      " يافنااااان",
      " ماشاءالله عليييك",
      "استمرر يابطل",
      "مجنوووووووون",
      "  يااا قوييييي",
      " يالعيييييييييييب"
    ];
    // اختيار رسالة عشوائية
    const randomMessage = winMessages[Math.floor(Math.random() * winMessages.length)];
    document.getElementById("message").innerText = randomMessage;
    
    disableInput();
    document.getElementById("nextWordBtn").style.display = "block";
    document.getElementById("backBtn").style.display = "block";
    
    // تشغيل احتفالية قصاصات باستخدام مكتبة canvas-confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  } else if (remainingAttempts <= 0) {
    document.getElementById("message").innerText = "انتهت المحاولات!";
    disableInput();
    document.getElementById("retryBtn").style.display = "block";
    document.getElementById("showAnswerBtn").style.display = "block";
  }
}


document.getElementById("guessBtn").addEventListener("click", guessLetter);
document.getElementById("letterInput").addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    guessLetter();
  }
});

document.getElementById("retryBtn").addEventListener("click", function() {
  document.getElementById("retryBtn").style.display = "none";
  document.getElementById("showAnswerBtn").style.display = "none";
  remainingAttempts = attemptsLobby;
  document.getElementById("letterInput").disabled = false;
  document.getElementById("guessBtn").disabled = false;
  document.getElementById("message").innerText = "";
  updateDisplay();
});

document.getElementById("showAnswerBtn").addEventListener("click", function() {
  document.getElementById("retryBtn").style.display = "none";
  document.getElementById("showAnswerBtn").style.display = "none";
  displayedWord = secretWord.split("");
  document.getElementById("wordDisplay").innerText = displayedWord.join(" ");
  document.getElementById("message").innerText = "الكلمة الصحيحة هي: " + secretWord;
  disableInput();
  document.getElementById("nextWordBtn").style.display = "block";
});

document.getElementById("hintBtn").addEventListener("click", function() {
  if (hintUsed) {
    document.getElementById("message").innerText = "لقد استخدمت التلميح بالفعل.";
    return;
  }
  // تغيير لون زر التلميح ليبدو أنه مستعمل
  this.style.backgroundColor = "gray"; // اختر اللون الذي تفضله

  // إيجاد الفهارس التي لا يزال فيها "_" في الكلمة المعروضة
  const hiddenIndexes = [];
  displayedWord.forEach((char, index) => {
    if (char === "_") hiddenIndexes.push(index);
  });
  if (hiddenIndexes.length === 0) return;
  
  const randomIndex = hiddenIndexes[Math.floor(Math.random() * hiddenIndexes.length)];
  
  // عرض الحرف مؤقتاً دون تغييره في المتغير الأصلي
  const tempDisplay = displayedWord.slice();
  tempDisplay[randomIndex] = secretWord[randomIndex];
  document.getElementById("wordDisplay").innerText = tempDisplay.join(" ");
  
  hintUsed = true;
  document.getElementById("hintBtn").disabled = true;
  
  setTimeout(() => {
    document.getElementById("wordDisplay").innerText = displayedWord.join(" ");
  }, 1000);
});

