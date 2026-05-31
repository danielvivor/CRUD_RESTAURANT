# READ
from django.shortcuts import render, redirect
from .models import Review # Import Review database model

def home_page(request):
    """
    Fetches all reviews from PostgreSQL and renders the homepage.
    """
    # Fetch all reviews ordered by the newest submission first
    all_reviews = Review.objects.all().order_by('-created_on')
    
    context = {
        'reviews': all_reviews
    }
    return render(request, 'index.html', context)

# CREATE
def add_review(request):
    """
    Processes the front-end form submission and saves a new review to naladb.
    """
    if request.method == "POST":
        # Extract data from the HTML form inputs
        name = request.POST.get('name')
        email = request.POST.get('email')
        rating = request.POST.get('rating')
        comment = request.POST.get('comment')

        # backend validation
        if name and email and rating:
            Review.objects.create(
                name=name,
                email=email,
                rating=int(rating),
                comment=comment
            )
            # Redirect back to the homepage to see the new review refreshed
            return redirect('home')
            
    return redirect('home')