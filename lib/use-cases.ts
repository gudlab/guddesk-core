export interface UseCase {
  slug: string;
  name: string;
  tagline: string;
  headline: string;
  description: string;
  heroImage?: string;
  benefits: {
    title: string;
    description: string;
    icon: string;
  }[];
  workflows: {
    title: string;
    description: string;
  }[];
  features: string[];
  testimonialQuote?: string;
  testimonialAuthor?: string;
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const useCases: UseCase[] = [
  {
    slug: "saas",
    name: "SaaS Companies",
    tagline: "Customer support built for SaaS",
    headline: "Support that scales with your SaaS",
    description:
      "SaaS teams need fast response times, intelligent routing and self-service options. GudDesk combines live chat, a shared inbox and an agent API so your support team can handle more conversations.",
    benefits: [
      {
        title: "Reduce churn with fast responses",
        description:
          "Embed the chat widget in your app. Your own AI agent can answer L1 questions through the agent API while your team focuses on complex issues.",
        icon: "zap",
      },
      {
        title: "Self-service knowledge base",
        description:
          "Build and publish help articles. The widget automatically suggests relevant articles before visitors start a conversation, deflecting up to 30% of tickets.",
        icon: "bookOpen",
      },
      {
        title: "Track customer health",
        description:
          "See customer profiles, conversation history, and custom attributes in one sidebar. Identify at-risk accounts before they churn.",
        icon: "users",
      },
      {
        title: "Connect to your stack",
        description:
          "Use webhooks, the REST API, or Slack integration to connect GudDesk to your CRM, billing system, or product analytics tool.",
        icon: "code",
      },
    ],
    workflows: [
      {
        title: "New trial user asks a question",
        description:
          "The widget opens in-app. Visitors can search your help center. If you connected your own agent, it can reply as BOT. Otherwise a teammate picks it up in the inbox.",
      },
      {
        title: "Customer reports a bug",
        description:
          "An automation can tag the conversation as a bug and assign it to engineering, with an SLA timer running.",
      },
      {
        title: "Renewal is approaching",
        description:
          "Use automation rules to notify your team when high-value customers open a conversation. See their subscription status, usage data, and conversation history in one view.",
      },
    ],
    features: [
      "Live chat widget",
      "Agent API (reply as BOT)",
      "Shared inbox",
      "Knowledge base",
      "SLA policies",
      "CSAT surveys",
      "Automation rules",
      "Slack integration",
      "REST API",
      "Customer profiles",
    ],
    faqs: [
      {
        question: "Can GudDesk handle our volume?",
        answer:
          "GudDesk is designed for small to mid-size SaaS teams handling hundreds to thousands of conversations per month. Connect your own agent to answer first. AI reply suggestions for your team are planned.",
      },
      {
        question: "Does it integrate with our billing system?",
        answer:
          "Use the REST API or webhooks to sync customer data from Stripe, Paddle, or any billing system. Custom fields let you display plan info, MRR, and usage metrics directly in the conversation sidebar.",
      },
      {
        question: "Can we embed it in our app?",
        answer:
          "Yes. Add two lines of JavaScript to your app and the widget appears. You can pass user identity (name, email, plan) for authenticated support and control widget visibility per page.",
      },
    ],
  },
  {
    slug: "ecommerce",
    name: "Ecommerce",
    tagline: "Customer support for online stores",
    headline: "Turn support conversations into sales",
    description:
      "Ecommerce customers expect fast answers about orders and returns. GudDesk gives your team a shared inbox and lets you connect your own AI agent, so you can resolve questions fast and keep customers buying.",
    benefits: [
      {
        title: "Answer pre-sale questions on the page",
        description:
          "Visitors browsing your store can ask about sizing, availability, or shipping without leaving the page. Your own agent can reply as BOT if you connected one.",
        icon: "messageCircle",
      },
      {
        title: "Handle order inquiries at scale",
        description:
          "Connect your order system via webhooks. When a customer asks about their order, agents see order status, tracking info, and purchase history in the sidebar.",
        icon: "package",
      },
      {
        title: "Automate returns and exchanges",
        description:
          "Build automation rules for common requests. When a customer mentions a return, GudDesk can auto-tag, assign to your returns team, and send a templated response.",
        icon: "refreshCw",
      },
      {
        title: "Measure customer satisfaction",
        description:
          "Send CSAT surveys after conversations close. Track satisfaction scores per agent and per issue type to continuously improve your support experience.",
        icon: "star",
      },
    ],
    workflows: [
      {
        title: "Visitor asks about product availability",
        description:
          "Your own agent can reply as BOT if you have one connected.",
      },
      {
        title: "Customer needs to return an item",
        description:
          "Automation detects the return intent, tags the conversation, sends the return policy, and routes it to your returns specialist. Resolution time drops by 60%.",
      },
      {
        title: "VIP customer reaches out",
        description:
          "Customer segments identify high-value buyers. When a VIP starts a conversation, it's automatically prioritized and assigned to your senior support team.",
      },
    ],
    features: [
      "Live chat widget",
      "Agent API (reply as BOT)",
      "Shared inbox",
      "Knowledge base",
      "Automation rules",
      "Customer segments",
      "CSAT surveys",
      "Canned responses",
      "Tags and priority",
      "Webhooks",
    ],
    faqs: [
      {
        question: "Can I add the chat widget to Shopify?",
        answer:
          "Yes. Paste the GudDesk snippet into your Shopify theme's code editor. The widget works on any website that supports custom JavaScript, including Shopify, WooCommerce, BigCommerce, and custom storefronts.",
      },
      {
        question: "How do I show order info in conversations?",
        answer:
          "Use custom fields and the REST API to push order data into visitor profiles. When a customer messages you, their recent orders, shipping status, and purchase history appear in the conversation sidebar.",
      },
      {
        question: "Is there a free plan for small stores?",
        answer:
          "Yes. GudDesk Cloud Free covers 2 members and 500 conversations a month. No credit card required. This covers most small ecommerce teams.",
      },
    ],
  },
  {
    slug: "startups",
    name: "Startups",
    tagline: "Support that grows with your startup",
    headline: "World-class support on a startup budget",
    description:
      "Startups need support tools at a flat $29 a month. GudDesk Cloud Free covers 2 members. Connect your own agent through the API. Self-host if you need no caps.",
    benefits: [
      {
        title: "Cloud Free: 2 members",
        description:
          "No credit card, no trial period. Get live chat, knowledge base, automations and the agent API at zero cost while you're getting started.",
        icon: "sparkles",
      },
      {
        title: "Two lines of JavaScript",
        description:
          "Create an account, embed two lines of JavaScript, and you're live. No complex configuration, no implementation consultants, no onboarding calls.",
        icon: "zap",
      },
      {
        title: "Connect your own agent",
        description:
          "Connect your own agent to answer as BOT. A first-party GudDesk agent is on the roadmap.",
        icon: "bot",
      },
      {
        title: "Grow without replatforming",
        description:
          "Start free, upgrade when you grow. GudDesk uses flat pricing (not per-seat), so adding team members doesn't break the budget. Self-host if you need full control.",
        icon: "lineChart",
      },
    ],
    workflows: [
      {
        title: "Solo founder handling support",
        description:
          "Your own agent can take first replies as BOT. Slack can notify you when a human is needed. Canned responses let you answer quickly when you do step in.",
      },
      {
        title: "Scaling to your first support hire",
        description:
          "Add a second member for free. The shared inbox and assignment rules help you avoid duplicate work, and collision detection helps too when you add Pusher keys.",
      },
      {
        title: "Investor demo or launch day",
        description:
          "The widget handles the traffic spike. Your help center answers common questions. You focus on the conversations that matter, such as potential customers and partners.",
      },
    ],
    features: [
      "Free for 2 members",
      "Agent API (reply as BOT)",
      "Two-line widget snippet",
      "Shared inbox",
      "Knowledge base",
      "Slack notifications",
      "Canned responses",
      "Customer profiles",
      "CSAT surveys",
      "Open source",
    ],
    faqs: [
      {
        question: "What's the catch with the free plan?",
        answer:
          "There is no catch. Cloud Free includes live chat, inbox, knowledge base, automations and the agent API. Caps are 2 members and 500 conversations a month. Pro is a flat $29/mo with no per-seat pricing.",
      },
      {
        question: "Can I self-host GudDesk?",
        answer:
          "Yes. GudDesk is open source under AGPL-3.0. Clone the repo, run it on your own infrastructure, and you have a complete support platform with zero ongoing costs.",
      },
      {
        question: "Will I have to migrate later?",
        answer:
          "No. GudDesk is built to scale. The same platform that serves your first 10 customers will serve your first 10,000. If you self-host, you control the infrastructure entirely.",
      },
    ],
  },
  {
    slug: "agencies",
    name: "Agencies & Consultancies",
    tagline: "Client communication in one place",
    headline: "Manage client support across all your accounts",
    description:
      "Agencies juggle multiple clients, each with their own brand and support needs. GudDesk workspaces let you manage separate support inboxes per client while your team operates from a single dashboard.",
    benefits: [
      {
        title: "One workspace per client",
        description:
          "Create a dedicated workspace for each client with their own branding, widget settings, knowledge base, and team assignments. Keep everything organized.",
        icon: "building",
      },
      {
        title: "White-label the widget",
        description:
          "Customize the chat widget's colors, logo, welcome message, and positioning to match each client's brand. No GudDesk branding on the Pro plan.",
        icon: "palette",
      },
      {
        title: "Team permissions and roles",
        description:
          "Assign agents to specific workspaces with role-based access. Junior agents handle L1, senior agents handle escalations, and admins manage settings.",
        icon: "shieldCheck",
      },
      {
        title: "Report to clients with data",
        description:
          "Built-in analytics show conversation volume, response times, resolution times, and CSAT scores. Export reports for client reviews.",
        icon: "analytics",
      },
    ],
    workflows: [
      {
        title: "Onboarding a new client",
        description:
          "Create a new workspace, configure the widget to match their brand, add their knowledge base articles, and invite their team.",
      },
      {
        title: "Handling cross-client escalations",
        description:
          "Each workspace has its own inbox. Your team sees conversations grouped by client. Internal notes and side conversations keep cross-team communication private.",
      },
      {
        title: "Monthly client reporting",
        description:
          "Pull analytics per workspace: conversations handled, average response time, CSAT scores. Present the data to prove your team's value.",
      },
    ],
    features: [
      "Multi-workspace support",
      "Custom branding per workspace",
      "Role-based access control",
      "Analytics per workspace",
      "Agent API per workspace",
      "Knowledge base per client",
      "Webhook integrations",
      "Internal notes",
      "Side conversations",
      "SLA policies",
    ],
    faqs: [
      {
        question: "How many workspaces can I create?",
        answer:
          "There's no limit on the number of workspaces. Each workspace is a self-contained environment with its own agents, conversations, settings, and analytics.",
      },
      {
        question: "Can clients see each other's data?",
        answer:
          "No. Workspaces are completely isolated. Team members only see conversations in the workspaces they've been invited to. There's no cross-workspace data leakage.",
      },
      {
        question: "Is there a per-workspace fee?",
        answer:
          "GudDesk charges per workspace plan, not per seat. Each workspace can be on the Free or Pro plan independently. This lets you offer free-tier support to smaller clients and Pro support to premium accounts.",
      },
    ],
  },
  {
    slug: "open-source",
    name: "Open Source Projects",
    tagline: "Community support for open-source maintainers",
    headline: "Support your community, not just your customers",
    description:
      "Open-source projects need a way to help users, triage bugs, and answer questions without a budget. GudDesk is free, open source, and self-hostable, making it ideal for maintainers who want structured support alongside GitHub Issues.",
    benefits: [
      {
        title: "Completely free and open source",
        description:
          "GudDesk itself is AGPL-3.0. Use it to support your community at zero cost. Self-host it on your own servers for full control.",
        icon: "code",
      },
      {
        title: "Embed in your docs site",
        description:
          "Add the chat widget to your documentation. Users can ask questions without leaving the page.",
        icon: "bookOpen",
      },
      {
        title: "Triage with rules",
        description:
          "Automation rules can tag a message as a bug or a feature request and route it to the right maintainer.",
        icon: "bot",
      },
      {
        title: "Build on top of GudDesk",
        description:
          "Use the REST API and webhook system to connect GudDesk to your CI/CD pipeline, GitHub Actions, or Discord bot. The platform is extensible by design.",
        icon: "webhook",
      },
    ],
    workflows: [
      {
        title: "User finds a bug in your library",
        description:
          "They click the chat widget on your docs site. An automation can tag it as a bug and open a conversation. You review it when you are ready.",
      },
      {
        title: "New contributor needs guidance",
        description:
          "Point contributors to setup articles in your knowledge base. If the contributor needs a person, a teammate replies in the same thread.",
      },
      {
        title: "Release day support spike",
        description:
          "Your own agent can reply as BOT if you connected one. You step in only for issues that need a person.",
      },
    ],
    features: [
      "Free forever",
      "Self-hostable (AGPL-3.0)",
      "Agent API (reply as BOT)",
      "Knowledge base",
      "Widget for docs sites",
      "REST API",
      "Webhooks",
      "Automation rules",
      "Tags and routing",
      "CSAT feedback",
    ],
    faqs: [
      {
        question: "Is GudDesk really free for open-source projects?",
        answer:
          "Yes. Cloud Free includes 2 members and 500 conversations/month. Self-host the AGPL-3.0 core with no per-seat fee, or upgrade hosted Pro ($29/mo) / Business (~$99/mo).",
      },
      {
        question: "Can I connect it to GitHub Issues?",
        answer:
          "Not natively yet, but you can use webhooks to sync conversations to GitHub Issues. When a conversation is tagged as a bug, a webhook can trigger a GitHub Action that creates an issue.",
      },
      {
        question: "How is this different from Discord for community support?",
        answer:
          "Discord is great for community chat, but messages get lost in channels. GudDesk gives you a structured inbox where every conversation is tracked, assigned and resolvable.",
      },
    ],
  },
];

export function getUseCaseBySlug(slug: string): UseCase | undefined {
  return useCases.find((uc) => uc.slug === slug);
}

export function getAllUseCaseSlugs(): string[] {
  return useCases.map((uc) => uc.slug);
}
