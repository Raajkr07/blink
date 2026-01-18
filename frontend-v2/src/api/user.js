import apiClient from './client';

export const userApi = {
    getMe: async () => {
        const response = await apiClient.get('/api/v1/me');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await apiClient.put('/api/v1/me', data);
        return response.data;
    },

    getUserById: async (userId) => {
        const response = await apiClient.get(`/api/v1/users/${userId}`);
        return response.data;
    },

    searchUsers: async (query) => {
        const response = await apiClient.get('/api/v1/users/search', {
            params: { query },
        });
        return response.data;
    },

    isUserOnline: async (userId) => {
        const response = await apiClient.get(`/api/v1/users/${userId}/online`);
        return response.data;
    },

    listOnlineUsers: async () => {
        const response = await apiClient.get('/api/v1/users/online');
        return response.data;
    },

    amIOnline: async () => {
        const response = await apiClient.get('/api/v1/users/me/online');
        return response.data;
    },
};
