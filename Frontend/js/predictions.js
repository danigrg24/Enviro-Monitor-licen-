async function loadPrediction() {
    try {
      const res = await fetch("http://localhost:3000/api/history");
      const data = await res.json();
  
      const temps = data.map(row => row.temperature).reverse();
      const hums = data.map(row => row.humidity).reverse();
      const tempDs = data.map(row => row.temp_ds).reverse();
      const labels = Array.from({ length: temps.length + 5 }, (_, i) => `T${i + 1}`);
  
      const predictLinear = (values) => {
        const n = values.length;
        const x = Array.from({ length: n }, (_, i) => i + 1);
        const xMean = x.reduce((a, b) => a + b) / n;
        const yMean = values.reduce((a, b) => a + b) / n;
        const num = x.reduce((acc, xi, i) => acc + (xi - xMean) * (values[i] - yMean), 0);
        const den = x.reduce((acc, xi) => acc + Math.pow(xi - xMean, 2), 0);
        const slope = num / den;
        const intercept = yMean - slope * xMean;
  
        const future = Array.from({ length: 5 }, (_, i) => slope * (n + i + 1) + intercept);
        return values.concat(future);
      };
  
      const predictedTemps = predictLinear(temps);
      const predictedHums = predictLinear(hums); 
      const predictedTempDs = predictLinear(tempDs); 
  
      new Chart(document.getElementById("predictionChart"), {
  type: 'line',
  data: {
    labels,
    datasets: [
      {
        label: "Temperatură DHT22 (prezisă)",
        data: predictedTemps,
        borderColor: "#f94144",
        borderDash: [5, 5],
        tension: 0.2,
        fill: false
      },
      {
        label: "Umiditate DHT22 (prezisă)",
        data: predictedHums,
        borderColor: "#577590",
        borderDash: [5, 5],
        tension: 0.2,
        fill: false
      },
      {
        label: "Temperatură DS18B20 (°C)", 
        data: predictedTempDs,
        borderColor: "#277da1",
        borderDash: [5, 5],
        tension: 0.3,
        fill: false
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: "#003554" } }
    },
    scales: {
      y: {
        title: { display: true, text: 'Valori estimate', color: "#003554" },
        ticks: { color: "#003554" },
        grid: { color: "#e0e0e0" },
        suggestedMin: 0,
        suggestedMax: 100
      },
      x: {
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
  
    } catch (err) {
      console.error("Eroare la încărcarea predicțiilor:", err);
    }
  }
  
  loadPrediction();
  