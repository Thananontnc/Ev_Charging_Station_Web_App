import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const LoginPage = () => {
    const [role, setRole] = useState('user'); // user, partner, admin
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // TODO: Implement actual login logic
        if (role === 'user') navigate('/user/search');
        else if (role === 'partner') navigate('/station/dashboard');
        else if (role === 'admin') navigate('/admin/dashboard');
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="title text-center">Welcome Back</h2>

                <div className="role-switcher">
                    <button
                        className={`role-btn ${role === 'user' ? 'active' : ''}`}
                        onClick={() => setRole('user')}
                    >
                        Driver
                    </button>
                    <button
                        className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                        onClick={() => setRole('admin')}
                    >
                        Admin
                    </button>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="name@example.com" required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn-primary w-100" style={{ marginBottom: '16px' }}>Login</button>

                    <p className="text-center" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register as Driver</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
