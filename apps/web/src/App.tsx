import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Activity, Users, Settings, ShieldCheck, LogOut } from 'lucide-react';
import { LoginPage } from './features/auth/LoginPage.js';
import { PatientsPage } from './features/patients/PatientsPage.js';
import { SettingsPage } from './features/settings/SettingsPage.js';
import { AuditPage } from './features/audit/AuditPage.js';
import { useAuthStore } from './stores/authStore.js';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-teal-600 rounded-lg text-white">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm leading-tight">Apex Diagnostic</h1>
            <p className="text-[11px] text-teal-600 font-semibold uppercase tracking-wider">Clinical Lab</p>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          <Link
            to="/patients"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition"
          >
            <Users className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
            <span>Patients</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Lab Settings</span>
          </Link>
          <Link
            to="/audit"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition"
          >
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Audit Trail</span>
          </Link>
        </nav>

        {/* User Badge & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden pr-2">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.fullName || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate uppercase">
                {user?.roles?.[0] || 'lab_administrator'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/patients"
          element={
            <ProtectedLayout>
              <PatientsPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedLayout>
              <SettingsPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/audit"
          element={
            <ProtectedLayout>
              <AuditPage />
            </ProtectedLayout>
          }
        />
        <Route path="*" element={<Navigate to="/patients" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
