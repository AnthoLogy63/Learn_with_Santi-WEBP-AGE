import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import call_command
import reset_users
import crear_examen_ejemplo

def setup():
    print("1. Creando tablas en PostgreSQL...")
    call_command('migrate')
    
    print("\n2. Creando usuarios admin y normales...")
    # reset_users.py ya tiene la lógica para crear 'admin' (12345678) y 'usuario' (87654321)
    reset_users.reset_users()
    
    print("\n3. Creando los 2 exámenes con sus preguntas...")
    # crear_examen_ejemplo.py tiene las 40 preguntas y opciones
    crear_examen_ejemplo.crear_examenes_mibonito_completo()
    
    print("\n✅ ¡Base de datos PostgreSQL lista y poblada!")

if __name__ == '__main__':
    setup()
