import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, XCircle, AlertCircle, 
  Calendar, User, BookOpen, Clock, Layers 
} from 'lucide-react';
import './css/exam_detail.css';

const ExamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      // Using the exact route provided in instructions
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/exammanage/results/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExam(response.data.result || response.data);
    } catch (error) {
      console.error("Error fetching detail", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="ed-loading">Loading details...</div>;
  if (!exam) return <div className="ed-error">Exam result not found.</div>;

  const isPass = exam.status === 'Pass';

  return (
    <div className="ed-container">
      {/* Top Navigation */}
      <button className="ed-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back to Results
      </button>

      {/* Main Grid Layout */}
      <div className="ed-grid">
        
        {/* Left Column: Result Overview */}
        <div className="ed-card ed-overview-card">
          <div className={`ed-score-circle ${isPass ? 'pass' : 'fail'}`}>
            <div className="ed-score-inner">
              <span className="ed-score-val">{exam.score_obtained}</span>
              <span className="ed-score-unit">%</span>
            </div>
            <svg viewBox="0 0 36 36" className="ed-circular-chart">
              <path className="ed-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path 
                className="ed-circle" 
                strokeDasharray={`${exam.score_obtained}, 100`} 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              />
            </svg>
          </div>
          
          <h2 className={`ed-status-text ${isPass ? 'pass' : 'fail'}`}>
            {isPass ? 'Passed Successfully' : 'Assessment Failed'}
          </h2>
          <p className="ed-status-sub">Candidate {isPass ? 'met' : 'did not meet'} the passing criteria.</p>

          <div className="ed-quick-stats">
            <div className="ed-q-stat">
              <span className="icon correct"><CheckCircle size={18} /></span>
              <div className="text">
                <span className="val">{exam.correct_answers}</span>
                <span className="lbl">Correct</span>
              </div>
            </div>
            <div className="ed-q-stat">
              <span className="icon wrong"><XCircle size={18} /></span>
              <div className="text">
                <span className="val">{exam.wrong_answers}</span>
                <span className="lbl">Wrong</span>
              </div>
            </div>
            <div className="ed-q-stat">
              <span className="icon total"><Layers size={18} /></span>
              <div className="text">
                <span className="val">{exam.total_questions}</span>
                <span className="lbl">Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="ed-details-column">
          {/* Candidate Card */}
          <div className="ed-card ed-info-card">
            <div className="ed-card-header">
              <User size={18} className="ed-head-icon" />
              <h3>Candidate Information</h3>
            </div>
            <div className="ed-info-row">
              <div className="ed-info-item">
                <label>Full Name</label>
                <p>{exam.candidate_name || 'N/A'}</p>
              </div>
              <div className="ed-info-item">
                <label>Email ID</label>
                <p>{exam.candidate_email || 'N/A'}</p>
              </div>
              <div className="ed-info-item">
                <label>Candidate ID</label>
                <p>#{exam.candidate_id}</p>
              </div>
            </div>
          </div>

          {/* Exam Metadata Card */}
          <div className="ed-card ed-info-card">
            <div className="ed-card-header">
              <BookOpen size={18} className="ed-head-icon" />
              <h3>Exam Metadata</h3>
            </div>
            <div className="ed-info-row">
              <div className="ed-info-item">
                <label><Layers size={12} /> Domain</label>
                <p>{exam.domain_name || 'General'}</p>
              </div>
              <div className="ed-info-item">
                <label><Calendar size={12} /> Date Taken</label>
                <p>{new Date(exam.exam_date).toLocaleString()}</p>
              </div>
              <div className="ed-info-item">
                <label><Clock size={12} /> Duration</label>
                <p>{exam.duration ? `${exam.duration} mins` : '30 mins'}</p>
              </div>
            </div>
          </div>

          {/* Alert/Action */}
          {!isPass && (
            <div className="ed-alert">
              <AlertCircle size={20} />
              <div>
                <strong>Recommendation:</strong> Suggest the candidate reviews the {exam.domain_name || 'subject'} material before retaking.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamDetail;