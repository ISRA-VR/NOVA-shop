import { useEffect, useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';
import { fetchAPI } from '../services/api';

const sections = [
  { id: 'dashboard', icon: '⌂', label: 'Dashboard' },
  { id: 'usuarios', icon: '♙', label: 'Usuarios' },
  { id: 'nuevo', icon: '＋', label: 'Añadir' },
  { id: 'productos', icon: '▦', label: 'Productos' },
];

export default function AdminPanel({ productos, categoriasUnicas, recargarProductos, productoEdit, setProductoEdit, mostrarNotificacion }) {
  const [active, setActive] = useState('dashboard');
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const cargarUsuarios = async () => {
    setLoadingUsers(true);
    try { setUsuarios(await fetchAPI('/usuarios')); }
    catch (error) { mostrarNotificacion('error', 'No se pudieron cargar los usuarios', error.message); }
    finally { setLoadingUsers(false); }
  };
  useEffect(() => { if (active === 'usuarios') cargarUsuarios(); }, [active]);
  useEffect(() => { if (productoEdit) setActive('productos'); }, [productoEdit]);

  const adminStats = useMemo(() => ({ total: productos.length, stock: productos.reduce((total, product) => total + Number(product.stock || 0), 0), categorias: categoriasUnicas.length, agotados: productos.filter(product => Number(product.stock) === 0).length }), [productos, categoriasUnicas]);
  const terminarProducto = () => { setProductoEdit(null); setActive('productos'); };

  return <section className="admin-space">
    <div className="admin-space__intro"><div><p className="tienda-eyebrow">Centro de control</p><h1>Hola, administrador.</h1><p>Gestiona tu tienda desde un solo lugar.</p></div><div className="admin-space__status"><span /> Sistema operativo</div></div>
    {active === 'dashboard' && <div className="admin-view admin-dashboard"><div className="admin-stat-grid"><article><span>Productos</span><strong>{adminStats.total}</strong><small>en tu catálogo</small></article><article><span>Stock total</span><strong>{adminStats.stock}</strong><small>unidades disponibles</small></article><article><span>Categorías</span><strong>{adminStats.categorias}</strong><small>colecciones activas</small></article><article><span>Agotados</span><strong className={adminStats.agotados ? 'admin-stat--warning' : ''}>{adminStats.agotados}</strong><small>requieren atención</small></article></div><div className="admin-dashboard__feature"><div><p className="tienda-eyebrow">Acceso rápido</p><h2>Haz que tu catálogo<br /><i>se mueva contigo.</i></h2><p>Crea productos, revisa existencias y conoce a tu comunidad.</p></div><button type="button" className="tienda-btn tienda-btn--primary" onClick={() => setActive('nuevo')}>＋ Añadir producto</button></div><div className="admin-dashboard__recent"><div><h2>Últimos productos</h2><button type="button" onClick={() => setActive('productos')}>Ver todos →</button></div>{productos.slice(0, 3).map(product => <div className="admin-recent-row" key={product.id}><span>{product.nombre}</span><span>{product.categoria || 'Sin categoría'}</span><strong>${product.precio}</strong></div>)}</div></div>}
    {active === 'usuarios' && <div className="admin-view"><div className="admin-section-heading"><div><p className="tienda-eyebrow">Comunidad</p><h2>Usuarios registrados</h2></div><span>{usuarios.length} cuentas</span></div>{loadingUsers ? <div className="admin-loading">Cargando usuarios…</div> : <div className="admin-users-table">{usuarios.map(user => <article className="admin-user-row" key={user.id}><span className="admin-user-avatar">{user.username?.charAt(0).toUpperCase()}</span><div><strong>{user.username}</strong><small>{user.correo}</small></div><span>{user.apellidos || 'Sin apellidos'}</span><span className="admin-user-role">{user.rol}</span></article>)}</div>}</div>}
    {active === 'nuevo' && <div className="admin-view admin-form-view"><div className="admin-section-heading"><div><p className="tienda-eyebrow">Inventario</p><h2>Nuevo producto</h2></div></div><ProductForm categoriasUnicas={categoriasUnicas} recargarProductos={recargarProductos} productoEdit={null} setProductoEdit={setProductoEdit} mostrarNotificacion={mostrarNotificacion} /></div>}
    {active === 'productos' && <div className="admin-view"><div className="admin-section-heading"><div><p className="tienda-eyebrow">Inventario</p><h2>Todos los productos</h2></div><span>{productos.length} productos</span></div><div className="tienda-grid admin-product-grid">{productos.map(product => <ProductCard key={product.id} p={product} rol="admin" setProductoEdit={setProductoEdit} recargarProductos={recargarProductos} mostrarNotificacion={mostrarNotificacion} />)}</div></div>}
    {productoEdit && <div className="admin-edit-backdrop"><div className="admin-edit-modal"><button type="button" className="product-modal__close" onClick={terminarProducto} aria-label="Cerrar edición">×</button><ProductForm categoriasUnicas={categoriasUnicas} recargarProductos={recargarProductos} productoEdit={productoEdit} setProductoEdit={setProductoEdit} mostrarNotificacion={mostrarNotificacion} /></div></div>}
    <nav className="admin-bottom-nav" aria-label="Navegación de administrador">{sections.map(section => <button type="button" key={section.id} className={active === section.id ? 'is-active' : ''} onClick={() => { setProductoEdit(null); setActive(section.id); }}><span>{section.icon}</span><small>{section.label}</small></button>)}</nav>
  </section>;
}
