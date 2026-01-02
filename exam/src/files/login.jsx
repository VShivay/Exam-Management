import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import './login.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Prevent logged-in users from seeing the login page
    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/admin/dashboard-home');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/admin/login`, formData);
            
            // Store token
            localStorage.setItem('token', res.data.token);
            
            // IMPORTANT: Redirect to the new nested route structure
            navigate('/admin/dashboard-home'); 
        } catch (err) {
            alert(err.response?.data?.error || 'Authentication Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-glass-card">
                <div className="login-header">
                    <div className="login-logo-circle">
                        <ShieldCheck size={32} />
                    </div>
                    <h2>Admin Access</h2>
                    <p>Secure Enterprise Login</p>
                </div>
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-input-wrapper">
                        <Mail size={18} className="input-icon" />
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            required 
                            autoComplete="email"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    
                    <div className="login-input-wrapper">
                        <Lock size={18} className="input-icon" />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            required 
                            autoComplete="current-password"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="login-submit-btn">
                        {loading ? (
                            <div className="loader-container">
                                <Loader2 className="spinning-icon" />
                                <span>Authenticating...</span>
                            </div>
                        ) : 'Authorize'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;