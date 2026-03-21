// =========================
// auth.js (FINAL CLEAN)
// =========================

// Firebase references
const auth = firebase.auth();
const db = firebase.firestore();

// Admin email
const ADMIN_EMAIL = "neuro_stack@outlook.com";

// -------------------------
// LOGIN
function loginUser(email, password) {
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Admin check
      if (user.email === ADMIN_EMAIL) {
        window.location.href = "admin.html";
      } else {
        window.location.href = "dashboard.html";
      }
    })
    .catch((error) => {
      alert(error.message);
    });
}

// -------------------------
// SIGNUP

function signupUser(email, password) {
  auth.createUserWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;

      // Save minimal user info in Firestore
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: email,
        bio: "",
        profilePic: "",
      });

      // Redirect to dashboard
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}
// -------------------------
// LOGOUT
function logoutUser() {
  auth.signOut()
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}

// -------------------------
// FORGOT PASSWORD
function resetPassword(email) {
  auth.sendPasswordResetEmail(email)
    .then(() => {
      alert("Password reset email sent! Check your inbox.");
    })
    .catch((error) => {
      alert(error.message);
    });
}

// -------------------------
// AUTO AUTH CHECK (optional use)
function checkAuth() {
  auth.onAuthStateChanged(user => {
    if (user) {
      if (user.email === ADMIN_EMAIL) {
        window.location.href = "admin.html";
      } else {
        window.location.href = "dashboard.html";
      }
    } else {
      window.location.href = "login.html";
    }
  });
}