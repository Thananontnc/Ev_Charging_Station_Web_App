import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const [allStations, setAllStations] = useState([]); // Stations from API
    const [loading, setLoading] = useState(true);
    const [bookingHistory, setBookingHistory] = useState([]); // Store confirmed reservations
    const [selectedType, setSelectedType] = useState('All Types');
    const [availabilityOnly, setAvailabilityOnly] = useState('All Stations');
    const [stats, setStats] = useState({
        nearest: '--',
        available: 0,
        waitTime: '--'
    });
    const navigate = useNavigate();

    // Security check: Redirect to login if not authenticated
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
        }
    }, [navigate]);

    const API_URL = 'http://localhost:5001/api';

    // Fetch stations from backend whenever filters change
    useEffect(() => {
        fetchStations();
    }, [searchQuery, selectedType, availabilityOnly]);

    // Initial fetch for history
    useEffect(() => {
        fetchBookingHistory();
    }, []);

    const fetchStations = async () => {
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedType !== 'All Types') params.append('type', selectedType);
            if (availabilityOnly === 'Available Only') params.append('available', 'true');

            const response = await fetch(`${API_URL}/stations?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setAllStations(data.data);
                calculateStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stations:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (stationsList) => {
        if (!stationsList || stationsList.length === 0) {
            setStats({ nearest: '--', available: 0, waitTime: '--' });
            return;
        }

        // 1. Available Slots
        const totalAvailable = stationsList.reduce((acc, st) => acc + (st.available_slots || 0), 0);

        // 2. Nearest Station (if user location available)
        let nearestDist = '--';
        if (userLocation) {
            const distances = stationsList.map(st => {
                const d = getDistance(userLocation[0], userLocation[1], st.lat, st.lng);
                return d;
            });
            nearestDist = Math.min(...distances).toFixed(1) + ' km';
        }

        // 3. Avg Wait Time (Mock logic: based on slot occupancy)
        const totalSlots = stationsList.reduce((acc, st) => acc + (st.total_slots || 0), 0);
        const occupancy = totalSlots > 0 ? (totalSlots - totalAvailable) / totalSlots : 0;
        const waitTime = Math.round(occupancy * 45) + ' min'; // Max 45 min wait

        setStats({
            nearest: nearestDist,
            available: totalAvailable,
            waitTime: waitTime
        });
    };

    // Haversine formula to calculate distance in KM
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const fetchBookingHistory = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        try {
            const response = await fetch(`${API_URL}/reservations?customerId=${user.id}`);
            const data = await response.json();
            if (data.success) {
                setBookingHistory(data.data);
            }
        } catch (error) {
            console.error('Error fetching booking history:', error);
        }
    };

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



    // Recalculate stats if user location becomes available
    useEffect(() => {
        if (userLocation && allStations.length > 0) {
            calculateStats(allStations);
        }
    }, [userLocation]);

    // Use allStations directly since backend handles filtering
    const stations = allStations;

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

    const handleConfirmReservation = async (details) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('Please login to book a station');
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...details,
                    customerId: user.id
                })
            });

            const data = await response.json();

            if (data.success) {
                const booking = data.data;
                alert(`Reservation Confirmed!\n\nStation: ${booking.stationName}\nSlot Assigned: ${booking.slotNumber}\nDate: ${booking.date}\nTime: ${booking.time}\nDuration: ${booking.duration} hour(s)\nTotal Price: $${booking.totalPrice}\n\nStarting Navigation to station...`);

                // Refresh booking history and stations
                await fetchBookingHistory();
                await fetchStations();

                setSelectedStation(null); // Close modal
                handleNavigate(details.station); // Auto-start navigation
            } else {
                alert('Failed to create reservation: ' + data.error);
            }
        } catch (error) {
            console.error('Error creating reservation:', error);
            alert('Failed to create reservation. Please try again.');
        }
    };

    const handleCancelReservation = async (reservationId) => {
        if (!window.confirm('Are you sure you want to cancel this reservation? \n\nNote: Cancellations are only allowed before the booking starts.')) return;

        try {
            const response = await fetch(`${API_URL}/reservations/${reservationId}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.success) {
                alert('Reservation cancelled successfully!');
                await fetchBookingHistory();
                await fetchStations();
            } else {
                // This will show the specific Time Logic reason from the backend
                alert(`Cannot Cancel: ${data.error}`);
            }
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            alert('Error connecting to the reservation server. Please try again.');
        }
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
                                    <select
                                        className="filter-select"
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                    >
                                        <option>All Types</option>
                                        <option>CCS</option>
                                        <option>CHAdeMO</option>
                                        <option>Tesla</option>
                                        <option>Type 2</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Availability</label>
                                    <select
                                        className="filter-select"
                                        value={availabilityOnly}
                                        onChange={(e) => setAvailabilityOnly(e.target.value)}
                                    >
                                        <option>All Stations</option>
                                        <option>Available Only</option>
                                    </select>
                                </div>
                                <div className="filter-group" style={{ justifyContent: 'flex-end', display: 'flex', alignItems: 'flex-end' }}>
                                    <button
                                        className="btn-secondary"
                                        style={{ height: '42px' }}
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedType('All Types');
                                            setAvailabilityOnly('All Stations');
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>

                            {/* 2. Stats Section */}
                            <div className="stats-bar">
                                <div className="stat-item">
                                    <h4>{stations.length}</h4>
                                    <p>Stations Found</p>
                                </div>
                                <div className="stat-item">
                                    <h4>{stats.nearest}</h4>
                                    <p>Nearest Station</p>
                                </div>
                                <div className="stat-item">
                                    <h4 style={{ color: 'var(--primary)' }}>
                                        {stats.available} slots
                                    </h4>
                                    <p>Available Today</p>
                                </div>
                                <div className="stat-item">
                                    <h4>{stats.waitTime}</h4>
                                    <p>Avg Wait Time</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Full Width Map Visualization */}
                        <div className="map-container" style={{ marginBottom: '32px', height: '450px' }}>
                            <MapComponent
                                stations={stations}
                                userLocation={userLocation}
                                destination={destination}
                                onMarkerClick={(st) => handleBook(st)}
                                onExitNav={() => setDestination(null)}
                            />
                        </div>

                        {/* 4. Station List */}
                        <div className="station-list-container">
                            <h3 style={{ marginBottom: '16px', fontSize: '1.5rem' }}>Available Charging Stations</h3>
                            <div className="station-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
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

                                        <div className="station-info-col">
                                            <span className="station-label">Slots</span>
                                            <span className="station-value" style={{ color: st.available_slots > 0 ? 'var(--primary)' : 'var(--danger)' }}>
                                                {st.available_slots} / {st.total_slots}
                                            </span>
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
                                            <span className={`badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                                        </div>
                                        <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>
                                            <MapPin size={14} style={{ marginRight: '5px', verticalAlign: 'text-bottom' }} />
                                            {booking.address}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                            <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem' }}>
                                                <span><strong>Date:</strong> {booking.date}</span>
                                                <span><strong>Time:</strong> {booking.time}</span>
                                                <span><strong>Slot:</strong> #{booking.slotNumber}</span>
                                                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${booking.totalPrice}</span>
                                            </div>
                                            {booking.status === 'Confirmed' && (
                                                <button
                                                    className="btn-secondary"
                                                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '5px 12px', fontSize: '0.8rem' }}
                                                    onClick={() => handleCancelReservation(booking.id)}
                                                >
                                                    Cancel Reservation
                                                </button>
                                            )}
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
