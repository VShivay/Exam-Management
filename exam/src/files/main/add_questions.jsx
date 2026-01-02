import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Save, 
  HelpCircle, 
  CheckCircle, 
  BarChart, 
  Tag 
} from 'lucide-react';
import './css/add_questions.css';

const AddQuestions = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  const [domains, setDomains] = useState([]);
  const [formData, setFormData] = useState({
    domain_id: '',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    difficulty_level: 'Medium'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    fetchDomains();
  }, [API_URL]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/questions/add`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Question added successfully!');
      navigate('/manage-questions');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aq-page-wrapper">
      <div className="aq-header">
        <button onClick={() => navigate(-1)} className="aq-back-btn">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h2>Create New MCQ</h2>
      </div>

      <form className="aq-form-card" onSubmit={handleSubmit}>
        <div className="aq-section-title">
          <HelpCircle size={18} /> <span>Question Details</span>
        </div>
        
        <div className="aq-row">
          <div className="aq-group full">
            <label>Question Statement</label>
            <textarea 
              name="question_text" 
              placeholder="Enter your question here..."
              value={formData.question_text}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="aq-grid-options">
          {['a', 'b', 'c', 'd'].map((opt) => (
            <div key={opt} className="aq-group">
              <label>Option {opt.toUpperCase()}</label>
              <input 
                type="text" 
                name={`option_${opt}`}
                value={formData[`option_${opt}`]}
                onChange={handleChange}
                placeholder={`Choice ${opt.toUpperCase()}`}
                required
              />
            </div>
          ))}
        </div>

        <div className="aq-section-title">
          <Tag size={18} /> <span>Classification & Answer</span>
        </div>

        <div className="aq-row three-col">
          <div className="aq-group">
            <label><Tag size={14} className="aq-label-icon" /> Domain</label>
            <select name="domain_id" value={formData.domain_id} onChange={handleChange} required>
              <option value="">Select Domain</option>
              {domains.map(d => (
                <option key={d.domain_id} value={d.domain_id}>{d.domain_name}</option>
              ))}
            </select>
          </div>

          <div className="aq-group">
            <label><CheckCircle size={14} className="aq-label-icon" /> Correct Option</label>
            <select name="correct_option" value={formData.correct_option} onChange={handleChange}>
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>
          </div>

          <div className="aq-group">
  <label><BarChart size={14} className="aq-label-icon" /> Difficulty</label>
  <select name="difficulty_level" value={formData.difficulty_level} onChange={handleChange}>
    <option value="Easy">Easy</option>
    <option value="Medium">Medium</option>
    <option value="Hard">Hard</option>
    <option value="Expert">Expert</option> {/* Added this line */}
  </select>
</div>
        </div>

        <div className="aq-footer">
          <button type="submit" className="aq-submit-btn" disabled={loading}>
            {loading ? 'Saving...' : <><Save size={18} /> Save Question</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddQuestions;