import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StaffLogin from './pages/StaffLogin';
import StaffDashboard from './pages/StaffDashboard';
import Navbar from './components/Navbar';

import PromoPage from './pages/PromoPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white relative">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="/promo/:id" element={<PromoPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
