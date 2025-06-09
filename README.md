# Proiect Licență - Monitorizare Temperatură și Umiditate

Acest proiect monitorizează și vizualizează în timp real temperatura și umiditatea dintr-un spațiu, cu istoric, predicții și export date. Această aplicație este destinată proiectelor educaționale și de cercetare, dar cel mai mult a fost gândit ca o simulare a unui sistem inteligent IoT.

## Tehnologii folosite

- Node.js, Express (Backend)
- JWT (Autentificare)
- Chart.js (Vizualizare date)
- HTML, CSS, JavaScript (Frontend)

## Structura proiectului

- `Backend/` - Server Node.js, API, autentificare
- `Frontend/` - Interfață web (index, istoric, predicții, admin)
- `data/` - Datele colectate
- `main.py` - Script pentru colectarea datelor (ex: Raspberry Pi)

## Instalare și rulare

### Backend

1. `cd Backend`
2. `npm install`
3. Creează fișier `.env` cu:
   ```
   PORT=3000
   JWT_SECRET=cheia_ta_secreta
   ```
4. `node server.js`

### Frontend

1. Deschide folderul `Frontend` în VS Code
2. Rulează cu Live Server (sau orice server static)
3. Accesează `http://127.0.0.1:5500/index.html`

## Funcționalități

- Colectare și vizualizare date live
- Istoric măsurători și export CSV
- Predicții pe baza datelor istorice
- Autentificare și panou admin
- Dark mode

## Utilizare

- Autentifică-te cu un cont valid
- Navighează între pagini din meniu
- Folosește butonul de dark mode pentru schimbarea temei
- Exportă datele istorice din pagina Istoric

## Screenshots

*Adaugă aici imagini cu interfața aplicației*

## Autor

Andrei Daniel  
[GitHub](https://github.com/AndreiDaniel) | [Email](mailto:andrei.daniel@example.com)