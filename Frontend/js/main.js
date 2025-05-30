const tempElement = document.getElementById("temp");
const humElement = document.getElementById("hum");

let tempData = [];
let humData = [];
let timeLabels = [];

const chart = new Chart(document.getElementById("liveChart"), {
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [
      {
        label: "Temperatură (°C)",
        data: tempData,
        borderColor: "#f94144",
        fill: false,
        tension: 0.2
      },
      {
        label: "Umiditate (%)",
        data: humData,
        borderColor: "#277da1",
        fill: false,
        tension: 0.2
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: 'Timp' }
      },
      y: {
        title: { display: true, text: 'Valori' },
        suggestedMin: 0,
        suggestedMax: 100
      }
    }
  }
});

async function fetchLatestData() {
  try {
    const res = await fetch("http://localhost:3000/api/latest");
    const data = await res.json();

    const now = new Date().toLocaleTimeString();

    // Actualizează valorile vizibile
    tempElement.textContent = `${data.temperature} °C`;
    humElement.textContent = `${data.humidity} %`;

    // Actualizează datele din grafic
    timeLabels.push(now);
    tempData.push(data.temperature);
    humData.push(data.humidity);

    if (timeLabels.length > 10) {
      timeLabels.shift();
      tempData.shift();
      humData.shift();
    }

    chart.update();
  } catch (err) {
    console.error("Eroare la fetch:", err);
  }
}

// Fetch la fiecare 10 secunde
setInterval(fetchLatestData, 10000);
fetchLatestData();
