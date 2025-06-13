const tempElement = document.getElementById("temp");
const humElement = document.getElementById("hum");
const tempDsElement = document.getElementById("temp_ds");

let tempData = [];
let humData = [];
let tempDsData = [];
let timeLabels = [];
let lastTimestamp = null;
const MAX_POINTS = 2;

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
      },
      {
        label: "Temperatură senzor (°C)",
        data: tempDsData,
        borderColor: "#90be6d",
        fill: false,
        tension: 0.2
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "#003554" }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Timp', color: "#003554" },
        ticks: { color: "#003554" },
        grid: { color: "#e0e0e0" }
      },
      y: {
        title: { display: true, text: 'Valori', color: "#003554" },
        ticks: { color: "#003554" },
        grid: { color: "#e0e0e0" },
        suggestedMin: 0,
        suggestedMax: 100
      }
    }
  },
  plugins: [{
    beforeDraw: (chart) => {
      const ctx = chart.ctx;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    }
  }]
});

async function fetchLatestData() {
  try {
    const res = await fetch("http://localhost:3000/api/latest");
    const data = await res.json();

    // Folosește timestamp-ul real din backend
    const label = data.timestamp
      ? new Date(data.timestamp).toLocaleTimeString()
      : new Date().toLocaleTimeString();

    // Adaugă doar dacă timestamp-ul e diferit de ultimul din grafic
    if (data.timestamp && data.timestamp !== lastTimestamp) {
      timeLabels.push(label);
      tempData.push(data.temperature);
      humData.push(data.humidity);
      tempDsData.push(data.temp_ds);

      if (timeLabels.length > MAX_POINTS) {
        timeLabels.shift();
        tempData.shift();
        humData.shift();
        tempDsData.shift();
      }
      chart.update();
      lastTimestamp = data.timestamp; // Actualizează timestamp-ul curent
    }

    // Actualizează valorile vizibile
    tempElement.textContent = `${data.temperature} °C`;
    humElement.textContent = `${data.humidity} %`;
    tempDsElement.textContent = data.temp_ds !== undefined && data.temp_ds !== null ? `${data.temp_ds} °C` : "-- °C";
  } catch (err) {
    console.error("Eroare la fetch:", err);
  }
}

async function loadInitialHistory() {
  const res = await fetch("http://localhost:3000/api/history?limit=7");
  let rows = await res.json();
  rows = rows.reverse(); // să fie în ordine cronologică

  timeLabels.length = 0;
  tempData.length = 0;
  humData.length = 0;
  tempDsData.length = 0;

  for (const row of rows) {
    timeLabels.push(new Date(row.timestamp).toLocaleTimeString());
    tempData.push(row.temperature);
    humData.push(row.humidity);
    tempDsData.push(row.temp_ds);
    lastTimestamp = row.timestamp;
  }
  chart.update();
}

async function loadThreshold() {
  const res = await fetch("http://localhost:3000/api/threshold");
  const data = await res.json();
  document.getElementById("thresholdInput").value = data.value;
}
async function saveThreshold() {
  const value = Number(document.getElementById("thresholdInput").value);
  const msg = document.getElementById("thresholdMsg");
  const res = await fetch("http://localhost:3000/api/threshold", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value })
  });
  if (res.ok) {
    msg.textContent = "✔️";
    setTimeout(() => msg.textContent = "", 1500);
  } else {
    msg.textContent = "Eroare!";
  }
}
document.getElementById("saveThresholdBtn").onclick = saveThreshold;
loadThreshold();


// Fetch la fiecare 10 secunde
async function startApp() {
  await loadInitialHistory();
  setInterval(fetchLatestData, 10000);
  fetchLatestData();
}
startApp();
