import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDcozDOjiCrpgHnUdWvaDrYBjHAwuVu0YM",
  authDomain: "rayan-cd28d.firebaseapp.com",
  projectId: "rayan-cd28d",
  storageBucket: "rayan-cd28d.firebasestorage.app",
  messagingSenderId: "106121481684",
  appId: "1:106121481684:web:2a53fbf782f3d6a397da41",
  measurementId: "G-0E67GD86KF"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

let catalogName, numPlayers, maxPlayersAllowed, playersPerTeam;
let redTeam = [], blueTeam = [];
let remainingRed = [], remainingBlue = [];
let gameCatalog = []; 
let currentProduct = null;
let currentMatchup = null;
let currentQuestionIndex = 0; 
let totalQuestions = 0;    
let redScore = 0, blueScore = 0;
let currentRound = 0;        

document.getElementById("setupNextBtn").addEventListener("click", setupStageNext);
function setupStageNext(){
  catalogName = document.getElementById("catalogName").value.trim();
  let numPlayersInput = parseInt(document.getElementById("numPlayers").value);
  if(!catalogName){
    alert("الرجاء إدخال اسم الكتالوج");
    return;
  }
  if(isNaN(numPlayersInput) || numPlayersInput <= 0){
    alert("الرجاء إدخال عدد صحيح من اللاعبين");
    return;
  }
  
  const catalogRef = ref(database, 'catalogs/' + catalogName);
  get(catalogRef)
    .then(snapshot => {
      let catalogData = snapshot.val();
      if(!catalogData){
        alert("الكتالوج غير موجود أو فارغ");
        return;
      }

      gameCatalog = Object.values(catalogData);
      
      maxPlayersAllowed = gameCatalog.length * 2;
      if(numPlayersInput > maxPlayersAllowed){
        alert("عدد اللاعبين المدخل أكبر من العدد المسموح به (أقصى: " + maxPlayersAllowed + ")");
        return;
      }
      if(numPlayersInput % 2 !== 0){
        alert("يجب أن يكون عدد اللاعبين زوجياً");
        return;
      }
      numPlayers = numPlayersInput;
      playersPerTeam = numPlayers / 2;
      
      document.getElementById("setupStage").classList.add("hidden");
      document.getElementById("playersStage").classList.remove("hidden");
      document.getElementById("playersPerTeam").innerText = playersPerTeam;
      
   
      let redContainer = document.getElementById("redPlayersInputs");
      let blueContainer = document.getElementById("bluePlayersInputs");
      redContainer.innerHTML = "";
      blueContainer.innerHTML = "";
      for(let i = 0; i < playersPerTeam; i++){
        let inputRed = document.createElement("input");
        inputRed.type = "text";
        inputRed.placeholder = "   حط اسم لاعب من التيم الاحمر " + (i+1);
        redContainer.appendChild(inputRed);
        
        let inputBlue = document.createElement("input");
        inputBlue.type = "text";
        inputBlue.placeholder = "حط اسم لاعب من التيم الازرق  " + (i+1);
        blueContainer.appendChild(inputBlue);
      }
    })
    .catch(error => {
      console.error(error);
      alert("حدث خطأ أثناء تحميل الكتالوج");
    });
}

document.getElementById("playersNextBtn").addEventListener("click", playersStageNext);
function playersStageNext(){
  let redInputs = document.querySelectorAll("#redPlayersInputs input");
  let blueInputs = document.querySelectorAll("#bluePlayersInputs input");
  redTeam = [];
  blueTeam = [];
  for(let input of redInputs){
    let name = input.value.trim();
    if(!name){
      alert("يجب ملء جميع أسماء لاعبي التيم الأحمر");
      return;
    }
    redTeam.push(name);
  }
  for(let input of blueInputs){
    let name = input.value.trim();
    if(!name){
      alert("يجب ملء جميع أسماء لاعبي التيم الأزرق");
      return;
    }
    blueTeam.push(name);
  }

  if(new Set(redTeam).size !== redTeam.length){
    alert("يجب ألا تتكرر أسماء لاعبي التيم الأحمر");
    return;
  }
  if(new Set(blueTeam).size !== blueTeam.length){
    alert("يجب ألا تتكرر أسماء لاعبي التيم الأزرق");
    return;
  }
  let allNames = redTeam.concat(blueTeam);
  if(new Set(allNames).size !== allNames.length){
    alert("يجب ألا تتكرر الأسماء بين التيمين");
    return;
  }

  remainingRed = redTeam.slice();
  remainingBlue = blueTeam.slice();
 
  document.getElementById("playersStage").classList.add("hidden");
  document.getElementById("matchupStage").classList.remove("hidden");
}

document.getElementById("selectMatchupBtn").addEventListener("click", selectMatchup);
function selectMatchup(){
  if(remainingRed.length === 0 || remainingBlue.length === 0){
    alert("لا يوجد لاعبين");
    return;
  }
  let redIndex = Math.floor(Math.random() * remainingRed.length);
  let blueIndex = Math.floor(Math.random() * remainingBlue.length);
  let redPlayer = remainingRed[redIndex];
  let bluePlayer = remainingBlue[blueIndex];
  currentMatchup = { red: redPlayer, blue: bluePlayer };
  document.getElementById("matchupDisplay").innerHTML =
    `<p>الخصم: <strong>${redPlayer} (أحمر) vs ${bluePlayer} (أزرق)</strong></p>`;
  document.getElementById("startRoundBtn").classList.remove("hidden");
}

document.getElementById("startRoundBtn").addEventListener("click", startRound);
function startRound(){
  
  remainingRed = remainingRed.filter(name => name !== currentMatchup.red);
  remainingBlue = remainingBlue.filter(name => name !== currentMatchup.blue);
  
  document.getElementById("matchupStage").classList.add("hidden");
  document.getElementById("gameStage").classList.remove("hidden");
  
  document.getElementById("redDisplay").innerText = currentMatchup.red;
  document.getElementById("blueDisplay").innerText = currentMatchup.blue;
  
  currentRound++;
  document.getElementById("roundInfo").innerText = `الجولة ${currentRound} من ${playersPerTeam}`;
  
  let prodIndex = Math.floor(Math.random() * gameCatalog.length);
  currentProduct = gameCatalog.splice(prodIndex, 1)[0];
  
  currentQuestionIndex = 0;
  totalQuestions = 1 + (currentProduct.questions ? currentProduct.questions.length : 0);
  
  document.getElementById("productName").innerText = `الصورة: ${currentProduct.product}`;
  document.getElementById("productImage").src = currentProduct.image;
  
  showQuestion();
}

function showQuestion(){

  document.getElementById("resultContainer").classList.add("hidden");
  document.getElementById("nextQuestionBtn").classList.add("hidden");
  document.getElementById("nextRoundContainer").classList.add("hidden");
  
  
  document.getElementById("questionContainer").classList.remove("hidden");
  let qTextElem = document.getElementById("questionText");
  if(currentQuestionIndex === 0){
    qTextElem.innerText = "خمن السعر";
  } else {
    let qIdx = currentQuestionIndex - 1;
    if(currentProduct.questions && currentProduct.questions[qIdx]){
      qTextElem.innerText = currentProduct.questions[qIdx].question;
    } else {
      qTextElem.innerText = "";
    }
  }

  document.getElementById("answerRedInput").value = "";
  document.getElementById("answerBlueInput").value = "";
}


document.getElementById("confirmAnswerBtn").addEventListener("click", confirmAnswer);
function confirmAnswer(){
  let redAns = parseFloat(document.getElementById("answerRedInput").value);
  let blueAns = parseFloat(document.getElementById("answerBlueInput").value);
  if(isNaN(redAns) || isNaN(blueAns)){
    alert("يرجى إدخال إجابتين صحيحيتين");
    return;
  }
  let correct;
  if(currentQuestionIndex === 0){
    correct = currentProduct.price;
  } else {
    let qIdx = currentQuestionIndex - 1;
    if(currentProduct.questions && currentProduct.questions[qIdx]){
      correct = currentProduct.questions[qIdx].answer;
    } else {
      alert("خطأ في بيانات السؤال");
      return;
    }
  }
  let resultMessage = `الإجابة الصحيحة: ${correct}\n`;
  let diffRed = Math.abs(redAns - correct);
  let diffBlue = Math.abs(blueAns - correct);
  if(diffRed < diffBlue){
    resultMessage += `نقطة لـ ${currentMatchup.red} (أحمر)`;
    redScore++;
  } else if(diffBlue < diffRed){
    resultMessage += `نقطة لـ ${currentMatchup.blue} (أزرق)`;
    blueScore++;
  } else {
    resultMessage += "تعادل ";
  }

  document.getElementById("redScoreDisplay").innerText = redScore;
  document.getElementById("blueScoreDisplay").innerText = blueScore;

  document.getElementById("questionContainer").classList.add("hidden");
  let resultContainer = document.getElementById("resultContainer");
  document.getElementById("resultText").innerText = resultMessage;
  resultContainer.classList.remove("hidden");
  resultContainer.classList.add("slomo");

  setTimeout(() => {
    resultContainer.classList.remove("slomo");
    if(currentQuestionIndex < totalQuestions - 1){
      document.getElementById("nextQuestionBtn").classList.remove("hidden");
    } else {
      document.getElementById("nextRoundContainer").classList.remove("hidden");
    }
  }, 10000);
}


document.getElementById("nextQuestionBtn").addEventListener("click", nextQuestion);
function nextQuestion(){
  currentQuestionIndex++;
  document.getElementById("resultContainer").classList.add("hidden");
  document.getElementById("nextQuestionBtn").classList.add("hidden");
  showQuestion();
}

document.getElementById("nextRoundBtn").addEventListener("click", nextRound);
function nextRound(){
  document.getElementById("nextRoundContainer").classList.add("hidden");

  if(remainingRed.length === 0 || remainingBlue.length === 0 || gameCatalog.length === 0){
    showFinalResult();
  } else {

    currentMatchup = null;
    document.getElementById("gameStage").classList.add("hidden");
    document.getElementById("matchupStage").classList.remove("hidden");

    document.getElementById("matchupDisplay").innerHTML = "";
    document.getElementById("startRoundBtn").classList.add("hidden");
  }
}

function showFinalResult(){
  document.getElementById("gameStage").classList.add("hidden");
  document.getElementById("finalStage").classList.remove("hidden");
  let finalMessage = `التيم الاحمر: ${redScore} نقطة\nالتيم الازرق: ${blueScore} نقطة\n`;
  if(redScore > blueScore){
    finalMessage += "مبروووووك أحمر!";
  } else if(blueScore > redScore){
    finalMessage += "مبروووووك أزرق!";
  } else {
    finalMessage += "تعادل!";
  }
  document.getElementById("finalResultText").innerText = finalMessage;
}

document.getElementById("restartBtn").addEventListener("click", () => location.reload());