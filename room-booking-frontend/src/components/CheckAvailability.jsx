import { useState } from "react";
import { checkAvailability } from "../api";

const CheckAvailability = () => {
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setResults(null);

        if (new Date(end) <= new Date(start)) {
            setError("End time must be after start time.");
            return;
        }

        setLoading(true);
        try {
            const data = await checkAvailability(
                new Date(start).toISOString(),
                new Date(end).toISOString()
            );
            setResults(data);
        } catch (err) {
            setError(err?.error || JSON.stringify(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section">
            <h2 className="section-title">Check Availability</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="avail-start">Start Date &amp; Time</label>
                        <input
                            id="avail-start"
                            className="input"
                            type="datetime-local"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="avail-end">End Date &amp; Time</label>
                        <input
                            id="avail-end"
                            className="input"
                            type="datetime-local"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className={`btn btn-primary btn-full${loading ? " btn-loading" : ""}`}
                    disabled={loading}
                >
                    {loading ? (
                        <><span className="spinner" /> Checking…</>
                    ) : (
                        "Check Availability"
                    )}
                </button>
            </form>

            {error && <div className="error-box">{error}</div>}

            {results !== null && (
                results.length === 0 ? (
                    <p className="loading-text" style={{ marginTop: "20px" }}>
                        No rooms found.
                    </p>
                ) : (
                    <div className="room-grid">
                        {results.map((room) => (
                            <div className="room-card" key={room.id}>
                                <p className="room-card-name">{room.name}</p>
                                <p className="room-card-meta">Capacity: {room.capacity} guests</p>
                                <p className="room-card-meta">₹{room.price_per_hour}/hr</p>
                                <div className="room-card-badge">
                                    <span className={room.is_available ? "badge-available" : "badge-unavailable"}>
                                        {room.is_available ? "● Available" : "● Unavailable"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default CheckAvailability;
