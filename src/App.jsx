import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import LandingPage from './pages/LandingPage/LandingPage';
import Dashboard from './pages/Dashboard/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <footer className="footer glass">
          <div className="container">
            <p>© 2026 Vanya Raksha AI. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;