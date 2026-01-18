import apiClient from './client';

export const aiApi = {
    getAiConversation: async () => {
        const response = await apiClient.get('/api/v1/ai/conversation');
        return response.data;
    },

    chatWithAi: async (message) => {
        const response = await apiClient.post('/api/v1/ai/chat', { message });
        return response.data;
    },

    generateAutoReplies: async (data) => {
        const response = await apiClient.post('/api/v1/ai/analysis/auto-replies', data);
        return response.data;
    },

    summarizeConversation: async (conversationId) => {
        const response = await apiClient.post(
            `/api/v1/ai/analysis/conversation/${conversationId}/summarize`
        );
        return response.data;
    },

    extractTask: async (text) => {
        const response = await apiClient.post('/api/v1/ai/analysis/extract-task', {
            text,
        });
        return response.data;
    },

    parseSearchQuery: async (query) => {
        const response = await apiClient.post('/api/v1/ai/analysis/search-query', {
            query,
        });
        return response.data;
    },

    simulateTyping: async (text) => {
        const response = await apiClient.post('/api/v1/ai/analysis/typing-indicator', {
            text,
        });
        return response.data;
    },
};
