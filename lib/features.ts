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
    tagline: "Live chat with your customers",
    headline: "Embed live chat with two lines of JavaScript.",
    description:
      "Add a customizable chat widget to your website or app with two lines of JavaScript. Customers reach your team without reloading the page, in the same thread as any BOT replies from an agent you connect.",
    icon: "messageCircle",
    highlights: [
      {
        title: "Two-line installation",
        description:
          "Paste a JavaScript snippet into your site. The widget handles authentication and theming. Messages arrive in real time when you add Pusher keys, and within seconds without them.",
        icon: "code",
      },
      {
        title: "Fully customizable",
        description:
          "Match your brand with custom colors, position, welcome message, and visibility rules. Show the widget only on pages where it matters.",
        icon: "palette",
      },
      {
        title: "Offline form",
        description:
          "When your team is away, the widget can show a short form that collects the visitor's email and message.",
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
      "Identity verification (HMAC)",
      "Typing indicators (with Pusher keys)",
      "Real-time messaging via Pusher (optional)",
      "Offline form fallback",
      "Mobile responsive",
    ],
    useCaseExamples: [
      {
        title: "SaaS in-app support",
        description:
          "Embed the widget inside your dashboard. Users ask questions without leaving the app. Your own agent can reply as BOT if you connected one.",
      },
      {
        title: "Ecommerce pre-sale chat",
        description:
          "Show the widget on product pages. Answer sizing and shipping questions while buyers are still on the page.",
      },
    ],
    faqs: [
      {
        question: "Does the widget slow down my website?",
        answer:
          "The snippet loads the script with the async attribute, so it does not block your page from rendering. The script is about 35 kB gzipped.",
      },
      {
        question: "Can I control which pages show the widget?",
        answer:
          "Yes. Use page visibility rules with glob patterns to include or exclude specific URLs. You can also open and close the chat window from your own code with GudDesk.open() and GudDesk.close().",
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
    tagline: "Connect your own bot. AI assist for your team is planned.",
    headline: "Your agent replies as BOT through the API.",
    description:
      "Reply as BOT through the API. AI reply suggestions and summaries for your team are planned.",
    icon: "sparkles",
    highlights: [
      {
        title: "Bring your own agent",
        description:
          "Install an agent to get a webhook and an API key. It hears about new messages and replies as BOT.",
        icon: "code",
      },
      {
        title: "BOT replies in the inbox",
        description:
          "Visitors see those replies in the widget like any other message. They sit in the same thread as your team's.",
        icon: "bot",
      },
      {
        title: "AI assist (planned)",
        description:
          "Reply suggestions and summaries for your team. Planned, shipping with GudBot v1.",
        icon: "sparkles",
      },
      {
        title: "No per-resolution fee",
        description:
          "GudDesk does not charge per AI outcome. A built-in GudDesk AI agent that answers on its own is on the roadmap.",
        icon: "users",
      },
    ],
    capabilities: [
      "Agent webhooks",
      "REST API and MCP",
      "BOT message type",
      "AI reply suggestions and summaries: planned",
      "No per-resolution fees",
      "Built-in agent on the roadmap",
    ],
    useCaseExamples: [
      {
        title: "Overnight coverage with your bot",
        description:
          "Your agent receives webhooks while the team is offline and replies as BOT.",
      },
      {
        title: "Launch day traffic",
        description:
          "Your own agent can answer first if you have one connected. Humans pick up the conversations that need them.",
      },
    ],
    faqs: [
      {
        question: "Is there a built-in AI agent?",
        answer:
          "Not yet. One is on the roadmap. Today you connect your own agent through the API.",
      },
      {
        question: "Can I build my own AI agent?",
        answer:
          "Yes. Installing an agent gives it a webhook and an API key. It hears about new messages and replies as BOT through the REST API or the MCP server.",
      },
      {
        question: "Will GudDesk add AI assist for agents?",
        answer:
          "Yes. Reply suggestions and summaries are planned and will ship with GudBot v1. Custom agents you connect today can use any model you like.",
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
      "Chat and email conversations land in one shared inbox, next to any BOT replies. Assign, tag, prioritize and resolve conversations as a team.",
    icon: "inbox",
    highlights: [
      {
        title: "Unified conversation view",
        description:
          "See all conversations in one list regardless of channel. Filter by status (open, snoozed, closed) and by assignee.",
        icon: "inbox",
      },
      {
        title: "Assignment and notes",
        description:
          "Assign a conversation to a teammate and leave internal notes the customer can't see.",
        icon: "eye",
      },
      {
        title: "Manual assignment",
        description:
          "Assign a conversation to a teammate from the inbox or through the API. The conversation list shows who each one belongs to.",
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
      "Manual assignment",
      "Tags and priority levels",
      "Internal notes",
      "Side conversations",
      "Shared drafts",
      "Canned responses",
      "@mentions",
      "Status and assignee filters",
    ],
    useCaseExamples: [
      {
        title: "Small team, big volume",
        description:
          "A small support team works through hundreds of conversations. Each one shows who it is assigned to, and internal notes keep everyone up to date.",
      },
      {
        title: "Cross-team escalation",
        description:
          "A support agent encounters a billing question. They start a side conversation with the finance team, get the answer, and reply to the customer, all without leaving the inbox.",
      },
    ],
    faqs: [
      {
        question: "What channels does the inbox support?",
        answer:
          "Currently: live chat (widget), email, and API-created conversations. WhatsApp is on the roadmap.",
      },
      {
        question: "Can I see who else is looking at a conversation?",
        answer:
          "Not yet. A collision banner is built, but the inbox does not show it yet. Until then, assign a conversation before you reply so teammates know it's yours.",
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
      "Create and publish help articles organized into collections. Your knowledge base powers the customer-facing help center.",
    icon: "bookOpen",
    highlights: [
      {
        title: "Rich article editor",
        description:
          "Write articles, save them as drafts, and publish them when they are ready. Organize articles into collections in the order you choose.",
        icon: "fileEdit",
      },
      {
        title: "Public help center",
        description:
          "Published articles are available at your help center URL. Customers can search and browse without logging in.",
        icon: "globe",
      },
      {
        title: "Searchable help center",
        description:
          "Your own agent can search published articles with the search_articles tool on the GudDesk MCP server.",
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
      "Helpful/not-helpful voting",
      "View count tracking",
      "Draft and published states",
      "Custom help center branding",
    ],
    useCaseExamples: [
      {
        title: "Deflect tickets with self-service",
        description:
          "Publish articles about your most common questions so customers can find the answer in your help center before they write in.",
      },
      {
        title: "Feed your own agent",
        description:
          "Connect your agent to the GudDesk MCP server and it can look up answers with the search_articles tool.",
      },
    ],
    faqs: [
      {
        question: "Can I customize the help center appearance?",
        answer:
          "Yes. Set your help center title, subtitle, primary color, and logo. The help center matches your brand and is available at a dedicated URL.",
      },
      {
        question: "Can agents read my articles?",
        answer:
          "Yes, through the GudDesk MCP server. Its search_articles tool searches your published articles. The REST API can list articles but has no search.",
      },
      {
        question: "Can I import existing documentation?",
        answer:
          "There is no import tool yet. You can create articles through the REST API and bring content over from other platforms with your own script.",
      },
    ],
    relatedFeatures: ["ai-agents", "live-chat", "analytics"],
  },
  {
    slug: "automation-rules",
    name: "Automation Rules",
    tagline: "Rule builder and SLA policies",
    headline: "Set up rules and SLA deadlines.",
    description:
      "Build rules with a trigger, conditions and one action. GudDesk runs each rule when its trigger fires. SLA policies with first-response and resolution deadlines work today.",
    icon: "automations",
    highlights: [
      {
        title: "Triggers",
        description:
          "Pick a trigger for each rule: conversation created, message received, conversation closed, tag added, or unassigned for a set time.",
        icon: "zap",
      },
      {
        title: "Actions",
        description:
          "Each rule has one action: assign to an agent, add or remove a tag, change status, send a canned response, or post to Slack.",
        icon: "automations",
      },
      {
        title: "Conditions",
        description:
          "Match on tags, the visitor's email address, or words in the message.",
        icon: "settings",
      },
      {
        title: "SLA enforcement",
        description:
          "Define SLA policies with first-response and resolution deadlines. A check runs once a day, adds a note to breached conversations and emails the assignee, so a breach can take up to a day to be flagged.",
        icon: "clock",
      },
    ],
    capabilities: [
      "Rule builder with one action per rule",
      "5 trigger types",
      "6 action types",
      "Tag, email and message conditions",
      "SLA policies with deadlines",
      "Business hours for SLA deadlines",
      "Daily SLA breach check and email",
    ],
    useCaseExamples: [
      {
        title: "Catch missed first replies",
        description:
          "Set a first-response deadline. The daily SLA check adds a breach note to late conversations and emails the assignee.",
      },
      {
        title: "Deadlines that respect business hours",
        description:
          "SLA deadlines count only your business hours, so a message sent late at night is not due until the next working morning.",
      },
    ],
    faqs: [
      {
        question: "How many automation rules can I create?",
        answer:
          "There is no limit on the number of rules. Rules run in the order you set. To stop loops, one conversation runs at most 20 rules an hour.",
      },
      {
        question: "Can automations send messages to customers?",
        answer:
          "Yes. A rule with a send-message action posts a bot reply with the text you set. On email conversations the reply shows in the thread but is not emailed yet.",
      },
      {
        question: "Do SLA timers account for business hours?",
        answer:
          "Yes. Configure your business hours and timezone. SLA deadlines only count time inside business hours.",
      },
    ],
    relatedFeatures: ["shared-inbox", "ai-agents", "analytics"],
  },
  {
    slug: "analytics",
    name: "Analytics & Reporting",
    tagline: "Reports on volume, response and resolution times",
    headline: "See how your support team is doing.",
    description:
      "Built-in analytics show conversation volume, response times, resolution times and per-agent numbers. CSAT settings and a CSAT dashboard are there, but visitors can't rate in the widget yet.",
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
          "Per-agent metrics: conversations handled, average response time and resolution time.",
        icon: "users",
      },
      {
        title: "CSAT settings and dashboard",
        description:
          "Set up a CSAT survey in Settings and see results on the Feedback page. Visitors can't rate in the widget yet, so there are no scores until widget rating ships.",
        icon: "star",
      },
      {
        title: "Workload monitoring",
        description:
          "See how many open conversations each agent has right now.",
        icon: "eye",
      },
    ],
    capabilities: [
      "Conversation volume trends",
      "Response time analytics",
      "Resolution time tracking",
      "Agent performance dashboards",
      "CSAT settings and dashboard (no widget rating yet)",
      "NPS survey settings and score dashboard",
      "Workload monitoring",
      "Daily analytics snapshots",
      "Agent availability tracking",
      "Per-workspace analytics",
    ],
    useCaseExamples: [
      {
        title: "Monthly team review",
        description:
          "Pull up the performance dashboard for the past month. See who handled the most conversations, how fast each person replied, and where bottlenecks are forming.",
      },
      {
        title: "Identify documentation gaps",
        description:
          "Read recent conversations for questions your help center does not answer yet. After you publish an article, check its views and votes.",
      },
    ],
    faqs: [
      {
        question: "Is analytics included in the free plan?",
        answer:
          "Yes. All analytics features (conversation metrics, agent performance, CSAT and NPS settings and dashboards) are included in the free plan.",
      },
      {
        question: "Do you support NPS?",
        answer:
          "Partly. You can set up an NPS survey in Settings and the Feedback page shows your NPS score. The widget does not ask visitors the NPS question yet.",
      },
      {
        question: "Can I export analytics data?",
        answer:
          "Not yet. The REST API has no analytics endpoint. You can pull conversations through the API and build your own reports.",
      },
      {
        question: "How far back does data go?",
        answer:
          "A snapshot is stored each day with no retention limit. Trends start from the first daily snapshot after your workspace was created.",
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
