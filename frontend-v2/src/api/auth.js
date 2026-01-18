import apiClient from './client';

export const authApi = {
    requestOtp: async (identifier, email = null) => {
        const response = await apiClient.post('/api/v1/auth/request-otp', {
            identifier,
            email,
        });
        return response.data;
    },

    verifyOtp: async (identifier, otp) => {
        const response = await apiClient.post('/api/v1/auth/verify-otp', {
            identifier,
            otp,
        });
        return response.data;
    },

    signup: async (data) => {
        const response = await apiClient.post('/api/v1/auth/signup', data);
        return response.data;
    },

    login: async (data) => {
        const response = await apiClient.post('/api/v1/auth/login', data);
        return response.data;
    },

    refreshToken: async (refreshToken) => {
        const response = await apiClient.post('/api/v1/auth/refresh', {
            refreshToken,
        });
        return response.data;
    },

    logout: async (refreshToken) => {
        const response = await apiClient.post('/api/v1/auth/logout', {
            refreshToken,
        });
        return response.data;
    },

    ping: async () => {
        const response = await apiClient.get('/api/v1/auth/ping');
        return response.data;
    },
};
