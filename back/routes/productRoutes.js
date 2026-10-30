const express = require('express');
const { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } = require('../controllers/productController');
const { verificarSesion, verificarAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.get('/', verificarSesion, obtenerProductos);
router.post('/', verificarAdmin, upload.single('imagen'), crearProducto);
router.put('/:id', verificarAdmin, upload.single('imagen'), actualizarProducto);
router.delete('/:id', verificarAdmin, eliminarProducto);

module.exports = router;