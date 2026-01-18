import apiClient from './client';

export const callsApi = {
    initiateCall: async (data) => {
        const response = await apiClient.post('/api/v1/calls/initiate', data);
        return response.data;
    },

    acceptCall: async (callId) => {
        const response = await apiClient.post(`/api/v1/calls/${callId}/accept`);
        return response.data;
    },

    rejectCall: async (callId) => {
        const response = await apiClient.post(`/api/v1/calls/${callId}/reject`);
        return response.data;
    },

    endCall: async (callId) => {
        const response = await apiClient.post(`/api/v1/calls/${callId}/end`);
        return response.data;
    },

    getCall: async (callId) => {
        const response = await apiClient.get(`/api/v1/calls/${callId}`);
        return response.data;
    },

    getActiveCalls: async () => {
        const response = await apiClient.get('/api/v1/calls/active');
        return response.data;
    },
};
