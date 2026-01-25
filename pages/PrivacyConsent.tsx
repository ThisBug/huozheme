import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const PrivacyConsent: React.FC = () => {
  const { acceptPrivacyPolicy } = useApp();
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="bg-medical-dark font-display text-white min-h-screen relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 medical-grid opacity-30"></div>
      <div className="absolute top-1/4 -right-20 size-60 rounded-full bg-primary/5 blur-[100px]"></div>
      <div className="absolute bottom-1/4 -left-20 size-60 rounded-full bg-primary/5 blur-[100px]"></div>

      <div className="flex flex-col flex-1 px-4 z-10 pb-10 pt-16">
        <div className="text-center mb-10">
            <span className="material-symbols-outlined text-6xl text-primary neon-glow mb-4">health_and_safety</span>
            <h1 className="text-white tracking-light text-3xl font-bold leading-tight">服务条款与隐私政策</h1>
            <p className="text-primary/70 text-xs font-mono mt-2 tracking-widest uppercase">请在使用前阅读并同意</p>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-sm flex-1 mb-4 overflow-y-auto scrollbar-hide">
            <h2 className="text-lg font-bold text-primary mb-4">欢迎使用“活着么”</h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
                本应用旨在提供一个自动化的“活着么”服务，以在您无法响应时，根据您的预设，安全地通知您的联系人并移交重要信息。为实现此功能，我们需要收集和处理特定数据。
            </p>

            <h3 className="text-base font-bold text-white mb-3">我们收集的数据</h3>
             <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5">vpn_key</span>
                    <div>
                        <strong className="text-white">唯一设备标识符 (UUID):</strong>
                        <p className="text-white/70 text-xs">用于在我们的服务器上匿名创建和识别您的账户，不与您的真实身份关联。</p>
                    </div>
                </li>
                 <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5">person</span>
                    <div>
                        <strong className="text-white">您的联系方式 (可选):</strong>
                        <p className="text-white/70 text-xs">您提供的昵称、邮箱、手机号仅用于系统在紧急情况下向您本人发送预警。如果您不提供，云端服务将不会激活。</p>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5">contacts</span>
                    <div>
                        <strong className="text-white">联系人信息 (可选):</strong>
                        <p className="text-white/70 text-xs">您指定的联系人信息仅用于在协议触发后，代您向他们发送通知或备忘录。</p>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5">encrypted</span>
                    <div>
                        <strong className="text-white">备忘录内容 (可选):</strong>
                        <p className="text-white/70 text-xs">您的备忘录内容在本地进行加密存储，仅在协议触发后发送给您指定的资产对接人。</p>
                    </div>
                </li>
            </ul>

            <h3 className="text-base font-bold text-white mt-6 mb-3">数据的使用与安全</h3>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
                您的所有数据仅用于实现“活着么”的核心功能。我们承诺不与任何无关第三方共享您的数据。您可以随时通过“设置”页面中的“擦除本地数据”功能，一键销毁您在云端和本地的所有数据。
            </p>
        </div>

        <div>
            <label className="flex gap-x-3 py-3 flex-row items-start cursor-pointer group">
                <input 
                    type="checkbox" 
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-primary/40 border-2 bg-transparent text-primary focus:ring-0 focus:ring-offset-0 focus:border-primary transition-colors" 
                />
                <p className="text-white/80 text-sm font-normal leading-tight group-hover:text-white transition-colors">
                    我已阅读并完全同意《服务条款与隐私政策》。
                </p>
            </label>
        </div>

        <button 
            onClick={acceptPrivacyPolicy} 
            disabled={!agreed}
            className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(57,255,20,0.3)] active:scale-[0.98] transition-all mt-4 ${agreed ? 'bg-primary text-black hover:brightness-110' : 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'}`}
        >
            <span className="text-lg uppercase tracking-widest">开始使用</span>
        </button>
      </div>
    </div>
  );
};

export default PrivacyConsent;