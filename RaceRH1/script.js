let currentUser = null;
let currentUserData = null;
let gameState = {
  bluePosition: 1,
  redPosition: 1,
  questions: hardcodedQuestions,
  blueLifelineChoices: [],
  redLifelineChoices: []
};
let activeStage = 1;
let lastAnswerTeam = null;
let consecutiveCount = 0;
let pendingLifeline = { team: null, lifeline: null };

function saveGameState() {
  const state = {
    bluePosition: gameState.bluePosition,
    redPosition: gameState.redPosition,
    blueLifelineChoices: gameState.blueLifelineChoices,
    redLifelineChoices: gameState.redLifelineChoices,
    activeStage: activeStage
  };
  if (currentUser) {
    firebase.database().ref('users/' + currentUser + '/gameState').set(state);
  }
}

function loadUserData(uid) {
  const userRef = firebase.database().ref('users/' + uid);
  return userRef.once('value').then((snapshot) => {
    currentUserData = snapshot.val() || {};
    // إعادة تعيين بيانات الإجابات بحيث تظهر الأسئلة فور دخول المستخدم
    currentUserData.answeredQuestions = {};

    if (!currentUserData.gameState) {
      currentUserData.gameState = {
        bluePosition: 1,
        redPosition: 1,
        blueLifelineChoices: [],
        redLifelineChoices: [],
        activeStage: 1
      };
    }
    gameState.bluePosition = currentUserData.gameState.bluePosition;
    gameState.redPosition = currentUserData.gameState.redPosition;
    gameState.blueLifelineChoices = currentUserData.gameState.blueLifelineChoices || [];
    gameState.redLifelineChoices = currentUserData.gameState.redLifelineChoices || [];
    activeStage = currentUserData.gameState.activeStage;
    updateUI();
    updateQuestionCounts();
  });
}

function runConfetti() {
  const duration = 30 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }
  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }
    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
}

function checkWin(team) {
  if (gameState[`${team}Position`] >= 11) {
    runConfetti();
    $('#resetGame').show();
    return true;
  }
  return false;
}

function resetGame() {
  gameState.bluePosition = 1;
  gameState.redPosition = 1;
  activeStage = 1;
  gameState.blueLifelineChoices = [];
  gameState.redLifelineChoices = [];
  updateUI();
  $('#blueLifelines, #redLifelines').remove();
  initLifelines();
  $('#resetGame').hide();
  $('#questionDisplay').empty();
  $('#answerDisplay').empty();
  updateQuestionCounts();
  saveGameState();
}

function initStages() {
  const container = $('#stagesContainer');
  container.empty();
  for (let i = 1; i <= 10; i++) {
    container.append(
      `<div class="stage" data-stage="${i}">
         <div class="stage-category">الفئة ${i}</div>
         <div class="questions-remaining" data-stage="${i}">0</div>
         <div class="stage-rect">
           <div class="icon-box" data-stage="${i}"></div>
         </div>
         <div class="stage-icon"></div>
       </div>`
    );
  }
}

function updateQuestionCounts() {
  for (let stage = 1; stage <= 10; stage++) {
    let count = 0;
    if (gameState.questions[stage]) {
      const userAnswered = (currentUserData && currentUserData.answeredQuestions && currentUserData.answeredQuestions[stage]) || [];
      count = Object.keys(gameState.questions[stage]).filter(qid => !userAnswered.includes(qid)).length;
    }
    $(`.stage[data-stage="${stage}"] .questions-remaining`).text(`${count}`);
  }
}

function updateUI() {
  const stageElements = $('.stage');
  if (stageElements.length > 0) {
    const stageWidth = 120, stageHeight = 150;
    const circleWidth = 50;
    const offsetX = (stageWidth - circleWidth) / 2;
    stageElements.removeClass('active-stage');
    let blueStageElem = stageElements.filter(function() { return $(this).data('stage') === gameState.bluePosition; });
    if (blueStageElem.length) {
      let pos = blueStageElem.position();
      $('#blueCircle').css({ top: pos.top + 10, left: pos.left + offsetX });
    }
    let redStageElem = stageElements.filter(function() { return $(this).data('stage') === gameState.redPosition; });
    if (redStageElem.length) {
      let pos = redStageElem.position();
      $('#redCircle').css({ top: pos.top + stageHeight - 50 - 10, left: pos.left + offsetX });
    }
    stageElements.filter(function() { return $(this).data('stage') === activeStage; }).addClass('active-stage');
  }
}

function initLifelines() {
  let blueLifelinesContainer = $(`
    <div id="blueLifelines" class="lifelines-container" style="position: absolute; top: 20px; left: 20px; display: flex; flex-direction: column; gap: 15px;">
      <button class="lifeline-button blue-lifeline" data-team="blue" data-lifeline="pullAdvance">اسحب و تقدم خطوة</button>
      <button class="lifeline-button blue-lifeline" data-team="blue" data-lifeline="blockOpponent">بلوك لاعب</button>
      <button class="lifeline-button blue-lifeline" data-team="blue" data-lifeline="cancelPush">الغاء الترجيع</button>
    </div>
  `);
  let redLifelinesContainer = $(`
    <div id="redLifelines" class="lifelines-container" style="position: absolute; top: 20px; right: 20px; display: flex; flex-direction: column; gap: 15px;">
      <button class="lifeline-button red-lifeline" data-team="red" data-lifeline="pullAdvance">اسحب و تقدم خطوة</button>
      <button class="lifeline-button red-lifeline" data-team="red" data-lifeline="blockOpponent">بلوك لاعب</button>
      <button class="lifeline-button red-lifeline" data-team="red" data-lifeline="cancelPush">الغاء الترجيع</button>
    </div>
  `);
  $('#gameContainer').prepend(blueLifelinesContainer, redLifelinesContainer);
  gameState.blueLifelineChoices.forEach(lifeline => {
    $(`#blueLifelines button[data-lifeline="${lifeline}"]`).prop('disabled', true).addClass('used');
  });
  gameState.redLifelineChoices.forEach(lifeline => {
    $(`#redLifelines button[data-lifeline="${lifeline}"]`).prop('disabled', true).addClass('used');
  });
}

const lifelineDescriptions = {
  pullAdvance: "تسحب الخصم خطوة ورا و تتقدم خطوة قدام اذا جاوبت صح",
  blockOpponent: "اختار شخص من الخصم ما يجاوب بالراوند الجاي",
  cancelPush: "الخصم ما يقدر يرجعك بالراوند الجاي"
};

$(document).on('click', '.lifeline-button', function() {
  let team = $(this).data('team');
  let lifeline = $(this).data('lifeline');
  if ($(this).prop('disabled')) return;
  pendingLifeline = { team, lifeline };
  gameState[team + "LifelineChoices"].push(lifeline);
  $(this).prop('disabled', true).addClass('used');
  alert("\n" + lifelineDescriptions[lifeline] + "\n");
  saveGameState();
});

$('#decisionModal').on('hidden.bs.modal', function() {
  if (pendingLifeline.team && pendingLifeline.lifeline) {
    let team = pendingLifeline.team;
    let lifeline = pendingLifeline.lifeline;
    let arr = gameState[team + "LifelineChoices"];
    let index = arr.indexOf(lifeline);
    if (index > -1) {
      arr.splice(index, 1);
    }
    saveGameState();
    pendingLifeline = { team: null, lifeline: null };
  }
});

function handleAnswer(team, option) {
  let opponent = team === 'blue' ? 'red' : 'blue';
  if (option === "push" && gameState[opponent + "LifelineChoices"].includes("cancelPush")) {
    let index = gameState[opponent + "LifelineChoices"].indexOf("cancelPush");
    if (index > -1) {
      gameState[opponent + "LifelineChoices"].splice(index, 1);
    }
    alert("تم تفعيل مساعدة الغاء الترجيع للخصم، لا يمكنك الترجيع.");
    gameState.blueLifelineChoices = [];
    gameState.redLifelineChoices = [];
    saveGameState();
    return;
  }
  if (option === "advance") {
    if (gameState[team + "LifelineChoices"].includes("pullAdvance")) {
      gameState[team + "Position"]++;
      if (gameState[opponent + "Position"] > 1) {
        gameState[opponent + "Position"]--;
      }
      let index = gameState[team + "LifelineChoices"].indexOf("pullAdvance");
      if (index > -1) {
        gameState[team + "LifelineChoices"].splice(index, 1);
      }
    } else {
      gameState[team + "Position"]++;
    }
    activeStage = gameState[team + "Position"];
  } else if (option === "push") {
    if (consecutiveCount === 2) {
      gameState[opponent + "Position"] = Math.max(1, gameState[opponent + "Position"] - 1);
      activeStage = gameState[opponent + "Position"];
      consecutiveCount = 0;
    } else if (consecutiveCount > 2) {
      alert("لازم تجاوب مرتين ورا بعض");
      if (gameState[team + "LifelineChoices"].includes("pullAdvance")) {
        gameState[team + "Position"]++;
        if (gameState[opponent + "Position"] > 1) {
          gameState[opponent + "Position"]--;
        }
        let index = gameState[team + "LifelineChoices"].indexOf("pullAdvance");
        if (index > -1) {
          gameState[team + "LifelineChoices"].splice(index, 1);
        }
      } else {
        gameState[team + "Position"]++;
      }
      activeStage = gameState[team + "Position"];
      consecutiveCount = 0;
    } else {
      alert("error");
      return;
    }
  }
  updateUI();
  $('#questionDisplay, #answerDisplay').empty();
  checkWin(team);
  gameState.blueLifelineChoices = [];
  gameState.redLifelineChoices = [];
  saveGameState();
}

$('#showQuestion').click(function() {
  $('#questionDisplay, #answerDisplay').empty();
  window.currentQuestionId = null;
  window.currentQuestionData = null;
  if (activeStage) {
    let stageQuestions = gameState.questions[activeStage];
    if (stageQuestions) {
      const userAnswered = (currentUserData && currentUserData.answeredQuestions && currentUserData.answeredQuestions[activeStage]) || [];
      let keys = Object.keys(stageQuestions).filter(qid => !userAnswered.includes(qid));
      if (keys.length > 0) {
        let randomIndex = Math.floor(Math.random() * keys.length);
        let questionId = keys[randomIndex];
        let questionData = stageQuestions[questionId];
        window.currentQuestionId = questionId;
        window.currentQuestionData = questionData;
        let categoryName = $(`.stage[data-stage="${activeStage}"] .stage-category`).text();
        $('#questionDisplay').html(
          `<div class="question-box">
             <div class="question-category">${categoryName}</div>
             <div class="question-text">${questionData.text}</div>
             ${questionData.image ? `<div class="question-img-container"><img src="${questionData.image}" class="img-fluid"></div>` : ''}
             <div class="who-answered"><p>من جاوب؟</p></div>
             <div class="answer-buttons">
               <button class="btn btn-info team-answer" data-team="blue">أزرق</button>
               <button class="btn btn-danger team-answer" data-team="red">أحمر</button>
             </div>
           </div>`
        );
        $('.question-text').fitText(1.2, { minFontSize: '14px', maxFontSize: '28px' });
        $('#showAnswerButton').prop('disabled', false).show();
      } else {
        $('#questionDisplay').html(`<p>لا يوجد سؤال في هذه المرحلة.</p>`);
      }
    } else {
      $('#questionDisplay').html(`<p>لا يوجد سؤال في هذه المرحلة.</p>`);
    }
  }
});

$(document).on('click', '.team-answer', function() {
  let team = $(this).data('team');
  $('.who-answered p').removeClass('blue-text red-text').addClass(team === 'blue' ? 'blue-text' : 'red-text');
  let modalContent = $('#decisionModal .modal-content');
  modalContent.removeClass('blue red').addClass(team);
  if (lastAnswerTeam === team) {
    consecutiveCount++;
  } else {
    lastAnswerTeam = team;
    consecutiveCount = 1;
  }
  $('#decisionModal').data('answeringTeam', team);
  if (consecutiveCount < 2) {
    $('#choosePush').hide();
  } else {
    $('#choosePush').show();
  }
  new bootstrap.Modal(document.getElementById('decisionModal')).show();
});

$('#showAnswerButton').click(function() {
  if (!window.currentQuestionData) return;
  if ($('#answerDisplay .answer-content').length > 0) return;
  $('#answerDisplay').html(
    `<div class="answer-content">
       <p><strong>الإجابة:</strong> ${window.currentQuestionData.answer}</p>
     </div>`
  );
  $(this).prop('disabled', true);
  if (!currentUserData.answeredQuestions) {
    currentUserData.answeredQuestions = {};
  }
  if (!currentUserData.answeredQuestions[activeStage]) {
    currentUserData.answeredQuestions[activeStage] = [];
  }
  currentUserData.answeredQuestions[activeStage].push(window.currentQuestionId);
  firebase.database().ref('users/' + currentUser + '/answeredQuestions').set(currentUserData.answeredQuestions);
  window.currentQuestionId = null;
  window.currentQuestionData = null;
  updateQuestionCounts();
});

$('#chooseAdvance').click(function() {
  pendingLifeline = { team: null, lifeline: null };
  let team = $('#decisionModal').data('answeringTeam');
  handleAnswer(team, "advance");
});

$('#choosePush').click(function() {
  pendingLifeline = { team: null, lifeline: null };
  let team = $('#decisionModal').data('answeringTeam');
  handleAnswer(team, "push");
});

$('#resetGame').click(() => resetGame());
$('#settingsButton').click(() => new bootstrap.Modal(document.getElementById('settingsModal')).show());
$('#gameplayButton').click(() => new bootstrap.Modal(document.getElementById('gameplayModal')).show());

$('#resetValues').click(function() {
  gameState.bluePosition = 1;
  gameState.redPosition = 1;
  activeStage = 1;
  consecutiveCount = 0;
  gameState.blueLifelineChoices = [];
  gameState.redLifelineChoices = [];
  $('#blueLifelines, #redLifelines').remove();
  initLifelines();
  updateUI();
  $('#questionDisplay').empty();
  $('#answerDisplay').empty();
  updateQuestionCounts();
  saveGameState();
  alert("تم إعادة تعيين القيم.");
});

$('#resetLifelines').click(function() {
  gameState.blueLifelineChoices = [];
  gameState.redLifelineChoices = [];
  $('#blueLifelines, #redLifelines').remove();
  initLifelines();
  saveGameState();
  alert("تم إعادة تعيين المساعدات.");
});

$('#logout').click(function() {
  firebase.auth().signOut().then(() => {
    currentUser = null;
    currentUserData = null;
    $('#gameContainer').hide();
    window.location.href = "/index.html";
    alert("تم تسجيل الخروج.");
  });
});

document.getElementById('backToHome').addEventListener('click', function() {
  window.location.href = "../index.html";
});

function loadStageConfigurations() {
  for (let stage = 1; stage <= 10; stage++) {
    const config = stageConfigurations[stage] || { category: `الفئة ${stage}`, icon: `images/default-icon-${stage}.png` };
    $(`.stage[data-stage="${stage}"] .stage-category`).text(config.category);
    $(`.stage[data-stage="${stage}"] .stage-icon img`).attr('src', config.icon);
  }
}

$(document).on('click', '.question-img-container', function() {
  const imgSrc = $(this).find('img').attr('src');
  $('#modalImage').attr('src', imgSrc);
  new bootstrap.Modal(document.getElementById('imageModal')).show();
});

$(document).ready(function() {
  $('#showAnswerButton').hide();
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      currentUser = user.uid;
      loadUserData(user.uid).then(() => {
        // إعادة تعيين حالة اللعبة فور دخول المستخدم بحيث تظهر الأسئلة فوراً
        resetGame();
        $('#gameContainer').show();
        initStages();
        loadStageConfigurations();
        updateUI();
        initLifelines();
        updateQuestionCounts();
      });
    } else {
      window.location.href = "/login.html";
    }
  });

  const decisionModal = document.getElementById('decisionModal');
  decisionModal.addEventListener('shown.bs.modal', function() {
    decisionModal.setAttribute('aria-hidden', 'false');
    document.getElementById('chooseAdvance').focus();
  });
  decisionModal.addEventListener('hidden.bs.modal', function() {
    decisionModal.setAttribute('aria-hidden', 'true');
    document.getElementById('showQuestion').focus();
  });

  const settingsModal = document.getElementById('settingsModal');
  settingsModal.addEventListener('shown.bs.modal', function() {
    settingsModal.setAttribute('aria-hidden', 'false');
    document.getElementById('resetValues').focus();
  });
  settingsModal.addEventListener('hidden.bs.modal', function() {
    settingsModal.setAttribute('aria-hidden', 'true');
    document.getElementById('settingsButton').focus();
  });

  const gameplayModal = document.getElementById('gameplayModal');
  gameplayModal.addEventListener('shown.bs.modal', function() {
    gameplayModal.setAttribute('aria-hidden', 'false');
    gameplayModal.querySelector('.modal-body').focus();
  });
  gameplayModal.addEventListener('hidden.bs.modal', function() {
    gameplayModal.setAttribute('aria-hidden', 'true');
    document.getElementById('gameplayButton').focus();
  });

  const imageModal = document.getElementById('imageModal');
  imageModal.addEventListener('shown.bs.modal', function() {
    imageModal.setAttribute('aria-hidden', 'false');
    document.getElementById('modalImage').focus();
  });
  imageModal.addEventListener('hidden.bs.modal', function() {
    imageModal.setAttribute('aria-hidden', 'true');
    if (document.querySelector('.question-img-container')) {
      document.querySelector('.question-img-container').focus();
    }
  });
});
