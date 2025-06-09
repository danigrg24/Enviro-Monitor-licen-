document.addEventListener("DOMContentLoaded", () => {
  const darkModeBtn = document.getElementById("darkModeToggle");
  // Activează dark mode dacă era deja setat
  if (localStorage.getItem("darkMode")) {
    document.body.classList.add("dark-mode");
    if (darkModeBtn) darkModeBtn.textContent = "☀️ Light mode";
  }
  if (darkModeBtn) {
    darkModeBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "1");
        darkModeBtn.textContent = "☀️ Light mode";
      } else {
        localStorage.removeItem("darkMode");
        darkModeBtn.textContent = "🌙 Dark mode";
      }
    });
  }
});