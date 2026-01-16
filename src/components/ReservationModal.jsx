import { useState } from 'react';
import '../styles/ReservationModal.css';

const ReservationModal = ({ station, onClose, onConfirm }) => {
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [duration, setDuration] = useState('1');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({ station, date, timeSlot, duration, notes });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h2>Reservation Management</h2>
                </header>

                <form onSubmit={handleSubmit} className="reservation-form">
                    <p className="modal-subtitle"><strong>Reserving at:</strong> {station.name}</p>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Reservation Date</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Time Slot</label>
                            <select
                                required
                                value={timeSlot}
                                onChange={(e) => setTimeSlot(e.target.value)}
                            >
                                <option value="" disabled>Select a time slot</option>
                                <option value="09:00">09:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="13:00">01:00 PM</option>
                                <option value="14:00">02:00 PM</option>
                                <option value="15:00">03:00 PM</option>
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
                            <option value="2">2 Hours</option>
                            <option value="3">3 Hours</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Additional Notes (Optional)</label>
                        <textarea
                            rows="3"
                            placeholder="Any special requirements or notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Confirm Reservation</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservationModal;
