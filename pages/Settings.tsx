import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  
  // State for settings
  const [syncFrequency, setSyncFrequency] = useState('1小时');
  const [minSteps, setMinSteps] = useState(2000);
  const [checkInInterval, setCheckInInterval] = useState(72);

  return (
    <Layout>
      <div className="sticky top-0 z-50 flex items-center bg-medical-dark/90 backdrop-blur-md p-4 border-b border-primary/20 justify-between">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-3xl text-primary neon-glow">settings</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-lg font-bold leading-tight tracking-[0.2em] text-primary neon-glow uppercase">系统设置</h2>
          <span className="text-[10px] text-slate-400 font-mono">配置</span>
        </div>
        <div onClick={() => navigate('/devices')} className="flex w-12 items-center justify-end cursor-pointer text-primary/40 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">sensors</span>
        </div>
      </div>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Device Section */}
        <div className="bg-medical-panel border border-primary/20 rounded p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest">已连接设备</h3>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[9px] text-primary font-bold">在线</span>
            </span>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-3 rounded border border-white/5">
            <span className="material-symbols-outlined text-primary text-3xl">watch</span>
            <div className="flex-1">
              <div className="text-sm font-bold">智能终端 V3</div>
              <div className="text-[10px] text-slate-500 font-mono">ID: LW-0988-X</div>
            </div>
            <button 
                onClick={() => navigate('/devices')}
                className="text-[10px] border border-primary/30 px-3 py-1 rounded text-primary hover:bg-primary/10 transition-colors"
            >
                管理
            </button>
          </div>
        </div>

        {/* Survival Status Confirmation Interval (New) */}
        <div className="bg-medical-panel border border-primary/20 rounded p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest">生存状态确认间隔</h3>
            <span className="material-symbols-outlined text-primary text-sm">timer</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[12, 24, 48, 72].map((hours) => (
              <button 
                key={hours}
                onClick={() => setCheckInInterval(hours)}
                className={`p-2 border ${checkInInterval === hours ? 'border-primary/40 bg-primary/10 text-primary shadow-[0_0_5px_rgba(57,255,20,0.2)]' : 'border-white/10 text-slate-400 hover:bg-white/5'} text-[10px] font-mono text-center rounded font-bold transition-all`}
              >
                {hours}小时
              </button>
            ))}
          </div>
        </div>

        {/* Thresholds */}
        <div className="bg-medical-panel border border-primary/20 rounded p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest">警报阈值</h3>
            <span className="material-symbols-outlined text-primary text-sm">monitor_heart</span>
          </div>
          <div className="space-y-6 pt-2">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-400">最大心率</span>
                <span className="text-[10px] font-mono text-primary">160 次/分</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[75%] shadow-[0_0_10px_rgba(57,255,20,0.5)]"></div>
              </div>
            </div>
            
            {/* Slider for Min Steps */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-400">每日最少步数</span>
                <span className="text-[10px] font-mono text-primary">{minSteps.toLocaleString()} 步</span>
              </div>
              <div className="relative h-6 w-full flex items-center">
                 <input 
                    type="range" 
                    min="500" 
                    max="10000" 
                    step="500" 
                    value={minSteps}
                    onChange={(e) => setMinSteps(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <style>{`
                    input[type='range']::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      width: 16px;
                      height: 16px;
                      border-radius: 50%;
                      background: #39ff14;
                      cursor: pointer;
                      box-shadow: 0 0 10px rgba(57, 255, 20, 0.8);
                      margin-top: -6px; /* center it on the track */
                    }
                    input[type='range']::-webkit-slider-runnable-track {
                        height: 6px;
                        border-radius: 3px;
                        background: rgba(255, 255, 255, 0.1);
                    }
                  `}</style>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Frequency */}
        <div className="bg-medical-panel border border-primary/20 rounded p-4">
          <h3 className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest mb-4">自动同步频率</h3>
          <div className="grid grid-cols-3 gap-2">
            {['15分钟', '1小时', '6小时'].map((freq) => (
                <button 
                    key={freq}
                    onClick={() => setSyncFrequency(freq)}
                    className={`p-2 border ${syncFrequency === freq ? 'border-primary/40 bg-primary/10 text-primary shadow-[0_0_5px_rgba(57,255,20,0.2)]' : 'border-white/10 text-slate-400 hover:bg-white/5'} text-[10px] font-mono text-center rounded font-bold transition-all`}
                >
                    {freq}
                </button>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="mt-8 px-2 space-y-1">
          <button onClick={() => navigate('/logs')} className="w-full py-3 flex items-center justify-between border-b border-white/5 hover:bg-white/5 px-2 rounded transition-colors group">
            <span className="text-sm font-medium">系统日志</span>
            <span className="material-symbols-outlined text-slate-500 text-lg group-hover:text-primary">chevron_right</span>
          </button>
          <button onClick={() => navigate('/auth')} className="w-full py-3 flex items-center justify-between border-b border-white/5 hover:bg-white/5 px-2 rounded transition-colors group">
            <span className="text-sm font-medium">授权与权限</span>
            <span className="material-symbols-outlined text-slate-500 text-lg group-hover:text-primary">chevron_right</span>
          </button>
          <button onClick={() => alert('清除本地数据 (模拟)')} className="w-full py-3 flex items-center justify-between border-b border-white/5 text-danger hover:bg-danger/10 px-2 rounded transition-colors group">
            <span className="text-sm font-bold">清除本地数据</span>
            <span className="material-symbols-outlined text-danger/50 text-lg group-hover:text-danger">delete_forever</span>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;