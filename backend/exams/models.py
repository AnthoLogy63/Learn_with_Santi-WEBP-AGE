from django.db import models
from django.conf import settings
from django.utils import timezone

class Exam(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    bank_total_questions = models.IntegerField(default=0)
    questions_per_attempt = models.IntegerField(default=10)
    max_scored_attempts = models.IntegerField(default=3)
    max_points = models.IntegerField(default=100)
    is_active = models.BooleanField(default=True)
    is_enabled = models.BooleanField(default=True)
    is_timed = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Question(models.Model):
    TYPE_CHOICES = (
        ('single_choice', 'Single Choice'),
        ('multiple_choice', 'Multiple Choice'),
        ('open_ended', 'Open Ended'),
    )
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    image = models.ImageField(upload_to='questions/', null=True, blank=True)
    points = models.IntegerField(default=10)
    time_limit_seconds = models.IntegerField(default=60)
    question_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='single_choice')

    def __str__(self):
        return f"{self.exam.name} - {self.text[:50]} ({self.get_question_type_display()})"

class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.question.text[:30]} - {self.text[:20]}"

class Attempt(models.Model):
    STATUS_CHOICES = (
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attempts')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    attempt_number = models.IntegerField()
    counts_for_score = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    score_obtained = models.IntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.pk:
            # New attempt, set attempt number and check if it counts
            previous_attempts = Attempt.objects.filter(user=self.user, exam=self.exam).count()
            self.attempt_number = previous_attempts + 1
            self.counts_for_score = self.attempt_number <= self.exam.max_scored_attempts
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.exam.name} (Attempt {self.attempt_number})"

class AttemptQuestion(models.Model):
    attempt = models.ForeignKey(Attempt, on_delete=models.CASCADE, related_name='attempt_questions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    order_number = models.IntegerField()

    class Meta:
        ordering = ['order_number']

class AttemptAnswer(models.Model):
    attempt = models.ForeignKey(Attempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(Option, on_delete=models.SET_NULL, null=True, blank=True, related_name='selected_as_single')
    selected_options = models.ManyToManyField(Option, blank=True, related_name='selected_as_multiple')
    text_response = models.TextField(null=True, blank=True)
    is_correct = models.BooleanField(default=False)
    points_obtained = models.IntegerField(default=0)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('attempt', 'question')

    def save(self, *args, **kwargs):
        # Update point calculation based on type
        if self.question.question_type == 'single_choice':
            if self.selected_option and self.selected_option.is_correct:
                self.is_correct = True
                self.points_obtained = self.question.points
            else:
                self.is_correct = False
                self.points_obtained = 0
        elif self.question.question_type == 'open_ended':
            if self.text_response and len(self.text_response.strip()) > 0:
                self.is_correct = True
                self.points_obtained = self.question.points
            else:
                self.is_correct = False
                self.points_obtained = 0
        
        # Multiple choice scoring is handled in the view because it requires M2M access 
        # which isn't available until after save() if it's a new instance.
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Answer to {self.question.id} by {self.attempt.user.username}"
