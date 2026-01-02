import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Filter, Calendar, UserCheck } from 'lucide-react';
import './css/manage_candidate.css';

const ManageCandidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [filters, setFilters] = useState({ name: '', gender: '', date_filter: '' });
    const navigate = useNavigate();

    const fetchCandidates = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/candidates/list`, {
                headers: { Authorization: `Bearer ${token}` },
                params: filters
            });
            setCandidates(res.rows || res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchCandidates(); }, [filters]);

    return (
        <div className="manage-candidates-page">
            <div className="page-header">
                <h2>Candidate Management</h2>
                <div className="filter-bar">
                    <div className="search-box">
                        <Search size={16} />
                        <input type="text" placeholder="Search by name..." onChange={(e) => setFilters({...filters, name: e.target.value})} />
                    </div>
                    <select onChange={(e) => setFilters({...filters, gender: e.target.value})}>
                        <option value="">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    <select onChange={(e) => setFilters({...filters, date_filter: e.target.value})}>
                        <option value="">All Time</option>
                        <option value="today">Joined Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Gender</th>
                            <th>Registration</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.map(c => (
                            <tr key={c.candidate_id}>
                                <td className="name-col">{c.first_name} {c.last_name}</td>
                                <td>{c.email}</td>
                                <td><span className={`gender-tag ${c.gender}`}>{c.gender}</span></td>
                                <td>{new Date(c.registered_at).toLocaleDateString()}</td>
                                <td>
                                    <button className="view-btn" onClick={() => navigate(`/candidate/${c.candidate_id}`)}>
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageCandidates;