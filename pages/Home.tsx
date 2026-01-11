import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-medical-dark/90 backdrop-blur-md p-4 border-b border-primary/20 justify-between">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-3xl text-primary neon-glow">ecg_heart</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-lg font-bold leading-tight tracking-[0.2em] text-primary neon-glow uppercase">活着么</h2>
          <span className="text-[10px] text-slate-400 font-mono">状态：监测中</span>
        </div>
        <div className="flex w-12 items-center justify-end">
             <button onClick={() => navigate('/notifications')} className="relative">
                 <span className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors">notifications</span>
                 <span className="absolute top-0 right-0 size-2 bg-danger rounded-full animate-pulse"></span>
             </button>
        </div>
      </div>

      {/* Decorative ECG Line */}
      <div className="w-full h-8 overflow-hidden opacity-30 mt-2">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 40">
          <path d="M0,20 L50,20 L55,10 L65,30 L70,20 L100,20 L110,5 L120,35 L130,20 L180,20 L185,10 L195,30 L200,20 L250,20 L260,5 L270,35 L280,20 L330,20 L335,10 L345,30 L350,20 L400,20" fill="none" stroke="#39ff14" strokeWidth="1"></path>
        </svg>
      </div>

      <div className="p-4 space-y-4">
        {/* Heart Rate Card */}
        <div className="flex flex-col items-stretch justify-start rounded bg-medical-panel border border-primary/30 shadow-[inset_0_0_20px_rgba(57,255,20,0.05)] overflow-hidden">
          <div className="w-full h-32 relative bg-black flex items-center justify-center overflow-hidden">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 medical-grid opacity-20"></div>
            <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 100">
              <path d="M0 50 L150 50 L160 30 L175 80 L190 10 L205 90 L215 50 L400 50" fill="none" stroke="#39ff14" strokeWidth="2" className="drop-shadow-[0_0_5px_rgba(57,255,20,0.8)]"></path>
            </svg>
            <div className="absolute top-2 right-3 flex items-center gap-1">
              <div className="size-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-[10px] font-mono text-primary uppercase">实时数据</span>
            </div>
            <div className="z-10 text-center">
              <p className="text-[10px] font-mono text-primary/70 uppercase tracking-widest mb-1">心率信号</p>
              <p className="text-5xl font-mono font-bold text-primary neon-glow">72 <span className="text-sm">次/分</span></p>
            </div>
          </div>
          <div className="flex flex-col items-stretch p-5 gap-4 border-t border-primary/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-primary/60 text-[10px] font-mono font-bold uppercase tracking-widest">生命体征确认</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold text-white uppercase tracking-wider">已确认</p>
                </div>
              </div>
              <div className="bg-primary/10 px-2 py-1 rounded border border-primary/20">
                <span className="text-[10px] font-mono font-bold text-primary">v1.4.2</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
              <p className="text-slate-500 text-[10px] font-mono uppercase">同步：刚刚 (Apple Watch)</p>
              <span className="flex items-center gap-1 text-primary text-[10px] font-mono font-bold">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                稳定
              </span>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="mt-4">
          <div className="bg-medical-panel border border-danger/30 p-6 rounded relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-medical-dark px-3 whitespace-nowrap">
              <h2 className="text-danger font-mono text-[10px] font-bold uppercase tracking-widest">生存状态确认倒计时</h2>
            </div>
            <div className="flex gap-4 justify-center py-2">
              <div className="flex flex-col items-center gap-1">
                <p className="text-3xl font-mono font-bold text-danger neon-glow">14</p>
                <p className="text-slate-500 text-[9px] font-mono uppercase">时</p>
              </div>
              <p className="text-3xl font-mono font-bold text-danger/30">:</p>
              <div className="flex flex-col items-center gap-1">
                <p className="text-3xl font-mono font-bold text-danger neon-glow">22</p>
                <p className="text-slate-500 text-[9px] font-mono uppercase">分</p>
              </div>
              <p className="text-3xl font-mono font-bold text-danger/30">:</p>
              <div className="flex flex-col items-center gap-1">
                <p className="text-3xl font-mono font-bold text-danger neon-glow">45</p>
                <p className="text-slate-500 text-[9px] font-mono uppercase">秒</p>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Check-in */}
        <div className="mt-4">
          <div className="bg-primary/5 rounded border border-primary/20 p-6 flex flex-col items-center gap-6">
            <p className="text-center text-slate-400 text-xs font-mono uppercase leading-relaxed">
              等待生物识别确认以重置生命周期计时器。
            </p>
            <button className="w-full h-20 bg-primary hover:bg-primary/90 text-black rounded font-bold flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-transform active:scale-95 group">
              <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">fingerprint</span>
              <span className="text-lg tracking-widest font-black">手动签到</span>
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="pb-8">
          <div className="flex items-start gap-4 p-4 rounded bg-danger/5 border border-danger/20">
            <span className="material-symbols-outlined text-danger text-xl animate-pulse">warning</span>
            <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
              <span className="text-danger font-bold">警告：</span> 如果未在规定时间内签到，将触发遗产协议并通知紧急联系人。
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;