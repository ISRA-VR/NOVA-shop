//admin: admin admin123
//user: isra israx123123
//node server.js //npm run dev

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const { verificarSesion } = require('./middlewares/authMiddleware');

const app = express();
const puerto = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Archivos estáticos
app.use('/uploads', verificarSesion, express.static(path.join(__dirname, 'uploads')));

// Health Check de la API
app.get('/', (req, res) => {
  res.status(200).json({
    estado: 'Óptimo',
    mensaje: '¡El backend está corriendo al 100! 🚀',
    desarrollador: 'IsraVR',
    entorno: process.env.NODE_ENV || 'desarrollo',
    tiempo_activo_segundos: Math.floor(process.uptime()),
    timestamp: new Date().toLocaleString('es-MX')
  });
});

// Montaje de rutas
app.use('/api', authRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/usuarios', userRoutes);

// Manejador global de errores (Nueva función recomendada)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor' });
});

app.listen(puerto, () => {
  console.log(`Backend modularizado corriendo en http://localhost:${puerto}`);
});
