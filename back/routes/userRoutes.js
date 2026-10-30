const express = require('express');
const { obtenerUsuarios } = require('../controllers/userController');
const { verificarAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();
router.get('/', verificarAdmin, obtenerUsuarios);

module.exports = router;
