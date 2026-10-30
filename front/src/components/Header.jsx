import { useState } from 'react';
import { fetchAPI } from '../services/api';

export default function Header({ sesion, sesionComprobada, setSesion }) {
  const [modoRegistro, setModoRegistro] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const endpoint = modoRegistro ? '/registro' : '/login';
      const data = await fetchAPI(endpoint, {
        method: 'POST',
        body: JSON.stringify({ username: user, password: pass })
      });
      
      if (modoRegistro) {
        alert('Usuario creado. Ahora inicia sesión.');
        setModoRegistro(false);
        setPass('');
      } else {
        setSesion(data);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = async () => {
    await fetchAPI('/logout', { method: 'POST' });
    setSesion(null);
  };

  return (
    <header className="tienda-nav">
      <h2 className="tienda-nav__brand">
        NOVA<span>·</span>market
        {sesion?.rol === 'admin' && <span className="tienda-nav__badge">Panel de administrador</span>}
      </h2>
      {sesion ? (
        <button onClick={cerrarSesion} className="tienda-btn tienda-btn--ghost">Cerrar sesión</button>
      ) : sesionComprobada ? (
        <div className="tienda-nav__auth">
          <form onSubmit={handleAuth} className="tienda-form-inline">
            <input type="text" className="tienda-input" placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)} required />
            <input type="password" className="tienda-input" placeholder={modoRegistro ? "Mínimo 8 caracteres" : "Contraseña"} value={pass} onChange={e => setPass(e.target.value)} minLength={modoRegistro ? "8" : "1"} required />
            {error && <p className="tienda-auth-message">{error}</p>}
            <button type="submit" disabled={cargando} className="tienda-btn tienda-btn--primary">{cargando ? 'Un momento...' : modoRegistro ? 'Registrarme' : 'Entrar'}</button>
            <button type="button" onClick={() => setModoRegistro(!modoRegistro)} className="tienda-btn tienda-btn--ghost">{modoRegistro ? 'Volver' : 'Crear cuenta'}</button>
          </form>
        </div>
      ) : <span className="tienda-checking">Comprobando sesión…</span>}
    </header>
  );
}
