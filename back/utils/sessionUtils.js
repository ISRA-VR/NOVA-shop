const jwt = require('jsonwebtoken');

const nombreCookieSesion = 'posgrate_session';
const duracionSesion = 30 * 24 * 60 * 60;
const opcionesCookieSesion = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: duracionSesion * 1000,
  path: '/',
};

const obtenerTokenSesion = (req) => {
  const cookies = req.headers.cookie || '';
  const cookie = cookies.split(';').find((item) => item.trim().startsWith(`${nombreCookieSesion}=`));
  return cookie ? decodeURIComponent(cookie.trim().slice(nombreCookieSesion.length + 1)) : null;
};

const obtenerUsuarioDesdeSesion = (req) => {
  const token = obtenerTokenSesion(req);
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET); } 
  catch { return null; }
};

const establecerCookieSesion = (res, token) => {
  const atributos = [
    `${nombreCookieSesion}=${encodeURIComponent(token)}`,
    `Max-Age=${Math.floor(opcionesCookieSesion.maxAge / 1000)}`,
    `Path=${opcionesCookieSesion.path}`,
    'HttpOnly',
    `SameSite=${opcionesCookieSesion.sameSite}`,
  ];
  if (opcionesCookieSesion.secure) atributos.push('Secure');
  res.setHeader('Set-Cookie', atributos.join('; '));
};

const limpiarCookieSesion = (res) => {
  res.setHeader('Set-Cookie', `${nombreCookieSesion}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${opcionesCookieSesion.secure ? '; Secure' : ''}`);
};

module.exports = { obtenerUsuarioDesdeSesion, establecerCookieSesion, limpiarCookieSesion };