const tempElement = document.getElementById("temp");
const humElement = document.getElementById("hum");
const tempDsElement = document.getElementById("temp_ds");

let tempData = [];
let humData = [];
let tempDsData = [];
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

    const now = new Date().toLocaleTimeString();

    // Actualizează valorile vizibile
    tempElement.textContent = `${data.temperature} °C`;
    humElement.textContent = `${data.humidity} %`;
    tempDsElement.textContent = data.temp_ds !== undefined && data.temp_ds !== null ? `${data.temp_ds} °C` : "-- °C";

    // Actualizează datele din grafic
    timeLabels.push(now);
    tempData.push(data.temperature);
    humData.push(data.humidity);
    tempDsData.push(data.temp_ds);

    if (timeLabels.length > 10) {
      timeLabels.shift();
      tempData.shift();
      humData.shift();
      tempDsData.shift();
    }

    chart.update();
  } catch (err) {
    console.error("Eroare la fetch:", err);
  }
}


// Fetch la fiecare 10 secunde
setInterval(fetchLatestData, 10000);
fetchLatestData();
