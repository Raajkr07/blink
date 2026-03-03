import { LegalLayout } from '../../components/layout';

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

const FeatureCard = ({ emoji, title, description }) => (
    <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] hover:border-blue-500/30 transition-all duration-300 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 blur-2xl rounded-full group-hover:bg-blue-500/10 transition-colors" />
        <p className="text-lg mb-1">{emoji}</p>
        <p className="font-semibold text-[var(--color-gray-300)] text-[14px]">{title}</p>
        <p className="text-[13px] mt-1 text-[var(--color-gray-400)]">{description}</p>
    </div>
);

const DocsPage = () => (
    <LegalLayout title="Documentation" lastUpdated="3 March 2026">

        {/* Introduction */}
        <section>
            <p className="text-[17px] leading-[1.9] text-[var(--color-gray-300)]">
                Welcome to the <Highlight>Blinx AI Assistant</Highlight> documentation. This guide is written in
                simple, straightforward English so that anyone — whether you're a developer, a student, or
                someone who just wants to understand how this app works — can follow along comfortably.
            </p>
            <p className="text-[15px] leading-[1.8] text-[var(--color-gray-400)] mt-3">
                Blinx AI is a real-time, AI-powered chat application built as a college academic project. It
                combines everyday messaging with powerful AI tools, Google integration, and peer-to-peer video
                calling — all inside a single, clean interface.
            </p>
        </section>

        {/* Quick Feature Overview */}
        <Section icon="✨" title="What Can Blinx Do?">
            <p>Here's a quick look at everything packed inside:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <FeatureCard emoji="💬" title="Real-Time Chat" description="Send and receive messages instantly via WebSockets. No refreshing needed." />
                <FeatureCard emoji="👥" title="Group Conversations" description="Create groups, add friends, manage participants — all from the chat screen." />
                <FeatureCard emoji="🤖" title="AI Assistant" description="Chat with an AI that can read emails, schedule meetings, summarise chats, and more." />
                <FeatureCard emoji="📞" title="Audio & Video Calls" description="One-tap peer-to-peer calls using WebRTC. Your data never touches our servers." />
                <FeatureCard emoji="📰" title="News Feed" description="Browse curated news articles right inside the app with custom source filters." />
                <FeatureCard emoji="🔐" title="Secure Auth" description="OTP login, Google OAuth, JWT tokens, Cloudflare Turnstile — multiple layers of security." />
                <FeatureCard emoji="🔄" title="Offline Resilience" description="Messages queue locally and auto-sync when your connection returns." />
                <FeatureCard emoji="📊" title="Data Analysis" description="Upload files and let the AI crunch numbers for you — right in incognito mode." />
            </div>
        </Section>

        {/* Getting Started */}
        <Section icon="🚀" title="Getting Started">
            <p>
                Setting up is dead simple. You just need a working email address or phone number. Here's the flow:
            </p>
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] mt-3">
                <ol className="list-none space-y-3 text-[14px]">
                    {[
                        ['1️⃣', 'Open blinxai.me and you\'ll land on the Auth page.'],
                        ['2️⃣', 'Enter your email or phone number and click "Continue".'],
                        ['3️⃣', 'A 6-digit OTP will be sent to you. Enter it to verify.'],
                        ['4️⃣', 'If you\'re new, fill in your username and hit "Create Account".'],
                        ['5️⃣', 'That\'s it — you\'re inside the chat! Start messaging.'],
                    ].map(([step, text], i) => (
                        <li key={i} className="flex items-start gap-3">
                            <span className="text-blue-400 font-bold shrink-0">{step}</span>
                            <p>{text}</p>
                        </li>
                    ))}
                </ol>
            </div>
            <p className="mt-3">
                <Highlight>Pro Tip:</Highlight> If you sign in with Google, you'll automatically unlock email and
                calendar features. We highly recommend it for the full experience.
            </p>
        </Section>

        {/* Authentication Deep Dive */}
        <Section icon="🔐" title="Authentication & Security">
            <p>
                We take security seriously. Here's how user authentication works under the hood:
            </p>
            <ul className="list-none space-y-2.5 mt-2">
                {[
                    ['OTP Verification', 'Every login and signup requires a one-time password sent to your email or phone. No passwords are ever stored.'],
                    ['Cloudflare Turnstile', 'Before we even send the OTP, Cloudflare verifies you\'re a real human — not a bot. This happens seamlessly in the background.'],
                    ['JWT Tokens', 'Once verified, you receive an access token (valid for 24 hours) and a refresh token (valid for 30 days). These keep you logged in securely.'],
                    ['Google OAuth', 'Sign in with Google for a one-click experience. We request email, calendar, and profile access — nothing else.'],
                    ['Circuit Breaker', 'Our API client has a built-in circuit breaker. If the backend goes down, we stop flooding it with requests and gracefully handle errors.'],
                    ['Token Auto-Refresh', 'When your access token expires, the app silently refreshes it using your refresh token. You never get logged out unexpectedly.'],
                ].map(([label, desc], i) => (
                    <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/60 shrink-0" />
                        <p><Highlight>{label}</Highlight> — {desc}</p>
                    </li>
                ))}
            </ul>
        </Section>

        {/* Chat System */}
        <Section icon="💬" title="Chat System">
            <p>
                The heart of Blinx is its real-time messaging engine. Here's what's available:
            </p>
            <ul className="list-none space-y-2 mt-2">
                {[
                    'Direct one-to-one conversations with any registered user.',
                    'Group chats — create groups, give them a title, add members, remove participants.',
                    'Paginated message history — older messages load as you scroll up, 20 at a time.',
                    'Delete individual messages or entire conversations when you need to clean up.',
                    'Real-time delivery using WebSocket (STOMP over SockJS). Messages appear instantly.',
                    'Typing indicators — see when the other person is typing.',
                    'Online/Offline presence — green dots show who\'s currently active.',
                    'File sharing — drag and drop files directly into the chat.',
                    'Email sending — compose and send emails right from the chat interface.',
                ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/60 shrink-0" />
                        <p>{item}</p>
                    </li>
                ))}
            </ul>
        </Section>

        {/* WebSocket & Real-Time */}
        <Section icon="🔌" title="Real-Time Engine (WebSockets)">
            <p>
                Behind every instant message is our WebSocket infrastructure:
            </p>
            <ul className="list-none space-y-2 mt-2">
                {[
                    'Built on STOMP protocol over SockJS for maximum browser compatibility.',
                    'Persistent subscriptions — if the connection drops, all your topic subscriptions automatically re-establish.',
                    'Exponential backoff reconnection — retries get progressively slower to avoid server flooding.',
                    'Tab visibility detection — when you switch back to the tab, the connection health is immediately checked.',
                    'Browser online/offline events — reconnects instantly when your internet comes back.',
                    'Outbox queue — messages sent while offline are stored locally and flushed when the socket reconnects.',
                ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/60 shrink-0" />
                        <p>{item}</p>
                    </li>
                ))}
            </ul>
        </Section>

        {/* AI Assistant */}
        <Section icon="🤖" title="AI Assistant">
            <p>
                The AI Assistant is not just a chatbot — it's your productivity sidekick. Here's what it can do:
            </p>
            <div className="p-4 rounded-xl border border-blue-500/20 bg-[var(--color-background)] mt-3 space-y-4">
                {[
                    { title: '💬 Chat with AI', desc: 'Have a natural conversation. Ask questions, get suggestions, brainstorm ideas.' },
                    { title: '🕵️ Incognito Mode', desc: 'Chat privately with the AI. Separate conversation thread, separate config.' },
                    { title: '📧 Email Integration', desc: 'Ask the AI to read, summarise, or draft emails. Requires Google login.' },
                    { title: '📅 Calendar Management', desc: '"Schedule a meeting tomorrow at 3 PM" — the AI creates Google Calendar events for you.' },
                    { title: '💡 Smart Replies', desc: 'Get auto-generated reply suggestions based on the conversation context.' },
                    { title: '📝 Conversation Summary', desc: 'Long chat thread? The AI can summarise the key points in seconds.' },
                    { title: '✅ Task Extraction', desc: 'AI reads through messages and pulls out actionable tasks automatically.' },
                    { title: '🔍 Smart Search', desc: 'Natural language search across your conversations — the AI parses your intent.' },
                    { title: '📊 Data Analysis', desc: 'Upload a CSV or spreadsheet in incognito mode and let the AI crunch the numbers.' },
                ].map((item, i) => (
                    <div key={i}>
                        <p className="font-semibold text-[var(--color-gray-300)] text-[14px]">{item.title}</p>
                        <p className="text-[13px] text-[var(--color-gray-400)] mt-0.5">{item.desc}</p>
                    </div>
                ))}
            </div>
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] mt-4">
                <p className="font-semibold text-[var(--color-gray-300)] text-[14px] mb-2">Try these prompts:</p>
                <div className="space-y-2 text-[14px]">
                    <p className="italic text-blue-400">"Summarise my last 5 emails."</p>
                    <p className="italic text-blue-400">"Schedule a team call for Friday at 11 AM."</p>
                    <p className="italic text-blue-400">"Draft a polite follow-up email to Priya about the project deadline."</p>
                    <p className="italic text-blue-400">"What tasks came up in my last conversation with Rahul?"</p>
                </div>
            </div>
        </Section>

        {/* Audio & Video Calls */}
        <Section icon="📞" title="Audio & Video Calls">
            <p>
                Jump into a call directly from any one-to-one chat. Here's the nitty-gritty:
            </p>
            <ul className="list-none space-y-2 mt-2">
                {[
                    'Initiate audio or video calls with a single tap from the chat header.',
                    'Calls use WebRTC — peer-to-peer technology. Your voice and video travel directly between devices.',
                    'No call data is stored or routed through our servers. Complete privacy.',
                    'ICE candidate handling with automatic queuing for reliable connections.',
                    'Toggle your mic and camera on/off during the call.',
                    'Screen sharing — share your screen with the other person during a video call.',
                    'Call history with filters — view past calls by date, type (audio/video), or status.',
                    'Connection state monitoring — the UI adapts if the connection drops mid-call.',
                ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/60 shrink-0" />
                        <p>{item}</p>
                    </li>
                ))}
            </ul>
        </Section>

        {/* News Feed */}
        <Section icon="📰" title="News Feed">
            <p>
                Stay updated without leaving the app. The news feed pulls in curated articles from various sources.
            </p>
            <ul className="list-none space-y-2 mt-2">
                {[
                    'Browse articles from multiple news sources right inside the sidebar.',
                    'Filter by your preferred sources — tech, business, general, whatever interests you.',
                    'Paginated loading — scroll down and older articles load automatically.',
                    'Powered by our backend web search API with built-in caching (5-minute TTL for performance).',
                ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/60 shrink-0" />
                        <p>{item}</p>
                    </li>
                ))}
            </ul>
        </Section>

        {/* User Profile */}
        <Section icon="👤" title="Profile & Users">
            <p>
                Your profile is your identity within Blinx. Here's what you can manage:
            </p>
            <ul className="list-none space-y-2 mt-2">
                {[
                    'Update your display name and bio from the profile settings.',
                    'Search for other users by name, email, or phone number to start a conversation.',
                    'See who\'s online in real-time — presence indicators are live.',
                    'Batch-fetch user profiles efficiently when loading group member lists.',
                    'Revoke Google access directly from your profile if you no longer want email/calendar integration.',
                ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/60 shrink-0" />
                        <p>{item}</p>
                    </li>
                ))}
            </ul>
        </Section>

        {/* Tech Stack */}
        <Section icon="🛠️" title="Tech Stack">
            <p>For the curious minds, here's what powers Blinx under the hood:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <FeatureCard emoji="⚛️" title="React + Vite" description="Lightning-fast frontend with lazy-loaded routes and Framer Motion animations." />
                <FeatureCard emoji="☕" title="Spring Boot" description="Robust Java backend handling REST APIs, WebSockets, and OAuth." />
                <FeatureCard emoji="🍃" title="MongoDB" description="NoSQL database for flexible chat data, user profiles, and AI logs." />
                <FeatureCard emoji="🔴" title="Redis" description="In-memory cache for presence tracking, session management, and rate limiting." />
                <FeatureCard emoji="🌐" title="WebRTC + STOMP" description="Peer-to-peer calls and real-time messaging over WebSockets." />
                <FeatureCard emoji="🤖" title="OpenAI GPT-4o" description="Powers all AI features — smart replies, summaries, email drafting, and more." />
                <FeatureCard emoji="☁️" title="Cloudflare" description="Turnstile bot protection and edge network performance." />
                <FeatureCard emoji="📧" title="Brevo (Sendinblue)" description="Transactional email service for OTP delivery and notifications." />
            </div>
        </Section>

        {/* FAQ */}
        <Section icon="❓" title="Frequently Asked Questions">
            <div className="space-y-4 mt-2">
                {[
                    { q: 'Is Blinx free to use?', a: 'Yes, completely free. It\'s a college project — no subscriptions, no ads, no hidden charges.' },
                    { q: 'Do I need to sign in with Google?', a: 'Not necessarily. You can use email/phone OTP login. But Google login unlocks email and calendar AI features.' },
                    { q: 'Are my messages encrypted?', a: 'All data between your browser and our servers uses HTTPS/TLS encryption. WebRTC calls are peer-to-peer and never touch our servers.' },
                    { q: 'Can I delete my account?', a: 'Absolutely. Visit the Data Deletion page or email us, and we\'ll wipe everything within 7 working days.' },
                    { q: 'Will this project stay online forever?', a: 'Since it\'s an academic project, the service may be discontinued after the evaluation period. We\'ll try to keep it running as long as possible!' },
                    { q: 'What happens if I lose internet mid-conversation?', a: 'Messages you send while offline are queued locally and automatically synced once your connection is restored.' },
                ].map((faq, i) => (
                    <div key={i} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] hover:border-blue-500/20 transition-all">
                        <p className="font-semibold text-[var(--color-gray-300)] text-[14px]">{faq.q}</p>
                        <p className="text-[13px] text-[var(--color-gray-400)] mt-1.5">{faq.a}</p>
                    </div>
                ))}
            </div>
        </Section>

    </LegalLayout>
);

export default DocsPage;
