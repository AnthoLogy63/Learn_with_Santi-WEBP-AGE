from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamViewSet, AttemptViewSet, ImportExamView, QuestionViewSet, OptionViewSet

router = DefaultRouter()
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'options', OptionViewSet, basename='option')
router.register(r'attempts', AttemptViewSet, basename='attempt')
router.register(r'', ExamViewSet)

urlpatterns = [
    path('import/', ImportExamView.as_view(), name='exam-import'),
    path('', include(router.urls)),
]
