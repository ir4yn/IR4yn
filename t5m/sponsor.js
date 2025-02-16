import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, push, get, remove } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
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

const productForm = document.getElementById("productForm");
productForm.addEventListener("submit", function(e) {
  e.preventDefault();
  
  const catalogId = document.getElementById("catalogId").value.trim();
  const productName = document.getElementById("productName").value.trim();
  const productPrice = parseFloat(document.getElementById("productPrice").value);
  const productImageInput = document.getElementById("productImage");
  
  if (!catalogId || !productName || isNaN(productPrice) || productImageInput.files.length === 0) {
    alert("يرجى تعبئة جميع الحقول الأساسية بشكل صحيح!");
    return;
  }
  

  const questionElements = document.getElementsByClassName("questionItem");
  let questions = [];
  for (let elem of questionElements) {
    const qText = elem.querySelector(".questionText").value.trim();
    const qAnswer = parseFloat(elem.querySelector(".questionAnswer").value);
    if (qText !== "" && !isNaN(qAnswer)) {
      questions.push({ question: qText, answer: qAnswer });
    }
  }
  

  const reader = new FileReader();
  reader.onload = function(event) {
    const productImageData = event.target.result;
    const product = {
      product: productName,
      price: productPrice,
      image: productImageData,
      questions: questions
    };
    
    const catalogRef = ref(database, 'catalogs/' + catalogId);
    push(catalogRef, product)
      .then(() => {
        alert("تم إضافة المنتج بنجاح!");
        displayCatalog();
        productForm.reset();
        document.getElementById("questionsContainer").innerHTML = "<h3>أسئلة إضافية (مثلاً 3 أسئلة):</h3>";
      })
      .catch((error) => {
        console.error(error);
        alert("حدث خطأ أثناء إضافة المنتج");
      });
  };
  reader.readAsDataURL(productImageInput.files[0]);
});


window.addQuestionField = function() {
  const container = document.getElementById("questionsContainer");
  const div = document.createElement("div");
  div.className = "questionItem";
  div.innerHTML = `
    <input type="text" class="questionText" placeholder="نص السؤال">
    <input type="number" class="questionAnswer" placeholder="الإجابة الصحيحة">
    <br><br>
  `;
  container.appendChild(div);
};


window.displayCatalog = function() {
  const catalogId = document.getElementById("catalogId").value.trim();
  if (!catalogId) {
    alert("يرجى إدخال اسم الكتالوج لعرض المنتجات.");
    return;
  }
  const catalogRef = ref(database, 'catalogs/' + catalogId);
  get(catalogRef)
    .then(snapshot => {
      const catalogData = snapshot.val();
      const productList = document.getElementById("productList");
      productList.innerHTML = `<h3>المنتجات في الكتالوج: ${catalogId}</h3>`;
      if (!catalogData) {
        productList.innerHTML += "<p>لا توجد منتجات مضافة بعد.</p>";
      } else {
        const products = Object.values(catalogData);
        products.forEach((prod, index) => {
          let questionsText = "";
          if (prod.questions && prod.questions.length > 0) {
            prod.questions.forEach((q, i) => {
              questionsText += `<br>سؤال ${i+1}: ${q.question} - الإجابة: ${q.answer}`;
            });
          }
          productList.innerHTML += `<p>${index + 1}. ${prod.product} - السعر: ${prod.price} ${questionsText}<br>
            <img src="${prod.image}" alt="${prod.product}" style="max-width:150px; margin-top:10px; border:1px solid #ccc; border-radius:5px;"></p>`;
        });
      }
    })
    .catch(error => {
      console.error(error);
      alert("حدث خطأ أثناء جلب البيانات");
    });
};

window.clearCatalog = function() {
  const catalogId = document.getElementById("catalogId").value.trim();
  if (!catalogId) {
    alert("يرجى إدخال اسم الكتالوج لمسحه.");
    return;
  }
  if (confirm("هل أنت متأكد من مسح الكتالوج؟")) {
    const catalogRef = ref(database, 'catalogs/' + catalogId);
    remove(catalogRef)
      .then(() => {
        alert("تم مسح الكتالوج");
        displayCatalog();
      })
      .catch(error => {
        console.error(error);
        alert("حدث خطأ أثناء مسح الكتالوج");
      });
  }
};

window.addEventListener('load', () => {
  if(document.getElementById("catalogId").value.trim()){
    displayCatalog();
  }
});