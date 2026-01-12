import { AppSettings, Contact } from '../types';

/**
 * SwitchApiService (Client SDK)
 * 
 * 对应服务端 API 接口的客户端实现。
 * 
 * --- 后端接口规范 (Spec) ---
 * 
 * 鉴权:
 * 所有请求必须包含 Header: `X-Device-UDID: <UUID>`
 * 
 * 1. POST /api/v1/switch/heartbeat
 *    Body: { nextDeadline: number (timestamp), gracePeriod: number (minutes) }
 *    Response: { status: 'active', serverTime: number }
 * 
 * 2. PUT /api/v1/switch/config
 *    Body: { isEnabled: boolean, ownerNotification: { email, phone }, emergencyContacts: [{ name, target, type }] }
 *    Response: { updatedAt: number }
 * 
 * 3. DELETE /api/v1/switch/account
 *    Response: { status: 'deleted' }
 * 
 * 4. GET /api/v1/switch/status
 *    Response: { state: 'monitoring' | 'warning' | 'triggered', deadline: number }
 */

const STORAGE_UDID_KEY = 'lw_device_udid';

// 模拟后端数据库结构
interface MockServerRecord {
    udid: string;
    deadline: number;
    gracePeriod: number; // minutes
    status: 'monitoring' | 'warning' | 'triggered';
    config: {
        isEnabled: boolean;
        ownerNotification: { email: string; phone: string };
        emergencyContacts: Array<{ name: string; target: string; type: string }>;
    };
    lastHeartbeat: number;
}

// 内存中的模拟数据库 (刷新页面会重置，实际应为 fetch 请求)
const MOCK_SERVER_DB: Record<string, MockServerRecord> = {};

export const SwitchApiService = {
    /**
     * 获取或生成唯一设备标识 (UDID)
     * 该 ID 是用户在服务端的唯一凭证。
     */
    getUDID: (): string => {
        let udid = localStorage.getItem(STORAGE_UDID_KEY);
        if (!udid) {
            udid = crypto.randomUUID();
            localStorage.setItem(STORAGE_UDID_KEY, udid);
        }
        return udid;
    },

    /**
     * 1. 发送心跳 (Heartbeat)
     * 
     * 作用: 告诉服务端 "我还活着"，并将倒计时推迟到 nextDeadline。
     * 触发: 客户端根据本地规则（步数、生物验证）自动触发。
     */
    sendHeartbeat: async (nextDeadline: number, gracePeriodMinutes: number) => {
        const udid = SwitchApiService.getUDID();
        console.log(`[☁️ API] POST /heartbeat | UDID: ...${udid.slice(-6)} | Deadline: ${new Date(nextDeadline).toLocaleString()}`);
        
        // --- 模拟网络请求 ---
        return new Promise((resolve) => {
            setTimeout(() => {
                const prevRecord = MOCK_SERVER_DB[udid];
                
                // 更新记录
                MOCK_SERVER_DB[udid] = {
                    ...(prevRecord || {}),
                    udid,
                    deadline: nextDeadline,
                    gracePeriod: gracePeriodMinutes,
                    status: 'monitoring', // 心跳总是重置状态为监测中
                    lastHeartbeat: Date.now(),
                    // 保留原有配置，如果没有则初始化空配置
                    config: prevRecord?.config || { isEnabled: false, ownerNotification: {email:'', phone:''}, emergencyContacts: [] }
                };

                resolve({ status: 'active', serverTime: Date.now() });
            }, 500); // 模拟 500ms 延迟
        });
    },

    /**
     * 2. 同步配置 (Sync Config)
     * 
     * 作用: 更新服务端在触发死手开关时需要通知的联系人列表。
     * 注意: 此处**不上传**任何遗嘱内容，仅上传联系方式。
     */
    syncConfig: async (settings: AppSettings, contacts: Contact[], isEnabled: boolean) => {
        const udid = SwitchApiService.getUDID();
        
        // 数据脱敏与格式化
        const emergencyContacts = contacts.map(c => ({
            name: c.name,
            target: c.email, // 仅使用邮箱作为通知渠道
            type: 'email'
        })).filter(c => c.target && c.target.includes('@')); // 简单验证

        const payload = {
            isEnabled,
            ownerNotification: {
                email: settings.userEmail,
                phone: settings.userPhone
            },
            emergencyContacts
        };

        console.log(`[☁️ API] PUT /config | UDID: ...${udid.slice(-6)}`, payload);

        // --- 模拟网络请求 ---
        return new Promise((resolve) => {
            setTimeout(() => {
                const prevRecord = MOCK_SERVER_DB[udid];
                if (prevRecord) {
                    prevRecord.config = payload;
                } else {
                    // 如果先调用 syncConfig 而没有 heartbeat (不太可能)，初始化一条
                    MOCK_SERVER_DB[udid] = {
                        udid,
                        deadline: Date.now() + 86400000, // 默认 24h
                        gracePeriod: 60,
                        status: 'monitoring',
                        lastHeartbeat: Date.now(),
                        config: payload
                    };
                }
                resolve({ updatedAt: Date.now() });
            }, 800);
        });
    },

    /**
     * 3. 账户销毁 (Nuke)
     * 
     * 作用: 物理删除服务端所有关联数据。
     */
    deleteAccount: async () => {
        const udid = SwitchApiService.getUDID();
        console.log(`[☁️ API] DELETE /account | UDID: ...${udid.slice(-6)}`);

        // --- 模拟网络请求 ---
        return new Promise((resolve) => {
            setTimeout(() => {
                if (MOCK_SERVER_DB[udid]) {
                    delete MOCK_SERVER_DB[udid];
                }
                // 清除本地存储的 ID，彻底断开关联
                localStorage.removeItem(STORAGE_UDID_KEY);
                resolve({ status: 'deleted' });
            }, 600);
        });
    },

    /**
     * 4. 获取状态 (Get Status)
     * 
     * 作用: 供前端 UI 检查云端视角的状态。
     */
    getServerStatus: async () => {
        const udid = SwitchApiService.getUDID();
        // --- 模拟网络请求 ---
        return new Promise<{state: string, deadline: number} | null>((resolve) => {
            setTimeout(() => {
                const record = MOCK_SERVER_DB[udid];
                if (!record) {
                    resolve(null);
                    return;
                }
                resolve({
                    state: record.status,
                    deadline: record.deadline
                });
            }, 300);
        });
    },

    /**
     * [Debug Only] 模拟服务端后台 Worker 逻辑
     * 
     * 在真实架构中，这是运行在服务器上的 Cron Job 或 Daemon 进程。
     * 为了演示，我们在这里暴露一个方法来模拟时间流逝导致的状态变更。
     */
    _simulateServerWorkerTick: () => {
        const udid = SwitchApiService.getUDID();
        const record = MOCK_SERVER_DB[udid];
        if (!record || !record.config.isEnabled) return;

        const now = Date.now();
        const warningTime = record.deadline;
        const triggerTime = record.deadline + (record.gracePeriod * 60 * 1000);

        // 状态机流转
        if (record.status === 'monitoring' && now > warningTime) {
            console.log(`%c[☁️ Server Worker] 状态变更为 WARNING! 发送预警邮件给: ${record.config.ownerNotification.email}`, 'color: orange');
            record.status = 'warning';
        } else if (record.status === 'warning' && now > triggerTime) {
            console.log(`%c[☁️ Server Worker] 状态变更为 TRIGGERED! 死手开关启动!`, 'color: red; font-size: 14px');
            console.log(`%c[☁️ Server Worker] 向 ${record.config.emergencyContacts.length} 位联系人发送通知...`, 'color: red');
            record.config.emergencyContacts.forEach(c => {
                console.log(`   -> Email to ${c.name} (${c.target}): "用户已失联，请检查其手机遗嘱。"`);
            });
            record.status = 'triggered';
        }
    }
};