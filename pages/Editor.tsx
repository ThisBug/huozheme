import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';

const Editor: React.FC = () => {
  const navigate = useNavigate();
  const { will, updateWill } = useApp();
  const [content, setContent] = useState(will.content);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    // Debounce save or just load initial
    if (!content && !will.content) {
        // Default template
        setContent(`我，[姓名已隐去]，神智清醒，特此声明此文件为我的最后遗嘱。\n\n关于我的数字资产：\n我希望将我的社交媒体账户访问权限移交给[主要联系人]。\n\n关于我的个人档案：\n我希望能将我的数字图书馆捐赠给本地大学...`);
    } else if (will.content) {
        setContent(will.content);
    }
  }, []);

  const handleAutoSave = (newContent: string) => {
      setContent(newContent);
      // Auto-save as draft (signed=false) when typing
      updateWill(newContent, false); 
      const now = new Date();
      setLastSaved(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
  };

  const handleComplete = () => {
      if (!content.trim()) {
          alert('遗嘱内容不能为空');
          return;
      }
      // Save as signed
      updateWill(content, true);
      navigate('/manage');
  };

  return (
    <Layout showBottomNav={false}>
      <div className="relative flex h-full flex-col">
        {/* Header */}
        <header className="flex items-center bg-medical-dark p-4 pt-6 justify-between z-10 border-b border-primary/10 sticky top-0">
          <button onClick={() => navigate('/manage')} className="text-slate-400 hover:text-white flex size-12 shrink-0 items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center neon-glow">编辑遗嘱</h2>
          <div className="w-12"></div> {/* Spacer to center title since right button is removed */}
        </header>

        {/* Content */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4 neon-border mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-full">
                <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-white text-sm font-bold leading-tight">法律签署</p>
                <p className="text-primary/70 text-xs font-normal">受数字签名保护</p>
              </div>
            </div>
            {!will.isSigned && (
                 <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-white/10">草稿中</span>
            )}
          </div>

          <label className="flex flex-col h-[60vh]">
            <p className="text-primary/40 text-xs font-mono uppercase tracking-widest pb-3">正文内容</p>
            <textarea 
              className="flex-1 w-full resize-none border-none bg-transparent p-0 text-lg leading-relaxed text-slate-100 placeholder:text-white/20 focus:ring-0 font-serif" 
              placeholder="开始撰写您的遗嘱..."
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
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>完成</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Editor;