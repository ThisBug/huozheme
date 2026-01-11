import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Notifications: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout showBottomNav={false}>
      <div className="flex items-center bg-medical-dark/90 backdrop-blur-md p-4 pb-2 justify-between sticky top-0 z-50 border-b border-white/10">
        <button onClick={() => navigate(-1)} className="text-white flex size-12 shrink-0 items-center justify-center cursor-pointer hover:text-primary transition-colors">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <h2 className="text-white text-lg font-bold leading-tight tracking-wider flex-1 text-center uppercase">通知中心</h2>
        <div className="flex w-12 items-center justify-end">
          <button className="text-primary hover:text-white transition-colors">
            <span className="material-symbols-outlined neon-glow">playlist_add_check</span>
          </button>
        </div>
      </div>

      <div className="flex px-4 py-4 sticky top-[60px] bg-medical-dark/95 backdrop-blur-sm z-40">
        <div className="flex h-11 flex-1 items-center justify-center rounded-xl bg-medical-panel p-1 border border-white/5 shadow-inner">
          <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-primary has-[:checked]:text-black text-white/50 text-xs font-bold uppercase transition-all">
            <span className="truncate">系统</span>
            <input type="radio" name="category" value="system" className="hidden" defaultChecked />
          </label>
          <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-primary has-[:checked]:text-black text-white/50 text-xs font-bold uppercase transition-all">
            <span className="truncate">紧急</span>
            <input type="radio" name="category" value="emergency" className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex-1 px-4 pb-10 space-y-3 animate-fade-in">
        <p className="text-primary/60 text-[10px] font-bold uppercase tracking-[0.2em] px-1 py-2">最近</p>
        
        {/* Alert Notification */}
        <div className="flex items-start gap-4 bg-medical-panel/50 border border-white/5 rounded-xl px-4 py-4 transition-all active:scale-[0.98] hover:bg-medical-panel relative group overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-danger"></div>
          <div className="flex items-center justify-center rounded-lg bg-black shrink-0 size-12 border border-danger/30 shadow-[0_0_10px_rgba(255,49,49,0.3)]">
            <span className="material-symbols-outlined text-danger">monitoring</span>
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <div className="flex justify-between items-center mb-1">
              <p className="text-white text-base font-bold leading-tight tracking-tight">步数计数警报</p>
              <span className="text-[10px] text-white/40 font-mono">10:45</span>
            </div>
            <p className="text-white/60 text-sm font-normal leading-relaxed line-clamp-2">步数已连续4小时低于阈值。请确认状态。</p>
          </div>
          <div className="shrink-0 pt-1">
            <div className="size-2 rounded-full bg-danger animate-pulse"></div>
          </div>
        </div>

        {/* Success Notification */}
        <div className="flex items-start gap-4 bg-medical-panel/50 border border-white/5 rounded-xl px-4 py-4 transition-all active:scale-[0.98] hover:bg-medical-panel relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
          <div className="flex items-center justify-center rounded-lg bg-black shrink-0 size-12 border border-primary/30 shadow-[0_0_10px_rgba(57,255,20,0.3)]">
            <span className="material-symbols-outlined text-primary">shield_lock</span>
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <div className="flex justify-between items-center mb-1">
              <p className="text-white text-base font-bold leading-tight tracking-tight">遗嘱备份完成</p>
              <span className="text-[10px] text-white/40 font-mono">昨天</span>
            </div>
            <p className="text-white/60 text-sm font-normal leading-relaxed line-clamp-2">您的数字遗嘱已采用AES-256加密并备份至去中心化存储。</p>
          </div>
          <div className="shrink-0 pt-1">
            <div className="size-2 rounded-full bg-primary"></div>
          </div>
        </div>

        {/* Info Notification */}
        <div className="flex items-start gap-4 bg-medical-panel/50 border border-white/5 rounded-xl px-4 py-4 transition-all active:scale-[0.98] hover:bg-medical-panel relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
          <div className="flex items-center justify-center rounded-lg bg-black shrink-0 size-12 border border-primary/30 shadow-[0_0_10px_rgba(57,255,20,0.3)]">
            <span className="material-symbols-outlined text-primary">verified_user</span>
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <div className="flex justify-between items-center mb-1">
              <p className="text-white text-base font-bold leading-tight tracking-tight">联系人已验证</p>
              <span className="text-[10px] text-white/40 font-mono">14:15</span>
            </div>
            <p className="text-white/60 text-sm font-normal leading-relaxed line-clamp-2">紧急联系人“Sarah Chen”已完成生物特征验证。</p>
          </div>
          <div className="shrink-0 pt-1">
             <div className="size-2 rounded-full bg-primary"></div>
          </div>
        </div>

        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] px-1 py-2 mt-4">历史</p>
        
        <div className="flex items-start gap-4 bg-medical-panel/20 border border-white/5 rounded-xl px-4 py-4 opacity-60">
          <div className="flex items-center justify-center rounded-lg bg-black/50 shrink-0 size-12 border border-white/10">
            <span className="material-symbols-outlined text-white/40">key</span>
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <div className="flex justify-between items-center mb-1">
              <p className="text-white/80 text-base font-medium leading-tight tracking-tight">安全密钥轮换</p>
              <span className="text-[10px] text-white/40 font-mono">3天前</span>
            </div>
            <p className="text-white/40 text-sm font-normal leading-relaxed line-clamp-2">主设备的2FA密钥已成功轮换。</p>
          </div>
        </div>

        <div className="pt-8 flex flex-col items-center justify-center text-center px-8 opacity-20">
            <span className="material-symbols-outlined text-5xl mb-4">history_edu</span>
            <p className="text-[10px] font-bold uppercase tracking-widest">到底了</p>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;