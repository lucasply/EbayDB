import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './HomePage';
import SalesPage from './SalesPage';
import RecordsPage from './RecordsPage';

import './index.css';

export default function App() {
  return (
    <Router>
      <div className="nav">
        <Link to="/" className="nav-link">Home</Link> |  
        <Link to="/sales" className="nav-link">Sales</Link> |
        <Link to="/records" className="nav-link">Records</Link>
      </div>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/records" element={<RecordsPage />} />
      </Routes>
    </Router>
  );
}
