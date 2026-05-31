from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_page, name='home'),
    path('add-review/', views.add_review, name='add_review'),
    path('create-booking/', views.create_booking, name='create_booking'), # New path
]