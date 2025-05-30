// server.js - serverul Express pentru API-ul IoT
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { authenticate, verifyToken } = require("./auth");
const { Parser } = require("json2csv");

const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.post("/api/login", authenticate);

// Baza de date SQLite (fișier local)
const db = new sqlite3.Database(path.join(__dirname, "../data/database.db"), (err) => {
  if (err) {
    console.error("Eroare la deschiderea bazei de date:", err.message);
  } else {
    console.log("Baza de date conectată.");

    // Creează tabelul dacă nu există
    db.run(`CREATE TABLE IF NOT EXISTS measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      temperature REAL,
      humidity REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Ruta POST: primește date de la senzor
app.post("/api/data", (req, res) => {
  const { temperature, humidity } = req.body;
  if (
    typeof temperature !== "number" ||
    typeof humidity !== "number" ||
    temperature < -40 || temperature > 80 ||
    humidity < 0 || humidity > 100
  ) {
    return res.status(400).json({ error: "Date invalide: temperatura (-40...80°C), umiditate (0...100%)" });
  }

  const stmt = db.prepare("INSERT INTO measurements (temperature, humidity) VALUES (?, ?)");
  stmt.run(temperature, humidity, function (err) {
    if (err) {
      console.error("Eroare la inserare:", err.message);
      return res.status(500).json({ error: "Inserare eșuată" });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// Ruta GET: returnează ultimele N măsurători (ex: 20)
// app.get("/api/history", (req, res) => {
//   db.all("SELECT * FROM measurements ORDER BY timestamp DESC LIMIT 20", [], (err, rows) => {
//     if (err) {
//       console.error("Eroare la interogare:", err.message);
//       return res.status(500).json({ error: "Eroare la citire" });
//     }
//     res.json(rows);
//   });
// });

// Ruta GET: măsurători într-un interval de timp
app.get("/api/history-range", verifyToken, (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: "Parametrii 'from' și 'to' sunt necesari (YYYY-MM-DD HH:MM:SS)" });
  }
  db.all(
    "SELECT * FROM measurements WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp ASC",
    [from, to],
    (err, rows) => {
      if (err) {
        console.error("Eroare la interogare:", err.message);
        return res.status(500).json({ error: "Eroare la citire" });
      }
      res.json(rows);
    }
  );
});

// Ruta GET: ultima măsurătoare (pentru afișare live)
app.get("/api/latest", (req, res) => {
  db.get("SELECT * FROM measurements ORDER BY timestamp DESC LIMIT 1", [], (err, row) => {
    if (err) {
      console.error("Eroare la citire:", err.message);
      return res.status(500).json({ error: "Eroare la citire" });
    }
    res.json(row);
  });
});

// Ruta DELETE: șterge toate datele (reset)
app.delete("/api/reset", verifyToken, (req, res) => {
  db.run("DELETE FROM measurements", [], (err) => {
    if (err) {
      console.error("Eroare la reset DB:", err.message);
      return res.status(500).json({ message: "Eroare la resetare: " + err.message });
    }
    res.json({ message: "Toate datele au fost șterse." });
  });
});

// Ruta GET: exportă datele în format CSV
app.get("/api/export", verifyToken, (req, res) => {
  db.all("SELECT * FROM measurements ORDER BY timestamp", [], (err, rows) => {
    if (err) {
      console.error("Eroare la export:", err.message);
      return res.status(500).json({ message: "Eroare la export: " + err.message });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Nu există date de exportat." });
    }
    const json2csv = new Parser({ fields: ["id", "temperature", "humidity", "timestamp"] });
    const csv = json2csv.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("masuratori.csv");
    res.send(csv);
  });
}); 

app.get("/api/stats", verifyToken, (req, res) => {
  db.get(
    `SELECT COUNT(*) as count, 
            MAX(timestamp) as lastTimestamp, 
            AVG(temperature) as avgTemp, 
            AVG(humidity) as avgHum 
     FROM measurements`,
    (err, row) => {
      if (err) return res.status(500).json({ error: "Eroare la interogare" });
      res.json(row);
    }
  );
}); 

app.get("/api/stats-range", verifyToken, (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: "Parametrii 'from' și 'to' sunt necesari" });
  }
  db.get(
    `SELECT COUNT(*) as count, 
            MIN(temperature) as minTemp,
            MAX(temperature) as maxTemp,
            AVG(temperature) as avgTemp, 
            MIN(humidity) as minHum,
            MAX(humidity) as maxHum,
            AVG(humidity) as avgHum 
     FROM measurements WHERE timestamp BETWEEN ? AND ?`,
    [from, to],
    (err, row) => {
      if (err) return res.status(500).json({ error: "Eroare la interogare" });
      res.json(row);
    }
  );
}); 


app.get("/api/history-paginated", verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  db.all(
    "SELECT * FROM measurements ORDER BY timestamp DESC LIMIT ? OFFSET ?",
    [limit, offset],
    (err, rows) => {
      if (err) {
        console.error("Eroare la interogare:", err.message);
        return res.status(500).json({ error: "Eroare la citire" });
      }
      res.json(rows);
    }
  );
});

// Pornire server
app.listen(port, () => {
  console.log(`Serverul rulează la http://localhost:${port}`);
});