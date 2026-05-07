# 🚀 GUÍA RÁPIDA DE DEPLOY EN RENDER

## Requisitos
1. Cuenta **GitHub** (gratuita)
2. Cuenta **Render** (gratuita)

## PASO A PASO (MUY FÁCIL)

### 1️⃣ CREAR REPOSITORIO EN GITHUB (5 minutos)

1. Ve a https://github.com/new
2. Llena el formulario:
   - **Repository name**: `vitalyx`
   - **Description**: `Vitalyx Studios - Desarrollo de Juegos Roblox`
   - Elige **Public** (importante para Render gratis)
   - Click en **Create repository**

3. Verás instrucciones. Copia el botón verde "Clone" → **HTTPS** (la URL que empieza con `https://`)

### 2️⃣ SUBIR TU CÓDIGO A GITHUB (5 minutos)

Ve a esta carpeta en tu computadora y ejecuta en PowerShell o CMD:

```powershell
# Reemplaza URL_DEL_REPO con la URL que copiaste (ej: https://github.com/tuusuario/vitalyx.git)
cd C:\Users\Ryzen\Documents\2.0\vitalyx

git init
git add .
git commit -m "Initial commit - Vitalyx Studios"
git branch -M main
git remote add origin URL_DEL_REPO
git push -u origin main
```

**Si no tienes Git instalado**, descarga desde: https://git-scm.com/download/win

### 3️⃣ DESPLEGAR EN RENDER (5 minutos)

1. Ve a https://render.com y regístrate (puedes usar GitHub login)
2. Click en **Dashboard** (arriba derecha)
3. Click en **New +** → **Web Service**
4. Elige **GitHub** y selecciona tu repo `vitalyx`
5. Llena el formulario:
   - **Name**: `vitalyx`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (gratuito)
6. Click **Deploy**

⏳ Espera 2-3 minutos mientras se despliega...

### 4️⃣ ¡LISTO! 🎉

Render te dará una URL tipo: `https://vitalyx-xxxxx.onrender.com`

**Desde ahora**:
- Comparte esta URL con tu amigo
- Cuando él edite contenido en el panel admin, **TÚ verás los cambios en tiempo real**
- Los datos se guardan en `server-data.json` en el servidor de Render

### 5️⃣ PRÓXIMAS VECES (Actualizar la página)

Si cambias código localmente, solo haz:
```powershell
git add .
git commit -m "Mensaje de cambio"
git push
```

Render redeployará automáticamente en 1-2 minutos.

---

## ⚠️ IMPORTANTE

- **Admin login**: `admin` / `admin123` (cámbialo después por seguridad)
- **La página es pública**, cualquiera puede verla pero solo admin puede editar
- **Datos**: Se guardan en `server-data.json` en Render (reemplazados si reinicias)
- Para **backups** de datos, entra a Render Dashboard → tu app → Shell y descarga `server-data.json`

---

## ❓ PROBLEMAS COMUNES

**"Git no encontrado"**: Instala desde https://git-scm.com/download/win

**"Error al hacer push"**: GitHub pedirá autenticación. Usa tu usuario y **contraseña de aplicación** (genera en GitHub → Settings → Developer settings → Personal access tokens)

**"Render dice error de build"**: Asegúrate que:
- `package.json` tenga `"start": "node server.js"`
- `server.js` use `process.env.PORT` (ya lo hace)

**¿Preguntas?** Pregúntame en el chat.
