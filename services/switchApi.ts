import { AppSettings, Contact, WillData } from '../types';

/**
 * SwitchApiService (Client SDK)
 * 
 * Implements the "light-networking, heavy-local" strategy:
 * 1. API call failures do not throw exceptions to crash the app, returning null/false instead.
 * 2. Heartbeats are only sent after the client confirms liveness.
 */

const API_BASE_URL = 'https://hzm.thisbug.com/api/v1/switch';
const STORAGE_UDID_KEY = 'lw_device_udid';
const STORAGE_TOKEN_KEY = 'lw_api_token';

let apiToken: string | null = localStorage.getItem(STORAGE_TOKEN_KEY);

// --- Private Helper Functions ---

/**
 * Gets or generates a unique device identifier (UDID).
 * This ID is the user's unique credential on the server.
 */
const getUDID = (): string => {
    let udid = localStorage.getItem(STORAGE_UDID_KEY);
    if (!udid) {
        udid = crypto.randomUUID();
        localStorage.setItem(STORAGE_UDID_KEY, udid);
    }
    return udid;
};

/**
 * Fetches a new JWT from the server.
 * This is called on initialization or when the current token expires.
 */
const fetchNewToken = async (): Promise<string | null> => {
    console.log('[☁️ Auth] Requesting new token...');
    const udid = getUDID();
    const ua = navigator.userAgent;

    try {
        const response = await fetch(`${API_BASE_URL}/token`, {
            method: 'GET',
            headers: {
                'X-Device-UUID': udid,
                'User-Agent': ua,
            },
        });
        const data = await response.json();
        if (data.code === 200 && data.data.token) {
            console.log('[☁️ Auth] Token acquired.');
            apiToken = data.data.token;
            localStorage.setItem(STORAGE_TOKEN_KEY, apiToken!);
            return apiToken;
        }
        console.error('[☁️ Auth] Token request failed:', data.msg || 'Unknown error');
        return null;
    } catch (error) {
        console.error('[☁️ Auth] Network error fetching token:', error);
        return null;
    }
};

/**
 * Centralized API request handler with automatic token refresh.
 */
const apiRequest = async (endpoint: string, options: RequestInit): Promise<any | null> => {
    if (!apiToken) {
        apiToken = await fetchNewToken();
        if (!apiToken) return null; // Can't proceed without a token
    }

    const udid = getUDID();
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
        'X-Device-UUID': udid,
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Handle token expiration (HTTP 401)
        if (response.status === 401) {
            console.log('[☁️ Auth] Token expired. Refreshing...');
            apiToken = await fetchNewToken();
            if (!apiToken) return null; // Failed to refresh

            // Retry the request with the new token
            config.headers['Authorization'] = `Bearer ${apiToken}`;
            response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        }

        if (!response.ok) {
            console.error(`[☁️ API] Error on ${endpoint}: ${response.status} ${response.statusText}`);
            return null;
        }
        
        return await response.json();

    } catch (error) {
        console.error(`[☁️ API] Network error on ${endpoint}:`, error);
        return null;
    }
};

// --- Public API ---

export const SwitchApiService = {
    /**
     * Initializes the service by fetching an API token if one isn't already stored.
     * This should be called when the application loads.
     */
    init: async (): Promise<void> => {
        if (!apiToken) {
            await fetchNewToken(); // Fetches and stores the token internally
        }
    },

    /**
     * Sends a heartbeat to the server to reset the dead man's switch timer.
     * @param deadline - The new deadline as a Unix timestamp (seconds).
     */
    sendHeartbeat: async (deadline: number): Promise<boolean> => {
        console.log(`[☁️ Heartbeat] Sending... New Deadline: ${new Date(deadline * 1000).toLocaleString()}`);
        const response = await apiRequest('/heartbeat', {
            method: 'POST',
            body: JSON.stringify({ deadline }),
        });
        return response?.code === 200;
    },

    /**
     * Syncs the user's local configuration with the server.
     * This includes settings, contacts, and the will content.
     */
    syncConfig: async (settings: AppSettings, contacts: Contact[], will: WillData): Promise<boolean> => {
        console.log('[☁️ Sync] Syncing user configuration to server...');
        const payload = {
            settings: {
                check_in_interval_hours: settings.checkInInterval,
                confirmation_delay_minutes: settings.confirmationDelay,
            },
            contacts: contacts.map(c => ({
                name: c.name,
                phone: c.phone,
                email: c.email,
                role: c.role === '紧急联系人' ? 'emergency' : 'asset_liaison',
            })),
            will_content: will.isSigned ? will.content : '', // Only sync signed wills
            meta: {
                user_name: settings.userName,
                user_email: settings.userEmail,
                user_phone: settings.userPhone
            }
        };
        
        const response = await apiRequest('/config', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        
        return response?.code === 200;
    },
    
    /**
     * Retrieves the server-side status for the current user.
     * Useful for checking if the account is banned or in another state.
     */
    getServerStatus: async (): Promise<{ code: number; data: any } | null> => {
        console.log('[☁️ Status] Fetching server status...');
        const response = await apiRequest('/status', {
            method: 'GET',
        });
        return response;
    },

    /**
     * Requests the server to send a pre-warning notification to the user themselves.
     */
    sendSelfNotification: async (): Promise<boolean> => {
        console.log('[☁️ Notify] Requesting server to send self pre-warning notification...');
        const response = await apiRequest('/notify-self', {
            method: 'POST',
        });
        return response?.code === 200;
    },

    /**
     * Deletes all user data from the server.
     * This is an irreversible action.
     */
    deleteAccount: async (): Promise<boolean> => {
        console.warn('[☁️ Delete] Initiating server data deletion...');
        const response = await apiRequest('/delete', {
            method: 'DELETE',
        });
        return response?.code === 200;
    },
};
