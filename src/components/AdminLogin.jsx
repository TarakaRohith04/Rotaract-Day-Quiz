import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';

const AdminLogin = ({ onLogin, onBack, onHome }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'rotaract3020') { 
      onLogin();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="registration-container">
      <Header onHome={onHome} />

      {/* Login Card */}
      <main className="main-content">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="details-card"
          style={{ maxWidth: '450px' }}
        >
          <div className="card-header">
            <h1 className="form-title">Admin Portal Login</h1>
            <p className="subtitle">Please enter the administrative password to access the results dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="details-form">
            <div className="form-group">
              <label>Password</label>
              <input 
                required
                type="password" 
                placeholder="Enter password..." 
                className={`form-input ${error ? 'border-red-500' : ''}`}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError('');
                }}
                autoFocus
              />
              {error && <p className="error-text" style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
            </div>

            <button type="submit" className="btn-enter-quiz">
              Login
            </button>
            <button 
              type="button" 
              onClick={onBack}
              className="back-link"
              style={{ 
                marginTop: '12px', 
                background: 'none', 
                border: 'none', 
                color: 'var(--text-subtle)', 
                fontSize: '13px', 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Back to Home
            </button>
          </form>
        </motion.div>
      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        .registration-container {
          min-height: 100vh;
          background-color: var(--bg-light);
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
          color: #333;
        }

        .card-header { text-align: center; margin-bottom: 32px; }
        .form-title { font-size: 28px; font-weight: 800; color: #1a202c; margin-bottom: 8px; font-family: 'Outfit', sans-serif; }
        .subtitle { font-size: 13px; color: var(--text-subtle); line-height: 1.5; }

        .details-form { display: flex; flex-direction: column; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 12px; font-weight: 600; color: #4a5568; }

        .form-input {
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          color: #2d3748;
          transition: all 0.2s;
        }

        .form-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(1, 83, 150, 0.1); }
        .border-red-500 { border-color: #e53e3e; }

        .btn-enter-quiz {
          margin-top: 12px;
          background-color: var(--primary);
          color: white;
          padding: 14px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-enter-quiz:hover { background-color: #00447a; }
      `}} />
    </div>
  );
};

export default AdminLogin;

