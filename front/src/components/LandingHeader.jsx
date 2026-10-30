import { useState } from 'react';
import { fetchAPI } from '../services/api';

export default function LandingHeader({ sesion, sesionComprobada, setSesion }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const abrirModal = (registro) => { setModoRegistro(registro); setError(''); setModalAbierto(true); };
  const handleAuth = async (event) => {
    event.preventDefault(); setError(''); setCargando(true);
    try {
      const data = await fetchAPI(modoRegistro ? '/registro' : '/login', { method: 'POST', body: JSON.stringify({ username: user, password: pass }) });
      if (modoRegistro) { setModoRegistro(false); setPass(''); setError('Cuenta creada. Ahora inicia sesión.'); }
      else { setSesion(data); setModalAbierto(false); }
    } catch (requestError) { setError(requestError.message); }
    finally { setCargando(false); }
  };
  const cerrarSesion = async () => { await fetchAPI('/logout', { method: 'POST' }); setSesion(null); };

  return <>
    <header className="landing-nav">
      <a className="landing-brand" href="/" aria-label="NOVA market inicio"><span className="landing-brand__mark">N</span><span>NOVA<em>·</em>market</span></a>
      {sesion ? <div className="landing-account"><span>Hola, <strong>{sesion.username}</strong></span><button className="tienda-btn tienda-btn--ghost" onClick={cerrarSesion}>Cerrar sesión</button></div> : sesionComprobada && <div className="landing-actions"><button className="landing-login" onClick={() => abrirModal(false)}>Iniciar sesión</button><button className="tienda-btn tienda-btn--primary" onClick={() => abrirModal(true)}>Crear cuenta <span>↗</span></button></div>}
    </header>
    {!sesion && sesionComprobada && <section className="landing-hero"><div className="landing-hero__eyebrow"><span /> Curaduría para tu día a día</div><h1>Todo lo que buscas,<br /><i>en un solo lugar.</i></h1><p>Inicia sesión o crea una cuenta para ver el catálogo completo.</p><div className="landing-hero__hint"><span>✦</span> Productos seleccionados con intención</div></section>}
    {modalAbierto && <div className="auth-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && setModalAbierto(false)}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="auth-modal__close" onClick={() => setModalAbierto(false)} aria-label="Cerrar">×</button><div className="auth-modal__visual"><span>✦</span><p>NOVA·market</p><small>Tu próximo descubrimiento<br />comienza aquí.</small></div><div className="auth-modal__form"><div className="auth-modal__switch"><button className={!modoRegistro ? 'is-active' : ''} onClick={() => { setModoRegistro(false); setError(''); }}>Entrar</button><button className={modoRegistro ? 'is-active' : ''} onClick={() => { setModoRegistro(true); setError(''); }}>Registrarme</button></div><p className="tienda-eyebrow">Tu espacio personal</p><h2 id="auth-title">{modoRegistro ? 'Crea tu cuenta' : 'Qué bueno verte'}</h2><p className="auth-modal__copy">{modoRegistro ? 'Empieza a guardar tus favoritos.' : 'Entra para continuar explorando.'}</p><form onSubmit={handleAuth}><label>Usuario<input type="text" value={user} onChange={event => setUser(event.target.value)} autoComplete="username" required /></label><label>Contraseña<input type="password" value={pass} onChange={event => setPass(event.target.value)} autoComplete={modoRegistro ? 'new-password' : 'current-password'} minLength={modoRegistro ? 8 : 1} required /></label>{error && <p className="tienda-auth-message">{error}</p>}<button className="tienda-btn tienda-btn--primary tienda-btn--block" disabled={cargando}>{cargando ? 'Un momento...' : modoRegistro ? 'Crear mi cuenta →' : 'Entrar a mi espacio →'}</button></form></div></section></div>}
  </>;
}
