export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: 'verified' | 'pending';
  priority: boolean;
  avatarColor?: string;
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
  syncFrequency: string;
  // New fields
  confirmationDelay: number; // Minutes
  userPhone: string;
  userEmail: string;
}

export interface UserStatus {
  lastCheckIn: number; // Timestamp
  status: 'active' | 'warning' | 'critical';
  isAuthorized: boolean; // Legal authorization signed
}

// New Interface for Real-time Data
export interface HealthData {
  heartRate: number;
  steps: number;
  lastUpdated: number;
}