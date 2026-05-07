# Vitalyx Studios - Servidor de Desarrollo

## 🚀 Inicio Rápido

```bash
# Desde la carpeta del proyecto
node server.js
```

El servidor se ejecutará en: `http://localhost:3000`

## 📁 Estructura de URLs

- **Frontend principal**: `http://localhost:3000/`
- **Frontend con ruta fija**: `http://localhost:3000/app/`
- **API Portfolio**: `http://localhost:3000/api/portfolio`
- **Estado del servidor**: `http://localhost:3000/api/status`

## 🔄 Desarrollo en Vivo

Cuando guardes cambios en VS Code:

1. **Archivos HTML/CSS/JS**: Simplemente recarga la página en el navegador
2. **Cambios en server.js**: Reinicia el servidor manualmente
3. **Cambios en portfolio**: Se sincronizan automáticamente entre navegadores

## 📊 Características

- ✅ Persistencia global de datos del portfolio
- ✅ Headers anti-cache para desarrollo
- ✅ API REST completa para portfolio
- ✅ Rutas fijas configurables para deployment
- ✅ CORS habilitado para desarrollo

## 🛠️ API Endpoints

### Portfolio
- `GET /api/portfolio` - Obtener todos los juegos
- `POST /api/portfolio/custom` - Crear juego personalizado
- `PUT /api/portfolio/custom/{index}` - Actualizar juego personalizado
- `DELETE /api/portfolio/custom/{index}` - Eliminar juego personalizado
- `PUT /api/portfolio/default/{index}` - Editar juego por defecto
- `DELETE /api/portfolio/default/{index}` - Ocultar juego por defecto

### Sistema
- `GET /api/status` - Estado del servidor

## 📝 Notas de Desarrollo

- Los archivos se sirven sin cache durante desarrollo
- Los datos se guardan en `server-data.json`
- Compatible con múltiples navegadores simultáneamente