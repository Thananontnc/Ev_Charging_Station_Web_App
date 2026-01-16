import { useState } from 'react';
import { Zap, Plus, DollarSign, BarChart } from 'lucide-react';
import '../styles/Dashboard.css';

const StationDashboard = () => {
    const [activeTab, setActiveTab] = useState('stations');

    return (
        <div className="dashboard container">
            <header className="dashboard-header">
                <h2 className="title">Partner Dashboard</h2>
                <div className="dashboard-tabs">
                    <button className={`tab ${activeTab === 'stations' ? 'active' : ''}`} onClick={() => setActiveTab('stations')}>
                        <Zap size={18} /> My Stations
                    </button>
                    <button className={`tab ${activeTab === 'earnings' ? 'active' : ''}`} onClick={() => setActiveTab('earnings')}>
                        <DollarSign size={18} /> Revenue
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                {activeTab === 'stations' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                            <button className="btn-primary">
                                <Plus size={18} /> Add New Station
                            </button>
                        </div>
                        <div className="station-list">
                            <div className="card station-card">
                                <div className="station-info">
                                    <h3>Station #102 - Asoke</h3>
                                    <p className="text-muted">Status: Active • 2 Chargers</p>
                                </div>
                                <div className="station-actions">
                                    <span className="badge available">Active</span>
                                    <button className="btn-secondary">Unmanage</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'earnings' && (
                    <div className="card">
                        <h3>Total Revenue</h3>
                        <h1 style={{ fontSize: '3rem', color: 'var(--primary)' }}>฿ 12,500</h1>
                        <p className="text-muted">This month</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StationDashboard;
