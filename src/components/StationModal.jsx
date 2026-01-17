import { useState } from 'react';
import { X, Save, MapPin, Zap } from 'lucide-react';

const StationModal = ({ station, onClose, onSave }) => {
    const [formData, setFormData] = useState(station || {
        station_name: '',
        description: '',
        latitude: '',
        longitude: '',
        connector_type: 'CCS2',
        charging_watt: 120,
        total_slots: 2,
        price_per_kwh: 7.0,
        operating_hours: '24/7',
        status: 'Available'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '700px' }}>
                <header className="modal-header">
                    <h2>{station ? 'Edit Station' : 'Add New Station'}</h2>
                    <X size={24} style={{ cursor: 'pointer' }} onClick={onClose} />
                </header>

                <form onSubmit={handleSubmit} className="reservation-form" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 className="station-label" style={{ marginBottom: '12px' }}>Basic Information</h3>
                        <div className="form-group">
                            <label>Station Name</label>
                            <input
                                type="text"
                                required
                                value={formData.station_name}
                                onChange={(e) => setFormData({ ...formData, station_name: e.target.value })}
                                placeholder="e.g. Downtown Hub"
                            />
                        </div>
                        <div className="form-group">
                            <label>Description / Address</label>
                            <textarea
                                rows="2"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Full address or location details..."
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h3 className="station-label" style={{ marginBottom: '12px' }}>Location</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    value={formData.latitude}
                                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    value={formData.longitude}
                                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h3 className="station-label" style={{ marginBottom: '12px' }}>Technical Specifications</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Charger Type</label>
                                <select
                                    value={formData.connector_type}
                                    onChange={(e) => setFormData({ ...formData, connector_type: e.target.value })}
                                >
                                    <option>CCS2</option>
                                    <option>Type 2</option>
                                    <option>CHAdeMO</option>
                                    <option>Supercharger</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Power Output (kW)</label>
                                <input
                                    type="number"
                                    value={formData.charging_watt}
                                    onChange={(e) => setFormData({ ...formData, charging_watt: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Total Slots</label>
                                <input
                                    type="number"
                                    value={formData.total_slots}
                                    onChange={(e) => setFormData({ ...formData, total_slots: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Operating Hours</label>
                                <input
                                    type="text"
                                    value={formData.operating_hours}
                                    onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                                    placeholder="e.g. 24/7 or 6am - 11pm"
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h3 className="station-label" style={{ marginBottom: '12px' }}>Operational Details</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Price per kWh (THB)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.price_per_kwh}
                                    onChange={(e) => setFormData({ ...formData, price_per_kwh: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option>Available</option>
                                    <option>Busy</option>
                                    <option>Maintenance</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ borderTop: 'none', background: 'transparent' }}>
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">
                            <Save size={18} /> Save Station
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StationModal;
