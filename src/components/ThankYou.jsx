import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import Header from './Header';
import Footer from './Footer';

const ThankYou = ({ results, userData, onHome }) => {
  useEffect(() => {
    // Confetti for everyone who finishes!
    const isFlagged = results?.isFlagged;
    confetti({
      particleCount: isFlagged ? 50 : 150,
      spread: isFlagged ? 40 : 70,
      origin: { y: 0.6 },
      colors: isFlagged ? ['#94a3b8', '#cbd5e1', '#64748b'] : ['#015396', '#D71960', '#F59E0B']
    });
  }, [results]);

  return (
    <div className="thank-you-container">
      <Header onHome={onHome} />

      {/* Thank You Card */}
      <main className="main-content">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="details-card thank-you-card-styles" // Added a new class for specific styles
        >
          <div className="celebration-icon">
            {results?.isFlagged ? '🕵️' : '🎉'}
          </div>
          
          <h1 className="form-title thank-you-title">
            {results?.isFlagged ? 'Submission Received' : 'Thank You!'}
          </h1>
          <h2 className="participant-name">
            {userData?.name || 'Participant'}
          </h2>

          <p className="subtitle thank-you-subtitle">
            {results?.isFlagged ? (
              <>You are <strong>highly knowledgeable</strong> and <strong>over-qualified</strong> for this exam! Your performance has been noted.</>
            ) : (
              <>Your answers have been successfully submitted. We appreciate your participation in the <strong>Project Abhyasam</strong> Quiz by the Rotaract Club of Vijayawada Elite League.</>
            )}
          </p>

          <button onClick={onHome} className="btn-enter-quiz thank-you-btn">
            {results?.isFlagged ? 'Exit' : 'Return to Home'}
          </button>
        </motion.div>
      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        .thank-you-container {
          min-height: 100vh;
          background-color: var(--bg-light);
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
          color: #333;
        }

        .main-content {
          flex-grow: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .details-card {
          background: white;
          padding: 60px 40px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          width: 100%;
        }

        .thank-you-card-styles {
          max-width: 600px;
          text-align: center;
        }

        .celebration-icon { 
          font-size: 48px; 
          margin-bottom: 20px; 
        }

        .form-title { 
          font-size: 28px; 
          font-weight: 800; 
          color: #1a202c; 
          font-family: 'Outfit', sans-serif; 
        }

        .thank-you-title {
          font-size: 36px;
          margin-bottom: 8px;
        }
        
        .participant-name {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 24px;
        }

        .subtitle { 
          font-size: 15px; 
          color: var(--text-muted); 
          line-height: 1.6; 
        }

        .thank-you-subtitle {
          margin-bottom: 32px;
        }

        .btn-enter-quiz {
          background-color: var(--primary);
          color: white;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }

        .thank-you-btn {
          width: auto;
          padding: 12px 32px;
        }

        .btn-enter-quiz:hover { background-color: #00447a; }
      `}} />
    </div>
  );
};

export default ThankYou;
