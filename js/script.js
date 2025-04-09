document.addEventListener('DOMContentLoaded', () => {
  // بيانات الألعاب
  const games = [
    {
      title: "لعبة الكلمات",
      image: "./images/wo.png",
      info: "...",
      url: "./WordGame/",
      hasVersion: false,
      hasCountdown: true,    
      countdownMessage: "سيتم تحديث الكلمات بعد:"
    },
    {
      title: "سباق المشاهدين",
      image: "./images/rh.png",
      info: "...",
      normalUrl: "./RaceRH1/",
      specialUrl: "./RaceRH/",
      hasVersion: true,
      hasCountdown: true,
      countdownMessage: "سيتم تحديث الأسئلة بعد:"
    },
    {
      title: "مربعات الحظ",
      image: "./images/lu.png",
      info: "...",
      url: "./LuckySqares/",
      hasVersion: false,
      hasCountdown: false   
    }
  ];

  const gamesGrid = document.getElementById('games-grid');
  
  games.forEach(game => {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';


    let countdownHtml = '';
    if(game.hasCountdown) {

      const countdownId = "countdown-" + game.title.replace(/\s/g, '-');
      countdownHtml = `<div class="countdown" id="${countdownId}">
                         ${game.countdownMessage} <span class="timer"></span>
                       </div>`;
    }
    
    gameCard.innerHTML = `
      <img src="${game.image}" alt="${game.title}" class="game-image">
      <div class="game-content">
        <h3 class="game-title">${game.title}</h3>
        <div class="game-actions">
          ${game.hasVersion ? 
            '<button class="game-btn play-btn" data-game="version">العب</button>' : 
            '<button class="game-btn play-btn" data-game="play">العب</button>'}
          <button class="game-btn info-btn" data-game="info">شرح اللعبة</button>
        </div>
        ${countdownHtml}
      </div>
    `;

    gameCard.querySelector('.play-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if(game.hasVersion) {
        showVersionModal(game);
      } else {
        window.location.href = game.url;
      }
    });


    gameCard.querySelector('.info-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      showGameInfo(game);
    });

    gamesGrid.appendChild(gameCard);

  
    if(game.hasCountdown) {
      let updateTime = new Date();
      updateTime.setDate(updateTime.getDate() + 14);
      const countdownId = "countdown-" + game.title.replace(/\s/g, '-');
      const timerElement = document.querySelector(`#${countdownId} .timer`);
      startCountdown(updateTime, timerElement);
    }
  });

  function showGameInfo(game) {
    modalTitle.textContent = game.title;
    modalText.textContent = game.info;
    modalPlay.style.display = game.hasVersion ? 'none' : 'block';
    modalPlay.onclick = () => window.location.href = game.url;
    modal.classList.add('show');
  }


  function showVersionModal(game) {
    modalTitle.textContent = game.title;
    modalText.innerHTML = `
      <div class="version-buttons">
        <button class="version-btn" onclick="window.location.href='${game.normalUrl}'">النسخة العادية</button>
        <button class="version-btn" onclick="window.location.href='${game.specialUrl}'">النسخة الخاصة</button>
      </div>
    `;
    modalPlay.style.display = 'none';
    modal.classList.add('show');
  }


  const modal = document.getElementById('game-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalText = document.getElementById('modal-text');
  const modalPlay = document.getElementById('modal-play');

  document.getElementById('modal-close').addEventListener('click', () => {
    modal.classList.remove('show');
  });

  window.addEventListener('click', (e) => {
    if(e.target === modal) {
      modal.classList.remove('show');
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
      window.location.href = "login.html";
    });
  });

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      firebase.database().ref('users/' + user.uid).once('value')
        .then((snapshot) => {
          const userData = snapshot.val();
          const username = userData && userData.username ? userData.username : user.email;
          document.getElementById('user-email').textContent = username;
        });
    }
  });
  
  function startCountdown(targetDate, element) {
    const countdownInterval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;
      if(diff <= 0) {
        clearInterval(countdownInterval);
        element.innerText = "00 يوم 00 ساعة 00 دقيقة 00 ثانية";
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      element.innerText = `${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`;
    }, 1000);
  }
});
