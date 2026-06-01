from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_page, name='home'),
    path('add-review/', views.add_review, name='add_review'),
    path('create-booking/', views.create_booking, name='create_booking'),
    path('view-reservations/', views.view_reservations, name='view_reservations'),
    path('cancel-reservation/<int:booking_id>/', views.cancel_reservation, name='cancel_reservation'),
    path('update-reservation/<int:booking_id>/', views.update_reservation, name='update_reservation'), # New update route
]