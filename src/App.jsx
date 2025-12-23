import { useState } from 'react';
import SantaTracker from './components/SantaTracker';
import SantaCall from './components/SantaCall';

function App() {
  const [currentView, setCurrentView] = useState('tracker');

  return (
    <div className="app">
      <header className="app-header">
        <div className="pixel-border">
          <h1 className="title">🎅 SANTA TRACKER 2025 🎄</h1>
        </div>
        <nav className="nav-buttons">
          <button
            className={`pixel-button ${currentView === 'tracker' ? 'active' : ''}`}
            onClick={() => setCurrentView('tracker')}
          >
            📍 TRACK SANTA
          </button>
          <button
            className={`pixel-button ${currentView === 'call' ? 'active' : ''}`}
            onClick={() => setCurrentView('call')}
          >
            📞 CALL SANTA
          </button>
        </nav>
      </header>

      <main className="app-content">
        {currentView === 'tracker' ? <SantaTracker /> : <SantaCall />}
      </main>

      <footer className="app-footer">
        <div className="pixel-text">
          Made with ❤️ for Christmas {new Date().getFullYear()}
        </div>
        <div className="pixel-text" style={{ marginTop: '8px' }}>
          <a
            href="https://buymeacoffee.com/k9ogc6ndy4"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#FFD700', textDecoration: 'none', fontWeight: 'bold' }}
          >
            ☕ Buy Jason a Coffee
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
