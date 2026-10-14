import { DocsConfig } from "types";

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Blog",
      href: "/blog",
    },
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/docs",
          icon: "page",
        },
        {
          title: "Quickstart",
          href: "/docs/quickstart",
          icon: "page",
        },
        {
          title: "Self-Hosting",
          href: "/docs/self-hosting",
          icon: "page",
        },
      ],
    },
    {
      title: "Chat Widget",
      items: [
        {
          title: "Installation",
          href: "/docs/widget/installation",
          icon: "page",
        },
        {
          title: "Customization",
          href: "/docs/widget/customization",
          icon: "page",
        },
      ],
    },
    {
      title: "Inbox",
      items: [
        {
          title: "Shared Inbox",
          href: "/docs/inbox/overview",
          icon: "page",
        },
        {
          title: "Assignments & Workflows",
          href: "/docs/inbox/assignments",
          icon: "page",
        },
      ],
    },
    {
      title: "Knowledge Base",
      items: [
        {
          title: "Overview",
          href: "/docs/knowledge-base/overview",
          icon: "page",
        },
      ],
    },
    {
      title: "AI Agents",
      items: [
        {
          title: "Overview",
          href: "/docs/agents/overview",
          icon: "page",
        },
        {
          title: "Built-in AI",
          href: "/docs/agents/built-in",
          icon: "page",
        },
        {
          title: "Custom Agents",
          href: "/docs/agents/custom-agents",
          icon: "page",
        },
      ],
    },
    {
      title: "API & Webhooks",
      items: [
        {
          title: "API Overview",
          href: "/docs/api/overview",
          icon: "page",
        },
        {
          title: "Webhooks",
          href: "/docs/api/webhooks",
          icon: "page",
        },
      ],
    },
    {
      title: "Integrations",
      items: [
        {
          title: "Slack",
          href: "/docs/integrations/slack",
          icon: "page",
        },
        {
          title: "Email",
          href: "/docs/integrations/email",
          icon: "page",
        },
      ],
    },
  ],
};
