const slides = document.querySelectorAll('.slide');
let currentIndex = 0;

function updateSlides() {
  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === currentIndex);
    slide.classList.toggle('inactive', index !== currentIndex);
  });
  updateHeroContent();
}

function updateHeroContent() {
  const activeSlide = slides[currentIndex];
  document.getElementById('hero-title').textContent = activeSlide.dataset.title;


  document.getElementById('play-btn').onclick = () => {
    window.location.href = activeSlide.dataset.url;
  };

  document.getElementById('info-btn').onclick = () => {
    const gameInfo = {
      0: "تُقسمون إلى فريقين (أحمر وأزرق)، وفي كل جولة يتنافس لاعب من كل فريق. تُعرض صورة منتج او عنصر ويجب تخمين سعره الصحيح أو الإجابة على سؤال إضافي. يحصل الفريق الذي يكون تخمينه أقرب للسعر الحقيقي على نقطة. تستمر الجولات حتى الانتهاء والفريق الذي يحقق أعلى نقاط يفوز!",
      1: "يتم تقسيم اللاعبين إلى فريقين: الأزرق والأحمر. يبدؤون من المرحلة 1 ويتنقلون بين المراحل حتى الوصول إلى المرحلة 10. في كل جولة، يواجه الفريقان سؤالًا، وعليهم الإجابة عليه. إذا أجاب الفريق بشكل صحيح، يمكنه التقدم خطوة، أو إرجاع الفريق الآخر خطوة للخلف. تتوفر لكل فريق 4 او 5 وسائل مساعدة يمكن استخدامها لمساعدتهم في اللعبة.",
      2: "اللعبة هي منافسة بين فريقين يتناوبان على فتح البطاقات، حيث تؤثر كل بطاقة على نقاط الفريقين سواء بالزيادة أو النقصان، والفائز هو الفريق الذي لا تصل نقاطه إلى الصفر أولاً. البطاقات الخضراء تمنح الفريق الذي يفتحها زيادة في النقاط، حيث يتم إضافة قيمة البطاقة إلى نقاط الفريق."
    };
    document.getElementById('modal-text').textContent = gameInfo[currentIndex];
    document.getElementById('modal').classList.add('show');
  };
}

document.getElementById('prevBtn').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  updateSlides();
});

document.getElementById('nextBtn').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % slides.length;
  updateSlides();
});


updateSlides();

setInterval(() => {
  currentIndex = (currentIndex + 1) % slides.length;
  updateSlides();
}, 8000);

slides.forEach(slide => {
  slide.addEventListener('click', () => {
    window.location.href = slide.dataset.url;
  });
});


document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('modal').classList.remove('show');
});

window.addEventListener('click', (e) => {
  const modal = document.getElementById('modal');
  if (e.target === modal) {
    modal.classList.remove('show');
  }
});
