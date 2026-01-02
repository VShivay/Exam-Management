import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Settings, 
    LogOut, 
    Bell, 
    ShieldCheck, 
    Menu
} from 'lucide-react';
import './dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="dashboard-layout">
            {/* SIDEBAR */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <ShieldCheck size={24} className="brand-icon" />
                    <span>CORE<strong>ADMIN</strong></span>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-group-label">Main Menu</div>
                    
                    <NavLink 
                        to="dashboard-home" 
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink 
                        to="manage-candidates" 
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                    >
                        <Users size={20} />
                        <span>Manage Candidates</span>
                    </NavLink>
                    <NavLink 
                        to="manage-questions" 
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                    >
                        <Users size={20} />
                        <span>Manage Questions</span>
                    </NavLink>
                    <NavLink 
                        to="manage-exam-results" 
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                    >
                        <Users size={20} />
                        <span>Manage Exam Results</span>
                    </NavLink>

                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-button">
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="main-viewport">
                <header className="top-navbar">
                    <div className="header-left">
                        <button className="mobile-toggle">
                            <Menu size={20} />
                        </button>
                        <h2 className="page-title">Admin Console</h2>
                    </div>

                    <div className="header-right">
                        <button className="icon-btn">
                            <Bell size={20} />
                            <span className="notification-dot"></span>
                        </button>
                        <div className="user-profile-pill">
                            <div className="avatar-small">A</div>
                            <div className="user-info-text">
                                <span className="user-name">Administrator</span>
                                <span className="user-status">Online</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="scrollable-content">
                    {/* Child components (DashboardHome, ManageCandidates, etc.) render here */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;