const { obtenerUsuarioDesdeSesion } = require('../utils/sessionUtils');

const verificarSesion = (req, res, next) => {
  const usuario = obtenerUsuarioDesdeSesion(req);
  if (!usuario) return res.status(401).json({ error: 'Debes iniciar sesión para acceder' });
  req.usuario = usuario;
  next();
};

const verificarAdmin = (req, res, next) => {
  const usuario = obtenerUsuarioDesdeSesion(req);
  if (!usuario) return res.status(401).json({ error: 'Sesión inválida o expirada' });
  if (usuario.rol !== 'admin') return res.status(403).json({ error: 'Requiere permisos de administrador' });
  req.usuario = usuario;
  next();
};

module.exports = { verificarSesion, verificarAdmin };