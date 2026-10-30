const pool = require('../config/db');

const obtenerUsuarios = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, apellidos, sexo, correo, numero, rol FROM usuarios ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No fue posible obtener los usuarios' });
  }
};

module.exports = { obtenerUsuarios };
