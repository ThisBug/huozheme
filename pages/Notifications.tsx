import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markAllNotificationsRead, markNotificationRead } = useApp();
  const [filter, setFilter] = useState<'all' | 'system' | 'emergency'>('all');

  const filteredNotifications = notifications.filter(n => {
      if (filter === 'all') return true;
      return n.category === filter;
  });

  return (
    <Layout showBottomNav={false}>
      <div className="flex items-center bg-medical-dark/90 backdrop-blur-md p-4 pb-2 justify-between sticky top-0 z-50 border-b border-white/10">
        <button onClick={() => navigate(-1)} className="text-white flex size-12 shrink-0 items-center justify-center cursor-pointer hover:text-primary transition-colors">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <h2 className="text-white text-lg font-bold leading-tight tracking-wider flex-1 text-center uppercase">通知中心</h2>
        <div className="flex w-12 items-center justify-end">
          <button 
            onClick={markAllNotificationsRead}
            className="text-primary hover:text-white transition-colors"
            title="全部已读"
          >
            <span className="material-symbols-outlined neon-glow">playlist_add_check</span>
          </button>
        </div>
      </div>

      <div className="flex px-4 py-4 sticky top-[60px] bg-medical-dark/95 backdrop-blur-sm z-40">
        <div className="flex h-11 flex-1 items-center justify-center rounded-xl bg-medical-panel p-1 border border-white/5 shadow-inner">
          <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-primary has-[:checked]:text-black text-white/50 text-xs font-bold uppercase transition-all">
            <span className="truncate">全部</span>
            <input type="radio" name="category" value="all" className="hidden" checked={filter === 'all'} onChange={() => setFilter('all')} />
          </label>
          <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-primary has-[:checked]:text-black text-white/50 text-xs font-bold uppercase transition-all">
            <span className="truncate">系统</span>
            <input type="radio" name="category" value="system" className="hidden" checked={filter === 'system'} onChange={() => setFilter('system')} />
          </label>
          <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-primary has-[:checked]:text-black text-white/50 text-xs font-bold uppercase transition-all">
            <span className="truncate">紧急</span>
            <input type="radio" name="category" value="emergency" className="hidden" checked={filter === 'emergency'} onChange={() => setFilter('emergency')} />
          </label>
        </div>
      </div>

      <div className="flex-1 px-4 pb-10 space-y-3 animate-fade-in">
        <p className="text-primary/60 text-[10px] font-bold uppercase tracking-[0.2em] px-1 py-2">最近</p>
        
        {filteredNotifications.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm">暂无此类通知</div>
        )}

        {filteredNotifications.map(notification => (
            <div 
                key={notification.id} 
                onClick={() => markNotificationRead(notification.id)}
                className={`flex items-start gap-4 bg-medical-panel/50 border ${notification.read ? 'border-white/5 opacity-60' : 'border-white/20 cursor-pointer hover:bg-medical-panel'} rounded-xl px-4 py-4 transition-all active:scale-[0.98] relative group overflow-hidden`}
            >
                {notification.category === 'emergency' && (
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-danger"></div>
                )}
                <div className={`flex items-center justify-center rounded-lg bg-black shrink-0 size-12 border ${notification.category === 'emergency' ? 'border-danger/30 shadow-[0_0_10px_rgba(255,49,49,0.3)]' : 'border-primary/30 shadow-[0_0_10px_rgba(57,255,20,0.3)]'}`}>
                    <span className={`material-symbols-outlined ${notification.category === 'emergency' ? 'text-danger' : 'text-primary'}`}>
                        {notification.category === 'emergency' ? 'monitoring' : 'notifications'}
                    </span>
                </div>
                <div className="flex flex-1 flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                    <p className={`text-white text-base font-bold leading-tight tracking-tight ${!notification.read ? 'text-white' : 'text-slate-400'}`}>{notification.title}</p>
                    <span className="text-[10px] text-white/40 font-mono">{new Date(notification.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-white/60 text-sm font-normal leading-relaxed line-clamp-2">{notification.description}</p>
                </div>
                {!notification.read && (
                    <div className="shrink-0 pt-1">
                        <div className={`size-2 rounded-full ${notification.category === 'emergency' ? 'bg-danger' : 'bg-primary'} animate-pulse`}></div>
                    </div>
                )}
            </div>
        ))}
      </div>
    </Layout>
  );
};

export default Notifications;