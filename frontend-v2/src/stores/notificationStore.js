import { create } from 'zustand';

// Simple store to hold notifications across the app
export const useNotificationStore = create((set) => ({
    notifications: [],

    // Add a new notification
    addNotification: (notification) => set((state) => {
        // Remove existing notification with same id to push updated one to top
        const filtered = notification.id
            ? state.notifications.filter(n => n.id !== notification.id)
            : state.notifications;

        return {
            notifications: [
                {
                    id: notification.id || Date.now().toString(),
                    createdAt: Date.now(),
                    read: false,
                    ...notification
                },
                ...filtered
            ]
        };
    }),

    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
    })),

    // Mark as read when the list is opened
    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
    })),

    clearAll: () => set({ notifications: [] })
}));
