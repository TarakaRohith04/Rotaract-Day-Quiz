import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Send, ChevronRight, AlertCircle } from 'lucide-react';
import { quizData } from '../data/quizData';
import Header from './Header';
import Footer from './Footer';

const QuizEngine = ({ userData, onFinish, onHome }) => {
  const [level, setLevel] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [scoreHistory, setScoreHistory] = useState({ 1: 0, 2: 0, 3: 0 });
  const [detailedSummary, setDetailedSummary] = useState([]); // [{ question, options, correct, chosen, status }]

  const getLevelConfig = (lvl) => {
    switch (lvl) {
      case 1: return { count: 7, time: 300, passScore: 5, pool: quizData.level1 };
      case 2: return { count: 10, time: 360, passScore: 8, pool: quizData.level2 };
      case 3: return { count: 15, time: 480, passScore: 0, pool: quizData.level3 };
      default: return null;
    }
  };

  const handleSubmit = useCallback((e, isFlagged = false) => {
    if (e) e.preventDefault();

    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) correctCount++;
    });

    // Weighted Scoring
    let weightedScore = 0;
    if (level === 1) weightedScore = parseFloat((correctCount * 1.42857).toFixed(2));
    else if (level === 2) weightedScore = correctCount * 1.5;
    else if (level === 3) weightedScore = correctCount * 2;

    // Capture details for this level
    const currentLevelDetails = questions.map(q => ({
      question: q.question,
      options: q.options,
      correct: q.correct,
      chosen: answers[q.id] !== undefined ? answers[q.id] : -1, // -1 if not answered
      status: answers[q.id] === q.correct ? 'correct' : 'incorrect',
      level: level
    }));

    const updatedDetailedSummary = [...detailedSummary, ...currentLevelDetails];
    setDetailedSummary(updatedDetailedSummary);

    const config = getLevelConfig(level);
    const newHistory = { ...scoreHistory, [level]: weightedScore };
    setScoreHistory(newHistory);

    // If flagged for cheating, finish immediately without progressing
    if (isFlagged) {
      onFinish({
        scores: newHistory,
        passed: false,
        finalLevelReached: level,
        isFlagged: true,
        detailedResults: updatedDetailedSummary
      });
      return;
    }

    // Progression logic still uses the raw count for 'passScore' check
    if (level < 3 && correctCount >= config.passScore) {
      setLevel(level + 1);
    } else {
      onFinish({
        scores: newHistory,
        passed: level === 3 && correctCount >= config.passScore ? true : false,
        finalLevelReached: level,
        isFlagged: false,
        detailedResults: updatedDetailedSummary
      });
    }
  }, [answers, level, questions, scoreHistory, onFinish, detailedSummary]);

  const handleAutoSubmit = useCallback((isFlagged = false) => {
    handleSubmit(null, isFlagged);
  }, [handleSubmit]);

  const startLevel = useCallback((lvl) => {
    const config = getLevelConfig(lvl);
    const shuffled = [...config.pool].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, config.count));
    setTimeLeft(config.time);
    setAnswers({});
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    startLevel(level);
  }, [level, startLevel]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isFinished) {
        handleAutoSubmit(true);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'S')) || 
          (e.metaKey && e.shiftKey && e.key === 'S') ||
          (e.ctrlKey && e.key === 'u')) {
        handleAutoSubmit(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFinished, handleAutoSubmit]);

  useEffect(() => {
    if (timeLeft === null || isFinished) return;

    if (timeLeft <= 0) {
      handleAutoSubmit(false);
      return;
    }

    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, handleAutoSubmit]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="quiz-container">
      <Header onHome={onHome} />

      <main className="quiz-main">
        <div className="quiz-top-bar">
          <h2 className="quiz-name">Abhyasam Quiz</h2>
          <div className={`timer-pill ${timeLeft !== null && timeLeft < 30 ? 'timer-warning' : ''}`}>
            <Clock size={16} />
            <span className="time-text">{timeLeft !== null ? formatTime(timeLeft) : '--:--'}</span>
          </div>
        </div>

        <div className="anti-cheat-warning">
          <AlertCircle size={14} />
          <span>Anti-cheating active: Any unauthorized action (tab switch, etc.) will result in silent submission.</span>
        </div>

        <form onSubmit={handleSubmit} className="questions-list">
          {questions.map((q, idx) => (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="question-card"
            >
              <p className="question-text">
                <span className="q-number">{idx + 1}.</span> {q.question}
              </p>
              <div className="options-container">
                {q.options.map((opt, oIdx) => (
                  <label key={oIdx} className="option-label">
                    <input 
                      type="radio" 
                      name={`q-${q.id}`} 
                      className="radio-input"
                      checked={answers[q.id] === oIdx}
                      onChange={() => setAnswers({ ...answers, [q.id]: oIdx })}
                    />
                    <span className="radio-custom"></span>
                    <span className="option-text">{opt}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          ))}

          <div className="quiz-nav">
            <div className="page-indicator">
              Page {level} of 3
            </div>
            <button type="submit" className="btn-next">
              {level === 3 ? 'Finish Quiz' : 'Next Level'}
            </button>
          </div>
        </form>
      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{
        __html: `
        .quiz-container {
          min-height: 100vh;
          background-color: var(--bg-light);
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
          color: #333;
        }

        .quiz-main {
          flex-grow: 1;
          max-width: 800px;
          width: 100%;
          margin: 0 auto;
          padding: 24px 20px 80px 20px;
        }

        .quiz-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .quiz-name {
          font-size: 20px;
          font-weight: 700;
          color: #1a202c;
        }

        .timer-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #d1fae5;
          color: #065f46;
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 14px;
          border: 1px solid #a7f3d0;
        }

        .timer-warning {
          background-color: #fee2e2;
          color: #991b1b;
          border-color: #fecaca;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }

        .anti-cheat-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #fffbeb;
          color: #92400e;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 16px;
          border: 1px solid #fef3c7;
        }

        .quiz-container {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .question-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .question-text {
          font-size: 15px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 20px;
        }

        .q-number { color: #015396; margin-right: 4px; }

        .options-container {
          display: flex;
          flex-direction: column;
        }

        .option-label {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          cursor: pointer;
          border-bottom: 1px solid #f7fafc;
          transition: background 0.2s;
        }

        .option-label:last-child { border-bottom: none; }
        .option-label:hover { background-color: #f8fafc; }

        .radio-input { display: none; }

        .radio-custom {
          width: 18px;
          height: 18px;
          border: 2px solid #cbd5e0;
          border-radius: 50%;
          position: relative;
          flex-shrink: 0;
        }

        .radio-input:checked + .radio-custom {
          border-color: #015396;
        }

        .radio-input:checked + .radio-custom::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          background-color: #015396;
          border-radius: 50%;
        }

        .option-text {
          font-size: 14px;
          color: #4a5568;
        }

        .quiz-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .page-indicator {
          font-size: 13px;
          color: #718096;
          font-weight: 500;
        }

        .btn-next {
          background-color: #015396;
          color: white;
          padding: 10px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-next:hover {
          background-color: #00447a;
        }

        .footer {
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          background: white;
        }

        .footer-text { font-size: 10px; color: #718096; margin-bottom: 4px; }
        .footer-links { display: flex; justify-content: center; gap: 8px; font-size: 11px; }
        .contact-link { color: #015396; text-decoration: none; font-weight: 600; }
        .separator { color: #cbd5e0; }

        @media (max-width: 640px) {
          .header { padding: 10px 20px; }
          .quiz-main { padding: 16px 10px 100px 10px; }
          .question-card { padding: 16px; }
        }
      `}} />
    </div>
  );
};

export default QuizEngine;
