import { fetchAPI } from '../services/api';

export default function ProductCard({ p, rol, setProductoEdit, recargarProductos, mostrarNotificacion, onView }) {
  const eliminarProducto = async (id) => {
    if (window.confirm('¿Seguro de eliminar este producto?')) {
      try {
        await fetchAPI(`/productos/${id}`, { method: 'DELETE' });
        await recargarProductos();
      } catch (error) {
        mostrarNotificacion('error', 'No se pudo eliminar', error.message);
        return;
      }
      mostrarNotificacion('success', 'Producto eliminado', 'El producto se eliminó del catálogo.');
    }
  };

  return (
    <article className="tienda-card">
      {p.img && (
        <div className="tienda-card__media">
          <img crossOrigin="use-credentials" src={`http://localhost:3001${p.img}`} alt={p.nombre} />
          <span className="tienda-card__price">${p.precio}</span>
        </div>
      )}
      <div className="tienda-card__body">
        <h3 className="tienda-card__name">{p.nombre}</h3>
        {!p.img && <span className="tienda-card__price tienda-card__price--inline">${p.precio}</span>}
        <p className="tienda-card__meta">
          <span className={Number(p.stock) === 0 ? 'tienda-stock tienda-stock--out' : 'tienda-stock'}>{Number(p.stock) === 0 ? 'Agotado' : `${p.stock} disponibles`}</span>
          {p.categoria && <span className="tienda-card__tag">{p.categoria}</span>}
        </p>
        {p.descripcion && <p className="tienda-card__description">{p.descripcion}</p>}
        {rol !== 'admin' && <div className="tienda-card__actions tienda-card__actions--shop"><button type="button" className="tienda-btn tienda-btn--primary" onClick={() => onView(p)}>Ver producto</button><button type="button" className="tienda-icon-btn" onClick={() => mostrarNotificacion('info', 'Favoritos próximamente', 'Esta acción estará disponible pronto.')} aria-label="Guardar en favoritos">♡</button><button type="button" className="tienda-icon-btn" onClick={() => mostrarNotificacion('info', 'Carrito próximamente', 'Esta acción estará disponible pronto.')} aria-label="Añadir al carrito">＋</button></div>}
        {rol === 'admin' && (
          <div className="tienda-card__actions">
            <button onClick={() => { setProductoEdit(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="tienda-btn tienda-btn--warn">Editar</button>
            <button onClick={() => eliminarProducto(p.id)} className="tienda-btn tienda-btn--danger">Eliminar</button>
          </div>
        )}
      </div>
    </article>
  );
}
