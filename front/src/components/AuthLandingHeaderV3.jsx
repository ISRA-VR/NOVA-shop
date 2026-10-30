import { useMemo, useState } from 'react';
import { fetchAPI } from '../services/api';

const emptyRegistration = { username: '', nombre: '', apellidos: '', sexo: '', correo: '', numero: '', password: '', confirmarPassword: '', aceptaTerminos: false };

function PasswordField({ label, name, value, onChange, visible, toggle, autoComplete }) {
  return <label className="password-field">{label}<span className="password-field__control"><input type={visible ? 'text' : 'password'} name={name} value={value} onChange={onChange} autoComplete={autoComplete} required /><button type="button" onClick={toggle} aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{visible ? '◉' : '◌'}</button></span></label>;
}

export default function AuthLandingHeader({ sesion, sesionComprobada, setSesion, mostrarNotificacion }) {
  const [open, setOpen] = useState(false);
  const [register, setRegister] = useState(false);
  const [login, setLogin] = useState({ username: '', password: '' });
  const [form, setForm] = useState(emptyRegistration);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const strength = useMemo(() => [form.password.length >= 8, /[A-Z]/.test(form.password), /\d/.test(form.password), /[\W_]/.test(form.password)].filter(Boolean).length, [form.password]);
  const reset = () => { setOpen(false); setLogin({ username: '', password: '' }); setForm(emptyRegistration); setShowPassword(false); setShowConfirmation(false); setError(''); };
  const updateForm = event => { const { name, value, checked, type } = event.target; setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value })); };
  const submit = async event => {
    event.preventDefault(); setError('');
    const securePassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (register && !form.username.trim()) return setError('El nombre de usuario es obligatorio.');
    if (register && !securePassword.test(form.password)) return setError('La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.');
    if (register && form.password !== form.confirmarPassword) return setError('Las contraseñas no coinciden.');
    if (register && !form.aceptaTerminos) return setError('Debes aceptar los términos y condiciones.');
    setLoading(true);
    try {
      const data = await fetchAPI(register ? '/registro' : '/login', { method: 'POST', body: JSON.stringify(register ? form : login) });
      if (register) { setRegister(false); setForm(emptyRegistration); mostrarNotificacion('success', 'Cuenta creada', 'Ahora puedes iniciar sesión.'); }
      else { setSesion(data); reset(); mostrarNotificacion('success', 'Bienvenido', 'Has iniciado sesión correctamente.'); }
    } catch (requestError) { setError(requestError.message); mostrarNotificacion('error', 'No se pudo completar la operación', requestError.message); }
    finally { setLoading(false); }
  };
  const logout = async () => { try { await fetchAPI('/logout', { method: 'POST' }); setSesion(null); mostrarNotificacion('success', 'Sesión cerrada', 'Has salido de tu cuenta.'); } catch (logoutError) { mostrarNotificacion('error', 'No se pudo cerrar sesión', logoutError.message); } };
  return <>
    <header className="landing-nav"><a className="landing-brand" href="/" aria-label="NOVA market inicio"><span className="landing-brand__mark">N</span><span>NOVA<em>·</em>market</span></a>{sesion ? <div className="landing-account"><span>Hola, <strong>{sesion.username}</strong></span><button className="tienda-btn tienda-btn--ghost" onClick={logout}>Cerrar sesión</button></div> : sesionComprobada && <div className="landing-actions"><button className="landing-login" onClick={() => { setRegister(false); setOpen(true); }}>Iniciar sesión</button><button className="tienda-btn tienda-btn--primary" onClick={() => { setRegister(true); setOpen(true); }}>Crear cuenta <span>↗</span></button></div>}</header>
    {!sesion && sesionComprobada && <section className="landing-hero"><div className="landing-hero__eyebrow"><span /> Curaduría para tu día a día</div><h1>Todo lo que buscas,<br /><i>en un solo lugar.</i></h1><p>Inicia sesión o crea una cuenta para ver el catálogo completo.</p><div className="landing-hero__hint"><span>✦</span> Productos seleccionados con intención</div></section>}
    {open && <div className="auth-backdrop" onMouseDown={event => event.target === event.currentTarget && reset()}><section className={`auth-modal ${register ? 'auth-modal--register' : ''}`} role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="auth-modal__close" onClick={reset} aria-label="Cerrar">×</button><div className="auth-modal__visual"><span>✦</span><p>NOVA·market</p><small>Tu próximo descubrimiento<br />comienza aquí.</small></div><div className="auth-modal__form"><div className="auth-modal__switch"><button type="button" className={!register ? 'is-active' : ''} onClick={() => { setRegister(false); setError(''); }}>Entrar</button><button type="button" className={register ? 'is-active' : ''} onClick={() => { setRegister(true); setError(''); }}>Registrarme</button></div><p className="tienda-eyebrow">Tu espacio personal</p><h2 id="auth-title">{register ? 'Crea tu cuenta' : 'Qué bueno verte'}</h2><p className="auth-modal__copy">{register ? 'Únete y empieza a descubrir.' : 'Entra para continuar explorando.'}</p><form onSubmit={submit}>{register ? <><label>Nombre de usuario<input name="username" value={form.username} onChange={updateForm} autoComplete="username" required /></label><div className="auth-form-grid"><label>Nombre<input name="nombre" value={form.nombre} onChange={updateForm} required /></label><label>Apellidos<input name="apellidos" value={form.apellidos} onChange={updateForm} required /></label></div><div className="auth-form-grid"><label>Sexo<select name="sexo" value={form.sexo} onChange={updateForm} required><option value="">Selecciona una opción</option><option value="femenino">Femenino</option><option value="masculino">Masculino</option><option value="no-binario">No binario</option><option value="prefiero-no-decir">Prefiero no decirlo</option></select></label><label>Número<input name="numero" value={form.numero} onChange={updateForm} inputMode="tel" required /></label></div><label>Correo electrónico<input type="email" name="correo" value={form.correo} onChange={updateForm} required /></label><div className="auth-form-grid"><PasswordField label="Contraseña" name="password" value={form.password} onChange={updateForm} visible={showPassword} toggle={() => setShowPassword(!showPassword)} autoComplete="new-password" /><PasswordField label="Confirmar contraseña" name="confirmarPassword" value={form.confirmarPassword} onChange={updateForm} visible={showConfirmation} toggle={() => setShowConfirmation(!showConfirmation)} autoComplete="new-password" /></div><div className="password-strength"><div className="password-strength__track"><span style={{ width: `${strength * 25}%` }} className={`password-strength__bar password-strength__bar--${strength}`} /></div><span>{strength === 4 ? 'Contraseña segura' : 'Usa 8+ caracteres, mayúscula, número y signo'}</span></div><label className="terms-check"><input type="checkbox" name="aceptaTerminos" checked={form.aceptaTerminos} onChange={updateForm} required /><span>Acepto los términos y condiciones y el aviso de privacidad.</span></label></> : <><label>Correo o usuario<input value={login.username} onChange={event => setLogin({ ...login, username: event.target.value })} autoComplete="username" required /></label><PasswordField label="Contraseña" name="password" value={login.password} onChange={event => setLogin({ ...login, password: event.target.value })} visible={showPassword} toggle={() => setShowPassword(!showPassword)} autoComplete="current-password" /></>}{error && <p className="tienda-auth-message">{error}</p>}<button className="tienda-btn tienda-btn--primary tienda-btn--block" disabled={loading}>{loading ? 'Un momento...' : register ? 'Crear mi cuenta →' : 'Entrar a mi espacio →'}</button></form></div></section></div>}
  </>;
}
