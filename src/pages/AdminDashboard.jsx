import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    CreditCard,
    Settings,
    RefreshCw,
    Filter,
    Download,
    TrendingUp,
    Clock,
    DollarSign,
    Zap
} from 'lucide-react';
import '../styles/Dashboard.css';
import PaymentDetailModal from '../components/PaymentDetailModal';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [stats, setStats] = useState({
        totalReservations: 0,
        pendingApprovals: 0,
        totalRevenue: "0.00",
        dailyRevenue: "0.00",
        activeStations: 0
    });

    const [reservations, setReservations] = useState([]);
    const [payments, setPayments] = useState([]);
    const [myStations, setMyStations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters for Reservations
    const [resFilterStatus, setResFilterStatus] = useState('All statuses');
    const [resFilterStation, setResFilterStation] = useState('all');

    const API_URL = 'http://localhost:5001/api/admin';

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'admin') {
            navigate('/login');
            return;
        }
        setAdmin(storedUser);
        fetchAllData(storedUser.id);
    }, []);

    const fetchAllData = async (adminId) => {
        setLoading(true);
        const viewId = 'all'; // Change to adminId if you want to restrict back to owner-only
        try {
            await Promise.all([
                fetchStats(viewId),
                fetchReservations(viewId),
                fetchPayments(viewId),
                fetchMyStations(viewId)
            ]);
        } catch (err) {
            console.error("Error fetching admin data:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async (adminId) => {
        const res = await fetch(`${API_URL}/stats?adminId=${adminId}`);
        const data = await res.json();
        if (data.success) setStats(data.data);
    };

    const fetchReservations = async (adminId) => {
        const res = await fetch(`${API_URL}/reservations?adminId=${adminId}&status=${resFilterStatus}&stationId=${resFilterStation}`);
        const data = await res.json();
        if (data.success) setReservations(data.data);
    };

    const fetchPayments = async (adminId) => {
        const res = await fetch(`${API_URL}/payments?adminId=${adminId}`);
        const data = await res.json();
        if (data.success) setPayments(data.data);
    };

    const fetchMyStations = async (adminId) => {
        const res = await fetch(`${API_URL}/my-stations?adminId=${adminId}`);
        const data = await res.json();
        if (data.success) setMyStations(data.data);
    };

    const handleUpdateStatus = async (id, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this reservation as ${newStatus}?`)) return;
        try {
            const res = await fetch(`http://localhost:5001/api/admin/reservations/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                fetchAllData('all');
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // Auto-refresh reservations when filters change
    useEffect(() => {
        if (admin) fetchReservations('all');
    }, [resFilterStatus, resFilterStation]);

    if (!admin) return null;

    return (
        <div className="admin-container" style={{ padding: '24px', background: 'var(--bg-body)', minHeight: '100vh', color: 'var(--text-main)' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '32px', fontWeight: '700' }}>Admin Dashboard</h1>

            {/* Overview KPIs */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-muted)' }}>Overview KPIs</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Reservations</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>{stats.totalReservations}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Across all time</div>
                    </div>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Pending Approvals</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ffb700' }}>{stats.pendingApprovals} approvals</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Awaiting manager action</div>
                    </div>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Revenue</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#00e676' }}>US${stats.totalRevenue}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Accrued total</div>
                    </div>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Daily Revenue</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--secondary)' }}>US${stats.dailyRevenue}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Last 24 hours</div>
                    </div>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Active Stations</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>{stats.activeStations}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Live units</div>
                    </div>
                </div>
            </section>

            {/* Reservation Management */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '700' }}>Reservation Management</h2>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter by Status</label>
                        <select
                            value={resFilterStatus}
                            onChange={(e) => setResFilterStatus(e.target.value)}
                            style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '200px' }}
                        >
                            <option>All statuses</option>
                            <option>Pending</option>
                            <option>Confirmed</option>
                            <option>Cancelled</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter by Station</label>
                        <select
                            value={resFilterStation}
                            onChange={(e) => setResFilterStation(e.target.value)}
                            style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '250px' }}
                        >
                            <option value="all">All stations</option>
                            {myStations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <button className="btn-secondary" onClick={() => { setResFilterStatus('All statuses'); setResFilterStation('all'); }} style={{ padding: '10px 20px', height: '42px' }}>Clear Filters</button>
                    <button className="btn-secondary" onClick={() => fetchReservations(admin.id)} style={{ padding: '10px 20px', height: '42px' }}><RefreshCw size={16} /> Refresh</button>
                </div>

                {/* Table */}
                <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '16px' }}>ID</th>
                                <th style={{ padding: '16px' }}>User</th>
                                <th style={{ padding: '16px' }}>Station</th>
                                <th style={{ padding: '16px' }}>Start</th>
                                <th style={{ padding: '16px' }}>End</th>
                                <th style={{ padding: '16px' }}>Total</th>
                                <th style={{ padding: '16px' }}>Status</th>
                                <th style={{ padding: '16px' }}>Slot</th>
                                <th style={{ padding: '16px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map(res => (
                                <tr key={res.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '16px' }}>{res.id}</td>
                                    <td style={{ padding: '16px' }}>{res.userName}</td>
                                    <td style={{ padding: '16px' }}>{res.stationName}</td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem' }}>{res.start}</td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem' }}>{res["end"]}</td>
                                    <td style={{ padding: '16px', fontWeight: '600' }}>${res.total}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span className={`badge ${res.status.toLowerCase()}`}>{res.status}</span>
                                    </td>
                                    <td style={{ padding: '16px' }}>#{res.slot}</td>
                                    <td style={{ padding: '16px' }}>
                                        {res.status === 'Pending' && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleUpdateStatus(res.id, 'Confirmed')}
                                                    style={{ padding: '4px 8px', borderRadius: '4px', background: '#00e676', color: '#000', fontSize: '0.75rem', fontWeight: '600', border: 'none', cursor: 'pointer' }}
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(res.id, 'Cancelled')}
                                                    style={{ padding: '4px 8px', borderRadius: '4px', background: '#ff5252', color: '#fff', fontSize: '0.75rem', fontWeight: '600', border: 'none', cursor: 'pointer' }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                        {res.status === 'Confirmed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(res.id, 'Cancelled')}
                                                style={{ padding: '4px 8px', borderRadius: '4px', background: 'transparent', color: '#ff5252', fontSize: '0.75rem', border: '1px solid #ff5252', cursor: 'pointer' }}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{reservations.length} results</span>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Filter size={14} style={{ cursor: 'pointer' }} />
                            <Download size={14} style={{ cursor: 'pointer' }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Payment Management */}
            <section>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '700' }}>Payment Management</h2>
                <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '16px' }}>ID</th>
                                <th style={{ padding: '16px' }}>Reservation</th>
                                <th style={{ padding: '16px' }}>Amount</th>
                                <th style={{ padding: '16px' }}>Method</th>
                                <th style={{ padding: '16px' }}>Status</th>
                                <th style={{ padding: '16px' }}>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(pay => (
                                <tr
                                    key={pay.id}
                                    className="clickable-row"
                                    onClick={() => setSelectedPaymentId(pay.id)}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                >
                                    <td style={{ padding: '16px' }}>{pay.id}</td>
                                    <td style={{ padding: '16px' }}>#{pay.reservationId}</td>
                                    <td style={{ padding: '16px', fontWeight: '600', color: '#00e676' }}>US${pay.amount}</td>
                                    <td style={{ padding: '16px' }}>{pay.method}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span className={`badge ${pay.status.toLowerCase()}`}>{pay.status}</span>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem' }}>{pay.createdAt}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {selectedPaymentId && (
                <PaymentDetailModal
                    paymentId={selectedPaymentId}
                    onClose={() => setSelectedPaymentId(null)}
                    onRefresh={() => fetchAllData('all')}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
