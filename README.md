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

## ☁️ Despliegue en Render

El proyecto ya incluye `render.yaml` en la raíz del repositorio. Para desplegar en Render:

1. Sube el repositorio a GitHub si aún no lo has hecho.
2. Crea un nuevo servicio en Render y conéctalo a tu repositorio.
3. Render detectará `render.yaml` y usará:
   - Root: `.`
   - Build command: `npm install`
   - Start command: `npm start`
4. Asegúrate de que el servicio use Node y que la app se despliegue desde la carpeta raíz del repo.

### Verificación

Después de desplegar, abre:

- `https://<tu-app>.onrender.com/api/status`

Debe devolver un JSON con `status: "running"`.

### Notas

- En Render el servidor debe correr `server.js`, no solo servir HTML estático.
- Si todo está bien, la API `PUT /api/content` será accesible y los cambios admin se podrán guardar.
