import { LegalLayout } from '../../components/layout';
import { env } from '../../config/env';

const Section = ({ icon, title, children }) => (
    <section>
        <h2 className="flex items-center gap-3 text-xl font-bold text-[var(--color-foreground)] mb-4 tracking-tight">
            <span className="text-lg">{icon}</span>
            {title}
        </h2>
        <div className="pl-1 space-y-3 text-[15px] leading-[1.8] text-[var(--color-gray-400)]">
            {children}
        </div>
    </section>
);

const Highlight = ({ children }) => (
    <span className="text-[var(--color-gray-300)] font-medium">{children}</span>
);

const Step = ({ number, children }) => (
    <li className="flex items-start gap-3">
        <span className="mt-0.5 w-6 h-6 rounded-full bg-blue-500/15 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">{number}</span>
        <p>{children}</p>
    </li>
);

const DataDeletion = () => (
    <LegalLayout title="Data Deletion" lastUpdated="4 March 2026">

        {/* Intro */}
        <section>
            <p className="text-[15px] leading-[1.8] text-[var(--color-gray-400)]">
                At <Highlight>Blinx AI Assistant</Highlight>, we believe you should have full control
                over your personal data at all times. This page explains what data we store, how you
                can delete or deactivate your account, and what happens when you do. Since this is a{' '}
                <Highlight>college academic project</Highlight>, we have no reason to retain your data
                beyond what is needed to provide the service.
            </p>
        </section>

        <Section icon="📋" title="What Data Do We Store?">
            <p>
                When you use Blinx AI Assistant, the following data is stored on our servers:
            </p>
            <ul className="list-none space-y-2.5 mt-2">
                {[
                    ['Account Information', 'Your name, email address, phone number (if provided), and profile picture.'],
                    ['Authentication Data', 'Login tokens and session identifiers used to keep you signed in securely.'],
                    ['Chat Messages', 'Text messages you have sent and received in direct and group conversations.'],
                    ['Group Memberships', 'Records of which chat groups you have created or joined.'],
                    ['AI Interaction Logs', 'Your conversations with the AI assistant feature.'],
                    ['Call Logs', 'Metadata of audio/video calls (caller, receiver, duration, status). No call recordings are stored.'],
                    ['Google OAuth Tokens', 'Encrypted tokens if you linked your Google account for email and calendar features.'],
                    ['Presence Data', 'Temporary records of your online/offline status (not permanently stored).'],
                ].map(([label, desc], i) => (
                    <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/60 shrink-0" />
                        <p><Highlight>{label}</Highlight> — {desc}</p>
                    </li>
                ))}
            </ul>
            <p className="mt-3">
                We do <Highlight>not</Highlight> store any audio/video call recordings. Calls are
                established via peer-to-peer WebRTC connections and no call media passes through or
                is saved on our servers.
            </p>
        </Section>

        <Section icon="🗑️" title="How to Delete Your Account">
            <p>
                You have multiple ways to permanently delete your account and all associated data:
            </p>

            {/* Method 1 — In-app (Recommended) */}
            <div className="mt-4 p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
                <p className="text-blue-400 font-semibold text-[14px] mb-2">
                    Method 1 — From Account Settings <span className="ml-2 text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">Recommended</span>
                </p>
                <p className="text-[14px]">
                    The fastest and most reliable way to delete your account:
                </p>
                <ol className="list-none space-y-2 mt-3 text-[14px]">
                    <Step number="1">Log in to <Highlight>Blinx AI Assistant</Highlight> and click on your profile avatar in the sidebar.</Step>
                    <Step number="2">Navigate to the <Highlight>Danger Zone</Highlight> section in the settings panel.</Step>
                    <Step number="3">Click <Highlight>"Delete Account"</Highlight> and type <span className="font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded text-xs">DELETE</span> to confirm.</Step>
                    <Step number="4">Your account will be permanently deleted and a confirmation email will be sent to your registered email address from <Highlight>account@blinxai.me</Highlight>.</Step>
                </ol>
            </div>

            {/* Method 2 — Email */}
            <div className="mt-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                <p className="text-[var(--color-gray-300)] font-semibold text-[14px] mb-2">
                    Method 2 — Send Us an Email
                </p>
                <p className="text-[14px]">
                    If you are unable to access your account, write to us at{' '}
                    <a href={`mailto:${env.ACCOUNT_EMAIL}`} className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors font-medium">
                        {env.ACCOUNT_EMAIL}
                    </a>{' '}
                    with the subject line <Highlight>"Data Deletion Request"</Highlight>. Include
                    the email address or phone number associated with your account so we can locate
                    and remove your data.
                </p>
            </div>

            {/* Method 3 — Google revoke */}
            <div className="mt-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                <p className="text-[var(--color-gray-300)] font-semibold text-[14px] mb-2">
                    Method 3 — Revoke Google Access
                </p>
                <p className="text-[14px]">
                    If you signed in using Google, you can revoke Blinx AI's access from your Google Account:
                </p>
                <ol className="list-none space-y-1.5 mt-2 text-[14px]">
                    <Step number="1">
                        Go to Google Account → Security →{' '}
                        <a
                            href="https://myaccount.google.com/security?pli=1#thirdpartyapps"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline underline-offset-4 hover:text-blue-300 transition-colors font-medium"
                        >
                            Third-party apps with account access
                        </a>.
                    </Step>
                    <Step number="2">Find "Blinx AI Assistant" in the list of connected applications.</Step>
                    <Step number="3">Click on it and select "Remove Access".</Step>
                </ol>
                <p className="text-[14px] mt-2">
                    You can also revoke Google access directly from your <Highlight>Account Settings → Accounts</Highlight> section
                    inside the app. Both disconnect and revoke actions will send you a confirmation email.
                </p>
                <p className="text-[14px] mt-2 text-amber-400/80">
                    Note: Revoking Google access alone does <Highlight>not</Highlight> delete your Blinx AI account data.
                    To fully delete your data, use Method 1 or Method 2 above.
                </p>
            </div>
        </Section>

        <Section icon="⏸️" title="How to Deactivate Your Account">
            <p>
                If you want a temporary break without permanently losing your data, you can deactivate
                your account instead:
            </p>
            <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <p className="text-amber-400 font-semibold text-[14px] mb-2">
                    Account Deactivation
                </p>
                <ol className="list-none space-y-2 mt-2 text-[14px]">
                    <Step number="1">Open your <Highlight>Account Settings</Highlight> by clicking your profile avatar.</Step>
                    <Step number="2">Go to the <Highlight>Danger Zone</Highlight> section.</Step>
                    <Step number="3">Click <Highlight>"Deactivate Account"</Highlight> and confirm.</Step>
                </ol>
                <div className="mt-3 p-3 rounded-lg border border-amber-500/15 bg-amber-500/5 text-[13px]">
                    <p className="font-semibold text-amber-300 mb-1.5">What happens when you deactivate:</p>
                    <ul className="list-none space-y-1.5">
                        {[
                            'Your profile will not appear in search results.',
                            'You will not receive new messages or calls.',
                            'Your data (messages, groups, etc.) is preserved safely.',
                            'You can reactivate your account anytime by simply logging in again.',
                            'A confirmation email will be sent from account@blinxai.me.',
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400/50 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Section>

        <Section icon="⏱️" title="Deletion Timeline">
            <p>
                Here is what to expect after your deletion or deactivation request:
            </p>
            <div className="mt-3 grid gap-3">
                {[
                    { action: 'In-App Deletion', timeline: 'Immediate', desc: 'Your account, profile, and all associated data are deleted instantly when you use the in-app "Delete Account" feature.', colour: 'border-green-500/20 bg-green-500/5 text-green-300' },
                    { action: 'Email Deletion Request', timeline: 'Within 7 working days', desc: 'We will acknowledge your request within 24 hours and complete the deletion within 7 working days.', colour: 'border-blue-500/20 bg-blue-500/5 text-blue-300' },
                    { action: 'Google Access Revocation', timeline: 'Immediate', desc: 'Google tokens are deleted instantly. Your Blinx data remains until you request account deletion separately.', colour: 'border-amber-500/20 bg-amber-500/5 text-amber-300' },
                    { action: 'Cached / Backup Data', timeline: 'Within 30 days', desc: 'Any residual data in caches or backups (if applicable) will be purged within 30 days of your deletion request.', colour: 'border-gray-500/20 bg-gray-500/5 text-gray-300' },
                ].map((item, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${item.colour} text-[14px]`}>
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">{item.action}</p>
                            <span className="text-xs font-mono opacity-70">{item.timeline}</span>
                        </div>
                        <p className="mt-1 opacity-80">{item.desc}</p>
                    </div>
                ))}
            </div>
        </Section>

        <Section icon="📦" title="What Gets Deleted?">
            <p>
                When we process your account deletion, the following data is permanently removed:
            </p>
            <div className="mt-3 grid gap-3">
                {[
                    { label: 'Account Profile', desc: 'Name, email, phone number, profile picture, bio — all removed.', colour: 'bg-red-500/10 border-red-500/20 text-red-300' },
                    { label: 'Chat History', desc: 'All your direct messages and group messages — permanently erased.', colour: 'bg-red-500/10 border-red-500/20 text-red-300' },
                    { label: 'Group Memberships', desc: 'You will be removed from all groups. Groups you created will be reassigned or deleted.', colour: 'bg-amber-500/10 border-amber-500/20 text-amber-300' },
                    { label: 'AI Conversations', desc: 'All interactions with the AI assistant — cleared completely.', colour: 'bg-red-500/10 border-red-500/20 text-red-300' },
                    { label: 'Call Logs', desc: 'All call metadata (audio/video call history) — permanently removed.', colour: 'bg-red-500/10 border-red-500/20 text-red-300' },
                    { label: 'Google OAuth Tokens', desc: 'All stored Google credentials and encrypted tokens — destroyed.', colour: 'bg-red-500/10 border-red-500/20 text-red-300' },
                    { label: 'Auth Tokens & Sessions', desc: 'All active sessions, refresh tokens, and login data — revoked and destroyed.', colour: 'bg-red-500/10 border-red-500/20 text-red-300' },
                ].map((item, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${item.colour} text-[14px]`}>
                        <p className="font-semibold">{item.label}</p>
                        <p className="mt-0.5 opacity-80">{item.desc}</p>
                    </div>
                ))}
            </div>
        </Section>

        <Section icon="📧" title="Email Confirmations">
            <p>
                Blinx AI sends email confirmations from <Highlight>account@blinxai.me</Highlight> for the following actions:
            </p>
            <ul className="list-none space-y-2.5 mt-3">
                {[
                    ['Account Deletion', 'A confirmation email is sent after your account is permanently deleted.'],
                    ['Account Deactivation', 'A confirmation email is sent when your account is deactivated.'],
                    ['Google Disconnect', 'An email notification is sent when you disconnect your Google account.'],
                    ['Google Access Revocation', 'An email notification is sent when you revoke all Google permissions.'],
                ].map(([label, desc], i) => (
                    <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/60 shrink-0" />
                        <p><Highlight>{label}</Highlight> — {desc}</p>
                    </li>
                ))}
            </ul>
            <p className="mt-3">
                If you receive any of these emails without performing the action yourself, please
                contact us immediately at{' '}
                <a href={`mailto:${env.ACCOUNT_EMAIL}`} className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors font-medium">
                    {env.ACCOUNT_EMAIL}
                </a>{' '}
                to secure your account.
            </p>
        </Section>

        <Section icon="ℹ️" title="Important Notes">
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                <ul className="space-y-3 text-[14px]">
                    <li className="flex items-start gap-2.5">
                        <span className="text-red-400 mt-0.5 font-bold">!</span>
                        <p>Account deletion is <Highlight>permanent and irreversible</Highlight>. Once your data has been deleted, it cannot be recovered.</p>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <span className="text-amber-400 mt-0.5 font-bold">!</span>
                        <p>Account deactivation is <Highlight>reversible</Highlight>. You can reactivate your account at any time by logging in again.</p>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <span className="text-amber-400 mt-0.5 font-bold">!</span>
                        <p>Messages you sent to other users in group chats may still be visible to them after deletion, but your identity will be anonymised or removed.</p>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <span className="text-amber-400 mt-0.5 font-bold">!</span>
                        <p>If you created an account using Google Sign-In, revoking access from Google does not automatically delete your data from our servers — you must also delete your account.</p>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <span className="text-blue-400 mt-0.5 font-bold">!</span>
                        <p>We do <Highlight>not</Highlight> store call recordings. Audio and video calls use peer-to-peer WebRTC, so no call media ever touches our servers.</p>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <span className="text-blue-400 mt-0.5 font-bold">!</span>
                        <p>Blinx AI requests <Highlight>email</Highlight> and <Highlight>calendar</Highlight> permissions from Google only for chat, account verification, and calendar integration. We do not access or store any other Google data.</p>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <span className="text-gray-400 mt-0.5 font-bold">!</span>
                        <p>Since this project may be discontinued after academic evaluation, all remaining data will be deleted when the servers are decommissioned.</p>
                    </li>
                </ul>
            </div>
        </Section>

        <Section icon="🔗" title="Related Policies">
            <p>
                For more information about how we handle your data, please refer to:
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
                <a
                    href="/privacy-policy"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[14px] font-medium text-[var(--color-gray-300)] hover:text-blue-400 hover:border-blue-500/30 transition-all"
                >
                    <span>🔐</span> Privacy Policy
                </a>
                <a
                    href="/terms"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[14px] font-medium text-[var(--color-gray-300)] hover:text-blue-400 hover:border-blue-500/30 transition-all"
                >
                    <span>📜</span> Terms of Service
                </a>
            </div>
        </Section>

        <Section icon="📬" title="Contact Us">
            <p>
                Have questions about data deletion or need assistance? We are here to help:
            </p>
            <div className="mt-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                <p className="text-[14px]">
                    <Highlight>Project</Highlight> — Blinx AI Assistant (College Academic Project)
                </p>
                <p className="text-[14px] mt-1">
                    <Highlight>Account & Data</Highlight> —{' '}
                    <a href={`mailto:${env.ACCOUNT_EMAIL}`} className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors">
                        {env.ACCOUNT_EMAIL}
                    </a>
                </p>
                <p className="text-[14px] mt-1">
                    <Highlight>General Support</Highlight> —{' '}
                    <a href="mailto:support@blinxai.me" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors">
                        support@blinxai.me
                    </a>
                </p>
                <p className="text-[14px] mt-1">
                    <Highlight>Website</Highlight> —{' '}
                    <a href="https://blinxAI.me" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors">
                        blinxAI.me
                    </a>
                </p>
            </div>
        </Section>
    </LegalLayout>
);

export default DataDeletion;
