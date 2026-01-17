import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    MapPin,
    BatteryCharging,
    ShieldCheck,
    Zap,
    Star,
    ChevronRight,
    Smartphone,
    Leaf,
    Globe,
    CheckCircle2,
    Users
} from 'lucide-react';
import '../styles/LandingPage.css';

const LandingPage = () => {
    // Scroll reveal logic
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container hero-content">
                    <h1 className="hero-title">
                        Charge Into The <br />
                        <span className="text-highlight">Sustainable Future.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Thailand's most advanced EV ecosystem. Real-time availability, autonomous reservations, and hyper-fast charging infrastructure.
                    </p>
                    <div className="hero-actions">
                        <Link to={localStorage.getItem('user') ? "/user/search" : "/login"} className="btn-primary btn-lg">
                            Get Started <ChevronRight size={18} />
                        </Link>
                        <Link to="/register" className="btn-secondary btn-lg">
                            Partner With Us
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Trust Bar */}
            <section className="stats-section container reveal">
                <div className="stat-card">
                    <h2>1,200+</h2>
                    <p>Stations</p>
                </div>
                <div className="stat-card">
                    <h2>50M+</h2>
                    <p>kWh Delivered</p>
                </div>
                <div className="stat-card">
                    <h2>99.9%</h2>
                    <p>Uptime</p>
                </div>
                <div className="stat-card">
                    <h2>24/7</h2>
                    <p>Support</p>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works container">
                <div className="text-center reveal">
                    <h2 className="section-title">Seamless Experience</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                        Designed for the elite EV owner. Three steps to a full battery.
                    </p>
                </div>
                <div className="steps-container">
                    <div className="step-card reveal">
                        <div className="step-number">1</div>
                        <MapPin className="feature-icon" color="var(--primary)" size={32} />
                        <h3>Find & Filter</h3>
                        <p>Locate the perfect station by connector type, speed, and real-time availability.</p>
                    </div>
                    <div className="step-card reveal" style={{ transitionDelay: '0.2s' }}>
                        <div className="step-number">2</div>
                        <Smartphone className="feature-icon" color="var(--secondary)" size={32} />
                        <h3>One-Tap Reserve</h3>
                        <p>Secure your spot up to 24 hours in advance. No more waiting in queues.</p>
                    </div>
                    <div className="step-card reveal" style={{ transitionDelay: '0.4s' }}>
                        <div className="step-number">3</div>
                        <Zap className="feature-icon" color="#ffb700" size={32} />
                        <h3>Fast Charge</h3>
                        <p>Plug in and pay automatically. Most vehicles reach 80% in under 20 minutes.</p>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section className="impact-section container reveal">
                <Leaf color="var(--secondary)" size={48} style={{ marginBottom: '24px' }} />
                <h2 className="section-title">Our Environmental Impact</h2>
                <div className="impact-grid">
                    <div className="impact-item">
                        <h2>450k</h2>
                        <p>Metric Tons of CO2 Saved</p>
                    </div>
                    <div className="impact-item">
                        <h2>12M+</h2>
                        <p>Clean Miles Driven</p>
                    </div>
                    <div className="impact-item">
                        <h2>$8M+</h2>
                        <p>Fuel Costs Saved</p>
                    </div>
                </div>
            </section>

            {/* Features Detail */}
            <section className="features container reveal">
                <div className="feature-card">
                    <Globe className="feature-icon" color="var(--primary)" size={40} />
                    <h3>Global Protocol</h3>
                    <p>Adhering to international safety and connectivity standards for universal compatibility.</p>
                </div>
                <div className="feature-card">
                    <ShieldCheck className="feature-icon" color="var(--secondary)" size={40} />
                    <h3>Enterprise Security</h3>
                    <p>Military-grade encryption for all financial transactions and vehicle data.</p>
                </div>
                <div className="feature-card">
                    <Users className="feature-icon" color="#ffb700" size={40} />
                    <h3>Fleet Management</h3>
                    <p>Dedicated tools for logistics and ride-sharing companies to manage their electric fleets.</p>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="pricing-section container reveal">
                <div className="text-center">
                    <h2 className="section-title">Designed for Every Driver</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Choose the plan that fits your lifestyle.</p>
                </div>
                <div className="pricing-grid">
                    <div className="pricing-card">
                        <h4>Essential</h4>
                        <div className="price">Free <span>/mo</span></div>
                        <ul className="pricing-features">
                            <li><CheckCircle2 size={16} color="var(--secondary)" /> Pay-as-you-go charging</li>
                            <li><CheckCircle2 size={16} color="var(--secondary)" /> Basic map features</li>
                            <li><CheckCircle2 size={16} color="var(--secondary)" /> Email support</li>
                        </ul>
                        <button className="btn-secondary w-full" style={{ width: '100%' }}>Select Plan</button>
                    </div>
                    <div className="pricing-card popular">
                        <div className="popular-tag">MOST POPULAR</div>
                        <h4>Performance</h4>
                        <div className="price">$19 <span>/mo</span></div>
                        <ul className="pricing-features">
                            <li><CheckCircle2 size={16} color="var(--secondary)" /> 15% discount on kWh</li>
                            <li><CheckCircle2 size={16} color="var(--secondary)" /> Instant reservations</li>
                            <li><CheckCircle2 size={16} color="var(--secondary)" /> Priority 24/7 support</li>
                        </ul>
                        <button className="btn-primary w-full" style={{ width: '100%' }}>Get Performance</button>
                    </div>
                    <div className="pricing-card">
                        <h4>Enterprise</h4>
                        <div className="price">$99 <span>/mo</span></div>
                        <ul className="pricing-features">
                            <li><CheckCircle2 size={16} color="var(--secondary)" /> Fleet analytics dashboard</li>
                            <li><CheckCircle2 size={16} color="var(--secondary)" /> Bulk kWh pricing</li>
                            <li><CheckCircle2 size={16} color="var(--secondary)" /> Dedicated account manager</li>
                        </ul>
                        <button className="btn-secondary w-full" style={{ width: '100%' }}>Contact Sales</button>
                    </div>
                </div>
            </section>

            {/* Trusted Brands - Infinite Scroll */}
            <section className="trust-section reveal">
                <div className="container">
                    <h3 className="trust-title">PARTNERING WITH THE BEST</h3>
                </div>
                <div className="partners-scroll-container">
                    <div className="partners-scroll">
                        <span className="partner-logo">TESLA</span>
                        <span className="partner-logo">BMW</span>
                        <span className="partner-logo">MERCEDES-BENZ</span>
                        <span className="partner-logo">AUDI</span>
                        <span className="partner-logo">PORSCHE</span>
                        <span className="partner-logo">HYUNDAI</span>
                        <span className="partner-logo">KIA</span>
                        <span className="partner-logo">VOLKSWAGEN</span>
                        <span className="partner-logo">RIVIAN</span>
                        <span className="partner-logo">BYD</span>
                        <span className="partner-logo">PORCHE</span>
                        <span className="partner-logo">NISSAN</span>
                        {/* Duplicate for seamless loop */}
                        <span className="partner-logo">TESLA</span>
                        <span className="partner-logo">BMW</span>
                        <span className="partner-logo">MERCEDES-BENZ</span>
                        <span className="partner-logo">AUDI</span>
                        <span className="partner-logo">PORSCHE</span>
                        <span className="partner-logo">HYUNDAI</span>
                        <span className="partner-logo">KIA</span>
                        <span className="partner-logo">VOLKSWAGEN</span>
                        <span className="partner-logo">RIVIAN</span>
                        <span className="partner-logo">BYD</span>
                        <span className="partner-logo">PORCHE</span>
                        <span className="partner-logo">NISSAN</span>
                    </div>
                </div>
            </section>

            {/* Removed Newsletter Section */}
            <section className="newsletter container reveal" style={{ display: 'none' }}>
                <h2>Stay in the Loop</h2>
                <p style={{ color: 'var(--text-muted)' }}>Get the latest updates on new charging stations and EV news.</p>
                <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                    <input type="email" placeholder="Enter your email" required />
                    <button type="submit" className="btn-primary">Subscribe</button>
                </form>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container footer-content">
                    <div className="footer-main">
                        <div className="footer-logo">
                            <Zap size={32} color="var(--primary)" />
                            <span>EV Charge</span>
                        </div>
                        <p className="footer-desc">Redefining the energy grid. Join the revolution towards a zero-emission future.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Platform</h4>
                        <ul>
                            <li><Link to="/user/search">Search Map</Link></li>
                            <li><Link to="/stations">Station List</Link></li>
                            <li><Link to="/pricing">In-App Wallet</Link></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Resources</h4>
                        <ul>
                            <li><a href="#">Developer API</a></li>
                            <li><a href="#">Station Installation</a></li>
                            <li><a href="#">Sustainability Report</a></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#">Press Kit</a></li>
                            <li><a href="#">Investor Relations</a></li>
                            <li><a href="#">Careers</a></li>
                        </ul>
                    </div>
                </div>
                <div className="container footer-bottom">
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                        <p>&copy; 2026 EV Charge Network. All rights reserved.</p>
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <a href="#" style={{ color: 'white', opacity: 0.5 }}>Twitter</a>
                            <a href="#" style={{ color: 'white', opacity: 0.5 }}>LinkedIn</a>
                            <a href="#" style={{ color: 'white', opacity: 0.5 }}>Instagram</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
