import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { SwitchApiService } from '../services/switchApi';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { status, settings, performCheckIn, devices, sessionCheckedIn, notifications, healthData, addNotification, contacts, will, canSyncToServer, markPreWarningSent } = useApp();
  
  // State to track trigger phases
  // phase 0: Normal
  // phase 1: Warning (Deadline passed, notifying Emergency Contacts)
  // phase 2: Executed (Grace period passed, notifying Asset Liaisons)
  const [protocolPhase, setProtocolPhase] = useState<0 | 1 | 2>(0);

  // Helper to calculate time left
  // Returns negative values when expired, which represents time into Grace Period
  const calculateTimeLeft = useCallback(() => {
    const now = Date.now();
    const deadline = status.lastCheckIn + (settings.checkInInterval * 60 * 60 * 1000);
    const diff = deadline - now;
    
    if (diff <= 0) {
      return { h: 0, m: 0, s: 0, msDiff: diff, expired: true };
    }
    
    const h = Math.floor((diff / (1000 * 60 * 60)));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return { h, m, s, msDiff: diff, expired: false };
  }, [status.lastCheckIn, settings.checkInInterval]);

  const [timerState, setTimerState] = useState(calculateTimeLeft());

  const hasWatch = devices.some(d => d.type === 'watch' && d.status === 'connected');
  const hasDevice = devices.length > 0;
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Reset phase if status becomes active manually
    if (status.status === 'active' && protocolPhase !== 0) {
        setProtocolPhase(0);
    }

    const interval = setInterval(() => {
      const current = calculateTimeLeft();
      setTimerState(current);
      
      // --- PRE-WARNING LOGIC (T-30 mins) ---
      if (!current.expired && current.msDiff <= 30 * 60 * 1000 && !status.preWarningSent) {
          markPreWarningSent(); // Mark as sent to prevent duplicates

          // 1. Always send a local notification to the user
          addNotification('预警：即将超时', '您的生存确认即将超时，请在30分钟内签到。', 'emergency');

          // 2. If service is activated, also request a server-side email alert
          if (status.isAuthorized && settings.userEmail) {
              console.log('[PROTOCOL] Pre-warning: Requesting server to send self-alert email.');
              SwitchApiService.sendSelfNotification(); // Fire-and-forget API call
          }
      }

      // --- PROTOCOL LOGIC (T=0) ---
      if (!current.expired) return; // Do nothing if timer is still running

      const gracePeriodMs = settings.confirmationDelay * 60 * 1000;
      const timePastDeadline = Math.abs(current.msDiff);
      
      // Transition from Normal (0) to Warning (1)
      if (protocolPhase === 0) {
          setProtocolPhase(1);
              
          const canBroadcast = status.isAuthorized && contacts.length > 0;
          
          const notifMsg = canBroadcast
            ? `已进入 ${settings.confirmationDelay}分钟 确认延迟期。服务端将联系紧急联系人...`
            : `已进入 ${settings.confirmationDelay}分钟 确认延迟期。未激活云端服务，仅发送本地通知。`;
          addNotification('生存确认超时', notifMsg, 'emergency');

          // NOTE: The actual broadcast to emergency contacts is now handled by the SERVER
      }
      
      // Transition from Warning (1) to Executed (2)
      else if (protocolPhase === 1 && timePastDeadline > gracePeriodMs) {
          setProtocolPhase(2);
          const canBroadcast = status.isAuthorized && contacts.length > 0;
          if (canBroadcast && will.content) {
             addNotification('协议已执行', '延迟期结束，服务端已向资产对接人发送遗产备忘录。', 'emergency');
          } else {
             let reason = '';
             if (!status.isAuthorized) reason = '云端服务未授权';
             else if (contacts.length === 0) reason = '未添加联系人';
             else if (!will.content) reason = '备忘录为空';
             else reason = '未知原因';
             addNotification('协议已执行', `延迟期结束。因${reason}，未执行云端备忘录发送。`, 'system');
          }
           // NOTE: The actual broadcast is handled by the SERVER.
      }

    }, 250); // Increased update frequency to prevent visual skipping

    return () => clearInterval(interval);
  }, [calculateTimeLeft, protocolPhase, settings, status, contacts, will, addNotification, markPreWarningSent]);

  const handleCheckIn = () => {
      performCheckIn();
      setTimerState(calculateTimeLeft());
      setProtocolPhase(0); // Reset protocol
  };

  const isExpired = timerState.expired;

  // Calculate Grace Period Left for UI
  const getGracePeriodTimer = () => {
      if (!isExpired) return null;
      const gracePeriodMs = settings.confirmationDelay * 60 * 1000;
      const timePast = Math.abs(timerState.msDiff);
      const timeLeft = gracePeriodMs - timePast;
      
      const initialGracePeriodIsOverAnHour = settings.confirmationDelay >= 60;

      if (timeLeft <= 0) {
          return initialGracePeriodIsOverAnHour ? "00:00:00" : "00:00";
      }
      
      const h = Math.floor(timeLeft / (1000 * 60 * 60));
      const m = Math.floor((timeLeft % (1000 * 60 * 60)) / 60000);
      const s = Math.floor((timeLeft % 60000) / 1000);
      
      if (initialGracePeriodIsOverAnHour) {
          return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      }
      
      return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

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
          <span className="text-[10px] text-slate-400 font-mono">
              状态：
              {protocolPhase === 0 ? '监测中' : protocolPhase === 1 ? '一级警报' : '已执行'}
          </span>
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
                                <span className="material-symbols-outlined text-danger text-xl animate-pulse">warning</span>
                                <p className="text-2xl font-bold text-danger uppercase tracking-wider">
                                    {protocolPhase === 2 ? '协议已执行' : '警报触发'}
                                </p>
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
                <span className="text-[10px] font-mono font-bold text-primary">v1.5.1</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
              <p className="text-slate-500 text-[10px] font-mono uppercase">同步：{canSyncToServer() ? '云端在线' : '仅本地'}</p>
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
              <h2 className="text-danger font-mono text-[10px] font-bold uppercase tracking-widest">
                  {isExpired ? '确认延迟期 (GRACE PERIOD)' : '生存状态确认倒计时'}
              </h2>
            </div>
            
            {isExpired ? (
                // GRACE PERIOD UI
                <div className="flex flex-col items-center justify-center py-2">
                     <p className="text-4xl font-mono font-bold text-danger neon-glow">{getGracePeriodTimer()}</p>
                     <p className="text-danger/70 text-[10px] mt-2 font-mono uppercase">
                         {protocolPhase === 2 ? '执行完毕' : '至二级执行'}
                     </p>
                </div>
            ) : (
                // NORMAL COUNTDOWN UI
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
            )}
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
                    {protocolPhase === 1 
                        ? <span className="text-danger font-bold">一级警报已触发！请立即签到以撤销对紧急联系人的通知。</span>
                        : "等待生物识别确认以重置生命周期计时器。"
                    }
                </p>
                <button 
                    onClick={handleCheckIn}
                    className="w-full h-20 bg-primary hover:bg-primary/90 text-black rounded font-bold flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-transform active:scale-95 group"
                >
                <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">fingerprint</span>
                <span className="text-lg tracking-widest font-black">
                    {protocolPhase > 0 ? '解除警报 / 签到' : '手动签到'}
                </span>
                </button>
            </div>
          )}
        </div>

        {/* Warning / Status Log */}
        <div className="pb-8 space-y-2">
            {protocolPhase === 1 && status.isAuthorized && contacts.length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded bg-orange-900/20 border border-orange-500/50">
                    <span className="material-symbols-outlined text-orange-500 text-sm mt-0.5">notification_important</span>
                    <div className="flex flex-col">
                        <p className="text-xs text-orange-400 font-bold">已通知紧急联系人</p>
                        <p className="text-[10px] text-orange-300/70 leading-relaxed">系统已尝试联系您的紧急联系人以确认您的安全。请尽快签到。</p>
                    </div>
                </div>
            )}
            
            {protocolPhase === 2 && status.isAuthorized && contacts.length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded bg-danger/10 border border-danger">
                    <span className="material-symbols-outlined text-danger text-sm mt-0.5">send</span>
                    <div className="flex flex-col">
                        <p className="text-xs text-danger font-bold">备忘录已发送</p>
                        <p className="text-[10px] text-danger/70 leading-relaxed">“活着么”已触发，资产线索已发送给资产对接人。</p>
                    </div>
                </div>
            )}

            <div className="flex items-start gap-4 p-4 rounded bg-white/5 border border-white/10">
                <span className="material-symbols-outlined text-slate-500 text-xl">info</span>
                <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                <span className="text-primary font-bold">机制说明：</span> <br/>
                1. 倒计时结束 -> 联系<span className="text-white">【紧急联系人】</span>(仅预警)<br/>
                2. 延迟期结束 -> 联系<span className="text-white">【资产对接人】</span>(发备忘录)
                </p>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
