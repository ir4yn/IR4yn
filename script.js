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

  const playBtn = document.getElementById('play-btn');
  if (activeSlide.dataset.index === "1") { // سباق المشاهدين
    playBtn.onclick = () => {
      document.getElementById('version-modal').classList.add('show');
    };
  } else {
    playBtn.onclick = () => {
      window.location.href = activeSlide.dataset.url;
    };
  }

  document.getElementById('info-btn').onclick = () => {
    const gameInfo = {
      0: "--",
      1: "",
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
    if (slide.dataset.index === "1") {
      document.getElementById('version-modal').classList.add('show');
    } else {
      window.location.href = slide.dataset.url;
    }
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

// إضافة سلوك لأزرار النسخة
document.getElementById('normal-version-btn').addEventListener('click', () => {
  window.location.href = './RaceRH1/';
});

document.getElementById('special-version-btn').addEventListener('click', () => {
  window.location.href = './RaceRH/';
});

// إضافة سلوك لإغلاق نافذة اختيار النسخة
document.getElementById('version-modal-close').addEventListener('click', () => {
  document.getElementById('version-modal').classList.remove('show');
});

window.addEventListener('click', (e) => {
  const versionModal = document.getElementById('version-modal');
  if (e.target === versionModal) {
    versionModal.classList.remove('show');
  }
});