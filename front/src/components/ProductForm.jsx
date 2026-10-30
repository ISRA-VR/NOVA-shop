import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';

export default function ProductForm({ categoriasUnicas, recargarProductos, productoEdit, setProductoEdit, mostrarNotificacion }) {
  const [formData, setFormData] = useState({ nombre: '', precio: '', categoria: '', stock: '', descripcion: '' });
  const [imagen, setImagen] = useState(null);

  useEffect(() => {
    if (productoEdit) setFormData({ ...productoEdit });
    else setFormData({ nombre: '', precio: '', categoria: '', stock: '', descripcion: '' });
  }, [productoEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key] === null ? '' : formData[key]));
    if (imagen) data.append('imagen', imagen);

    try {
      const endpoint = productoEdit ? `/productos/${productoEdit.id}` : '/productos';
      await fetchAPI(endpoint, {
        method: productoEdit ? 'PUT' : 'POST',
        body: data // Al pasar FormData, no enviamos Content-Type
      });
      alert(productoEdit ? '✅ ¡Producto actualizado!' : '✅ ¡Producto guardado!');
      setProductoEdit(null);
      setImagen(null);
      recargarProductos();
      mostrarNotificacion('success', productoEdit ? 'Producto actualizado' : 'Producto creado', productoEdit ? 'Los cambios se guardaron correctamente.' : 'El producto ya está disponible en el catálogo.');
    } catch (error) {
      alert(`❌ Fallo: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="tienda-panel">
      <h3 className="tienda-panel__title">{productoEdit ? 'Editar producto' : 'Nuevo producto'}</h3>
      <div className="tienda-field-grid">
        <input type="text" className="tienda-input" placeholder="Nombre del producto" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
        <input type="number" className="tienda-input" placeholder="Precio" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} required />
        <input type="text" list="lista-categorias" className="tienda-input" placeholder="Categoría" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} />
        <input type="number" className="tienda-input" placeholder="Stock" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
      </div>
      <datalist id="lista-categorias">
        {categoriasUnicas.map((cat, index) => <option key={index} value={cat} />)}
      </datalist>
      <textarea className="tienda-textarea" placeholder="Descripción" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})}></textarea>
      <input type="file" accept="image/png, image/jpeg" className="tienda-file-input" onChange={e => setImagen(e.target.files[0])} required={!productoEdit} />
      <div className="tienda-panel__actions">
        <button type="submit" className={`tienda-btn tienda-btn--block ${productoEdit ? 'tienda-btn--success' : 'tienda-btn--primary'}`}>
          {productoEdit ? 'Guardar cambios' : 'Crear producto'}
        </button>
        {productoEdit && <button type="button" onClick={() => setProductoEdit(null)} className="tienda-btn tienda-btn--ghost">Cancelar</button>}
      </div>
    </form>
  );
}
