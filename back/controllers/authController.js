const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { establecerCookieSesion, limpiarCookieSesion, obtenerUsuarioDesdeSesion } = require('../utils/sessionUtils');

const registro = async (req, res) => {
  try {
    const { username, apellidos, sexo, correo, numero, password } = req.body;
    
    // Validación de seguridad de contraseña en el backend
    const passSegura = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passSegura.test(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un signo.' });
    }

    const hash = await bcrypt.hash(password, 12);
    
    await pool.query(
      `INSERT INTO usuarios (username, apellidos, sexo, correo, numero, password, rol) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [username, apellidos, sexo, correo, numero, hash, 'usuario']
    );
    
    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'El usuario o correo ya existe' });
    res.status(500).json({ error: 'No fue posible crear el usuario' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
    
    const identificador = username.trim().toLowerCase();
    const result = await pool.query('SELECT id, username, password, rol FROM usuarios WHERE LOWER(username) = $1 OR LOWER(correo) = $1', [identificador]);
    const user = result.rows[0];
    const passValida = user ? await bcrypt.compare(password, user.password) : false;
    
    if (!passValida) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    const token = jwt.sign({ id: user.id, rol: user.rol, username: user.username }, process.env.JWT_SECRET, { expiresIn: '30d' });
    establecerCookieSesion(res, token);
    res.json({ rol: user.rol, username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'No fue posible iniciar sesión' });
  }
};

const session = (req, res) => {
  const usuario = obtenerUsuarioDesdeSesion(req);
  if (!usuario) return res.status(401).json({ error: 'No hay una sesión activa' });
  res.json({ id: usuario.id, rol: usuario.rol, username: usuario.username });
};

const logout = (req, res) => {
  limpiarCookieSesion(res);
  res.json({ message: 'Sesión cerrada' });
};

const registroCompleto = async (req, res) => {
  try {
    const { username, apellidos, sexo, correo, numero, password, confirmarPassword, aceptaTerminos } = req.body;
    const usernameLimpio = typeof username === 'string' ? username.trim() : '';
    const apellidosLimpios = typeof apellidos === 'string' ? apellidos.trim() : '';
    const correoLimpio = typeof correo === 'string' ? correo.trim().toLowerCase() : '';
    const numeroLimpio = typeof numero === 'string' ? numero.trim() : '';
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio);
    const sexoValido = ['femenino', 'masculino', 'no-binario', 'prefiero-no-decir'].includes(sexo);
    const passSegura = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!usernameLimpio) return res.status(400).json({ error: 'El nombre de usuario es obligatorio.' });
    if (apellidosLimpios.length < 2) return res.status(400).json({ error: 'Los apellidos son obligatorios.' });
    if (!sexoValido) return res.status(400).json({ error: 'Selecciona una opcion valida para sexo.' });
    if (!correoValido) return res.status(400).json({ error: 'Introduce un correo valido.' });
    if (!/^\+?[0-9\s()-]{7,20}$/.test(numeroLimpio)) return res.status(400).json({ error: 'Introduce un numero telefonico valido.' });
    if (!passSegura.test(password)) return res.status(400).json({ error: 'La contrasena debe tener minimo 8 caracteres, una mayuscula, un numero y un caracter especial.' });
    if (password !== confirmarPassword) return res.status(400).json({ error: 'Las contrasenas no coinciden.' });
    if (aceptaTerminos !== true) return res.status(400).json({ error: 'Debes aceptar los terminos y condiciones.' });

    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO usuarios (username, apellidos, sexo, correo, numero, password, rol)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [usernameLimpio, apellidosLimpios, sexo, correoLimpio, numeroLimpio, hash, 'usuario']
    );
    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Ese correo ya esta registrado.' });
    console.error(error);
    res.status(500).json({ error: 'No fue posible crear el usuario' });
  }
};

module.exports = { registro, registroCompleto, login, session, logout };
