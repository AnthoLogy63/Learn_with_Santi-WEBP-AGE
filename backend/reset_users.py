import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

def reset_users():
    print("Borrando usuarios existentes...")
    User.objects.all().delete()
    
    print("Creando usuario administrador: admin / 12345678")
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='12345678',
        dni='12345678'
    )
    
    print("Creando usuario estándar: usuario / 87654321")
    user = User.objects.create_user(
        username='usuario',
        email='usuario@example.com',
        password='87654321',
        dni='87654321'
    )
    
    print("¡Base de datos de usuarios reseteada con éxito!")

if __name__ == '__main__':
    reset_users()
