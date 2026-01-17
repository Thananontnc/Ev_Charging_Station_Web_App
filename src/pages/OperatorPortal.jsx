import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap,
    Plus,
    Edit,
    Trash2,
    RefreshCw,
    TrendingUp,
    Calendar,
    DollarSign,
    Activity
} from 'lucide-react';
import StationModal from '../components/StationModal';
import '../styles/Dashboard.css';

const OperatorPortal = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [stations, setStations] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        dailyRevenue: 0,
        activeStations: 0
    });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState(null);

    const API_URL = 'http://localhost:5001/api/operator';

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'admin') {
            navigate('/login');
            return;
        }
        setAdmin(storedUser);
        fetchData(storedUser.id);
    }, []);

    const fetchData = async (adminId) => {
        setLoading(true);
        try {
            await Promise.all([
                fetchStations(adminId),
                fetchStats(adminId)
            ]);
        } catch (error) {
            console.error("Error fetching operator data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStations = async (adminId) => {
        const res = await fetch(`${API_URL}/stations?adminId=${adminId}`);
        const data = await res.json();
        if (data.success) setStations(data.data);
    };

    const fetchStats = async (adminId) => {
        // We reuse the admin stats endpoint as it has what we need
        const res = await fetch(`http://localhost:5001/api/admin/stats?adminId=${adminId}`);
        const data = await res.json();
        if (data.success) {
            setStats({
                totalRevenue: data.data.totalRevenue,
                totalBookings: data.data.totalReservations,
                dailyRevenue: data.data.dailyRevenue,
                activeStations: data.data.activeStations
            });
        }
    };

    const handleSaveStation = async (formData) => {
        try {
            const url = editingStation
                ? `${API_URL}/stations/${editingStation.station_id}`
                : `${API_URL}/stations`;

            const method = editingStation ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, admin_id: admin.id })
            });

            const data = await res.json();
            if (data.success) {
                alert(`Station ${editingStation ? 'updated' : 'added'} successfully!`);
                setIsModalOpen(false);
                setEditingStation(null);
                fetchStations(admin.id);
                fetchStats(admin.id);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    const handleDeleteStation = async (id) => {
        if (!window.confirm('Are you sure you want to delete this station? All reservations will be lost.')) return;

        try {
            const res = await fetch(`${API_URL}/stations/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchStations(admin.id);
                fetchStats(admin.id);
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    if (!admin) return null;

    return (
        <div className="admin-container" style={{ padding: '24px', background: 'var(--bg-body)', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '32px', fontWeight: '700' }}>Charging Station Operator Portal</h1>

            {/* Revenue & Performance */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-muted)' }}>Revenue & Performance</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Revenue</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#00e676' }}>{stats.totalRevenue}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Since last month</div>
                    </div>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Daily Revenue</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>{stats.dailyRevenue}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Since last month</div>
                    </div>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Bookings</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--secondary)' }}>{stats.totalBookings}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Since last month</div>
                    </div>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Active Stations</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ffb700' }}>{stats.activeStations}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Since last month</div>
                    </div>
                </div>
            </section>

            {/* Station Management */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Station Management</h2>
                    <button className="btn-primary" onClick={() => { setEditingStation(null); setIsModalOpen(true); }}>
                        <Plus size={18} /> Add Station
                    </button>
                </div>

                <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '16px' }}>ID</th>
                                <th style={{ padding: '16px' }}>Name</th>
                                <th style={{ padding: '16px' }}>Address</th>
                                <th style={{ padding: '16px' }}>Charger Type</th>
                                <th style={{ padding: '16px' }}>Power Output</th>
                                <th style={{ padding: '16px' }}>Total Slots</th>
                                <th style={{ padding: '16px' }}>Price/kWh</th>
                                <th style={{ padding: '16px' }}>Status</th>
                                <th style={{ padding: '16px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stations.map(station => (
                                <tr key={station.station_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '16px' }}>{station.station_id}</td>
                                    <td style={{ padding: '16px', fontWeight: '600' }}>{station.station_name}</td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem' }}>{station.description}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', fontSize: '0.75rem', fontWeight: '700' }}>
                                            {station.connector_type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>{station.charging_watt}kW</td>
                                    <td style={{ padding: '16px' }}>{station.total_slots}</td>
                                    <td style={{ padding: '16px' }}>THB {station.price_per_kwh}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span className={`badge ${station.status.toLowerCase()}`}>{station.status}</span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn-secondary"
                                                style={{ padding: '6px' }}
                                                onClick={() => { setEditingStation(station); setIsModalOpen(true); }}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn-secondary"
                                                style={{ padding: '6px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                                onClick={() => handleDeleteStation(station.station_id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {isModalOpen && (
                <StationModal
                    station={editingStation}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveStation}
                />
            )}
        </div>
    );
};

export default OperatorPortal;
