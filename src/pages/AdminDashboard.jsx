import { useState } from 'react';
import { Users, Shield, CheckCircle, XCircle } from 'lucide-react';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('approvals');

    return (
        <div className="dashboard container">
            <header className="dashboard-header">
                <h2 className="title">System Admin</h2>
                <div className="dashboard-tabs">
                    <button className={`tab ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
                        <Shield size={18} /> Approvals
                    </button>
                    <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <Users size={18} /> User Management
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                {activeTab === 'approvals' && (
                    <div className="station-list">
                        <div className="card station-card">
                            <div className="station-info">
                                <h3>New Partner Request: GreenEnergy Co.</h3>
                                <p className="text-muted">Registered: 2 hours ago</p>
                            </div>
                            <div className="station-actions" style={{ flexDirection: 'row' }}>
                                <button className="btn-primary"><CheckCircle size={18} /> Approve</button>
                                <button className="btn-secondary" style={{ color: '#ff3d00' }}><XCircle size={18} /> Reject</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
