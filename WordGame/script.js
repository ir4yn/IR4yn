let words = {};
let secretWord = "";
let displayedWord = [];
let wrongLetters = [];
let remainingAttempts = 0;
let currentCategory = "";
let username = "";
let attemptsLobby = 5;
let hintUsed = false;
let gameProgressMade = false;
let wordUsed = false;
let retryUsed = false;
let userXP = 0;
let userLevel = 1;

fetch('words.json')
  .then(r => r.json())
  .then(d => words = d);

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    const ref = firebase.database().ref('users/' + user.uid);
    ref.once('value').then(s => {
      const u = s.exists() ? s.val() : {};
      username = u.username || (user.email ? user.email.split('@')[0] : "مستخدم");
      userXP = u.xp || 0;
      userLevel = u.level || 1;
      document.getElementById("displayUsername").innerText = username;
      updateXPDisplay();
      document.getElementById("categories-container").style.display = "block";
      updateCategoryCounts();
      loadGameStateFirebase();
    });
  } else {
    window.location.href = "/login.html";
  }
});

function updateXPDisplay() {
  document.getElementById("xpDisplay").innerText = userXP;
  document.getElementById("levelDisplay").innerText = userLevel;
}

function updateUserDataInFirebase() {
  const uid = firebase.auth().currentUser.uid;
  firebase.database().ref('users/' + uid).update({ xp: userXP, level: userLevel });
}

function updateLevel() {
  userLevel = Math.floor(userXP / 100) + 1;
  updateXPDisplay();
  updateUserDataInFirebase();
}

function loadUsedWords(user) {
  return firebase.database().ref('users/' + user + '/usedWords').once('value').then(s => {
    const uw = s.val() || {};
    ['games','countries','names','foods','movies','cities','animals','sports','songs'].forEach(c => {
      if (!uw[c]) uw[c] = [];
    });
    return uw;
  });
}

function saveUsedWords(user, uw) {
  firebase.database().ref('users/' + user + '/usedWords').set(uw);
}

function normalizeLetter(l) {
  return l.replace(/[أإآ]/g, "ا");
}

function alreadyGuessed(l) {
  const ni = normalizeLetter(l);
  return displayedWord.some(c => c !== "_" && normalizeLetter(c) === ni) ||
         wrongLetters.some(c => normalizeLetter(c) === ni);
}

function updateCategoryCounts() {
  if (!words || !Object.keys(words).length) return;
  loadUsedWords(firebase.auth().currentUser.uid).then(uw => {
    document.querySelectorAll('.category-box').forEach(box => {
      const cat = box.getAttribute("data-category");
      const total = words[cat]?.length || 0;
      const used = (uw[cat] || []).length;
      box.querySelector(".remaining-count").innerText = total - used;
    });
  });
}

function markWordUsed() {
  if (wordUsed) return;
  wordUsed = true;
  loadUsedWords(firebase.auth().currentUser.uid).then(uw => {
    if (!uw[currentCategory].includes(secretWord)) {
      uw[currentCategory].push(secretWord);
      saveUsedWords(firebase.auth().currentUser.uid, uw);
      const total = words[currentCategory]?.length || 0;
      document.getElementById("remainingQuestions").innerText = "باقي " + (total - uw[currentCategory].length);
    }
  });
}

function startGame() {
  if (!words[currentCategory]) {
    document.getElementById("message").innerText = "لم يتم تحميل الكلمات بعد، حاول مرة أخرى.";
    return;
  }
  loadUsedWords(firebase.auth().currentUser.uid).then(uw => {
    const list = words[currentCategory];
    const avail = list.filter(w => !uw[currentCategory]?.includes(w));
    if (!avail.length) {
      alert("انتهت كلمات هذه الفئة!");
      document.getElementById("game-container").style.display = "none";
      document.getElementById("categories-container").style.display = "block";
      updateCategoryCounts();
      return;
    }
    secretWord = avail[Math.floor(Math.random() * avail.length)];
    document.getElementById("remainingQuestions").innerText =
      "باقي " + (list.length - (uw[currentCategory]?.length || 0));
    initializeGame();
  });
}

function initializeGame() {
  hintUsed = false;
  gameProgressMade = false;
  wordUsed = false;
  retryUsed = false;
  displayedWord = secretWord.split("").map(c => c === " " ? " " : "_");
  wrongLetters = [];
  remainingAttempts = attemptsLobby;
  document.getElementById("letterInput").disabled = false;
  document.getElementById("guessBtn").disabled = false;
  document.getElementById("retryBtn").style.display = "none";
  document.getElementById("showAnswerBtn").style.display = "none";
  document.getElementById("nextWordBtn").style.display = "none";
  document.getElementById("message").innerText = "";
  document.getElementById("hintBtn").disabled = false;
  document.getElementById("hintBtn").style.backgroundColor = "";
  updateDisplay();
  saveGameStateFirebase();
}

function updateDisplay() {
  document.getElementById("wordDisplay").innerText = displayedWord.join(" ");
  const c = document.getElementById("wrongLettersContainer");
  c.innerHTML = "";
  wrongLetters.forEach(l => {
    const s = document.createElement("span");
    s.className = "wrong-letter-box";
    s.innerText = l;
    c.appendChild(s);
  });
  document.getElementById("remainingAttempts").innerText = remainingAttempts;
}

function disableInput() {
  document.getElementById("letterInput").disabled = true;
  document.getElementById("guessBtn").disabled = true;
}

function guessLetter() {
  const input = document.getElementById("letterInput");
  const letter = input.value.trim();
  input.value = "";
  if (!letter || !/^[\u0621-\u064A]$/.test(letter)) return;
  if (!gameProgressMade) {
    gameProgressMade = true;
    markWordUsed();
  }
  if (alreadyGuessed(letter)) {
    document.getElementById("message").innerText = "لقد اخترت هذا الحرف من قبل.";
    return;
  }
  let correct = false;
  for (let i = 0; i < secretWord.length; i++) {
    if (normalizeLetter(secretWord[i]) === normalizeLetter(letter)) {
      displayedWord[i] = secretWord[i];
      correct = true;
    }
  }
  if (!correct) {
    wrongLetters.push(letter);
    remainingAttempts--;
  }
  updateDisplay();
  saveGameStateFirebase();
  if (!displayedWord.includes("_")) {
    document.getElementById("wordDisplay").innerText = secretWord;
    const msgs = ["صح يامجنوووووووووون","يا اسطوووووورة","ياااا قوووووتك","انت كيييييييف","استمر","ياسلاااااام","احسنت","وااااااااااو","يافنااااان","ماشاءالله عليييك","استمرر يابطل","مجنوووووووون","يااا قوييييي","يالعيييييييييييب"];
    document.getElementById("message").innerText = msgs[Math.floor(Math.random()*msgs.length)];
    disableInput();
    document.getElementById("nextWordBtn").style.display = "block";
    document.getElementById("backBtn").style.display = "block";
    confetti({ particleCount:200, spread:70, origin:{x:0.5,y:0.8} });
    gameProgressMade = false;
    let xp = 0, m = wrongLetters.length;
    if (!retryUsed) {
      xp = m === 0 ? 100 : m === 1 ? 90 : m === 2 ? 80 : m === 3 ? 70 : m === 4 ? 60 : 50;
    } else {
      xp = m === 0 ? 50 : m === 1 ? 40 : m === 2 ? 30 : m === 3 ? 20 : m === 4 ? 10 : 5;
    }
    userXP += xp;
    updateLevel();
    document.getElementById("message").innerHTML += '<br><span class="xp-message">حصلت على ' + xp + ' <i class="fas fa-star"></i></span>';
    saveGameStateFirebase();
  } else if (remainingAttempts <= 0) {
    document.getElementById("message").innerText = "انتهت المحاولات!";
    disableInput();
    document.getElementById("retryBtn").style.display = "block";
    document.getElementById("showAnswerBtn").style.display = "block";
    saveGameStateFirebase();
  }
}

function saveGameStateFirebase() {
  const state = {
    secretWord,
    displayedWord,
    wrongLetters,
    remainingAttempts,
    currentCategory,
    hintUsed,
    gameProgressMade,
    wordUsed,
    retryUsed,
    userXP,
    userLevel
  };
  const uid = firebase.auth().currentUser.uid;
  firebase.database().ref('users/' + uid + '/gameState').set(state);
}

function loadGameStateFirebase() {
  const uid = firebase.auth().currentUser.uid;
  firebase.database().ref('users/' + uid + '/gameState').once('value').then(snapshot => {
    const state = snapshot.val();
    if (state) {
      secretWord = state.secretWord || "";
      displayedWord = state.displayedWord || [];
      wrongLetters = state.wrongLetters || [];
      remainingAttempts = state.remainingAttempts || attemptsLobby;
      currentCategory = state.currentCategory || "";
      hintUsed = state.hintUsed || false;
      gameProgressMade = state.gameProgressMade || false;
      wordUsed = state.wordUsed || false;
      retryUsed = state.retryUsed || false;
      userXP = state.userXP || 0;
      userLevel = state.userLevel || 1;
      updateDisplay();
      updateXPDisplay();
      if (gameProgressMade && currentCategory) {
        document.getElementById("game-container").style.display = "block";
        document.getElementById("categories-container").style.display = "none";
        const categoryBox = document.querySelector(`.category-box[data-category="${currentCategory}"]`);
        if (categoryBox) {
          document.getElementById("gameTitle").innerText = categoryBox.querySelector("span").innerText;
        }
      } else {
        document.getElementById("game-container").style.display = "none";
        document.getElementById("categories-container").style.display = "block";
      }
      if (remainingAttempts > 0) {
        document.getElementById("letterInput").disabled = false;
        document.getElementById("guessBtn").disabled = false;
      }
    }
  });
}




document.getElementById('backToHomeBtn').addEventListener('click', () => {
  if(gameProgressMade){ 
    alert("يوجد لديك كلمة لم تكملها، يرجى إنهاءها أولاً.");
    document.getElementById("game-container").style.display = "block";
    document.getElementById("categories-container").style.display = "none";
    return; 
  }
  window.location.href = "../index.html";
});

document.querySelectorAll('.category-box').forEach(b => b.addEventListener('click', function(){
  document.querySelectorAll('.category-box').forEach(x => x.classList.remove('selected'));
  this.classList.add('selected');
}));

document.getElementById("startGameBtn").addEventListener("click", () => {
  if(gameProgressMade){ 
    alert("يوجد لديك كلمة غير مكتملة، يرجى الانتهاء منها أولاً.");
    document.getElementById("game-container").style.display = "block";
    document.getElementById("categories-container").style.display = "none";
    return; 
  }
  const sel = document.querySelector('.category-box.selected');
  if(!sel){ 
    alert("اختر الفئة !!!!!!!!"); 
    return; 
  }
  currentCategory = sel.getAttribute("data-category");
  const rem = parseInt(sel.querySelector(".remaining-count").innerText);
  if(rem <= 0){ 
    alert("قريبا"); 
    return; 
  }
  document.getElementById("gameTitle").innerText = sel.querySelector("span").innerText;
  document.getElementById("categories-container").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  startGame();
});

document.getElementById("backToCategoriesBtn").addEventListener("click", () => {
  if(gameProgressMade){ 
    alert("يوجد لديك كلمة غير مكتملة، يرجى إنهاءها أولاً.");
    document.getElementById("game-container").style.display = "block";
    document.getElementById("categories-container").style.display = "none";
    return; 
  }
  document.getElementById("game-container").style.display = "none";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("nextWordBtn").style.display = "none";
  document.getElementById("retryBtn").style.display = "none";
  document.getElementById("showAnswerBtn").style.display = "none";
  document.getElementById("message").innerText = "";
  document.getElementById("categories-container").style.display = "block";
  updateCategoryCounts();
});

document.getElementById("nextWordBtn").addEventListener("click", () => {
  document.getElementById("nextWordBtn").style.display = "none";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("message").innerText = "";
  gameProgressMade = false; 
  hintUsed = false; 
  wordUsed = false; 
  retryUsed = false;
  document.getElementById("hintBtn").disabled = false;
  document.getElementById("hintBtn").style.backgroundColor = "";
  startGame();
});

document.getElementById("backBtn").addEventListener("click", () => {
  if(gameProgressMade){ 
    alert("يوجد لديك كلمة غير مكتملة، يرجى إنهاءها أولاً.");
    document.getElementById("game-container").style.display = "block";
    document.getElementById("categories-container").style.display = "none";
    return; 
  }
  document.getElementById("game-container").style.display = "none";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("nextWordBtn").style.display = "none";
  document.getElementById("retryBtn").style.display = "none";
  document.getElementById("showAnswerBtn").style.display = "none";
  document.getElementById("message").innerText = "";
  document.getElementById("categories-container").style.display = "block";
  updateCategoryCounts();
});

document.getElementById("guessBtn").addEventListener("click", guessLetter);
document.getElementById("letterInput").addEventListener("keyup", e => { if(e.key === "Enter") guessLetter(); });

document.getElementById("retryBtn").addEventListener("click", () => {
  if (retryUsed) {
    document.getElementById("retryBtn").style.display = "none";
    document.getElementById("message").innerText = "بسسس خلاص";
    return;
  }
  retryUsed = true;
  document.getElementById("retryBtn").style.display = "none";
  document.getElementById("showAnswerBtn").style.display = "none";
  remainingAttempts = attemptsLobby;
  document.getElementById("letterInput").disabled = false;
  document.getElementById("guessBtn").disabled = false;
  document.getElementById("message").innerText = "";
  updateDisplay();
  saveGameStateFirebase();
});

document.getElementById("showAnswerBtn").addEventListener("click", () => {
  displayedWord = secretWord.split("");
  document.getElementById("wordDisplay").innerText = displayedWord.join(" ");
  document.getElementById("message").innerText = "الكلمة الصحيحة هي: " + secretWord;
  disableInput();
  document.getElementById("nextWordBtn").style.display = "block";
  gameProgressMade = false;
  saveGameStateFirebase();
});

if(document.getElementById("logoutBtn")){
  document.getElementById("logoutBtn").addEventListener("click", () => {
    if(gameProgressMade){ 
      alert("لقد بدأت اللعب في الفئة " + currentCategory + "، يجب إنهاء الكلمة الحالية قبل تسجيل الخروج.");
      document.getElementById("game-container").style.display = "block";
      document.getElementById("categories-container").style.display = "none";
      return; 
    }
    firebase.auth().signOut().then(() => window.location.href = "/login.html");
  });
}

document.getElementById("hintBtn").addEventListener("click", function(){
  if(hintUsed){ 
    document.getElementById("message").innerText = "لقد استخدمت التلميح بالفعل."; 
    return; 
  }
  if(!gameProgressMade){ 
    gameProgressMade = true; 
    markWordUsed(); 
  }
  this.style.backgroundColor = "gray";
  const hi = displayedWord.reduce((a, c, i) => (c === "_" ? a.concat(i) : a), []);
  if(!hi.length) return;
  const ri = hi[Math.floor(Math.random() * hi.length)];
  const td = displayedWord.slice();
  td[ri] = secretWord[ri];
  document.getElementById("wordDisplay").innerText = td.join(" ");
  hintUsed = true;
  this.disabled = true;
  setTimeout(() => document.getElementById("wordDisplay").innerText = displayedWord.join(" "), 1000);
  saveGameStateFirebase();
});
