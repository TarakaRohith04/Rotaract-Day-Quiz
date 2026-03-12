import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Search, Trash2, ArrowLeft, LogOut, ChevronRight, Eye, X, CheckCircle, XCircle } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const AdminDashboard = ({ onBack, onHome }) => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('details'); // details, leaderboard
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/results');
        if (response.ok) {
          const results = await response.json();
          // Sort is already handled by the backend, but we can do it here just in case
          setData(results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        } else {
          console.error('Failed to fetch results from backend');
          // Fallback
          const localResults = JSON.parse(localStorage.getItem('abhyasam_results') || '[]');
          setData(localResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        }
      } catch (error) {
        console.error('Error fetching results:', error);
         // Fallback
        const localResults = JSON.parse(localStorage.getItem('abhyasam_results') || '[]');
        setData(localResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }
    };
    
    fetchResults();
  }, []);

  const getTotalScore = (scores) => {
    return Object.values(scores).reduce((a, b) => a + Number(b), 0);
  };

  const getAverageScore = () => {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, r) => sum + getTotalScore(r.scores), 0);
    return (total / data.length).toFixed(1);
  };

  const deleteRecord = async (id, timestamp) => {
    if (window.confirm('Are you sure you want to delete this participant record?')) {
      // If we have a MongoDB _id, use it, otherwise fallback to timestamp
      if (id) {
         try {
           const response = await fetch(`http://localhost:5000/api/results/${id}`, {
             method: 'DELETE',
           });
           if (response.ok) {
             setData(data.filter(r => r._id !== id));
           } else {
             console.error('Failed to delete record from backend');
           }
         } catch (error) {
           console.error('Error deleting record:', error);
         }
      } else {
        // Fallback for local storage records
        const newData = data.filter(r => r.timestamp !== timestamp);
        localStorage.setItem('abhyasam_results', JSON.stringify(newData));
        setData(newData);
      }
    }
  };

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.club.toLowerCase().includes(search.toLowerCase())
  );

  const leaderboardData = [...data].sort((a, b) => getTotalScore(b.scores) - getTotalScore(a.scores));

  return (
    <div className="admin-page">
      <Header onHome={onHome} />
      
      <main className="admin-content">
        <div className="admin-header-flex">
          <div className="admin-title-section">
            <h1 className="admin-page-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Overview of all quiz participation and results.</p>
          </div>
          <button onClick={onBack} className="logout-btn">
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-value">{data.length}</h3>
            <p className="stat-label">Total Participants</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-value">{getAverageScore()}</h3>
            <p className="stat-label">Average Score</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-value" style={{ color: '#ef4444' }}>{data.filter(r => r.isFlagged).length}</h3>
            <p className="stat-label">Cheated Count</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="tab-controls">
          <button 
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button 
            className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Leaderboard
          </button>
        </div>

        {/* Results Card */}
        <div className="results-card">
          <div className="results-card-header">
            <div className="flex justify-between items-center w-full">
               <h2 className="results-title">{activeTab === 'details' ? 'Participant Results' : 'Leaderboard'}</h2>
               {activeTab === 'details' && (
                 <div className="search-container">
                    <Search size={16} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      className="search-input"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
               )}
            </div>
          </div>
          
          <div className="results-table-container">
            {activeTab === 'details' ? (
              filteredData.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Name</th>
                      <th>Club</th>
                      <th>Position</th>
                      <th>Contact</th>
                      <th>Score (L1, L2, L3)</th>
                      <th>Total</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((record, i) => (
                      <tr key={record.timestamp || i}>
                        <td>
                          <span className={`status-badge ${record.isFlagged ? 'flagged' : 'normal'}`}>
                            {record.isFlagged ? 'Flagged' : 'Normal'}
                          </span>
                        </td>
                        <td className="font-medium">{record.name}</td>
                        <td>{record.club}</td>
                        <td>{record.position}</td>
                        <td>
                          <div className="contact-info">
                            <span>{record.phone}</span>
                            <span className="email-subtext">{record.email}</span>
                          </div>
                        </td>
                        <td>
                          <div className="score-pills">
                            <span className="score-pill l1">{(record.scores[1] || 0).toFixed(1)}</span>
                            <span className="score-pill l2">{(record.scores[2] || 0).toFixed(1)}</span>
                            <span className="score-pill l3">{(record.scores[3] || 0).toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="font-bold text-primary">{getTotalScore(record.scores).toFixed(1)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => setSelectedResult(record)} 
                              className="view-icon-btn"
                              title="View Detailed Results"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => deleteRecord(record._id, record.timestamp)} 
                              className="delete-icon-btn"
                              title="Delete Record"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>No quiz attempts recorded yet.</p>
                </div>
              )
            ) : (
                leaderboardData.length > 0 ? (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Club</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                        <th>Total Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.map((record, i) => (
                        <tr key={record.timestamp || i}>
                          <td className="font-bold">#{i + 1}</td>
                          <td className="font-medium">{record.name}</td>
                          <td>{record.club}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                                onClick={() => setSelectedResult(record)} 
                                className="view-icon-btn"
                                title="View Detailed Results"
                              >
                                <Eye size={16} />
                              </button>
                          </td>
                          <td className="font-bold text-primary">{getTotalScore(record.scores).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <p>No quiz attempts recorded yet.</p>
                  </div>
                )
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Detailed Result Modal */}
      {selectedResult && (
        <div className="modal-overlay" onClick={() => setSelectedResult(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-container" 
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Detailed Quiz Report</h2>
                <p className="modal-participant">{selectedResult.name} ({selectedResult.club})</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedResult(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="results-summary-row">
                 <div className="summary-item">
                    <span className="summary-label">Final Status</span>
                    <span className={`status-badge ${selectedResult.isFlagged ? 'flagged' : 'normal'}`}>
                       {selectedResult.isFlagged ? 'Flagged (Cheating Detected)' : 'Normal Submission'}
                    </span>
                 </div>
                 <div className="summary-item">
                    <span className="summary-label">Total Score</span>
                    <span className="summary-value text-primary">{getTotalScore(selectedResult.scores).toFixed(2)}</span>
                 </div>
              </div>

              <div className="detailed-questions-list">
                <h3 className="section-title">Question Breakdown</h3>
                {selectedResult.detailedResults && selectedResult.detailedResults.length > 0 ? (
                  <div className="questions-grid">
                    {selectedResult.detailedResults.map((item, idx) => (
                      <div key={idx} className={`question-item-card ${item.status}`}>
                        <div className="q-card-header">
                          <span className="q-idx">Q{idx + 1}</span>
                          <span className={`q-status-icon ${item.status}`}>
                            {item.status === 'correct' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {item.status.toUpperCase()}
                          </span>
                          <span className="level-tag">Level {item.level}</span>
                        </div>
                        <p className="q-text">{item.question}</p>
                        <div className="q-answers">
                           <div className="answer-row">
                              <span className="ans-label">Chosen:</span>
                              <span className={`ans-value ${item.status === 'correct' ? 'correct' : 'incorrect'}`}>
                                {item.chosen === -1 ? 'Not Answered' : item.options[item.chosen]}
                              </span>
                           </div>
                           {item.status === 'incorrect' && (
                             <div className="answer-row">
                                <span className="ans-label">Correct:</span>
                                <span className="ans-value correct">{item.options[item.correct]}</span>
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-details">
                    <AlertCircle size={40} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                    <p>Detailed breakdown not available for this legacy record.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-page {
          min-height: 100vh;
          background-color: #f8fafc;
          display: flex;
          flex-direction: column;
        }

        .admin-content {
          flex-grow: 1;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          padding: 40px 20px;
        }

        .admin-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .admin-page-title {
          font-size: 32px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
          font-family: 'Outfit', sans-serif;
        }

        .admin-subtitle {
          color: #64748b;
          margin: 4px 0 0 0;
          font-size: 15px;
        }

        .logout-btn {
          background-color: white;
          border: 1px solid #e2e8f0;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .logout-btn:hover {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #f1f5f9;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 800;
          color: #015396;
          margin: 0 0 4px 0;
        }

        .stat-label {
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .tab-controls {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 10px;
          width: fit-content;
        }

        .tab-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          border: none;
          color: #64748b;
        }

        .tab-btn.active {
          background: white;
          color: #015396;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .results-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .results-card-header {
          padding: 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .w-full { width: 100%; }

        .results-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .search-container {
          position: relative;
          width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          border-color: #015396;
        }

        .results-table-container {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th {
          padding: 16px 24px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          background: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .admin-table td {
          padding: 16px 24px;
          font-size: 14px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }

        .font-medium { font-weight: 600; }
        .font-bold { font-weight: 700; }
        .text-primary { color: #015396; }

        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .status-badge.normal {
          background-color: #dcfce7;
          color: #166534;
        }

        .status-badge.flagged {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
        }

        .email-subtext {
          font-size: 12px;
          color: #94a3b8;
        }

        .score-pills {
          display: flex;
          gap: 6px;
        }

        .score-pill {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
        }

        .score-pill.l1 { background: #fdf2f8; color: #db2777; }
        .score-pill.l2 { background: #fffbeb; color: #d97706; }
        .score-pill.l3 { background: #eff6ff; color: #2563eb; }

        .delete-icon-btn {
          background: none;
          border: none;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s;
          padding: 8px;
          border-radius: 6px;
        }

        .delete-icon-btn:hover {
          color: #ef4444;
          background: #fee2e2;
        }

        .view-icon-btn {
          background: none;
          border: none;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s;
          padding: 8px;
          border-radius: 6px;
        }

        .view-icon-btn:hover {
          color: #015396;
          background: #eff6ff;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-container {
          background: white;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .modal-participant {
          font-size: 13px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
        }

        .results-summary-row {
          display: flex;
          gap: 24px;
          margin-bottom: 32px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-label {
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #94a3b8;
        }

        .summary-value {
          font-size: 24px;
          font-weight: 800;
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .questions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .question-item-card {
          padding: 16px;
          border-radius: 10px;
          border-left: 4px solid #e2e8f0;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-left-width: 4px;
        }

        .question-item-card.correct { border-left-color: #10b981; }
        .question-item-card.incorrect { border-left-color: #ef4444; }

        .q-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .q-idx {
          font-weight: 800;
          color: #64748b;
          font-size: 12px;
        }

        .q-status-icon {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .q-status-icon.correct { background: #dcfce7; color: #166534; }
        .q-status-icon.incorrect { background: #fee2e2; color: #991b1b; }

        .level-tag {
          font-size: 10px;
          color: #94a3b8;
          font-weight: 600;
          margin-left: auto;
        }

        .q-text {
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 12px;
        }

        .q-answers {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .answer-row {
          display: flex;
          gap: 8px;
          font-size: 13px;
        }

        .ans-label { color: #64748b; font-weight: 500; min-width: 60px; }
        .ans-value { font-weight: 600; }
        .ans-value.correct { color: #166534; }
        .ans-value.incorrect { color: #991b1b; }

        .no-details {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr; }
          .admin-header-flex { flex-direction: column; gap: 16px; }
          .logout-btn { width: 100%; }
          .search-container { width: 100%; margin-top: 16px; }
          .results-card-header .flex { flex-direction: column; align-items: flex-start; }
        }
      `}} />
    </div>
  );
};

export default AdminDashboard;
