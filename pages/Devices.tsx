import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Devices: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout showBottomNav={false}>
      <div className="flex items-center bg-medical-dark p-4 pb-2 justify-between sticky top-0 z-50 border-b border-primary/10">
        <button onClick={() => navigate('/settings')} className="text-primary hover:text-white flex size-12 shrink-0 items-center justify-center transition-colors cursor-pointer">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] font-display uppercase">终端设备</h2>
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] text-primary uppercase tracking-widest">系统在线</span>
          </div>
        </div>
        <div onClick={() => navigate('/scanning')} className="text-primary flex size-12 shrink-0 items-center justify-end cursor-pointer hover:text-white transition-colors">
          <span className="material-symbols-outlined">sensors</span>
        </div>
      </div>

      {/* Decorative EKG */}
      <div className="w-full h-8 flex items-center overflow-hidden opacity-40">
        <svg className="w-full h-full stroke-primary fill-none stroke-2" viewBox="0 0 1000 100">
          <path d="M0 50 L400 50 L410 40 L420 70 L430 10 L440 90 L450 50 L1000 50"></path>
        </svg>
      </div>

      <div className="px-4 py-2">
        <p className="text-primary/60 text-xs font-bold uppercase tracking-[0.2em]">已连接 (2)</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Device 1 */}
        <div className="flex flex-col items-stretch justify-start rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.1)] bg-medical-panel border border-primary/20 overflow-hidden">
          <div className="w-full h-40 bg-slate-900 relative flex items-center justify-center overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-t from-medical-panel to-transparent z-10"></div>
             <span className="material-symbols-outlined text-8xl text-slate-800 z-0 group-hover:text-primary/20 transition-colors duration-500">watch</span>
          </div>
          <div className="flex w-full flex-col items-stretch justify-center gap-1 py-4 px-4">
            <div className="flex justify-between items-start">
              <p className="text-white text-xl font-bold leading-tight font-display">Apple Watch Series 9</p>
              <span className="material-symbols-outlined text-primary text-sm">watch</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary/70 text-base">sync</span>
                <p className="text-primary/80 text-sm font-normal">上次同步：2分钟前</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary/70 text-base">battery_5_bar</span>
                <p className="text-primary/80 text-sm font-normal">电量：85%</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => alert('正在同步...')} className="flex-1 rounded-lg h-10 px-4 bg-primary text-black text-sm font-bold active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-primary/90">
                <span className="material-symbols-outlined text-sm">refresh</span>
                同步
              </button>
              <button onClick={() => alert('解绑成功 (模拟)')} className="flex-1 rounded-lg h-10 px-4 bg-transparent text-danger hover:bg-danger/10 border border-danger/30 text-xs font-bold uppercase active:scale-95 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">link_off</span>
                解绑
              </button>
            </div>
          </div>
        </div>

         {/* Device 2 */}
         <div className="flex flex-col items-stretch justify-start rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.1)] bg-medical-panel border border-primary/20 overflow-hidden">
          <div className="w-full h-40 bg-slate-900 relative flex items-center justify-center overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-t from-medical-panel to-transparent z-10"></div>
             <span className="material-symbols-outlined text-8xl text-slate-800 z-0 group-hover:text-primary/20 transition-colors duration-500">smartphone</span>
          </div>
          <div className="flex w-full flex-col items-stretch justify-center gap-1 py-4 px-4">
            <div className="flex justify-between items-start">
              <p className="text-white text-xl font-bold leading-tight font-display">iPhone 15 Pro</p>
              <span className="material-symbols-outlined text-primary text-sm">smartphone</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary/70 text-base">sync_saved_locally</span>
                <p className="text-primary/80 text-sm font-normal">上次同步：刚刚</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary/70 text-base">battery_full</span>
                <p className="text-primary/80 text-sm font-normal">电量：92%</p>
              </div>
            </div>
             <div className="flex gap-3 mt-6">
              <button onClick={() => alert('正在同步...')} className="flex-1 rounded-lg h-10 px-4 bg-primary text-black text-sm font-bold active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-primary/90">
                <span className="material-symbols-outlined text-sm">refresh</span>
                同步
              </button>
              <button onClick={() => alert('解绑成功 (模拟)')} className="flex-1 rounded-lg h-10 px-4 bg-transparent text-danger hover:bg-danger/10 border border-danger/30 text-xs font-bold uppercase active:scale-95 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">link_off</span>
                解绑
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 flex justify-center pb-12">
        <button 
            onClick={() => navigate('/scanning')}
            className="flex items-center gap-3 px-8 py-4 border-2 border-dashed border-primary/30 rounded-xl text-primary/70 hover:bg-primary/5 hover:border-primary/50 transition-all w-full justify-center group"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add_circle</span>
          <span className="font-display font-bold uppercase tracking-widest text-sm">扫描新终端</span>
        </button>
      </div>
    </Layout>
  );
};

export default Devices;