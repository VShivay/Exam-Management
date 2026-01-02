import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Eye, Activity, Award, CheckCircle, 
  XCircle, Clock, Loader2, ArrowRight
} from 'lucide-react';
import './css/manage_exam.css';

const ManageExam = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token'); // Assuming auth
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/exammanage/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle response structure safety
      setResults(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (error) {
      console.error("Error fetching exams", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(item => {
    const matchesSearch = item.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.domain_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="me-container">
      {/* Header Section */}
      <div className="me-header">
        <div className="me-title-group">
          <div className="me-icon-box">
            <Activity size={24} color="#fff" />
          </div>
          <div>
            <h1>Exam Results</h1>
            <p>Manage candidate assessments and scores</p>
          </div>
        </div>
        
        <div className="me-actions">
          <div className="me-search-box">
            <Search size={16} className="me-search-icon" />
            <input 
              type="text" 
              placeholder="Search candidate or domain..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="me-filter-box">
            <Filter size={16} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="me-grid">
        {loading ? (
          <div className="me-loading"><Loader2 className="me-spin" size={32} /></div>
        ) : filteredResults.length > 0 ? (
          filteredResults.map((exam) => (
            <div key={exam.result_id} className="me-card">
              <div className="me-card-top">
                <div className="me-user-info">
                  <div className="me-avatar">
                    {exam.candidate_name ? exam.candidate_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3>{exam.candidate_name || 'Unknown Candidate'}</h3>
                    <span className="me-domain-badge">{exam.domain_name || 'General'}</span>
                  </div>
                </div>
                <div className={`me-status-badge ${exam.status?.toLowerCase()}`}>
                  {exam.status === 'Pass' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {exam.status}
                </div>
              </div>

              <div className="me-card-stats">
                <div className="me-stat">
                  <span className="me-label">Score</span>
                  <span className={`me-value ${exam.status?.toLowerCase()}-text`}>
                    {exam.score_obtained}%
                  </span>
                </div>
                <div className="me-stat">
                  <span className="me-label">Date</span>
                  <span className="me-value date">
                    {new Date(exam.exam_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button 
                className="me-view-btn"
                onClick={() => navigate(`/admin/exam/${exam.result_id}`)}
              >
                View Analysis <ArrowRight size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="me-no-data">
            <Award size={48} className="me-empty-icon" />
            <h3>No Records Found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageExam;