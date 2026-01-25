import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { status, toggleAuthorization, nukeUserData, settings, contacts, canSyncToServer } = useApp();
  const [agreed, setAgreed] = useState(false);
  const [showNukeModal, setShowNukeModal] = useState(false);

  // --- Prerequisite Checks ---
  const isUserInfoComplete = canSyncToServer();
  const hasContacts = contacts.length > 0;
  const allPrerequisitesMet = isUserInfoComplete && hasContacts;

  const handleAuthorize = () => {
      if (!agreed || !allPrerequisitesMet) return;
      toggleAuthorization(true);
      navigate('/settings');
  };

  const handleConfirmNuke = () => {
    setShowNukeModal(false);
    nukeUserData();
  };


  return (
    <div className="bg-medical-dark font-display text-white min-h-screen relative overflow-hidden flex flex-col">
       {/* Nuke Confirmation Modal */}
       {showNukeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-sm bg-medical-panel border border-danger/50 rounded-lg p-6 shadow-[0_0_30px_rgba(255,49,49,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-danger/20 via-danger to-danger/20"></div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-danger">delete_forever</span>
                      警告：销毁全部数据
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      此操作将彻底删除所有本地存储的数据，并将向云端服务器请求销毁您的账户。
                      <br/><br/>
                      <strong className="text-danger">此操作无法撤销。</strong>
                  </p>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setShowNukeModal(false)}
                        className="flex-1 py-3 border border-white/10 rounded font-bold text-slate-300 hover:bg-white/5 transition-colors"
                      >
                          取消
                      </button>
                      <button 
                        onClick={handleConfirmNuke}
                        className="flex-1 py-3 bg-danger/10 border border-danger/50 text-danger rounded font-bold hover:bg-danger/20 transition-colors shadow-[0_0_15px_rgba(255,49,49,0.2)]"
                      >
                          确认销毁
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 medical-grid opacity-30"></div>
      <div className="absolute top-40 left-0 w-full h-24 pointer-events-none opacity-20">
        <svg className="w-full h-full stroke-primary fill-none stroke-2" viewBox="0 800 100">
            <path d="M0 50 L100 50 L120 20 L140 80 L160 50 L250 50 L270 10 L290 90 L310 50 L500 50 L520 20 L540 80 L560 50 L800 50"></path>
        </svg>
      </div>

      <div className="flex items-center bg-transparent p-4 pb-2 justify-between z-10 sticky top-0">
        <button onClick={() => navigate(-1)} className="text-white flex size-12 shrink-0 items-center cursor-pointer hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">服务协议</h2>
      </div>

      <div className="flex flex-col flex-1 px-4 z-10 pb-10">
        <div className="pt-6">
            <h3 className="text-white tracking-light text-3xl font-bold leading-tight text-left">备忘录自动发送协议</h3>
            <p className="text-primary/70 text-xs font-mono mt-1 tracking-widest uppercase">协议编号: LW-MEMO-2024-CN</p>
        </div>

        <div className="flex gap-3 py-4 flex-wrap">
            <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary/10 border border-primary/30 px-3">
                <span className="material-symbols-outlined text-primary text-[18px]">send</span>
                <p className="text-primary text-sm font-medium leading-normal">自动投递</p>
            </div>
            <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white/5 border border-white/10 px-3">
                <span className="material-symbols-outlined text-white/70 text-[18px]">lock</span>
                <p className="text-white/70 text-sm font-medium leading-normal">隐私加密</p>
            </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-sm flex-1 mb-4 overflow-y-auto scrollbar-hide">
            <p className="text-white/90 text-sm leading-relaxed mb-4">
                本协议构成授权人与“活着么”平台之间关于【遗产备忘录】信息托管与自动发送的服务合同。
            </p>
            <p className="text-white/90 text-sm leading-relaxed mb-4">
                <strong className="text-primary">1. 触发机制：</strong> 当系统监测到用户生命体征或主动签到中断超过预设时长，并经过二次确认（Grace Period）无响应后，系统将自动向紧急联系人发送您预存的备忘录信息。
            </p>
            <p className="text-white/90 text-sm leading-relaxed mb-4">
                <strong className="text-primary">2. 法律效力免责：</strong> 
                <span className="text-orange-400"> 用户知悉并同意：本App所存储的“遗产备忘录”仅作为信息传递工具，不具备《中华人民共和国民法典》规定的遗嘱法律效力。</span>
                用户应自行通过书面自书遗嘱、公证遗嘱等法定形式处理财产继承事宜。本平台不对因用户未立有效遗嘱导致的继承纠纷承担责任。
            </p>
            <p className="text-white/90 text-sm leading-relaxed mb-4">
                <strong className="text-primary">3. 信息内容：</strong> 建议用户在备忘录中仅记录实物遗嘱的存放地点、保险单据线索、数字账号及其他非法律性事务交代。
            </p>

            <div className="w-full h-px bg-white/10 my-6"></div>

            <h4 className="text-xl font-bold text-white mb-3">隐私声明</h4>
             <p className="text-white/90 text-sm leading-relaxed mb-4">
                我们承诺保护您的隐私。以下是本应用收集和使用数据的方式：
            </p>
            <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5">vpn_key</span>
                    <div>
                        <strong className="text-white">唯一设备标识符 (UUID):</strong>
                        <p className="text-white/70 text-xs">用于在我们的服务器上匿名创建和识别您的账户，不与您的真实身份关联。</p>
                    </div>
                </li>
                 <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5">person</span>
                    <div>
                        <strong className="text-white">您的联系方式 (可选):</strong>
                        <p className="text-white/70 text-xs">您提供的昵称、邮箱、手机号仅用于系统在紧急情况下向您本人发送预警。</p>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5">contacts</span>
                    <div>
                        <strong className="text-white">联系人信息 (可选):</strong>
                        <p className="text-white/70 text-xs">您指定的联系人信息仅用于在协议触发后，代您向他们发送通知或备忘录。</p>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5">encrypted</span>
                    <div>
                        <strong className="text-white">备忘录内容 (可选):</strong>
                        <p className="text-white/70 text-xs">您的备忘录内容在本地进行加密存储，仅在协议触发后发送给您指定的资产对接人。</p>
                    </div>
                </li>
            </ul>
            <p className="text-white/80 text-xs italic opacity-70 mt-6">
                您的所有数据仅用于实现“活着么”的核心功能，我们绝不与任何无关第三方共享。您可以随时通过设置页面销毁所有云端和本地数据。
            </p>

        </div>

        {status.isAuthorized ? (
             <div className="py-6">
                <div className="bg-primary/10 border border-primary/30 rounded p-4 mb-4 text-center">
                    <span className="material-symbols-outlined text-primary text-4xl mb-2">check_circle</span>
                    <p className="text-primary font-bold">已授权发送</p>
                    <p className="text-xs text-primary/70 mt-1">授权时间：{new Date().toLocaleDateString()}</p>
                </div>
                <button 
                    onClick={() => setShowNukeModal(true)} 
                    className="w-full bg-danger/10 border border-danger/30 text-danger font-bold py-4 rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-danger/20"
                >
                    <span className="material-symbols-outlined font-bold">delete_forever</span>
                    <span className="text-lg">销毁全部数据</span>
                </button>
             </div>
        ) : (
            <>
                {/* --- Prerequisite Checklist --- */}
                {!allPrerequisitesMet && (
                    <div className="bg-medical-panel border border-primary/20 p-4 rounded-lg mb-4 space-y-3 animate-fade-in">
                        <h4 className="text-sm font-bold text-white mb-2">激活云端服务前置条件</h4>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`material-symbols-outlined text-sm ${isUserInfoComplete ? 'text-primary' : 'text-danger'}`}>
                                    {isUserInfoComplete ? 'check_circle' : 'cancel'}
                                </span>
                                <span className={`text-xs ${isUserInfoComplete ? 'text-slate-400' : 'text-white'}`}>补全您的个人信息 (称呼与邮箱)</span>
                            </div>
                            {!isUserInfoComplete && (
                                <button onClick={() => navigate('/settings')} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded border border-primary/30">前往设置</button>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`material-symbols-outlined text-sm ${hasContacts ? 'text-primary' : 'text-danger'}`}>
                                    {hasContacts ? 'check_circle' : 'cancel'}
                                </span>
                                <span className={`text-xs ${hasContacts ? 'text-slate-400' : 'text-white'}`}>添加至少一位联系人</span>
                            </div>
                            {!hasContacts && (
                                <button onClick={() => navigate('/manage', { state: { tab: 'contacts' } })} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded border border-primary/30">去添加</button>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="py-2">
                    <label className="flex gap-x-3 py-3 flex-row items-start cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-1 h-5 w-5 rounded border-primary/40 border-2 bg-transparent text-primary focus:ring-0 focus:ring-offset-0 focus:border-primary transition-colors" 
                        />
                        <p className="text-white/80 text-sm font-normal leading-tight group-hover:text-white transition-colors">
                            我已阅读并同意《隐私声明》，知悉本服务<span className="text-orange-400 font-bold">不具备遗嘱法律效力</span>，仅作为信息指引工具，并同意授权系统自动发送。
                        </p>
                    </label>
                </div>

                <button 
                    onClick={handleAuthorize} 
                    disabled={!agreed || !allPrerequisitesMet}
                    className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(57,255,20,0.3)] active:scale-[0.98] transition-all mt-2 ${agreed && allPrerequisitesMet ? 'bg-primary text-black hover:brightness-110' : 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'}`}
                >
                    <span className="material-symbols-outlined font-bold">fingerprint</span>
                    <span className="text-lg">确认授权</span>
                </button>
            </>
        )}
        
        <div className="flex items-center justify-center gap-2 mt-6 text-white/40 text-[10px] uppercase tracking-tighter">
            <span className="material-symbols-outlined text-[12px]">security</span>
            <span>端到端加密的安全信息托管</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;