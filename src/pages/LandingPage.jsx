import { Link } from 'react-router-dom';
import { MapPin, BatteryCharging, ShieldCheck, Zap, Star } from 'lucide-react';
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
                        The smartest EV charging network in Thailand. Find stations, book slots, and pay seamlessly with our award-winning platform.
                    </p>
                    <div className="hero-actions">
                        <Link to={localStorage.getItem('user') ? "/user/search" : "/login"} className="btn-primary btn-lg">
                            Find a Station
                        </Link>
                        <Link to="/register" className="btn-secondary btn-lg">
                            Join as Partner
                        </Link>
                    </div>
                </div>
            </section>

            <section className="stats-section container">
                <div className="stat-card">
                    <h2>1,200+</h2>
                    <p>Stations Nationwide</p>
                </div>
                <div className="stat-card">
                    <h2>50k+</h2>
                    <p>Happy Drivers</p>
                </div>
                <div className="stat-card">
                    <h2>99.9%</h2>
                    <p>System Uptime</p>
                </div>
                <div className="stat-card">
                    <h2>24/7</h2>
                    <p>Expert Support</p>
                </div>
            </section>

            <section className="features container">
                <div className="feature-card">
                    <MapPin className="feature-icon" color="var(--primary)" size={40} />
                    <h3>Smart Map</h3>
                    <p>Real-time availability of charging stations near you with precise GPS tracking.</p>
                </div>
                <div className="feature-card">
                    <BatteryCharging className="feature-icon" color="var(--secondary)" size={40} />
                    <h3>Fast Charging</h3>
                    <p>Filter by 50kW, 120kW, or superchargers. We support all major connector types.</p>
                </div>
                <div className="feature-card">
                    <ShieldCheck className="feature-icon" color="#ffb700" size={40} />
                    <h3>Secure Payment</h3>
                    <p>Certified secure transactions with automatic invoicing and usage history.</p>
                </div>
            </section>

            <section className="trust-section container">
                <h3 className="trust-title">TRUSTED BY LEADING BRANDS</h3>
                <div className="partners-grid">
                    <Zap size={40} /> {/* Placeholder for Brand 1 */}
                    <Zap size={40} /> {/* Placeholder for Brand 2 */}
                    <Zap size={40} /> {/* Placeholder for Brand 3 */}
                    <Zap size={40} /> {/* Placeholder for Brand 4 */}
                    <Zap size={40} /> {/* Placeholder for Brand 5 */}
                </div>
            </section>

            <section className="testimonials container">
                <h2 className="section-title">What Our Drivers Say</h2>
                <div className="testimonial-grid">
                    <div className="testimonial-card">
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#ffb700" color="#ffb700" />)}
                        </div>
                        <p className="testimonial-text">"The reservation feature is a lifesaver. No more waiting in line at the mall. Highly recommended for every EV owner in Bangkok!"</p>
                        <div className="testimonial-author">
                            <div className="author-info">
                                <h4>Somchai PK.</h4>
                                <p>Tesla Model 3 Owner</p>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-card">
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#ffb700" color="#ffb700" />)}
                        </div>
                        <p className="testimonial-text">"Best EV app in Thailand. The interface is so clean and finding a fast charger is much easier now. 5 stars!"</p>
                        <div className="testimonial-author">
                            <div className="author-info">
                                <h4>Jane Wilson</h4>
                                <p>BYD Atto 3 Driver</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="footer">
                <div className="container footer-content">
                    <div className="footer-main">
                        <div className="footer-logo">
                            <Zap size={32} color="var(--primary)" />
                            <span>EV Charge</span>
                        </div>
                        <p className="footer-desc">Building the future of sustainable transportation in Southeast Asia since 2024.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Platform</h4>
                        <ul>
                            <li><Link to="/user/search">Search Map</Link></li>
                            <li><Link to="/stations">Station List</Link></li>
                            <li><Link to="/pricing">Pricing Plans</Link></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">Partners</a></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Contact Us</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 EV Charge Network. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
