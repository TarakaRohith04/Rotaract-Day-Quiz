import React from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';

const Landing = ({ onStart, onAdmin, onHome }) => {
  return (
    <div className="landing-container">
      <Header onHome={onHome} />

      {/* Main Content Card */}
      <main className="main-content">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="welcome-card"
        >
          <div className="card-header">
            <h1 className="welcome-title">Welcome to Project Abhyasam</h1>
            <h2 className="subtitle">A Quiz Competition Platform</h2>
          </div>

          <div className="card-body">
            <p className="description">
              Project Abhyasam is an initiative by the <strong>Rotaract Club of Vijayawada Elite League</strong>. 
              This platform is designed to conduct engaging and competitive quizzes for Rotaractors.
            </p>
            <p className="description">
              Challenge your knowledge, compete with peers, and learn new things across various domains. 
              The quiz consists of multiple-choice questions with a competitive structure. 
              Make sure you have a stable internet connection before starting.
            </p>
          </div>

          <div className="card-actions">
            <button onClick={onStart} className="btn-start">
              Start the Quiz
            </button>
            <button onClick={onAdmin} className="btn-admin-link">
              Admin Portal
            </button>
          </div>
        </motion.div>
      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        .landing-container {
          min-height: 100vh;
          background-color: var(--bg-light);
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
          color: #333;
        }

        .welcome-card {
          background: white;
          padding: 48px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          max-width: 600px;
          width: 100%;
          text-align: center;
        }

        .welcome-title {
          font-size: 36px;
          font-weight: 800;
          color: #1a202c;
          margin: 0 0 12px 0;
          font-family: 'Outfit', sans-serif;
        }

        .subtitle {
          font-size: 22px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 32px;
        }

        .card-body {
          margin-bottom: 40px;
          text-align: left;
        }

        .description {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        .card-actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .btn-start {
          background-color: var(--primary);
          color: white;
          padding: 16px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-start:hover {
          background-color: #00447a;
        }

        .btn-admin-link {
          background: white;
          color: var(--text-muted);
          padding: 14px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-admin-link:hover {
          background-color: #f7fafc;
          border-color: #cbd5e0;
        }

        @media (max-width: 640px) {
          .welcome-card {
            padding: 32px 24px;
          }
          .welcome-title {
            font-size: 28px;
          }
          .subtitle {
            font-size: 18px;
          }
        }
      `}} />
    </div>
  );
};

export default Landing;

