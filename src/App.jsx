import { useState, useEffect } from 'react'
import Landing from './components/Landing'
import Registration from './components/Registration'
import QuizEngine from './components/QuizEngine'
import ThankYou from './components/ThankYou'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
// Removed redundant import: import './index.css' (already in main.jsx)

function App() {
  const [view, setView] = useState('landing') // landing, registration, quiz, thank-you, admin-login, admin-dashboard
  const [userData, setUserData] = useState(null)
  const [results, setResults] = useState(null)

  useEffect(() => {
    // Global Anti-Cheating Measures
    const handleContextMenu = (e) => e.preventDefault();
    const handleCopy = (e) => e.preventDefault();
    
    const handleKeyDown = (e) => {
      // Disable Developer Tools: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
        e.preventDefault();
      }

      // Disable View Source: Ctrl+U
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
      }

      // Disable Screenshot keys: PrintScreen, Win+Shift+S (Meta+Shift+S)
      if (e.key === 'PrintScreen' || (e.ctrlKey && e.shiftKey && e.key === 'S') || (e.metaKey && e.shiftKey && e.key === 'S')) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('cut', handleCopy);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('cut', handleCopy);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleStartQuiz = () => setView('registration')
  
  const handleRegister = (data) => {
    setUserData(data)
    setView('quiz')
  }

  const handleQuizFinish = async (data) => {
    setResults(data)
    
    const newRecord = {
      ...userData,
      ...data,
      isFlagged: data.isFlagged || false,
      timestamp: new Date().toISOString()
    }

    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecord),
      });

      if (!response.ok) {
        console.error('Failed to save result to backend');
        // Fallback to localStorage just in case
        const allResults = JSON.parse(localStorage.getItem('abhyasam_results') || '[]')
        allResults.push(newRecord)
        localStorage.setItem('abhyasam_results', JSON.stringify(allResults))
      }
    } catch (error) {
      console.error('Error saving result:', error);
       // Fallback to localStorage just in case
        const allResults = JSON.parse(localStorage.getItem('abhyasam_results') || '[]')
        allResults.push(newRecord)
        localStorage.setItem('abhyasam_results', JSON.stringify(allResults))
    }
    
    setView('thank-you')
  }

  const resetToHome = () => setView('landing');

  return (
    <div className="app-container">
      {view === 'landing' && <Landing onStart={handleStartQuiz} onAdmin={() => setView('admin-login')} onHome={resetToHome} />}
      {view === 'registration' && <Registration onComplete={handleRegister} onHome={resetToHome} />}
      {view === 'quiz' && <QuizEngine userData={userData} onFinish={handleQuizFinish} onHome={resetToHome} />}
      {view === 'thank-you' && <ThankYou results={results} userData={userData} onHome={resetToHome} />}
      {view === 'admin-login' && <AdminLogin onLogin={() => setView('admin-dashboard')} onBack={resetToHome} onHome={resetToHome} />}
      {view === 'admin-dashboard' && <AdminDashboard onBack={resetToHome} onHome={resetToHome} />}
    </div>
  )
}


export default App
