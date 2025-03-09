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
  })
  .catch(error => console.error('خطأ في تحميل الكلمات:', error));

function loadUsedWords(user) {
  const key = "usedWords_" + user;
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  } else {
    return { games: [], countries: [], names: [], foods: [] };
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

/* تفعيل اختيار الفئات */
document.querySelectorAll('.category-box').forEach(box => {
  box.addEventListener('click', function() {
    document.querySelectorAll('.category-box').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
  });
});

/* تفعيل اختيار نوع اللعب */
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

/* تفعيل اختيار عدد المحاولات */
document.querySelectorAll('.attempts-box').forEach(box => {
  box.addEventListener('click', function() {
    document.querySelectorAll('.attempts-box').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
  });
});

document.getElementById("lobbyForm").addEventListener("submit", function(e) {
  e.preventDefault();
  username = document.getElementById("username").value.trim();
  if (username === "") {
    alert("يرجى إدخال اسم المستخدم.");
    return;
  }
  let selectedBox = document.querySelector('.category-box.selected');
  if (!selectedBox) {
    alert("يرجى اختيار الفئة.");
    return;
  }
  currentCategory = selectedBox.getAttribute("data-category");
  document.getElementById("gameTitle").innerText = selectedBox.querySelector("span").innerText;
  
  // قراءة اختيار عدد المحاولات من المربع المحدد
  let selectedAttempt = document.querySelector('.attempts-box.selected').getAttribute('data-attempt');
  attemptsLobby = parseInt(selectedAttempt);
  
  // قراءة اختيار نوع اللعب
  let selectedMode = document.querySelector('.mode-box.selected').getAttribute('data-mode');
  if(selectedMode === 'withoutTime'){
    timeLimitLobby = 0;
  } else {
    timeLimitLobby = parseInt(document.getElementById("timeLimitLobby").value);
  }
  
  document.getElementById("lobby-container").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  startGame();
});

document.getElementById("backBtn").addEventListener("click", function() {
  clearInterval(timerInterval);
  document.getElementById("game-container").style.display = "none";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("nextWordBtn").style.display = "none";
  document.getElementById("retryBtn").style.display = "none";
  document.getElementById("showAnswerBtn").style.display = "none";
  document.getElementById("message").innerText = "";
  document.getElementById("lobby-container").style.display = "block";
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
    document.getElementById("remainingQuestions").innerText = "باقي " + remainingQuestions + "";
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
    secretWord = customWord;
    modal.style.display = "none";
    document.getElementById("remainingQuestions").innerText = "";
    initializeGame();
  };

  document.getElementById("customWordCancel").onclick = function() {
    modal.style.display = "none";
    document.getElementById("lobby-container").style.display = "block";
    document.getElementById("game-container").style.display = "none";
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
    document.getElementById("message").innerText = "صح عليييك يافنااان";
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
