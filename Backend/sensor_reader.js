// sensor_reader.js - citește senzorul DHT22 și trimite date către API
const sensor = require("node-dht-sensor").promises;
const axios = require("axios");

// Configurare senzor DHT22 conectat la GPIO pin 4
const DHT_TYPE = 22; // DHT22 = 22, DHT11 = 11
const GPIO_PIN = 4;  // Se conectează la pinul fizic 72

async function readAndSendData() {
  try {
    const { temperature, humidity } = await sensor.read(DHT_TYPE, GPIO_PIN);

    console.log(`Temperatură: ${temperature.toFixed(1)}°C, Umiditate: ${humidity.toFixed(1)}%`);

    // Trimite datele către server
    await axios.post("http://localhost:3000/api/data", {
      temperature: parseFloat(temperature.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1))
    });

    console.log("Date trimise cu succes.");
  } catch (error) {
    console.error("Eroare la citirea senzorului sau trimiterea datelor:", error.message);
  }
}

// Rulează la fiecare 60 secunde
setInterval(readAndSendData, 60 * 1000);

// Rulează o dată imediat
readAndSendData();
