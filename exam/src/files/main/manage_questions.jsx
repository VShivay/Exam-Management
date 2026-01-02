import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  PlusCircle, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Layers, 
  CheckCircle2,
  AlertCircle,
  Search
} from 'lucide-react';
import './css/manage_questions.css';

const ManageQuestions = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchDomains();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedDomain, page]);

  const fetchDomains = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/questions/domains`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDomains(res.data);
    } catch (err) {
      console.error("Error fetching domains", err);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/questions`, {
        params: { domain_id: selectedDomain, page, limit: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(res.data.data);
      setTotalPages(Math.ceil(res.data.total / res.data.limit) || 1);
    } catch (err) {
      console.error("Error fetching questions", err);
    } finally {
      setLoading(false);
    }
  };

  // Local filtering for search (client-side for instant feel)
  const filteredQuestions = questions.filter(q => 
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mq-page-wrapper">
      {/* Header Section */}
      <div className="mq-header">
        <div className="mq-title-area">
          <BookOpen className="mq-title-icon" size={24} />
          <h1>Question Management</h1>
        </div>
        <button 
          className="mq-add-btn" 
          onClick={() => navigate('/add-question')}
        >
          <PlusCircle size={18} />
          <span>New Question</span>
        </button>
      </div>

      {/* Toolbar with Filter and Search */}
      <div className="mq-toolbar">
        <div className="mq-search-box">
          <Search size={16} className="mq-search-icon" />
          <input 
            type="text" 
            placeholder="Search questions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mq-input-search"
          />
        </div>

        <div className="mq-filter-box">
          <Filter size={16} className="mq-filter-icon" />
          <select 
            value={selectedDomain} 
            onChange={(e) => { setSelectedDomain(e.target.value); setPage(1); }}
            className="mq-select"
          >
            <option value="">All Domains</option>
            {domains.map(dom => (
              <option key={dom.domain_id} value={dom.domain_id}>{dom.domain_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="mq-content">
        {loading ? (
          <div className="mq-loader">
             <div className="mq-spinner"></div>
             <span>Loading Questions...</span>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="mq-empty">
            <AlertCircle size={40} />
            <p>No questions found.</p>
          </div>
        ) : (
          <div className="mq-grid">
            {filteredQuestions.map((q) => (
              <div key={q.question_id} className="mq-card">
                <div className="mq-card-top">
                  <span className={`mq-badge mq-badge-${q.difficulty_level.toLowerCase()}`}>
                    {q.difficulty_level}
                  </span>
                  <span className="mq-domain-name">
                    <Layers size={12} /> {q.domain_name}
                  </span>
                </div>
                <h3 className="mq-question-text">{q.question_text}</h3>
                <div className="mq-options-list">
                  {['a', 'b', 'c', 'd'].map(opt => {
                    const isCorrect = q.correct_option === opt.toUpperCase();
                    return (
                      <div key={opt} className={`mq-option-item ${isCorrect ? 'mq-correct' : ''}`}>
                        <span className="mq-opt-label">{opt.toUpperCase()}</span>
                        <span className="mq-opt-text">{q[`option_${opt}`]}</span>
                        {isCorrect && <CheckCircle2 size={14} className="mq-check" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Pagination */}
      <div className="mq-pagination">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(p => p - 1)}
          className="mq-page-arrow"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="mq-page-numbers">
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </div>
        <button 
          disabled={page === totalPages} 
          onClick={() => setPage(p => p + 1)}
          className="mq-page-arrow"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default ManageQuestions;