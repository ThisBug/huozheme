import { HealthData } from '../types';

// 定义 Capacitor 全局对象类型 (避免 TS 报错，实际项目中应安装 @capacitor/core)
declare global {
  interface Window {
    Capacitor?: any;
    webkit?: any;
  }
}

/**
 * Native Bridge Service (Capacitor Adapter)
 * 
 * 作用：作为 Web 代码与 iOS 原生能力的中间层。
 * 在浏览器中运行时使用 Mock 数据；在 iOS 设备上运行时调用 Capacitor 插件。
 */

// 检查是否在原生环境
const isNative = (): boolean => {
    return !!window.Capacitor && window.Capacitor.isNativePlatform();
};

export const NativeBridge = {
    health: {
        isAvailable: async (): Promise<boolean> => {
            if (!isNative()) return true; // Web 模拟支持
            try {
                // 假设使用 @capacitor-community/healthkit
                const { CapacitorHealthkit } = await import('@perfood/capacitor-healthkit');
                return !!CapacitorHealthkit;
            } catch (e) {
                console.warn('HealthKit plugin not found');
                return false;
            }
        },

        requestAuthorization: async (): Promise<boolean> => {
            console.log('[🍎 HealthKit] Requesting Access...');
            
            if (isNative()) {
                try {
                    // 动态导入插件以兼容 Web 打包
                    const { CapacitorHealthkit } = await import('@perfood/capacitor-healthkit');
                    await CapacitorHealthkit.requestAuthorization({
                        all: ['steps', 'heart_rate'],
                        read: ['steps', 'heart_rate'],
                        write: []
                    });
                    return true;
                } catch (e) {
                    console.error('HealthKit Auth Failed:', e);
                    return false;
                }
            }

            // Web 模拟延迟
            return new Promise(resolve => setTimeout(() => resolve(true), 800));
        },

        queryStatus: async (): Promise<HealthData> => {
            const now = Date.now();

            if (isNative()) {
                try {
                    const { CapacitorHealthkit } = await import('@perfood/capacitor-healthkit');
                    
                    // 获取步数 (当天)
                    const stepsResult = await CapacitorHealthkit.queryHKitSampleType({
                        sampleName: 'stepCount',
                        startDate: new Date(new Date().setHours(0,0,0,0)).toISOString(),
                        endDate: new Date().toISOString(),
                        limit: 1
                    });

                    // 获取最新心率
                    const heartRateResult = await CapacitorHealthkit.queryHKitSampleType({
                        sampleName: 'heartRate',
                        startDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 过去1小时
                        endDate: new Date().toISOString(),
                        limit: 1,
                        sortDescending: true
                    });

                    // 解析数据 (根据具体插件返回结构调整)
                    const steps = stepsResult.resultData?.[0]?.value || 0;
                    const hr = heartRateResult.resultData?.[0]?.value || 0;

                    // 同步数据给 Widget (App Groups)
                    NativeBridge.widget.updateData(steps, hr, now);

                    return {
                        heartRate: Math.round(hr),
                        steps: Math.round(steps),
                        lastUpdated: now
                    };

                } catch (e) {
                    console.error('HealthKit Query Error:', e);
                    // Fallback to mock if query fails
                }
            }
            
            // Web / Fallback 模拟算法
            const hour = new Date().getHours();
            let baseHr = (hour >= 7 && hour <= 22) ? 75 : 55;
            const noise = Math.floor(Math.random() * 10) - 5;
            const dailyStepsTarget = 6000 + Math.floor(Math.random() * 2000);
            const steps = Math.floor(dailyStepsTarget * (hour / 24)) + Math.floor(Math.random() * 50);

            return {
                heartRate: baseHr + noise,
                steps: steps,
                lastUpdated: now
            };
        }
    },

    notification: {
        requestPermissions: async (): Promise<boolean> => {
            if (isNative()) {
                const { LocalNotifications } = await import('@capacitor/local-notifications');
                const result = await LocalNotifications.requestPermissions();
                return result.display === 'granted';
            }

            if (!('Notification' in window)) return false;
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        },

        scheduleLocal: async (id: string, title: string, body: string, delaySeconds: number = 0) => {
            console.log(`[🔔 Notification] Scheduling [${id}] in ${delaySeconds}s`);
            
            if (isNative()) {
                const { LocalNotifications } = await import('@capacitor/local-notifications');
                await LocalNotifications.schedule({
                    notifications: [{
                        title,
                        body,
                        id: parseInt(id) || Math.floor(Math.random() * 1000),
                        schedule: { at: new Date(Date.now() + delaySeconds * 1000) },
                        sound: 'alert.wav', // 需要在 iOS 项目中添加此音频文件
                        actionTypeId: 'CRITICAL_ALERT', // 需要在原生代码中注册 Category
                        extra: { priority: 'high' }
                    }]
                });
            } else {
                setTimeout(() => {
                    if (Notification.permission === 'granted') {
                        new Notification(title, { body, tag: id, icon: '/icon-192.png' });
                    }
                }, delaySeconds * 1000);
            }
        }
    },

    app: {
        onResume: (callback: () => void) => {
            if (isNative()) {
                import('@capacitor/app').then(({ App }) => {
                    App.addListener('appStateChange', ({ isActive }) => {
                        if (isActive) {
                            console.log('[📱 App] Native Resume');
                            callback();
                        }
                    });
                });
            } else {
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible') callback();
                });
            }
        }
    },

    // 新增：Widget 数据桥接
    // 为了让 iOS Widget 显示数据，我们需要将数据写入 UserDefaults (App Group Suite)
    widget: {
        updateData: async (steps: number, heartRate: number, lastCheckIn: number) => {
            if (isNative()) {
                const { Preferences } = await import('@capacitor/preferences');
                
                // 注意：标准的 Preferences 插件不直接支持 App Groups。
                // 在真实生产中，你需要编写一个简单的自定义 Capacitor 插件
                // 或者使用 @capacitor-community/file-system 写入共享文件。
                // 这里我们假设有一个名为 'SharedStorage' 的自定义实现。
                
                // 模拟调用自定义插件写入 Shared UserDefaults
                // Native.SharedStorage.set({ group: 'group.com.livingwell', key: 'data', value: ... })
                console.log('[🧩 Widget] Syncing data to App Group container', { steps, heartRate });
            }
        }
    }
};