# Guía de Despliegue (Supabase, Render y Vercel)

Esta guía documenta los pasos precisos y los archivos que debes editar para desplegar tu proyecto.  
**Stack de producción:**
- **Base de Datos:** Supabase (PostgreSQL)
- **Backend:** Django (Render)
- **Frontend:** React/Vite (Vercel)

---

## 1. Base de Datos (Supabase)

Tu base de datos ya está lista en Supabase.
- **Connection String:** `postgresql://postgres:[oGKuwQaknGVANcfX]@db.scjqnfyziuzhogebsmnx.supabase.co:5432/postgres`
- **Nota:** Asegúrate de reemplazar `[TU-PASSWORD]` con la contraseña que definiste al crear el proyecto en Supabase.

---

## 2. Backend (Django en Render)

Para que el backend funcione en producción, debes realizar los siguientes cambios en:
`backend/config/settings.py`

### A. Seguridad y Host
Busca y actualiza estas líneas:
```python
# Desactivar Debug en producción
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Permitir el dominio de Render
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost 127.0.0.1 .onrender.com').split(' ')
```

### B. Conexión a Base de Datos (Supabase)
Sustituye la configuración actual de `DATABASES` por una que use la URL de Supabase:
```python
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', 'postgresql://postgres:[TU-PASSWORD]@db.scjqnfyziuzhogebsmnx.supabase.co:5432/postgres'),
        conn_max_age=600
    )
}
```

### C. CORS (Comunicación con el Frontend)
Asegúrate de que el backend acepte peticiones desde Vercel:
```python
CORS_ALLOWED_ORIGINS = [
    'https://learn-with-santi-webp-age.vercel.app', # Tu dominio principal de Vercel
    'http://localhost:5173',                         # Para pruebas locales
]
```

### Variables de Entorno en Render
En el panel de Render, añade estas **Environment Variables**:
- `DATABASE_URL`: La cadena de conexión de Supabase (completa).
- `SECRET_KEY`: Una cadena aleatoria larga.
- `DEBUG`: `False`.

---

## 3. Frontend (React/Vite en Vercel)

El frontend debe saber dónde está tu API de Render.

### A. Ubicación del archivo de configuración
Normalmente en: `frontend/src/api/apiConfig.ts` (o donde definas la URL base).
Asegúrate de que use variables de entorno:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
```

### B. Configuración en Vercel
En el panel de Vercel (Settings -> Environment Variables), añade:
- **Key**: `VITE_API_URL`
- **Value**: `https://tu-app-en-render.onrender.com/api`

---

## 4. Pasos Finales

1. **Subir Cambios**: Una vez edites los archivos mencionados, haz `git commit` y `push`.
2. **Migrar DB**: En Render, puedes entrar a la "Shell" de tu servicio o usar un comando de "Build" para ejecutar:
   ```bash
   python manage.py migrate
   ```
   Esto creará todas las tablas necesarias en Supabase.
3. **Verificar**: Entra a tu URL de Vercel y comprueba que los datos cargan correctamente.

