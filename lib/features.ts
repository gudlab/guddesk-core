export interface Feature {
  slug: string;
  name: string;
  tagline: string;
  headline: string;
  description: string;
  icon: string;
  highlights: {
    title: string;
    description: string;
    icon: string;
  }[];
  capabilities: string[];
  useCaseExamples: {
    title: string;
    description: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  relatedFeatures: string[]; // slugs
}

export const features: Feature[] = [
  {
    slug: "live-chat",
    name: "Live Chat",
    tagline: "Real-time conversations with your customers",
    headline: "Embed live chat in minutes. Resolve issues in seconds.",
    description:
      "Add a customizable chat widget to your website or app with two lines of JavaScript. Customers get instant access to your team and AI agents — no page reloads, no email delays.",
    icon: "messageCircle",
    highlights: [
      {
        title: "Two-line installation",
        description:
          "Paste a JavaScript snippet into your site. The widget handles authentication, theming, and real-time messaging out of the box.",
        icon: "code",
      },
      {
        title: "Fully customizable",
        description:
          "Match your brand with custom colors, position, welcome message, and visibility rules. Show the widget only on pages where it matters.",
        icon: "palette",
      },
      {
        title: "Article suggestions",
        description:
          "The widget automatically suggests knowledge base articles based on the page the visitor is on, deflecting up to 30% of conversations.",
        icon: "bookOpen",
      },
      {
        title: "Visitor identity",
        description:
          "Pass user identity (name, email, plan) via the JavaScript API for authenticated support. HMAC verification prevents spoofing.",
        icon: "shieldCheck",
      },
    ],
    capabilities: [
      "Embeddable chat widget",
      "Custom branding and colors",
      "Page-based visibility rules",
      "Article suggestions",
      "Identity verification (HMAC)",
      "File attachments",
      "Typing indicators",
      "Real-time messaging via Pusher",
      "Offline form fallback",
      "Mobile responsive",
    ],
    useCaseExamples: [
      {
        title: "SaaS in-app support",
        description:
          "Embed the widget inside your dashboard. Users ask questions without leaving the app. AI agents respond instantly with help articles.",
      },
      {
        title: "Ecommerce pre-sale chat",
        description:
          "Show the widget on product pages. Answer sizing, shipping, and availability questions in real time to keep buyers in the purchase flow.",
      },
    ],
    faqs: [
      {
        question: "Does the widget slow down my website?",
        answer:
          "No. The widget loads asynchronously and weighs under 30KB gzipped. It has zero impact on your Core Web Vitals scores.",
      },
      {
        question: "Can I control which pages show the widget?",
        answer:
          "Yes. Use page visibility rules with glob patterns to include or exclude specific URLs. You can also show/hide the widget programmatically via the JavaScript API.",
      },
      {
        question: "Does it work on mobile?",
        answer:
          "Yes. The widget is fully responsive and works on mobile browsers, tablets, and desktop. It adapts its layout to the screen size automatically.",
      },
    ],
    relatedFeatures: ["ai-agents", "knowledge-base", "shared-inbox"],
  },
  {
    slug: "ai-agents",
    name: "AI Agents",
    tagline: "Connect your own bot. Claude helps your team.",
    headline: "Reply as BOT through the API. Claude drafts the rest.",
    description:
      "Install your own agent to receive webhooks and reply as BOT. Claude can suggest replies, summarise threads, categorise conversations, read sentiment and suggest articles. A first-party GudDesk agent is on the roadmap. There is no per-resolution fee.",
    icon: "sparkles",
    highlights: [
      {
        title: "Your own agent",
        description:
          "Install an agent to get a webhook and an API key. It hears about new messages and replies as BOT in the widget and inbox.",
        icon: "code",
      },
      {
        title: "REST API and MCP",
        description:
          "Conversations, customers, articles, companies, segments and workspaces. Build in any language.",
        icon: "server",
      },
      {
        title: "Claude assist",
        description:
          "Reply suggestions, summaries, categorisation, sentiment and article suggestions. Cloud Pro includes this. Self-hosters set ANTHROPIC_API_KEY.",
        icon: "sparkles",
      },
      {
        title: "First-party agent",
        description:
          "A built-in GudDesk AI agent is on the roadmap. It is not shipped yet.",
        icon: "bot",
      },
    ],
    capabilities: [
      "Custom agents via API",
      "BOT message type",
      "Webhook event triggers",
      "REST API and MCP",
      "Conversation summarization",
      "Sentiment analysis",
      "Reply suggestions",
      "Article suggestions",
      "No per-resolution fees",
      "First-party agent on the roadmap",
    ],
    useCaseExamples: [
      {
        title: "Overnight coverage with your bot",
        description:
          "Your agent receives webhooks while the team is offline and replies as BOT. Claude can suggest articles so a teammate has a draft waiting in the morning.",
      },
      {
        title: "Launch day traffic spikes",
        description:
          "When volume spikes, your own bot can take the first reply. Humans step in on the conversations that need them.",
      },
    ],
    faqs: [
      {
        question: "Is there a built-in GudBot?",
        answer:
          "Not yet. GudBot, TriageBot and OnboardBot are on the roadmap. Today you connect your own agent, or use Claude assist on Cloud Pro (self-hosters add an Anthropic key).",
      },
      {
        question: "Can I build my own AI agent?",
        answer:
          "Yes. Installing an agent gives it a webhook and an API key. It receives conversation events and replies through the REST API or the MCP server.",
      },
      {
        question: "What AI model powers the built-in assist?",
        answer:
          "Claude, by Anthropic. Custom agents can use any model you like. There is no per-resolution fee.",
      },
    ],
    relatedFeatures: ["live-chat", "shared-inbox", "automation-rules"],
  },
  {
    slug: "shared-inbox",
    name: "Shared Inbox",
    tagline: "One inbox for your entire support team",
    headline: "Every conversation, every channel, one inbox.",
    description:
      "Live chat, email, and bot conversations all flow into a single shared inbox. Assign, tag, prioritize, and resolve conversations as a team — with collision detection so two agents never reply to the same customer.",
    icon: "inbox",
    highlights: [
      {
        title: "Unified conversation view",
        description:
          "See all conversations in one list regardless of channel. Filter by status (open, snoozed, closed), assignee, tag, or priority.",
        icon: "inbox",
      },
      {
        title: "Collision detection",
        description:
          "Real-time indicators show when another agent is viewing or replying to a conversation. Never send duplicate responses again.",
        icon: "eye",
      },
      {
        title: "Assignment and routing",
        description:
          "Manually assign conversations or let automation rules route them by tag, priority, or customer segment. Round-robin assignment keeps workload balanced.",
        icon: "users",
      },
      {
        title: "Internal notes and side conversations",
        description:
          "Leave private notes for your team. Start side conversations to loop in specialists without the customer seeing the back-channel discussion.",
        icon: "messageSquarePlus",
      },
    ],
    capabilities: [
      "Multi-channel inbox",
      "Collision detection",
      "Assignment rules",
      "Tags and priority levels",
      "Internal notes",
      "Side conversations",
      "Shared drafts",
      "Canned responses",
      "@mentions",
      "Conversation search and filters",
    ],
    useCaseExamples: [
      {
        title: "Small team, big volume",
        description:
          "Three agents manage hundreds of conversations. Assignment rules distribute workload evenly. Collision detection prevents embarrassing double-replies.",
      },
      {
        title: "Cross-team escalation",
        description:
          "A support agent encounters a billing question. They start a side conversation with the finance team, get the answer, and reply to the customer — all without leaving the inbox.",
      },
    ],
    faqs: [
      {
        question: "What channels does the inbox support?",
        answer:
          "Currently: live chat (widget), email, and API-created conversations. WhatsApp and Telegram channels are coming soon.",
      },
      {
        question: "Can I see who else is looking at a conversation?",
        answer:
          "Yes. Collision detection shows real-time avatars of agents viewing or typing in a conversation. You'll see a banner warning before you accidentally duplicate a reply.",
      },
      {
        question: "How do shared drafts work?",
        answer:
          "Any agent can start a draft reply that other team members can see and edit. This is useful for complex responses that need review before sending.",
      },
    ],
    relatedFeatures: ["live-chat", "ai-agents", "automation-rules"],
  },
  {
    slug: "knowledge-base",
    name: "Knowledge Base",
    tagline: "Self-service help center for your customers",
    headline: "Build a help center that actually helps.",
    description:
      "Create and publish help articles organized into collections. Your knowledge base powers both the customer-facing help center and the AI agents — so every article you write makes your entire support system smarter.",
    icon: "bookOpen",
    highlights: [
      {
        title: "Rich article editor",
        description:
          "Write articles with a clean editor. Add code blocks, images, and formatting. Organize articles into collections with custom ordering.",
        icon: "fileEdit",
      },
      {
        title: "Public help center",
        description:
          "Published articles are available at your custom help center URL. Customers can search and browse without logging in.",
        icon: "globe",
      },
      {
        title: "AI-powered article suggestions",
        description:
          "The chat widget suggests relevant articles before visitors start a conversation. AI agents also search your knowledge base when answering questions.",
        icon: "sparkles",
      },
      {
        title: "Article analytics",
        description:
          "Track view counts, helpful/not-helpful votes per article. Identify gaps in your documentation and improve the articles that matter most.",
        icon: "analytics",
      },
    ],
    capabilities: [
      "Article editor",
      "Collections and ordering",
      "Public help center",
      "Search functionality",
      "Article suggestions in widget",
      "AI agent integration",
      "Helpful/not-helpful voting",
      "View count tracking",
      "Draft and published states",
      "Custom help center branding",
    ],
    useCaseExamples: [
      {
        title: "Deflect tickets with self-service",
        description:
          "Publish articles about your most common questions. The widget suggests them automatically, deflecting up to 30% of conversations before they start.",
      },
      {
        title: "Train AI agents with documentation",
        description:
          "Claude can suggest published articles in the widget and inbox. Your own agent can search the same help center through the API.",
      },
    ],
    faqs: [
      {
        question: "Can I customize the help center appearance?",
        answer:
          "Yes. Set your help center title, subtitle, primary color, and logo. The help center matches your brand and is available at a dedicated URL.",
      },
      {
        question: "Do articles feed into the AI features?",
        answer:
          "Claude can suggest published articles in the widget. Your own agent can read the same articles through the API.",
      },
      {
        question: "Can I import existing documentation?",
        answer:
          "You can create articles via the REST API, which makes it straightforward to import from other platforms. A dedicated import tool is planned.",
      },
    ],
    relatedFeatures: ["ai-agents", "live-chat", "analytics"],
  },
  {
    slug: "automation-rules",
    name: "Automation Rules",
    tagline: "Automate repetitive support tasks",
    headline: "Let rules handle the repetitive work.",
    description:
      "Create trigger-based rules that automatically assign, tag, route, and respond to conversations. Free up your team to focus on complex issues while automations handle the routine.",
    icon: "automations",
    highlights: [
      {
        title: "Event-driven triggers",
        description:
          "Fire rules on conversation created, message received, conversation closed, tag added, or when a conversation goes unassigned for a set time.",
        icon: "zap",
      },
      {
        title: "Flexible actions",
        description:
          "Assign to a specific agent, add or remove tags, change status, send a canned response, or notify Slack. Chain actions for complex workflows.",
        icon: "automations",
      },
      {
        title: "Conditional logic",
        description:
          "Apply conditions based on tags, status, channel, or custom fields. Route billing questions to finance and bug reports to engineering automatically.",
        icon: "settings",
      },
      {
        title: "SLA enforcement",
        description:
          "Define SLA policies with first-response and resolution deadlines. Get notified when SLAs are about to breach so your team can prioritize.",
        icon: "clock",
      },
    ],
    capabilities: [
      "5 trigger types",
      "6 action types",
      "Conditional matching",
      "SLA policies with timers",
      "Business hours awareness",
      "Slack notifications",
      "Auto-assignment",
      "Auto-tagging",
      "Canned response sending",
      "Priority rules",
    ],
    useCaseExamples: [
      {
        title: "Auto-route by topic",
        description:
          "When a conversation is tagged billing, an automation can assign it to your billing specialist. When it is tagged bug, it can go to engineering.",
      },
      {
        title: "Escalation on SLA breach",
        description:
          "If a conversation isn't responded to within 15 minutes, an automation notifies the team lead in Slack and bumps the priority to urgent.",
      },
    ],
    faqs: [
      {
        question: "How many automation rules can I create?",
        answer:
          "There's no limit on the number of rules. Rules execute in priority order, so you can layer them for complex routing logic.",
      },
      {
        question: "Can automations send messages to customers?",
        answer:
          "Yes. The SEND_MESSAGE action can send a canned response to the customer. This is useful for auto-acknowledgments or common follow-up instructions.",
      },
      {
        question: "Do SLA timers account for business hours?",
        answer:
          "Yes. Configure your business hours and timezone. SLA timers pause outside business hours so your team isn't penalized for overnight gaps.",
      },
    ],
    relatedFeatures: ["shared-inbox", "ai-agents", "analytics"],
  },
  {
    slug: "analytics",
    name: "Analytics & Reporting",
    tagline: "Data-driven support decisions",
    headline: "Measure everything. Improve what matters.",
    description:
      "Built-in analytics give you conversation volume trends, response time breakdowns, resolution rates, agent performance scores, and CSAT results. No third-party analytics tool required.",
    icon: "analytics",
    highlights: [
      {
        title: "Conversation analytics",
        description:
          "Track new conversations, closed conversations, messages sent, and response times. See trends over time with daily snapshots.",
        icon: "lineChart",
      },
      {
        title: "Agent performance",
        description:
          "Per-agent metrics: conversations handled, average response time, resolution time, and CSAT score. Identify top performers and coaching opportunities.",
        icon: "users",
      },
      {
        title: "CSAT surveys",
        description:
          "Automatic customer satisfaction surveys after conversation close. Track scores over time and per agent. Identify what's working and what's not.",
        icon: "star",
      },
      {
        title: "Workload monitoring",
        description:
          "See real-time agent availability, active conversation counts, and workload distribution. Balance the load before anyone burns out.",
        icon: "eye",
      },
    ],
    capabilities: [
      "Conversation volume trends",
      "Response time analytics",
      "Resolution time tracking",
      "Agent performance dashboards",
      "CSAT survey system",
      "NPS surveys",
      "Workload monitoring",
      "Daily analytics snapshots",
      "Agent availability tracking",
      "Per-workspace analytics",
    ],
    useCaseExamples: [
      {
        title: "Monthly team review",
        description:
          "Pull up the performance dashboard for the past month. See who handled the most conversations, who has the best CSAT scores, and where bottlenecks are forming.",
      },
      {
        title: "Identify documentation gaps",
        description:
          "High-volume topics with low AI resolution rates indicate missing knowledge base articles. Write those articles and watch the numbers improve.",
      },
    ],
    faqs: [
      {
        question: "Is analytics included in the free plan?",
        answer:
          "Yes. All analytics features — conversation metrics, agent performance, CSAT surveys — are included in the free plan.",
      },
      {
        question: "Can I export analytics data?",
        answer:
          "Analytics data is accessible via the REST API. You can query snapshots and export to your preferred reporting tool or data warehouse.",
      },
      {
        question: "How far back does data go?",
        answer:
          "Analytics snapshots are stored daily with no retention limit. You can view trends from the day your workspace was created.",
      },
    ],
    relatedFeatures: ["shared-inbox", "automation-rules", "ai-agents"],
  },
];

export function getFeatureBySlug(slug: string): Feature | undefined {
  return features.find((f) => f.slug === slug);
}

export function getAllFeatureSlugs(): string[] {
  return features.map((f) => f.slug);
}
