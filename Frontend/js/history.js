async function loadHistory() {
    try {
      const res = await fetch("http://localhost:3000/api/history");
      const data = await res.json();
  
      const labels = data.map(row => new Date(row.timestamp).toLocaleTimeString());
      const temperatures = data.map(row => row.temperature);
      const humidities = data.map(row => row.humidity);
  
      new Chart(document.getElementById("historyChart"), {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: "Temperatură (°C)",
              data: temperatures,
              borderColor: "#f3722c",
              tension: 0.3,
              fill: false
            },
            {
              label: "Umiditate (%)",
              data: humidities,
              borderColor: "#43aa8b",
              tension: 0.3,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: { display: true, text: "Timp" }
            },
            y: {
              title: { display: true, text: "Valori" }
            }
          }
        }
      });
    } catch (err) {
      console.error("Eroare la încărcarea istoricului:", err);
    }
  }
  
  loadHistory();
  