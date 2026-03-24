from django.utils.dateparse import parse_datetime
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Booking, Room
from .serializers import BookingSerializer, RoomSerializer


# ─── Room Views ───────────────────────────────────────────────────────────────

class RoomListCreateView(generics.ListCreateAPIView):
    """GET /api/rooms/  — list all rooms
       POST /api/rooms/ — create a room"""
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET    /api/rooms/{id}/ — retrieve a room
       PUT    /api/rooms/{id}/ — full update
       PATCH  /api/rooms/{id}/ — partial update
       DELETE /api/rooms/{id}/ — delete"""
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class RoomAvailabilityView(APIView):
    """GET /api/rooms/availability/?start=<iso>&end=<iso>
    Returns all rooms with an is_available flag for the given window."""

    def get(self, request):
        start_param = request.query_params.get("start")
        end_param = request.query_params.get("end")

        # Both params are required
        if not start_param or not end_param:
            return Response(
                {"error": "Both 'start' and 'end' query parameters are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        start = parse_datetime(start_param)
        end = parse_datetime(end_param)

        # Reject malformed datetime strings
        if start is None or end is None:
            return Response(
                {"error": "Invalid datetime format. Use ISO 8601, e.g. 2026-03-25T10:00:00."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find room IDs that have at least one overlapping booking
        booked_room_ids = set(
            Booking.objects.filter(
                start_datetime__lt=end,
                end_datetime__gt=start,
            ).values_list("room_id", flat=True)
        )

        rooms = Room.objects.all()
        data = [
            {
                "id": room.id,
                "name": room.name,
                "capacity": room.capacity,
                "price_per_hour": room.price_per_hour,
                "is_available": room.id not in booked_room_ids,
            }
            for room in rooms
        ]
        return Response(data, status=status.HTTP_200_OK)


# ─── Booking Views ─────────────────────────────────────────────────────────────

class BookingListCreateView(generics.ListCreateAPIView):
    """GET  /api/bookings/ — list all bookings
       POST /api/bookings/ — create a booking (returns 201)"""
    queryset = Booking.objects.select_related("room").all()
    serializer_class = BookingSerializer


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET    /api/bookings/{id}/ — retrieve a booking
       PUT    /api/bookings/{id}/ — full update
       PATCH  /api/bookings/{id}/ — partial update
       DELETE /api/bookings/{id}/ — delete"""
    queryset = Booking.objects.select_related("room").all()
    serializer_class = BookingSerializer
