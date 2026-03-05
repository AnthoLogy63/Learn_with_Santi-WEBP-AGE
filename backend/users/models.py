from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class Rank(models.Model):
    name = models.CharField(max_length=50)
    min_score = models.IntegerField(default=0)
    max_score = models.IntegerField(default=1000)
    description = models.TextField(blank=True)
    badge_image = models.ImageField(upload_to='badges/', null=True, blank=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    dni = models.CharField(max_length=20, default="")
    total_score = models.IntegerField(default=0)
    current_rank = models.ForeignKey(Rank, on_delete=models.SET_NULL, null=True, blank=True)

    def update_rank(self):
        new_rank = Rank.objects.filter(
            min_score__lte=self.total_score,
            max_score__gte=self.total_score
        ).first()
        if new_rank and self.current_rank != new_rank:
            self.current_rank = new_rank
            self.save(update_fields=['current_rank'])

    def __str__(self):
        return f"{self.username} - Score: {self.total_score}"


@receiver(post_save, sender=User)
def auto_update_rank(sender, instance, **kwargs):
    pass