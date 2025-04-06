firebase.auth().onAuthStateChanged((user) => {
  const publicPages = ["/login.html", "/signup.html"];
  const currentPath = window.location.pathname;

  if (user) {
    if (publicPages.includes(currentPath)) {
      window.location.href = "index.html";
    } else {
      firebase.database().ref('users/' + user.uid).once('value')
        .then((snapshot) => {
          const userData = snapshot.val();
          const username = userData && userData.username
            ? userData.username
            : user.email.split('@')[0]; // ← هذا هو المطلوب
          
          const userEmailElement = document.getElementById('user-email');
          if (userEmailElement) {
            userEmailElement.textContent = username;
          }
        })
        .catch((error) => {
          console.error("خطأ في جلب بيانات المستخدم:", error);
        });
    }
  } else {
    if (!publicPages.includes(currentPath)) {
      window.location.href = "login.html";
    }
  }
});
