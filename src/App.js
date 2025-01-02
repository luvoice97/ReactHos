import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // BrowserRouter 임포트
import AdminPage from './AdminPage';
import CallPage from './CallPage';

function App() {
  return (
    <Router> {/* BrowserRouter로 래핑 */}
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/callpage" element={<CallPage />} />
      </Routes>
    </Router>
  );
}

export default App;
