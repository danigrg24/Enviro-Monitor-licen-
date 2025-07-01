const kalmanToggle = document.getElementById("kalmanToggle");
let showKalman = false;

kalmanToggle.addEventListener("change", () => {
  showKalman = kalmanToggle.checked;
  loadHistory();
});

let chart = null;

async function loadHistory() {
  try {
    const url = showKalman
      ? "http://localhost:3000/api/history?filter=kalman"
      : "http://localhost:3000/api/history";
    const res = await fetch(url);
    const data = await res.json();

    const labels = data.map(row => new Date(row.timestamp).toLocaleTimeString());
    const temperatures = data.map(row => row.temperature);
    const humidities = data.map(row => row.humidity);
    const tempDs = data.map(row => row.temp_ds);
    const temperaturesKalman = showKalman ? data.map(row => row.temperature_dht_Kalman) : [];
    const humiditiesKalman = showKalman ? data.map(row => row.humidity_dht_Kalman) : [];

    const datasets = [
      {
        label: "Temperatură DHT22 (°C)",
        data: temperatures,
        borderColor: "#f3722c",
        tension: 0.3,
        fill: false
      },
      showKalman ? {
        label: "Temperatură DHT22 Kalman (°C)",
        data: temperaturesKalman,
        borderColor: "#f9c74f",
        tension: 0.3,
        fill: false,
        borderDash: [5, 5]
      } : null,
      showKalman ? {
      label: "Umiditate DHT22 Kalman (%)",
      data: humiditiesKalman,
      borderColor: "#277da1", // sau altă culoare distinctă
      tension: 0.3,
      fill: false,
      borderDash: [5, 5]
    } : null,
      {
        label: "Umiditate DHT22 (%)",
        data: humidities,
        borderColor: "#43aa8b",
        tension: 0.3,
        fill: false
      },
      {
        label: "Temperatură DS18B20 (°C)",
        data: tempDs,
        borderColor: "#277da1",
        tension: 0.3,
        fill: false
      }
    ].filter(Boolean);

    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets = datasets;
      chart.update();
    } else {
      chart = new Chart(document.getElementById("historyChart"), {
        type: 'line',
        data: {
          labels,
          datasets
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
              title: { display: true, text: "Timp", color: "#003554" },
              ticks: { color: "#003554" },
              grid: { color: "#e0e0e0" }
            },
            y: {
              title: { display: true, text: "Valori", color: "#003554" },
              ticks: { color: "#003554" },
              grid: { color: "#e0e0e0" }
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
    }
  } catch (err) {
    console.error("Eroare la încărcarea istoricului:", err);
    document.getElementById("historyMsg").textContent = "Eroare la încărcarea istoricului!";
  }
}

  document.getElementById("exportRangeForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const from = document.getElementById("exportFrom").value.replace("T", " ") + ":00";
  const to = document.getElementById("exportTo").value.replace("T", " ") + ":59";
  const msgDiv = document.getElementById("exportRangeMsg");
  msgDiv.textContent = "";

  try {
    const params = new URLSearchParams({ from, to });
    const res = await fetch(`http://localhost:3000/api/export-range?${params.toString()}`, {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });

    if (!res.ok) {
      const data = await res.json();
      msgDiv.textContent = data.message || "Eroare la export!";
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "masuratori_filtrate.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    msgDiv.textContent = "Export realizat cu succes!";
  } catch (err) {
    msgDiv.textContent = "Eroare la export!";
  }
});
  
kalmanToggle.checked = false; // Resetăm la încărcare  
loadHistory();
  