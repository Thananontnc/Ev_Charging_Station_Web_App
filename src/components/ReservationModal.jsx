import { useState, useMemo } from 'react';
import '../styles/ReservationModal.css';

const ReservationModal = ({ station, onClose, onConfirm }) => {
    // Default to today
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);
    const [timeSlot, setTimeSlot] = useState('');
    const [duration, setDuration] = useState('1');
    const [notes, setNotes] = useState('');

    // Generate smart time slots
    const timeSlots = useMemo(() => {
        const slots = [
            "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
            "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
            "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
            "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
        ];

        const now = new Date();
        const selectedDate = new Date(date);
        const isToday = selectedDate.toDateString() === now.toDateString();

        return slots.map(slot => {
            const [hours, minutes] = slot.split(':').map(Number);
            const slotTime = new Date(selectedDate);
            slotTime.setHours(hours, minutes, 0, 0);

            return {
                value: slot,
                label: slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                disabled: isToday && slotTime < now
            };
        });
    }, [date]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Final validation
        const selectedStart = new Date(`${date} ${timeSlot}`);
        if (selectedStart < new Date()) {
            alert("Error: You cannot book a time in the past.");
            return;
        }

        onConfirm({ station, date, timeSlot, duration, notes });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h2>Book Charging Slot</h2>
                </header>

                <form onSubmit={handleSubmit} className="reservation-form">
                    <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <p style={{ margin: 0, fontWeight: '600', color: 'var(--primary)' }}>{station.name}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Price: ${station.price}/kWh</p>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                required
                                min={today}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Arrival Time</label>
                            <select
                                required
                                value={timeSlot}
                                onChange={(e) => setTimeSlot(e.target.value)}
                            >
                                <option value="" disabled>Select time</option>
                                {timeSlots.map(slot => (
                                    <option
                                        key={slot.value}
                                        value={slot.value}
                                        disabled={slot.disabled}
                                        style={slot.disabled ? { color: '#555' } : {}}
                                    >
                                        {slot.label} {slot.disabled ? '(Unavailable)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Duration (hours)</label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        >
                            <option value="0.5">30 Mins</option>
                            <option value="1">1 Hour</option>
                            <option value="1.5">1.5 Hours</option>
                            <option value="2">2 Hours</option>
                            <option value="3">3 Hours</option>
                            <option value="4">4 Hours</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Special Instructions (Optional)</label>
                        <textarea
                            rows="2"
                            placeholder="e.g. Need assistance with cable..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Confirm & Book</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservationModal;
