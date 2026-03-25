const BASE_URL = "http://localhost:8000";

// Fetches all rooms from the API.
// Returns an array of { id, name, capacity, price_per_hour }
export async function getRooms() {
    const response = await fetch(`${BASE_URL}/api/rooms/`);
    if (!response.ok) {
        const error = await response.json();
        throw error;
    }
    return response.json();
}

// Checks room availability for a given time window.
// start and end must be ISO 8601 datetime strings.
// Returns an array of rooms each with an is_available boolean.
export async function checkAvailability(start, end) {
    const response = await fetch(
        `${BASE_URL}/api/rooms/availability/?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    );
    if (!response.ok) {
        const error = await response.json();
        throw error;
    }
    return response.json();
}

// Creates a new booking.
// data: { room_id, guest_count, start_datetime, end_datetime }
// Returns the created booking object including total_price.
export async function createBooking(data) {
    const response = await fetch(`${BASE_URL}/api/bookings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw error;
    }
    return response.json();
}
