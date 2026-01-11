import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Editor: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout showBottomNav={false}>
      <div className="relative flex h-full flex-col">
        {/* Header */}
        <header className="flex items-center bg-medical-dark p-4 pt-6 justify-between z-10 border-b border-primary/10 sticky top-0">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white flex size-12 shrink-0 items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center neon-glow">编辑遗嘱</h2>
          <div className="flex w-12 items-center justify-end">
            <button onClick={() => navigate(-1)} className="text-primary text-base font-bold leading-normal tracking-tight hover:opacity-80 transition-opacity">完成</button>
          </div>
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
          </div>

          <label className="flex flex-col h-[60vh]">
            <p className="text-primary/40 text-xs font-mono uppercase tracking-widest pb-3">正文内容</p>
            <textarea 
              className="flex-1 w-full resize-none border-none bg-transparent p-0 text-lg leading-relaxed text-slate-100 placeholder:text-white/20 focus:ring-0 font-serif" 
              placeholder="开始撰写您的遗嘱..."
              defaultValue={`我，[姓名已隐去]，神智清醒，特此声明此文件为我的最后遗嘱。\n\n关于我的数字资产：\n我希望将我的社交媒体账户访问权限移交给[主要联系人]。\n\n关于我的个人档案：\n我希望能将我的数字图书馆捐赠给本地大学...`}
            ></textarea>
          </label>
        </div>

        {/* Toolbar */}
        <div className="bg-medical-panel border-t border-primary/20 pb-6 fixed bottom-0 w-full max-w-[480px]">
          <div className="flex items-center justify-between gap-1 px-4 py-2">
            <div className="flex items-center gap-1">
              <button className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">format_size</span></button>
              <button className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">format_bold</span></button>
              <button className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">format_list_bulleted</span></button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-primary/40 mr-2 font-mono">自动保存 14:20</span>
              <button className="flex items-center justify-center rounded-lg h-8 bg-primary text-medical-dark px-3 gap-1 text-xs font-bold hover:brightness-110 transition-all">
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>预览</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Editor;