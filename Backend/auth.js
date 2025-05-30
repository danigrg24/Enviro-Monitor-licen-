const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); 
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "12345678"; // Cheia secretă pentru semnarea token-urilor


// Utilizator de test
const mockUser = {
  username: "admin",
  // Parolă: andreidaniel2404
  passwordHash: bcrypt.hashSync("andreidaniel2404", 10)
};

/**
 * Authenticates a user by verifying the provided username and password.
 * @param {Object} req - The request object containing the body with username and password.
 * @param {Object} res - The response object used to send the authentication result.
 * @returns {Object} - A JSON response with a JWT token if authentication is successful.
 */
function authenticate(req, res) {
  const { username, password } = req.body;

  if (username !== mockUser.username) {
    return res.status(401).json({ message: "Utilizator inexistent" });
  }

  const isValid = bcrypt.compareSync(password, mockUser.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Parolă incorectă" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "2h" });
  res.json({ token });
}

// Middleware function to verify the JWT token from the Authorization header.
// If the token is valid, it attaches the user information to the request object and calls the next middleware.
// If the token is missing or invalid, it sends an appropriate HTTP status code.

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