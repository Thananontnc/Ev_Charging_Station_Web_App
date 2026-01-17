import { useState, useEffect } from 'react';
import { X, Check, RotateCcw, AlertCircle } from 'lucide-react';

const PaymentDetailModal = ({ paymentId, onClose, onRefresh }) => {
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    const API_URL = 'http://localhost:5001/api/admin/payments';

    useEffect(() => {
        fetchPaymentDetails();
    }, [paymentId]);

    const fetchPaymentDetails = async () => {
        try {
            const res = await fetch(`${API_URL}/${paymentId}`);
            const data = await res.json();
            if (data.success) {
                setPayment(data.data);
                setNewStatus(data.data.status);
            }
        } catch (err) {
            console.error("Error fetching payment details:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`${API_URL}/${paymentId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                alert('Status updated successfully');
                fetchPaymentDetails();
                onRefresh();
            }
        } catch (err) {
            console.error("Error updating status:", err);
        } finally {
            setUpdating(false);
        }
    };

    const handleRefund = async () => {
        if (!window.confirm('Are you sure you want to process a refund? This will also cancel the associated reservation.')) return;

        setUpdating(true);
        try {
            const res = await fetch(`${API_URL}/${paymentId}/refund`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                alert('Refund processed successfully');
                fetchPaymentDetails();
                onRefresh();
            } else {
                alert('Failed to process refund: ' + data.error);
            }
        } catch (err) {
            console.error("Error processing refund:", err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Payment Details</h2>
                    <X size={24} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={onClose} />
                </header>

                <div className="payment-detail-grid">
                    <div className="detail-item">
                        <label>ID</label>
                        <span>{payment.id}</span>
                    </div>
                    <div className="detail-item">
                        <label>Reservation ID</label>
                        <span>{payment.reservationId}</span>
                    </div>
                    <div className="detail-item">
                        <label>Amount</label>
                        <span style={{ color: '#00e676' }}>${payment.amount}</span>
                    </div>
                    <div className="detail-item">
                        <label>Method</label>
                        <span>{payment.method}</span>
                    </div>
                    <div className="detail-item">
                        <label>Status</label>
                        <span className={`badge ${payment.status.toLowerCase()}`}>{payment.status}</span>
                    </div>
                    <div className="detail-item">
                        <label>Created At</label>
                        <span>{payment.createdAt}</span>
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Update Status</label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                disabled={payment.status === 'Refunded'}
                            >
                                <option>Pending</option>
                                <option>Success</option>
                                <option>Failed</option>
                                <option>Refunded</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Refund Amount</label>
                            <input
                                type="text"
                                value={payment.status === 'Refunded' ? payment.amount : "0"}
                                disabled
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={updating}>Close</button>
                    {payment.status !== 'Refunded' && (
                        <>
                            <button className="btn-secondary" style={{ color: '#ffb700', borderColor: '#ffb700' }} onClick={handleRefund} disabled={updating}>
                                <RotateCcw size={16} /> Process Refund
                            </button>
                            <button className="btn-primary" onClick={handleUpdateStatus} disabled={updating || newStatus === payment.status}>
                                Save Changes
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentDetailModal;
