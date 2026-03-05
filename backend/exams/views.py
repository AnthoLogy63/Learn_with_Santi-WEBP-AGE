import random
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import models
from .models import Exam, Question, Option, Attempt, AttemptQuestion, AttemptAnswer
from .serializers import ExamSerializer, QuestionSerializer, AttemptSerializer, AttemptAnswerSerializer

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Exam.objects.all()
        return Exam.objects.filter(is_active=True, is_enabled=True)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def toggle_enabled(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        exam = self.get_object()
        exam.is_enabled = not exam.is_enabled
        exam.save()
        return Response({'is_enabled': exam.is_enabled})

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def questions(self, request, pk=None):
        exam = self.get_object()
        user = request.user
        
        # Get or create an active attempt
        attempt = Attempt.objects.filter(user=user, exam=exam, status='in_progress').first()
        
        if not attempt:
            # Smart selection logic:
            # 1. Get IDs of questions user has EVER answered correctly in a completed attempt
            correct_question_ids = AttemptAnswer.objects.filter(
                attempt__user=user,
                attempt__exam=exam,
                attempt__status='completed',
                is_correct=True
            ).values_list('question_id', flat=True).distinct()
            
            all_questions = list(Question.objects.filter(exam=exam))
            
            # 2. Separate into "pending" (not answered correctly) and "mastered"
            pending_questions = [q for q in all_questions if q.id not in correct_question_ids]
            mastered_questions = [q for q in all_questions if q.id in correct_question_ids]
            
            num_needed = min(len(all_questions), exam.questions_per_attempt)
            
            if len(pending_questions) >= num_needed:
                # We have enough new/wrong questions to fill the attempt
                selected_questions = random.sample(pending_questions, num_needed)
            elif len(pending_questions) > 0:
                # Fill what's left with mastered questions
                num_from_mastered = num_needed - len(pending_questions)
                selected_questions = pending_questions + random.sample(mastered_questions, num_from_mastered)
            else:
                # All questions mastered? Reset and pick random
                selected_questions = random.sample(all_questions, num_needed)
            
            random.shuffle(selected_questions)
            
            attempt = Attempt.objects.create(user=user, exam=exam)
            
            # Create AttemptQuestions to preserve order
            for i, q in enumerate(selected_questions):
                AttemptQuestion.objects.create(attempt=attempt, question=q, order_number=i+1)
        
        # Return questions in the attempt
        questions = [aq.question for aq in attempt.attempt_questions.all()]
        serializer = QuestionSerializer(questions, many=True)
        return Response({
            'attempt_id': attempt.id,
            'questions': serializer.data
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def stats_summary(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        from django.contrib.auth import get_user_model
        UserModel = get_user_model()
        
        exams = Exam.objects.all()
        stats = []
        for exam in exams:
            # Group by analyst, taking their BEST attempt of the first 3
            analysts = UserModel.objects.filter(attempts__exam=exam).distinct()
            best_scores = []
            
            for analyst in analysts:
                best_q_attempt = Attempt.objects.filter(
                    user=analyst, 
                    exam=exam, 
                    status='completed',
                    counts_for_score=True
                ).order_by('-score_obtained').first()
                if best_q_attempt:
                    best_scores.append(best_q_attempt.score_obtained)
            
            total_analysts = len(best_scores)
            avg_score = sum(best_scores) / total_analysts if total_analysts > 0 else 0
            
            # Question stats based on best qualifying attempts
            questions = Question.objects.filter(exam=exam)
            q_stats = []
            
            # For each question, how many times was it answered correctly in a BEST qualifying attempt?
            for q in questions:
                # Find all "best qualifying attempts" for this exam
                best_attempt_ids = []
                for analyst in analysts:
                    at = Attempt.objects.filter(user=analyst, exam=exam, status='completed', counts_for_score=True).order_by('-score_obtained').first()
                    if at: best_attempt_ids.append(at.id)
                
                relevant_answers = AttemptAnswer.objects.filter(question=q, attempt_id__in=best_attempt_ids)
                total_q = relevant_answers.count()
                correct_q = relevant_answers.filter(is_correct=True).count()
                
                q_stats.append({
                    'id': q.id,
                    'text': q.text,
                    'total': total_q,
                    'correct': correct_q,
                    'percent': round((correct_q / total_q * 100) if total_q > 0 else 0)
                })

            stats.append({
                'id': exam.id,
                'name': exam.name,
                'total_attempts': total_analysts, # Reusing label for analysts count
                'avg_score': round(avg_score),
                'question_stats': q_stats
            })
            
        return Response(stats)

class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt.objects.all()
    serializer_class = AttemptSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Attempt.objects.all()
        return Attempt.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def user_results(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        from django.contrib.auth import get_user_model
        UserModel = get_user_model()
        analysts = UserModel.objects.filter(is_staff=False)
        
        results = []
        for user in analysts:
            # All attempts for the user
            user_attempts = Attempt.objects.filter(user=user, status='completed').order_by('-completed_at')
            attempts_data = []
            
            for attempt in user_attempts:
                answers = AttemptAnswer.objects.filter(attempt=attempt)
                ans_data = []
                for a in answers:
                    ans_data.append({
                        'question': a.question.text,
                        'selected': a.selected_option.text if a.selected_option else "N/A",
                        'is_correct': a.is_correct
                    })
                
                attempts_data.append({
                    'exam_name': attempt.exam.name,
                    'score': attempt.score_obtained,
                    'date': attempt.completed_at,
                    'attempt_number': attempt.attempt_number,
                    'counts_for_score': attempt.counts_for_score,
                    'answers': ans_data
                })
            
            results.append({
                'id': user.id,
                'username': user.username,
                'total_score': user.total_score,
                'attempts': attempts_data
            })
            
        return Response(results)

    @action(detail=True, methods=['post'])
    def submit_answers(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status != 'in_progress':
            return Response({'error': 'Attempt is already finished'}, status=status.HTTP_400_BAD_REQUEST)
        
        answers_data = request.data.get('answers', [])
        total_points = 0
        
        for ans in answers_data:
            question_id = ans.get('question_id')
            option_id = ans.get('selected_option_id') # single
            option_ids = ans.get('selected_option_ids', []) # multiple
            text_response = ans.get('text_response') # open
            
            try:
                question = Question.objects.get(id=question_id, exam=attempt.exam)
                
                # Get or create answer object
                answer_obj, created = AttemptAnswer.objects.get_or_create(
                    attempt=attempt,
                    question=question
                )
                
                if question.question_type == 'single_choice':
                    option = Option.objects.get(id=option_id, question=question) if option_id else None
                    answer_obj.selected_option = option
                    answer_obj.save() # calculates points in models.py
                    
                elif question.question_type == 'multiple_choice':
                    # Multiple choice scoring: all correct options must be selected, no incorrect ones
                    options = Option.objects.filter(id__in=option_ids, question=question)
                    answer_obj.selected_options.set(options)
                    
                    correct_options_ids = set(Option.objects.filter(question=question, is_correct=True).values_list('id', flat=True))
                    selected_ids = set(option_ids)
                    
                    if selected_ids == correct_options_ids and len(correct_options_ids) > 0:
                        answer_obj.is_correct = True
                        answer_obj.points_obtained = question.points
                    else:
                        answer_obj.is_correct = False
                        answer_obj.points_obtained = 0
                    answer_obj.save()
                    
                elif question.question_type == 'open_ended':
                    answer_obj.text_response = text_response
                    answer_obj.save() # calculates points in models.py (non-empty = correct)
                
                total_points += answer_obj.points_obtained
            except (Question.DoesNotExist, Option.DoesNotExist):
                continue
        
        # Calculate final score (0-100)
        aq_count = AttemptQuestion.objects.filter(attempt=attempt).count()
        max_possible_points = AttemptQuestion.objects.filter(attempt=attempt).aggregate(total=models.Sum('question__points'))['total'] or 0
        
        if max_possible_points > 0:
            score = round((total_points / max_possible_points) * 100)
        else:
            score = 0
            
        attempt.status = 'completed'
        attempt.score_obtained = score
        attempt.completed_at = timezone.now()
        attempt.save()
        
        # Update user total_score if valid
        if attempt.counts_for_score:
            user = attempt.user
            user.total_score += score
            user.save()
            user.update_rank()
            
        # Calculate correct answers count
        correct_count = AttemptAnswer.objects.filter(attempt=attempt, is_correct=True).count()
        total_questions = AttemptQuestion.objects.filter(attempt=attempt).count()
        
        # Calculate attempts left for scoring
        attempts_count = Attempt.objects.filter(user=attempt.user, exam=attempt.exam).count()
        attempts_left = max(0, attempt.exam.max_scored_attempts - attempts_count)

        return Response({
            'score': score,
            'correct_count': correct_count,
            'total_questions': total_questions,
            'status': attempt.status,
            'counts_for_score': attempt.counts_for_score,
            'attempts_left': attempts_left,
            'total_user_score': attempt.user.total_score
        })
