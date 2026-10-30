import { useMemo, useState } from 'react';
import { fetchAPI } from '../services/api';

const initialRegistro = { nombre: '', apellidos: '', sexo: '', correo: '', numero: '', password: '', confirmarPassword: '', aceptaTerminos: false };

export default function AuthLandingHeader({ sesion, sesionComprobada, setSesion }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [login, setLogin] = useState({ username: '', password: '' });
  const [registro, setRegistro] = useState(initialRegistro);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const abrirModal = (registroActivo) => { setModoRegistro(registroActivo); setError(''); setModalAbierto(true); };
  const cambiarModo = (registroActivo) => { setModoRegistro(registroActivo); setError(''); };
  const actualizarRegistro = (event) => { const { name, value, type, checked } = event.target; setRegistro(actual => ({ ...actual, [name]: type === 'checkbox' ? checked : value })); };
  const fuerza = useMemo(() => { const value = registro.password; return !value ? 0 : [value.length >= 8, /[A-Z]/.test(value), /\d/.test(value), /[\W_]/.test(value)].filter(Boolean).length; }, [registro.password]);

  const handleSubmit = async (event) => {
    event.preventDefault(); setError('');
    if (modoRegistro && registro.password !== registro.confirmarPassword) return setError('Las contraseñas no coinciden.');
    if (modoRegistro && !registro.aceptaTerminos) return setError('Debes aceptar los términos y condiciones.');
    setCargando(true);
    try {
      const data = await fetchAPI(modoRegistro ? '/registro' : '/login', { method: 'POST', body: JSON.stringify(modoRegistro ? registro : { username: login.username, password: login.password }) });
      if (modoRegistro) { setModoRegistro(false); setRegistro(initialRegistro); setError('Cuenta creada. Ahora puedes iniciar sesión.'); }
      else { setSesion(data); setModalAbierto(false); }
    } catch (requestError) { setError(requestError.message); }
    finally { setCargando(false); }
  };
  const cerrarSesion = async () => { await fetchAPI('/logout', { method: 'POST' }); setSesion(null); };

  return <>
    <header className="landing-nav"><a className="landing-brand" href="/" aria-label="NOVA market inicio"><span className="landing-brand__mark">N</span><span>NOVA<em>·</em>market</span></a>{sesion ? <div className="landing-account"><span>Hola, <strong>{sesion.username}</strong></span><button className="tienda-btn tienda-btn--ghost" onClick={cerrarSesion}>Cerrar sesión</button></div> : sesionComprobada && <div className="landing-actions"><button className="landing-login" onClick={() => abrirModal(false)}>Iniciar sesión</button><button className="tienda-btn tienda-btn--primary" onClick={() => abrirModal(true)}>Crear cuenta <span>↗</span></button></div>}</header>
    {!sesion && sesionComprobada && <section className="landing-hero"><div className="landing-hero__eyebrow"><span /> Curaduría para tu día a día</div><h1>Todo lo que buscas,<br /><i>en un solo lugar.</i></h1><p>Inicia sesión o crea una cuenta para ver el catálogo completo.</p><div className="landing-hero__hint"><span>✦</span> Productos seleccionados con intención</div></section>}
    {modalAbierto && <div className="auth-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && setModalAbierto(false)}><section className={`auth-modal ${modoRegistro ? 'auth-modal--register' : ''}`} role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="auth-modal__close" onClick={() => setModalAbierto(false)} aria-label="Cerrar">×</button><div className="auth-modal__visual"><span>✦</span><p>NOVA·market</p><small>Tu próximo descubrimiento<br />comienza aquí.</small></div><div className="auth-modal__form"><div className="auth-modal__switch"><button type="button" className={!modoRegistro ? 'is-active' : ''} onClick={() => cambiarModo(false)}>Entrar</button><button type="button" className={modoRegistro ? 'is-active' : ''} onClick={() => cambiarModo(true)}>Registrarme</button></div><p className="tienda-eyebrow">Tu espacio personal</p><h2 id="auth-title">{modoRegistro ? 'Crea tu cuenta' : 'Qué bueno verte'}</h2><p className="auth-modal__copy">{modoRegistro ? 'Únete y empieza a descubrir.' : 'Entra para continuar explorando.'}</p><form onSubmit={handleSubmit}>{modoRegistro ? <><div className="auth-form-grid"><label>Nombre<input name="nombre" value={registro.nombre} onChange={actualizarRegistro} autoComplete="given-name" required /></label><label>Apellidos<input name="apellidos" value={registro.apellidos} onChange={actualizarRegistro} autoComplete="family-name" required /></label></div><div className="auth-form-grid"><label>Sexo<select name="sexo" value={registro.sexo} onChange={actualizarRegistro} required><option value="">Selecciona una opción</option><option value="femenino">Femenino</option><option value="masculino">Masculino</option><option value="no-binario">No binario</option><option value="prefiero-no-decir">Prefiero no decirlo</option></select></label><label>Número<input name="numero" value={registro.numero} onChange={actualizarRegistro} inputMode="tel" autoComplete="tel" required /></label></div><label>Correo electrónico<input type="email" name="correo" value={registro.correo} onChange={actualizarRegistro} autoComplete="email" required /></label><div className="auth-form-grid"><label>Contraseña<input type="password" name="password" value={registro.password} onChange={actualizarRegistro} autoComplete="new-password" required /></label><label>Confirmar contraseña<input type="password" name="confirmarPassword" value={registro.confirmarPassword} onChange={actualizarRegistro} autoComplete="new-password" required /></label></div><div className="password-strength" aria-live="polite"><div className="password-strength__track"><span style={{ width: `${fuerza * 25}%` }} className={`password-strength__bar password-strength__bar--${fuerza}`} /></div><span>{fuerza < 4 ? 'Usa 8+ caracteres, mayúscula, número y signo' : 'Contraseña segura'}</span></div><label className="terms-check"><input type="checkbox" name="aceptaTerminos" checked={registro.aceptaTerminos} onChange={actualizarRegistro} required /><span>Acepto los términos y condiciones y el aviso de privacidad.</span></label></> : <><label>Correo o usuario<input name="username" value={login.username} onChange={event => setLogin({ ...login, username: event.target.value })} autoComplete="username" required /></label><label>Contraseña<input type="password" name="password" value={login.password} onChange={event => setLogin({ ...login, password: event.target.value })} autoComplete="current-password" required /></label></>}{error && <p className="tienda-auth-message">{error}</p>}<button className="tienda-btn tienda-btn--primary tienda-btn--block" disabled={cargando}>{cargando ? 'Un momento...' : modoRegistro ? 'Crear mi cuenta →' : 'Entrar a mi espacio →'}</button></form></div></section></div>}
  </>;
}
