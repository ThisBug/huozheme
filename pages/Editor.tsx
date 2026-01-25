import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';

const Editor: React.FC = () => {
  const navigate = useNavigate();
  const { will, updateWill, settings, updateSettings, addNotification } = useApp();
  const [content, setContent] = useState(will.content);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Identity Check Modal State
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempUserName, setTempUserName] = useState('');
  const [tempUserPhone, setTempUserPhone] = useState('');
  const [tempUserEmail, setTempUserEmail] = useState('');

  useEffect(() => {
    // Check for user name
    if (!settings.userName || !settings.userEmail) {
        setShowNameModal(true);
    }

    // Debounce save or just load initial
    if (!content && !will.content) {
        // Default template for Heritage Memo
        setContent(`【资产与实物遗嘱线索】

1. 我的实物遗嘱（手写且签名/公证处公证）：
   - 存放位置：[例如：书房保险柜/xx律师事务所]
   - 获取方式/钥匙位置：[例如：备用钥匙在xx处]

2. 商业保险单据：
   - 保险公司及保单号：[填写]
   
3. 银行与金融资产：
   - 主要存款银行：[填写]
   - 股票/基金账户：[填写]

4. 数字资产（仅留线索，勿直接明文写密码）：
   - 微信/支付宝/社交账号：[填写]
   - 电子设备解锁密码线索：[例如：生日+123]

5. 其他重要交代：
   - [填写]`);
    } else if (will.content) {
        setContent(will.content);
    }
  }, []); // Run on mount

  const handleSaveIdentity = () => {
      if (!tempUserName.trim() || !tempUserEmail.trim()) {
          alert('为激活云端服务，您的称呼和邮箱为必填项。');
          return;
      }
      updateSettings({ 
          userName: tempUserName.trim(),
          userPhone: tempUserPhone.trim(),
          userEmail: tempUserEmail.trim()
      });
      setShowNameModal(false);
      addNotification('信息补全', '下一步：请添加一位联系人以激活服务。', 'system');
      navigate('/add-contact');
  };

  const handleCloseIdentityModal = () => {
      setShowNameModal(false);
      navigate(-1); // Go back to the previous page
  };

  const handleAutoSave = (newContent: string) => {
      setContent(newContent);
      // Auto-save as draft (signed=false) when typing
      updateWill(newContent, false); 
      const now = new Date();
      setLastSaved(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
  };

  const handleComplete = () => {
      if (!content.trim()) {
          alert('备忘录内容不能为空');
          return;
      }
      // Save as signed
      updateWill(content, true);
      navigate('/manage');
  };

  return (
    <Layout showBottomNav={false}>
      {/* Identity Missing Modal */}
      {showNameModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
              <div className="bg-medical-panel border border-primary text-white p-6 rounded-xl shadow-[0_0_30px_rgba(57,255,20,0.2)] max-w-sm w-full animate-fade-in relative">
                   <button onClick={handleCloseIdentityModal} className="absolute top-2 right-2 size-8 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                       <span className="material-symbols-outlined">close</span>
                   </button>
                   <div className="flex items-center gap-2 mb-4 text-primary">
                      <span className="material-symbols-outlined text-2xl">badge</span>
                      <span className="font-bold text-lg uppercase tracking-wider">身份补全</span>
                   </div>
                   <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                       为激活云端服务，请先设置<strong>您的称呼</strong>及联系方式。
                       <br/><span className="text-xs text-slate-500">这确保了在紧急情况下，系统可以联系到您并正确识别您的身份。</span>
                   </p>
                   <div className="mb-4 space-y-3">
                       <input 
                           type="text" 
                           placeholder="输入您的姓名或昵称 *"
                           value={tempUserName}
                           onChange={(e) => setTempUserName(e.target.value)}
                           className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-white focus:border-primary focus:ring-0 outline-none transition-colors"
                           autoFocus
                       />
                       <input 
                           type="email" 
                           placeholder="本人邮箱 (必填) *"
                           value={tempUserEmail}
                           onChange={(e) => setTempUserEmail(e.target.value)}
                           className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-white focus:border-primary focus:ring-0 outline-none transition-colors"
                       />
                       <input 
                           type="tel" 
                           placeholder="本人手机号 (可选)"
                           value={tempUserPhone}
                           onChange={(e) => setTempUserPhone(e.target.value)}
                           className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-white focus:border-primary focus:ring-0 outline-none transition-colors"
                       />
                       <p className="text-xs text-slate-600 px-1">称呼和邮箱为激活服务的必填项</p>
                   </div>
                   <button 
                    onClick={handleSaveIdentity}
                    disabled={!tempUserName.trim() || !tempUserEmail.trim()}
                    className="w-full py-3 bg-primary text-black rounded-lg font-bold uppercase tracking-wider hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_rgba(57,255,20,0.3)]"
                   >
                    保存并继续
                   </button>
              </div>
          </div>
      )}

      <div className="relative flex h-full flex-col">
        {/* Header */}
        <header className="flex items-center bg-medical-dark p-4 pt-6 justify-between z-10 border-b border-primary/10 sticky top-0">
          <button onClick={() => navigate('/manage')} className="text-slate-400 hover:text-white flex size-12 shrink-0 items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center neon-glow">编辑备忘录</h2>
          <div className="w-12"></div> {/* Spacer to center title since right button is removed */}
        </header>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Disclaimer Box */}
          <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-3 mb-4 flex gap-3">
              <span className="material-symbols-outlined text-orange-500 text-xl shrink-0">gavel</span>
              <div className="flex flex-col gap-1">
                  <p className="text-orange-500 text-xs font-bold">中国地区法律效力提示</p>
                  <p className="text-orange-300/80 text-[10px] leading-relaxed">
                      纯电子遗嘱在中国法律效力存疑。请务必亲笔书写纸质遗嘱并签名注明日期的，或进行公证。
                      <br/>
                      <span className="text-orange-200 underline">此功能仅用于向联系人告知您实物遗嘱的存放地点及资产线索。</span>
                  </p>
              </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4 neon-border mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-full">
                <span className="material-symbols-outlined text-primary text-xl">encrypted</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-white text-sm font-bold leading-tight">安全加密</p>
                <p className="text-primary/70 text-xs font-normal">AES-256 本地存储</p>
              </div>
            </div>
            {!will.isSigned && (
                 <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-white/10">草稿中</span>
            )}
          </div>

          <label className="flex flex-col h-[60vh]">
            <p className="text-primary/40 text-xs font-mono uppercase tracking-widest pb-3">正文内容 (资产与遗嘱指引)</p>
            <textarea 
              className="flex-1 w-full resize-none border-none bg-transparent p-0 text-lg leading-relaxed text-slate-100 placeholder:text-white/20 focus:ring-0 font-serif" 
              placeholder="请在此记录您的实物遗嘱存放处、保险单据及数字资产线索..."
              value={content}
              onChange={(e) => handleAutoSave(e.target.value)}
            ></textarea>
          </label>
        </div>

        {/* Toolbar */}
        <div className="bg-medical-panel border-t border-primary/20 pb-6 fixed bottom-0 w-full max-w-[480px]">
          <div className="flex items-center justify-between gap-1 px-4 py-3">
            <div className="flex items-center gap-1">
               {lastSaved && <span className="text-[10px] text-primary/40 font-mono">上次保存 {lastSaved}</span>}
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleComplete}
                className="flex items-center justify-center rounded-lg h-9 bg-primary text-medical-dark px-4 gap-1 text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(57,255,20,0.3)]"
              >
                <span className="material-symbols-outlined text--[16px]">save</span>
                <span>保存并加密</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Editor;
