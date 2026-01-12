import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';

const Logs: React.FC = () => {
  const navigate = useNavigate();
  const { logs } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout showBottomNav={false}>
       <header className="sticky top-0 z-50 bg-medical-dark/90 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center p-4 justify-between">
          <button onClick={() => navigate(-1)} className="flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-white/5 rounded-lg transition-colors group">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">arrow_back_ios_new</span>
          </button>
          <h2 className="text-primary text-lg font-bold leading-tight tracking-[0.1em] flex-1 text-center neon-glow">系统日志</h2>
          <div className="flex w-10 items-center justify-end">
            <button 
                onClick={() => setCollapsed(!collapsed)}
                className="flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-white/5 transition-colors group"
            >
              <span className="material-symbols-outlined text-primary opacity-70 group-hover:opacity-100">
                  {collapsed ? 'unfold_more' : 'unfold_less'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-10 animate-fade-in">
        <div className="px-4 py-6 grid grid-cols-2 gap-4">
          <div className="bg-medical-panel border border-primary/20 p-4 rounded-lg neon-border relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-1 opacity-20">
              <span className="material-symbols-outlined text-[40px]">database</span>
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">日志总数</p>
            <p className="text-3xl font-mono font-bold text-primary neon-glow">{logs.length}</p>
          </div>
          <div className="bg-medical-panel border border-primary/20 p-4 rounded-lg neon-border relative overflow-hidden">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">系统状态</p>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(57,255,20,1)] animate-pulse"></div>
              <p className="text-primary font-mono font-bold tracking-tighter neon-glow">服务运行中</p>
            </div>
          </div>
        </div>

        <section>
          <div className="flex items-center px-4 mb-4">
            <div className="h-[1px] w-4 bg-primary opacity-50"></div>
            <h3 className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] px-3 opacity-80">当前时间轴</h3>
            <div className="h-[1px] flex-1 bg-primary/20"></div>
          </div>

          <div className="grid grid-cols-[48px_1fr] gap-x-0 px-4">
            {logs.length === 0 && (
                <div className="col-span-2 text-center text-slate-500 text-xs py-10">暂无日志记录</div>
            )}
            {logs.map((log, index) => (
                <React.Fragment key={log.id}>
                    <div className="flex flex-col items-center gap-0">
                        {index !== 0 && <div className="w-[1px] bg-primary/20 h-4"></div>}
                        <div className={`z-10 bg-medical-dark border ${log.type === 'alert' ? 'border-danger' : log.type === 'success' ? 'border-primary' : 'border-slate-600'} p-1 rounded-sm shadow-[0_0_10px_rgba(57,255,20,0.1)]`}>
                            <span className={`material-symbols-outlined ${log.type === 'alert' ? 'text-danger' : log.type === 'success' ? 'text-primary' : 'text-slate-500'} text-[18px] block`}>
                                {log.type === 'success' ? 'check_circle' : log.type === 'alert' ? 'warning' : 'description'}
                            </span>
                        </div>
                        <div className="w-[1px] bg-primary/20 grow mt-1"></div>
                    </div>
                    <div className="flex flex-1 flex-col pb-4 pt-0.5">
                        <div className="flex justify-between items-start">
                            <p className="text-white text-base font-bold leading-none mb-2 tracking-tight">{log.title}</p>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border ${log.type === 'alert' ? 'border-danger text-danger' : 'border-primary text-primary'} font-mono uppercase`}>{log.type}</span>
                        </div>
                        <p className="text-primary/60 font-mono text-[11px] mb-2 tracking-wider">{new Date(log.timestamp).toLocaleString()}</p>
                        
                        {!collapsed && (
                            <div className="bg-medical-panel p-3 rounded-lg border border-primary/20 text-sm text-slate-400 font-light leading-relaxed animate-fade-in">
                                {log.description}
                            </div>
                        )}
                    </div>
                </React.Fragment>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Logs;