import React from 'react';
import { useNavigate } from 'react-router-dom';

const Auth: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-medical-dark font-display text-white min-h-screen relative overflow-hidden flex flex-col">
       {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 medical-grid opacity-30"></div>
      <div className="absolute top-40 left-0 w-full h-24 pointer-events-none opacity-20">
        <svg className="w-full h-full stroke-primary fill-none stroke-2" viewBox="0 0 800 100">
            <path d="M0 50 L100 50 L120 20 L140 80 L160 50 L250 50 L270 10 L290 90 L310 50 L500 50 L520 20 L540 80 L560 50 L800 50"></path>
        </svg>
      </div>

      <div className="flex items-center bg-transparent p-4 pb-2 justify-between z-10 sticky top-0">
        <button onClick={() => navigate(-1)} className="text-white flex size-12 shrink-0 items-center cursor-pointer hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">授权</h2>
      </div>

      <div className="flex flex-col flex-1 px-4 z-10 pb-10">
        <div className="pt-6">
            <h3 className="text-white tracking-light text-3xl font-bold leading-tight text-left">遗产执行协议</h3>
            <p className="text-primary/70 text-xs font-mono mt-1 tracking-widest uppercase">协议编号: LW-SIGN-2024-X</p>
        </div>

        <div className="flex gap-3 py-4 flex-wrap">
            <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary/10 border border-primary/30 px-3">
                <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                <p className="text-primary text-sm font-medium leading-normal">法律约束力</p>
            </div>
            <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white/5 border border-white/10 px-3">
                <span className="material-symbols-outlined text-white/70 text-[18px]">lock</span>
                <p className="text-white/70 text-sm font-medium leading-normal">AES-256</p>
            </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-sm flex-1 mb-4 overflow-y-auto">
            <p className="text-white/90 text-sm leading-relaxed mb-4">
                本协议构成授权人与“活着么”平台之间关于数字资产处理和遗产执行的法律合同。
            </p>
            <p className="text-white/90 text-sm leading-relaxed mb-4">
                <strong className="text-primary">1. 触发条件：</strong> 在未能检测到生命体征达到预设持续时间（例如180天）且二次人工验证失败时，激活此协议。
            </p>
            <p className="text-white/90 text-sm leading-relaxed mb-4">
                <strong className="text-primary">2. 法律效力：</strong> 授权人确认，此数字签署的协议在有效管辖区内具有与实体遗嘱同等的法律效力。
            </p>
            <p className="text-white/90 text-sm leading-relaxed mb-4">
                <strong className="text-primary">3. 执行：</strong> 平台将自动或在执行人监督下分发数字密钥和指令。
            </p>
            <p className="text-white/80 text-xs italic opacity-70 mt-6">
                注意：一旦签署，指令将被锁定在加密保险箱中。您可以在触发条件满足前的任何时间撤销授权。
            </p>
        </div>

        <div className="py-2">
            <label className="flex gap-x-3 py-3 flex-row items-start cursor-pointer group">
                <input type="checkbox" className="mt-1 h-5 w-5 rounded border-primary/40 border-2 bg-transparent text-primary focus:ring-0 focus:ring-offset-0 focus:border-primary transition-colors" />
                <p className="text-white/80 text-sm font-normal leading-tight group-hover:text-white transition-colors">
                    我已阅读并完全理解“遗产执行协议”的条款，并同意其执行。
                </p>
            </label>
        </div>

         <button onClick={() => navigate(-1)} className="w-full bg-primary text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(57,255,20,0.3)] active:scale-[0.98] transition-all hover:brightness-110 mt-2">
            <span className="material-symbols-outlined font-bold">fingerprint</span>
            <span className="text-lg">立即授权</span>
        </button>
        
        <div className="flex items-center justify-center gap-2 mt-6 text-white/40 text-[10px] uppercase tracking-tighter">
            <span className="material-symbols-outlined text-[12px]">security</span>
            <span>端到端加密的安全生物特征授权</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;