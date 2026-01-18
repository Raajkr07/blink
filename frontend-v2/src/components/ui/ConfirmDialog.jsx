import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    variant = 'danger',
}) {
    return (
        <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {open && (
                    <AlertDialog.Portal forceMount>
                        <AlertDialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[var(--z-modal-backdrop)]"
                            />
                        </AlertDialog.Overlay>

                        <AlertDialog.Content asChild>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                                    'w-full max-w-md',
                                    'glass-strong rounded-xl p-6',
                                    'z-[var(--z-modal)]',
                                    'focus:outline-none'
                                )}
                            >
                                <AlertDialog.Title className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
                                    {title}
                                </AlertDialog.Title>

                                <AlertDialog.Description className="text-sm text-[var(--color-gray-400)] mb-6">
                                    {description}
                                </AlertDialog.Description>

                                <div className="flex items-center justify-end gap-3">
                                    <AlertDialog.Cancel asChild>
                                        <Button variant="ghost">
                                            {cancelText}
                                        </Button>
                                    </AlertDialog.Cancel>
                                    <AlertDialog.Action asChild>
                                        <Button
                                            variant={variant}
                                            onClick={onConfirm}
                                        >
                                            {confirmText}
                                        </Button>
                                    </AlertDialog.Action>
                                </div>
                            </motion.div>
                        </AlertDialog.Content>
                    </AlertDialog.Portal>
                )}
            </AnimatePresence>
        </AlertDialog.Root>
    );
}