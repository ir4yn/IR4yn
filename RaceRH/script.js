let lifelineCount = 4;
let currentUser = null;
let displayUsername = null;
let answeredQuestionsForRain = {};

const firebaseConfig = {
  apiKey: "AIzaSyA6I51qJmqVZQT1oGIyi0KXQIQmE8SNreI",
  authDomain: "rh10-9a901.firebaseapp.com",
  databaseURL: "https://rh10-9a901-default-rtdb.firebaseio.com",
  projectId: "rh10-9a901",
  storageBucket: "rh10-9a901.firebasestorage.app",
  messagingSenderId: "214151676996",
  appId: "1:214151676996:web:cea6e89de48274d857e811"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let gameState = {
  bluePosition: 1,
  redPosition: 1,
  questions: {},
  blueLifelines: Array(lifelineCount).fill(true),
  redLifelines: Array(lifelineCount).fill(true)
};
let activeStage = 1;

function checkWin(team) {
  if (gameState[`${team}Position`] >= 11) {
    alert(`مبروووووووووووك ${team === 'blue' ? 'أزرق' : 'أحمر'}!`);
    $('#blueAdvance, #redAdvance').prop('disabled', true);
    $('#resetGame').show();
    return true;
  }
  return false;
}

function resetGame() {
  gameState.bluePosition = 1;
  gameState.redPosition = 1;
  activeStage = 1;
  gameState.blueLifelines = Array(lifelineCount).fill(true);
  gameState.redLifelines = Array(lifelineCount).fill(true);
  updateUI();
  updateLifelinesUI();
  $('#blueAdvance, #redAdvance').prop('disabled', false);
  $('#resetGame').hide();
  $('#questionDisplay').empty();
  $('#answerDisplay').empty();
  $('#chatWinner').empty();
  answeredQuestionsForRain = {};
}

function initStages() {
  const container = $('#stagesContainer');
  container.empty();
  for (let i = 1; i <= 10; i++) {
    container.append(
      `<div class="stage" data-stage="${i}">
         <div class="stage-category">الفئة ${i}</div>
         <div class="questions-remaining" data-stage="${i}">0 </div>
         <div class="stage-rect">
           <div class="icon-box" data-stage="${i}"></div>
         </div>
         <div class="stage-icon">
           <img src="images/default-icon-${i}.png" alt="أيقونة المرحلة ${i}" class="img-fluid">
         </div>
       </div>`
    );
  }
}

function updateQuestionCounts() {
  for (let stage = 1; stage <= 10; stage++) {
    let count = 0;
    if (gameState.questions && gameState.questions[stage]) {
      if (currentUser === "راين") {
        let stageQuestions = gameState.questions[stage];
        count = Object.keys(stageQuestions).filter(qid => {
          return !answeredQuestionsForRain[stage] || !answeredQuestionsForRain[stage].includes(qid);
        }).length;
      } else {
        count = Object.keys(gameState.questions[stage]).length;
      }
    }
    $(`.stage[data-stage="${stage}"] .questions-remaining`).text(`${count}  `);
  }
}

function updateUI() {
  const stageElements = $('.stage');
  if (stageElements.length > 0) {
    const stageWidth = 120, stageHeight = 150;
    const circleWidth = 50, circleHeight = 50;
    const offsetX = (stageWidth - circleWidth) / 2;
    let blueStageElem = stageElements.filter(function() {
      return $(this).data('stage') === gameState.bluePosition;
    });
    if (blueStageElem.length) {
      let pos = blueStageElem.position();
      $('#blueCircle').css({ top: pos.top + 10, left: pos.left + offsetX });
    }
    let redStageElem = stageElements.filter(function() {
      return $(this).data('stage') === gameState.redPosition;
    });
    if (redStageElem.length) {
      let pos = redStageElem.position();
      $('#redCircle').css({ top: pos.top + stageHeight - circleHeight - 10, left: pos.left + offsetX });
    }
  }
  $('.icon-box').each(function() {
    const stage = $(this).data('stage');
    let defaultImage = `images/default-stage-${stage}.png`;
    $(this).find('img').attr('src', defaultImage);
  });
}

function initLifelines() {
  let blueLifelinesContainer = $(`
    <div id="blueLifelines" class="lifelines-container" style="position: absolute; top: 10px; left: 10px; display: flex; flex-direction: column; gap: 10px;"></div>
  `);
  for (let i = 1; i <= lifelineCount; i++) {
    let lifelineItem = $(`
      <div class="lifeline-item">
        <input type="text" class="lifeline-input blue-input" placeholder="-" />
        <button class="lifeline-button blue-lifeline" data-team="blue" data-index="${i}"> ${i}</button>
      </div>
    `);
    blueLifelinesContainer.append(lifelineItem);
  }
  let redLifelinesContainer = $(`
    <div id="redLifelines" class="lifelines-container" style="position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column; gap: 10px;"></div>
  `);
  for (let i = 1; i <= lifelineCount; i++) {
    let lifelineItem = $(`
      <div class="lifeline-item">
        <button class="lifeline-button red-lifeline" data-team="red" data-index="${i}"> ${i}</button>
        <input type="text" class="lifeline-input red-input" placeholder="-" />
      </div>
    `);
    redLifelinesContainer.append(lifelineItem);
  }
  $('#gameContainer').prepend(blueLifelinesContainer, redLifelinesContainer);
}

function updateLifelinesUI() {
  $('#blueLifelines .lifeline-item').each(function() {
    let $button = $(this).find('.lifeline-button');
    let index = $button.data('index');
    if (!gameState.blueLifelines[index - 1]) {
      $button.text(index).addClass('used');
      $(this).find('.lifeline-input').addClass('used');
    } else {
      $button.text(index).removeClass('used');
      $(this).find('.lifeline-input').removeClass('used');
    }
  });
  $('#redLifelines .lifeline-item').each(function() {
    let $button = $(this).find('.lifeline-button');
    let index = $button.data('index');
    if (!gameState.redLifelines[index - 1]) {
      $button.text(index).addClass('used');
      $(this).find('.lifeline-input').addClass('used');
    } else {
      $button.text(index).removeClass('used');
      $(this).find('.lifeline-input').removeClass('used');
    }
  });
}

$(document).on('click', '.lifeline-button', function() {
  let team = $(this).data('team');
  let index = $(this).data('index');
  if (team === 'blue') {
    gameState.blueLifelines[index - 1] = !gameState.blueLifelines[index - 1];
  } else if (team === 'red') {
    gameState.redLifelines[index - 1] = !gameState.redLifelines[index - 1];
  }
  updateLifelinesUI();
});

function handleAnswer(team, option) {
  let opponent = (team === 'blue') ? 'red' : 'blue';
  if (option === "advance") {
    gameState[`${team}Position`]++;
    activeStage = gameState[`${team}Position`];
  } else if (option === "push") {
    if (gameState[`${opponent}Position`] > 1) {
      gameState[`${opponent}Position`]--;
      activeStage = gameState[`${opponent}Position`];
    } else {
      gameState[`${team}Position`]++;
      activeStage = gameState[`${team}Position`];
    }
  }
  updateUI();
  $('#questionDisplay').empty();
  $('#answerDisplay').empty();
  $('#chatWinner').empty();
  checkWin(team);
}

// معالجة حدث الإجابة من الأزرار اليدوية
$('#blueAdvance').click(function() {
  $('#decisionModal').data('answeringTeam', 'blue');
  new bootstrap.Modal(document.getElementById('decisionModal')).show();
});

$('#redAdvance').click(function() {
  $('#decisionModal').data('answeringTeam', 'red');
  new bootstrap.Modal(document.getElementById('decisionModal')).show();
});

$('#chooseAdvance').click(function() {
  let team = $('#decisionModal').data('answeringTeam');
  handleAnswer(team, "advance");
});

$('#choosePush').click(function() {
  let team = $('#decisionModal').data('answeringTeam');
  handleAnswer(team, "push");
});

// عرض السؤال وتفعيل مستمع تويتش لإلتقاط الإجابة من الدردشة
$('#showQuestion').click(() => {
  if (activeStage) {
    let stageQuestions = gameState.questions[activeStage];
    if (stageQuestions) {
      let keys = Object.keys(stageQuestions);
      if (currentUser === "راين") {
        keys = keys.filter(qid => {
          return !answeredQuestionsForRain[activeStage] || !answeredQuestionsForRain[activeStage].includes(qid);
        });
      }
      if (keys.length > 0) {
        let questionId = keys[0];
        let questionData = stageQuestions[questionId];
        window.currentQuestionId = questionId;
        window.currentQuestionData = questionData;
        let categoryName = $(`.stage[data-stage="${activeStage}"] .stage-category`).text();
        $('#questionDisplay').html(
          `<h3>${categoryName}</h3>
          <div class="question-content">
            <p>${questionData.text}</p>
            ${questionData.image ? `<div class="question-img-container"><img src="${questionData.image}" class="img-fluid"></div>` : '' }
          </div>`
        );
        // إظهار زر الإجابة في حال أردت السماح بخيار يدوي إضافي
        $('#showAnswerButton').prop('disabled', false).show();
      } else {
        alert("لا يوجد سؤال في هذه المرحلة.");
      }
    } else {
      alert("لا يوجد سؤال في هذه المرحلة.");
    }
  } else {
    alert("انتظر إجابة أحد الفرق أولاً.");
  }
});

// خيار الإجابة اليدوية (يُترك فقط كاحتياطي)
$('#showAnswerButton').click(function() {
  if (!window.currentQuestionData) {
    alert("لا يوجد سؤال معروض.");
    return;
  }
  if ($('#questionDisplay').find('.answer-content').length > 0) {
    return;
  }
  $('#answerDisplay').html(
    `<div class="answer-content">
       <p><strong>الاجابة:</strong> ${window.currentQuestionData.answer}</p>
     </div>`
  );
  $(this).prop('disabled', true);
  if(currentUser === "راين") {
    if (!answeredQuestionsForRain[activeStage]) {
      answeredQuestionsForRain[activeStage] = [];
    }
    answeredQuestionsForRain[activeStage].push(window.currentQuestionId);
  } else {
    database.ref('questions/' + currentUser + '/' + activeStage + '/' + window.currentQuestionId).remove();
  }
  window.currentQuestionId = null;
  window.currentQuestionData = null;
  updateQuestionCounts();
});

// إعادة تعيين اللعبة
$('#resetGame').click(() => {
  resetGame();
});

// تغيير عدد المساعدات
$('#setLifelineCount').click(function() {
  let newCount = parseInt($('#lifelineInput').val());
  if (isNaN(newCount) || newCount < 1) {
    alert("يرجى إدخال رقم صحيح للمساعدات.");
    return;
  }
  lifelineCount = newCount;
  gameState.blueLifelines = Array(lifelineCount).fill(true);
  gameState.redLifelines = Array(lifelineCount).fill(true);
  $('#blueLifelines, #redLifelines').remove();
  initLifelines();
  updateLifelinesUI();
});

$('#settingsButton').click(function() {
  new bootstrap.Modal(document.getElementById('settingsModal')).show();
});

$('#gameplayButton').click(function() {
  new bootstrap.Modal(document.getElementById('gameplayModal')).show();
});

$('#startGameBtn').click(function() {
  currentUser = $('#usernameInput').val().trim();
  if (!currentUser) {
    alert("يرجى إدخال اسم المستخدم.");
    return;
  }
  if (currentUser === "راين") {
    let inputName = prompt("أدخل اسم المستخدم الخاص بك:");
    if(inputName && inputName.trim() !== "") {
      displayUsername = inputName.trim();
    } else {
      alert("يجب إدخال اسم مستخدم صالح.");
      return;
    }
  } else {
    displayUsername = currentUser;
  }
  database.ref('questions/' + currentUser).once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        $('#userOverlay').hide();
        $('#gameContainer').show();
        initStages();
        loadStageConfigurations();
        updateUI();
        initLifelines();
        updateLifelinesUI();
        database.ref('questions/' + currentUser).on('value', (snapshot) => {
          gameState.questions = snapshot.val() || {};
          updateUI();
          updateQuestionCounts();
        });
      } else {
        alert("لا يوجد مستخدم");
      }
    })
    .catch((error) => {
      console.error("Error checking user: ", error);
      alert("حدث خطأ أثناء التحقق من المستخدم.");
    });
});

function loadStageConfigurations() {
  if (!currentUser) return;
  database.ref('stages/' + currentUser).on('value', snapshot => {
    const stagesData = snapshot.val();
    if (stagesData) {
      for (let stage in stagesData) {
        const config = stagesData[stage];
        $(`.stage[data-stage="${stage}"] .stage-category`)
          .text(config.category || `الفئة ${stage}`);
        if (config.icon) {
          $(`.stage[data-stage="${stage}"] .stage-icon img`)
            .attr('src', config.icon);
        }
      }
    }
  });
}

$(document).on('click', '.question-img-container', function() {
  const imgSrc = $(this).find('img').attr('src');
  $('#modalImage').attr('src', imgSrc);
  new bootstrap.Modal(document.getElementById('imageModal')).show();
});

/* -------------------------------------------
   تكامل تويتش: التوصيل واستقبال رسائل الدردشة
-------------------------------------------- */

// تأكد من استعراض السؤال قبل الاستماع للدردشة
function initTwitchChatListener() {
  const client = new tmi.Client({
    connection: {
      secure: true,
      reconnect: true
    },
    channels: ['lr4yn', 'oos8', 'realhero1'] // ضع أسماء القنوات المطلوبة هنا
  });
  

  client.connect().catch(console.error);

  client.on('message', (channel, tags, message, self) => {
    if (self) return;
    // إذا لم يتم عرض سؤال حالياً، لا نفعل شيء
    if (!window.currentQuestionData) return;

    const correctAnswer = window.currentQuestionData.answer;
    if (message.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
      // عرض الإجابة تلقائيًا مع اسم المجيب
      $('#answerDisplay').html(
        `<div class="answer-content">
           <p><strong>الاجابة:</strong> ${window.currentQuestionData.answer}</p>
           <p><strong></strong> ${tags['display-name']}</p>
         </div>`
      );
      // عرض اسم الفائز في الركن الأيسر السفلي
      $('#chatWinner').html(`<p>: ${tags['display-name']}</p>`);
      // حذف السؤال من قاعدة بيانات Firebase
      if (currentUser !== "راين") {
        database.ref('questions/' + currentUser + '/' + activeStage + '/' + window.currentQuestionId).remove();
      }
      // تنظيف المتغيرات الخاصة بالسؤال
      window.currentQuestionId = null;
      window.currentQuestionData = null;
      updateQuestionCounts();
    }
  });
}

// بدء مستمع تويتش عند تحميل اللعبة
initTwitchChatListener();
