export default function ProductModal({ producto, onClose, mostrarNotificacion }) {
  if (!producto) return null;
  const noDisponible = Number(producto.stock) === 0;
  return (
    <div className="product-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <article className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <button type="button" className="product-modal__close" onClick={onClose} aria-label="Cerrar detalle">×</button>
        <div className="product-modal__image-wrap">{producto.img ? <img src={`http://localhost:3001${producto.img}`} alt={producto.nombre} /> : <span className="product-modal__placeholder">✦</span>}<span className="product-modal__label">{producto.categoria || 'Selección NOVA'}</span></div>
        <div className="product-modal__content"><p className="tienda-eyebrow">Detalle del producto</p><h2 id="product-modal-title">{producto.nombre}</h2><strong className="product-modal__price">${producto.precio}</strong><p className="product-modal__description">{producto.descripcion || 'Un producto seleccionado para acompañar tus días.'}</p><div className="product-modal__availability"><span className={noDisponible ? 'is-out' : ''}>{noDisponible ? 'Agotado' : 'Disponible'}</span><span>{noDisponible ? 'Sin unidades por ahora' : `${producto.stock} unidades en stock`}</span></div><div className="product-modal__actions"><button type="button" className="tienda-btn tienda-btn--primary tienda-btn--block" disabled={noDisponible} onClick={() => mostrarNotificacion('info', 'Carrito próximamente', 'Esta acción estará disponible en la siguiente versión.')}>＋ Añadir al carrito</button><button type="button" className="tienda-btn tienda-btn--ghost tienda-btn--block" onClick={() => mostrarNotificacion('info', 'Favoritos próximamente', 'Estamos preparando tu lista de favoritos.')}>♡ Guardar favorito</button></div></div>
      </article>
    </div>
  );
}
