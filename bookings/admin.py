from django.contrib import admin
from .models import Room, Booking


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("name", "capacity", "price_per_hour")
    search_fields = ("name",)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("room", "guest_count", "start_datetime", "end_datetime", "total_price")
    list_filter = ("room",)
    readonly_fields = ("total_price",)
