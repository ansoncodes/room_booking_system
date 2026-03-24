from django.urls import path
from .views import (
    RoomListCreateView,
    RoomDetailView,
    RoomAvailabilityView,
    BookingListCreateView,
    BookingDetailView,
)

# NOTE: availability/ must come before <int:pk>/ to avoid being
# swallowed by the dynamic segment.
urlpatterns = [
    # Room endpoints
    path("rooms/", RoomListCreateView.as_view(), name="room-list-create"),
    path("rooms/availability/", RoomAvailabilityView.as_view(), name="room-availability"),
    path("rooms/<int:pk>/", RoomDetailView.as_view(), name="room-detail"),

    # Booking endpoints
    path("bookings/", BookingListCreateView.as_view(), name="booking-list-create"),
    path("bookings/<int:pk>/", BookingDetailView.as_view(), name="booking-detail"),
]