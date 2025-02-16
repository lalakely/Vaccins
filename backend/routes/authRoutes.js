const express = require("express");
const { loginUser, logoutUser } = require("../controllers/authController");
const authenticate = require("../middlewares/authMiddleware"); // Middleware pour protéger la route

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", (req, res, next) => {
    console.log("🔍 Headers reçus :", req.headers);
    console.log("🔍 Authorization Header :", req.headers.authorization);
    next();
}, authenticate, logoutUser); // Route protégée, nécessite un token


module.exports = router;
