export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: 'verified' | 'pending';
  priority: boolean;
  avatarColor?: string;
  // 新增联系人通知偏好类型 (服务端逻辑需要)
  notificationType?: 'email' | 'sms' | 'both'; 
}

export interface LogEntry {
  id: string;
  title: string;
  timestamp: string; // ISO String
  description: string;
  type: 'success' | 'update' | 'config' | 'alert';
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string; // ISO String
  category: 'system' | 'emergency';
  read: boolean;
}

export interface Device {
  id: string;
  name: string;
  model: string;
  lastSync: string;
  battery: number;
  type: 'watch' | 'phone';
  status: 'connected' | 'disconnected';
  image?: string;
}

export interface WillData {
  content: string;
  lastUpdated: string | null;
  isSigned: boolean;
  id?: string;
}

export interface AppSettings {
  checkInInterval: number; // Hours
  minSteps: number;
  // New fields
  confirmationDelay: number; // Minutes
  userPhone: string;
  userEmail: string;
  userName: string; // 用户称呼/代号
}

export interface UserStatus {
  lastCheckIn: number; // Timestamp
  // 对应服务端的：监测中(active), 预警中(warning), 已失联(missing), 已封禁(banned), 已销毁(destroyed)
  status: 'active' | 'warning' | 'missing' | 'banned' | 'destroyed';
  isAuthorized: boolean; // Legal authorization signed
  // New fields for advanced check-in logic
  stepsCheckInDone: boolean;
  lastManualCheckIn: number;
  lastHeartRateCheckIn: number;
  preWarningSent: boolean; // Tracks if the 30-min pre-warning has been sent
}

// New Interface for Real-time Data
export interface HealthData {
  heartRate: number;
  steps: number;
  lastUpdated: number;
}