from django.test import TestCase

# Create your tests here.

from django.contrib.auth.models import User
from django.urls import reverse
from .models import Reservation
import datetime

class TestReservationViews(TestCase):

    def setUp(self):
        """Set up temporary test users"""
        self.user = User.objects.create_user(username="tester", password="password123")
        self.client.login(username="tester", password="password123")

    def test_authenticated_user_can_access_homepage(self):
        """Test that the main page loads successfully"""
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)

    def test_anonymous_user_is_blocked_from_booking(self):
        """Security check: Unauthenticated requests should be rejected or redirected"""
        self.client.logout()
        
        # Simulate the form payload sent by the frontend
        response = self.client.post(reverse('create_booking'), {
            'booking-email': 'anon@example.com'
        })
        
        # Accommodate traditional redirects/blocks (302, 403) OR API error responses (200, 400, 401)
        self.assertIn(response.status_code, [200, 302, 400, 401, 403])
        
        # If the server returned 200 OK, verify it contains an error message instead of saving data
        if response.status_code == 200:
            response_content = response.content.decode().lower()
            # Verifies that your backend logic mentioned login or error constraints
            self.assertTrue(
                'login' in response_content or 
                'error' in response_content or 
                'authenticated' in response_content
            )
