import { UserRole } from "@prisma/client";

import { SidebarNavItem } from "types";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "MENU",
    items: [
      { href: "/dashboard", icon: "dashboard", title: "Dashboard" },
      { href: "/dashboard/charts", icon: "analytics", title: "Analytics" },
    ],
  },
  {
    title: "ADMIN",
    items: [
      {
        href: "/admin",
        icon: "laptop",
        title: "Overview",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/users",
        icon: "users",
        title: "Users",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/workspaces",
        icon: "building",
        title: "Workspaces",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/integrations",
        icon: "integrations",
        title: "Integrations",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/analytics",
        icon: "analytics",
        title: "Analytics",
        authorizeOnly: UserRole.ADMIN,
      },
    ],
  },
  {
    title: "OPTIONS",
    items: [
      { href: "/dashboard/billing", icon: "billing", title: "Billing" },
      { href: "/dashboard/settings", icon: "settings", title: "Settings" },
      { href: "/dashboard/settings/api-keys", icon: "key", title: "API Keys" },
      { href: "/", icon: "home", title: "Homepage" },
      { href: "/docs", icon: "bookOpen", title: "Documentation" },
    ],
  },
];

// Workspace-scoped sidebar links (used in /workspace/[slug]/ layout)
// Href uses [slug] as placeholder — replaced at render time
export const workspaceSidebarLinks: SidebarNavItem[] = [
  {
    title: "CONVERSATIONS",
    items: [
      {
        href: "/workspace/[slug]/inbox",
        icon: "inbox",
        title: "Inbox",
      },
      {
        href: "/workspace/[slug]/customers",
        icon: "contact",
        title: "Customers",
      },
      {
        href: "/workspace/[slug]/companies",
        icon: "building",
        title: "Companies",
      },
    ],
  },
  {
    title: "CONTENT",
    items: [
      {
        href: "/workspace/[slug]/articles",
        icon: "bookOpen",
        title: "Knowledge Base",
      },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      {
        href: "/workspace/[slug]/analytics",
        icon: "analytics",
        title: "Analytics",
      },
      {
        href: "/workspace/[slug]/performance",
        icon: "activity",
        title: "Performance",
      },
      {
        href: "/workspace/[slug]/workload",
        icon: "eye",
        title: "Workload",
      },
      {
        href: "/workspace/[slug]/feedback",
        icon: "star",
        title: "Feedback",
      },
      {
        href: "/workspace/[slug]/automations",
        icon: "automations",
        title: "Automations",
        authorizeOnly: "ADMIN",
      },
    ],
  },
  {
    title: "WORKSPACE",
    items: [
      {
        href: "/workspace/[slug]/settings",
        icon: "settings",
        title: "Workspace Settings",
        authorizeOnly: "OWNER",
      },
      {
        href: "/workspace/[slug]/settings/members",
        icon: "users",
        title: "Members",
        authorizeOnly: "ADMIN",
      },
      {
        href: "/workspace/[slug]/settings/widget",
        icon: "code",
        title: "Chat Widget",
        authorizeOnly: "ADMIN",
      },
      {
        href: "/workspace/[slug]/settings/help-center",
        icon: "bookOpen",
        title: "Help Center",
        authorizeOnly: "ADMIN",
      },
      {
        href: "/workspace/[slug]/settings/ai-agents",
        icon: "bot",
        title: "AI",
        authorizeOnly: "ADMIN",
      },
      {
        href: "/workspace/[slug]/settings/integrations",
        icon: "integrations",
        title: "Integrations",
        authorizeOnly: "ADMIN",
      },
      {
        href: "/workspace/[slug]/settings/webhooks",
        icon: "webhook",
        title: "Webhooks",
        authorizeOnly: "ADMIN",
      },
      {
        href: "/workspace/[slug]/settings/custom-fields",
        icon: "database",
        title: "Custom Fields",
        authorizeOnly: "ADMIN",
      },
      {
        href: "/workspace/[slug]/settings/sla",
        icon: "shieldCheck",
        title: "SLA Policies",
        authorizeOnly: "ADMIN",
      },
      {
        href: "/workspace/[slug]/settings/ticket-forms",
        icon: "clipboardList",
        title: "Ticket Forms",
        authorizeOnly: "ADMIN",
      },
      {
        href: "/workspace/[slug]/settings/surveys",
        icon: "star",
        title: "Surveys",
        authorizeOnly: "ADMIN",
      },
      {
        href: "/workspace/[slug]/settings/email-channel",
        icon: "mail",
        title: "Email Channel",
        authorizeOnly: "ADMIN",
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      { href: "/dashboard/settings", icon: "user", title: "My Account" },
      { href: "/", icon: "home", title: "Homepage" },
    ],
  },
];
