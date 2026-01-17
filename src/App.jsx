import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import StationDashboard from './pages/StationDashboard';
import OperatorPortal from './pages/OperatorPortal';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/user/*" element={<UserDashboard />} />
          <Route path="/station/*" element={<StationDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/operator/*" element={<OperatorPortal />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
