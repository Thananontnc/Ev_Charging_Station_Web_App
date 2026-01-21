import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, User, MapPin, Shield, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    // Sync user state when location changes (in case of login/logout)
    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user')));
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="nav-logo">
                    <Zap size={32} color="var(--primary)" />
                    <span>EV Charge</span>
                </Link>

                <div className="nav-links">
                    <Link to={user ? "/user/search" : "/login"} className="nav-link">Search Map</Link>
                    {user && user.role === 'admin' && (
                        <>
                            <Link to="/operator" className="nav-link">Station Operator</Link>
                            <Link to="/admin" className="nav-link">System Admin</Link>
                        </>
                    )}

                    <div className="nav-auth">
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div className="user-profile-nav">
                                    <User size={18} color="var(--primary)" />
                                    <span>{user.name}</span>
                                </div>
                                <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn-primary">
                                <User size={18} />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
