from rest_framework import serializers
from .models import User, Rank


class RankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rank
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    current_rank = RankSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'dni', 'is_staff', 'total_score', 'current_rank']
        read_only_fields = ['total_score', 'current_rank', 'is_staff']


class UserListSerializer(serializers.ModelSerializer):
    """Serializer extendido para listar usuarios en el panel admin."""
    current_rank = RankSerializer(read_only=True)
    last_login = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)
    date_joined = serializers.DateTimeField(format="%d/%m/%Y", read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'dni', 'is_staff', 'is_active',
            'total_score', 'current_rank',
            'last_login', 'date_joined',
        ]
