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
      "SaaS teams need fast replies and good self-service. GudDesk puts live chat and a shared inbox in one place, and your own agent can answer first through the API.",
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
          "Build and publish help articles in a public help center that customers can search before they write in.",
        icon: "bookOpen",
      },
      {
        title: "Track customer health",
        description:
          "Each customer has a profile with their conversation history and your custom fields.",
        icon: "users",
      },
      {
        title: "Connect to your stack",
        description:
          "Use webhooks and the REST API to connect GudDesk to your CRM, billing system, or product analytics tool.",
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
          "Tag the conversation as a bug and assign it to an engineer. The SLA timer keeps running.",
      },
      {
        title: "Renewal is approaching",
        description:
          "Open the customer's profile to see their custom fields, such as plan or renewal date, and their past conversations before you reply.",
      },
    ],
    features: [
      "Live chat widget",
      "Agent API (reply as BOT)",
      "Shared inbox",
      "Knowledge base",
      "SLA policies",
      "CSAT settings and dashboard",
      "Tags and assignment",
      "Webhooks",
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
          "Use the REST API or webhooks to sync customer data from Stripe, Paddle, or any billing system. Custom fields let you store plan info, MRR, and usage on the customer profile.",
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
          "Visitors browsing your store can ask about sizing or shipping without leaving the page. Your own agent can reply as BOT if you connected one.",
        icon: "messageCircle",
      },
      {
        title: "Handle order inquiries at scale",
        description:
          "Connect your order system via webhooks. Push order details into custom fields so agents can check them on the customer profile when someone asks about an order.",
        icon: "package",
      },
      {
        title: "Canned replies for returns",
        description:
          "Save canned responses for return and exchange questions. Tag those conversations and assign them to whoever handles returns.",
        icon: "refreshCw",
      },
      {
        title: "Customer satisfaction (partly built)",
        description:
          "CSAT settings and a Feedback dashboard are built. Visitors can't rate in the widget yet, so scores start once widget rating ships.",
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
          "Tag the conversation as a return, send the return policy as a canned response, and assign it to your returns specialist.",
      },
      {
        title: "VIP customer reaches out",
        description:
          "Put high-value buyers in a customer segment so your team can see who they are.",
      },
    ],
    features: [
      "Live chat widget",
      "Agent API (reply as BOT)",
      "Shared inbox",
      "Knowledge base",
      "SLA policies",
      "Customer segments",
      "CSAT settings and dashboard",
      "Canned responses",
      "Tags",
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
    headline: "Customer support at a flat price for startups",
    description:
      "Startups need support tools at a flat $29 a month. GudDesk Cloud Free covers 2 members. Connect your own agent through the API. Self-host if you need no caps.",
    benefits: [
      {
        title: "Cloud Free: 2 members",
        description:
          "No credit card, no trial period. Get live chat, the shared inbox, knowledge base and the agent API at zero cost while you're getting started.",
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
          "Your own agent can take first replies as BOT. Canned responses let you answer quickly when you do step in.",
      },
      {
        title: "Scaling to your first support hire",
        description:
          "Add a second member for free. Assigning each conversation shows who owns it, so you don't both reply.",
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
      "Webhooks",
      "Canned responses",
      "Customer profiles",
      "CSAT settings and dashboard",
      "Open source",
    ],
    faqs: [
      {
        question: "What's the catch with the free plan?",
        answer:
          "There is no catch. Cloud Free includes live chat, inbox, knowledge base and the agent API. Caps are 2 members and 500 conversations a month. Pro is a flat $29/mo with no per-seat pricing.",
      },
      {
        question: "Can I self-host GudDesk?",
        answer:
          "Yes. GudDesk is open source under AGPL-3.0. Clone the repo, run it on your own infrastructure, and you have a complete support platform with zero ongoing costs.",
      },
      {
        question: "Will I have to migrate later?",
        answer:
          "No. Free and Pro run on the same platform, so upgrading keeps your data where it is. If you self-host, you control the infrastructure entirely.",
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
          "Set the chat widget's color, display name, welcome message and position to match each client's brand. No GudDesk branding on the Pro plan.",
        icon: "palette",
      },
      {
        title: "Team permissions and roles",
        description:
          "Invite people to each workspace as an owner, admin, agent or viewer. Only owners and admins can change settings.",
        icon: "shieldCheck",
      },
      {
        title: "Report to clients with data",
        description:
          "Built-in analytics show conversation volume, response times and resolution times.",
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
          "Pull analytics per workspace: conversations handled, average response time and resolution time. Present the data to prove your team's value.",
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
      "Open-source projects need a way to help users and triage bugs without a budget. GudDesk is free and open source, which makes it a good fit for maintainers who want structured support alongside GitHub Issues.",
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
          "Tag a message as a bug or a feature request and assign it to the right maintainer.",
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
          "They click the chat widget on your docs site and open a conversation. You tag it as a bug and review it when you are ready.",
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
      "Canned responses",
      "Tags and assignment",
      "CSAT settings and dashboard",
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
          "Not natively yet, but you can use webhooks to sync conversations to GitHub Issues. A webhook can call a GitHub Action when a message arrives or a conversation closes, and that Action can create an issue.",
      },
      {
        question: "How is this different from Discord for community support?",
        answer:
          "Discord is great for community chat, but messages get lost in channels. GudDesk gives you a structured inbox where every conversation is tracked and assigned until someone resolves it.",
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
