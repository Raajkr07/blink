import axios from 'axios';
import { env } from '../config/env';
import { storage, STORAGE_KEYS } from '../lib/storage';

const apiClient = axios.create({
    baseURL: env.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => {
        // Unwrap Spring-wrapped responses to extract actual payload
        if (response.data && Array.isArray(response.data) && response.data.length === 2 &&
            typeof response.data[0] === 'string' &&
            (response.data[0].includes('java.util') || response.data[0].includes('org.springframework'))) {
            response.data = response.data[1];
        }

        const cleanData = (data) => {
            if (!data) return data;
            if (Array.isArray(data)) {
                if (data.length === 2 && typeof data[0] === 'string' && (data[0].includes('java.util') || data[0].includes('org.springframework'))) {
                    return cleanData(data[1]);
                }
                return data.map(cleanData);
            }
            if (typeof data === 'object') {
                const { '@class': _, ...rest } = data;
                Object.keys(rest).forEach(key => {
                    rest[key] = cleanData(rest[key]);
                });
                return rest;
            }
            return data;
        };

        response.data = cleanData(response.data);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);

                if (!refreshToken) {
                    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
                    storage.remove(STORAGE_KEYS.USER);
                    window.location.href = '/auth';
                    return Promise.reject(error);
                }

                const response = await axios.post(
                    `${env.API_BASE_URL}/api/v1/auth/refresh`,
                    { refreshToken }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
                if (newRefreshToken) {
                    storage.set(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
                }

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
                storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
                storage.remove(STORAGE_KEYS.USER);
                window.location.href = '/auth';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
