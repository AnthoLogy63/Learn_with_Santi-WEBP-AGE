# Guía de Despliegue (Vercel y Render)

Esta guía documenta los cambios que deberás realizar en tu código y configuración cuando decidas volver a desplegar tu proyecto (Backend en Render y Frontend en Vercel).

## 1. Backend (Django en Render)

Actualmente, el archivo `backend/config/settings.py` está configurado para un entorno de **desarrollo local** (usando `localhost` y tu base de datos local `LearWithSanti`). 

Antes de subir tus cambios a producción, debes revertir o ajustar las siguientes configuraciones en `settings.py`:

### A. Entorno y Seguridad
- **DEBUG**: Asegúrate de no tenerlo activado siempre en el entorno de producción.
  ```python
  DEBUG = os.environ.get('DEBUG', 'False') == 'True'
  ```
- **ALLOWED_HOSTS**: Debe incluir `.onrender.com` para que Render pueda servir la aplicación.
  ```python
  ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost 127.0.0.1 .onrender.com').split(' ')
  ```

### B. Base de Datos
- Vuelve a usar `dj_database_url` para que Django se pueda conectar a la base de datos PostgreSQL alojada en Render empleando la variable `DATABASE_URL`.
  ```python
  DATABASE_URL = os.environ.get('DATABASE_URL', 'aquí-puedes-poner-tu-url-de-render')
  if DATABASE_URL:
      import dj_database_url
      DATABASES = {
          'default': dj_database_url.config(default=DATABASE_URL, conn_max_age=600)
      }
  ```

### C. CORS y Orígenes Permitidos
- Debes permitir que el frontend desplegado en Vercel se comunique con el backend en Render.
  ```python
  CORS_ALLOW_ALL_ORIGINS = os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'True') == 'True'
  CORS_ALLOWED_ORIGINS = [
      'https://learn-with-santi-webp-dgftzgpnv-anthonys-projects-86a774cf.vercel.app',
      'https://learn-with-santi-webp-age.vercel.app',
  ] + [origin for origin in os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',') if origin]
  ```

### Variables de Entorno en Render
Asegúrate de configurar las siguientes **Environment Variables** en la consola de Render para tu servicio web:
- `DATABASE_URL`: La URL de tu base de datos PostgreSQL (Render la crea automáticamente cuando creas una DB).
- `SECRET_KEY`: Una clave secreta segura para Django.
- `DEBUG`: `False`.

---

## 2. Frontend (React/Vite en Vercel)

El frontend ha sido adaptado para buscar primero una URL de la API en el despliegue, y si no la encuentra, usar `localhost`.

### A. Configuración de API URL
En Vercel, debes agregar una **Environment Variable** (Variable de entorno) llamada `VITE_API_URL`.
- **Name**: `VITE_API_URL`
- **Value**: `https://tu-backend-en-render.onrender.com/api` (Reemplaza "tu-backend-en-render" con el dominio real de tu API en Render).

Gracias a un cambio implementado, el código del frontend ya está preparado para leer este valor sin necesidad de editar manualmente TypeScript durante el despliegue:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
```

## Resumen de pasos en el futuro
1. Modificar y ajustar `backend/config/settings.py` como se muestra arriba.
2. Hacer `git add .`, `git commit` y subir (push) al respectivo branch en GitHub que lee Render y Vercel.
3. Actualizar o verificar de las variables de entorno en los paneles de Vercel y Render.
4. Recordar ejecutar migración de tablas en el lado de Render si fuera necesario.

---
**Nota actual:** Para crear las tablas de forma local de tu base de datos `LearWithSanti` con el usuario `admin`, sólo tienes que seguir tus pasos y ejecutar dentro de la carpeta `/backend` en su debido momento el comando:  
`python manage.py migrate`
