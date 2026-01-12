import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppSettings, Contact, LogEntry, UserStatus, WillData, Device, Notification, HealthData } from '../types';
import { SwitchApiService } from '../services/switchApi';
import { NativeBridge } from '../services/nativeBridge'; // Import Bridge

interface AppContextType {
  settings: AppSettings;
  status: UserStatus;
  will: WillData;
  contacts: Contact[];
  logs: LogEntry[];
  devices: Device[];
  notifications: Notification[];
  healthData: HealthData; // Real-time data
  sessionCheckedIn: boolean; 
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  performCheckIn: () => void;
  updateWill: (content: string, isSigned: boolean) => void;
  addContact: (contact: Contact) => void;
  updateContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;
  addDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
  syncDevice: (id: string) => void;
  addLog: (title: string, description: string, type: LogEntry['type']) => void;
  addNotification: (title: string, description: string, category: Notification['category']) => void; 
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  toggleAuthorization: (isAuthorized: boolean) => void;
  nukeUserData: () => Promise<void>; 
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'lw_settings',
  STATUS: 'lw_status',
  WILL: 'lw_will',
  CONTACTS: 'lw_contacts',
  LOGS: 'lw_logs',
  DEVICES: 'lw_devices',
  NOTIFICATIONS: 'lw_notifications',
  HEALTH: 'lw_health_data',
  SESSION: 'lw_session_checkin'
};

const DEFAULT_SETTINGS: AppSettings = {
  checkInInterval: 72,
  minSteps: 2000,
  syncFrequency: '1小时',
  confirmationDelay: 60, 
  userPhone: '',
  userEmail: ''
};

const DEFAULT_WILL: WillData = {
  content: '',
  lastUpdated: null,
  isSigned: false
};

const INITIAL_DEVICES: Device[] = [
    { id: '1', name: 'Apple Watch Series 9', model: 'S9', lastSync: new Date().toISOString(), battery: 85, type: 'watch', status: 'connected' },
    { id: '2', name: 'iPhone 15 Pro', model: '15Pro', lastSync: new Date().toISOString(), battery: 92, type: 'phone', status: 'connected' },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
    { id: '1', title: '步数计数警报', description: '步数已连续4小时低于阈值。请确认状态。', time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), category: 'emergency', read: false },
    { id: '2', title: '遗嘱备份完成', description: '您的数字遗嘱已采用AES-256加密并备份至本地安全存储区。', time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), category: 'system', read: false },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Persistent State ---
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return DEFAULT_SETTINGS;
  });

  const [status, setStatus] = useState<UserStatus>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATUS);
    return saved ? JSON.parse(saved) : { lastCheckIn: Date.now(), status: 'active', isAuthorized: false };
  });

  const [will, setWill] = useState<WillData>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WILL);
    return saved ? JSON.parse(saved) : DEFAULT_WILL;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : [];
  });

  const [devices, setDevices] = useState<Device[]>(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.DEVICES);
      return saved ? JSON.parse(saved) : INITIAL_DEVICES;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [healthData, setHealthData] = useState<HealthData>(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.HEALTH);
      return saved ? JSON.parse(saved) : { heartRate: 0, steps: 0, lastUpdated: Date.now() };
  });

  const [sessionCheckedIn, setSessionCheckedIn] = useState<boolean>(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      return saved ? JSON.parse(saved) : false;
  });

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify(status)), [status]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.WILL, JSON.stringify(will)), [will]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts)), [contacts]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs)), [logs]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices)), [devices]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications)), [notifications]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(healthData)), [healthData]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionCheckedIn)), [sessionCheckedIn]);

  // --- SERVER SYNC LOGIC ---
  useEffect(() => {
    const syncToCloud = async () => {
        if (status.isAuthorized) {
            await SwitchApiService.syncConfig(settings, contacts, true);
        }
    };
    const timer = setTimeout(syncToCloud, 2000); 
    return () => clearTimeout(timer);
  }, [settings, contacts, status.isAuthorized]);

  // --- NATIVE BRIDGE INTEGRATION (HealthKit & Background Logic) ---
  useEffect(() => {
    const hasWatch = devices.some(d => d.type === 'watch' && d.status === 'connected');
    const hasPhone = devices.some(d => d.type === 'phone' && d.status === 'connected');
    
    if (!hasWatch && !hasPhone) return;

    // 1. Polling Function (Simulating HKObserverQuery updates)
    const fetchHealthData = async () => {
        try {
            const data = await NativeBridge.health.queryStatus();
            setHealthData(data);
            
            // Auto Check-In Logic
            if (data.steps > settings.minSteps && !sessionCheckedIn) {
                // In native app, this would happen in background task
                // For now, we update it in state
                // Note: We don't call performCheckIn() directly to avoid infinite loops in this effect
            }
        } catch (e) {
            console.error("HealthKit query failed", e);
        }
    };

    // 2. Initial Fetch
    fetchHealthData();

    // 3. Periodic Polling (Foreground)
    const interval = setInterval(fetchHealthData, 3000); // Poll every 3s in foreground

    // 4. Resume Listener (Simulate Background Fetch completion)
    // When user comes back to app, immediately sync
    NativeBridge.app.onResume(() => {
        console.log("App resumed - triggering immediate health sync");
        fetchHealthData();
        // Here we could also check if 'Background App Refresh' updated data while we were away
    });

    return () => clearInterval(interval);
  }, [devices, settings.minSteps, sessionCheckedIn]);


  // --- Actions ---
  const addLog = (title: string, description: string, type: LogEntry['type']) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      title,
      description,
      timestamp: new Date().toISOString(),
      type
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (title: string, description: string, category: Notification['category']) => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      title,
      description,
      time: new Date().toISOString(),
      category,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // TRIGGER LOCAL PUSH (Native Bridge)
    // If it's an emergency, try to push to system notification center
    if (category === 'emergency') {
        NativeBridge.notification.scheduleLocal(newNotif.id, `🚨 ${title}`, description, 1);
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const performCheckIn = () => {
    const now = Date.now();
    setStatus(prev => ({ ...prev, lastCheckIn: now, status: 'active' }));
    setSessionCheckedIn(true);
    addLog('手动签到成功', '用户通过生物识别验证确认了生存状态', 'success');
    addNotification('签到成功', '生命周期计时器已重置。', 'system');

    if (status.isAuthorized) {
        const nextDeadline = now + (settings.checkInInterval * 60 * 60 * 1000);
        SwitchApiService.sendHeartbeat(nextDeadline, settings.confirmationDelay);
        addLog('云端同步', '已更新服务端死手开关倒计时', 'config');
    }
  };

  const updateWill = (content: string, isSigned: boolean) => {
    setWill(prev => ({
      content,
      lastUpdated: new Date().toISOString(),
      isSigned: isSigned,
      id: prev.id || 'LW-' + Date.now().toString().slice(-6)
    }));
    if (isSigned) {
        addLog('遗嘱签署', '数字遗嘱已完成签署并归档至本地', 'update');
        addNotification('遗嘱已更新', '您的数字遗嘱已成功加密保存。', 'system');
    }
  };

  const addContact = (contact: Contact) => {
    setContacts(prev => [...prev, contact]);
    addLog('新增联系人', `添加了新的紧急联系人: ${contact.name}`, 'config');
  };

  const updateContact = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
    addLog('更新联系人', `更新了紧急联系人信息: ${updatedContact.name}`, 'config');
  };

  const deleteContact = (id: string) => {
    const target = contacts.find(c => c.id === id);
    setContacts(prev => prev.filter(c => c.id !== id));
    if (target) {
        addLog('删除联系人', `移除了紧急联系人: ${target.name}`, 'alert');
        addNotification('联系人移除', `${target.name} 已从紧急联系人列表中移除。`, 'system');
    }
  };

  const addDevice = (device: Device) => {
    setDevices(prev => [...prev, device]);
    addLog('设备绑定', `新终端已连接: ${device.name}`, 'config');
    addNotification('新设备已连接', `${device.name} 已成功绑定并开始同步数据。`, 'system');
  };

  const removeDevice = (id: string) => {
      const target = devices.find(d => d.id === id);
      if (target) {
         addLog('设备解绑', `解除了设备绑定: ${target.name}`, 'alert');
         addNotification('设备已断开', `${target.name} 已解除绑定。`, 'system');
      }
      setDevices(prev => prev.filter(d => d.id !== id));
  };

  const syncDevice = (id: string) => {
      setDevices(prev => prev.map(d => d.id === id ? { ...d, lastSync: new Date().toISOString() } : d));
  };

  const markAllNotificationsRead = () => {
      setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

  const markNotificationRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
  };

  const toggleAuthorization = (isAuthorized: boolean) => {
      setStatus(prev => ({ ...prev, isAuthorized }));
      if (isAuthorized) {
          addLog('协议授权', '用户签署了遗产执行协议', 'success');
          addNotification('协议生效', '遗产执行协议已签署并生效。服务端死手开关已激活。', 'system');
          SwitchApiService.syncConfig(settings, contacts, true);
      } else {
          addLog('撤销授权', '用户撤销了遗产执行协议', 'alert');
          addNotification('协议撤销', '您已撤销遗产执行协议。服务端配置已暂停。', 'emergency');
          SwitchApiService.syncConfig(settings, contacts, false);
      }
  };

  const nukeUserData = async () => {
      await SwitchApiService.deleteAccount();
      localStorage.clear();
      window.location.hash = '/';
      window.location.reload();
  };

  return (
    <AppContext.Provider value={{
      settings,
      status,
      will,
      contacts,
      logs,
      devices,
      notifications,
      healthData,
      sessionCheckedIn,
      updateSettings,
      performCheckIn,
      updateWill,
      addContact,
      updateContact,
      deleteContact,
      addDevice,
      removeDevice,
      syncDevice,
      addLog,
      addNotification,
      markAllNotificationsRead,
      markNotificationRead,
      toggleAuthorization,
      nukeUserData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};