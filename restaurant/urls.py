from django.urls import path
from . import views

urlpatterns = [
    # Main page
    path('', views.home_page, name='home'),
    
    # Authentication
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register, name='register'),
    
    # Reviews
    path('add-review/', views.add_review, name='add_review'),
    
    # Reservations
    path('create-booking/', views.create_booking, name='create_booking'),
    path('view-reservations/', views.view_reservations, name='view_reservations'),
    path('cancel-reservation/<int:booking_id>/', views.cancel_reservation, name='cancel_reservation'),
    path('update-reservation/<int:booking_id>/', views.update_reservation, name='update_reservation'),

    # Logout
    path('logout/', views.logout_view, name='logout'),
]