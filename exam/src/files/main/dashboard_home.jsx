import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Shield, Mail, Calendar, Activity } from 'lucide-react';
import './css/dashboard_home.css';

const DashboardHome = () => {
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAdmin(res.data);
            } catch (err) { console.error("Failed to fetch admin details"); }
        };
        fetchAdmin();
    }, []);

    if (!admin) return <div className="loading-screen">Loading System Profile...</div>;

    return (
        <div className="dashboard-home">
            <div className="welcome-banner">
                <h1>Welcome Back, {admin.full_name}!</h1>
                <p>System Status: <span className="status-online">● Online</span></p>
            </div>

            <div className="profile-overview-card">
                <div className="profile-header">
                    <div className="avatar-large">{admin.full_name[0]}</div>
                    <div className="profile-titles">
                        <h2>{admin.full_name}</h2>
                        <span className="role-badge">{admin.role}</span>
                    </div>
                </div>

                <div className="profile-details-grid">
                    <div className="detail-item">
                        <Mail size={18} />
                        <div><label>Email Address</label><p>{admin.email}</p></div>
                    </div>
                    <div className="detail-item">
                        <Shield size={18} />
                        <div><label>Access Level</label><p>{admin.role}</p></div>
                    </div>
                    <div className="detail-item">
                        <Activity size={18} />
                        <div><label>Assigned Domain</label><p>{admin.domain_name || 'All Domains (Super)'}</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;