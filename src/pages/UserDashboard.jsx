import { useState, useEffect } from 'react';
import { Map, MapPin, Clock, Navigation } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import ReservationModal from '../components/ReservationModal';
import '../styles/Dashboard.css';

const UserDashboard = () => {
    const [activeTab, setActiveTab] = useState('search');
    const [userLocation, setUserLocation] = useState(null);
    const [destination, setDestination] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStation, setSelectedStation] = useState(null); // For Reservation Modal

    // Get User's Real Location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Fallback to Bangkok center if denied
                    setUserLocation([13.7563, 100.5018]);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
            setUserLocation([13.7563, 100.5018]);
        }
    }, []);

    // Mock Stations data
    const allStations = [
        // Bangkok
        { id: 1, name: 'Tesla Supercharger - Central World', address: 'Central World, Pathum Wan, Bangkok', distance: '0.8 mi', type: 'Supercharger', status: 'Available', lat: 13.7466, lng: 100.5393 },
        { id: 2, name: 'PEA Volta - Bangchak', address: 'Vibhavadi Rangsit Rd, Bangkok', distance: '1.2 mi', type: 'CCS2', status: 'Busy', lat: 13.7845, lng: 100.5623 },
        { id: 3, name: 'EA Anywhere - Siam Paragon', address: 'Siam Paragon, Rama I Rd, Bangkok', distance: '1.5 mi', type: 'Type 2', status: 'Available', lat: 13.7469, lng: 100.5349 },
        { id: 4, name: 'EVgo - Don Mueang Airport', address: 'Vibhavadi Rangsit Rd, Bangkok', distance: '12 mi', type: 'CHAdeMO', status: 'Maintenance', lat: 13.9137, lng: 100.6046 },
        { id: 5, name: 'Shell Recharge - Sukhumvit', address: 'Sukhumvit 24, Bangkok', distance: '5.1 mi', type: 'CCS', status: 'Available', lat: 13.7302, lng: 100.5694 },

        // Out of Bangkok
        { id: 6, name: 'Pattaya EV Station', address: 'Pattaya Beach Rd, Chon Buri', distance: '145 km', type: 'CCS2', status: 'Available', lat: 12.9276, lng: 100.8771 },
        { id: 7, name: 'Hua Hin Charging Hub', address: 'Hua Hin, Prachuap Khiri Khan', distance: '198 km', type: 'Type 2', status: 'Available', lat: 12.5684, lng: 99.9577 },
        { id: 8, name: 'Ayutthaya Historical Park', address: 'Phra Nakhon Si Ayutthaya', distance: '80 km', type: 'Type 2', status: 'Available', lat: 14.3532, lng: 100.5693 },
        { id: 9, name: 'Chiang Mai EV Point', address: 'Nimman Road, Chiang Mai', distance: '680 km', type: 'CCS2', status: 'Available', lat: 18.7961, lng: 98.9793 },
        { id: 10, name: 'Phuket Supercharger', address: 'Central Phuket, Phuket', distance: '840 km', type: 'Supercharger', status: 'Busy', lat: 7.8804, lng: 98.3923 },
    ];

    // Filter stations based on search query
    const stations = allStations.filter(st =>
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBook = (name) => {
        // Find station object if only name is passed or if full object passed
        let station = name;
        if (typeof name === 'string') {
            station = allStations.find(s => s.name === name) || { name };
        }
        setSelectedStation(station);
    };

    const handleNavigate = (station) => {
        setDestination([station.lat, station.lng]);
    };

    const [bookingHistory, setBookingHistory] = useState([]); // Store confirmed reservations

    // ... (existing code)

    const handleConfirmReservation = (details) => {
        alert(`Reservation Confirmed!\n\nStation: ${details.station.name}\nDate: ${details.date}\nTime: ${details.timeSlot}\nDuration: ${details.duration} hour(s)\n\nStarting Navigation to station...`);

        // Add to history
        const newBooking = {
            id: Date.now(), // simple unique id
            stationName: details.station.name,
            address: details.station.address,
            date: details.date,
            time: details.timeSlot,
            duration: details.duration,
            status: 'Confirmed'
        };
        setBookingHistory(prev => [newBooking, ...prev]);

        setSelectedStation(null); // Close modal
        handleNavigate(details.station); // Auto-start navigation
    };

    // ... (render)



    return (
        <div className="dashboard container">
            <header className="dashboard-header">
                <h2 className="title">Station Finder</h2>
                <div className="dashboard-tabs">
                    <button className={`tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
                        <Map size={18} /> Search & Book
                    </button>
                    <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                        <Clock size={18} /> History
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                {activeTab === 'search' && (
                    <>
                        {/* 1. Filters Section */}
                        <div className="search-controls">
                            <div className="filter-bar">
                                <div className="filter-group">
                                    <label>Search Location</label>
                                    <input
                                        type="text"
                                        className="filter-input"
                                        placeholder="Enter city, address, or station name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="filter-group">
                                    <label>Charger Type</label>
                                    <select className="filter-select">
                                        <option>All Types</option>
                                        <option>CCS</option>
                                        <option>CHAdeMO</option>
                                        <option>Tesla</option>
                                        <option>Type 2</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Availability</label>
                                    <select className="filter-select">
                                        <option>All Stations</option>
                                        <option>Available Only</option>
                                    </select>
                                </div>
                                <div className="filter-group" style={{ justifyContent: 'flex-end', display: 'flex', alignItems: 'flex-end' }}>
                                    <button className="btn-secondary" style={{ height: '42px' }}>Clear Filters</button>
                                </div>
                            </div>

                            {/* 2. Stats Section */}
                            <div className="stats-bar">
                                <div className="stat-item">
                                    <h4>{stations.length}</h4>
                                    <p>Stations Found</p>
                                </div>
                                <div className="stat-item">
                                    <h4>0.8 mi</h4>
                                    <p>Nearest Station</p>
                                </div>
                                <div className="stat-item">
                                    <h4 style={{ color: 'var(--primary)' }}>32 slots</h4>
                                    <p>Available Today</p>
                                </div>
                                <div className="stat-item">
                                    <h4>15 min</h4>
                                    <p>Avg Wait Time</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Split View: List + Map */}
                        <div className="split-view">
                            {/* Left: Station List */}
                            <div className="station-list-container">
                                <h3 style={{ marginBottom: '8px' }}>Available Charging Stations</h3>
                                {stations.map(st => (
                                    <div key={st.id} className="card station-card">
                                        <div className="station-main">
                                            <h3>{st.name}</h3>
                                            <div className="station-meta">
                                                <MapPin size={14} /> {st.address}
                                            </div>
                                        </div>

                                        <div className="station-info-col">
                                            <span className="station-label">Type</span>
                                            <span className="station-value">{st.type}</span>
                                        </div>

                                        <div className="station-actions" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <span className={`badge ${st.status.toLowerCase()}`}>{st.status}</span>
                                            <button
                                                className="btn-primary"
                                                style={{ fontSize: '0.8rem', padding: '6px 12px', width: '100%' }}
                                                onClick={() => handleBook(st)}
                                            >
                                                Book
                                            </button>
                                            <button
                                                className="btn-secondary"
                                                style={{ fontSize: '0.8rem', padding: '6px 12px', width: '100%' }}
                                                onClick={() => handleNavigate(st)}
                                            >
                                                <Navigation size={14} /> Navigate
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right: Map Visualization */}
                            <div className="map-container">
                                <MapComponent
                                    stations={stations}
                                    userLocation={userLocation}
                                    destination={destination}
                                    onMarkerClick={(st) => handleBook(st)}
                                />
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'history' && (
                    <div className="history-list card">
                        <h3>Booking History</h3>
                        {bookingHistory.length === 0 ? (
                            <p className="text-muted">You haven't booked any stations yet.</p>
                        ) : (
                            <div className="history-items">
                                {bookingHistory.map(booking => (
                                    <div key={booking.id} className="history-item" style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <h4 style={{ margin: 0 }}>{booking.stationName}</h4>
                                            <span className="badge available">{booking.status}</span>
                                        </div>
                                        <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>
                                            <MapPin size={14} style={{ marginRight: '5px', verticalAlign: 'text-bottom' }} />
                                            {booking.address}
                                        </p>
                                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', marginTop: '5px' }}>
                                            <span><strong>Date:</strong> {booking.date}</span>
                                            <span><strong>Time:</strong> {booking.time}</span>
                                            <span><strong>Duration:</strong> {booking.duration} hr(s)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Reservation Modal */}
                {selectedStation && (
                    <ReservationModal
                        station={selectedStation}
                        onClose={() => setSelectedStation(null)}
                        onConfirm={handleConfirmReservation}
                    />
                )}
            </main>
        </div>
    );
};

export default UserDashboard;
