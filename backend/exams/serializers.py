from rest_framework import serializers
from .models import Exam, Question, Option, Attempt, AttemptQuestion, AttemptAnswer

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text']

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'image', 'options', 'points', 'time_limit_seconds', 'question_type']

class ExamSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    last_score = serializers.SerializerMethodField()
    attempts_left = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = ['id', 'name', 'description', 'bank_total_questions', 'questions_per_attempt', 'max_scored_attempts', 'max_points', 'is_active', 'is_enabled', 'status', 'last_score', 'attempts_left']

    def get_status(self, obj):
        user = self.context['request'].user
        if Attempt.objects.filter(user=user, exam=obj, status='completed').exists():
            return 'completed'
        return 'pending'

    def get_last_score(self, obj):
        user = self.context['request'].user
        # Best of the first 3 attempts
        best_attempt = Attempt.objects.filter(
            user=user, 
            exam=obj, 
            status='completed',
            counts_for_score=True
        ).order_by('-score_obtained').first()
        if best_attempt:
            return best_attempt.score_obtained
        return None
    
    def get_attempts_left(self, obj):
        user = self.context['request'].user
        attempts_count = Attempt.objects.filter(user=user, exam=obj).count()
        return max(0, obj.max_scored_attempts - attempts_count)

class AttemptAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttemptAnswer
        fields = ['question', 'selected_option', 'selected_options', 'text_response', 'is_correct', 'points_obtained', 'answered_at']
        read_only_fields = ['is_correct', 'points_obtained', 'answered_at']

class AttemptSerializer(serializers.ModelSerializer):
    answers = AttemptAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = Attempt
        fields = ['id', 'user', 'exam', 'attempt_number', 'counts_for_score', 'status', 'score_obtained', 'started_at', 'completed_at', 'answers']
        read_only_fields = ['user', 'attempt_number', 'counts_for_score', 'status', 'score_obtained', 'completed_at']
