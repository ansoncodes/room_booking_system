import { useState, useEffect } from "react";
import { getRooms, createBooking } from "../api";

const EMPTY_FORM = {
    room_id: "",
    guest_count: "",
    start_datetime: "",
    end_datetime: "",
};

const BookRoom = () => {
    const [rooms, setRooms] = useState([]);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        getRooms()
            .then(setRooms)
            .catch((err) => setError(err?.error || "Failed to load rooms."));
    }, []);

    const handleChange = (e) => {
        setError(null);
        setSuccess(null);
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const formatError = (err) => {
        if (typeof err === "string") return err;
        return Object.entries(err)
            .map(([field, msgs]) => {
                const text = Array.isArray(msgs) ? msgs.join(" ") : msgs;
                return field === "non_field_errors" ? text : `${field}: ${text}`;
            })
            .join("\n");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!formData.room_id) { setError("Please select a room."); return; }
        if (Number(formData.guest_count) < 1) { setError("Guest count must be at least 1."); return; }
        if (new Date(formData.end_datetime) <= new Date(formData.start_datetime)) {
            setError("End time must be after start time.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                room_id: Number(formData.room_id),
                guest_count: Number(formData.guest_count),
                start_datetime: new Date(formData.start_datetime).toISOString(),
                end_datetime: new Date(formData.end_datetime).toISOString(),
            };
            const booking = await createBooking(payload);
            const roomName = rooms.find((r) => r.id === Number(formData.room_id))?.name ?? "—";
            setSuccess({ ...booking, roomName });
            setFormData(EMPTY_FORM);
        } catch (err) {
            setError(formatError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section">
            <h2 className="section-title">Book a Room</h2>

            <form onSubmit={handleSubmit}>
                {/* Room */}
                <div className="form-group" style={{ marginBottom: "18px" }}>
                    <label htmlFor="room_id">Room</label>
                    <select
                        id="room_id" name="room_id"
                        className="input"
                        value={formData.room_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a room</option>
                        {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                                {room.name} — capacity {room.capacity}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Guest count */}
                <div className="form-group" style={{ marginBottom: "18px" }}>
                    <label htmlFor="guest_count">Number of Guests</label>
                    <input
                        id="guest_count" name="guest_count"
                        className="input" type="number" min="1"
                        placeholder="e.g. 4"
                        value={formData.guest_count}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Datetime row */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="start_datetime">Start Date &amp; Time</label>
                        <input
                            id="start_datetime" name="start_datetime"
                            className="input" type="datetime-local"
                            value={formData.start_datetime}
                            onChange={handleChange} required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="end_datetime">End Date &amp; Time</label>
                        <input
                            id="end_datetime" name="end_datetime"
                            className="input" type="datetime-local"
                            value={formData.end_datetime}
                            onChange={handleChange} required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className={`btn btn-primary btn-full${loading ? " btn-loading" : ""}`}
                    disabled={loading}
                    style={{ marginTop: "8px" }}
                >
                    {loading ? (
                        <><span className="spinner" /> Booking…</>
                    ) : (
                        "Book Now"
                    )}
                </button>
            </form>

            {error && <div className="error-box">{error}</div>}

            {success && (
                <div className="success-box">
                    <strong>✓ Booking Confirmed!</strong>
                    Booking ID: <b>#{success.id}</b><br />
                    Room: <b>{success.roomName}</b><br />
                    Guests: <b>{success.guest_count}</b><br />
                    Total: <b>₹{parseFloat(success.total_price).toFixed(2)}</b>
                </div>
            )}
        </div>
    );
};

export default BookRoom;
