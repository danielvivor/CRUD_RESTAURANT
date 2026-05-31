from django.shortcuts import render, redirect
from .models import Review # Import Review database model

def home_page(request):
    """
    Fetches all reviews from PostgreSQL and renders the homepage.
    """
    # Fetch all reviews ordered by the newest submission first
    all_reviews = Review.objects.all().order_by('-created_at')
    
    context = {
        'reviews': all_reviews
    }
    return render(request, 'index.html', context)