const pool = require('../config/db');

const obtenerProductos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const crearProducto = async (req, res) => {
  try {
    const { nombre, precio, descripcion, stock, categoria } = req.body;
    const imgPath = req.file ? `/uploads/${req.file.filename}` : null;
    const stockSeguro = stock === '' ? 0 : stock;
    await pool.query(
      'INSERT INTO productos (nombre, precio, descripcion, img, stock, categoria) VALUES ($1, $2, $3, $4, $5, $6)',
      [nombre, precio, descripcion, imgPath, stockSeguro, categoria]
    );
    res.status(201).json({ message: 'Producto creado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, descripcion, stock, categoria } = req.body;
    const stockSeguro = stock === '' ? 0 : stock;
    
    if (req.file) {
      const imgPath = `/uploads/${req.file.filename}`;
      await pool.query(
        'UPDATE productos SET nombre = $1, precio = $2, descripcion = $3, img = $4, stock = $5, categoria = $6 WHERE id = $7',
        [nombre, precio, descripcion, imgPath, stockSeguro, categoria, id]
      );
    } else {
      await pool.query(
        'UPDATE productos SET nombre = $1, precio = $2, descripcion = $3, stock = $4, categoria = $5 WHERE id = $6',
        [nombre, precio, descripcion, stockSeguro, categoria, id]
      );
    }
    res.status(200).json({ message: 'Producto actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    await pool.query('DELETE FROM productos WHERE id = $1', [req.params.id]);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

module.exports = { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto };