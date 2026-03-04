import { useState, useRef, useEffect } from 'react';
import { useNotificationStore, useChatStore, useTabsStore, useUIStore } from '../../stores';
import { Avatar, Button } from '.';
import { cn, formatRelativeTime } from '../../lib/utils';

function BellIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function BellRingIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse text-blue-500">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            <path d="M22 8a10 10 0 0 0-3-7.5" opacity="0.4" />
            <path d="M2 8a10 10 0 0 1 3-7.5" opacity="0.4" />
        </svg>
    );
}

export function NotificationBell() {
    const { notifications, removeNotification, markAllAsRead } = useNotificationStore();
    const { openModal } = useUIStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOpen = () => {
        if (!isOpen) {
            markAllAsRead();
        }
        setIsOpen(!isOpen);
    };

    const handleAction = (notification) => {
        // Based on type, open the correct modal and remove notification
        if (notification.type === 'CHAT_REQUEST') {
            openModal('contactRequest', notification.payload);
        } else if (notification.type === 'INCOMING_CALL') {
            // handle call here, assuming we added it
        } else if (notification.type === 'NEW_MESSAGE') {
            useTabsStore.getState().openTab({ id: notification.payload.conversationId });
            useChatStore.getState().setActiveConversation(notification.payload.conversationId);
            useChatStore.getState().clearUnread(notification.payload.conversationId);
        }
        removeNotification(notification.id);
        setIsOpen(false);
    };

    const handleMouseEnter = () => {
        markAllAsRead();
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        setIsOpen(false);
    };

    return (
        <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleOpen}
                className={cn(
                    "relative w-10 h-10 transition-colors",
                    isOpen ? "bg-[var(--color-border)]" : "hover:bg-[var(--color-border)]",
                    unreadCount > 0 && "text-blue-500"
                )}
            >
                {unreadCount > 0 ? <BellRingIcon /> : <BellIcon />}
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border-2 border-[var(--color-background)]"></span>
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-[-70px] top-full pt-2 w-80 z-50">
                    <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-background)]">
                            <h3 className="font-semibold text-sm">Notifications</h3>
                            {notifications.length > 0 && (
                                <span className="text-xs text-[var(--color-gray-500)]">{notifications.length} total</span>
                            )}
                        </div>

                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-[var(--color-gray-400)] text-sm flex flex-col items-center gap-2">
                                    <BellIcon className="opacity-20 w-8 h-8" />
                                    <p>You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={cn(
                                                "flex items-start gap-3 p-3 border-b border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors group cursor-pointer",
                                                !notif.read && "bg-blue-500/5"
                                            )}
                                            onClick={() => handleAction(notif)}
                                        >
                                            <div className="mt-1">
                                                {notif.avatar ? (
                                                    <Avatar src={notif.avatar} name={notif.title} size="sm" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                                                        <BellIcon />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <span className="font-semibold text-sm text-[var(--color-foreground)] truncate pr-2">
                                                        {notif.title}
                                                    </span>
                                                    <span className="text-[10px] text-[var(--color-gray-500)] whitespace-nowrap">
                                                        {formatRelativeTime(notif.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[var(--color-gray-400)] line-clamp-2">
                                                    {notif.body}
                                                </p>

                                                {notif.type === 'CHAT_REQUEST' ? (
                                                    <div className="flex gap-2 mt-2">
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="h-6 text-[10px] px-3 bg-blue-500 hover:bg-blue-600 text-white"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAction(notif);
                                                            }}
                                                        >
                                                            Review Request
                                                        </Button>
                                                    </div>
                                                ) : notif.type === 'NEW_MESSAGE' ? (
                                                    <div className="flex gap-2 mt-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-6 text-[10px] px-3 text-blue-500 hover:text-blue-600"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAction(notif);
                                                            }}
                                                        >
                                                            Read message
                                                        </Button>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
