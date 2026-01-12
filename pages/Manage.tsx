import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';

const Manage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { contacts, will, deleteContact } = useApp();
  const [activeTab, setActiveTab] = useState<'will' | 'contacts'>('will');

  // Check for navigation state to switch tabs (e.g., returning from AddContact)
  useEffect(() => {
    if (location.state && (location.state as any).tab) {
        setActiveTab((location.state as any).tab);
    }
  }, [location]);

  // Swipe logic state
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  const hasWill = will.content.length > 0;

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    if (!touchStartX.current) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // Threshold for swipe left (e.g., 50px)
    if (diff > 50) {
      setOpenSwipeId(id);
    } else if (diff < -50) {
      // Swipe right to close
      if (openSwipeId === id) setOpenSwipeId(null);
    }
    
    touchStartX.current = null;
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation(); // Prevent navigation
      setContactToDelete(id);
      setShowDeleteModal(true);
  };

  const executeDelete = () => {
      if (contactToDelete) {
          deleteContact(contactToDelete);
          setContactToDelete(null);
          setOpenSwipeId(null);
          setShowDeleteModal(false);
      }
  };

  const handleContactClick = (id: string) => {
      // Don't navigate if swiping
      if (openSwipeId === id) {
          setOpenSwipeId(null);
          return;
      }
      navigate(`/add-contact?id=${id}`);
  };

  return (
    <Layout>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-sm bg-medical-panel border border-danger/50 rounded-lg p-6 shadow-[0_0_30px_rgba(255,49,49,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-danger/20 via-danger to-danger/20"></div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-danger">warning</span>
                      确认移除
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      此操作将永久移除该联系人并撤销其所有访问权限。此操作无法撤销。
                  </p>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 py-3 border border-white/10 rounded font-bold text-slate-300 hover:bg-white/5 transition-colors"
                      >
                          取消
                      </button>
                      <button 
                        onClick={executeDelete}
                        className="flex-1 py-3 bg-danger/10 border border-danger/50 text-danger rounded font-bold hover:bg-danger/20 transition-colors shadow-[0_0_15px_rgba(255,49,49,0.2)]"
                      >
                          确认移除
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-medical-dark/90 backdrop-blur-md p-4 border-b border-primary/20 justify-between">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-3xl text-primary neon-glow">description</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-lg font-bold leading-tight tracking-[0.2em] text-primary neon-glow uppercase">活着么</h2>
          <span className="text-[10px] text-slate-400 font-mono">遗产管理</span>
        </div>
        <div className="flex w-12 items-center justify-end">
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Tabs */}
        <div className="flex p-1 bg-medical-panel border border-white/10 rounded-lg mb-6">
          <button 
            onClick={() => setActiveTab('will')}
            className={`flex-1 py-2 text-sm font-bold rounded transition-all ${activeTab === 'will' ? 'bg-primary/20 text-primary border border-primary/40 shadow-[0_0_10px_rgba(57,255,20,0.1)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            我的遗嘱
          </button>
          <button 
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-2 text-sm font-bold rounded transition-all ${activeTab === 'contacts' ? 'bg-primary/20 text-primary border border-primary/40 shadow-[0_0_10px_rgba(57,255,20,0.1)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            联系人
          </button>
        </div>

        {activeTab === 'will' ? (
          <div className="space-y-4 animate-fade-in">
            {hasWill ? (
              <div className="neon-border bg-medical-panel/80 p-5 rounded-lg flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-primary/70 tracking-widest uppercase">归档编号: {will.id || 'PENDING'}</span>
                    <h3 className="text-xl font-bold text-white mt-1">最后遗愿与遗嘱</h3>
                  </div>
                  {will.isSigned ? (
                    <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 border border-primary/30 rounded">
                        <span className="material-symbols-outlined text-[14px] text-primary">verified_user</span>
                        <span className="text-[10px] font-bold text-primary">已签署</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 border border-white/10 rounded">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">edit_note</span>
                        <span className="text-[10px] font-bold text-slate-300">草稿</span>
                    </div>
                  )}
                </div>
                <div className="h-32 bg-black/40 border border-white/5 p-3 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-medical-panel/90 z-10 pointer-events-none"></div>
                  <p className="text-[11px] font-mono text-slate-400 leading-relaxed text-justify whitespace-pre-wrap">
                    {will.content}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">最后修改</span>
                    <span className="text-[12px] font-mono text-slate-300">{will.lastUpdated ? new Date(will.lastUpdated).toLocaleString() : 'N/A'}</span>
                  </div>
                  <button 
                    onClick={() => navigate('/editor')}
                    className="flex items-center gap-2 bg-primary px-4 py-2 rounded text-black font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-[0_0_10px_rgba(57,255,20,0.3)]"
                  >
                    <span className="material-symbols-outlined text-sm">edit_note</span>
                    编辑遗嘱
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                  <div className="size-20 rounded-full bg-medical-dark border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                      <span className="material-symbols-outlined text-4xl text-slate-600">history_edu</span>
                  </div>
                  <p className="text-slate-300 text-base font-bold mb-2">暂无遗嘱档案</p>
                  <p className="text-slate-500 text-xs text-center mb-8 max-w-[240px] leading-relaxed">
                      您尚未创建数字遗嘱。
                      <br/>
                      创建一份以确保您的数字资产、社交账号及隐私数据得到妥善处理。
                  </p>
                  <button 
                      onClick={() => navigate('/editor')}
                      className="flex items-center gap-2 bg-primary px-8 py-3 rounded-lg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] group"
                  >
                      <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">add_circle</span>
                      创建新遗嘱
                  </button>
              </div>
            )}

             <div className="flex justify-between items-center mt-4 px-1">
                 <button onClick={() => navigate('/auth')} className="text-xs text-primary/70 hover:text-primary underline font-mono cursor-pointer">查看法律授权协议</button>
             </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in relative overflow-hidden min-h-[400px]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono text-primary/70 tracking-[0.2em] uppercase">紧急联系人</h4>
              <span className="text-[10px] font-mono text-slate-500">{contacts.length}/3 (最大)</span>
            </div>

            {contacts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">暂无紧急联系人，请添加。</div>
            ) : (
                contacts.map((contact) => (
                <div 
                    key={contact.id} 
                    className="relative overflow-hidden rounded-r-lg group"
                    onTouchStart={(e) => handleTouchStart(e, contact.id)}
                    onTouchEnd={(e) => handleTouchEnd(e, contact.id)}
                    onClick={() => handleContactClick(contact.id)}
                >
                    {/* Background Delete Button (revealed on slide) */}
                    <div className={`absolute inset-y-0 right-0 w-24 bg-danger/20 flex items-center justify-center transition-all duration-300 border-l border-danger/30 z-0 ${openSwipeId === contact.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
                        <button 
                            onClick={(e) => confirmDelete(e, contact.id)}
                            className="flex flex-col items-center justify-center size-full text-danger hover:bg-danger/30 transition-colors"
                        >
                            <span className="material-symbols-outlined mb-1">delete</span>
                            <span className="text-[10px] font-bold">删除</span>
                        </button>
                    </div>

                    {/* Foreground Content */}
                    <div 
                        className={`bg-medical-panel border-l-2 ${contact.status === 'verified' ? 'border-l-primary' : 'border-l-slate-600'} border border-white/10 p-4 rounded-r-lg hover:bg-white/5 transition-transform duration-300 z-10 relative bg-medical-panel active:bg-white/5`}
                        style={{ transform: openSwipeId === contact.id ? 'translateX(-96px)' : 'translateX(0)' }}
                    >
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center`}>
                              <span className="font-bold text-slate-400 text-sm">{contact.name.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <div>
                            <p className={`text-sm font-bold ${contact.status === 'verified' ? 'text-white' : 'text-slate-400'}`}>{contact.name}</p>
                            <p className="text-[10px] font-mono text-slate-500">{contact.role}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1.5">
                            <div className={`size-2 rounded-full ${contact.status === 'verified' ? 'bg-primary animate-pulse shadow-[0_0_5px_#39ff14]' : 'bg-slate-600'}`}></div>
                            <span className={`text-[10px] font-bold ${contact.status === 'verified' ? 'text-primary' : 'text-slate-600'}`}>
                                {contact.status === 'verified' ? '有效' : '待定'}
                            </span>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
                ))
            )}

            <button 
              onClick={() => navigate('/add-contact')}
              className="w-full py-4 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center gap-2 text-slate-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all mt-6"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span className="text-xs font-bold uppercase tracking-widest">添加新联系人</span>
            </button>
            
            <p className="text-center text-[10px] text-slate-600 mt-4 italic">左滑联系人卡片可进行删除，点击卡片可编辑</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Manage;