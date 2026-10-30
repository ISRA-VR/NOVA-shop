import { useMemo, useState } from 'react';
import { fetchAPI } from '../services/api';

const registroInicial = { username: '', nombre: '', apellidos: '', sexo: '', correo: '', numero: '', password: '', confirmarPassword: '', aceptaTerminos: false };

function PasswordInput({ label, name, value, onChange, visible, onToggle, autoComplete, required = true }) {
  return <label className="password-field">{label}<span className="password-field__control"><input type={visible ? 'text' : 'password'} name={name} value={value} onChange={onChange} autoComplete={autoComplete} required={required} /><button type="button" onClick={onToggle} aria-label={visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`} title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{visible ? '◉' : '◌'}</button></span></label>;
}

export default function AuthLandingHeader({ sesion, sesionComprobada, setSesion, mostrarNotificacion }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [login, setLogin] = useState({ username: '', password: '' });
  const [registro, setRegistro] = useState(registroInicial);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const fuerza = useMemo(() => { const value = registro.password; return [value.length >= 8, /[A-Z]/.test(value), /\d/.test(value), /[\W_]/.test(value)].filter(Boolean).length; }, [registro.password]);
  const abrirModal = (registroActivo) => { setModoRegistro(registroActivo); setError(''); setModalAbierto(true); };
  const actualizarRegistro = event => { const { name, value, type, checked } = event.target; setRegistro(current => ({ ...current, [name]: type === 'checkbox' ? checked : value })); };

  const handleSubmit = async event => {
    event.preventDefault(); setError('');
    const passSegura = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (modoRegistro && !passSegura.test(registro.password)) return setError('La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.');
    if (modoRegistro && registro.password !== registro.confirmarPassword) return setError('Las contraseñas no coinciden.');
    if (modoRegistro && !registro.aceptaTerminos) return setError('Debes aceptar los términos y condiciones.');
    setCargando(true);
    try {
      const body = modoRegistro ? registro : login;
      const data = await fetchAPI(modoRegistro ? '/registro' : '/login', { method: 'POST', body: JSON.stringify(body) });
      if (modoRegistro) { setModoRegistro(false); setRegistro(registroInicial); mostrarNotificacion('success', 'Cuenta creada', 'Ya puedes iniciar sesión con tu correo.'); }
      else { setSesion(data); setModalAbierto(false); mostrarNotificacion('success', 'Bienvenido', 'Has iniciado sesión correctamente.'); }
    } catch (requestError) { setError(requestError.message); mostrarNotificacion('error', 'No se pudo completar la operación', requestError.message); }
    finally { setCargando(false); }
  };
  const cerrarSesion = async () => { try { await fetchAPI('/logout', { method: 'POST' }); setSesion(null); mostrarNotificacion('success', 'Sesión cerrada', 'Has salido de tu cuenta.'); } catch (errorLogout) { mostrarNotificacion('error', 'No se pudo cerrar sesión', errorLogout.message); } };

  return <>
    <header className="landing-nav"><a className="landing-brand" href="/" aria-label="NOVA market inicio"><span className="landing-brand__mark">N</span><span>NOVA<em>·</em>market</span></a>{sesion ? <div className="landing-account"><span>Hola, <strong>{sesion.username}</strong></span><button className="tienda-btn tienda-btn--ghost" onClick={cerrarSesion}>Cerrar sesión</button></div> : sesionComprobada && <div className="landing-actions"><button className="landing-login" onClick={() => abrirModal(false)}>Iniciar sesión</button><button className="tienda-btn tienda-btn--primary" onClick={() => abrirModal(true)}>Crear cuenta <span>↗</span></button></div>}</header>
    {!sesion && sesionComprobada && <section className="landing-hero"><div className="landing-hero__eyebrow"><span /> Curaduría para tu día a día</div><h1>Todo lo que buscas,<br /><i>en un solo lugar.</i></h1><p>Inicia sesión o crea una cuenta para ver el catálogo completo.</p><div className="landing-hero__hint"><span>✦</span> Productos seleccionados con intención</div></section>}
    {modalAbierto && <div className="auth-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && setModalAbierto(false)}><section className={`auth-modal ${modoRegistro ? 'auth-modal--register' : ''}`} role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="auth-modal__close" onClick={() => setModalAbierto(false)} aria-label="Cerrar">×</button><div className="auth-modal__visual"><span>✦</span><p>NOVA·market</p><small>Tu próximo descubrimiento<br />comienza aquí.</small></div><div className="auth-modal__form"><div className="auth-modal__switch"><button type="button" className={!modoRegistro ? 'is-active' : ''} onClick={() => { setModoRegistro(false); setError(''); }}>Entrar</button><button type="button" className={modoRegistro ? 'is-active' : ''} onClick={() => { setModoRegistro(true); setError(''); }}>Registrarme</button></div><p className="tienda-eyebrow">Tu espacio personal</p><h2 id="auth-title">{modoRegistro ? 'Crea tu cuenta' : 'Qué bueno verte'}</h2><p className="auth-modal__copy">{modoRegistro ? 'Únete y empieza a descubrir.' : 'Entra para continuar explorando.'}</p><form onSubmit={handleSubmit}>{modoRegistro ? <><div className="auth-form-grid"><label>Nombre<input name="nombre" value={registro.nombre} onChange={actualizarRegistro} required /></label><label>Apellidos<input name="apellidos" value={registro.apellidos} onChange={actualizarRegistro} required /></label></div><div className="auth-form-grid"><label>Sexo<select name="sexo" value={registro.sexo} onChange={actualizarRegistro} required><option value="">Selecciona una opción</option><option value="femenino">Femenino</option><option value="masculino">Masculino</option><option value="no-binario">No binario</option><option value="prefiero-no-decir">Prefiero no decirlo</option></select></label><label>Número<input name="numero" value={registro.numero} onChange={actualizarRegistro} inputMode="tel" required /></label></div><label>Correo electrónico<input type="email" name="correo" value={registro.correo} onChange={actualizarRegistro} required /></label><div className="auth-form-grid"><PasswordInput label="Contraseña" name="password" value={registro.password} onChange={actualizarRegistro} visible={mostrarPassword} onToggle={() => setMostrarPassword(!mostrarPassword)} autoComplete="new-password" /><PasswordInput label="Confirmar contraseña" name="confirmarPassword" value={registro.confirmarPassword} onChange={actualizarRegistro} visible={mostrarConfirmacion} onToggle={() => setMostrarConfirmacion(!mostrarConfirmacion)} autoComplete="new-password" /></div><div className="password-strength"><div className="password-strength__track"><span style={{ width: `${fuerza * 25}%` }} className={`password-strength__bar password-strength__bar--${fuerza}`} /></div><span>{fuerza < 4 ? 'Usa 8+ caracteres, mayúscula, número y signo' : 'Contraseña segura'}</span></div><label className="terms-check"><input type="checkbox" name="aceptaTerminos" checked={registro.aceptaTerminos} onChange={actualizarRegistro} required /><span>Acepto los términos y condiciones y el aviso de privacidad.</span></label></> : <><label>Correo o usuario<input name="username" value={login.username} onChange={event => setLogin({ ...login, username: event.target.value })} required /></label><PasswordInput label="Contraseña" name="password" value={login.password} onChange={event => setLogin({ ...login, password: event.target.value })} visible={mostrarPassword} onToggle={() => setMostrarPassword(!mostrarPassword)} autoComplete="current-password" /></>}{error && <p className="tienda-auth-message">{error}</p>}<button className="tienda-btn tienda-btn--primary tienda-btn--block" disabled={cargando}>{cargando ? 'Un momento...' : modoRegistro ? 'Crear mi cuenta →' : 'Entrar a mi espacio →'}</button></form></div></section></div>}
  </>;
}
