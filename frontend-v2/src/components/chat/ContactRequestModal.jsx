import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../../services';
import { queryKeys } from '../../lib/queryClient';
import { Modal, Avatar, Button, ModalFooter } from '../ui';
import toast from 'react-hot-toast';

export function ContactRequestModal({ open, onOpenChange, requestData }) {
    const queryClient = useQueryClient();

    const acceptMutation = useMutation({
        mutationFn: () => chatService.createDirectChat(requestData.senderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
            onOpenChange(false);
            toast.success('Chat request accepted!');
        },
        onError: () => toast.error('Failed to accept request'),
    });

    if (!requestData) return null;

    return (
        <Modal open={open} onOpenChange={onOpenChange} title="Message Request" size="sm">
            <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
                <Avatar src={requestData.senderAvatar} name={requestData.senderName} size="xl" />
                <div>
                    <h3 className="text-lg font-bold text-foreground">{requestData.senderName}</h3>
                    <p className="text-sm text-gray-400 mt-1">wants to start a conversation with you.</p>
                </div>
            </div>

            <ModalFooter>
                <div className="flex gap-2 w-full">
                    <Button
                        variant="ghost"
                        className="flex-1 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => onOpenChange(false)}
                        disabled={acceptMutation.isPending}
                    >
                        Decline
                    </Button>
                    <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => acceptMutation.mutate()}
                        disabled={acceptMutation.isPending}
                    >
                        {acceptMutation.isPending ? 'Accepting...' : 'Accept Request'}
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
}
