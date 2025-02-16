document.addEventListener("DOMContentLoaded", () => {

    let initialScore = localStorage.getItem("initialScore") || 200;
    initialScore = Number(initialScore);
  
    let team1Score = initialScore;
    let team2Score = initialScore;
    let currentTeam = 1;
    let gameOver = false;
  
    const team1ScoreEl = document.getElementById("team1Score");
    const team2ScoreEl = document.getElementById("team2Score");
    const currentTurnEl = document.getElementById("currentTurn");
    const team1Box = document.getElementById("team1Box");
    const team2Box = document.getElementById("team2Box");
  
    const container = document.querySelector(".grid-container");
    container.style.position = "relative";
  
    const reactionDisplay = document.createElement("div");
    reactionDisplay.id = "reactionDisplay";
    reactionDisplay.style.position = "absolute";
    reactionDisplay.style.top = "50%";
    reactionDisplay.style.left = "50%";
    reactionDisplay.style.transform = "translate(-50%, -50%)";
    reactionDisplay.style.fontSize = "2.5em";
    reactionDisplay.style.fontWeight = "bold";
    reactionDisplay.style.pointerEvents = "none";
    reactionDisplay.style.opacity = "0";
    reactionDisplay.style.transition = "opacity 0.3s ease-in-out";
    container.appendChild(reactionDisplay);
  
    const boostReactions = [""];
    const positiveReactions = [""];
    const negativeReactions = [""];
    const zeroReactions = [""];
  
    function updateScoreboard() {
      team1ScoreEl.textContent = team1Score;
      team2ScoreEl.textContent = team2Score;
      currentTurnEl.textContent = currentTeam === 1 ? "تيم 1" : "تيم 2";
      if (currentTeam === 1) {
        team1Box.classList.add("active");
        team2Box.classList.remove("active");
      } else {
        team2Box.classList.add("active");
        team1Box.classList.remove("active");
      }
    }
  
    function celebrateWin(winningTeam) {
      const overlay = document.createElement("div");
      overlay.id = "celebrationOverlay";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.display = "flex";
      overlay.style.justifyContent = "center";
      overlay.style.alignItems = "center";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      overlay.style.zIndex = "10000";
  
      const banner = document.createElement("div");
      banner.style.fontSize = "3em";
      banner.style.fontWeight = "bold";
      if (winningTeam === "team1") {
        banner.style.color = "blue";
        banner.textContent = "مبروووووك ازرق";
      } else {
        banner.style.color = "red";
        banner.textContent = "مبروووووك احمر";
      }
      overlay.appendChild(banner);
      document.body.appendChild(overlay);
  
      const confettiContainer = document.createElement("div");
      confettiContainer.id = "confettiContainer";
      confettiContainer.style.position = "fixed";
      confettiContainer.style.top = "0";
      confettiContainer.style.left = "0";
      confettiContainer.style.width = "100%";
      confettiContainer.style.height = "100%";
      confettiContainer.style.pointerEvents = "none";
      confettiContainer.style.zIndex = "9999";
      document.body.appendChild(confettiContainer);
  
      const colors = ["#FFC107", "#FF5722", "#4CAF50", "#2196F3", "#9C27B0"];
      const confettiCount = 150;
      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");
        confetti.style.position = "absolute";
        confetti.style.width = "8px";
        confetti.style.height = "8px";
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.top = "-10px";
        confetti.style.left = Math.random() * 100 + "%";
        confetti.style.opacity = Math.random() + 0.5;
        confetti.style.transform = "rotate(" + (Math.random() * 360) + "deg)";
        confettiContainer.appendChild(confetti);
  
        const fallDuration = Math.random() * 3 + 2;
        confetti.style.transition = "transform " + fallDuration + "s linear, top " + fallDuration + "s linear";
        setTimeout(() => {
          confetti.style.top = "100%";
          confetti.style.transform += " rotate(" + (Math.random() * 360) + "deg)";
        }, 50);
      }
      setTimeout(() => {
        overlay.remove();
        confettiContainer.remove();
      }, 9000);
    }
  

    const images = [
      "images/snake.png",
      "images/tortoise.png",
      "images/bat.png",
      "images/camel-head.png",
      "images/cat.png",
      "images/panda.png",
      "images/gorilla.png",
      "images/cow.png",
      "images/dinosaur-rex.png",
      "images/duck.png",
      "images/elephant.png",
      "images/horse-head.png",
      "images/frog.png",
      "images/snail.png",
      "images/mite-alt.png",
      "images/rooster.png",
      "images/rabbit.png",
      "images/dolphin.png",
      "images/tiger-head.png",
      "images/labrador-head.png",
      "images/gamepad.png",
      "images/coffee-mug.png",
      "images/halt.png",
      "images/hamburger.png",
      "images/hearts.png",
      "images/flame.png",
      "images/light-bulb.png",
      "images/open-book.png",
      "images/checkered-flag.png",
      "images/pencil.png",
      "images/phone.png",
      "images/photo-camera.png",
      "images/pistol-gun.png",
      "images/img5.png",
      "images/img5.png",
      "images/img5.png",
      "images/img5.png",
      "images/race-car.png",
      "images/smartphone.png",
      "images/full-pizza.png",
      "images/blender.png",
      "images/soccer-ball.png",
      "images/trophy.png",
      "images/img5.png",
      "images/img5.png",
      "images/img5.png",
      "images/img5.png",
      "images/alarm-clock.png",
      "images/round-star.png",
      "images/chess-queen.png",
      "images/a.png",
      "images/b.png",
      "images/c.png",
      "images/r.png",
      "images/r.png",
      "images/r.png",
      "images/r.png",
      "images/d.png",
      "images/e.png",
      "images/f.png",
      "images/g.png",
      "images/h.png",
      "images/k.png",
      "images/l.png",
      "images/m.png",
      "images/n.png",
      "images/r.png",
      "images/s.png",
      "images/t.png",
      "images/w.png",
      "images/1.png",
      "images/2.png",
      "images/3.png",
      "images/4.png",
      "images/5.png",
      "images/6.png",
      "images/7.png",
      "images/8.png",
      "images/9.png",
      "images/10.png",
      "images/telegram.png",
      "images/twitch.png",
      "images/discord.png",
      "images/application.png",
      "images/twitter.png",
      "images/tiktok.png",
      "images/social (3).png",
      "images/social (2).png",
      "images/social (1).png",
      "images/social.png",
      

    ];
  
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  
    const totalCards = 90;
    let cardList = [];
 
    cardList.push({ value: 35, type: "normal" });
    cardList.push({ value: -35, type: "normal" });
    for (let i = 0; i < 2; i++) {
      cardList.push({ value: 25, type: "normal" });
    }
    for (let i = 0; i < 2; i++) {
      cardList.push({ value: -25, type: "normal" });
    }
    for (let i = 0; i < 4; i++) {
      cardList.push({ value: 15, type: "normal" });
    }
    for (let i = 0; i < 4; i++) {
      cardList.push({ value: -15, type: "normal" });
    }
 
    for (let i = 0; i < 5; i++) {
      const boostValue = Math.floor(Math.random() * 6) + 20;
      cardList.push({ value: boostValue, type: "boost" });
    }

    const usedCards = cardList.length;
    const remainingCards = totalCards - usedCards;
    for (let i = 0; i < remainingCards; i++) {
      const num = Math.floor(Math.random() * 15);
      let value = num;
      if (num !== 0) {
        const sign = Math.random() < 0.5 ? 1 : -1;
        value = num * sign;
      }
      cardList.push({ value: value, type: "normal" });
    }
    cardList = shuffle(cardList);
  
    for (let i = 0; i < totalCards; i++) {
      const row = Math.floor(i / 10) + 1;
      const col = (i % 10) + 1;
  
      if ((row === 4 || row === 5 || row === 6) && (col >= 4 && col <= 7)) {
        const placeholder = document.createElement("div");
        placeholder.classList.add("empty-card");
        container.appendChild(placeholder);
        continue;
      }
  
      const cardData = cardList[i];
      const card = document.createElement("div");
      card.classList.add("gold-card");
      card.dataset.value = cardData.value;
      card.dataset.type = cardData.type;
  
      const imgElement = document.createElement("img");
      imgElement.src = images[i % images.length];
      imgElement.alt = "صورة البطاقة";
      card.appendChild(imgElement);
  
      const progressBarContainer = document.createElement("div");
      progressBarContainer.classList.add("progress-bar-container");
      const progressBar = document.createElement("div");
      progressBar.classList.add("progress-bar");
      progressBarContainer.appendChild(progressBar);
      card.appendChild(progressBarContainer);
  
      let holdTimer;
      card.addEventListener("mousedown", () => {
        if (gameOver) return;
        progressBar.style.transition = "width 0.3s linear";
        progressBar.offsetWidth;
        progressBar.style.width = "100%";
        holdTimer = setTimeout(() => {
          revealCard(card);
        }, 5000);
      });
      card.addEventListener("mouseup", () => {
        clearTimeout(holdTimer);
        progressBar.style.transition = "";
        progressBar.style.width = "0%";
      });
      card.addEventListener("mouseleave", () => {
        clearTimeout(holdTimer);
        progressBar.style.transition = "";
        progressBar.style.width = "0%";
      });
      card.addEventListener("click", () => {
        if (gameOver) return;
        if (!card.classList.contains("clicked")) {
          revealCard(card);
        }
      });
      container.appendChild(card);
    }
  
    function revealCard(card) {
      if (card.classList.contains("clicked") || gameOver) return;
      card.classList.add("clicked");
      const value = Number(card.dataset.value);
      const type = card.dataset.type;
      card.style.transform = "scale(1.1)";
      card.style.transition = "transform 0.3s ease-in-out";
  
      setTimeout(() => {
        if (type === "boost") {
          card.textContent = '+' + value;
        } else {
          card.textContent = value;
        }
        card.style.transform = "scale(1)";
        let reactionText = "";
        if (type === "boost") {
          reactionText = boostReactions[Math.floor(Math.random() * boostReactions.length)];
        } else if (value > 0) {
          reactionText = positiveReactions[Math.floor(Math.random() * positiveReactions.length)];
        } else if (value < 0) {
          reactionText = negativeReactions[Math.floor(Math.random() * negativeReactions.length)];
        } else {
          reactionText = zeroReactions[Math.floor(Math.random() * zeroReactions.length)];
        }
        reactionDisplay.textContent = reactionText;
        reactionDisplay.style.opacity = "1";
        setTimeout(() => {
          reactionDisplay.style.opacity = "0";
          reactionDisplay.textContent = "";
        }, 2000);
  
        if (type === "boost") {
          card.style.backgroundColor = "rgba(0, 255, 0, 0.2)";
          card.style.borderColor = "darkgreen";
          card.style.color = "white";
          card.style.boxShadow = "0 0 15px 5px rgba(0, 255, 0, 0.5)";
        }
      }, 200);
  
      const progressBarContainer = card.querySelector(".progress-bar-container");
      if (progressBarContainer) {
        progressBarContainer.remove();
      }
  
      if (type === "boost") {
        if (currentTeam === 1) {
          team1Score += value;
        } else {
          team2Score += value;
        }
      } else {
        if (currentTeam === 1) {
          if (value > 0) {
            team2Score -= value;
          } else {
            team1Score += value;
          }
        } else {
          if (value > 0) {
            team1Score -= value;
          } else {
            team2Score += value;
          }
        }
      }
  
      updateScoreboard();
  
      if (team1Score <= 0) {
        gameOver = true;
        celebrateWin("team1");
        return;
      } else if (team2Score <= 0) {
        gameOver = true;
        celebrateWin("team2");
        return;
      }
  
      if (type !== "boost") {
        if (currentTeam === 1) {
          card.classList.add("selected", "team1");
        } else {
          card.classList.add("selected", "team2");
        }
      } else {
        card.classList.add("boost-card");
      }
  
      currentTeam = currentTeam === 1 ? 2 : 1;
      updateScoreboard();
    }
  
    updateScoreboard();
  

    createControlMenu();
  });
  
  function createControlMenu() {
    const controlMenu = document.createElement("div");
    controlMenu.id = "controlMenu";
  
    const controlButton = document.createElement("button");
    controlButton.id = "controlButton";
    controlButton.textContent = "الاعدادات";
    controlMenu.appendChild(controlButton);
  
    const controlDropdown = document.createElement("div");
    controlDropdown.id = "controlDropdown";
  

    const restartButton = document.createElement("button");
    restartButton.textContent = "إعادة القيم";
    restartButton.addEventListener("click", () => {
      location.reload();
    });
    controlDropdown.appendChild(restartButton);
  

    const selectScoreButton = document.createElement("button");
    selectScoreButton.textContent = "اختيار البداية";
    controlDropdown.appendChild(selectScoreButton);
  
    const scoreOptionsContainer = document.createElement("div");
    scoreOptionsContainer.id = "scoreOptions";
    [50, 100, 150, 200, 250].forEach(score => {
      const scoreBtn = document.createElement("button");
      scoreBtn.textContent = score;
      scoreBtn.addEventListener("click", () => {
        localStorage.setItem("initialScore", score);
        location.reload();
      });
      scoreOptionsContainer.appendChild(scoreBtn);
    });
    controlDropdown.appendChild(scoreOptionsContainer);
  
    selectScoreButton.addEventListener("click", () => {
      if (scoreOptionsContainer.style.display === "none" || scoreOptionsContainer.style.display === "") {
        scoreOptionsContainer.style.display = "flex";
      } else {
        scoreOptionsContainer.style.display = "none";
      }
    });
  
    controlButton.addEventListener("click", () => {
      if (controlDropdown.style.display === "none" || controlDropdown.style.display === "") {
        controlDropdown.style.display = "block";
      } else {
        controlDropdown.style.display = "none";
      }
    });
  
    controlMenu.appendChild(controlDropdown);
    document.body.appendChild(controlMenu);
  }
  
  