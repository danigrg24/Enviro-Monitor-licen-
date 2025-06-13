// Simulare senzor fără hardware – trimite date la API

const axios = require("axios");

function generateFakeData() {
  return {
    temperature: parseFloat((20 + Math.random() * 10).toFixed(1)), // 20–30°C
    humidity: parseFloat((40 + Math.random() * 30).toFixed(1)),    // 40–70%
    temp_ds: parseFloat((20 + Math.random() * 10).toFixed(1))      // 20–30°C
  };
}

async function sendData() {
  const data = generateFakeData();
  console.log("Trimit date simulate:", data);

  try {
    await axios.post("http://localhost:3000/api/data", data);
    console.log("Date trimise cu succes.");
  } catch (err) {
    console.error("Eroare la trimitere:", err.message);
  }
}

// Rulează imediat + apoi la fiecare 10 secunde
sendData();
setInterval(sendData, 10000);
