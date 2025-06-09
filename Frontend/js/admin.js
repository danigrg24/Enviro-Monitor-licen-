const token = localStorage.getItem("token");
const darkModeBtn = document.getElementById("darkModeToggle");

// Protejează acțiunile dacă nu există token
if (!token) {
  window.location.href = "login.html";
}

// Ștergere date cu autorizare
document.getElementById("resetBtn").addEventListener("click", async () => {
  if (!confirm("Ești sigur că vrei să ștergi toate datele? Această acțiune este ireversibilă!")) {
    return;
  }
  try {
    const res = await fetch("http://localhost:3000/api/reset", {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (!res.ok) {
      throw new Error("Nu ai acces!");
      }

      const data = await res.json();
      document.getElementById("statusMsg").textContent = data.message;
    } catch (err) {
      console.error(err);
      document.getElementById("statusMsg").textContent = "Eroare la ștergere.";
    }
  }
);

// Export CSV cu autorizare
document.getElementById("exportBtn").addEventListener("click", async () => {
  try {
    const res = await fetch("http://localhost:3000/api/export", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (!res.ok) {
      throw new Error("Token invalid sau expirat.");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "masuratori.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    document.getElementById("statusMsg").textContent = "Datele au fost exportate.";
  } catch (err) {
    console.error(err);
    document.getElementById("statusMsg").textContent = "Eroare la export.";
  }
}); 

// Buton de Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}); 

async function loadAdminStats() {
  const statsDiv = document.getElementById("admin-stats");
  try {
    const res = await fetch("http://localhost:3000/api/stats", {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    statsDiv.innerHTML = `
      <p><b>Total măsurători:</b> ${data.count}</p>
      <p><b>Ultima actualizare:</b> ${data.lastTimestamp ? new Date(data.lastTimestamp).toLocaleString() : "N/A"}</p>
      <p><b>Temperatură medie:</b> ${data.avgTemp ? data.avgTemp.toFixed(2) + " °C" : "N/A"}</p>
      <p><b>Umiditate medie:</b> ${data.avgHum ? data.avgHum.toFixed(2) + " %" : "N/A"}</p>
    `;
  } catch {
    statsDiv.innerHTML = `<p style="color:#ff595e;">Nu s-au putut încărca statisticile.</p>`;
  }
}
loadAdminStats(); 

// darkModeBtn.addEventListener("click", () => {
//   document.body.classList.toggle("dark-mode"); 

//   if (document.body.classList.contains("dark-mode")) {
//     localStorage.setItem("darkMode", "1");
//     darkModeBtn.textContent = "☀️ Light mode";
//   } else {
//     localStorage.removeItem("darkMode");
//     darkModeBtn.textContent = "🌙 Dark mode";
//   }
// });

// // Activează dark mode dacă era deja setat
// if (localStorage.getItem("darkMode")) {
//   document.body.classList.add("dark-mode");
//   darkModeBtn.textContent = "☀️ Light mode";
// }
