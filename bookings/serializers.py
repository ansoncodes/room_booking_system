from rest_framework import serializers
from .models import Room, Booking


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ["id", "name", "capacity", "price_per_hour"]
        read_only_fields = ["id"]


class BookingSerializer(serializers.ModelSerializer):
    # For READ: nested room object
    room = RoomSerializer(read_only=True)
    # For WRITE: accept room by primary key
    room_id = serializers.PrimaryKeyRelatedField(
        queryset=Room.objects.all(), source="room", write_only=True
    )

    class Meta:
        model = Booking
        fields = [
            "id",
            "room",
            "room_id",
            "guest_count",
            "start_datetime",
            "end_datetime",
            "total_price",
        ]
        read_only_fields = ["id", "total_price"]

    def validate(self, data):
        start = data.get("start_datetime")
        end = data.get("end_datetime")
        room = data.get("room")
        guest_count = data.get("guest_count")

        # 1. end_datetime must be after start_datetime
        if start and end and end <= start:
            raise serializers.ValidationError(
                "end_datetime must be after start_datetime."
            )

        # 2. guest_count must not exceed room capacity
        if room and guest_count and guest_count > room.capacity:
            raise serializers.ValidationError(
                f"Guest count ({guest_count}) exceeds room capacity ({room.capacity})."
            )

        # 3. No overlapping bookings for the same room.
        # A conflict exists when an existing booking starts before this one ends
        # AND ends after this one starts.
        if room and start and end:
            overlapping = Booking.objects.filter(
                room=room,
                start_datetime__lt=end,
                end_datetime__gt=start,
            )
            # Exclude the current instance when updating
            instance = self.instance
            if instance:
                overlapping = overlapping.exclude(pk=instance.pk)

            if overlapping.exists():
                raise serializers.ValidationError(
                    "This room is already booked for the selected time slot."
                )

        return data

    def create(self, validated_data):
        booking = Booking(**validated_data)
        booking.total_price = booking._calculate_total_price()
        booking.save()
        return booking

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.total_price = instance._calculate_total_price()
        instance.save()
        return instance
