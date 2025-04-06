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
  if (activeSlide.dataset.index === "1") {
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
}, 10000);

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

document.getElementById('normal-version-btn').addEventListener('click', () => {
  window.location.href = './RaceRH1/';
});

document.getElementById('special-version-btn').addEventListener('click', () => {
  window.location.href = './RaceRH/';
});

document.getElementById('version-modal-close').addEventListener('click', () => {
  document.getElementById('version-modal').classList.remove('show');
});

window.addEventListener('click', (e) => {
  const versionModal = document.getElementById('version-modal');
  if (e.target === versionModal) {
    versionModal.classList.remove('show');
  }
});

const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
const closeSidebar = document.getElementById("close-sidebar");
const logoutBtn = document.getElementById("logout-btn");

hamburger.addEventListener("click", () => {
  sidebar.classList.add("show");
});

closeSidebar.addEventListener("click", () => {
  sidebar.classList.remove("show");
});

window.addEventListener("click", (e) => {
  if (e.target === sidebar) {
    sidebar.classList.remove("show");
  }
});

logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  }).catch((error) => {
    console.error("خطأ في تسجيل الخروج:", error);
  });
});