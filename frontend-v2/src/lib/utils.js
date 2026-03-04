import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatRelativeTime(date) {
    if (!date) return '';

    const now = new Date();
    const dateStr = typeof date === 'string' && !date.endsWith('Z') && !date.includes('+') ? `${date}Z` : date;
    const then = new Date(dateStr);

    const isToday = now.getDate() === then.getDate() &&
        now.getMonth() === then.getMonth() &&
        now.getFullYear() === then.getFullYear();

    if (isToday) {
        return formatTime(then);
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = yesterday.getDate() === then.getDate() &&
        yesterday.getMonth() === then.getMonth() &&
        yesterday.getFullYear() === then.getFullYear();

    if (isYesterday) {
        return 'Yesterday';
    }

    const day = String(then.getDate()).padStart(2, '0');
    const month = String(then.getMonth() + 1).padStart(2, '0');
    const year = then.getFullYear();
    return `${day}-${month}-${year}`;
}

export function formatTime(date) {
    if (!date) return '';
    const dateStr = typeof date === 'string' && !date.endsWith('Z') && !date.includes('+') ? `${date}Z` : date;
    const d = new Date(dateStr);

    return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

export function truncate(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

export function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function stripMarkdown(text) {
    if (!text) return '';

    return text
        // Remove bold: **text** or __text__
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        // Remove italic: *text* or _text_
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        // Remove inline code: `text`
        .replace(/`(.+?)`/g, '$1')
        // Remove headers: # text, ## text, etc.
        .replace(/^#{1,6}\s+/gm, '')
        // Remove strikethrough: ~~text~~
        .replace(/~~(.+?)~~/g, '$1')
        // Remove HTML comments: <!-- text -->
        .replace(/<!--[\s\S]*?-->/g, '')
        // Clean up any remaining artifacts
        .trim();
}

export function downloadICS({ title, description, startTime, endTime, location }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const start = formatDate(startTime);
    const end = formatDate(endTime) || formatDate(new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString());

    const content = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Blinx AI Assistant//EN',
        'BEGIN:VEVENT',
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description || ''}`,
        `LOCATION:${location || ''}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
