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

# CREATE booking
from django.http import JsonResponse
import json
from .models import Reservation

def create_booking(request):
    """
    API endpoint to handle the complex multi-table reservation JSON payload 
    sent from the frontend and save it to PostgreSQL.
    """
    if request.method == "POST":
        try:
            # Parse the JSON payload sent by JavaScript fetch
            data = json.loads(request.body)
            email = data.get('email')
            tables = data.get('tables', [])

            if not email or not tables:
                return JsonResponse({'status': 'error', 'message': 'Missing booking details.'}, status=400)

            # Loop through each table configuration and save to the database
            for table in tables:
                Reservation.objects.create(
                    email=email,
                    date=table.get('date'),
                    time=table.get('time'),
                    guests=int(table.get('guests'))
                )

            return JsonResponse({'status': 'success', 'message': 'All tables booked successfully!'})
            
        except (ValueError, KeyError, json.JSONDecodeError) as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)