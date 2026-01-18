import { useQuery } from '@tanstack/react-query';
import { chatApi, userApi } from '../../api';
import { queryKeys } from '../../lib/queryClient';
import { useChatStore, useTabsStore, useAuthStore } from '../../stores';
import { Avatar, SkeletonConversation, EmptyState, NoConversationsIcon } from '../ui';
import { cn, formatRelativeTime, truncate } from '../../lib/utils';

export function ConversationList() {
    const { activeConversationId, setActiveConversation } = useChatStore();
    const { openTab, getTabByConversationId } = useTabsStore();
    const { user: currentUser } = useAuthStore();

    const { data: conversations, isLoading, error } = useQuery({
        queryKey: queryKeys.conversations,
        queryFn: chatApi.listConversations,
    });
    const handleConversationClick = (conversation, event) => {
        if (event.ctrlKey || event.metaKey) {
            openTab(conversation);
        } else {
            setActiveConversation(conversation.id);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-1">
                {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonConversation key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <EmptyState
                icon={<NoConversationsIcon />}
                title="Failed to load conversations"
                description="Please try again later"
            />
        );
    }

    if (!conversations || conversations.length === 0) {
        return (
            <EmptyState
                icon={<NoConversationsIcon />}
                title="No conversations yet"
                description="Start a new chat to begin messaging"
            />
        );
    }
    return (
        <div className="space-y-1">
            {conversations.map((conversation) => {
                const hasTab = getTabByConversationId(conversation.id);
                return (
                    <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        currentUser={currentUser}
                        isActive={activeConversationId === conversation.id}
                        hasTab={!!hasTab}
                        onClick={(e) => handleConversationClick(conversation, e)}
                    />
                );
            })}
        </div>
    );
}

function ConversationItem({ conversation, currentUser, isActive, hasTab, onClick }) {
    const isGroup = conversation.type === 'GROUP' || conversation.type === 'COMMUNITY';
    const isAI = conversation.type === 'AI_ASSISTANT';

    const otherUserId = !isGroup && !isAI && currentUser
        ? conversation.participants?.find((p) => {
            const id = typeof p === 'string' ? p : p.id;
            return id !== currentUser.id;
        })
        : null;

    const { data: otherUser } = useQuery({
        queryKey: ['user', otherUserId],
        queryFn: () => userApi.getUserById(otherUserId),
        enabled: !!otherUserId && !conversation.title,
        staleTime: 1000 * 60 * 5,
    });

    let displayTitle = conversation.title;
    let displayAvatar = conversation.avatarUrl;

    if (otherUser) {
        displayTitle = displayTitle || otherUser.username || otherUser.name;
        displayAvatar = displayAvatar || otherUser.avatarUrl;
    }

    if (!isGroup && !isAI && currentUser) {
        const otherParticipant = conversation.participants?.find(
            p => (p.id || p) !== currentUser.id
        );

        if (otherParticipant && typeof otherParticipant === 'object') {
            displayTitle = displayTitle || otherParticipant.username || otherParticipant.name;
            displayAvatar = displayAvatar || otherParticipant.avatarUrl;
        }
    }

    displayTitle = displayTitle || 'Unknown Chat';

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full px-4 py-3 flex items-center gap-3',
                'hover:bg-[var(--color-border)] transition-colors',
                'border-b border-[var(--color-border)]',
                'text-left relative',
                isActive && 'bg-[var(--color-border)] border-l-2 border-l-[var(--color-foreground)]'
            )}
            title="Click to open, Ctrl+Click to open in new tab"
        >
            {hasTab && (
                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500" />
            )}
            <Avatar
                src={displayAvatar}
                name={displayTitle}
                size="lg"
                online={false}
            />

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-[var(--color-foreground)] truncate">
                        {displayTitle}
                    </h3>
                    {conversation.lastMessageAt && (
                        <span className="text-xs text-[var(--color-gray-500)] flex-shrink-0 ml-2">
                            {formatRelativeTime(conversation.lastMessageAt)}
                        </span>
                    )}
                </div>
                {conversation.lastMessagePreview && (
                    <p className="text-sm text-[var(--color-gray-400)] truncate">
                        {truncate(conversation.lastMessagePreview, 60)}
                    </p>
                )}
            </div>

            <div className="flex flex-col items-end gap-1">
                {isGroup && (
                    <span className="text-xs text-[var(--color-gray-500)]">
                        {conversation.participants?.length || 0} members
                    </span>
                )}
                {isAI && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-border)] text-[var(--color-foreground)]">
                        AI
                    </span>
                )}
            </div>
        </button>
    );
}
