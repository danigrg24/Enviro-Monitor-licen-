// Exemplu de funcție login cu feedback vizibil
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = "";
  messageDiv.className = "message"; // reset stil


  try {

    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      messageDiv.textContent = data.message || "Eroare necunoscută!";
      messageDiv.classList.add("error");
      return;
    }

    if (res.ok) {
  localStorage.setItem("token", data.token);
  messageDiv.textContent = "Autentificare reușită! Redirectare...";
  messageDiv.classList.add("success");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1200);
}
  } catch (e) {
    messageDiv.textContent = "Eroare de rețea. Încearcă din nou!";
    messageDiv.classList.add("error");
  }
}

document.querySelector("button").addEventListener("click", login);
