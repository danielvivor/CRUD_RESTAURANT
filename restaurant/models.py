from django.db import models

# Create your models here.
from django.contrib.auth.models import User

class Reservation(models.Model):
    # Linking the reservation to a user helps with the role-based access requirements
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    email = models.EmailField()
    date = models.DateField()
    time = models.TimeField()
    guests = models.IntegerField()
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reservation for {self.email} on {self.date}"