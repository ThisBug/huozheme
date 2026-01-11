export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: 'verified' | 'pending';
  avatarColor: string;
}

export interface LogEntry {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  type: 'success' | 'update' | 'config';
  daysAgo?: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'alert' | 'success' | 'info';
  isNew: boolean;
}

export interface Device {
  id: string;
  name: string;
  model: string;
  lastSync: string;
  battery: number;
  type: 'watch' | 'phone';
  status: 'connected' | 'disconnected';
  image: string;
}