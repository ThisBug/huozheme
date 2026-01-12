import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';

const Devices: React.FC = () => {
  const navigate = useNavigate();
  const { devices, removeDevice, syncDevice } = useApp();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{show: boolean, id: string | null, name: string | null}>({
    show: false, id: null, name: null
  });

  const handleSync = (id: string) => {
      setSyncingId(id);
      setTimeout(() => {
          syncDevice(id);
          setSyncingId(null);
      }, 1500);
  };

  const initiateRemove = (id: string, name: string) => {
      setConfirmModal({ show: true, id, name });
  };

  const confirmRemove = () => {
      if (confirmModal.id && confirmModal.name) {
          removeDevice(confirmModal.id);
          setToastMsg(`${confirmModal.name} 已成功解绑`);
          setTimeout(() => setToastMsg(null), 2000);
      }
      setConfirmModal({ show: false, id: null, name: null });
  };

  return (
    <Layout showBottomNav={false}>
      {/* Toast Feedback */}
      {toastMsg && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none">
              <div className="bg-medical-dark/90 backdrop-blur-md border border-primary/50 text-white px-8 py-6 rounded-2xl shadow-[0_0_30px_rgba(57,255,20,0.3)] flex flex-col items-center gap-3 pointer-events-auto">
                  <span className="material-symbols-outlined text-4xl text-primary neon-glow">link_off</span>
                  <span className="text-lg font-bold tracking-wider">{toastMsg}</span>
              </div>
          </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
             <div className="w-full max-w-sm bg-medical-panel border border-danger/50 rounded-lg p-6 shadow-[0_0_30px_rgba(255,49,49,0.15)]">
                  <div className="flex items-center gap-3 mb-4 text-danger">
                      <span className="material-symbols-outlined text-3xl">warning</span>
                      <h3 className="text-xl font-bold text-white">确认解绑</h3>
                  </div>
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                      您确定要解除与 <strong className="text-white">{confirmModal.name}</strong> 的绑定吗？<br/>
                      解绑后将无法获取该设备的实时健康数据。
                  </p>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setConfirmModal({ show: false, id: null, name: null })}
                        className="flex-1 py-3 border border-white/10 rounded-lg font-bold text-slate-300 hover:bg-white/5 transition-colors"
                      >
                          取消
                      </button>
                      <button 
                        onClick={confirmRemove}
                        className="flex-1 py-3 bg-danger/10 border border-danger/50 text-danger rounded-lg font-bold hover:bg-danger/20 transition-colors shadow-[0_0_15px_rgba(255,49,49,0.2)]"
                      >
                          确认解绑
                      </button>
                  </div>
             </div>
        </div>
      )}

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
        <p className="text-primary/60 text-xs font-bold uppercase tracking-[0.2em]">已连接 ({devices.length})</p>
      </div>

      <div className="p-4 space-y-6">
        {devices.length === 0 && (
             <div className="text-center py-10 text-slate-500">暂无连接设备</div>
        )}

        {devices.map((device) => (
            <div key={device.id} className="flex flex-col items-stretch justify-start rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.1)] bg-medical-panel border border-primary/20 overflow-hidden">
                <div className="w-full h-40 bg-slate-900 relative flex items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-medical-panel to-transparent z-10"></div>
                    <span className="material-symbols-outlined text-8xl text-slate-800 z-0 group-hover:text-primary/20 transition-colors duration-500">
                        {device.type === 'watch' ? 'watch' : 'smartphone'}
                    </span>
                </div>
                <div className="flex w-full flex-col items-stretch justify-center gap-1 py-4 px-4">
                    <div className="flex justify-between items-start">
                    <p className="text-white text-xl font-bold leading-tight font-display">{device.name}</p>
                    <span className="material-symbols-outlined text-primary text-sm">{device.type === 'watch' ? 'watch' : 'smartphone'}</span>
                    </div>
                    <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-base ${syncingId === device.id ? 'text-primary animate-spin' : 'text-primary/70'}`}>sync</span>
                        <p className="text-primary/80 text-sm font-normal">上次同步：{new Date(device.lastSync).toLocaleTimeString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary/70 text-base">battery_5_bar</span>
                        <p className="text-primary/80 text-sm font-normal">电量：{device.battery}%</p>
                    </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                    <button 
                        onClick={() => handleSync(device.id)} 
                        disabled={syncingId === device.id}
                        className="flex-1 rounded-lg h-10 px-4 bg-primary text-black text-sm font-bold active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm">{syncingId === device.id ? 'hourglass_empty' : 'refresh'}</span>
                        {syncingId === device.id ? '同步中...' : '同步'}
                    </button>
                    <button 
                        onClick={() => initiateRemove(device.id, device.name)}
                        className="flex-1 rounded-lg h-10 px-4 bg-transparent text-danger hover:bg-danger/10 border border-danger/30 text-xs font-bold uppercase active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">link_off</span>
                        解绑
                    </button>
                    </div>
                </div>
            </div>
        ))}
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