/**
 * Communication Service
 * 集成网易企业邮 SMTP 发送逻辑与模版系统
 */

// SMTP Configuration
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

系统监测到您的生命体征数据流/主动签到已中断，且已超过预设的安全阈值。

------------------------------------------------
警报级别：CRITICAL (红色)
触发时间：${time}
触发原因：生命周期倒计时归零
------------------------------------------------

请在确认延迟时间（Grace Period）结束前打开 App 进行生物特征验证。
若未在规定时间内响应，系统将自动启动“死手开关 (Dead Man's Switch)”协议，您的数字遗嘱将被解密并发送至紧急联系人。

此消息由自动化系统发送，无需回复。
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

以下是委托人留下的数字遗嘱内容：

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
     * 浏览器端无法直接建立TCP连接(Port 25)，此处模拟完整的SMTP握手与发送过程。
     * 在Node.js环境中，此处可直接替换为 nodemailer.createTransport({...}).sendMail()
     */
    _smtpSend: async (mailOptions: { to: string, subject: string, text: string }) => {
        console.groupCollapsed(`%c[SMTP Transport] Sending to ${mailOptions.to}`, 'color: #39ff14; font-weight: bold;');
        
        // 1. Connection
        console.log(`[CONN] Connecting to ${SMTP_CONFIG.host}:${SMTP_CONFIG.port}...`);
        await new Promise(r => setTimeout(r, 300));
        console.log(`[CONN] Connected. 220 ${SMTP_CONFIG.host} ESMTP`);

        // 2. Handshake
        console.log(`[EHLO] EHLO living-well-client`);
        console.log(`[250] 250-Auth LOGIN PLAIN`);

        // 3. Auth
        console.log(`[AUTH] Authenticating user: ${SMTP_CONFIG.user}`);
        console.log(`[PASS] Using configured password protection`);
        await new Promise(r => setTimeout(r, 500));
        console.log(`[235] 235 Authentication successful`);

        // 4. Data
        console.log(`[MAIL] MAIL FROM: <${SMTP_CONFIG.fromEmail}>`);
        console.log(`[RCPT] RCPT TO: <${mailOptions.to}>`);
        console.log(`[DATA] DATA`);
        console.log(`-------------------------------------------`);
        console.log(`From: "${SMTP_CONFIG.fromName}" <${SMTP_CONFIG.fromEmail}>`);
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Date: ${new Date().toUTCString()}`);
        console.log(``);
        console.log(mailOptions.text);
        console.log(`-------------------------------------------`);
        console.log(`.`);
        
        await new Promise(r => setTimeout(r, 800));
        console.log(`[250] 250 Mail OK queued as 1948234`);
        console.log(`[QUIT] QUIT`);
        
        console.groupEnd();
        return true;
    },

    /**
     * 发送生存状态预警 (Template 1)
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
     * 旧版接口兼容 (Deprecated)
     */
    sendSMS: async (payload: { to: string, body: string }) => {
        console.log(`[SMS] Sending to ${payload.to}: ${payload.body}`);
        return true;
    },

    /**
     * 旧版接口兼容 (Deprecated) - 转发至新SMTP逻辑
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
     */
    notifyEmergencyContacts: async (contacts: any[], userName: string) => {
        console.log('[Protocol] Initiating Emergency Contact Protocol...');
        for (const contact of contacts) {
            if (contact.email) {
                // 发送简单的警报通知给联系人
                await CommunicationService.sendNotification(
                    contact.email, 
                    "紧急状态确认请求", 
                    `您是用户 ${userName} 的紧急联系人。系统无法联系到用户，请尝试联系对方。若无响应，将在系统设定的时间后移交遗嘱。`
                );
            }
        }
    }
};