from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RankViewSet,
    LoginView,
    UserScoreView,
    UserListView,
    ImportUsersView,
    CleanupInactiveUsersView,
)

router = DefaultRouter()
router.register(r'ranks', RankViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('score/<int:pk>/', UserScoreView.as_view(), name='user-score'),
    path('list/', UserListView.as_view(), name='user-list'),
    path('import/', ImportUsersView.as_view(), name='user-import'),
    path('cleanup/', CleanupInactiveUsersView.as_view(), name='user-cleanup'),
]
