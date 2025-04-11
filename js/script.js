document.addEventListener('DOMContentLoaded', () => {
  const games = [
    {
      title: "لعبة الكلمات",
      image: "./images/wo.png",
      info: "...",
      url: "./WordGame/",
      hasVersion: false  
    },
    {
      title: "سباق المشاهدين",
      image: "./images/rh.png",
      info: "...",
      normalUrl: "./RaceRH1/",
      specialUrl: "./RaceRH/",
      hasVersion: true
    },
    {
      title: "مربعات الحظ",
      image: "./images/lu.png",
      info: "...",
      url: "./LuckySqares/",
      hasVersion: false
    },
    {
      title: "خلية الحروف",
      image: "./images/hrof.png", 
      info: "...",
      comingSoon: true
    }
  ];

  const gamesGrid = document.getElementById('games-grid');
  
  games.forEach(game => {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';

    // إنشاء محتوى البطاقة مع التحقق من حالة comingSoon أولاً
    gameCard.innerHTML = `
      <img src="${game.image}" alt="${game.title}" class="game-image">
      <div class="game-content">
        <h3 class="game-title">${game.title}</h3>
        <div class="game-actions">
          ${
            game.comingSoon 
            ? '<button class="game-btn coming-soon-btn" disabled>قريبا</button>' 
            : (game.hasVersion ? 
                '<button class="game-btn play-btn" data-game="version">العب</button>' : 
                '<button class="game-btn play-btn" data-game="play">العب</button>')
          }
          <button class="game-btn info-btn" data-game="info">شرح اللعبة</button>
        </div>
      </div>
    `;


    if (!game.comingSoon) {
      gameCard.querySelector('.play-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if(game.hasVersion) {
          showVersionModal(game);
        } else {
          window.location.href = game.url;
        }
      });
    }

    gameCard.querySelector('.info-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      showGameInfo(game);
    });

    gamesGrid.appendChild(gameCard);
  });

  function showGameInfo(game) {
    modalTitle.textContent = game.title;
    modalText.textContent = game.info;
    modalPlay.style.display = (game.hasVersion || game.comingSoon) ? 'none' : 'block';
    modalPlay.onclick = () => {
      if (!game.comingSoon) window.location.href = game.url;
    };
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
});
