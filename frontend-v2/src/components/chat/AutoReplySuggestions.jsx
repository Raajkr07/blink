import { useQuery } from '@tanstack/react-query';
import { aiApi } from '../../api';
import { cn } from '../../lib/utils';

export function AutoReplySuggestions({ conversationId, messageId, messageContent, senderId, onSend }) {
    const { data: suggestions, isLoading } = useQuery({
        queryKey: ['autoReplies', conversationId, messageId],
        queryFn: () => aiApi.generateAutoReplies({
            messageId,
            content: messageContent,
            senderId,
        }),
        enabled: !!messageId && !!messageContent && !!conversationId,
        staleTime: 5 * 60 * 1000,
    });

    if (!messageId || !messageContent || !conversationId) return null;

    const replies = suggestions?.suggested_replies || [];
    const filteredReplies = replies
        .map(reply => {
            const words = reply.trim().split(/\s+/);
            if (words.length > 7) {
                return words.slice(0, 7).join(' ') + '...';
            }
            return reply;
        })
        .filter(reply => {
            const words = reply.replace('...', '').trim().split(/\s+/);
            return words.length >= 4;
        });

    if (isLoading) {
        return (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="px-4 py-2 rounded-full bg-[var(--color-border)] animate-pulse min-w-[120px] h-9"
                    />
                ))}
            </div>
        );
    }

    if (filteredReplies.length === 0) return null;

    return (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {filteredReplies.map((suggestion, index) => (
                <button
                    key={index}
                    onClick={() => onSend && onSend(suggestion)}
                    className={cn(
                        'px-4 py-2 rounded-full whitespace-nowrap',
                        'bg-[var(--color-border)] text-[var(--color-foreground)]',
                        'hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)]',
                        'transition-all',
                        'border border-[var(--color-border)]',
                        'flex-shrink-0'
                    )}
                >
                    {suggestion}
                </button>
            ))}
        </div>
    );
}
