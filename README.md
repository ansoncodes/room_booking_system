# Room Booking System

A full-stack room booking application built with Django, Django REST Framework, and React.

This project was created for a Django Backend Technical Assignment and focuses on booking validation, API design, and a clean user experience for checking room availability and creating bookings.

## Features

- Check room availability for a selected start and end time
- Create room bookings through a REST API
- Prevent overlapping bookings for the same room
- Reject bookings when guest count exceeds room capacity
- Calculate booking cost using each room's hourly price
- Show a live price preview before booking submission
- Manage rooms and view bookings through Django admin
- Responsive frontend built with React

## Tech Stack

### Backend

- Python
- Django 6.0.3
- Django REST Framework 3.17.1
- SQLite

### Frontend

- React 19
- Create React App
- Plain CSS

## Project Structure

```text
.
|-- bookings/                     # Django app with models, serializers, views, urls
|-- room_booking/                 # Django project settings and root urls
|-- room-booking-frontend/        # React frontend
|-- db.sqlite3                    # Local development database
|-- manage.py
|-- requirements.txt
`-- README.md
```

## Core Logic

The system enforces the following business rules:

- `end_datetime` must be later than `start_datetime`
- `guest_count` must not exceed the selected room's capacity
- a room cannot be booked for an overlapping time slot

Overlap is checked using this condition:

```text
existing.start_datetime < new_end
existing.end_datetime > new_start
```

This blocks conflicting bookings while still allowing back-to-back bookings where one ends exactly when the next one starts.

## Pricing Logic

Each room has a `price_per_hour` field, and each booking stores a computed `total_price`.

- minimum billing is 1 hour
- bookings longer than 1 hour are charged proportionally based on duration
- the frontend shows a live estimated total before booking submission
- the backend calculates and saves the final `total_price`

Example:

- Room rate: `4000.00`
- Duration: `2.5` hours
- Total price: `10000.00`

## Data Models

### Room

- `name`
- `capacity`
- `price_per_hour`

### Booking

- `room` (ForeignKey to `Room`)
- `start_datetime`
- `end_datetime`
- `guest_count`
- `total_price`

## API Endpoints

Base URL:

```text
http://localhost:8000
```

### `GET /api/rooms/`

Returns the list of rooms.

### `GET /api/rooms/availability/?start=<ISO>&end=<ISO>`

Returns all rooms with an `is_available` flag for the selected time window.

### `GET /api/bookings/`

Returns all bookings.

### `POST /api/bookings/`

Creates a new booking.

Example request body:

```json
{
  "room_id": 1,
  "guest_count": 8,
  "start_datetime": "2026-04-05T10:00:00Z",
  "end_datetime": "2026-04-05T12:30:00Z"
}
```

Example success response:

```json
{
  "id": 18,
  "room": {
    "id": 1,
    "name": "Conference Hall A",
    "capacity": 20,
    "price_per_hour": "4000.00"
  },
  "guest_count": 8,
  "start_datetime": "2026-04-05T10:00:00Z",
  "end_datetime": "2026-04-05T12:30:00Z",
  "total_price": "10000.00"
}
```

Example validation error:

```json
{
  "non_field_errors": [
    "This room is already booked for the selected time slot."
  ]
}
```

## Frontend Overview

The frontend provides two main flows:

### Check Availability

- select start date and time
- select end date and time
- view all rooms with available or unavailable status

### Book a Room

- choose a room
- enter guest count
- choose start and end date/time
- see the live pricing preview
- submit the booking
- view the booking confirmation with total price

## Django Admin

Rooms are managed through Django admin instead of a public create/update API.

Admin URL:

```text
http://localhost:8000/admin/
```

Use admin to:

- create rooms
- set room capacity
- set room hourly price
- review bookings

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/ansoncodes/room_booking_system.git
cd room_booking_system
```

### 2. Backend setup

Create and activate a virtual environment, then install dependencies:

```bash
pip install -r requirements.txt
pip install django-cors-headers
```

Apply migrations:

```bash
python manage.py migrate
```

Create an admin user:

```bash
python manage.py createsuperuser
```

Run the backend server:

```bash
python manage.py runserver
```

### 3. Frontend setup

Open a new terminal:

```bash
cd room-booking-frontend
npm install
npm start
```

Frontend runs at:

```text
http://localhost:3000
```

Backend runs at:

```text
http://localhost:8000
```

## CORS and Frontend API

- the backend allows requests from `http://localhost:3000`
- the frontend currently uses a hard-coded backend base URL: `http://localhost:8000`

If you run the backend on a different host or port, update:

```text
room-booking-frontend/src/api.js
```

## Useful Commands

### Backend

```bash
python manage.py check
python manage.py test
```

### Frontend

```bash
cd room-booking-frontend
npm run build
```

## Submission Notes

This project satisfies the main assignment requirements:

- Django + Django REST Framework backend
- room and booking data models
- overlap prevention
- capacity validation
- `POST /bookings/`
- `GET /rooms/availability/?start=&end=`
- bonus pricing logic
- responsive frontend
