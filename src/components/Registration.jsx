import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';

const Registration = ({ onComplete, onHome }) => {
  const [formData, setFormData] = useState({
    name: '',
    club: '',
    position: '',
    phone: '',
    email: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/check-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: formData.phone }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          alert("A participant has already registered with this mobile number. Only one attempt is allowed.");
          return;
        }
      } else {
        // Fallback to local storage check if backend fails
        const existingResults = JSON.parse(localStorage.getItem('abhyasam_results') || '[]');
        const isAlreadyRegistered = existingResults.some(
          record => record.phone === formData.phone
        );

        if (isAlreadyRegistered) {
          alert("A participant has already registered with this mobile number. Only one attempt is allowed.");
          return;
        }
      }
    } catch (error) {
       console.error("Error checking phone number", error);
       // Fallback to local storage check if backend fails
        const existingResults = JSON.parse(localStorage.getItem('abhyasam_results') || '[]');
        const isAlreadyRegistered = existingResults.some(
          record => record.phone === formData.phone
        );

        if (isAlreadyRegistered) {
          alert("A participant has already registered with this mobile number. Only one attempt is allowed.");
          return;
        }
    }

    onComplete(formData);
  };

  return (
    <div className="registration-container">
      <Header onHome={onHome} />

      {/* Form Content Card */}
      <main className="main-content">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="details-card"
          style={{ maxWidth: '500px' }}
        >
          <div className="card-header">
            <h1 className="form-title">Participant Details</h1>
            <p className="subtitle">Please fill out this form to start the quiz.</p>
          </div>

          <form onSubmit={handleSubmit} className="details-form">
            <div className="form-group">
              <label>Name of the Rotaractor</label>
              <input 
                required
                type="text" 
                placeholder="Rtr. Gurram Taraka Rohith" 
                className="form-input"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Name of the Club</label>
              <input 
                required
                type="text" 
                placeholder="RAC Vijayawada Elite League" 
                className="form-input"
                value={formData.club}
                onChange={e => setFormData({...formData, club: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Position / Designation</label>
              <input 
                required
                type="text" 
                placeholder="Member" 
                className="form-input"
                value={formData.position}
                onChange={e => setFormData({...formData, position: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>WhatsApp Number</label>
              <input 
                required
                type="tel" 
                placeholder="+91 xxxxx xxxxx" 
                className="form-input"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Gmail</label>
              <input 
                required
                type="email" 
                placeholder="tarakarohith7@gmail.com" 
                className="form-input"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <button type="submit" className="btn-enter-quiz">
              Enter Quiz
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

        .card-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .form-title {
          font-size: 28px;
          font-weight: 800;
          color: #1a202c;
          margin-bottom: 8px;
          font-family: 'Outfit', sans-serif;
        }

        .subtitle {
          font-size: 13px;
          color: var(--text-subtle);
        }

        .details-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: #4a5568;
        }

        .form-input {
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          color: #2d3748;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          background-color: #fff;
        }

        .form-input::placeholder {
          color: #cbd5e0;
        }

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

        .btn-enter-quiz:hover {
          background-color: #00447a;
        }

        @media (max-width: 640px) {
          .details-card {
            padding: 24px;
          }
        }
      `}} />
    </div>
  );
};

export default Registration;

