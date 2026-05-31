from django.shortcuts import render

# Create your views here.
from django.shortcuts import render

def home_page(request):
    """
    Renders the main index.html landing page for Nala Restaurant.
    """
    return render(request, 'index.html')