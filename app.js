
// theme toggle
document.getElementById("themeToggle").addEventListener("click", ()=>{
  const theme = document.body.getAttribute("data-theme") === "light" ? "dark" : "light";
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
});

// load user pref
document.body.setAttribute("data-theme", localStorage.getItem("theme") || "light");

// FIREBASE PLACEHOLDER CONFIG
const firebaseConfig = {
  apiKey: "PLACEHOLDER",
  authDomain: "PLACEHOLDER.firebaseapp.com",
  projectId: "PLACEHOLDER",
  storageBucket: "PLACEHOLDER.appspot.com",
  messagingSenderId: "PLACEHOLDER",
  appId: "PLACEHOLDER"
};

// chart placeholder
