
    // عدد المساعدات الافتراضي
    let lifelineCount = 4;
    // متغيرات المستخدم
    let currentUser = null;
    let displayUsername = null; // اسم العرض في حالة تسجيل الدخول بـ "راين"
    // سجل للإجابات التي أجاب عنها مستخدم "راين" محلياً
    let answeredQuestionsForRain = {}; 

    // إعداد Firebase
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

    // حالة اللعبة
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
      // إعادة تعيين سجل الإجابات الخاصة بـ "راين"
      answeredQuestionsForRain = {};
    }

    function initStages() {
      const container = $('#stagesContainer');
      container.empty();
      for (let i = 1; i <= 10; i++) {
        container.append(
          `<div class="stage" data-stage="${i}">
            <div class="stage-category">الفئة ${i}</div>
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

    function loadStageConfigurations() {
      if (!currentUser) return; // تأكد من وجود المستخدم قبل التحميل
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
      $('#blueLifelines .lifeline-button').each(function() {
        let index = $(this).data('index');
        if (!gameState.blueLifelines[index - 1]) {
          $(this).text("X").addClass('used');
        } else {
          $(this).text(" " + index).removeClass('used');
        }
      });
      $('#redLifelines .lifeline-button').each(function() {
        let index = $(this).data('index');
        if (!gameState.redLifelines[index - 1]) {
          $(this).text("X").addClass('used');
        } else {
          $(this).text(" " + index).removeClass('used');
        }
      });
    }

    $(document).on('click', '.lifeline-button', function() {
      let team = $(this).data('team');
      let index = $(this).data('index');
      const lifelineLabel = " " + index;
      if (team === 'blue') {
        if (gameState.blueLifelines[index - 1]) {
          gameState.blueLifelines[index - 1] = false;
          $(this).text("X").addClass('used');
        } else {
          gameState.blueLifelines[index - 1] = true;
          $(this).text(lifelineLabel).removeClass('used');
        }
      } else if (team === 'red') {
        if (gameState.redLifelines[index - 1]) {
          gameState.redLifelines[index - 1] = false;
          $(this).text("X").addClass('used');
        } else {
          gameState.redLifelines[index - 1] = true;
          $(this).text(lifelineLabel).removeClass('used');
        }
      }
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
      checkWin(team);
    }

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

    // عند الضغط على "عرض السؤال"
    $('#showQuestion').click(() => {
      if (activeStage) {
        let stageQuestions = gameState.questions[activeStage];
        if (stageQuestions) {
          // الحصول على معرّفات الأسئلة مع تجاهل الأسئلة المجابة محلياً (في حالة "راين")
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
                ${questionData.image ? `<div class="question-img-container"><img src="${questionData.image}" class="img-fluid"></div>` : ''}
              </div>`
            );
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

    // عند الضغط على "إظهار الإجابة"
    $('#showAnswerButton').click(function() {
      if (!window.currentQuestionData) {
        alert("لا يوجد سؤال معروض.");
        return;
      }
      if ($('#questionDisplay').find('.answer-content').length > 0) {
        return;
      }
      $('#questionDisplay').append(
        `<div class="answer-content">
          <p><strong>الاجابة:</strong> ${window.currentQuestionData.answer}</p>
        </div>`
      );
      $(this).prop('disabled', true);
      // إذا كان المستخدم "راين" نقوم بتسجيل الإجابة محلياً بدلاً من حذفها من قاعدة البيانات
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
    });

    $('#resetGame').click(() => {
      resetGame();
    });

    function addLifelineSetter() {
      const lifelineSetterHTML = 
        `<div id="lifelineSetter" class="lifeline-setter">
          <input type="number" id="lifelineInput" value="${lifelineCount}" min="1" class="lifeline-input" placeholder="المساعدات">
          <button id="setLifelineCount" class="lifeline-btn">تأكيد</button>
        </div>`;
      $('#gameContainer').prepend(lifelineSetterHTML);
    }

    $(document).on('click', '#setLifelineCount', function() {
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

    // عند الضغط على زر بدء اللعبة
    $('#startGameBtn').click(function() {
      currentUser = $('#usernameInput').val().trim();
      if (!currentUser) {
        alert("يرجى إدخال اسم المستخدم.");
        return;
      }
      // إذا كان اسم المستخدم "راين" نقوم بطلب إدخال اسم عرض للاعب
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
      // استرجاع الأسئلة من قاعدة البيانات
      database.ref('questions/' + currentUser).once('value')
        .then((snapshot) => {
          if (snapshot.exists()) {
            $('#userOverlay').hide();
            $('#gameContainer').show();
            initStages();
            loadStageConfigurations();
            updateUI();
            initLifelines();
            addLifelineSetter(); 
            updateLifelinesUI();
            database.ref('questions/' + currentUser).on('value', (snapshot) => {
              gameState.questions = snapshot.val() || {};
              updateUI();
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

    $(document).on('click', '.question-img-container', function() {
      const imgSrc = $(this).find('img').attr('src');
      $('#modalImage').attr('src', imgSrc);
      new bootstrap.Modal(document.getElementById('imageModal')).show();
    });

