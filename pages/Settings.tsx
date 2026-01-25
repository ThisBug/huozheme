import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { NativeBridge } from '../services/nativeBridge';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, devices, nukeUserData, status } = useApp();
  
  // Local state for user info fields to save on blur
  const [localUserName, setLocalUserName] = useState(settings.userName);
  const [localUserPhone, setLocalUserPhone] = useState(settings.userPhone);
  const [localUserEmail, setLocalUserEmail] = useState(settings.userEmail);
  
  const [showToast, setShowToast] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  
  // Permissions State
  const [healthPerm, setHealthPerm] = useState(false);
  const [notifPerm, setNotifPerm] = useState(false);

  // Check existing permissions on mount
  useEffect(() => {
    // In a real app, we would check status. For web demo, we just assume false unless session stored.
    if (Notification.permission === 'granted') setNotifPerm(true);
  }, []);

  // Progress bar state for clearing data
  const [isClearing, setIsClearing] = useState(false);
  const [clearProgress, setClearProgress] = useState(0);

  const validatePhone = (phone: string) => {
      return /^1\d{10}$/.test(phone);
  };

  const validateEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Derived state for button enablement
  const canActivate = 
    localUserName.trim() !== '' &&
    localUserName.length <= 20 &&
    localUserEmail.trim() !== '' &&
    validateEmail(localUserEmail) &&
    (!localUserPhone.trim() || validatePhone(localUserPhone));

  // Generic handler for settings that save immediately (buttons, sliders)
  const handleImmediateUpdate = (newSettings: Partial<typeof settings>) => {
      updateSettings(newSettings);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
  };

  // Save user info on blur
  const handleInfoSaveOnBlur = () => {
    const isNameInvalid = localUserName.length > 20;
    const isPhoneInvalid = !!localUserPhone && !validatePhone(localUserPhone);
    const isEmailInvalid = !!localUserEmail && !validateEmail(localUserEmail);

    setNameError(isNameInvalid);
    setPhoneError(isPhoneInvalid);
    setEmailError(isEmailInvalid);
    
    if (isNameInvalid || isPhoneInvalid || isEmailInvalid) {
        return;
    }
    
    // Check if anything actually changed to avoid unnecessary saves
    if (
      localUserName !== settings.userName ||
      localUserPhone !== settings.userPhone ||
      localUserEmail !== settings.userEmail
    ) {
      updateSettings({
        userName: localUserName,
        userPhone: localUserPhone,
        userEmail: localUserEmail,
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleClearData = () => {
      setShowClearModal(false);
      setIsClearing(true);
      setClearProgress(0);

      const interval = setInterval(() => {
          setClearProgress(prev => {
              if (prev >= 95) {
                  clearInterval(interval);
                  // Execute Nuke (API Delete + Local Clear)
                  nukeUserData();
                  return 100;
              }
              return prev + 5; // increment speed
          });
      }, 50);
  };

  const requestHealthAccess = async () => {
      const granted = await NativeBridge.health.requestAuthorization();
      if (granted) setHealthPerm(true);
  };

  const requestNotifAccess = async () => {
      const granted = await NativeBridge.notification.requestPermissions();
      if (granted) setNotifPerm(true);
  };

  return (
    <Layout>
      {/* Feedback Toast */}
      {showToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-fade-in bg-medical-panel border border-primary text-primary px-4 py-2 rounded-full shadow-[0_0_15px_rgba(57,255,20,0.3)] flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span className="text-xs font-bold">设置已保存</span>
          </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {showClearModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-sm bg-medical-panel border border-danger/50 rounded-lg p-6 shadow-[0_0_30px_rgba(255,49,49,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-danger/20 via-danger to-danger/20"></div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-danger">delete_forever</span>
                      警告：本地数据重置
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      此操作将彻底删除所有本地存储的配置、遗嘱、联系人、健康日志及设备绑定。App将恢复至出厂状态。<br/><br/>
                      <span className="text-danger font-bold">云端同步：</span> 服务端关联的所有数据（UDID、倒计时配置）也将被同步销毁。
                  </p>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setShowClearModal(false)}
                        className="flex-1 py-3 border border-white/10 rounded font-bold text-slate-300 hover:bg-white/5 transition-colors"
                      >
                          取消
                      </button>
                      <button 
                        onClick={handleClearData}
                        className="flex-1 py-3 bg-danger/10 border border-danger/50 text-danger rounded font-bold hover:bg-danger/20 transition-colors shadow-[0_0_15px_rgba(255,49,49,0.2)]"
                      >
                          确认清除
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Clearing Progress Overlay */}
      {isClearing && (
          <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md">
              <div className="w-64">
                  <p className="text-primary font-bold text-center mb-4 uppercase tracking-widest animate-pulse">正在销毁云端与本地数据...</p>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
                      <div 
                        className="h-full bg-danger shadow-[0_0_10px_#ff3131]" 
                        style={{ width: `${clearProgress}%`, transition: 'width 0.05s linear' }}
                      ></div>
                  </div>
                  <p className="text-right text-xs font-mono text-slate-500 mt-2">{clearProgress}%</p>
              </div>
          </div>
      )}

      <div className="sticky top-0 z-50 flex items-center bg-medical-dark/90 backdrop-blur-md p-4 border-b border-primary/20 justify-between">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-3xl text-primary neon-glow">settings</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-lg font-bold leading-tight tracking-[0.2em] text-primary neon-glow uppercase">系统设置</h2>
          <span className="text-[10px] text-slate-400 font-mono">本地配置</span>
        </div>
        <div onClick={() => navigate('/devices')} className="flex w-12 items-center justify-end cursor-pointer text-primary/40 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">sensors</span>
        </div>
      </div>

      <div className="p-4 space-y-4 animate-fade-in pb-10">
        
        {/* Permissions Section (New) */}
        <div className="bg-medical-panel border border-primary/20 rounded p-4">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest">系统权限集成 (iOS Bridge)</h3>
                <span className="material-symbols-outlined text-primary text-sm">security</span>
             </div>
             <div className="space-y-3">
                 <div className="flex items-center justify-between border-b border-white/5 pb-2">
                     <div className="flex items-center gap-2">
                         <span className="material-symbols-outlined text-slate-400">favorite</span>
                         <div className="flex flex-col">
                             <span className="text-sm font-bold text-white">健康数据 (HealthKit)</span>
                             <span className="text-[10px] text-slate-500">读取步数与心率用于生存监测</span>
                         </div>
                     </div>
                     <button 
                        onClick={requestHealthAccess}
                        disabled={healthPerm}
                        className={`text-[10px] px-3 py-1 rounded border font-bold ${healthPerm ? 'border-primary/50 text-primary bg-primary/10' : 'border-slate-500 text-slate-400'}`}
                     >
                         {healthPerm ? '已授权' : '请求访问'}
                     </button>
                 </div>
                 <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                         <span className="material-symbols-outlined text-slate-400">notifications_active</span>
                         <div className="flex flex-col">
                             <span className="text-sm font-bold text-white">本地通知 (Local Push)</span>
                             <span className="text-[10px] text-slate-500">发送紧急生存确认请求</span>
                         </div>
                     </div>
                     <button 
                        onClick={requestNotifAccess}
                        disabled={notifPerm}
                        className={`text-[10px] px-3 py-1 rounded border font-bold ${notifPerm ? 'border-primary/50 text-primary bg-primary/10' : 'border-slate-500 text-slate-400'}`}
                     >
                         {notifPerm ? '已授权' : '请求访问'}
                     </button>
                 </div>
             </div>
        </div>

        {/* Device Section */}
        <div className="bg-medical-panel border border-primary/20 rounded p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest">已连接设备 (本地)</h3>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[9px] text-primary font-bold">在线 ({devices.length})</span>
            </span>
          </div>
          {devices.length > 0 ? (
            <div className="flex items-center gap-4 bg-white/5 p-3 rounded border border-white/5">
                <span className="material-symbols-outlined text-primary text-3xl">{devices[0].type === 'watch' ? 'watch' : 'smartphone'}</span>
                <div className="flex-1">
                <div className="text-sm font-bold">{devices[0].name}</div>
                <div className="text-[10px] text-slate-500 font-mono">ID: {devices[0].id.substring(0,8)}...</div>
                </div>
                <button 
                    onClick={() => navigate('/devices')}
                    className="text-[10px] border border-primary/30 px-3 py-1 rounded text-primary hover:bg-primary/10 transition-colors"
                >
                    管理
                </button>
            </div>
          ) : (
            <div className="text-center py-2 text-slate-500 text-xs">暂无设备连接</div>
          )}
        </div>

        {/* User Contact Info for Self-Notification */}
        <div className="bg-medical-panel border border-primary/20 rounded p-4">
          <div className="flex items-center gap-2 mb-4">
             <h3 className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest">个人信息 & 本人通知</h3>
             <span className="material-symbols-outlined text-primary text-sm">person_alert</span>
          </div>
          <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
             设置您的称呼以便联系人识别，以及本人接收预警的联系方式。
          </p>
          <div className="space-y-3">
             <div className="relative">
                <span className={`absolute left-3 top-3 material-symbols-outlined text-[16px] ${nameError ? 'text-danger' : 'text-slate-500'}`}>badge</span>
                <input 
                    type="text" 
                    placeholder="您的称呼 / 代号 (必填) *"
                    value={localUserName}
                    onChange={(e) => setLocalUserName(e.target.value)}
                    onBlur={handleInfoSaveOnBlur}
                    className={`w-full bg-white/5 border ${nameError ? 'border-danger' : 'border-white/10'} rounded px-3 py-2 pl-9 text-xs text-white placeholder:text-slate-600 focus:border-primary focus:ring-0 transition-colors font-mono`}
                />
                {nameError && <p className="text-[10px] text-danger mt-1 ml-1">称呼不能超过20个字符</p>}
             </div>
             <div className="relative">
                <span className={`absolute left-3 top-3 material-symbols-outlined text-[16px] ${emailError ? 'text-danger' : 'text-slate-500'}`}>email</span>
                <input 
                    type="email" 
                    placeholder="本人邮箱 (激活服务必填项) *"
                    value={localUserEmail}
                    onChange={(e) => {
                        setLocalUserEmail(e.target.value);
                        if(emailError) setEmailError(false);
                    }}
                    onBlur={handleInfoSaveOnBlur}
                    className={`w-full bg-white/5 border ${emailError ? 'border-danger' : 'border-white/10'} rounded px-3 py-2 pl-9 text-xs text-white placeholder:text-slate-600 focus:border-primary focus:ring-0 transition-colors font-mono`}
                />
                 {emailError && <p className="text-[10px] text-danger mt-1 ml-1">邮箱格式不正确</p>}
             </div>
             <div className="relative">
                <span className={`absolute left-3 top-3 material-symbols-outlined text-[16px] ${phoneError ? 'text-danger' : 'text-slate-500'}`}>phone_iphone</span>
                <input 
                    type="tel" 
                    placeholder="本人手机号 (可选)"
                    value={localUserPhone}
                    onBlur={handleInfoSaveOnBlur}
                    onChange={(e) => {
                        setLocalUserPhone(e.target.value);
                        if(phoneError) setPhoneError(false);
                    }}
                    className={`w-full bg-white/5 border ${phoneError ? 'border-danger' : 'border-white/10'} rounded px-3 py-2 pl-9 text-xs text-white placeholder:text-slate-600 focus:border-primary focus:ring-0 transition-colors font-mono`}
                />
                {phoneError && <p className="text-[10px] text-danger mt-1 ml-1">格式错误：仅支持11位手机号（以1开头）</p>}
             </div>
          </div>
          
          {/* Activation Button / Status */}
          <div className="mt-4">
            {status.isAuthorized ? (
                <div className="bg-primary/10 border border-primary/20 p-3 flex items-center justify-center gap-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary text-base">verified_user</span>
                    <span className="text-primary text-xs font-bold">已激活预警服务</span>
                </div>
            ) : (
                <button
                    onClick={() => navigate('/auth')}
                    disabled={!canActivate}
                    className="w-full bg-primary text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 uppercase tracking-widest shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:brightness-110 active:scale-95 transition-all disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    激活预警
                </button>
            )}
          </div>
        </div>

        {/* Survival Status Confirmation Interval */}
        <div className="bg-medical-panel border border-primary/20 rounded p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest">生存状态确认间隔</h3>
            <span className="material-symbols-outlined text-primary text-sm">timer</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[12, 24, 48, 72].map((hours) => (
              <button 
                key={hours}
                onClick={() => handleImmediateUpdate({ checkInInterval: hours })}
                className={`p-2 border ${settings.checkInInterval === hours ? 'border-primary/40 bg-primary/10 text-primary shadow-[0_0_5px_rgba(57,255,20,0.2)]' : 'border-white/10 text-slate-400 hover:bg-white/5'} text-[10px] font-mono text-center rounded font-bold transition-all`}
              >
                {hours}小时
              </button>
            ))}
          </div>
        </div>

        {/* Confirmation Delay (Grace Period) */}
        <div className="bg-medical-panel border border-primary/20 rounded p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest">确认延迟时间 (预警缓冲)</h3>
                <span className="material-symbols-outlined text-primary text-sm">hourglass_top</span>
            </div>
            <p className="text-[10px] text-slate-500 mb-3">
             倒计时结束后等待您响应的时间，超时后将触发外部通知协议。
            </p>
            <div className="grid grid-cols-4 gap-2">
                {[120, 360, 720, 1440].map((mins) => (
                <button 
                    key={mins}
                    onClick={() => handleImmediateUpdate({ confirmationDelay: mins })}
                    className={`p-2 border ${settings.confirmationDelay === mins ? 'border-primary/40 bg-primary/10 text-primary shadow-[0_0_5px_rgba(57,255,20,0.2)]' : 'border-white/10 text-slate-400 hover:bg-white/5'} text-[10px] font-mono text-center rounded font-bold transition-all`}
                >
                    {mins < 60 ? `${mins}分钟` : `${mins/60}小时`}
                </button>
                ))}
            </div>
        </div>

        {/* Thresholds (Removed Max HR) */}
        <div className="bg-medical-panel border border-primary/20 rounded p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest">本地运动监测阈值</h3>
            <span className="material-symbols-outlined text-primary text-sm">directions_walk</span>
          </div>
          <div className="space-y-6 pt-2">
            {/* Slider for Min Steps */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-400">每日最少步数</span>
                <span className="text-[10px] font-mono text-primary">{settings.minSteps.toLocaleString()} 步</span>
              </div>
              <div className="relative h-6 w-full flex items-center">
                 <input 
                    type="range" 
                    min="500" 
                    max="10000" 
                    step="500" 
                    value={settings.minSteps}
                    onChange={(e) => handleImmediateUpdate({ minSteps: parseInt(e.target.value) })}
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

        {/* Links */}
        <div className="mt-8 px-2 space-y-1">
          <button onClick={() => navigate('/logs')} className="w-full py-3 flex items-center justify-between border-b border-white/5 hover:bg-white/5 px-2 rounded transition-colors group">
            <span className="text-sm font-medium">查看本地日志</span>
            <span className="material-symbols-outlined text-slate-500 text-lg group-hover:text-primary">chevron_right</span>
          </button>
          <button onClick={() => navigate('/auth')} className="w-full py-3 flex items-center justify-between border-b border-white/5 hover:bg-white/5 px-2 rounded transition-colors group">
            <span className="text-sm font-medium">授权与权限</span>
            <span className="material-symbols-outlined text-slate-500 text-lg group-hover:text-primary">chevron_right</span>
          </button>
          <button onClick={() => setShowClearModal(true)} className="w-full py-3 flex items-center justify-between border-b border-white/5 text-danger hover:bg-danger/10 px-2 rounded transition-colors group">
            <span className="text-sm font-bold">擦除本地数据 (恢复出厂)</span>
            <span className="material-symbols-outlined text-danger/50 text-lg group-hover:text-danger">delete_forever</span>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;