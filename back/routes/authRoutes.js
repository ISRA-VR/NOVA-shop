const express = require('express');
const { registroCompleto, login, session, logout } = require('../controllers/authController');
const router = express.Router();

router.post('/registro', registroCompleto);
router.post('/login', login);
router.get('/session', session);
router.post('/logout', logout);

module.exports = router;
