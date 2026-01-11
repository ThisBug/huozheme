import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const AddContact: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout showBottomNav={false}>
      <div className="sticky top-0 z-50 flex items-center bg-medical-dark/90 backdrop-blur-md p-4 border-b border-primary/20">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded bg-medical-panel border border-white/10 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-xl">chevron_left</span>
        </button>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-lg font-bold leading-tight tracking-[0.1em] text-white">添加联系人</h2>
          <span className="text-[10px] text-primary/70 font-mono uppercase tracking-widest">新条目</span>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="px-6 py-8 pb-32 space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-3 bg-primary shadow-[0_0_5px_#39ff14]"></span>
            <h4 className="text-[10px] font-mono text-primary/70 tracking-[0.2em] uppercase">资料</h4>
          </div>
          <div className="space-y-6">
            <div className="relative group">
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 ml-1 group-focus-within:text-primary transition-colors">姓名</label>
              <input type="text" className="w-full bg-medical-panel/60 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-slate-700 focus:ring-0 focus:border-primary focus:shadow-[0_0_10px_rgba(57,255,20,0.1)] transition-all font-medium" placeholder="法定全名" />
            </div>
            <div className="relative group">
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 ml-1 group-focus-within:text-primary transition-colors">电话</label>
              <input type="tel" className="w-full bg-medical-panel/60 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-slate-700 focus:ring-0 focus:border-primary focus:shadow-[0_0_10px_rgba(57,255,20,0.1)] transition-all font-mono" placeholder="+86 1XX XXXX XXXX" />
            </div>
            <div className="relative group">
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 ml-1 group-focus-within:text-primary transition-colors">邮箱</label>
              <input type="email" className="w-full bg-medical-panel/60 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-slate-700 focus:ring-0 focus:border-primary focus:shadow-[0_0_10px_rgba(57,255,20,0.1)] transition-all font-mono" placeholder="contact@example.com" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-3 bg-primary shadow-[0_0_5px_#39ff14]"></span>
            <h4 className="text-[10px] font-mono text-primary/70 tracking-[0.2em] uppercase">角色</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="cursor-pointer group">
              <input type="radio" name="role" className="hidden peer" defaultChecked />
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-medical-panel border border-white/10 peer-checked:border-primary/50 peer-checked:bg-primary/5 transition-all text-center h-full hover:border-white/20">
                <span className="material-symbols-outlined text-slate-500 group-hover:text-primary mb-2 peer-checked:text-primary">emergency_home</span>
                <span className="text-sm font-bold text-slate-300 peer-checked:text-primary">紧急联系人</span>
                <span className="text-[9px] text-slate-500 mt-1">状态确认</span>
              </div>
            </label>
            <label className="cursor-pointer group">
              <input type="radio" name="role" className="hidden peer" />
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-medical-panel border border-white/10 peer-checked:border-primary/50 peer-checked:bg-primary/5 transition-all text-center h-full hover:border-white/20">
                <span className="material-symbols-outlined text-slate-500 group-hover:text-primary mb-2 peer-checked:text-primary">contract</span>
                <span className="text-sm font-bold text-slate-300 peer-checked:text-primary">受益人</span>
                <span className="text-[9px] text-slate-500 mt-1">资产继承</span>
              </div>
            </label>
          </div>
        </div>

        <div className="neon-border bg-medical-panel/40 p-4 rounded-lg flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">高优先级</span>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">优先联系</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
          </label>
        </div>

        <div className="flex gap-3 px-2">
          <span className="material-symbols-outlined text-primary/50 text-lg">info</span>
          <p className="text-[10px] text-slate-500 leading-relaxed italic">
            系统将向此联系人发送验证链接。仅在您的生命体征停止达到预设时间后，才授予数据访问权限。
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-[480px] z-50 bg-medical-dark/95 backdrop-blur-xl border-t border-primary/20 px-6 py-6 pb-10">
        <button onClick={() => navigate(-1)} className="w-full py-4 bg-primary rounded text-black font-black text-sm uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined font-bold">person_add</span>
          确认添加
        </button>
      </div>
    </Layout>
  );
};

export default AddContact;