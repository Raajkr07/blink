import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../../lib/utils';

export function Dropdown({ trigger, children, align = 'start' }) {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                {trigger}
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align={align}
                    sideOffset={8}
                    className={cn(
                        'min-w-[200px]',
                        'glass-strong rounded-lg p-1',
                        'z-[9999]',
                        'shadow-xl pointer-events-auto',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
                    )}
                >
                    {children}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

export function DropdownItem({ children, onClick, icon, destructive = false }) {
    return (
        <DropdownMenu.Item
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md',
                'text-sm cursor-pointer',
                'transition-colors',
                'focus:outline-none',
                destructive
                    ? 'text-red-400 hover:bg-red-500/10 focus:bg-red-500/10'
                    : 'text-[var(--color-foreground)] hover:bg-[var(--color-border)] focus:bg-[var(--color-border)]'
            )}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
        </DropdownMenu.Item>
    );
}

export function DropdownSeparator() {
    return (
        <DropdownMenu.Separator className="h-px bg-gray-800 my-1" />
    );
}

export function DropdownLabel({ children }) {
    return (
        <DropdownMenu.Label className="px-3 py-2 text-xs font-medium text-gray-500">
            {children}
        </DropdownMenu.Label>
    );
}
