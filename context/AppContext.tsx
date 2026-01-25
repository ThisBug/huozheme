import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppSettings, Contact, LogEntry, UserStatus, WillData, Device, Notification, HealthData } from '../types';
import { SwitchApiService } from '../services/switchApi';
import { NativeBridge } from '../services/nativeBridge';

interface AppContextType {
  settings: AppSettings;
  status: UserStatus;
  will: WillData;
  contacts: Contact[];
  logs: LogEntry[];
  devices: Device[];
  notifications: Notification[];
  healthData: HealthData;
  sessionCheckedIn: boolean; 
  privacyAccepted: boolean;
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
  acceptPrivacyPolicy: () => void;
  canSyncToServer: () => boolean;
  markPreWarningSent: () => void;
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
  SESSION: 'lw_session_checkin',
  PRIVACY: 'lw_privacy_accepted'
};

const DEFAULT_SETTINGS: AppSettings = {
  checkInInterval: 72, // Hours
  minSteps: 2000,
  confirmationDelay: 720, // Default 12 hours (Minutes)
  userPhone: '',
  userEmail: '',
  userName: '' // Default empty
};

const DEFAULT_WILL: WillData = {
  content: '',
  lastUpdated: null,
  isSigned: false
};

// Helper hook to get the previous value
const usePrevious = <T extends unknown>(value: T): T | undefined => {
  // FIX: Explicitly initialize useRef with `undefined` to satisfy the type checker,
  // which expects an argument when a generic type is provided.
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

// Helper to check if two timestamps are on the same calendar day
const isSameDay = (d1: number, d2: number) => {
    if (!d1 || !d2) return false;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(() => !!localStorage.getItem(STORAGE_KEYS.PRIVACY));
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
    const defaultStatus: UserStatus = { 
        lastCheckIn: Date.now(), 
        status: 'active', 
        isAuthorized: false,
        stepsCheckInDone: false,
        lastManualCheckIn: 0,
        lastHeartRateCheckIn: 0,
        preWarningSent: false
    };
    return saved ? { ...defaultStatus, ...JSON.parse(saved) } : defaultStatus;
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
      return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : [];
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
  useEffect(() => localStorage.setItem(STORAGE_KEYS.PRIVACY, JSON.stringify(privacyAccepted)), [privacyAccepted]);

  // --- INITIALIZATION ---
  useEffect(() => {
    SwitchApiService.init();
  }, []);

  // --- Actions (defined early to be used in effects) ---
  const addLog = (title: string, description: string, type: LogEntry['type']) => {
    const newLog: LogEntry = { id: Date.now().toString(), title, description, timestamp: new Date().toISOString(), type };
    setLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (title: string, description: string, category: Notification['category']) => {
    const newNotif: Notification = { id: Date.now().toString(), title, description, time: new Date().toISOString(), category, read: false };
    setNotifications(prev => [newNotif, ...prev]);
    if (category === 'emergency') {
        NativeBridge.notification.scheduleLocal(newNotif.id, `🚨 ${title}`, description, 1);
    }
  };

  // --- SERVER SYNC LOGIC ---
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const canSyncToServer = (): boolean => {
    return !!(settings.userName && settings.userEmail);
  };

  // Effect 1: Handles syncing config updates AFTER initial authorization.
  // This uses a 3-second debounce to prevent frequent API calls when settings 
  // (like check-in interval) are changed rapidly.
  useEffect(() => {
    if (!status.isAuthorized || !canSyncToServer()) {
      return;
    }
    
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    
    syncTimeoutRef.current = setTimeout(async () => {
        const result = await SwitchApiService.syncConfig(settings, contacts, will);
        if (result) {
            console.log("[☁️ Sync] Subsequent config update synced successfully");
            addLog('云端同步', '本地配置变更已同步', 'config');
        }
    }, 3000); // Debounce changes by 3 seconds

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [settings, contacts, will]); // Watches for changes in user data


  // Effect 2: Handles the INITIAL service activation (sync + heartbeat) when user authorizes
  const prevIsAuthorized = usePrevious(status.isAuthorized);
  useEffect(() => {
    // Fire only when changing from false to true and server sync is possible
    if (prevIsAuthorized === false && status.isAuthorized === true && canSyncToServer()) {
      console.log('[☁️ Activation] Service authorized. Performing initial sync and heartbeat.');
      addNotification('服务已激活', '云端同步与“活着么”倒计时已启动。', 'system');
      
      // 1. Sync config immediately
      SwitchApiService.syncConfig(settings, contacts, will).then(syncSuccess => {
        if (syncSuccess) {
          addLog('云端同步', '初始配置已成功同步', 'success');
          
          // 2. On successful sync, send the first heartbeat to start the server timer
          const now = Date.now();
          const nextDeadline = now + (settings.checkInInterval * 60 * 60 * 1000);
          SwitchApiService.sendHeartbeat(Math.floor(nextDeadline / 1000)).then(heartbeatSuccess => {
            if (heartbeatSuccess) {
              addLog('云端续期', '初始“活着么”倒计时已设定', 'success');
              // 3. Update local timer to match the new server timer
              setStatus(prev => ({ ...prev, lastCheckIn: now }));
            } else {
              addLog('云端续期失败', '初始心跳发送失败，请尝试手动签到', 'alert');
            }
          });
        } else {
          addLog('云端同步失败', '初始配置同步失败', 'alert');
        }
      });
    }
  }, [status.isAuthorized, prevIsAuthorized, settings, contacts, will]);

  // Effect 3: Automatic check-in based on new smart rules
  useEffect(() => {
    if (!status.isAuthorized || !canSyncToServer()) return;

    const now = Date.now();
    if (now - status.lastCheckIn < 6 * 60 * 60 * 1000) return; // Global 6-hour cooldown

    let triggerReason: string | null = null;
    let checkInType: 'steps' | 'heart_rate' | null = null;

    // Rule A: One-time step count check-in
    if (!status.stepsCheckInDone && healthData.steps >= settings.minSteps) {
        triggerReason = `步数阈值 (${settings.minSteps.toLocaleString()}步) 已达成 (首次)`;
        checkInType = 'steps';
    } 
    // Rule B: Once-per-day heart rate check-in
    else if (!isSameDay(now, status.lastHeartRateCheckIn)) {
        const hasWatch = devices.some(d => d.type === 'watch' && d.status === 'connected');
        if (hasWatch && healthData.heartRate > 0) {
            triggerReason = `已从手表同步有效心率 (${healthData.heartRate} BPM)`;
            checkInType = 'heart_rate';
        }
    }

    if (triggerReason && checkInType) {
        console.log(`[🏃 Auto Check-In] Triggered. Reason: ${triggerReason}`);
        
        setStatus(prev => ({
            ...prev,
            lastCheckIn: now,
            status: 'active',
            stepsCheckInDone: checkInType === 'steps' ? true : prev.stepsCheckInDone,
            lastHeartRateCheckIn: checkInType === 'heart_rate' ? now : prev.lastHeartRateCheckIn,
            preWarningSent: false
        }));
        
        addLog('自动签到成功', triggerReason, 'success');
        addNotification('自动签到', `已通过健康数据确认状态，计时器已重置。`, 'system');
        
        const nextDeadline = now + (settings.checkInInterval * 60 * 60 * 1000);
        SwitchApiService.sendHeartbeat(Math.floor(nextDeadline / 1000)).then(success => {
            if (success) addLog('云端续期', '自动签到后，服务端倒计时已更新', 'config');
            else addLog('云端续期失败', '自动签到后，心跳发送失败', 'alert');
        });
    }
  }, [healthData, devices, settings.minSteps, status]);


  // --- NATIVE BRIDGE INTEGRATION ---
  useEffect(() => {
    const fetchHealthData = async () => {
        try {
            const data = await NativeBridge.health.queryStatus();
            setHealthData(data);
        } catch (e) {
            console.error("HealthKit query failed", e);
        }
    };
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 3000);
    NativeBridge.app.onResume(() => {
        fetchHealthData();
        if (canSyncToServer()) {
            SwitchApiService.getServerStatus().then(res => {
                if (res && res.data && res.data.status === 'banned') {
                    setStatus(prev => ({...prev, status: 'banned'}));
                    alert('您的账号已被封禁，服务停止。');
                }
            });
        }
    });
    return () => clearInterval(interval);
  }, [devices, settings.minSteps, sessionCheckedIn]);


  // --- Actions ---
  const acceptPrivacyPolicy = () => {
    setPrivacyAccepted(true);
    addLog('隐私授权', '用户同意了隐私政策和服务条款', 'success');
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const performCheckIn = async () => {
    const now = Date.now();

    // Global 6-hour cooldown check
    if (now - status.lastCheckIn < 6 * 60 * 60 * 1000) {
        const timeLeft = 6 * 60 * 60 * 1000 - (now - status.lastCheckIn);
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.ceil((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const message = `签到过于频繁。请在 ${hoursLeft}小时 ${minutesLeft}分钟 后再试。`;
        addLog('签到已阻止', message, 'alert');
        addNotification('签到失败', message, 'system');
        return;
    }

    // Once per day check for manual check-in
    if (isSameDay(now, status.lastManualCheckIn)) {
        const message = '今天您已手动签到过，无需重复操作。';
        addLog('签到已阻止', message, 'alert');
        addNotification('签到失败', message, 'system');
        return;
    }

    setStatus(prev => ({ 
        ...prev, 
        lastCheckIn: now, 
        status: 'active',
        lastManualCheckIn: now,
        preWarningSent: false
    }));
    setSessionCheckedIn(true);
    
    addLog('手动签到成功', '用户通过生物识别验证确认了生存状态', 'success');
    addNotification('签到成功', '生命周期计时器已重置。', 'system');

    if (status.isAuthorized && canSyncToServer()) {
        const nextDeadline = now + (settings.checkInInterval * 60 * 60 * 1000);
        try {
            await SwitchApiService.sendHeartbeat(Math.floor(nextDeadline / 1000));
            addLog('云端续期', '服务端活着么倒计时已更新', 'config');
        } catch (e) {
            addLog('云端续期失败', '网络错误，将在下次连接时重试', 'alert');
        }
    }
  };

  const updateWill = (content: string, isSigned: boolean) => {
    setWill(prev => ({
      content,
      lastUpdated: new Date().toISOString(),
      isSigned: isSigned,
      id: prev.id || 'LW-' + Date.now().toString().slice(-6)
    }));
    if (isSigned) addLog('备忘录保存', '遗产备忘录已完成并归档至本地', 'update');
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
    if (target) addLog('删除联系人', `移除了紧急联系人: ${target.name}`, 'alert');
  };

  const addDevice = (device: Device) => {
    setDevices(prev => [...prev, device]);
    addLog('设备绑定', `新终端已连接: ${device.name}`, 'config');
  };

  const removeDevice = (id: string) => {
      const target = devices.find(d => d.id === id);
      if (target) addLog('设备解绑', `解除了设备绑定: ${target.name}`, 'alert');
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
      if (isAuthorized) {
          addLog('协议授权', '用户签署了备忘录发送协议', 'success');
      } else {
          addLog('撤销授权', '用户撤销了发送协议', 'alert');
          if(canSyncToServer()) {
            SwitchApiService.syncConfig(settings, [], DEFAULT_WILL);
          }
      }
      setStatus(prev => ({ ...prev, isAuthorized }));
  };

  const nukeUserData = async () => {
      if(canSyncToServer()) {
        await SwitchApiService.deleteAccount();
      }
      localStorage.clear();
      window.location.hash = '/';
      window.location.reload();
  };

  const markPreWarningSent = () => {
    setStatus(prev => ({ ...prev, preWarningSent: true }));
  };

  return (
    <AppContext.Provider value={{
      settings, status, will, contacts, logs, devices, notifications, healthData, sessionCheckedIn, privacyAccepted,
      updateSettings, performCheckIn, updateWill, addContact, updateContact, deleteContact,
      addDevice, removeDevice, syncDevice, addLog, addNotification, markAllNotificationsRead,
      markNotificationRead, toggleAuthorization, nukeUserData, acceptPrivacyPolicy, canSyncToServer, markPreWarningSent
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
