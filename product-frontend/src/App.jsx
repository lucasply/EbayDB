import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './HomePage';
import SalesPage from './SalesPage';
import './index.css';
export default function App() {
  return (
    <Router>
      <div className="nav">
        <Link to="/" className="nav-link">Home</Link> | 
        <Link to="/sales" className="nav-link">Sales</Link>
      </div>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sales" element={<SalesPage />} />
      </Routes>
    </Router>
  );
}
