import { cn } from '../../lib/utils';

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-lg bg-gray-900',
                className
            )}
            {...props}
        />
    );
}

export function SkeletonText({ lines = 3, className }) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        'h-4',
                        i === lines - 1 && 'w-3/4'
                    )}
                />
            ))}
        </div>
    );
}

export function SkeletonAvatar({ size = 'md' }) {
    const sizes = {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
    };

    return <Skeleton className={cn('rounded-full', sizes[size])} />;
}

export function SkeletonCard({ className }) {
    return (
        <div className={cn('glass rounded-lg p-4 space-y-3', className)}>
            <div className="flex items-center gap-3">
                <SkeletonAvatar />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <SkeletonText lines={2} />
        </div>
    );
}

export function SkeletonConversation() {
    return (
        <div className="flex items-center gap-3 p-3">
            <SkeletonAvatar size="lg" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-3 w-12" />
        </div>
    );
}

export function SkeletonMessage({ isOwn = false }) {
    return (
        <div className={cn('flex gap-3', isOwn && 'flex-row-reverse')}>
            <SkeletonAvatar size="sm" />
            <div className="space-y-2 max-w-xs">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
        </div>
    );
}
