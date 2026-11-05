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
      { name: "Agent replies in the open widget", competitor: true, guddesk: "Live (checks every 4 seconds if the live connection fails)" },
      { name: "Shared inbox", competitor: true, guddesk: true },
      { name: "Email channel", competitor: true, guddesk: "Outbound now; inbound being set up" },
      { name: "Public help center", competitor: true, guddesk: true },
      { name: "Workflow automations", competitor: "Advanced plan and up", guddesk: "Rules can be saved but don't run yet" },
      { name: "Built-in autonomous AI agent", competitor: "Fin, $0.99 per outcome", guddesk: "No always-on agent. GudBot optional, default off" },
      { name: "Bring your own AI agent", competitor: "Not compared", guddesk: "Agent API, replies as BOT" },
      { name: "REST API and MCP server", competitor: "Not compared", guddesk: "Both check API key permission levels" },
      { name: "Slack notifications", competitor: "Not compared", guddesk: "Not sent yet" },
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
          "For live chat, a shared inbox and a public help center, yes. Email is outbound now; inbound being set up. Intercom's Fin answers on its own. GudBot suggests replies and stays off until you turn it on. If you need WhatsApp, SMS, phone or SSO, Intercom covers those and GudDesk doesn't.",
      },
      {
        question: "How do I move from Intercom to GudDesk?",
        answer:
          "Upload an Intercom JSON or zip export under Workspace → Settings → Import. Contacts, help articles, and conversations are copied over. The same Intercom ids are skipped if you upload the file again. Keep Intercom running until you swap the widget snippet.",
      },
      {
        question: "Is the free plan really free?",
        answer:
          "Yes. GudDesk Cloud Free covers 2 members and 500 conversations a month with no time limit and no credit card required. Self-hosting has no plan caps.",
      },
      {
        question: "What about Intercom's Fin AI?",
        answer:
          "Fin answers customers on its own and costs $0.99 per outcome (intercom.com/pricing, 20 Oct 2026). GudBot can suggest replies and summaries. It stays off until you turn it on. You can also connect your own agent through the API.",
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
      { name: "Workflow automations", competitor: true, guddesk: "Rules can be saved but don't run yet" },
      { name: "Self-hosting", competitor: false, guddesk: true },
      { name: "Open source", competitor: false, guddesk: "AGPL-3.0" },
      { name: "Free tier", competitor: "14-day trial", guddesk: "Free forever (2 members)" },
      { name: "Plugin/API ecosystem", competitor: true, guddesk: true },
      { name: "Slack integration", competitor: true, guddesk: "Notifications not sent yet" },
      { name: "Email integration", competitor: true, guddesk: "Outbound now; inbound being set up" },
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
          "Install your own agent: it gets a webhook and an API key and replies as BOT. Zendesk AI sits on top of a ticketing product. GudBot can suggest replies. It stays off until you turn it on.",
      },
    ],
    faqs: [
      {
        question: "Can GudDesk handle the same ticket volume as Zendesk?",
        answer:
          "GudDesk is built for small and mid-size teams. If you handle tens of thousands of tickets a day with complex routing across many departments, Zendesk's enterprise features may still fit you better.",
      },
      {
        question: "Does GudDesk have a ticketing system?",
        answer:
          "GudDesk works in conversations. Chat messages, plus any BOT replies, land in conversations in your shared inbox. You can assign and tag them, and close each one when it's resolved. Email is outbound now; inbound being set up.",
      },
      {
        question: "How do I migrate from Zendesk to GudDesk?",
        answer:
          "There is no Zendesk importer yet. Export your data from Zendesk, then create customers and help articles through the GudDesk REST API. You can run both tools side by side while you switch.",
      },
      {
        question: "Is GudDesk secure enough for our team?",
        answer:
          "GudDesk is open source, so your security team can review the code. guddesk.com sends HSTS on every page. If you need full control of your data, self-host it on your own servers.",
      },
    ],
  },
  {
    slug: "freshdesk",
    name: "Freshdesk",
    tagline: "The open-source Freshdesk alternative",
    description:
      "Freshdesk offers solid support tooling, but AI features and advanced automations are locked behind expensive plans. GudDesk gives you live chat and a shared inbox, plus an agent API for your own bot. Cloud Free covers 2 members.",
    pricing: "Growth is $19, Pro $55 and Enterprise $89 per agent a month billed annually (freshworks.com/freshdesk/pricing, 20 Oct 2026). The Free Program covers 2 agents for 6 months, through their sales team.",
    weaknesses: [
      "No permanent free plan. The Free Program covers 2 agents for 6 months and goes through sales",
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
      { name: "Workflow automations", competitor: "Growth plan+ ($19/agent/mo billed annually)", guddesk: "Rules can be saved but don't run yet" },
      { name: "Self-hosting", competitor: false, guddesk: true },
      { name: "Open source", competitor: false, guddesk: "AGPL-3.0" },
      { name: "Free plan", competitor: "Free Program: 2 agents for 6 months", guddesk: "Core features (2 members, 500 conversations a month, no time limit)" },
      { name: "Unified platform", competitor: "Multiple products", guddesk: "All-in-one" },
      { name: "Plugin/API ecosystem", competitor: true, guddesk: true },
      { name: "Slack integration", competitor: true, guddesk: "Notifications not sent yet" },
      { name: "Email integration", competitor: true, guddesk: "Outbound now; inbound being set up" },
    ],
    switchReasons: [
      {
        title: "Chat and email in one product",
        description:
          "Freshworks sells live chat as Freshchat, a separate product with its own price. GudDesk puts chat in one inbox on one plan. Email is outbound now; inbound being set up.",
      },
      {
        title: "Free with no time limit",
        description:
          "Freshdesk's Free Program ends after 6 months. GudDesk Cloud Free includes live chat, the shared inbox, knowledge base and the agent API for 2 members, with no time limit. Pro removes branding and lifts the member and conversation limits.",
      },
      {
        title: "Your own bot on every plan",
        description:
          "Freshdesk's Freddy AI Copilot is $29/agent/mo (as of 14 Oct 2026). GudDesk lets you connect your own agent on every plan. GudBot can suggest replies. It stays off until you turn it on.",
      },
      {
        title: "Code your developers can read",
        description:
          "GudDesk is written in TypeScript on Next.js. Your developers can extend it through the REST API and webhooks, or change the AGPL-3.0 code directly.",
      },
    ],
    faqs: [
      {
        question: "Is GudDesk's free tier better than Freshdesk's?",
        answer:
          "For small teams, yes. Freshdesk's Free Program covers 2 agents for 6 months, then you move to a paid plan. GudDesk Cloud Free covers 2 members and 500 conversations a month with no time limit, with live chat, inbox, knowledge base and the agent API.",
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
          "Yes. GudDesk is open source under AGPL-3.0. Clone gudlab/guddesk-core and run `docker compose up --build`, or install with pnpm and point it at your own PostgreSQL on Node.js 20.19 or later. The README lists each step. Freshdesk offers no self-hosting option.",
      },
    ],
  },
  {
    slug: "crisp",
    name: "Crisp",
    tagline: "The open-source Crisp alternative",
    description:
      "Crisp charges a flat price per workspace but caps the seats on each plan. GudDesk Pro is $29 a month for unlimited seats, and you can self-host the AGPL-3.0 code on your own servers.",
    pricing:
      "Free for 2 seats. Paid plans run from $45 a month per workspace (Mini, 4 seats) to $295 (Plus, 20 seats, $10 a month for each extra agent). VAT not included. Source: crisp.chat/en/pricing, checked 2 Nov 2026.",
    weaknesses: [
      "Seats are capped per plan, so a team of 5 needs Essentials at $95 a month",
      "The knowledge base and workflow builder start on Essentials",
      "AI runs on included credits, from $5 on Mini (about 90 automated conversations) up to $75 on Plus",
      "Cloud only. The pricing page lists no self-hosted option",
    ],
    features: [
      { name: "Live chat widget", competitor: true, guddesk: true },
      { name: "Shared inbox", competitor: true, guddesk: true },
      { name: "Shared email inbox", competitor: "Mini plan and up", guddesk: "Outbound on Free; inbound being set up" },
      { name: "Knowledge base", competitor: "Essentials plan and up", guddesk: "Included on Free" },
      { name: "Workflow automations", competitor: "Essentials plan and up", guddesk: "Rules can be saved but don't run yet" },
      { name: "WhatsApp and Instagram", competitor: "Essentials plan and up", guddesk: false },
      { name: "SMS and phone", competitor: true, guddesk: false },
      { name: "Mobile apps", competitor: true, guddesk: false },
      { name: "Typing indicators", competitor: true, guddesk: true },
      { name: "Built-in autonomous AI agent", competitor: "AI Agent, uses AI credits", guddesk: "No always-on agent. GudBot optional, default off" },
      { name: "AI writing help and summaries", competitor: true, guddesk: "Optional, default off" },
      { name: "Bring your own AI agent", competitor: "Not compared", guddesk: "Agent API, replies as BOT" },
      { name: "MCP server", competitor: true, guddesk: "Checks API key permission levels" },
      { name: "Remove branding", competitor: "Plus plan", guddesk: "Pro plan" },
      { name: "Extra workspaces", competitor: "Each workspace is billed separately", guddesk: "Unlimited on Pro" },
      { name: "Self-hosting", competitor: false, guddesk: true },
      { name: "Open source", competitor: false, guddesk: "AGPL-3.0" },
      { name: "Conversations", competitor: "Unlimited on every plan", guddesk: "500 a month on Free, unlimited on Pro" },
      { name: "Free plan", competitor: "2 seats, 100 customer profiles, no AI credits", guddesk: "2 members, 500 conversations a month" },
      { name: "Price", competitor: "$45 to $295 per workspace a month", guddesk: "Pro $29 a month flat, unlimited seats" },
    ],
    switchReasons: [
      {
        title: "Unlimited seats for $29",
        description:
          "Crisp caps seats on each plan, so a team of 5 needs Essentials at $95 a month and a team of 11 needs Plus at $295. GudDesk Pro is $29 a month for any team size.",
      },
      {
        title: "A help center on the free plan",
        description:
          "Crisp puts the knowledge base on Essentials at $95 a month. GudDesk Free includes a public help center, for 2 members and 500 conversations a month.",
      },
      {
        title: "Run it on your own servers",
        description:
          "Crisp is a hosted service with EU data hosting. GudDesk's AGPL-3.0 code runs on your own Postgres with no plan caps, so your conversations stay in your database.",
      },
      {
        title: "One plan for every workspace",
        description:
          "Crisp bills each workspace as its own subscription. On GudDesk Pro you can create as many workspaces as you need.",
      },
    ],
    faqs: [
      {
        question: "Is Crisp cheaper than GudDesk?",
        answer:
          "Crisp Free and GudDesk Free both cover 2 seats. Above that, Crisp starts at $45 a month for 4 seats (Mini, before VAT) and GudDesk Pro is $29 a month for unlimited seats. Crisp includes unlimited conversations on every plan, while GudDesk Free stops at 500 a month.",
      },
      {
        question: "What does Crisp have that GudDesk doesn't?",
        answer:
          "Crisp has an autonomous AI agent and mobile apps, and it connects channels such as WhatsApp and Instagram. GudDesk doesn't have those yet. If you need them today, Crisp covers them.",
      },
      {
        question: "How fast do replies show up in the GudDesk widget?",
        answer:
          "As they are sent. GudDesk Cloud uses Pusher, so agent replies and typing indicators reach the open widget live. If the live connection fails, the widget checks for new messages every 4 seconds.",
      },
      {
        question: "How do I move from Crisp to GudDesk?",
        answer:
          "There is no Crisp importer yet. Create customers and help articles through the GudDesk REST API, then swap the widget snippet on your site. You can run both tools side by side while you switch.",
      },
      {
        question: "Does GudDesk have built-in AI?",
        answer:
          "GudBot can suggest replies and summaries. It stays off until you turn it on. You can also connect your own agent through webhooks and the API, and its replies show up as BOT messages.",
      },
    ],
  },
  {
    slug: "chatwoot",
    name: "Chatwoot",
    tagline: "An open-source Chatwoot alternative with flat pricing",
    description:
      "Chatwoot is open source too, and its cloud plans bill per agent, from $19 a month. GudDesk Pro is $29 a month flat for your whole team, and you can self-host the AGPL-3.0 code on your own servers.",
    pricing:
      "Cloud: Hacker is free for up to 2 agents. Startups is $19 and Business is $39 per agent a month. Enterprise is $99 per agent a month. Source: chatwoot.com/pricing, checked 2 Nov 2026.",
    weaknesses: [
      "Cloud plans bill per agent: $19 a month on Startups and $39 on Business",
      "The free Hacker plan covers live chat only and keeps data for 30 days",
      "The help center starts on Startups, and automation rules start on Business",
      "Captain AI runs on monthly credits (300 on Startups, 500 on Business), with extra credits at $20 per 1,000",
    ],
    features: [
      { name: "Live chat widget", competitor: true, guddesk: true },
      { name: "Shared inbox", competitor: true, guddesk: true },
      { name: "Email channel", competitor: true, guddesk: "Outbound now; inbound being set up" },
      { name: "WhatsApp and Instagram", competitor: true, guddesk: false },
      { name: "Voice", competitor: "Business plan and up", guddesk: false },
      { name: "Public help center", competitor: "Startups plan and up", guddesk: "Included on Free" },
      { name: "Automation rules", competitor: "Business plan and up", guddesk: "Rules can be saved but don't run yet" },
      { name: "Built-in autonomous AI agent", competitor: "Captain AI, credit based", guddesk: "No always-on agent. GudBot optional, default off" },
      { name: "AI reply suggestions and summaries", competitor: "Captain AI, credit based", guddesk: "Optional, default off" },
      { name: "Bring your own AI agent", competitor: "Not compared", guddesk: "Agent API, replies as BOT" },
      { name: "REST API and MCP server", competitor: "Not compared", guddesk: "Both check API key permission levels" },
      { name: "SSO / SAML", competitor: "Enterprise plan, $99 per agent a month", guddesk: false },
      { name: "Mobile apps", competitor: true, guddesk: false },
      { name: "Self-hosting", competitor: "Community Edition is free", guddesk: "Free, no plan caps" },
      { name: "Licence", competitor: "MIT core, separate licence for enterprise/ code", guddesk: "AGPL-3.0" },
      { name: "Free cloud plan", competitor: "2 agents, 500 conversations a month, live chat only", guddesk: "2 members, 500 conversations a month" },
      { name: "Paid cloud price", competitor: "$19 to $99 per agent a month", guddesk: "Pro $29 a month flat, unlimited seats" },
    ],
    switchReasons: [
      {
        title: "One price for the whole team",
        description:
          "Chatwoot Cloud bills each agent, so 5 agents on Business cost $195 a month. GudDesk Pro is $29 a month for unlimited seats.",
      },
      {
        title: "More on the free plan",
        description:
          "Chatwoot Hacker and GudDesk Free both cover 2 seats and 500 conversations a month. GudDesk Free also includes the help center, which Chatwoot keeps for paid plans.",
      },
      {
        title: "Open source on both sides",
        description:
          "Chatwoot's core is MIT licensed and GudDesk is AGPL-3.0. GudDesk runs on Next.js and Postgres, so TypeScript teams can read and change it in a language they already use.",
      },
      {
        title: "Built for your own agents",
        description:
          "Connect your own bot through the agent API. It gets a webhook and an API key, and its replies show up as BOT messages in the widget and inbox. GudDesk charges nothing per resolution.",
      },
    ],
    faqs: [
      {
        question: "Chatwoot is open source too. Why switch?",
        answer:
          "Both projects publish their code. Chatwoot's core is MIT licensed, with a separate licence for code in its enterprise/ directory. GudDesk is AGPL-3.0. On the hosted side the main difference is price: Chatwoot Cloud bills per agent and GudDesk Pro is $29 a month flat.",
      },
      {
        question: "Can I self-host either one?",
        answer:
          "Yes. Chatwoot's Community Edition is free to self-host, and its paid self-hosted plans are $19 or $99 per agent a month. GudDesk self-hosting has no plan caps. The quickest path is Docker Compose in this repo (`docker compose up --build`). You can also run from source on Node.js 20.19 or later, pointed at your own PostgreSQL.",
      },
      {
        question: "What does Chatwoot have that GudDesk doesn't?",
        answer:
          "Captain AI, voice, mobile apps and channels such as WhatsApp and Instagram. Chatwoot is also more established, with more than 38,000 GitHub stars. If you need those today, Chatwoot covers them.",
      },
      {
        question: "How do I move from Chatwoot to GudDesk?",
        answer:
          "There is no Chatwoot importer yet. Chatwoot lets you export conversations and contacts through its API. Create customers and help articles in GudDesk through the REST API, and run both tools side by side while you switch.",
      },
      {
        question: "Does GudDesk have built-in AI?",
        answer:
          "GudBot can suggest replies and summaries. It stays off until you turn it on. You can also connect your own agent through webhooks and the API, and it can use any model you like.",
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
