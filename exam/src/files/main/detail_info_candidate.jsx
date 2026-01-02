import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, GraduationCap, Trophy, MapPin, Phone,UserCheck } from 'lucide-react';
import './css/detail_info_candidate.css';

const CandidateDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/candidates/profile/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        };
        fetchDetail();
    }, [id]);

    if (!data) return <div className="loader">Loading Profile...</div>;

    const { profile, academics, exam_history } = data;

    return (
        <div className="detail-page">
            <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18}/> Back</button>
            
            <div className="profile-grid">
                <div className="info-card personal">
                    <div className="card-header"><UserCheck size={20}/> Personal Info</div>
                    <div className="info-row"><span>Name:</span> <strong>{profile.first_name} {profile.last_name}</strong></div>
                    <div className="info-row"><span>Email:</span> <strong>{profile.email}</strong></div>
                    <div className="info-row"><span><Phone size={14}/> Phone:</span> <strong>{profile.phone_number}</strong></div>
                    <div className="info-row"><span><MapPin size={14}/> City:</span> <strong>{profile.city}</strong></div>
                </div>

                <div className="info-card academic">
                    <div className="card-header"><GraduationCap size={20}/> Academic History</div>
                    {academics.map(edu => (
                        <div key={edu.history_id} className="edu-item">
                            <strong>{edu.exam_name}</strong>
                            <p>{edu.board_or_university} ({edu.passing_year}) - {edu.percentage_or_cgpa}%</p>
                        </div>
                    ))}
                </div>

                <div className="info-card exams">
                    <div className="card-header"><Trophy size={20}/> Exam Results</div>
                    {exam_history.length > 0 ? exam_history.map(exam => (
                        <div key={exam.result_id} className="exam-item">
                            <div className={`status-dot ${exam.status}`}></div>
                            <div>
                                <strong>{exam.domain_name}</strong>
                                <p>Score: {exam.score_obtained}% | {exam.status}</p>
                            </div>
                        </div>
                    )) : <p>No exams taken yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default CandidateDetail;