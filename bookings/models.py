from django.db import models
from decimal import Decimal


class Room(models.Model):
    name = models.CharField(max_length=255, unique=True)
    capacity = models.PositiveIntegerField()
    price_per_hour = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.name} (capacity: {self.capacity})"


class Booking(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="bookings")
    guest_count = models.PositiveIntegerField()
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    total_price = models.DecimalField(
        max_digits=10, decimal_places=2, editable=False, default=0
    )

    def _calculate_total_price(self):
        """Compute price from duration (hours) × room's price_per_hour."""
        if self.start_datetime and self.end_datetime and self.room_id:
            duration_hours = Decimal(
                str(
                    (self.end_datetime - self.start_datetime).total_seconds() / 3600
                )
            )
            return duration_hours * self.room.price_per_hour
        return Decimal("0")

    def __str__(self):
        return f"Booking #{self.pk} – {self.room.name} at {self.start_datetime:%Y-%m-%d %H:%M}"
