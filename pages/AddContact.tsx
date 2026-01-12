import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { Contact } from '../types';
import { CommunicationService } from '../services/communication';

const AddContact: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addContact, updateContact, contacts, addNotification } = useApp();
  
  const editId = searchParams.get('id');
  const isEditing = !!editId;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('紧急联系人');
  const [isPriority, setIsPriority] = useState(true);

  // Custom Error Modal State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
        const contact = contacts.find(c => c.id === editId);
        if (contact) {
            setName(contact.name);
            setPhone(contact.phone);
            setEmail(contact.email);
            setRole(contact.role);
            setIsPriority(contact.priority);
        }
    }
  }, [editId, contacts, isEditing]);

  const validatePhone = (phoneStr: string) => {
      // Strict 11-digit mobile number starting with 1
      return /^1\d{10}$/.test(phoneStr);
  };

  const validateEmail = (emailStr: string) => {
      // Standard email regex
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handlePhoneBlur = () => {
      if (phone.trim().length > 0 && !validatePhone(phone.trim())) {
          setErrorMsg('电话号码格式错误。\n请输入11位数字手机号（以1开头）。');
      }
  };

  const handleEmailBlur = () => {
      if (email.trim().length > 0 && !validateEmail(email.trim())) {
          setErrorMsg('邮箱地址格式不正确。\n请检查是否缺少 @ 或域名后缀。\n示例: user@example.com');
      }
  };

  const handleSubmit = async () => {
      // Limit check for new contacts
      if (!isEditing && contacts.length >= 3) {
          setErrorMsg('最多只能设置3位紧急联系人。\n请先删除现有联系人。');
          return;
      }

      if (!name.trim()) {
          setErrorMsg('请输入联系人姓名。');
          return;
      }

      const hasPhone = phone.trim().length > 0;
      const hasEmail = email.trim().length > 0;

      if (!hasPhone && !hasEmail) {
          setErrorMsg('请至少填写一种联系方式（电话或邮箱）。');
          return;
      }

      if (hasPhone && !validatePhone(phone.trim())) {
          setErrorMsg('电话号码格式错误，仅支持11位手机号（以1开头）。');
          return;
      }

      if (hasEmail && !validateEmail(email.trim())) {
          setErrorMsg('邮箱地址格式不正确，请修改。');
          return;
      }

      const contactData: Contact = {
          id: isEditing && editId ? editId : Date.now().toString(),
          name,
          phone,
          email,
          role,
          priority: isPriority,
          status: 'verified' // Default to verified per requirements
      };

      if (isEditing) {
          updateContact(contactData);
          addNotification('联系人更新', `联系人 ${name} 的资料已更新。`, 'system');
      } else {
          addContact(contactData);
          addNotification('联系人添加', `已添加 ${name} 为紧急联系人。`, 'system');
          
          // Trigger dummy communication only on add
          if (phone) CommunicationService.sendSMS({ to: phone, body: `You have been added as an emergency contact for ${name}.` });
          if (email) CommunicationService.sendEmail({ to: email, subject: 'Emergency Contact Verification', body: `You are now a verified contact.` });
      }

      // Navigate back to the Manage->Contacts tab
      navigate('/manage', { state: { tab: 'contacts' } });
  };

  const handleBack = () => {
    navigate('/manage', { state: { tab: 'contacts' } });
  };

  return (
    <Layout showBottomNav={false}>
      {/* Custom Error Modal */}
      {errorMsg && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
              <div className="bg-medical-panel border border-danger text-white p-6 rounded-xl shadow-[0_0_20px_rgba(255,49,49,0.3)] max-w-xs w-full">
                   <div className="flex items-center gap-2 mb-3 text-danger">
                      <span className="material-symbols-outlined">error</span>
                      <span className="font-bold text-lg">校验提示</span>
                   </div>
                   <p className="text-sm text-slate-300 mb-6 leading-relaxed whitespace-pre-line">{errorMsg}</p>
                   <button 
                    onClick={() => setErrorMsg(null)} 
                    className="w-full py-3 bg-danger text-white rounded-lg font-bold uppercase tracking-wider hover:bg-danger/80 transition-colors shadow-[0_0_10px_rgba(255,49,49,0.2)]"
                   >
                    确认
                   </button>
              </div>
          </div>
      )}

      <div className="sticky top-0 z-50 flex items-center bg-medical-dark/90 backdrop-blur-md p-4 border-b border-primary/20">
        <button onClick={handleBack} className="flex size-10 items-center justify-center rounded bg-medical-panel border border-white/10 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-xl">chevron_left</span>
        </button>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-lg font-bold leading-tight tracking-[0.1em] text-white">{isEditing ? '编辑联系人' : '添加联系人'}</h2>
          <span className="text-[10px] text-primary/70 font-mono uppercase tracking-widest">{isEditing ? '更新资料' : '新条目'}</span>
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
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 ml-1 group-focus-within:text-primary transition-colors">姓名 *</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-medical-panel/60 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-slate-700 focus:ring-0 focus:border-primary focus:shadow-[0_0_10px_rgba(57,255,20,0.1)] transition-all font-medium" 
                placeholder="法定全名" 
              />
            </div>
            <div className="relative group">
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 ml-1 group-focus-within:text-primary transition-colors">电话</label>
              <input 
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onBlur={handlePhoneBlur}
                className="w-full bg-medical-panel/60 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-slate-700 focus:ring-0 focus:border-primary focus:shadow-[0_0_10px_rgba(57,255,20,0.1)] transition-all font-mono" 
                placeholder="1XX XXXX XXXX" 
              />
              <p className="text-[9px] text-slate-600 mt-1 ml-1">电话或邮箱必填一项</p>
            </div>
            <div className="relative group">
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 ml-1 group-focus-within:text-primary transition-colors">邮箱</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                className="w-full bg-medical-panel/60 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-slate-700 focus:ring-0 focus:border-primary focus:shadow-[0_0_10px_rgba(57,255,20,0.1)] transition-all font-mono" 
                placeholder="contact@example.com" 
              />
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
              <input 
                type="radio" 
                name="role" 
                checked={role === '紧急联系人'} 
                onChange={() => setRole('紧急联系人')} 
                className="hidden peer" 
              />
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-medical-panel border border-white/10 peer-checked:border-primary/50 peer-checked:bg-primary/5 transition-all text-center h-full hover:border-white/20">
                <span className="material-symbols-outlined text-slate-500 group-hover:text-primary mb-2 peer-checked:text-primary">emergency_home</span>
                <span className="text-sm font-bold text-slate-300 peer-checked:text-primary">紧急联系人</span>
                <span className="text-[9px] text-slate-500 mt-1">状态确认</span>
              </div>
            </label>
            <label className="cursor-pointer group">
              <input 
                type="radio" 
                name="role" 
                checked={role === '受益人'} 
                onChange={() => setRole('受益人')} 
                className="hidden peer" 
              />
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
            <input 
                type="checkbox" 
                checked={isPriority}
                onChange={e => setIsPriority(e.target.checked)}
                className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
          </label>
        </div>

        <div className="flex gap-3 px-2">
          <span className="material-symbols-outlined text-primary/50 text-lg">info</span>
          <p className="text-[10px] text-slate-500 leading-relaxed italic">
            添加后该联系人状态将直接标记为“有效”。
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-[480px] z-50 bg-medical-dark/95 backdrop-blur-xl border-t border-primary/20 px-6 py-6 pb-10">
        <button onClick={handleSubmit} className="w-full py-4 bg-primary rounded text-black font-black text-sm uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined font-bold">{isEditing ? 'save' : 'person_add'}</span>
          {isEditing ? '保存修改' : '确认添加'}
        </button>
      </div>
    </Layout>
  );
};

export default AddContact;