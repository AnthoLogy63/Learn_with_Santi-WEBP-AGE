from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser
from django.contrib.auth import authenticate, login
from django.utils import timezone
from datetime import timedelta
import openpyxl

from .models import User, Rank
from .serializers import UserSerializer, RankSerializer, UserListSerializer


class IsStaff(IsAuthenticated):
    """Permiso: solo usuarios staff (admin)."""
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.is_staff


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        dni = request.data.get('dni')

        if not username or not dni:
            return Response({'error': 'Username and DNI are required'}, status=status.HTTP_400_BAD_REQUEST)

        # El DNI se usa como contraseña
        user = authenticate(request, username=username, password=dni)

        if user:
            login(request, user)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        else:
            return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)


class UserScoreView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class UserListView(APIView):
    """Lista todos los usuarios (solo staff)."""
    permission_classes = [IsStaff]

    def get(self, request):
        users = User.objects.all().order_by('-total_score')
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)


class ImportUsersView(APIView):
    """
    Importa usuarios desde un archivo Excel (.xlsx).
    Hace UPSERT por DNI:
      - Si el DNI ya existe → actualiza username, first_name, last_name, is_staff.
        NUNCA modifica total_score ni current_rank.
      - Si el DNI no existe → crea el usuario con el DNI como contraseña.
    Solo accesible por staff.
    """
    permission_classes = [IsStaff]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No se proporcionó ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)

        if not file_obj.name.endswith('.xlsx'):
            return Response({'error': 'El archivo debe ser formato .xlsx'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            wb = openpyxl.load_workbook(file_obj)
            ws = wb.active
        except Exception:
            return Response({'error': 'No se pudo leer el archivo Excel. Verifica el formato.'}, status=status.HTTP_400_BAD_REQUEST)

        # Leer encabezados (fila 1)
        # Limpiamos espacios y convertimos a mayúsculas para que coincida exactamente con lo solicitado
        header_row = [str(cell.value).strip().upper() if cell.value else '' for cell in ws[1]]
        
        # Mapeo de columnas solicitado
        col_map = {
            'username': 'ASESOR ANALISTA',
            'dni': 'NUMERO DOCUMENTO',
            'first_name': 'NOMBRE', # Opcionales por si acaso vienen
            'last_name': 'APELLIDO',
            'is_staff': 'ES_ADMIN'
        }

        # Columnas requeridas según el nuevo mapeo
        required_cols = {col_map['username'], col_map['dni']}

        if not required_cols.issubset(set(header_row)):
            missing = required_cols - set(header_row)
            return Response(
                {'error': f'Faltan columnas requeridas: {", ".join(missing)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Índices de columnas
        idx = {key: header_row.index(val) if val in header_row else None for key, val in col_map.items()}
        
        creados = 0
        actualizados = 0
        errores = []

        for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
            # Saltar filas completamente vacías
            if all(cell is None or str(cell).strip() == '' for cell in row):
                continue

            try:
                # Extraer valores usando el mapeo
                username_val = str(row[idx['username']]).strip() if idx['username'] is not None and row[idx['username']] is not None else ''
                dni_val = str(row[idx['dni']]).strip() if idx['dni'] is not None and row[idx['dni']] is not None else ''
                
                # Campos sin equivalente (se dejan vacíos o con valor buscado en opcionales)
                first_name_val = str(row[idx['first_name']]).strip() if idx['first_name'] is not None and row[idx['first_name']] is not None else ''
                last_name_val = str(row[idx['last_name']]).strip() if idx['last_name'] is not None and row[idx['last_name']] is not None else ''

                if idx['is_staff'] is not None and row[idx['is_staff']] is not None:
                    raw_staff = str(row[idx['is_staff']]).strip().upper()
                    is_staff_val = raw_staff in ('TRUE', '1', 'SI', 'SÍ', 'YES', 'VERDADERO')
                else:
                    is_staff_val = False

                if not dni_val or not username_val:
                    errores.append({'fila': row_idx, 'motivo': 'DNI o username (Asesor Analista) vacío'})
                    continue

                # UPSERT por DNI
                existing = User.objects.filter(dni=dni_val).first()

                if existing:
                    # Actualizar solo datos de identidad, NUNCA tocar puntos
                    existing.username = username_val
                    existing.first_name = first_name_val
                    existing.last_name = last_name_val
                    if is_staff_col:
                        existing.is_staff = is_staff_val
                    existing.save(update_fields=['username', 'first_name', 'last_name', 'is_staff'])
                    actualizados += 1
                else:
                    # Crear usuario nuevo: DNI es la contraseña
                    new_user = User(
                        username=username_val,
                        first_name=first_name_val,
                        last_name=last_name_val,
                        dni=dni_val,
                        is_staff=is_staff_val,
                        is_active=True,
                    )
                    new_user.set_password(dni_val)
                    new_user.save()
                    creados += 1

            except Exception as e:
                errores.append({'fila': row_idx, 'motivo': str(e)})

        return Response({
            'creados': creados,
            'actualizados': actualizados,
            'errores': errores,
            'total_procesados': creados + actualizados,
        }, status=status.HTTP_200_OK)


class CleanupInactiveUsersView(APIView):
    """
    Limpia usuarios inactivos:
    - Usuarios que no han iniciado sesión en los últimos N meses
      tienen sus puntos reseteados a 0 y su rank a None.
    - Si delete=true en el body, los elimina directamente (excepto staff).
    Solo accesible por staff.
    """
    permission_classes = [IsStaff]

    def post(self, request):
        months = int(request.data.get('months', 2))
        delete_users = str(request.data.get('delete', 'false')).lower() == 'true'

        cutoff_date = timezone.now() - timedelta(days=months * 30)

        # Filtrar no-staff sin login reciente (o nunca logueados hace más del corte)
        inactive_qs = User.objects.filter(
            is_staff=False,
        ).filter(
            # last_login nulo o anterior al corte
            **{'last_login__lt': cutoff_date} if not False else {}
        ) | User.objects.filter(is_staff=False, last_login__isnull=True)

        # Evitar duplicados en la unión
        inactive_qs = User.objects.filter(
            is_staff=False
        ).filter(
            last_login__lt=cutoff_date
        ) | User.objects.filter(is_staff=False, last_login__isnull=True)

        # Quitar al usuario actual por seguridad
        inactive_qs = inactive_qs.exclude(pk=request.user.pk).distinct()

        count = inactive_qs.count()

        if delete_users:
            inactive_qs.delete()
            return Response({
                'accion': 'eliminados',
                'cantidad': count,
                'mensaje': f'{count} usuario(s) eliminado(s) por inactividad de más de {months} mes(es).'
            })
        else:
            # Solo resetear puntos
            updated = inactive_qs.update(total_score=0, current_rank=None)
            return Response({
                'accion': 'reset_puntos',
                'cantidad': updated,
                'mensaje': f'{updated} usuario(s) reseteado(s) a 0 puntos por inactividad de más de {months} mes(es).'
            })


class RankViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Rank.objects.all().order_by('min_score')
    serializer_class = RankSerializer
    permission_classes = [IsAuthenticated]
