import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { userService, authService } from '../../services';
import { useAuthStore, useUIStore } from '../../stores';
import { Button, Input, Avatar } from '../ui';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

export function SettingsPanel({ onClose }) {
    const { user, setUser, logout } = useAuthStore();
    const {
        showAISuggestions, toggleAISuggestions,
        emailNotifications, toggleEmailNotifications,
        slashCommands, toggleSlashCommands
    } = useUIStore();
    const [activeSection, setActiveSection] = useState('profile');
    const [isRevokingGoogle, setIsRevokingGoogle] = useState(false);
    const [isDisconnectingGoogle, setIsDisconnectingGoogle] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const [isGoogleLinked, setIsGoogleLinked] = useState(false);
    const [isCheckingGoogle, setIsCheckingGoogle] = useState(false);
    const [formData, setFormData] = useState(() => ({
        username: user?.username || '',
        bio: user?.bio || '',
        avatarUrl: user?.avatarUrl || '',
        email: user?.email || '',
        phone: user?.phone || '',
    }));

    const updateProfileMutation = useMutation({
        mutationFn: (data) => userService.updateProfile(data),
        onSuccess: (updatedUser) => {
            setUser(updatedUser);
            toast.success('Profile updated');
        },
        onError: () => toast.error('Update failed'),
    });

    const deleteAccountMutation = useMutation({
        mutationFn: () => userService.deleteAccount(),
        onSuccess: async () => {
            toast.success('Account deleted');
            await logout();
        },
        onError: () => toast.error('Failed to delete account'),
    });

    const deactivateAccountMutation = useMutation({
        mutationFn: () => userService.deactivateAccount(),
        onSuccess: async () => {
            toast.success('Account deactivated');
            await logout();
        },
        onError: () => toast.error('Failed to deactivate account'),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            username: formData.username.trim()
        };
        updateProfileMutation.mutate(payload);
    };

    // Check Google link status when Accounts tab is opened
    useEffect(() => {
        if (activeSection === 'accounts') {
            setIsCheckingGoogle(true);
            authService.getGoogleStatus()
                .then(res => setIsGoogleLinked(res.linked))
                .catch(() => setIsGoogleLinked(false))
                .finally(() => setIsCheckingGoogle(false));
        }
    }, [activeSection]);

    const handleDisconnectGoogle = async () => {
        setIsDisconnectingGoogle(true);
        try {
            await authService.logoutGoogle();
            setIsGoogleLinked(false);
            toast.success('Google account disconnected');
        } catch { toast.error('Failed to disconnect'); }
        finally { setIsDisconnectingGoogle(false); }
    };

    const handleRevokeGoogle = async () => {
        setIsRevokingGoogle(true);
        try {
            await authService.revokeGoogleAccess();
            setIsGoogleLinked(false);
            toast.success('Google access revoked');
        } catch (err) {
            const msg = err?.response?.status === 404
                ? 'No Google account linked'
                : 'Failed to revoke';
            toast.error(msg);
        }
        finally { setIsRevokingGoogle(false); }
    };

    const navItems = [
        { id: 'profile', label: 'Profile', icon: <UserIcon /> },
        { id: 'accounts', label: 'Accounts', icon: <LinkIcon /> },
        { id: 'preferences', label: 'Preferences', icon: <GearIcon /> },
        { id: 'danger', label: 'Danger Zone', icon: <WarningIcon /> },
    ];

    return (
        <div className="flex h-full">
            {/* Sidebar nav */}
            <div className="w-56 border-r border-[var(--color-border)] bg-[var(--color-background)] flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-foreground)]">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-[var(--color-gray-400)] hover:text-[var(--color-foreground)]"
                    >
                        <CloseIcon />
                    </button>
                </div>
                <nav className="flex-1 p-2 space-y-0.5">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all",
                                activeSection === item.id
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "text-[var(--color-gray-400)] hover:bg-white/5 hover:text-[var(--color-foreground)]",
                                item.id === 'danger' && activeSection !== 'danger' && "text-red-400/60 hover:text-red-400"
                            )}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-lg mx-auto p-6 space-y-6">

                    {activeSection === 'profile' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col items-center py-3">
                                <div className="relative group mb-3">
                                    <Avatar
                                        src={formData.avatarUrl}
                                        name={formData.username}
                                        size="xl"
                                        className="w-24 h-24 ring-2 ring-white/10 shadow-xl"
                                    />
                                </div>
                                <p className="text-[10px] uppercase font-semibold tracking-wider text-gray-500">Profile photo</p>
                            </div>

                            <section>
                                <h4 className="text-[10px] uppercase font-semibold tracking-wider text-gray-500 mb-2 px-1">Profile</h4>
                                <div className="rounded-2xl bg-white/3 border border-white/5 divide-y divide-white/5">
                                    <div className="p-4">
                                        <label className="text-[10px] uppercase font-medium tracking-wider text-gray-500 mb-1 block">Username</label>
                                        <Input
                                            id="settings-username"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="Your display name"
                                            className="bg-transparent border-white/5 focus:border-blue-500/40 h-10"
                                            required
                                        />
                                    </div>
                                    <div className="p-4">
                                        <label className="text-[10px] uppercase font-medium tracking-wider text-gray-500 mb-1 block">Bio</label>
                                        <Input
                                            id="settings-bio"
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder="A short description about you"
                                            className="bg-transparent border-white/5 focus:border-blue-500/40 h-10"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <label className="text-[10px] uppercase font-medium tracking-wider text-gray-500 mb-1 block">Avatar URL</label>
                                        <Input
                                            id="settings-avatar-url"
                                            value={formData.avatarUrl}
                                            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                            placeholder="https://..."
                                            className="bg-transparent border-white/5 focus:border-blue-500/40 h-10"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-[10px] uppercase font-semibold tracking-wider text-gray-500 mb-3 px-1">Contact</h4>
                                <div className="rounded-2xl bg-white/3 border border-white/5 divide-y divide-white/5">
                                    <div className="p-4">
                                        <label className="text-[10px] uppercase font-medium tracking-wider text-gray-500 mb-1 block">Email</label>
                                        <Input
                                            id="settings-email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="you@example.com"
                                            className="bg-transparent border-white/5 focus:border-blue-500/40 h-10"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <label className="text-[10px] uppercase font-medium tracking-wider text-gray-500 mb-1 block">Phone</label>
                                        <Input
                                            id="settings-phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91 00000-00000"
                                            className="bg-transparent border-white/5 focus:border-blue-500/40 h-10"
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="ghost" onClick={onClose} className="text-xs font-medium text-gray-400">Cancel</Button>
                                <Button type="submit" variant="default" loading={updateProfileMutation.isPending} className="text-xs font-semibold h-9 px-6">Save Changes</Button>
                            </div>
                        </form>
                    )}

                    {activeSection === 'accounts' && (
                        <section className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-[var(--color-foreground)] mb-1">Accounts</h3>
                                <p className="text-xs text-gray-500">Manage linked accounts and integrations</p>
                            </div>

                            <div className="rounded-2xl bg-white/3 border border-white/5 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <GoogleIcon />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-foreground">Google</p>
                                            <p className="text-[10px] text-gray-500">
                                                {isCheckingGoogle ? 'Checking...' : isGoogleLinked ? 'Connected — used for email & calendar' : 'Not connected'}
                                            </p>
                                        </div>
                                    </div>
                                    {!isCheckingGoogle && (
                                        <span className={cn(
                                            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                                            isGoogleLinked
                                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                : "bg-white/5 text-gray-500 border border-white/10"
                                        )}>
                                            {isGoogleLinked ? 'Linked' : 'Not Linked'}
                                        </span>
                                    )}
                                </div>

                                {isGoogleLinked ? (
                                    <>
                                        <div className="flex gap-2 pt-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleDisconnectGoogle}
                                                loading={isDisconnectingGoogle}
                                                className="text-[10px] font-semibold text-gray-400 h-8 px-3"
                                            >
                                                Disconnect
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRevokeGoogle}
                                                loading={isRevokingGoogle}
                                                className="text-[10px] font-semibold text-red-400 hover:bg-red-500/10 h-8 px-3"
                                            >
                                                Revoke Access
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-gray-500 pt-1">
                                            Disconnecting will sign out of Google. Revoking will remove all Google permissions and stored tokens.
                                            An email confirmation will be sent for both actions.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={async () => {
                                                try {
                                                    const res = await authService.initGoogleAuth(window.location.href);
                                                    if (res?.url) window.location.href = res.url;
                                                } catch { toast.error('Failed to start Google sign-in'); }
                                            }}
                                            className="text-[10px] font-semibold text-blue-400 hover:bg-blue-500/10 h-8 px-4"
                                        >
                                            Connect Google Account
                                        </Button>
                                        <p className="text-[10px] text-gray-500 pt-1">
                                            Link your Google account to access Gmail, Calendar, and other Google services within the app.
                                        </p>
                                    </>
                                )}
                            </div>
                        </section>
                    )}

                    {activeSection === 'preferences' && (
                        <section className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-[var(--color-foreground)] mb-1">Preferences</h3>
                                <p className="text-xs text-gray-500">Customize your experience</p>
                            </div>

                            <div className="rounded-2xl bg-white/3 border border-white/5 divide-y divide-white/5">
                                {/* AI Suggestions */}
                                <div className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-xs font-semibold text-foreground">AI Suggestions</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">Show smart reply suggestions in chat</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleAISuggestions}
                                        className={cn(
                                            "relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-all duration-200",
                                            showAISuggestions ? "bg-blue-500" : "bg-white/10"
                                        )}
                                    >
                                        <span className={cn(
                                            "pointer-events-none h-4 w-4 transform rounded-full bg-white shadow transition duration-200 mt-0.5",
                                            showAISuggestions ? "translate-x-4.5" : "translate-x-0.5"
                                        )} />
                                    </button>
                                </div>

                                {/* Email Notifications */}
                                <div className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            Email Notifications <span className="text-[8px] uppercase tracking-wider bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">New</span>
                                        </p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">Receive an email when you receive messages while offline</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newValue = !emailNotifications;
                                            toggleEmailNotifications();
                                            updateProfileMutation.mutate({
                                                emailNotificationsEnabled: newValue
                                            });
                                        }}
                                        className={cn(
                                            "relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-all duration-200",
                                            emailNotifications ? "bg-blue-500" : "bg-white/10"
                                        )}
                                    >
                                        <span className={cn(
                                            "pointer-events-none h-4 w-4 transform rounded-full bg-white shadow transition duration-200 mt-0.5",
                                            emailNotifications ? "translate-x-4.5" : "translate-x-0.5"
                                        )} />
                                    </button>
                                </div>

                                {/* Slash Commands */}
                                <div className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            Slash Commands <span className="text-[8px] uppercase tracking-wider bg-gray-500/10 text-gray-400 font-mono px-1.5 py-0.5 rounded">/*</span>
                                        </p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">Enable quick shortcuts like /email and /save</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleSlashCommands}
                                        className={cn(
                                            "relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-all duration-200",
                                            slashCommands ? "bg-blue-500" : "bg-white/10"
                                        )}
                                    >
                                        <span className={cn(
                                            "pointer-events-none h-4 w-4 transform rounded-full bg-white shadow transition duration-200 mt-0.5",
                                            slashCommands ? "translate-x-4.5" : "translate-x-0.5"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeSection === 'danger' && (
                        <section className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-red-400 mb-1">Danger Zone</h3>
                                <p className="text-xs text-gray-500">Irreversible actions for your account</p>
                            </div>

                            {/* Deactivate */}
                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-amber-400">Deactivate Account</p>
                                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                                        Temporarily disable your account. Your data will be preserved and you can reactivate by logging in again.
                                        You will not appear in search results and will not receive messages or calls.
                                    </p>
                                </div>
                                {showDeactivateConfirm ? (
                                    <div className="space-y-3 pt-1">
                                        <p className="text-[10px] text-amber-400 font-medium">Are you sure you want to deactivate your account?</p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowDeactivateConfirm(false)}
                                                className="text-[10px] text-gray-400 h-8 px-3"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => deactivateAccountMutation.mutate()}
                                                loading={deactivateAccountMutation.isPending}
                                                className="text-[10px] font-semibold bg-amber-500 hover:bg-amber-600 text-black h-8 px-4"
                                            >
                                                Yes, Deactivate
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowDeactivateConfirm(true)}
                                        className="text-[10px] font-semibold text-amber-400 hover:bg-amber-500/10 h-8 px-4"
                                    >
                                        Deactivate Account
                                    </Button>
                                )}
                            </div>

                            {/* Delete */}
                            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-red-400">Delete Account</p>
                                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                                        Permanently delete your account and all associated data. This action is irreversible.
                                        All conversations, messages, call logs, and linked accounts will be removed.
                                    </p>
                                </div>
                                {showDeleteConfirm ? (
                                    <div className="space-y-3 pt-1">
                                        <p className="text-[10px] text-red-400 font-medium">
                                            Type <span className="font-bold">DELETE</span> to confirm:
                                        </p>
                                        <Input
                                            value={deleteInput}
                                            onChange={(e) => setDeleteInput(e.target.value)}
                                            placeholder="Type DELETE"
                                            className="bg-transparent border-red-500/20 focus:border-red-500/40 h-9 text-xs"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                                                className="text-[10px] text-gray-400 h-8 px-3"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => deleteAccountMutation.mutate()}
                                                loading={deleteAccountMutation.isPending}
                                                disabled={deleteInput !== 'DELETE'}
                                                className="text-[10px] font-semibold bg-red-500 hover:bg-red-600 text-white h-8 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                Delete Permanently
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="text-[10px] font-semibold text-red-400 hover:bg-red-500/10 h-8 px-4"
                                    >
                                        Delete Account
                                    </Button>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Icons ────────────────────────────────────────────────────────────
const UserIcon = () => (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.50203 5.49797 8.125 7.5 8.125C9.50203 8.125 11.125 6.50203 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM0.875 13C0.875 10.7909 2.66586 9 4.875 9H10.125C12.3341 9 14.125 10.7909 14.125 13C14.125 13.5523 13.6773 14 13.125 14H1.875C1.32272 14 0.875 13.5523 0.875 13Z" fill="currentColor" />
    </svg>
);

const LinkIcon = () => (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.625 4.5C3.17525 4.5 2 5.67525 2 7.125C2 8.57475 3.17525 9.75 4.625 9.75H6.25C6.52614 9.75 6.75 9.97386 6.75 10.25C6.75 10.5261 6.52614 10.75 6.25 10.75H4.625C2.623 10.75 1 9.12701 1 7.125C1 5.123 2.623 3.5 4.625 3.5H6.25C6.52614 3.5 6.75 3.72386 6.75 4C6.75 4.27614 6.52614 4.5 6.25 4.5H4.625ZM8.75 4C8.75 3.72386 8.97386 3.5 9.25 3.5H10.875C12.877 3.5 14.5 5.123 14.5 7.125C14.5 9.12701 12.877 10.75 10.875 10.75H9.25C8.97386 10.75 8.75 10.5261 8.75 10.25C8.75 9.97386 8.97386 9.75 9.25 9.75H10.875C12.3248 9.75 13.5 8.57475 13.5 7.125C13.5 5.67525 12.3248 4.5 10.875 4.5H9.25C8.97386 4.5 8.75 4.27614 8.75 4ZM5 7.125C5 6.84886 5.22386 6.625 5.5 6.625H10C10.2761 6.625 10.5 6.84886 10.5 7.125C10.5 7.40114 10.2761 7.625 10 7.625H5.5C5.22386 7.625 5 7.40114 5 7.125Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
);

const GearIcon = () => (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.07095 0.650238C6.67391 0.650238 6.32977 0.925096 6.24198 1.31231L6.0039 2.36247C5.6249 2.47269 5.26335 2.62363 4.92436 2.81013L4.01335 2.23585C3.67748 2.02413 3.23978 2.07312 2.95903 2.35386L2.35294 2.95996C2.0722 3.2407 2.0232 3.6784 2.23493 4.01427L2.80942 4.92561C2.62307 5.2645 2.47227 5.62594 2.36216 6.00481L1.31209 6.24287C0.924883 6.33065 0.650024 6.6748 0.650024 7.07183V7.92897C0.650024 8.32601 0.924883 8.67015 1.31209 8.75794L2.36228 8.99603C2.47246 9.375 2.62335 9.73652 2.80979 10.0755L2.2356 10.9867C2.02388 11.3225 2.07286 11.7602 2.35361 12.041L2.95972 12.6471C3.24046 12.9278 3.67816 12.9768 4.01403 12.7651L4.92534 12.1907C5.26438 12.3771 5.62595 12.5279 6.00497 12.6381L6.24306 13.6882C6.33085 14.0754 6.67499 14.3503 7.07203 14.3503H7.92917C8.32621 14.3503 8.67035 14.0754 8.75814 13.6882L8.99623 12.6381C9.37527 12.5278 9.73683 12.377 10.0758 12.1906L10.987 12.7649C11.3229 12.9766 11.7606 12.9276 12.0413 12.6469L12.6474 12.0408C12.9282 11.76 12.9772 11.3223 12.7654 10.9865L12.1912 10.0755C12.3775 9.73656 12.5283 9.37507 12.6385 8.99611L13.6886 8.75802C14.0758 8.67023 14.3507 8.32609 14.3507 7.92905V7.07191C14.3507 6.67488 14.0758 6.33073 13.6886 6.24295L12.6384 6.00486C12.5282 5.62585 12.3773 5.26431 12.1908 4.92527L12.7652 4.01397C12.9769 3.6781 12.9279 3.2404 12.6472 2.95966L12.0411 2.35356C11.7603 2.07282 11.3226 2.02383 10.9868 2.23555L10.0755 2.80979C9.73651 2.62331 9.375 2.47236 8.99599 2.3621L8.75791 1.31199C8.67012 0.924779 8.32598 0.650238 7.92894 0.650238H7.07095ZM7.50049 10.0503C8.90866 10.0503 10.0505 8.90846 10.0505 7.50029C10.0505 6.09211 8.90866 4.95029 7.50049 4.95029C6.09232 4.95029 4.95049 6.09211 4.95049 7.50029C4.95049 8.90846 6.09232 10.0503 7.50049 10.0503Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
);

const WarningIcon = () => (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.0694 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.0694 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98663 7.5 8.98663C7.2208 8.98663 6.99152 8.766 6.98079 8.48701L6.8269 4.48611ZM8.24989 10.4763C8.24989 10.8905 7.9141 11.2263 7.49989 11.2263C7.08567 11.2263 6.74989 10.8905 6.74989 10.4763C6.74989 10.062 7.08567 9.72625 7.49989 9.72625C7.9141 9.72625 8.24989 10.062 8.24989 10.4763Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
);

const CloseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
);

const GoogleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);
