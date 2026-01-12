import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { CommunicationService } from '../services/communication';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { status, settings, performCheckIn, devices, sessionCheckedIn, notifications, healthData, addNotification } = useApp();
  
  // Helper to calculate time left
  const calculateTimeLeft = useCallback(() => {
    const now = Date.now();
    const deadline = status.lastCheckIn + (settings.checkInInterval * 60 * 60 * 1000);
    const diff = deadline - now;
    
    if (diff <= 0) {
      return { h: 0, m: 0, s: 0, expired: true };
    }
    
    const h = Math.floor((diff / (1000 * 60 * 60)));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return { h, m, s, expired: false };
  }, [status.lastCheckIn, settings.checkInInterval]);

  const [timerState, setTimerState] = useState(calculateTimeLeft());
  const [hasNotified, setHasNotified] = useState(false);

  // Check if there is an active watch device
  const hasWatch = devices.some(d => d.type === 'watch' && d.status === 'connected');
  const hasDevice = devices.length > 0;
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Reset notification state if status becomes active
    if (status.status === 'active') {
        setHasNotified(false);
    }

    const interval = setInterval(() => {
      const current = calculateTimeLeft();
      setTimerState(current);

      if (current.expired) {
        // Immediate Notification Logic using Specialized Templates
        if (!hasNotified) {
            setHasNotified(true); // Prevent spamming
            
            // 1. In-App Notification (System Alert)
            addNotification(
                '生存确认超时',
                `系统检测到您未在${settings.checkInInterval}小时内确认状态。正在尝试联系本人...`,
                'emergency'
            );

            // 2. Send SMS (Mock) & Email (SMTP)
            if (settings.userPhone || settings.userEmail) {
                if (settings.userPhone) {
                    const smsMsg = `【活着么】警报：生存确认倒计时已结束。请立即打开App确认，否则将在 ${settings.confirmationDelay} 分钟后触发遗产执行。`;
                    CommunicationService.sendSMS({ to: settings.userPhone, body: smsMsg });
                }

                if (settings.userEmail) {
                    CommunicationService.sendSurvivalAlert(settings.userEmail, "用户");
                }
            }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft, hasNotified, settings.userPhone, settings.userEmail, settings.confirmationDelay, status.status, settings.checkInInterval, addNotification]);

  const handleCheckIn = () => {
      performCheckIn();
      setTimerState(calculateTimeLeft()); // Update immediately on check-in
  };

  const isExpired = timerState.expired;

  return (
    <Layout>
      {/* CSS for Dynamic ECG Animation */}
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -1000; }
        }
        .ecg-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 0;
          animation: dash ${hasWatch && healthData.heartRate > 0 ? (60 / healthData.heartRate) * 4 : 0}s linear infinite;
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-medical-dark/90 backdrop-blur-md p-4 border-b border-primary/20 justify-between">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-3xl text-primary neon-glow">ecg_heart</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-lg font-bold leading-tight tracking-[0.2em] text-primary neon-glow uppercase">活着么</h2>
          <span className="text-[10px] text-slate-400 font-mono">状态：{isExpired ? '警告' : '监测中'}</span>
        </div>
        <div className="flex w-12 items-center justify-end">
             <button onClick={() => navigate('/notifications')} className="relative">
                 <span className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors">notifications</span>
                 {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 size-2 bg-danger rounded-full animate-pulse"></span>
                 )}
             </button>
        </div>
      </div>

      {/* Decorative ECG Line (Top) */}
      <div className="w-full h-8 overflow-hidden opacity-30 mt-2">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 40">
          <path d="M0,20 L50,20 L55,10 L65,30 L70,20 L100,20 L110,5 L120,35 L130,20 L180,20 L185,10 L195,30 L200,20 L250,20 L260,5 L270,35 L280,20 L330,20 L335,10 L345,30 L350,20 L400,20" fill="none" stroke="#39ff14" strokeWidth="1"></path>
        </svg>
      </div>

      <div className="p-4 space-y-4">
        {/* Heart Rate & Steps Card */}
        <div className="flex flex-col items-stretch justify-start rounded bg-medical-panel border border-primary/30 shadow-[inset_0_0_20px_rgba(57,255,20,0.05)] overflow-hidden">
          {hasDevice ? (
              <div className="w-full h-32 relative bg-black flex items-center justify-center overflow-hidden">
                {/* Animated Background Grid */}
                <div className="absolute inset-0 medical-grid opacity-20"></div>
                {/* Dynamic ECG Wave (Only visible if Watch present) */}
                {hasWatch && (
                  <svg className="absolute inset-0 w-full h-full opacity-80" viewBox="0 0 400 100" preserveAspectRatio="none">
                      <path 
                          className="ecg-line"
                          d="M0 50 L100 50 L110 20 L125 80 L140 10 L155 90 L165 50 L250 50 L260 30 L275 70 L285 50 L400 50 M400 50 L500 50 L510 20 L525 80 L540 10 L555 90 L565 50 L650 50 L660 30 L675 70 L685 50 L800 50" 
                          fill="none" 
                          stroke="#39ff14" 
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                      ></path>
                  </svg>
                )}
                
                <div className="absolute top-2 right-3 flex items-center gap-1">
                    <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-[10px] font-mono text-primary uppercase">实时数据</span>
                </div>
                <div className="z-10 text-center flex gap-8 items-center justify-center bg-black/40 p-2 rounded-xl backdrop-blur-sm border border-white/5">
                    <div>
                        <p className="text-[10px] font-mono text-primary/70 uppercase tracking-widest mb-1">心率</p>
                        <p className="text-4xl font-mono font-bold text-primary neon-glow w-24">{healthData.heartRate} <span className="text-xs text-primary/60">BPM</span></p>
                    </div>
                    <div className="w-[1px] h-8 bg-white/20"></div>
                    <div>
                        <p className="text-[10px] font-mono text-primary/70 uppercase tracking-widest mb-1">步数</p>
                        <p className="text-4xl font-mono font-bold text-white w-24">{healthData.steps} <span className="text-xs text-slate-400">步</span></p>
                    </div>
                </div>
              </div>
          ) : (
              <div 
                className="w-full h-32 relative bg-black/50 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group"
                onClick={() => navigate('/devices')}
              >
                  <span className="material-symbols-outlined text-4xl text-slate-600 group-hover:text-primary transition-colors mb-2">watch_off</span>
                  <p className="text-sm font-bold text-slate-400 group-hover:text-white">未绑定设备</p>
                  <div className="flex gap-4 mt-2 opacity-50">
                    <p className="text-xs font-mono text-slate-600">心率: --</p>
                    <p className="text-xs font-mono text-slate-600">步数: --</p>
                  </div>
                  <p className="text-[10px] text-primary/70 font-mono mt-1 group-hover:text-primary animate-pulse">点击添加终端以获取数据</p>
              </div>
          )}

          <div className="flex flex-col items-stretch p-5 gap-4 border-t border-primary/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-primary/60 text-[10px] font-mono font-bold uppercase tracking-widest">生命体征确认</p>
                <div className="flex items-center gap-2 mt-1">
                  {!hasDevice ? (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-500 text-xl">help</span>
                        <p className="text-2xl font-bold text-slate-500 uppercase tracking-wider">待确认</p>
                      </div>
                  ) : (
                      <div className="flex items-center gap-2">
                        {isExpired ? (
                             <>
                                <span className="material-symbols-outlined text-danger text-xl">warning</span>
                                <p className="text-2xl font-bold text-danger uppercase tracking-wider">已过期</p>
                             </>
                         ) : (
                             <>
                                <span className="material-symbols-outlined text-white text-xl">check_circle</span>
                                <p className="text-2xl font-bold text-white uppercase tracking-wider">已确认</p>
                             </>
                         )}
                      </div>
                  )}
                </div>
              </div>
              <div className="bg-primary/10 px-2 py-1 rounded border border-primary/20">
                <span className="text-[10px] font-mono font-bold text-primary">v1.4.2</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
              <p className="text-slate-500 text-[10px] font-mono uppercase">同步：{hasDevice ? '实时' : '无数据'}</p>
              <span className={`flex items-center gap-1 text-[10px] font-mono font-bold ${hasWatch ? 'text-primary' : hasDevice ? 'text-primary/70' : 'text-slate-500'}`}>
                <span className="material-symbols-outlined text-sm">{hasWatch ? 'check_circle' : hasDevice ? 'smartphone' : 'error'}</span>
                {hasWatch ? '监测中' : hasDevice ? '仅手机' : '离线'}
              </span>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="mt-4">
          <div className={`bg-medical-panel border ${isExpired ? 'border-danger animate-pulse' : 'border-danger/30'} p-6 rounded relative`}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-medical-dark px-3 whitespace-nowrap">
              <h2 className="text-danger font-mono text-[10px] font-bold uppercase tracking-widest">生存状态确认倒计时</h2>
            </div>
            <div className="flex gap-4 justify-center py-2">
              <div className="flex flex-col items-center gap-1">
                <p className="text-3xl font-mono font-bold text-danger neon-glow">{String(timerState.h).padStart(2, '0')}</p>
                <p className="text-slate-500 text-[9px] font-mono uppercase">时</p>
              </div>
              <p className="text-3xl font-mono font-bold text-danger/30">:</p>
              <div className="flex flex-col items-center gap-1">
                <p className="text-3xl font-mono font-bold text-danger neon-glow">{String(timerState.m).padStart(2, '0')}</p>
                <p className="text-slate-500 text-[9px] font-mono uppercase">分</p>
              </div>
              <p className="text-3xl font-mono font-bold text-danger/30">:</p>
              <div className="flex flex-col items-center gap-1">
                <p className="text-3xl font-mono font-bold text-danger neon-glow">{String(timerState.s).padStart(2, '0')}</p>
                <p className="text-slate-500 text-[9px] font-mono uppercase">秒</p>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Check-in */}
        <div className="mt-4">
          {sessionCheckedIn ? (
               <div className="bg-primary/10 rounded border border-primary/20 p-6 flex flex-col items-center gap-2 animate-fade-in">
                 <span className="material-symbols-outlined text-4xl text-primary">sentiment_satisfied</span>
                 <p className="text-primary font-bold text-lg tracking-wider">活着真好</p>
                 <p className="text-slate-500 text-xs font-mono">状态已更新，计时器已重置</p>
               </div>
          ) : (
            <div className="bg-primary/5 rounded border border-primary/20 p-6 flex flex-col items-center gap-6">
                <p className="text-center text-slate-400 text-xs font-mono uppercase leading-relaxed">
                等待生物识别确认以重置生命周期计时器。
                </p>
                <button 
                    onClick={handleCheckIn}
                    className="w-full h-20 bg-primary hover:bg-primary/90 text-black rounded font-bold flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-transform active:scale-95 group"
                >
                <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">fingerprint</span>
                <span className="text-lg tracking-widest font-black">手动签到</span>
                </button>
            </div>
          )}
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