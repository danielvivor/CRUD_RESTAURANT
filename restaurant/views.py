from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.utils import timezone  # Time validation
from django.views.decorators.csrf import csrf_protect
from datetime import datetime       # String-to-datetime parsing
import json
from .models import Review, Reservation # Consolidated models import
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout

# REVIEWS (READ & CREATE)

def register(request):
    """
    Renders a standard user registration form and logs the user in upon success.
    """
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user) # Automatically log them in after signing up
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'registration/register.html', {'form': form})

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

        # Backend validation
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

# RESERVATIONS (CRUD ENDPOINTS - SECURED VIA SESSION VALIDATION)

def create_booking(request):
    """
    API endpoint to handle the complex multi-table reservation JSON payload 
    sent from the frontend and save it to PostgreSQL. Bound securely to session user.
    """
    # Strict check preventing unauthenticated access
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Authentication required to create a booking.'}, status=401)

    if request.method == "POST":
        try:
            # Parse the JSON payload sent by JavaScript fetch
            data = json.loads(request.body)
            tables = data.get('tables', [])

            if not tables:
                return JsonResponse({'status': 'error', 'message': 'Missing booking details.'}, status=400)

            # Loop through each table configuration and save to the database
            for table in tables:
                t_date = table.get('date')
                t_time = table.get('time')
                
                # Combine and parse date/time strings into a naive datetime object
                booking_dt = datetime.strptime(f"{t_date} {t_time}", "%Y-%m-%d %H:%M")
                # Get current localized server time stripped of timezone attachments
                current_dt = timezone.localtime(timezone.now()).replace(tzinfo=None)
                
                # Block user if the selected timeframe is in the past
                if booking_dt < current_dt:
                    return JsonResponse({'status': 'error', 'message': 'Reservation date and time cannot be in the past.'}, status=400)

                # Securely bind table records to the active session user
                Reservation.objects.create(
                    user=request.user,
                    email=request.user.email, # Implicitly uses account email to prevent form tampering
                    date=t_date,
                    time=t_time,
                    guests=int(table.get('guests'))
                )

            return JsonResponse({'status': 'success', 'message': 'All tables booked successfully!'})
            
        except (ValueError, KeyError, json.JSONDecodeError) as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)


def view_reservations(request):
    """
    API endpoint to query PostgreSQL and return all active bookings 
    belonging exclusively to the currently authenticated user session.
    """
    # Strict check preventing unauthenticated access
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Authentication required to view bookings.'}, status=401)
        
    # Requirement 3.1 & 3.3: Filter queries exclusively by the logged-in session user pointer
    bookings = Reservation.objects.filter(user=request.user).order_by('date', 'time')
    
    # Serialize the database objects into a clean dictionary list
    booking_list = []
    for booking in bookings:
        booking_list.append({
            'id': booking.id,
            'date': booking.date.strftime('%Y-%m-%d'),
            'time': booking.time.strftime('%H:%M'),
            'guests': booking.guests
        })
        
    return JsonResponse({'status': 'success', 'reservations': booking_list})


def cancel_reservation(request, booking_id):
    """
    API endpoint to delete a specific reservation row out of naladb 
    using its primary key ID, ensuring ownership check passes.
    """
    # Strict check preventing unauthenticated access
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Authentication required to cancel bookings.'}, status=401)

    if request.method == "POST":
        try:
            # Prevents horizontal privilege escalation by making sure the booking belongs to this user
            booking = Reservation.objects.get(id=booking_id, user=request.user)
            booking.delete()
            return JsonResponse({'status': 'success', 'message': 'Reservation cancelled successfully.'})
        except Reservation.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Reservation not found or access denied.'}, status=404)
            
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)


def update_reservation(request, booking_id):
    """
    API endpoint to modify an existing reservation's date, time, 
    and guest count based on its primary key ID, ensuring ownership check passes.
    """
    # Strict check preventing unauthenticated access
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Authentication required to modify bookings.'}, status=401)

    if request.method == "POST":
        try:
            # Parse the incoming updated parameters
            data = json.loads(request.body)
            new_date = data.get('date')
            new_time = data.get('time')
            new_guests = data.get('guests')

            # Basic backend validation check
            if not new_date or not new_time or not new_guests:
                return JsonResponse({'status': 'error', 'message': 'All fields are required.'}, status=400)

            # Validate that updated times have not already passed
            booking_dt = datetime.strptime(f"{new_date} {new_time}", "%Y-%m-%d %H:%M")
            current_dt = timezone.localtime(timezone.now()).replace(tzinfo=None)
            
            if booking_dt < current_dt:
                return JsonResponse({'status': 'error', 'message': 'Cannot update reservation to a past date or time.'}, status=400)

            # Prevents horizontal privilege escalation by making sure the booking belongs to this user
            booking = Reservation.objects.get(id=booking_id, user=request.user)
            
            # Commit the updated values to the object fields
            booking.date = new_date
            booking.time = new_time
            booking.guests = int(new_guests)
            booking.save()

            return JsonResponse({'status': 'success', 'message': 'Reservation updated successfully.'})

        except Reservation.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Reservation not found or access denied.'}, status=404)
        except (ValueError, json.JSONDecodeError) as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)

def logout_view(request):
    """
    Safely logs out the user via a GET request and redirects them back home.
    """
    auth_logout(request)
    return redirect('home')