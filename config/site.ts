import { SidebarNavItem, SiteConfig } from "types";
import { env } from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "GudDesk",
  description:
    "Open-source customer messaging platform with live chat and a shared inbox.",
  url: site_url,
  ogImage: `${site_url}/_static/og.jpg`,
  links: {
    twitter: "https://twitter.com/guddesk",
    github: "https://github.com/gudlab/guddesk-core",
  },
  mailSupport: "support@guddesk.com",
};

export const footerLinks: SidebarNavItem[] = [
  {
    title: "Product",
    items: [
      { title: "Live Chat", href: "/features/live-chat" },
      { title: "AI Agents", href: "/features/ai-agents" },
      { title: "Shared Inbox", href: "/features/shared-inbox" },
      { title: "Knowledge Base", href: "/features/knowledge-base" },
      { title: "Integrations", href: "/integrations" },
      { title: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Use Cases",
    items: [
      { title: "SaaS Companies", href: "/use-cases/saas" },
      { title: "Ecommerce", href: "/use-cases/ecommerce" },
      { title: "Startups", href: "/use-cases/startups" },
      { title: "Agencies", href: "/use-cases/agencies" },
      { title: "Open Source", href: "/use-cases/open-source" },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "Blog", href: "/blog" },
      { title: "Documentation", href: "/docs" },
      { title: "Roadmap", href: "/roadmap" },
      { title: "GitHub", href: "https://github.com/gudlab/guddesk-core" },
    ],
  },
  {
    title: "Compare",
    items: [
      { title: "vs Intercom", href: "/alternatives/intercom" },
      { title: "vs Zendesk", href: "/alternatives/zendesk" },
      { title: "vs Freshdesk", href: "/alternatives/freshdesk" },
      { title: "Terms", href: "/terms" },
      { title: "Privacy", href: "/privacy" },
    ],
  },
];
