from django.urls import path
from .views import (
    RoomListView,
    RoomAvailabilityView,
    BookingListCreateView,
)

urlpatterns = [
    # Room endpoints (read-only — rooms managed via Django admin)
    path("rooms/", RoomListView.as_view(), name="room-list"),
    path("rooms/availability/", RoomAvailabilityView.as_view(), name="room-availability"),

    # Booking endpoint
    path("bookings/", BookingListCreateView.as_view(), name="booking-list-create"),
]