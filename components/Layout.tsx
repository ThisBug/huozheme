import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showBottomNav = true }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="relative min-h-screen w-full max-w-[480px] mx-auto flex flex-col medical-grid overflow-hidden bg-medical-dark border-x border-primary/10">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan"></div>
        <div className="absolute top-1/4 -right-20 size-60 rounded-full bg-primary/5 blur-[100px]"></div>
        <div className="absolute bottom-1/4 -left-20 size-60 rounded-full bg-primary/5 blur-[100px]"></div>
      </div>

      <main className="flex-1 relative z-10 overflow-y-auto pb-24 scrollbar-hide">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <div className="fixed bottom-0 w-full max-w-[480px] z-50 bg-medical-dark/95 backdrop-blur-xl border-t border-primary/20 px-6 py-3 flex justify-between items-center pb-6">
          <button 
            onClick={() => navigate('/')}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') ? 'text-primary' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${isActive('/') ? 'neon-glow' : ''}`}>
              {isActive('/') ? 'ecg_heart' : 'pulse_alert'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest">状态</span>
          </button>

          <button 
            onClick={() => navigate('/manage')}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive('/manage') ? 'text-primary' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${isActive('/manage') ? 'neon-glow' : ''}`}>
              description
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest">管理</span>
          </button>

          <button 
            onClick={() => navigate('/settings')}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive('/settings') ? 'text-primary' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${isActive('/settings') ? 'neon-glow' : ''}`}>
              settings
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest">设置</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Layout;