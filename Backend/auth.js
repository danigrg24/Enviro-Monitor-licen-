const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: __dirname + "/authentification.env" });

const JWT_SECRET = process.env.JWT_SECRET || "12345678";
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH;

function authenticate(req, res) {
  const { username, password } = req.body;

  // Debug log (poți șterge după ce verifici)
  console.log("Username primit:", username);
  console.log("ADMIN_USER:", ADMIN_USER);
  console.log("Parola primită:", password);
  console.log("ADMIN_PASS_HASH:", ADMIN_PASS_HASH);
  console.log("Rezultat bcrypt:", bcrypt.compareSync(password, ADMIN_PASS_HASH));

  if (username !== ADMIN_USER) {
    return res.status(401).json({ message: "Utilizator inexistent" });
  }

  const isValid = bcrypt.compareSync(password, ADMIN_PASS_HASH);
  if (!isValid) {
    return res.status(401).json({ message: "Parolă incorectă" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "2h" });
  res.json({ token });
}

// Middleware function to verify the JWT token from the Authorization header.
function verifyToken(req, res, next) {
  const authorizationHeader = req.headers["authorization"];
  if (!authorizationHeader) return res.sendStatus(401);

  const token = authorizationHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = {
  authenticate,
  verifyToken
};