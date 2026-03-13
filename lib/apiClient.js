/**
 * Central API Client Wrapper
 * Assists in adding necessary headers to every fetch request.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz';
// Note: We use /api/v1 instead of /api universally now.
const API_URL = `${BASE_URL.replace(/\/api\/?$/, '')}/api/v1`;

const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('userToken');
    }
    return null;
};

const getDeviceHeaders = () => {
    let deviceId = 'unknown';

    // Try to get or create a persistent deviceId in localStorage for this app install
    if (typeof window !== 'undefined') {
        deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = `dev_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
            localStorage.setItem('deviceId', deviceId);
        }
    }

    return {
        'x-client-platform': 'web', // Since this is a Next.js web application
        'x-app-version': '1.0.0', // Update matching package.json or hardcode version
        'x-device-model': typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
        'x-device-id': deviceId,
        'x-install-time': (() => {
            if (typeof window === 'undefined') return '';
            let installTime = localStorage.getItem('installTime');
            if (!installTime) {
                installTime = String(Date.now());
                localStorage.setItem('installTime', installTime);
            }
            return installTime;
        })()
    };
};

/**
 * Custom fetch wrapper that automatically appends headers and v1 base URL.
 * 
 * @param {string} endpoint - The path to fetch e.g., '/tests' or '/auth/login-password'. Should start with '/'.
 * @param {object} options - Standard fetch options like method, headers, body, etc.
 * @returns {Promise<Response>} 
 */
export const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    const token = getAuthToken();
    const deviceHeaders = getDeviceHeaders();

    const headers = {
        'Content-Type': 'application/json',
        ...deviceHeaders,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const config = {
        ...options,
        headers
    };

    return fetch(url, config);
};
