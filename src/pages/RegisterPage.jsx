import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const RegisterPage = () => {
    const [role, setRole] = useState('user');
    const navigate = useNavigate();

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="title text-center">Create Account</h2>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    // Mock registration logic
                    navigate('/user/search');
                }}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" placeholder="John Doe" required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="name@example.com" required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn-primary w-100" style={{ marginBottom: '16px' }}>Sign Up</button>

                    <p className="text-center" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
