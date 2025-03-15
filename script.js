
if (window.location.pathname.endsWith('index.html')) {
  window.history.replaceState({}, '', window.location.pathname.replace('index.html', ''));
}

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
      0: "--",
      1: "فريقان (الأزرق والأحمر) يتنافسان للوصول إلى المستوى 10 والفوز. اللعبة فيها 10 مراحل، وكل مرحلة لها فئة معينة وعدد محدد من الأسئلة. الأسئلة تُطرح فقط من المرحلة اللي واقف عندها الفريق، إذا جاوب الفريق صح يتقدم خطوة، ولو جاوب مرتين ورا بعض يقدر يختار بين التقدم خطوة أو إرجاع الخصم خطوة للخلف. كل فريق عنده عدد معين من المساعدات يحددها الشخص قبل بدء اللعبة.",
      2: "--"
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
