import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { LangProvider } from './contexts/LangContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import Sidebar from './components/Sidebar/Sidebar';
import MobileNav from './components/Sidebar/MobileNav';
import Header from './components/shared/Header';
import Landing from './pages/Landing';
import PanchayatSelection from './pages/PanchayatSelection';
import Dashboard from './pages/Dashboard';
import Baseline from './pages/Baseline';
import Methodology from './pages/Methodology';
import Viability from './pages/Viability';
import Aggregation from './pages/Aggregation';
import CCTSReadiness from './pages/CCTSReadiness';
import DecisionPack from './pages/DecisionPack';
import DataSources from './pages/DataSources';
import About from './pages/About';
import UserManual from './pages/UserManual';
import Assumptions from './pages/Assumptions';

// Guards any route that requires a selected village — refresh with no state,
// or a direct link, sends the visitor to /select instead of rendering a blank
// or crashing dashboard.
function RequireVillage({ children }: { children: ReactNode }) {
  const { panchayat } = useApp();
  if (!panchayat) return <Navigate to="/select" replace />;
  return <>{children}</>;
}

function AppLayout() {
  const location = useLocation();
  const { sidebarOpen } = useApp();
  const isLanding = location.pathname === '/';
  const isSelect = location.pathname === '/select';

  if (isLanding || isSelect) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/select" element={<PanchayatSelection />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className={`transition-all duration-200 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <Header />
        <main className="p-4 lg:p-6 max-w-7xl mx-auto pb-20 lg:pb-6">
          <Routes>
            <Route path="/dashboard" element={<RequireVillage><Dashboard /></RequireVillage>} />
            <Route path="/baseline" element={<RequireVillage><Baseline /></RequireVillage>} />
            <Route path="/methodology" element={<RequireVillage><Methodology /></RequireVillage>} />
            <Route path="/viability" element={<RequireVillage><Viability /></RequireVillage>} />
            <Route path="/aggregation" element={<RequireVillage><Aggregation /></RequireVillage>} />
            <Route path="/readiness" element={<RequireVillage><CCTSReadiness /></RequireVillage>} />
            <Route path="/decision" element={<RequireVillage><DecisionPack /></RequireVillage>} />
            <Route path="/assumptions" element={<Assumptions />} />
            <Route path="/data-sources" element={<DataSources />} />
            <Route path="/about" element={<About />} />
            <Route path="/manual" element={<UserManual />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LangProvider>
          <AppProvider>
            <AppLayout />
          </AppProvider>
        </LangProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
