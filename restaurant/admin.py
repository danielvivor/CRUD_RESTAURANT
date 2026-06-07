from django.contrib import admin

# Register your models here.
from .models import Reservation, Review

# Register models to appear in the Admin Panel
admin.site.register(Reservation)
admin.site.register(Review)
