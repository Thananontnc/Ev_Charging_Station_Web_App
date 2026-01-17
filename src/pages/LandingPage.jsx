import { Link } from 'react-router-dom';
import { MapPin, BatteryCharging, ShieldCheck } from 'lucide-react';
import '../styles/LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <section className="hero">
                <div className="container hero-content">
                    <h1 className="hero-title">
                        Power Your Journey <br />
                        <span className="text-highlight">Anywhere, Anytime.</span>
                    </h1>
                    <p className="hero-subtitle">
                        The smartest EV charging network in Thailand. Find stations, book slots, and pay seamlessly.
                    </p>
                    <div className="hero-actions">
                        <Link to={localStorage.getItem('user') ? "/user/search" : "/login"} className="btn-primary btn-lg">
                            Find a Station
                        </Link>
                    </div>
                </div>
            </section>

            <section className="features container">
                <div className="feature-card">
                    <MapPin className="feature-icon" color="var(--primary)" size={40} />
                    <h3>Smart Map</h3>
                    <p>Real-time availability of charging stations near you.</p>
                </div>
                <div className="feature-card">
                    <BatteryCharging className="feature-icon" color="var(--secondary)" size={40} />
                    <h3>Fast Charging</h3>
                    <p>Filter by 50kW, 120kW, or superchargers for your needs.</p>
                </div>
                <div className="feature-card">
                    <ShieldCheck className="feature-icon" color="#ffb700" size={40} />
                    <h3>Secure Payment</h3>
                    <p>Seamless transactions with history tracking.</p>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
