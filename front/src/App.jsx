import { useState, useEffect, startTransition } from 'react';
import Header from './components/AuthLandingHeaderV4';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';
import Notification from './components/Notification';
import ProductModal from './components/ProductModal';
import AdminPanel from './components/AdminPanel';
import { fetchAPI } from './services/api';
import './styles/App.css';

function App() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [notification, setNotification] = useState(null);
  const mostrarNotificacion = (type, title, message) => setNotification({ type, title, message });
  const [sesion, setSesion] = useState(null);
  const [sesionComprobada, setSesionComprobada] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [productoEdit, setProductoEdit] = useState(null);
  const [busqueda, setBusqueda] = useState(''); // NUEVA FUNCIÓN: Filtro

  const restaurarSesion = async () => {
    try {
      const data = await fetchAPI('/session');
      startTransition(() => setSesion(data));
    } catch {
      setSesion(null);
    } finally {
      startTransition(() => setSesionComprobada(true));
    }
  };

  const cargarProductos = async () => {
    if (!sesion) {
      startTransition(() => setProductos([]));
      return;
    }
    try {
      const data = await fetchAPI('/productos');
      startTransition(() => setProductos(data));
    } catch (e) {
      console.error(e);
      mostrarNotificacion('error', 'No se pudo cargar el catálogo', e.message);
    }
  };

  useEffect(() => { restaurarSesion(); }, []);
  useEffect(() => { cargarProductos(); }, [sesion]);
  useEffect(() => {
    if (!notification) return undefined;
    const timer = window.setTimeout(() => setNotification(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const categoriasUnicas = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
  const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) && (categoriaActiva === 'Todas' || p.categoria === categoriaActiva));

  return (
    <div className="tienda-app">
      <div className="tienda-aurora" aria-hidden="true">
        <span className="tienda-aurora__blob tienda-aurora__blob--violet"></span>
        <span className="tienda-aurora__blob tienda-aurora__blob--teal"></span>
        <span className="tienda-aurora__blob tienda-aurora__blob--gold"></span>
      </div>

      <Notification notification={notification} onClose={() => setNotification(null)} />
      <div className="tienda-shell container">
        <Header sesion={sesion} sesionComprobada={sesionComprobada} setSesion={setSesion} mostrarNotificacion={mostrarNotificacion} />

        {sesion?.rol === 'admin' && <AdminPanel productos={productos} categoriasUnicas={categoriasUnicas} recargarProductos={cargarProductos} productoEdit={productoEdit} setProductoEdit={setProductoEdit} mostrarNotificacion={mostrarNotificacion} />}

        {sesion?.rol !== 'admin' && sesion && (
          <>
            <section className="tienda-catalog-head"><div><p className="tienda-eyebrow">Catálogo curado para ti</p><h1>Descubre algo extraordinario</h1><p className="tienda-catalog-head__summary">{productos.length} productos disponibles</p></div><div className="tienda-catalog-head__metric"><span className="tienda-catalog-head__metric-dot" /> Sesión activa</div></section>
            <div className="tienda-filters">{['Todas', ...categoriasUnicas].map(categoria => <button type="button" key={categoria} className={`tienda-filter ${categoriaActiva === categoria ? 'tienda-filter--active' : ''}`} onClick={() => setCategoriaActiva(categoria)}>{categoria}</button>)}</div>
            <input 
              type="text" 
              className="tienda-search-bar" 
              placeholder="🔍 Buscar productos por nombre..." 
              value={busqueda} 
              onChange={e => setBusqueda(e.target.value)} 
            />
            <div className="tienda-grid">
              {productosFiltrados.map(p => (
                <ProductCard key={p.id} p={p} rol={sesion.rol} setProductoEdit={setProductoEdit} recargarProductos={cargarProductos} mostrarNotificacion={mostrarNotificacion} onView={setProductoSeleccionado} />
              ))}
            </div>
            {!productosFiltrados.length && <div className="tienda-empty"><span>✦</span><h2>No encontramos coincidencias</h2><p>Prueba con otro nombre o categoría.</p></div>}
          </>
        )}

        {!sesion && sesionComprobada && (
          <div className="tienda-hero">
            <h1>Todo lo que buscas, en un solo lugar.</h1>
            <p>Inicia sesión o crea una cuenta para ver el catálogo completo.</p>
          </div>
        )}
      </div>
      <ProductModal producto={productoSeleccionado} onClose={() => setProductoSeleccionado(null)} mostrarNotificacion={mostrarNotificacion} />
      <Footer />
    </div>
  );
}

export default App;
