/**
 * Communication Service (External Gateway)
 * 
 * 架构说明：
 * 本应用遵循 "Local-First"（本地优先）架构。
 * - 所有的健康监测、倒计时逻辑、遗嘱加密存储均在客户端（iOS/Local Storage）完成。
 * - 服务端仅作为“最后一道防线”。
 * 
 * 此服务仅在以下情况被调用：
 * 1. 客户端检测到生存倒计时归零且用户未响应。
 * 2. 需要发送真实的 Email 或 SMS 给紧急联系人。
 * 
 * 平时的数据同步、心率更新等操作不需要经过此服务，直接在 AppContext 中处理。
 */

// SMTP Configuration (Mock / Placeholder for Server-Side Function)
const SMTP_CONFIG = {
    host: 'smtphz.qiye.163.com',
    port: 25,
    user: 'verify@thisbug.com',
    pass: 'zZ$7fWQ6uSQj@Dg3',
    fromName: '活着么生存预警',
    fromEmail: 'verify@thisbug.com'
};

// Email Templates
const TEMPLATES = {
    // 1. 生存状态预警 (Survival Status Warning)
    survivalAlert: (userName: string = '用户') => {
        const time = new Date().toLocaleString();
        return {
            subject: `【紧急警报】生存状态确认请求 - ${time}`,
            body: `
尊敬的 ${userName}：

系统监测到您的本地生命体征数据流/主动签到已中断，且已超过预设的安全阈值。

------------------------------------------------
警报级别：CRITICAL (红色)
触发时间：${time}
触发原因：客户端生命周期倒计时归零
------------------------------------------------

请在确认延迟时间（Grace Period）结束前打开 App 进行生物特征验证。
若未在规定时间内响应，系统将向您的紧急联系人发送预存的数字遗嘱密钥。

此消息由服务端网关触发。
            `.trim()
        };
    },

    // 2. 遗嘱交付 (Will Delivery)
    willDelivery: (testatorName: string, willContent: string) => {
        const time = new Date().toLocaleString();
        return {
            subject: `【绝密】数字遗嘱交付协议执行 - ${testatorName}`,
            body: `
受件人 您好：

这是一封由“活着么 (Living Well)”数字遗产托管系统自动发送的邮件。
根据我们与委托人 [${testatorName}] 签署的遗产执行协议 (LW-SIGN-2024-X)，系统已确认委托人处于非活跃状态，现正式触发资产移交程序。

------------------------------------------------
执行时间：${time}
协议状态：已验证 (AES-256)
------------------------------------------------

以下是委托人留下的数字遗嘱内容（已解密）：

================ 遗嘱开始 ================

${willContent}

================ 遗嘱结束 ================

请妥善处理相关信息。

活着么系统托管中心
            `.trim()
        };
    },

    // 3. 系统通知 (System Notification)
    notification: (title: string, message: string) => {
        return {
            subject: `【通知】${title}`,
            body: `
${message}

------------------------------------------------
活着么 (Living Well) - 您的数字生命守护者
            `.trim()
        };
    }
};

interface SendOptions {
    to: string;
    templateType: 'alert' | 'will' | 'notification';
    data?: any; // Extra data like name, content
}

export const CommunicationService = {
    /**
     * Internal Simulated SMTP Transport
     * 模拟发送过程。在真实环境中，这里会调用后端 API (e.g. POST /api/external/send-mail)
     */
    _smtpSend: async (mailOptions: { to: string, subject: string, text: string }) => {
        console.groupCollapsed(`%c[External Gateway] Sending to ${mailOptions.to}`, 'color: #ff3131; font-weight: bold;');
        
        // Simulate Network Latency
        console.log(`[GATEWAY] Connecting to external notification service...`);
        await new Promise(r => setTimeout(r, 800));

        console.log(`[GATEWAY] Authenticating... OK`);
        console.log(`[GATEWAY] Dispatching message...`);
        console.log(`-------------------------------------------`);
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Body: ${mailOptions.text.substring(0, 50)}...`);
        console.log(`-------------------------------------------`);
        
        await new Promise(r => setTimeout(r, 500));
        console.log(`[GATEWAY] Message sent successfully (ID: ${Date.now()})`);
        
        console.groupEnd();
        return true;
    },

    /**
     * 发送生存状态预警 (Template 1)
     * 仅当本地倒计时过期时调用
     */
    sendSurvivalAlert: async (to: string, userName: string = '用户') => {
        const { subject, body } = TEMPLATES.survivalAlert(userName);
        return CommunicationService._smtpSend({
            to,
            subject,
            text: body
        });
    },

    /**
     * 发送遗嘱 (Template 2)
     * 仅当死手开关最终触发时调用
     */
    sendWill: async (to: string, testatorName: string, willContent: string) => {
        const { subject, body } = TEMPLATES.willDelivery(testatorName, willContent);
        return CommunicationService._smtpSend({
            to,
            subject,
            text: body
        });
    },

    /**
     * 发送普通通知 (Template 3)
     */
    sendNotification: async (to: string, title: string, message: string) => {
        const { subject, body } = TEMPLATES.notification(title, message);
        return CommunicationService._smtpSend({
            to,
            subject,
            text: body
        });
    },

    /**
     * 发送短信 (Mock)
     * 真实场景下会调用 POST /api/external/sms
     */
    sendSMS: async (payload: { to: string, body: string }) => {
        console.groupCollapsed(`%c[External Gateway] SMS to ${payload.to}`, 'color: #ff3131; font-weight: bold;');
        console.log(`[SMS] Gateway: Twilio/Aliyun`);
        console.log(`[SMS] Payload: ${payload.body}`);
        await new Promise(r => setTimeout(r, 600));
        console.log(`[SMS] Sent.`);
        console.groupEnd();
        return true;
    },

    /**
     * 邮件兼容接口
     */
    sendEmail: async (payload: { to: string, subject?: string, body: string }) => {
        return CommunicationService._smtpSend({
            to: payload.to,
            subject: payload.subject || '系统通知',
            text: payload.body
        });
    },
    
    /**
     * 触发紧急联系人通知逻辑
     * 这是“轻服务端”架构中最重要的外部调用
     */
    notifyEmergencyContacts: async (contacts: any[], userName: string) => {
        console.log('%c[PROTOCOL] Activating Emergency Protocol...', 'color: red; font-size: 14px; font-weight: bold;');
        for (const contact of contacts) {
            if (contact.email) {
                // 发送简单的警报通知给联系人
                await CommunicationService.sendNotification(
                    contact.email, 
                    "紧急状态确认请求", 
                    `您是用户 ${userName} 的紧急联系人。系统无法联系到用户，请尝试联系对方。若无响应，系统将在本地倒计时结束后自动移交遗嘱。`
                );
            }
        }
    }
};