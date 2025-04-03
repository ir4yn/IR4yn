document.addEventListener("DOMContentLoaded", () => {
  const lobby = document.getElementById("lobby");
  const gameArea = document.getElementById("gameArea");
  const startGameBtn = document.getElementById("startGameBtn");
  const team1PlayersInput = document.getElementById("team1Players");
  const team2PlayersInput = document.getElementById("team2Players");

  const lobbySettingsBtn = document.getElementById("lobbySettingsBtn");
  const lobbySettingsDropdown = document.getElementById("lobbySettingsDropdown");
  const lobbySelectScoreBtn = document.getElementById("lobbySelectScoreBtn");
  const lobbyScoreOptions = document.getElementById("lobbyScoreOptions");

  if (lobbySettingsBtn) {
    lobbySettingsBtn.addEventListener("click", () => {
      lobbySettingsDropdown.style.display =
        lobbySettingsDropdown.style.display === "none" ||
        lobbySettingsDropdown.style.display === ""
          ? "block"
          : "none";
    });
  }

  if (lobbySelectScoreBtn) {
    lobbySelectScoreBtn.addEventListener("click", () => {
      lobbyScoreOptions.style.display =
        lobbyScoreOptions.style.display === "none" ||
        lobbyScoreOptions.style.display === ""
          ? "flex"
          : "none";
    });
  }

  if (lobbyScoreOptions) {
    lobbyScoreOptions.querySelectorAll(".scoreOption").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const score = e.target.getAttribute("data-score");
        localStorage.setItem("initialScore", score);
        location.reload();
      });
    });
  }

  startGameBtn.addEventListener("click", () => {
    const team1Text = team1PlayersInput.value.trim();
    const team2Text = team2PlayersInput.value.trim();

    let team1Array = team1Text
      ? team1Text.split(/\r?\n/).map((name) => name.trim()).filter((name) => name)
      : [];
    let team2Array = team2Text
      ? team2Text.split(/\r?\n/).map((name) => name.trim()).filter((name) => name)
      : [];

    if (team1Array.length === 0) team1Array = ["أحمر"];
    if (team2Array.length === 0) team2Array = ["أزرق"];

    window.team1Players = team1Array;
    window.team2Players = team2Array;

    window.team1Stats = window.team1Players.map((player) => ({ name: player, score: 0 }));
    window.team2Stats = window.team2Players.map((player) => ({ name: player, score: 0 }));

    lobby.style.display = "none";
    gameArea.style.display = "block";

    startGame();
  });


  function runConfetti() {
    const duration = 10 * 1000; // مدة التأثير 30 ثانية
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 13000,
    };

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
      // إطلاق القصاصات من جهتين
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);
  }

  function startGame() {
    let initialScore = localStorage.getItem("initialScore") || 200;
    initialScore = Number(initialScore);

    let team1Score = initialScore;
    let team2Score = initialScore;
    let currentTeam = 1;
    let gameOver = false;
    let team1Index = 0;
    let team2Index = 0;

    const team1ScoreEl = document.getElementById("team1Score");
    const team2ScoreEl = document.getElementById("team2Score");
    const currentTurnEl = document.getElementById("currentTurn");
    const team1Box = document.getElementById("team1Box");
    const team2Box = document.getElementById("team2Box");
    const container = document.querySelector(".grid-container");

    let reactionDisplay = document.createElement("div");
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

    window.waitingForBoostSecondCard = null;

    container.addEventListener("click", function (e) {
      const target = e.target;
      let card = target.closest(".gold-card");
      if (window.waitingForBoostSecondCard && card && !card.classList.contains("clicked")) {
        handleBoostSecondCard(card);
      }
    });

    function updateScoreboard() {
      team1ScoreEl.textContent = team1Score;
      team2ScoreEl.textContent = team2Score;
      let currentPlayer =
        currentTeam === 1 ? window.team1Players[team1Index] : window.team2Players[team2Index];
      currentTurnEl.textContent = " " + currentPlayer;
      if (currentTeam === 1) {
        team1Box.classList.add("active");
        team2Box.classList.remove("active");
      } else {
        team2Box.classList.add("active");
        team1Box.classList.remove("active");
      }
      updatePlayerLists();
    }

    function updatePlayerLists() {
      const team1PlayerListEl = document.getElementById("team1PlayerList");
      const team2PlayerListEl = document.getElementById("team2PlayerList");
      team1PlayerListEl.innerHTML = "";
      team2PlayerListEl.innerHTML = "";
      window.team1Players.forEach((player, index) => {
        const span = document.createElement("span");
        span.textContent = player;
        span.style.display = "block";
        if (index === team1Index && currentTeam === 1) {
          span.style.fontWeight = "bold";
          span.style.color = "#e74c3c";
        }
        team1PlayerListEl.appendChild(span);
      });
      window.team2Players.forEach((player, index) => {
        const span = document.createElement("span");
        span.textContent = player;
        span.style.display = "block";
        if (index === team2Index && currentTeam === 2) {
          span.style.fontWeight = "bold";
          span.style.color = "#3498db";
        }
        team2PlayerListEl.appendChild(span);
      });
    }

    
    function showFinalOverlay(losingTeam) {
      const winningTeamName = losingTeam === "team1" ? "ازرق" : "احمر";
      const winningTeamColor = losingTeam === "team1" ? "#3498db" : "#e74c3c";

      const finalOverlay = document.createElement("div");
      finalOverlay.id = "finalOverlay";
      finalOverlay.style.position = "fixed";
      finalOverlay.style.top = "0";
      finalOverlay.style.left = "0";
      finalOverlay.style.width = "100%";
      finalOverlay.style.height = "100%";
      finalOverlay.style.backgroundColor = "rgba(0,0,0,0.8)";
      finalOverlay.style.display = "flex";
      finalOverlay.style.flexDirection = "column";
      finalOverlay.style.justifyContent = "center";
      finalOverlay.style.alignItems = "center";
      finalOverlay.style.zIndex = "12000";
      finalOverlay.style.color = "#fff";
      finalOverlay.style.textAlign = "center";
      finalOverlay.style.padding = "20px";
      finalOverlay.style.transition = "opacity 0.9s ease-in-out";
      finalOverlay.style.opacity = "0";
      setTimeout(() => (finalOverlay.style.opacity = "1"), 10);

      const message = document.createElement("h2");
      message.textContent = `مبروووووووووووووك ${winningTeamName}`;
      message.style.fontSize = "3em";
      message.style.color = winningTeamColor;
      message.style.textShadow = `0 0 10px ${winningTeamColor}`;
      message.style.animation = "pulse 1.5s infinite";
      finalOverlay.appendChild(message);

      const resetBtn = document.createElement("button");
      resetBtn.textContent = "إعادة القيم";
      resetBtn.className = "reset-btn";
      finalOverlay.appendChild(resetBtn);

      document.body.appendChild(finalOverlay);

      // تفعيل الاحتفالية بتأثير القصاصات
      runConfetti();

      resetBtn.addEventListener("click", () => {
        finalOverlay.style.opacity = "0";
        setTimeout(() => finalOverlay.remove(), 500);
        if (window.resetGame) {
          window.resetGame(true);
        }
      });
    }

    function celebrateWin(losingTeam) {
      showFinalOverlay(losingTeam);
    }

    function refreshBoard() {
      container.innerHTML = "";
      reactionDisplay = document.createElement("div");
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
      createBoard();
    }

    function createBoard() {
      const images = [
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
        "images/11.png",
        "images/12.png",
        "images/13.png",
        "images/14.png",
        "images/15.png",
        "images/16.png",
        "images/17.png",
        "images/18.png",
        "images/19.png",
        "images/20.png",
        "images/21.png",
        "images/22.png",
        "images/23.png",
        "images/24.png",
        "images/25.png",
        "images/26.png",
        "images/27.png",
        "images/28.png",
        "images/29.png",
        "images/30.png",
        "images/31.png",
        "images/32.png",
        "images/33.png",
        "images/img5.png",
        "images/img5.png",
        "images/img5.png",
        "images/img5.png",
        "images/34.png",
        "images/35.png",
        "images/36.png",
        "images/37.png",
        "images/38.png",
        "images/39.png",
        "images/img5.png",
        "images/img5.png",
        "images/img5.png",
        "images/img5.png",
        "images/40.png",
        "images/41.png",
        "images/42.png",
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
        "images/53.png",
        "images/54.png",
        "images/55.png",
        "images/56.png",
        "images/57.png",
        "images/58.png",
        "images/59.png",
        "images/60.png",
        "images/61.png",
        "images/62.png",
        "images/43.png",
        "images/44.png",
        "images/45.png",
        "images/46.png",
        "images/47.png",
        "images/48.png",
        "images/49.png",
        "images/50.png",
        "images/51.png",
        "images/52.png",
      ];
      let totalCards = 90;
      let cardList = [];

      const boostCount = 5;
      for (let i = 0; i < boostCount; i++) {
        cardList.push({ value: 35, type: "boost" });
      }

      const normalCount = totalCards - boostCount;
      for (let i = 0; i < normalCount; i++) {
        const num = Math.floor(Math.random() * 20) + 1;
        const sign = Math.random() < 0.5 ? -1 : 1;
        const value = num * sign;
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
    }

    function revealCard(card) {
      if (window.waitingForBoostSecondCard) return;
      if (card.classList.contains("clicked") || gameOver) return;
      card.classList.add("clicked");
      const value = Number(card.dataset.value);
      const type = card.dataset.type;
      card.style.transform = "scale(1.1)";
      card.style.transition = "transform 0.3s ease-in-out";

      setTimeout(() => {
        if (type === "boost") {
          card.textContent = "+" + value;
          card.style.backgroundColor = "rgba(0, 255, 0, 0.2)";
          card.style.borderColor = "darkgreen";
          card.style.color = "white";
          card.style.boxShadow = "0 0 15px 5px rgba(0, 255, 0, 0.5)";
        } else {
          card.textContent = value;
        }
        card.style.transform = "scale(1)";
        reactionDisplay.textContent = "";
        reactionDisplay.style.opacity = "1";
        setTimeout(() => {
          reactionDisplay.style.opacity = "0";
        }, 2000);
      }, 200);

      const progressBarContainer = card.querySelector(".progress-bar-container");
      if (progressBarContainer) {
        progressBarContainer.remove();
      }

      if (type === "boost") {
        handleBoostCard(card, value);
        return;
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
        if (currentTeam === 1) {
          window.team1Stats[team1Index].score += value;
        } else {
          window.team2Stats[team2Index].score += value;
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

        card.classList.add("selected", currentTeam === 1 ? "team1" : "team2");

        if (currentTeam === 1) {
          team1Index = (team1Index + 1) % window.team1Players.length;
        } else {
          team2Index = (team2Index + 1) % window.team2Players.length;
        }
        currentTeam = currentTeam === 1 ? 2 : 1;
        updateScoreboard();
      }

      setTimeout(() => {
        const remainingCards = container.querySelectorAll(".gold-card:not(.clicked)");
        if (remainingCards.length === 0) {
          refreshBoard();
        }
      }, 500);
    }

    function handleBoostCard(card, boostValue) {
      const modal = document.createElement("div");
      modal.id = "boostModal";
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.width = "100%";
      modal.style.height = "100%";
      modal.style.background = "rgba(0, 0, 0, 0.8)";
      modal.style.display = "flex";
      modal.style.justifyContent = "center";
      modal.style.alignItems = "center";
      modal.style.zIndex = "10000";
      modal.style.transition = "opacity 0.5s ease-in-out";
      modal.style.opacity = "0";
      setTimeout(() => (modal.style.opacity = "1"), 10);

      const contentContainer = document.createElement("div");
      contentContainer.className = "boost-content";
      contentContainer.style.display = "flex";
      contentContainer.style.gap = "20px";
      contentContainer.style.justifyContent = "center";
      contentContainer.style.flexWrap = "wrap";
      contentContainer.style.padding = "20px";
      contentContainer.style.background = "rgba(255,255,255,0.1)";
      contentContainer.style.borderRadius = "15px";

      function createOptionCard(text) {
        const cardDiv = document.createElement("div");
        cardDiv.className = "boost-card-option";
        cardDiv.textContent = text;
        cardDiv.style.background = "#0A2742"; 
        cardDiv.style.color = "#ffffff";         
        cardDiv.style.padding = "20px";
        cardDiv.style.borderRadius = "10px";
        cardDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
        cardDiv.style.cursor = "pointer";
        cardDiv.style.minWidth = "120px";
        cardDiv.style.textAlign = "center";
        cardDiv.style.fontSize = "1.2em";
        return cardDiv;
      }
      
      const option1 = createOptionCard("أخذ الرقم");
      const option2 = createOptionCard("مربع جديد");
      const option3 = createOptionCard("نرد");

      contentContainer.appendChild(option1);
      contentContainer.appendChild(option2);
      contentContainer.appendChild(option3);

      const instructionBtn = document.createElement("button");
      instructionBtn.textContent = "الشرح";
      instructionBtn.className = "boost-btn instructions-btn";
      instructionBtn.style.marginTop = "15px";
      instructionBtn.style.padding = "10px 20px";
      instructionBtn.style.cursor = "pointer";
      contentContainer.appendChild(instructionBtn);

      modal.appendChild(contentContainer);
      document.body.appendChild(modal);

      instructionBtn.addEventListener("click", () => {
        alert(
          "1. أخذ الرقم: يضيف اللاعب لفريقه 35 نقطة.\n\n" +
          "2. مربع جديد: يختار اللاعب مربع جديد، وإذا كان رقمه موجباً يحصل على 35 + الرقم الموجب، وإذا كان سالباً يحصل على الرقم السالب فقط.\n\n" +
          "3. نرد: إذا حصل اللاعب على رقم أعلى من رقم البوت، يكسب 70 نقطة (35 + 35)، وإذا حصل على رقم أقل أو تعادل، يُخصم منه 35 نقطة."
        );
      });

      option1.addEventListener("click", () => {
        if (currentTeam === 1) {
          team1Score += boostValue;
          window.team1Stats[team1Index].score += boostValue;
        } else {
          team2Score += boostValue;
          window.team2Stats[team2Index].score += boostValue;
        }
        modal.style.opacity = "0";
        setTimeout(() => modal.remove(), 500);
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
        if (currentTeam === 1) {
          team1Index = (team1Index + 1) % window.team1Players.length;
        } else {
          team2Index = (team2Index + 1) % window.team2Players.length;
        }
        currentTeam = currentTeam === 1 ? 2 : 1;
        updateScoreboard();
      });

      option2.addEventListener("click", () => {
        window.waitingForBoostSecondCard = {
          boostValue: boostValue,
          team: currentTeam,
          playerIndex: currentTeam === 1 ? team1Index : team2Index,
        };
        modal.style.opacity = "0";
        setTimeout(() => modal.remove(), 500);
        const secondCardPrompt = document.createElement("div");
        secondCardPrompt.className = "boost-content";
        secondCardPrompt.style.position = "fixed";
        secondCardPrompt.style.top = "50%";
        secondCardPrompt.style.left = "50%";
        secondCardPrompt.style.transform = "translate(-50%, -50%)";
        secondCardPrompt.style.background = "rgba(255, 255, 255, 0.1)";
        secondCardPrompt.style.padding = "20px";
        secondCardPrompt.style.borderRadius = "15px";
        secondCardPrompt.style.color = "#fff";
        secondCardPrompt.style.fontSize = "1.5em";
        secondCardPrompt.style.textAlign = "center";
        secondCardPrompt.textContent = "اختر مربع جديد";
        document.body.appendChild(secondCardPrompt);
        setTimeout(() => {
          secondCardPrompt.style.opacity = "0";
          setTimeout(() => secondCardPrompt.remove(), 500);
        }, 2000);
      });

      option3.addEventListener("click", () => {
        const playerRoll = Math.floor(Math.random() * 8) + 1;
        const botRoll = Math.floor(Math.random() * 8) + 1;

        contentContainer.innerHTML = "";
        const diceResult = document.createElement("p");
        diceResult.style.fontSize = "1.8em";
        diceResult.style.margin = "20px 0";
        diceResult.innerHTML = `رقمك: ${playerRoll}<br>رقم البوت: ${botRoll}`;
        contentContainer.appendChild(diceResult);

        if (playerRoll > botRoll) {
          if (currentTeam === 1) {
            team1Score += boostValue * 2;
            window.team1Stats[team1Index].score += boostValue * 2;
          } else {
            team2Score += boostValue * 2;
            window.team2Stats[team2Index].score += boostValue * 2;
          }
          const winText = document.createElement("p");
          winText.textContent = "فزت! تم تدبيل النقاط";
          winText.style.color = "#28a745";
          contentContainer.appendChild(winText);
        } else {
          if (currentTeam === 1) {
            team1Score -= boostValue;
            window.team1Stats[team1Index].score -= boostValue;
          } else {
            team2Score -= boostValue;
            window.team2Stats[team2Index].score -= boostValue;
          }
          const loseText = document.createElement("p");
          loseText.textContent = "خسرت! تم خصم النقاط";
          loseText.style.color = "#e74c3c";
          contentContainer.appendChild(loseText);
        }

        setTimeout(() => {
          modal.style.opacity = "0";
          setTimeout(() => {
            modal.remove();
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
            if (currentTeam === 1) {
              team1Index = (team1Index + 1) % window.team1Players.length;
            } else {
              team2Index = (team2Index + 1) % window.team2Players.length;
            }
            currentTeam = currentTeam === 1 ? 2 : 1;
            updateScoreboard();
          }, 500);
        }, 2000);
      });
    }

    function handleBoostSecondCard(selectedCard) {
      if (selectedCard.classList.contains("clicked") || gameOver) return;
      selectedCard.classList.add("clicked");
      const secondValue = Number(selectedCard.dataset.value);
      const secondType = selectedCard.dataset.type;
      selectedCard.style.transform = "scale(1.1)";
      selectedCard.style.transition = "transform 0.3s ease-in-out";
      setTimeout(() => {
        selectedCard.textContent =
          secondType === "boost" ? "+" + secondValue : secondValue;
        selectedCard.style.transform = "scale(1)";
      }, 200);
      const pbContainer = selectedCard.querySelector(".progress-bar-container");
      if (pbContainer) pbContainer.remove();

      const boostInfo = window.waitingForBoostSecondCard;
      if (!boostInfo) return;
      const originalBoostValue = boostInfo.boostValue;
      let outcome = 0;
      if (secondValue < 0) {
        outcome = secondValue;
      } else {
        outcome = originalBoostValue + secondValue;
      }
      if (boostInfo.team === 1) {
        team1Score += outcome;
        window.team1Stats[boostInfo.playerIndex].score += outcome;
      } else {
        team2Score += outcome;
        window.team2Stats[boostInfo.playerIndex].score += outcome;
      }
      selectedCard.classList.add(
        "selected",
        boostInfo.team === 1 ? "team1" : "team2"
      );
      window.waitingForBoostSecondCard = null;
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
      if (boostInfo.team === 1) {
        team1Index = (team1Index + 1) % window.team1Players.length;
      } else {
        team2Index = (team2Index + 1) % window.team2Players.length;
      }
      currentTeam = currentTeam === 1 ? 2 : 1;
      updateScoreboard();
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    createBoard();
    updateScoreboard();

    function resetGame(resetIndividualScores) {
      let initialScore = localStorage.getItem("initialScore") || 200;
      initialScore = Number(initialScore);
      team1Score = initialScore;
      team2Score = initialScore;
      currentTeam = 1;
      gameOver = false;
      team1Index = 0;
      team2Index = 0;
      if (resetIndividualScores) {
        window.team1Stats = window.team1Players.map((player) => ({ name: player, score: 0 }));
        window.team2Stats = window.team2Players.map((player) => ({ name: player, score: 0 }));
      }
      container.innerHTML = "";
      reactionDisplay = document.createElement("div");
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
      createBoard();
      updateScoreboard();
    }

    window.resetGame = resetGame;
  }
});
