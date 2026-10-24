export interface Alternative {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  pricing: string;
  weaknesses: string[];
  features: {
    name: string;
    competitor: string | boolean;
    guddesk: string | boolean;
  }[];
  switchReasons: {
    title: string;
    description: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const alternatives: Alternative[] = [
  {
    slug: "intercom",
    name: "Intercom",
    tagline: "The open-source Intercom alternative",
    description:
      "Intercom bills every seat and adds $0.99 for each Fin outcome. GudDesk Pro is $29 a month flat for your whole team, and you can self-host the AGPL-3.0 code on your own servers.",
    pricing:
      "From $29 per seat a month (Essential) up to $132 per seat a month (Expert), billed annually, plus $0.99 per Fin outcome. Source: intercom.com/pricing, checked 20 Oct 2026.",
    weaknesses: [
      "Every seat is billed, from $29 a month on Essential with annual billing",
      "Fin costs $0.99 per outcome, and an outcome is counted when a customer doesn't ask for more help after Fin replies",
      "Copilot ($29 per agent a month billed annually, $35 billed monthly) and Proactive Support Plus ($99 a month) are paid add-ons",
      "Cloud only. The pricing page lists no self-hosted option",
    ],
    features: [
      { name: "Live chat widget", competitor: true, guddesk: true },
      { name: "Agent replies in the open widget", competitor: true, guddesk: "Within seconds (checks every 4 seconds while open)" },
      { name: "Shared inbox", competitor: true, guddesk: true },
      { name: "Email channel", competitor: true, guddesk: true },
      { name: "Public help center", competitor: true, guddesk: true },
      { name: "Workflow automations", competitor: "Advanced plan and up", guddesk: true },
      { name: "Built-in autonomous AI agent", competitor: "Fin, $0.99 per outcome", guddesk: "Not yet. On the roadmap" },
      { name: "Bring your own AI agent", competitor: "Not compared", guddesk: "Agent API, replies as BOT" },
      { name: "REST API and MCP server", competitor: "Not compared", guddesk: "Both check API key permission levels" },
      { name: "Slack notifications", competitor: "Not compared", guddesk: true },
      { name: "WhatsApp, SMS and phone", competitor: "Pay as you go", guddesk: false },
      { name: "SSO", competitor: "Expert plan", guddesk: false },
      { name: "Self-hosting", competitor: false, guddesk: true },
      { name: "Open source", competitor: false, guddesk: "AGPL-3.0" },
      { name: "Free plan", competitor: "14-day free trial", guddesk: "2 members, 500 conversations a month" },
      { name: "Price", competitor: "$29 to $132 per seat a month, billed annually", guddesk: "Pro $29 a month flat, unlimited seats" },
    ],
    switchReasons: [
      {
        title: "One price for the whole team",
        description:
          "Intercom bills each seat, from $29 to $132 a month with annual billing. GudDesk Pro is $29 a month for unlimited seats. The Free plan covers 2 members and 500 conversations a month.",
      },
      {
        title: "No per-resolution fee",
        description:
          "Fin costs $0.99 per outcome. GudDesk charges nothing per resolution. Connect your own bot through the agent API and its replies show up as BOT messages in the widget and inbox.",
      },
      {
        title: "Run it on your own servers",
        description:
          "The AGPL-3.0 code runs on your own Postgres with no plan caps. Your customer conversations stay in your database.",
      },
      {
        title: "An API your developers can trust",
        description:
          "GudDesk has a REST API and an MCP server. Both check the permission level on each API key, so a Read Only key can read conversations but can't send messages.",
      },
    ],
    faqs: [
      {
        question: "Can GudDesk replace Intercom?",
        answer:
          "For live chat, a shared inbox, email and a public help center, yes. Intercom has an autonomous AI agent (Fin) today and GudDesk doesn't yet. If you need WhatsApp, SMS, phone or SSO, Intercom covers those and GudDesk doesn't.",
      },
      {
        question: "How do I move from Intercom to GudDesk?",
        answer:
          "There is no Intercom importer yet. Export your data from Intercom, then create customers and help articles through the GudDesk REST API. You can run both tools side by side while you switch.",
      },
      {
        question: "Is the free plan really free?",
        answer:
          "Yes. GudDesk Cloud Free covers 2 members and 500 conversations a month with no time limit and no credit card required. Self-hosting has no plan caps.",
      },
      {
        question: "What about Intercom's Fin AI?",
        answer:
          "Fin answers customers on its own and costs $0.99 per outcome (intercom.com/pricing, 20 Oct 2026). GudDesk doesn't ship a built-in AI agent yet. One is on the roadmap. Today you connect your own agent through webhooks and the API.",
      },
      {
        question: "Is GudDesk secure?",
        answer:
          "guddesk.com sends HSTS on every page and blocks framing of the dashboard and marketing pages. API keys carry a permission level that the REST API and the MCP server both enforce. The code is open, so your team can review it.",
      },
    ],
  },
  {
    slug: "zendesk",
    name: "Zendesk",
    tagline: "The open-source Zendesk alternative",
    description:
      "Zendesk is the enterprise standard for customer support, but its complexity and pricing make it overkill for most teams. GudDesk gives you live chat and a shared inbox without the enterprise price tag, and your own agent can plug in through the API.",
    pricing: "Zendesk Suite costs $55 to $115 per agent a month billed annually ($69 to $149 billed monthly). Enterprise pricing is by quote (zendesk.com/pricing, 20 Oct 2026).",
    weaknesses: [
      "Expensive per-agent pricing even for basic features",
      "AI features locked behind premium plans",
    ],
    features: [
      { name: "Live chat widget", competitor: true, guddesk: true },
      { name: "Shared inbox / ticketing", competitor: true, guddesk: true },
      { name: "AI agents", competitor: "Suite Professional ($115 per agent a month billed annually, $149 monthly)", guddesk: "Bring your own via API" },
      { name: "Knowledge base", competitor: true, guddesk: true },
      { name: "Workflow automations", competitor: true, guddesk: true },
      { name: "Self-hosting", competitor: false, guddesk: true },
      { name: "Open source", competitor: false, guddesk: "AGPL-3.0" },
      { name: "Free tier", competitor: "14-day trial", guddesk: "Free forever (2 members)" },
      { name: "Plugin/API ecosystem", competitor: true, guddesk: true },
      { name: "Slack integration", competitor: true, guddesk: true },
      { name: "Email integration", competitor: true, guddesk: true },
    ],
    switchReasons: [
      {
        title: "Simplicity over complexity",
        description:
          "Zendesk has hundreds of features most teams never touch. GudDesk focuses on live chat, inbox, knowledge base and an agent API, without a steep learning curve.",
      },
      {
        title: "Start on the free plan",
        description:
          "GudDesk Cloud Free covers 2 members and 500 conversations a month. Add the widget to your site with a two-line snippet.",
      },
      {
        title: "No enterprise tax",
        description:
          "Zendesk Suite costs $55 to $115 per agent a month billed annually ($69 to $149 billed monthly), and Enterprise pricing is by quote (zendesk.com/pricing, 20 Oct 2026). GudDesk Cloud Free covers small teams, and Pro is a flat $29 a month for any number of seats.",
      },
      {
        title: "Bring your own agent",
        description:
          "Install your own agent: it gets a webhook and an API key and replies as BOT. Zendesk AI sits on top of a ticketing product. A built-in GudDesk AI agent is on the roadmap.",
      },
    ],
    faqs: [
      {
        question: "Can GudDesk handle the same ticket volume as Zendesk?",
        answer:
          "GudDesk is designed for small to mid-size teams. If you're processing tens of thousands of tickets daily with complex routing rules across dozens of departments, Zendesk's enterprise features may still be a better fit. For teams with up to a few thousand conversations per month, GudDesk handles volume with ease.",
      },
      {
        question: "Does GudDesk have a ticketing system?",
        answer:
          "GudDesk uses a conversation-based model rather than traditional tickets. Every customer interaction (chat, email, bot) is a conversation in your shared inbox. You can assign, tag, prioritize, and track resolution. It's ticketing without the ticket jargon.",
      },
      {
        question: "How do I migrate from Zendesk to GudDesk?",
        answer:
          "There is no Zendesk importer yet. Export your data from Zendesk, then create customers and help articles through the GudDesk REST API. You can run both tools side by side while you switch.",
      },
      {
        question: "Is GudDesk secure enough for our team?",
        answer:
          "GudDesk is open source, so your security team can audit every line of code. Self-host it on your own infrastructure for complete data control. We use encryption in transit and at rest, and follow secure development practices.",
      },
    ],
  },
  {
    slug: "freshdesk",
    name: "Freshdesk",
    tagline: "The open-source Freshdesk alternative",
    description:
      "Freshdesk offers solid support tooling, but AI features and advanced automations are locked behind expensive plans. GudDesk gives you live chat and a shared inbox, plus an agent API for your own bot. Cloud Free covers 2 members.",
    pricing: "Growth is $19, Pro $55 and Enterprise $89 per agent a month billed annually (freshworks.com/freshdesk/pricing, 20 Oct 2026). The Free Program covers 2 agents for 6 months.",
    weaknesses: [
      "No permanent free plan. The Free Program covers 2 agents for 6 months",
      "Freddy AI Copilot is $29/agent/mo; extra agent sessions are $49 per 100 (as of 14 Oct 2026)",
      "Chat widget (Freshchat) is a separate product with separate pricing",
      "Per-agent pricing across multiple products adds up",
      "Dated UI compared to modern alternatives",
    ],
    features: [
      { name: "Live chat widget", competitor: "Separate product (Freshchat)", guddesk: "Included" },
      { name: "Shared inbox", competitor: true, guddesk: true },
      { name: "AI agents", competitor: "Freddy AI Agent (Growth+; extra sessions $49/100, as of 14 Oct 2026)", guddesk: "Bring your own via API" },
      { name: "Knowledge base", competitor: true, guddesk: true },
      { name: "Workflow automations", competitor: "Growth plan+ ($19/agent/mo billed annually)", guddesk: "Included free" },
      { name: "Self-hosting", competitor: false, guddesk: true },
      { name: "Open source", competitor: false, guddesk: "AGPL-3.0" },
      { name: "Free plan", competitor: "Free Program: 2 agents for 6 months", guddesk: "Core features (2 members, 500 conversations a month, no time limit)" },
      { name: "Unified platform", competitor: "Multiple products", guddesk: "All-in-one" },
      { name: "Plugin/API ecosystem", competitor: true, guddesk: true },
      { name: "Slack integration", competitor: true, guddesk: true },
      { name: "Email integration", competitor: true, guddesk: true },
    ],
    switchReasons: [
      {
        title: "One platform, not three",
        description:
          "Freshworks splits support across Freshdesk, Freshchat, and Freshcaller. GudDesk unifies live chat, email, and bot conversations in a single platform with a single price.",
      },
      {
        title: "Free with no time limit",
        description:
          "Freshdesk's Free Program ends after 6 months. GudDesk Cloud Free includes live chat, automations, knowledge base and the agent API for 2 members, with no time limit. GudDesk branding stays on, and Slack and advanced analytics are on Pro.",
      },
      {
        title: "Your own bot on every plan",
        description:
          "Freshdesk's Freddy AI Copilot is $29/agent/mo (as of 14 Oct 2026). GudDesk lets you connect your own agent on every plan. AI reply suggestions for your team are planned.",
      },
      {
        title: "Modern developer experience",
        description:
          "GudDesk is built with Next.js, TypeScript, and a Plugin API. If your team is technical, you'll appreciate the modern stack and the ability to extend the platform with custom code.",
      },
    ],
    faqs: [
      {
        question: "Is GudDesk's free tier better than Freshdesk's?",
        answer:
          "For small teams, yes. Freshdesk's Free Program covers 2 agents for 6 months, then you move to a paid plan. GudDesk Cloud Free covers 2 members and 500 conversations a month with no time limit, with live chat, inbox, knowledge base, automations and the agent API.",
      },
      {
        question: "Do I need Freshchat too, or does GudDesk cover chat?",
        answer:
          "GudDesk includes live chat as a core feature. Unlike Freshworks, where chat is a separate product (Freshchat) with separate pricing, GudDesk bundles everything in one platform.",
      },
      {
        question: "How does GudDesk compare for larger teams?",
        answer:
          "GudDesk is ideal for small to mid-size teams. For enterprise teams with hundreds of agents and complex ITSM requirements, Freshdesk's enterprise features may be more appropriate. However, GudDesk's self-hosting option and open-source nature make it appealing for organizations that prioritize data control.",
      },
      {
        question: "Can I self-host GudDesk instead of using Freshdesk's cloud?",
        answer:
          "Yes. GudDesk is open source under AGPL-3.0. Clone the gudlab/guddesk-core repo, install it with pnpm, point it at your own PostgreSQL database and run it on Node.js 20.19 or later. The README lists each step. Freshdesk offers no self-hosting option.",
      },
    ],
  },
];

export function getAlternativeBySlug(slug: string): Alternative | undefined {
  return alternatives.find((alt) => alt.slug === slug);
}

export function getAllAlternativeSlugs(): string[] {
  return alternatives.map((alt) => alt.slug);
}
