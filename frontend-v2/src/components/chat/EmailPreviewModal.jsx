import { useState, useEffect } from 'react';
import { Modal, ModalFooter, Button, Input } from '../ui';
import { chatService } from '../../services';
import { useChatStore } from '../../stores';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import DOMPurify from 'dompurify';

export function EmailPreviewModal({ isOpen, onClose, emailInfo }) {
    const { activeConversationId } = useChatStore();
    const [isSending, setIsSending] = useState(false);
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [activeTab, setActiveTab] = useState('compose');

    useEffect(() => {
        if (emailInfo) {
            setTo(emailInfo.to || '');
            setSubject(emailInfo.subject || '');
            setBody(emailInfo.body || '');
            setActiveTab('compose');
        }
    }, [emailInfo, isOpen]);

    if (!emailInfo) return null;

    const handleSend = async () => {
        if (!to.trim()) {
            toast.error('Recipient required');
            return;
        }
        if (!subject.trim()) {
            toast.error('Subject required');
            return;
        }
        setIsSending(true);
        try {
            await chatService.sendEmail(to, subject, body, activeConversationId);
            toast.success('Email sent successfully 📧');
            onClose();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to send';
            toast.error(errorMsg);
        } finally {
            setIsSending(false);
        }
    };

    const formattedBody = body.replace(/\n/g, '<br/>');

    return (
        <Modal
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
            title="Send Email"
            description="Compose and send via your linked Google account"
            size="lg"
        >
            <div className="space-y-4 py-2">
                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('compose')}
                        className={cn(
                            "flex-1 text-[10px] uppercase font-semibold tracking-wider py-2 rounded-lg transition-all",
                            activeTab === 'compose'
                                ? "bg-blue-500/10 text-blue-400"
                                : "text-gray-500 hover:text-gray-400"
                        )}
                    >
                        ✏️ Compose
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={cn(
                            "flex-1 text-[10px] uppercase font-semibold tracking-wider py-2 rounded-lg transition-all",
                            activeTab === 'preview'
                                ? "bg-blue-500/10 text-blue-400"
                                : "text-gray-500 hover:text-gray-400"
                        )}
                    >
                        👁️ Preview
                    </button>
                </div>

                {activeTab === 'compose' && (
                    <>
                        <div className="rounded-2xl bg-white/[0.03] border border-white/5 divide-y divide-white/5">
                            <div className="p-4">
                                <label className="text-[10px] uppercase font-medium tracking-wider text-[var(--color-gray-500)] mb-1 block">To</label>
                                <Input
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    placeholder="recipient@example.com"
                                    className="bg-transparent border-none p-0 focus-visible:ring-0 h-auto shadow-none text-[var(--color-foreground)] font-medium"
                                />
                            </div>
                            <div className="p-4">
                                <label className="text-[10px] uppercase font-medium tracking-wider text-[var(--color-gray-500)] mb-1 block">Subject</label>
                                <Input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Email subject"
                                    className="bg-transparent border-none p-0 focus-visible:ring-0 h-auto shadow-none text-[var(--color-foreground)] font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-medium tracking-wider text-[var(--color-gray-500)] mb-2 block px-1">Message</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="w-full p-4 rounded-2xl border border-white/5 bg-white/[0.02] min-h-[200px] text-[var(--color-gray-200)] text-sm leading-relaxed outline-none focus:border-blue-500/30 transition-colors resize-none custom-scrollbar"
                            />
                        </div>
                    </>
                )}

                {activeTab === 'preview' && (
                    <div className="space-y-3">
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500/90 text-[11px] rounded flex items-start gap-2 p-2 px-3 leading-relaxed">
                            <span className="shrink-0 pt-0.5">ℹ️</span>
                            <span><strong>Note:</strong> If default Gmail template does not work then this template will be used to send the mail.</span>
                        </div>
                        <div className="rounded-2xl border border-white/10 overflow-hidden max-h-[420px] overflow-y-auto custom-scrollbar">
                            {/* Email Preview — matches send-mail.html template */}
                            <div style={{ backgroundColor: '#000', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
                                <div style={{ maxWidth: 520, margin: '0 auto', backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 16, overflow: 'hidden' }}>
                                    {/* Header */}
                                    <div style={{ padding: '32px 32px 16px 32px' }}>
                                        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: '#fff' }}>
                                            Blinx<span style={{ color: '#3b82f6' }}>AI</span>
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div style={{ padding: '0 32px 32px 32px', lineHeight: 1.7, fontSize: 14, color: '#d4d4d4' }}>
                                        <div
                                            style={{ lineHeight: 1.7, color: '#d4d4d4' }}
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(formattedBody || '<span style="color:#525252">No content</span>', {
                                                    USE_PROFILES: { html: true }
                                                })
                                            }}
                                        />
                                    </div>
                                    {/* Footer */}
                                    <div style={{ padding: '24px 32px', backgroundColor: '#050505', borderTop: '1px solid #1a1a1a' }}>
                                        <p style={{ fontSize: 11, color: '#525252', margin: '0 0 6px 0', lineHeight: 1.6 }}>
                                            This email was sent from <span style={{ color: '#3b82f6' }}>Blinx AI Assistant</span>.
                                        </p>
                                        <p style={{ fontSize: 11, color: '#525252', margin: '0 0 6px 0', lineHeight: 1.6 }}>
                                            For any inquiries, please contact <span style={{ color: '#3b82f6' }}>support@blinxai.me</span>
                                        </p>
                                        <p style={{ fontSize: 11, color: '#525252', margin: '12px 0 0 0', lineHeight: 1.6 }}>
                                            © 2026 Blinx AI. All rights reserved.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ModalFooter>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Sent via Gmail
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                toast('Draft discarded', { icon: '🗑️' });
                                onClose();
                            }}
                            disabled={isSending}
                            className="text-xs font-medium text-[var(--color-gray-400)]"
                        >
                            Discard
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleSend}
                            disabled={isSending || !to.trim()}
                            loading={isSending}
                            className="text-xs font-semibold h-9 px-6"
                        >
                            Send Email
                        </Button>
                    </div>
                </div>
            </ModalFooter>
        </Modal>
    );
}
