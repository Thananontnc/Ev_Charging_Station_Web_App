import { Link, useLocation } from 'react-router-dom';
import { Zap, User, MapPin, Shield } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();

    // Mock checking if user is logged in or role (for now just static)
    const isAuth = location.pathname.includes('dashboard');

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="nav-logo">
                    <Zap size={32} color="var(--primary)" />
                    <span>EV Charge</span>
                </Link>

                <div className="nav-links">
                    {!isAuth && (
                        <>
                            <Link to="/login" className="nav-link">Find Stations</Link>
                        </>
                    )}

                    <div className="nav-auth">
                        <Link to="/login" className="btn-primary">
                            <User size={18} />
                            <span>Login</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
