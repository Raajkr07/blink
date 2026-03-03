// Blog data — all posts with unique slugs for URL routing.
// Written in simple Indian English, human-like, relatable.

export const blogPosts = [
    {
        id: 'journey-behind-building-blinx',
        date: '21 February 2026',
        category: 'Engineering',
        readTime: '6 min read',
        title: 'The Journey Behind Building Blinx AI',
        excerpt: 'How a college project turned into a full-blown AI-powered chat platform — the decisions, the pivots, and the late-night debugging sessions.',
        content: [
            {
                type: 'text',
                body: 'When we sat down to plan our final year project, we had one simple goal — build something that actually solves a real problem. Not just another CRUD app that nobody would use after the demo. We wanted to build something we\'d personally use every day.',
            },
            {
                type: 'text',
                body: 'The idea started as a basic chat app. You know, the kind every CS student builds — a simple messaging interface with a database behind it. But as we started using it ourselves, we realised something. We were constantly switching between WhatsApp for chatting, Gmail for emails, and Google Calendar for scheduling. Why not bring all of that into one place?',
            },
            {
                type: 'heading',
                body: 'The Pivot That Changed Everything',
            },
            {
                type: 'text',
                body: 'That\'s when we decided to integrate an AI assistant directly into the chat. Not as a separate tab or a fancy button — but as a natural conversation thread. You just message the AI like you\'d message a friend, and it handles the rest. "Schedule a meeting with Rahul tomorrow at 3 PM" — done. "Summarise my last 5 emails" — done. It felt magical when it first worked.',
            },
            {
                type: 'text',
                body: 'We chose OpenAI\'s GPT-4o Mini as our AI backbone. It\'s fast, affordable, and smart enough for our use case. The real challenge was connecting it securely to Google\'s APIs — Calendar, Gmail, and OAuth. Getting the scopes right, handling token refreshes, managing permissions — that alone took us about three weeks of back-and-forth.',
            },
            {
                type: 'heading',
                body: 'Real-Time Was Non-Negotiable',
            },
            {
                type: 'text',
                body: 'From day one, we knew the chat had to be real-time. Nobody wants to refresh a page to see new messages. We went with WebSockets using STOMP protocol over SockJS. Spring Boot\'s WebSocket support made this relatively straightforward, but handling reconnections, tab switching, and offline queuing was where the real engineering happened.',
            },
            {
                type: 'text',
                body: 'We built an offline outbox system. If your internet drops while you\'re sending a message, it gets stored locally in Zustand and automatically synced when the WebSocket reconnects. The user doesn\'t even notice the interruption. We\'re honestly proud of how smooth this feels.',
            },
            {
                type: 'heading',
                body: 'WebRTC for Calls — The Hard Part',
            },
            {
                type: 'text',
                body: 'Adding audio and video calls was the most technically challenging feature. WebRTC is powerful but unforgiving. ICE candidate negotiation, STUN/TURN servers, handling NAT traversal — there were days when we questioned whether it was worth the effort. But when the first video call connected peer-to-peer with zero latency, all those late nights felt worth it.',
            },
            {
                type: 'text',
                body: 'The best part? No call data ever touches our servers. It goes directly from your browser to the other person\'s browser. Privacy by design, not by policy.',
            },
            {
                type: 'heading',
                body: 'What We Learned',
            },
            {
                type: 'text',
                body: 'Building Blinx taught us more than any textbook could. We learned that great architecture doesn\'t mean complex architecture — it means the simplest design that still handles real-world edge cases. We learned that users care about speed more than features. And we learned that the best code is the code you don\'t have to debug at 3 AM.',
            },
            {
                type: 'text',
                body: 'This project is our love letter to engineering. It\'s not perfect, but it\'s real, it works, and we built every single line of it ourselves.',
            },
        ],
    },
    {
        id: 'designing-minimalist-ui',
        date: '15 January 2026',
        category: 'Design',
        readTime: '5 min read',
        title: 'Designing a Minimalist, Industry-Grade UI',
        excerpt: 'Great engineering deserves great design. Here\'s how we crafted Blinx\'s dark-themed, glassmorphic interface from scratch.',
        content: [
            {
                type: 'text',
                body: 'Let\'s be honest — most college projects look like college projects. Basic Bootstrap layouts, default colours, no animations. We didn\'t want that for Blinx. We wanted people to open the app and immediately feel that this is something premium.',
            },
            {
                type: 'heading',
                body: 'Dark Mode First',
            },
            {
                type: 'text',
                body: 'We made a conscious decision to design dark-mode-first. Not because it\'s trendy, but because it\'s genuinely easier on the eyes for a chat application. When you\'re reading messages for hours, a white background gets tiring. Our colour palette uses carefully picked slate and gray tones with blue accents for interactive elements.',
            },
            {
                type: 'text',
                body: 'Every card, every modal, every sidebar uses what we call "glassmorphism" — a subtle frosted-glass effect with backdrop blur. It gives depth to the interface without making it heavy. Combined with soft borders at 5-10% white opacity, the whole UI feels layered and alive.',
            },
            {
                type: 'heading',
                body: 'Framer Motion Everywhere',
            },
            {
                type: 'text',
                body: 'We chose Framer Motion for all our animations. Page transitions use animated presence with slide effects. Modal dialogs fade in smoothly. Even the login/signup switch has a horizontal slide animation. These micro-interactions might seem unnecessary, but they\'re what separate a "functional" app from an app that feels good to use.',
            },
            {
                type: 'text',
                body: 'The blinking face logo on the auth page? That\'s a custom SVG animation. The hover effects on the info dropdown? Carefully tuned spring animations. Every interaction was designed to feel responsive and intentional.',
            },
            {
                type: 'heading',
                body: 'Responsive Without Compromise',
            },
            {
                type: 'text',
                body: 'The app detects your screen size on load and adjusts the layout accordingly. On mobile, the sidebar collapses into a drawer. On desktop, you get a full three-panel layout. We use CSS custom properties (variables) for theming, which means switching to a light theme is literally toggling one class on the HTML element.',
            },
            {
                type: 'text',
                body: 'Design isn\'t just how it looks — it\'s how it works. And we obsessed over both.',
            },
        ],
    },
    {
        id: 'scaling-websockets-realtime-chat',
        date: '30 November 2025',
        category: 'Backend',
        readTime: '7 min read',
        title: 'Scaling WebSockets for Real-Time Chat',
        excerpt: 'Handling thousands of concurrent socket connections, reconnection storms, and message delivery guarantees — the backend story.',
        content: [
            {
                type: 'text',
                body: 'Real-time chat sounds simple until you try to build it. "Just use WebSockets" is advice you hear everywhere, but nobody tells you about the reconnection storms, the stale connections, or the message ordering nightmares that come with it.',
            },
            {
                type: 'heading',
                body: 'STOMP Over SockJS',
            },
            {
                type: 'text',
                body: 'We chose STOMP (Simple Text Oriented Messaging Protocol) over SockJS as our WebSocket layer. STOMP gives us topic-based pub/sub messaging, which is perfect for chat. Each conversation is a topic, each user subscribes to their relevant topics, and messages get broadcast instantly.',
            },
            {
                type: 'text',
                body: 'SockJS handles the fallback gracefully. If the browser doesn\'t support native WebSockets (rare these days, but still), it falls back to long polling. The application code doesn\'t need to know the difference.',
            },
            {
                type: 'heading',
                body: 'The Reconnection Problem',
            },
            {
                type: 'text',
                body: 'The hardest problem we faced wasn\'t sending messages — it was handling disconnections. Users close their laptops, switch tabs, go through tunnels, switch from WiFi to mobile data. Each of these events can kill the WebSocket connection.',
            },
            {
                type: 'text',
                body: 'We implemented a custom reconnection strategy with exponential backoff. The first retry happens after 2 seconds, then 4, then 8, and so on — up to a maximum of 60 seconds. This prevents thousands of clients from hammering the server simultaneously after a brief outage.',
            },
            {
                type: 'text',
                body: 'On top of that, we listen to browser visibility events and online/offline events. When you bring the tab back to focus, we immediately check if the socket is healthy. If your browser fires an "online" event after being offline, we reconnect within 500ms.',
            },
            {
                type: 'heading',
                body: 'Redis for Horizontal Scaling',
            },
            {
                type: 'text',
                body: 'If we had just one server, WebSocket management would be simple. But for scalability, we needed to support multiple backend instances. Redis acts as our message broker — when Server A receives a message, it publishes it to Redis, and Server B (which might have the recipient\'s socket) picks it up and delivers it.',
            },
            {
                type: 'text',
                body: 'Redis also handles presence tracking. When a user connects, their status is stored in Redis with a TTL. When the socket disconnects, the TTL expires naturally, and they show as offline. Clean and efficient.',
            },
            {
                type: 'heading',
                body: 'Offline Message Queue',
            },
            {
                type: 'text',
                body: 'On the frontend, we built an outbox queue using Zustand state management. If you send a message while offline, it\'s stored locally with a "Sending..." status. When the socket reconnects, a flush loop picks up all pending messages and sends them in order. After a delay, we invalidate the React Query cache for that conversation to fetch the server-confirmed version.',
            },
            {
                type: 'text',
                body: 'The end result? A chat experience that feels instant and reliable, even on flaky Indian mobile networks. That was always our benchmark.',
            },
        ],
    },
    {
        id: 'privacy-over-profit',
        date: '12 October 2025',
        category: 'Philosophy',
        readTime: '4 min read',
        title: 'Why We Value Privacy Over Profit',
        excerpt: 'As students building for students, privacy is the default. Here\'s how we designed Blinx to respect your data from day one.',
        content: [
            {
                type: 'text',
                body: 'We\'re students. We don\'t have investors to please, growth metrics to chase, or ad revenue to optimise. That gives us a unique advantage — we can design the system the right way, with privacy as a core principle rather than a marketing tagline.',
            },
            {
                type: 'heading',
                body: 'No Passwords, No Problems',
            },
            {
                type: 'text',
                body: 'We made a deliberate choice not to store passwords at all. Our entire authentication system is based on OTP verification. You get a one-time code, you enter it, and you\'re in. There\'s literally nothing in our database that could be used to impersonate you if it were ever compromised.',
            },
            {
                type: 'heading',
                body: 'Cloudflare Turnstile — The Invisible Shield',
            },
            {
                type: 'text',
                body: 'We integrated Cloudflare Turnstile for bot protection. Unlike traditional CAPTCHAs that make you identify traffic lights, Turnstile works silently in the background. It analyses browser behaviour, device fingerprints, and network signals to determine if you\'re human. No puzzles, no frustration.',
            },
            {
                type: 'text',
                body: 'The verification happens entirely between your browser and Cloudflare\'s servers — our backend only receives a token to validate. Even if our servers are down, the Turnstile check still works because it\'s independently hosted by Cloudflare.',
            },
            {
                type: 'heading',
                body: 'Calls That Never Touch Our Servers',
            },
            {
                type: 'text',
                body: 'When you make a video or audio call on Blinx, the data flows peer-to-peer using WebRTC. Your voice, your face — none of it passes through our infrastructure. We don\'t record calls, we don\'t store call data, and we technically can\'t even intercept it if we wanted to.',
            },
            {
                type: 'heading',
                body: 'Minimal Google Scopes',
            },
            {
                type: 'text',
                body: 'When you sign in with Google, we request exactly four scopes: email, profile, calendar events, and Gmail read/send. That\'s it. We don\'t access your Contacts, Drive, Photos, or any other Google service. And you can revoke our access at any time from your Google Account settings or directly from your Blinx profile.',
            },
            {
                type: 'heading',
                body: 'Data Deletion — For Real',
            },
            {
                type: 'text',
                body: 'If you want your data removed, we actually remove it. No "we\'ll anonymise it" loopholes. Your profile, messages, AI conversation history, auth tokens — everything gets permanently deleted within 7 working days. We built a dedicated Data Deletion page because we believe this should be easy, not hidden behind five support emails.',
            },
            {
                type: 'text',
                body: 'Privacy shouldn\'t be a premium feature. It should be the default. That\'s what we built.',
            },
        ],
    },
    {
        id: 'ai-integration-google-workspace',
        date: '5 September 2025',
        category: 'AI',
        readTime: '6 min read',
        title: 'Integrating AI with Google Workspace',
        excerpt: 'How we connected GPT-4o with Gmail and Google Calendar to create a genuinely useful AI assistant inside a chat app.',
        content: [
            {
                type: 'text',
                body: 'The AI assistant is the feature that makes Blinx different from every other chat app out there. But building it was far from straightforward. We needed the AI to understand natural language commands and translate them into concrete API calls — reading emails, creating calendar events, drafting responses.',
            },
            {
                type: 'heading',
                body: 'The Architecture',
            },
            {
                type: 'text',
                body: 'When you send a message to the AI, here\'s what happens behind the scenes. Your message hits our Spring Boot backend, which routes it to the AI service. The AI service constructs a prompt with your message and the relevant context (conversation history, available tools). This goes to OpenAI\'s GPT-4o Mini endpoint. The response comes back, and if it includes a tool call (like "read_emails" or "create_event"), our backend executes that tool against the Google APIs using your OAuth tokens. The result gets sent back to the AI for a human-readable response.',
            },
            {
                type: 'text',
                body: 'The whole loop takes about 2-4 seconds end to end. Not instant, but fast enough to feel natural in a chat interface.',
            },
            {
                type: 'heading',
                body: 'Smart Replies & Summaries',
            },
            {
                type: 'text',
                body: 'Beyond the main AI chat, we plugged the same engine into two more features. Smart Replies analyses the last few messages in a conversation and generates 2-3 contextual reply suggestions. Conversation Summarisation takes the entire message history of a thread and distills it into key points. Both run through the analysis endpoints and use Resilience4j circuit breakers for fault tolerance.',
            },
            {
                type: 'heading',
                body: 'Incognito Mode',
            },
            {
                type: 'text',
                body: 'We added an incognito AI mode for users who want to interact with the AI without the responses being logged to their main conversation. It\'s a separate endpoint with its own configuration. You can even upload files — CSVs, spreadsheets — and the AI will analyse the data for you. Think of it as a private AI workspace within the app.',
            },
            {
                type: 'heading',
                body: 'Rate Limiting & Safety',
            },
            {
                type: 'text',
                body: 'AI API calls aren\'t cheap, especially on a college budget. We implemented rate limiting on the backend to prevent abuse. If someone hammers the AI endpoint, they get a friendly 429 response asking them to slow down. The frontend handles this gracefully with a toast notification showing the retry timer.',
            },
            {
                type: 'text',
                body: 'Building the AI integration taught us that the hardest part isn\'t the AI itself — it\'s the plumbing around it. Token management, error handling, timeout settings, user feedback during loading states. The AI model is just one piece of a much larger puzzle.',
            },
        ],
    },
    {
        id: 'offline-first-architecture',
        date: '20 August 2025',
        category: 'Engineering',
        readTime: '5 min read',
        title: 'Building an Offline-First Chat Experience',
        excerpt: 'How we ensured messages never get lost — even on unreliable Indian mobile networks.',
        content: [
            {
                type: 'text',
                body: 'If you\'ve ever used a chat app on Indian Railways WiFi or in a crowded metro with patchy 4G, you know the pain. Messages stuck on "Sending...", the interface freezing, duplicate messages appearing when the connection comes back. We were determined to solve this in Blinx.',
            },
            {
                type: 'heading',
                body: 'The Outbox Pattern',
            },
            {
                type: 'text',
                body: 'When you hit send on a message, it doesn\'t go directly to the server. First, it gets stored in a local outbox (managed by Zustand state). The UI immediately shows the message with a "Sending..." indicator so you feel instant feedback. In parallel, the message is dispatched through the WebSocket. If the socket is connected, the message arrives at the server within milliseconds. If not, it stays in the outbox.',
            },
            {
                type: 'heading',
                body: 'Automatic Sync on Reconnect',
            },
            {
                type: 'text',
                body: 'The moment the WebSocket reconnects (detected via STOMP connect events, browser online events, or tab visibility changes), a flush loop iterates through the outbox and sends each pending message in order. After a 3-second delay (to give the server time to process), we invalidate the React Query cache for the affected conversations. This forces a fresh fetch, replacing the optimistic "Sending..." messages with server-confirmed versions.',
            },
            {
                type: 'text',
                body: 'There\'s also a periodic retry every 15 seconds as a safety net. If any messages failed to send during the initial flush, they get picked up on the next cycle.',
            },
            {
                type: 'heading',
                body: 'Circuit Breaker on the API Client',
            },
            {
                type: 'text',
                body: 'Our Axios-based API client has a built-in circuit breaker pattern. After 3 consecutive network failures, it transitions to an "OPEN" state and stops making requests for 10 seconds. This prevents the browser from flooding a downed server with retry requests (which would create thousands of ERR_CONNECTION_REFUSED errors in the console). After the cooldown, a single test request is sent. If it succeeds, normal operations resume.',
            },
            {
                type: 'text',
                body: 'The combination of the outbox pattern, automatic sync, and circuit breaker creates a chat experience that feels reliable even in the worst network conditions. That\'s not just a technical achievement — it\'s what makes users trust the app.',
            },
        ],
    },
];

export const getBlogById = (id) => blogPosts.find(post => post.id === id);
