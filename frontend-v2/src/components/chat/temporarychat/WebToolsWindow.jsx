import { useEffect, useMemo, useRef, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui';
import { useTempViewsStore } from '../../../stores';
import { newsService } from '../../../services';
import toast from 'react-hot-toast';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

export function WebToolsWindow({ onClose }) {
    const {
        newsSources,
        addNewsSource,
        removeNewsSource,
        selectNewsSource,
    } = useTempViewsStore();
    const [targetUrl, setTargetUrl] = useState('');
    const [targetAlias, setTargetAlias] = useState('');

    const [isLoadingFeed, setIsLoadingFeed] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [feedItems, setFeedItems] = useState([]);
    const [nextOffset, setNextOffset] = useState(null);
    const [imageFailures, setImageFailures] = useState({});
    const [activeIndex, setActiveIndex] = useState(0);

    const feedContainerRef = useRef(null);
    const PAGE_SIZE = 20;

    const formatWhen = (isoString) => {
        if (!isoString) return null;
        try {
            const date = parseISO(isoString);
            return formatDistanceToNowStrict(date, { addSuffix: true });
        } catch {
            return isoString;
        }
    };

    const normalizedNewsItems = useMemo(() => {
        return (feedItems || []).filter(Boolean);
    }, [feedItems]);

    const selectedSources = useMemo(() => {
        return (newsSources || []).filter((s) => s?.selected);
    }, [newsSources]);

    const selectedSourceUrls = useMemo(() => {
        return selectedSources.map((s) => s.url);
    }, [selectedSources]);

    const normalizeHttpUrl = (rawUrl) => {
        const trimmed = (rawUrl || '').trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
        return `https://${trimmed}`;
    };

    const resolveImageUrl = (rawUrl) => {
        const url = normalizeHttpUrl(rawUrl);
        if (!url) return null;
        // Avoid mixed-content issues when the app is served over https.
        if (typeof window !== 'undefined' && window.location?.protocol === 'https:' && url.startsWith('http://')) {
            return url.replace(/^http:\/\//i, 'https://');
        }
        return url;
    };

    useEffect(() => {
        let isCancelled = false;

        const load = async () => {
            if (!selectedSourceUrls || selectedSourceUrls.length === 0) {
                setFeedItems([]);
                setNextOffset(null);
                return;
            }

            setIsLoadingFeed(true);
            setNextOffset(null);
            try {
                const data = await newsService.getFeed({ sources: selectedSourceUrls, limit: PAGE_SIZE, offset: 0 });
                const items = Array.isArray(data?.items) ? data.items : [];
                const nxt = typeof data?.nextOffset === 'number' ? data.nextOffset : null;
                if (!isCancelled) {
                    setFeedItems(items);
                    setNextOffset(nxt);
                }
            } catch (err) {
                if (!isCancelled) {
                    setFeedItems([]);
                    setNextOffset(null);
                    toast.error(err?.message || 'Failed to load news feed.');
                }
            } finally {
                if (!isCancelled) setIsLoadingFeed(false);
            }
        };

        load();
        return () => {
            isCancelled = true;
        };
    }, [selectedSourceUrls]);

    const handleLoadMore = async () => {
        if (!selectedSourceUrls || selectedSourceUrls.length === 0) return;
        if (isLoadingFeed || isLoadingMore) return;
        if (typeof nextOffset !== 'number') return;

        setIsLoadingMore(true);
        try {
            const data = await newsService.getFeed({
                sources: selectedSourceUrls,
                limit: PAGE_SIZE,
                offset: nextOffset,
            });
            const items = Array.isArray(data?.items) ? data.items : [];
            const nxt = typeof data?.nextOffset === 'number' ? data.nextOffset : null;
            setFeedItems((prev) => [...(prev || []), ...items]);
            setNextOffset(nxt);
        } catch (err) {
            toast.error(err?.message || 'Failed to load more news.');
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleAddLink = () => {
        const trimmed = targetUrl.trim();
        if (!trimmed) {
            toast.error('Please enter a URL.');
            return;
        }

        addNewsSource({ url: trimmed, alias: targetAlias.trim() });
        setTargetUrl('');
        setTargetAlias('');
    };

    const handleOpenUrl = (url) => {
        try {
            const normalized = normalizeHttpUrl(url);
            if (!normalized) throw new Error('Missing url');
            window.open(normalized, '_blank', 'noopener,noreferrer');
        } catch {
            toast.error('Unable to open the link.');
        }
    };

    const clickTimersRef = useRef(new Map());

    const handleSourceTap = (source) => {
        // Reset active index when source changes
        setActiveIndex(0);
        const key = source.id;
        const existingTimer = clickTimersRef.current.get(key);
        if (existingTimer) {
            clearTimeout(existingTimer);
            clickTimersRef.current.delete(key);
            handleOpenUrl(source.url.startsWith('http') ? source.url : `https://${source.url}`);
            return;
        }

        const timer = setTimeout(() => {
            clickTimersRef.current.delete(key);
            selectNewsSource(source.id);
        }, 240);

        clickTimersRef.current.set(key, timer);
    };

    const FeedSkeleton = () => {
        return (
            <div className="relative w-full flex-1 min-h-[600px] max-h-[700px] overflow-hidden rounded-2xl bg-[var(--color-background)]/40 border border-[var(--color-border)] shadow-xl animate-pulse">
                {/* Hero Image Skeleton */}
                <div className="w-full h-1/2 bg-[var(--color-foreground)]/5 border-b border-[var(--color-border)]" />

                {/* Content Skeleton */}
                <div className="p-6 lg:p-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="h-4 w-24 bg-[var(--color-foreground)]/10 rounded-full" />
                        <div className="h-3 w-32 bg-[var(--color-foreground)]/5 rounded-full" />
                    </div>

                    <div className="space-y-3">
                        <div className="h-8 w-full bg-[var(--color-foreground)]/10 rounded-lg" />
                        <div className="h-8 w-3/4 bg-[var(--color-foreground)]/10 rounded-lg" />
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="h-4 w-full bg-[var(--color-foreground)]/5 rounded" />
                        <div className="h-4 w-11/12 bg-[var(--color-foreground)]/5 rounded" />
                        <div className="h-4 w-4/5 bg-[var(--color-foreground)]/5 rounded" />
                    </div>

                    <div className="pt-4">
                        <div className="h-5 w-40 bg-emerald-500/10 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    };
    const handleNextNews = () => {
        if (activeIndex < normalizedNewsItems.length - 1) {
            setActiveIndex((prev) => prev + 1);
        } else if (typeof nextOffset === 'number' && !isLoadingMore) {
            handleLoadMore().then(() => setActiveIndex((prev) => prev + 1));
        }
    };

    const handlePrevNews = () => {
        if (activeIndex > 0) {
            setActiveIndex((prev) => prev - 1);
        }
    };

    return (
        <Motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 15 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
            className="flex-1 flex flex-col h-full bg-[var(--color-background)] text-[var(--color-foreground)]"
        >
            {/* Header */}
            <div className="h-14 px-6 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-background)]/40 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2Z" />
                            <path d="M17 20v-8H7v8" />
                            <path d="M7 8h8" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="font-semibold text-emerald-400 text-sm tracking-wide leading-none mb-1">Today’s News</h1>
                        <p className="text-[10px] text-[var(--color-gray-500)] leading-none">Select a source on the right. Swipe or scroll to read.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-[var(--color-gray-500)] hover:text-[var(--color-foreground)] rounded-full hover:bg-[var(--color-foreground)]/10">
                        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                        </svg>
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative z-10">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col px-4 py-6 relative">
                    <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col relative">
                        {isLoadingFeed && normalizedNewsItems.length === 0 ? (
                            <FeedSkeleton />
                        ) : null}

                        {!isLoadingFeed && normalizedNewsItems.length === 0 ? (
                            <div className="text-center py-16 bg-[var(--color-background)]/60 border border-[var(--color-border)] rounded-2xl">
                                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2Z" />
                                        <path d="M8 7h6" />
                                        <path d="M8 11h8" />
                                        <path d="M8 15h8" />
                                    </svg>
                                </div>
                                <p className="text-sm text-[var(--color-gray-400)] mt-4">No source selected.</p>
                                <p className="text-xs text-[var(--color-gray-500)] mt-1">Select a source on the right, or add one.</p>
                            </div>
                        ) : (
                            <div
                                ref={feedContainerRef}
                                className="relative w-full flex-1 min-h-[600px] max-h-[700px] overflow-hidden rounded-2xl bg-[var(--color-background)]/40 border border-[var(--color-border)] shadow-xl touch-pan-y"
                                onWheel={(e) => {
                                    if (e.deltaY > 50) handleNextNews();
                                    else if (e.deltaY < -50) handlePrevNews();
                                }}
                                onTouchStart={(e) => {
                                    feedContainerRef.current.touchStartY = e.changedTouches[0].screenY;
                                }}
                                onTouchEnd={(e) => {
                                    const endY = e.changedTouches[0].screenY;
                                    const diff = feedContainerRef.current.touchStartY - endY;
                                    if (diff > 50) handleNextNews();
                                    else if (diff < -50) handlePrevNews();
                                }}
                            >
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {normalizedNewsItems.map((item, idx) => {
                                        if (idx !== activeIndex) return null;
                                        const imgUrl = resolveImageUrl(item.imageUrl);
                                        const canShowImg = !!imgUrl && !imageFailures[imgUrl];

                                        return (
                                            <Motion.div
                                                key={item.id || item.url || idx}
                                                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                                className="absolute inset-0 flex flex-col w-full h-full bg-[var(--color-background)]"
                                            >
                                                {canShowImg && (
                                                    <div className="relative w-full h-1/2 shrink-0 overflow-hidden bg-[var(--color-background)] border-b border-[var(--color-border)]">
                                                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] to-transparent z-10" />
                                                        <img
                                                            src={imgUrl}
                                                            alt={item.title || 'News image'}
                                                            className="w-full h-full object-cover"
                                                            loading="eager"
                                                            onError={() => {
                                                                setImageFailures((prev) => ({ ...prev, [imgUrl]: true }));
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 ${!canShowImg ? 'mt-8' : ''}`}>
                                                    <div className="flex items-center gap-2 mb-4 text-xs font-medium text-emerald-500">
                                                        {item.source && <span className="bg-emerald-500/10 px-2 py-1 rounded-full">{item.source}</span>}
                                                        {item.publishedAt && <span className="text-[var(--color-gray-500)] ml-auto">{formatWhen(item.publishedAt)}</span>}
                                                    </div>

                                                    <h3 className="text-2xl lg:text-3xl font-bold leading-tight text-[var(--color-foreground)] mb-4">
                                                        {item.title}
                                                    </h3>

                                                    {item.summary ? (
                                                        <p className="text-base lg:text-lg leading-relaxed text-[var(--color-gray-300)] opacity-90 pb-6">
                                                            {item.summary}...{' '}
                                                            <button
                                                                onClick={() => handleOpenUrl(item.url)}
                                                                className="text-emerald-500 hover:text-emerald-400 font-semibold inline-flex items-center group transition-colors ml-1 whitespace-nowrap"
                                                            >
                                                                Read full article
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 group-hover:translate-x-0.5 transition-transform">
                                                                    <path d="M5 12h14" />
                                                                    <polyline points="12 5 19 12 12 19" />
                                                                </svg>
                                                            </button>
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-[var(--color-gray-500)] break-all pb-6">
                                                            {item.url}...{' '}
                                                            <button
                                                                onClick={() => handleOpenUrl(item.url)}
                                                                className="text-emerald-500 hover:text-emerald-400 font-semibold inline-flex items-center group transition-colors ml-1 whitespace-nowrap"
                                                            >
                                                                Read full article
                                                            </button>
                                                        </p>
                                                    )}
                                                </div>
                                            </Motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Status bar */}
                        {normalizedNewsItems.length > 0 && (
                            <div className="text-center mt-3 text-[11px] font-medium tracking-widest text-[var(--color-gray-500)] uppercase">
                                Article {activeIndex + 1} of {normalizedNewsItems.length}
                                {isLoadingMore && <span className="ml-2 animate-pulse text-emerald-400">Loading more...</span>}
                            </div>
                        )}
                    </div>

                    {/* Navigation Arrows outside the news frame, left side of right sidebar */}
                    {normalizedNewsItems.length > 0 && (
                        <div className="absolute right-6 bottom-6 flex flex-col gap-2 z-20">
                            <button
                                onClick={handlePrevNews}
                                disabled={activeIndex === 0}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-background)] border border-[var(--color-border)] shadow-xl text-[var(--color-foreground)] hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-30 disabled:hover:bg-[var(--color-background)] transition-all"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="18 15 12 9 6 15" />
                                </svg>
                            </button>
                            <button
                                onClick={handleNextNews}
                                disabled={activeIndex === normalizedNewsItems.length - 1 && !nextOffset}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-background)] border border-[var(--color-border)] shadow-xl text-[var(--color-foreground)] hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-30 disabled:hover:bg-[var(--color-background)] transition-all"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar area for successful websites */}
                <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-[var(--color-border)] bg-[var(--color-background)]/50 py-4 pr-4 pl-6 overflow-y-auto">
                    <h3 className="text-xs font-semibold text-[var(--color-gray-400)] uppercase tracking-wider mb-3 border-b border-[var(--color-border)] pb-2">Link Attachments</h3>

                    <div className="mb-4">
                        <label className="block text-[11px] text-[var(--color-gray-500)] mb-2">Add source URL + alias</label>
                        <div className="space-y-3 mt-1">
                            <input
                                type="text"
                                value={targetAlias}
                                onChange={(e) => setTargetAlias(e.target.value)}
                                placeholder="Alias (e.g. Way2News)"
                                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[13px] font-medium text-[var(--color-foreground)] focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all shadow-sm placeholder-[var(--color-gray-500)]"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={targetUrl}
                                    onChange={(e) => setTargetUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="flex-1 min-w-0 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[13px] text-[var(--color-foreground)] focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all shadow-sm font-mono placeholder-[var(--color-gray-500)]"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddLink();
                                    }}
                                />
                                <Button
                                    onClick={handleAddLink}
                                    variant="default"
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-5 shadow-sm hover:shadow-emerald-500/20 transition-all"
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                        <p className="mt-2 text-[11px] text-[var(--color-gray-500)]">Tap once to select source • tap twice to open source</p>
                    </div>

                    {(!newsSources || newsSources.length === 0) ? (
                        <p className="text-xs text-[var(--color-gray-500)] text-center py-4">No links added yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {newsSources.map((source) => (
                                <li key={source.id}>
                                    <div className={`w-full p-3 rounded-xl border transition-all shadow-sm text-sm flex items-center gap-3 group ${source.selected ? 'border-emerald-500/50 bg-emerald-500/10' : 'bg-[var(--color-background)]/60 border-[var(--color-border)] hover:border-emerald-500/50 hover:bg-emerald-500/10'} `}>
                                        <button
                                            type="button"
                                            onClick={() => handleSourceTap(source)}
                                            className="flex items-center gap-3 min-w-0 flex-1 text-left"
                                        >
                                            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="truncate group-hover:text-emerald-400 transition-colors font-semibold">{source.alias || source.url}</span>
                                                    {source.selected ? <span className="text-[10px] text-emerald-400/90">Selected</span> : null}
                                                </div>
                                                <div className="text-[11px] text-[var(--color-gray-500)] truncate mt-0.5">{source.url}</div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                removeNewsSource(source.id);
                                            }}
                                            aria-label={`Remove ${source.url}`}
                                            className="shrink-0 rounded-lg p-2 text-[var(--color-gray-500)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/10 transition-colors"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18" />
                                                <path d="M8 6V4h8v2" />
                                                <path d="M19 6l-1 14H6L5 6" />
                                                <path d="M10 11v6" />
                                                <path d="M14 11v6" />
                                            </svg>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </Motion.div>
    );
}
