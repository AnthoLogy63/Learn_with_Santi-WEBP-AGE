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
