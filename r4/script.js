let words = {};
let secretWord = "";
let displayedWord = [];
let wrongLetters = [];
let remainingAttempts = 0;
let timerInterval;
let timeRemaining = 0;
let currentCategory = "";
let username = "";
let attemptsLobby = 0;
let timeLimitLobby = 0;
let retryUsed = false; 

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
  let selectedModeElem = document.querySelector('.mode-box.selected');
  let selectedMode = selectedModeElem.getAttribute('data-mode');
  if(selectedMode === 'withoutTime'){
    timeLimitLobby = 0;
  } else {
    timeLimitLobby = parseInt(document.getElementById("timeLimitLobby").value);
  }
  let selectedAttempt = document.querySelector('.attempts-box.selected').getAttribute('data-attempt');
  attemptsLobby = parseInt(selectedAttempt);

  document.getElementById("displayUsername").innerText = username;
  document.getElementById("displayMode").innerText = (selectedMode === 'withoutTime') ? "بدون وقت" : "بالوقت";
  document.getElementById("displayAttempts").innerText = attemptsLobby;

  document.getElementById("settings-container").style.display = "none";
  document.getElementById("categories-container").style.display = "block";
  updateCategoryCounts();
});

document.querySelectorAll('.mode-box').forEach(box => {
  box.addEventListener('click', function() {
    document.querySelectorAll('.mode-box').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    let mode = this.getAttribute('data-mode');
    if (mode === 'withoutTime') {
      document.getElementById("timeLimitGroup").style.display = "none";
    } else {
      document.getElementById("timeLimitGroup").style.display = "block";
    }
  });
});

document.querySelectorAll('.attempts-box').forEach(box => {
  box.addEventListener('click', function() {
    document.querySelectorAll('.attempts-box').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
  });
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
  
  if(currentCategory !== "custom"){
    let remainingCount = parseInt(selectedCategoryBox.querySelector(".remaining-count").innerText);
    if(remainingCount <= 0){
      alert("قريبا");
      return;
    }
  }
  
  document.getElementById("gameTitle").innerText = selectedCategoryBox.querySelector("span").innerText;
  document.getElementById("categories-container").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  startGame();
});

document.getElementById("backToCategoriesBtn").addEventListener("click", function() {
  clearInterval(timerInterval);
  document.getElementById("game-container").style.display = "none";
  document.getElementById("categories-container").style.display = "block";
  updateCategoryCounts();
});

function updateCategoryCounts() {
  if (!words || Object.keys(words).length === 0) return;
  document.querySelectorAll('.category-box').forEach(box => {
    let category = box.getAttribute("data-category");
    if (category === "custom") return;
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
  clearInterval(timerInterval);
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
  document.getElementById("message").innerText = "";
  startGame();
});

function startGame() {
  clearInterval(timerInterval);
  if (currentCategory === "custom") {
    showCustomWordModal();
    return;
  } else {
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
  }
  initializeGame();
}

function initializeGame() {
  clearInterval(timerInterval);
  retryUsed = false; 
  displayedWord = secretWord.split("").map(char => char === " " ? " " : "_");
  wrongLetters = [];
  remainingAttempts = attemptsLobby;
  timeRemaining = timeLimitLobby;
  
  document.getElementById("letterInput").disabled = false;
  document.getElementById("guessBtn").disabled = false;
  document.getElementById("retryBtn").style.display = "none";
  document.getElementById("showAnswerBtn").style.display = "none";
  document.getElementById("nextWordBtn").style.display = "none";
  document.getElementById("message").innerText = "";
  
  updateDisplay();
  
  if (timeLimitLobby > 0) {
    timerInterval = setInterval(updateTimer, 1000);
  } else {
    document.getElementById("timeRemaining").innerText = "∞";
  }
}

function showCustomWordModal() {
  let modal = document.getElementById("customWordModal");
  modal.style.display = "flex";
  let customInput = document.getElementById("customWordInput");
  customInput.value = "";
  customInput.type = "password";
  document.getElementById("toggleCustomWordVisibility").innerText = "اظهار";

  let toggleBtn = document.getElementById("toggleCustomWordVisibility");
  toggleBtn.onclick = function() {
    if (customInput.type === "password") {
      customInput.type = "text";
      toggleBtn.innerText = "إخفاء";
    } else {
      customInput.type = "password";
      toggleBtn.innerText = "اظهار";
    }
  };

  document.getElementById("customWordSubmit").onclick = function() {
    let customWord = customInput.value.trim();
    if (!customWord) {
      alert("يجب إدخال كلمة صحيحة.");
      return;
    }
    if (!/^[\u0621-\u064A]+$/.test(customWord)) {
      alert(" أحرف عربية فقط.");
      return;
    }
    secretWord = customWord;
    modal.style.display = "none";
    document.getElementById("remainingQuestions").innerText = "";
    initializeGame();
  };

  document.getElementById("customWordCancel").onclick = function() {
    modal.style.display = "none";
    document.getElementById("categories-container").style.display = "block";
  };
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
  if(timeLimitLobby > 0) {
    document.getElementById("timeRemaining").innerText = timeRemaining;
  }
}

function updateTimer() {
  if (timeRemaining > 0) {
    timeRemaining--;
    document.getElementById("timeRemaining").innerText = timeRemaining;
  } else {
    clearInterval(timerInterval);
    document.getElementById("message").innerText = "انتهى الوقت!";
    disableInput();
    document.getElementById("retryBtn").style.display = "block";
    document.getElementById("showAnswerBtn").style.display = "block";
  }
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
    clearInterval(timerInterval);
    document.getElementById("wordDisplay").innerText = secretWord;
    document.getElementById("message").innerText = "صححح يامجنووووووووون";
    disableInput();
    document.getElementById("nextWordBtn").style.display = "block";
    document.getElementById("backBtn").style.display = "block";
  } else if (remainingAttempts <= 0) {
    clearInterval(timerInterval);
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
  if (retryUsed) {
    document.getElementById("message").innerText = "بسسس ياحبيبي";
    return;
  }
  retryUsed = true;
  document.getElementById("retryBtn").style.display = "none";
  document.getElementById("showAnswerBtn").style.display = "none";
  remainingAttempts = attemptsLobby;
  if (timeLimitLobby > 0) {
    timeRemaining = timeLimitLobby;
    timerInterval = setInterval(updateTimer, 1000);
  }
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