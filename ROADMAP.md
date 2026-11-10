# GudDesk Roadmap

> The open-source customer support platform with Intercom-quality UX and Crisp-style workspace pricing. Support that resolves questions fast, with AI where it helps, and without the enterprise tax.

---

## Vision

Most support platforms charge per-agent, and lock AI behind expensive add-ons. GudDesk takes a different approach: workspace-based pricing and a two-line widget snippet. The goal is to be the platform teams actually enjoy using, both the support team and the customers reaching out.

---

## What's Built Today

- **Live chat widget**: embeddable and customizable, with page visibility controls (include/exclude URL patterns). Replies reach the open widget live, with a 4-second check if the live connection fails
- **Customer identity verification**: HMAC-SHA256 identity verification (same standard as Intercom/Zendesk), `GudDesk.identify()` API with `userHash` support
- **Shared inbox**: conversations from chat, assignment, status management, internal notes. Email outbound works; Cloud inbound receiving is still being set up
- **Knowledge base**: articles, collections, public help center
- **Automation rules**: rule builder with 5 triggers and 6 actions. Rules are saved but not run yet
- **Integrations**: email (Resend), webhooks, REST API. Slack webhook settings are saved, but notifications are not sent yet
- **REST API v1**: full CRUD for conversations, customers (including PATCH updates), articles, workspaces, agents; cursor-based pagination, rate limiting
- **API keys**: account-level keys with optional workspace scoping ("All Workspaces" or single workspace), permission levels (Read Only / Read & Write / Full Access)
- **Agent framework**: install/uninstall agents via API with auto-provisioned webhook endpoints and dedicated API keys
- **MCP server**: Model Context Protocol support for AI assistants (Claude Desktop, etc.) with 26 tools covering conversations, messages, customers, companies, segments, articles, workspace, and agents; HTTP + stdio transports
- **Webhooks**: event subscriptions (message created, conversation created/closed/assigned), HMAC-SHA256 signed payloads
- **Analytics**: daily snapshots, response time tracking, conversation volume
- **Billing**: Stripe integration, Free, Starter, Team and Business plans (existing $29 Pro customers keep their price)
- **Admin panel**: user management, workspace oversight, audit logs
- **gud-agent**: open-source AI agent that auto-crawls your site and answers customer questions

---

## Phase 1: Foundation Gaps

_Fill the gaps that every competitor already covers._

### Omnichannel Messaging
- [x] **Email outbound**: send replies by email from the inbox, custom SMTP, email threading
- [ ] **Cloud inbound email**: receive customer email into the inbox (still being set up)
- [ ] **WhatsApp Business**: send/receive via WhatsApp Cloud API
- [ ] **Facebook Messenger**: page inbox integration
- [ ] **Instagram DMs**: business account integration
- [ ] **SMS**: Twilio integration for text-based support
- [x] **Unified conversation view**: all channels in one thread per customer

### Ticketing & SLAs
- [x] **SLA policies**: define response/resolution time targets per priority
- [x] **SLA breach alerts**: email the assignee and add a note when an SLA is breached. While the inbox or API is in use, GudDesk checks that workspace at most every 5 minutes. The `/api/cron/sla-check` route also runs daily at 01:05 UTC on Vercel. Self-hosters should call it every 5 minutes.
- [x] **Business hours**: configure working hours, exclude holidays from SLA calculations
- [x] **Ticket fields**: custom fields (dropdowns, text, date) per workspace
- [x] **Ticket forms**: different intake forms for different request types

### Customer Data
- [x] **Customer identity verification**: HMAC-SHA256 verification via `GudDesk.identify()`, server-side secret generation, dashboard UI
- [x] **Customer API**: list, get (with recent conversations), create/upsert, and update (PATCH) customers via REST API and MCP
- [x] **Customer profiles UI**: unified view of all conversations, events, and metadata per customer in the dashboard
- [x] **Company profiles**: group customers by organization
- [x] **Custom attributes**: user-defined fields on customer/company records
- [x] **Customer timeline**: chronological activity feed (messages, page views, events)
- [x] **Customer segments**: filter and group customers by attributes

### CSAT & Feedback
- [ ] **CSAT surveys**: survey settings and the Feedback dashboard. Visitors can't rate in the widget yet
- [ ] **Widget CSAT rating**: let visitors rate a closed conversation in the widget
- [ ] **NPS surveys**: survey settings and score reporting. Sending NPS surveys to visitors is not built yet
- [ ] **Survey triggers**: a CSAT survey message is created on close or after a delay. The widget can't show the rating yet
- [x] **Feedback dashboard**: aggregate scores, trends, per-agent breakdown

---

## Phase 2: AI-Native Support

_Optional AI answers and agent assist, default off._

### GudBot (optional, default off)
- [x] **AI assist for agents**: reply suggestions and summaries for the inbox when GudBot is on
- [x] **KB-powered resolution**: when GudBot is on, answers from knowledge base articles with citations
- [x] **Conversation handoff**: when GudBot is on, escalate to a human when it cannot resolve
- [x] **Confidence scoring**: when GudBot is on, only answer when confidence is high
- [ ] **Multi-turn conversations**: maintain context across messages
- [ ] **Action execution**: AI can check order status, update records, trigger workflows
- [ ] **Resolution analytics**: track AI resolution rate, handoff rate, CSAT for AI vs human
- [ ] **Per-workspace training**: fine-tune responses based on past conversations and corrections
- [ ] **Multilingual support**: auto-detect language and respond in the customer's language

### AI Copilot for Agents
- [ ] **Smart compose**: real-time reply drafting as agents type
- [ ] **Tone adjustment**: rewrite messages to be more professional, friendly, or concise
- [ ] **Similar conversations**: surface past conversations with similar issues
- [ ] **Suggested macros**: recommend canned responses based on context
- [ ] **Auto-fill ticket fields**: extract priority, category, and custom fields from the conversation

### AI-Powered Self-Service
- [ ] **Widget AI answers**: answer questions in the widget before a conversation starts
- [ ] **Smart article suggestions**: proactively suggest relevant articles based on the page the visitor is on
- [ ] **Guided troubleshooting**: step-by-step resolution flows powered by AI
- [ ] **Search with AI**: natural language search across the help center

---

## Phase 3: Growth & Engagement

_Turn support from a cost center into a growth channel._

### Proactive Messaging
- [ ] **Targeted messages**: trigger in-app messages based on user behavior, page, or segment
- [ ] **Banners**: site-wide announcements (maintenance, new features, promotions)
- [ ] **Tooltips**: contextual help attached to UI elements
- [ ] **Email campaigns**: drip sequences for onboarding, re-engagement, or product education
- [ ] **Message scheduling**: queue messages for specific times

### Product Tours
- [ ] **Step-by-step tours**: guide users through features with highlight overlays
- [ ] **Tour triggers**: start tours on sign-up, feature adoption, or manually
- [ ] **Tour analytics**: completion rates, drop-off points
- [ ] **No-code tour builder**: visual editor for creating tours

### Customer Portal
- [ ] **Branded portal**: customers can view their open/closed conversations
- [ ] **Ticket submission**: submit and track requests outside of chat
- [ ] **Status page integration**: show service status in the portal
- [ ] **Community forum**: customer-to-customer Q&A with staff moderation

---

## Phase 4: Team & Operations

_Scale from a small team to a full support organization._

### Advanced Routing
- [ ] **Skill-based routing**: assign conversations based on agent expertise
- [ ] **Round-robin assignment**: distribute conversations evenly across available agents
- [ ] **Load balancing**: consider active conversation count when assigning
- [ ] **Queue management**: priority queues with configurable rules
- [ ] **Team inboxes**: separate inboxes per team (Sales, Support, Billing)

### Collaboration
- [x] **Collision detection**: show when another agent is viewing or replying to a conversation
- [x] **@mentions**: tag teammates in internal notes
- [x] **Shared drafts**: collaborate on a reply before sending
- [x] **Side conversations**: discuss a ticket with another team without the customer seeing

### Workforce Management
- [x] **Agent availability**: manual online/away/offline status
- [ ] **Availability routing**: route new conversations by agent status
- [ ] **Shift scheduling**: define agent schedules and auto-assign based on availability
- [x] **Performance dashboards**: per-agent metrics (response time, resolution time, volume). Per-agent CSAT needs widget rating first
- [x] **Workload monitoring**: live view of team capacity

### Advanced Reporting
- [ ] **Custom dashboards**: drag-and-drop dashboard builder
- [ ] **Report scheduling**: email reports daily/weekly/monthly
- [ ] **Export**: CSV/PDF export of any report
- [ ] **Funnel analysis**: track customer journey from first contact to resolution
- [ ] **Tag-based reporting**: volume and trends by conversation tag

---

## Phase 5: Platform & Ecosystem

_Become the platform others build on._

### Developer Platform
- [x] **REST API v1**: full CRUD for conversations, customers, articles, workspaces, agents; documented with examples
- [x] **MCP server**: Model Context Protocol with 26 tools, HTTP + stdio transports, Claude Desktop integration
- [x] **Agent framework**: install/uninstall agents via API with auto-provisioned webhooks and API keys
- [x] **Webhooks v2**: retry logic, delivery logs, webhook debugging UI
- [ ] **npm package / platform SDKs**: `@guddesk/widget` npm package, WordPress plugin, Shopify app
- [ ] **OAuth apps**: third-party apps can request scoped access to workspaces
- [ ] **App marketplace**: directory of community-built integrations
- [ ] **Custom actions**: define HTTP actions that agents can trigger from the inbox

### Native Integrations
- [ ] **Salesforce**: sync contacts, companies, and conversation history
- [ ] **HubSpot**: CRM sync, deal association
- [ ] **Jira**: create issues from conversations, track status
- [ ] **GitHub**: link conversations to issues, PRs
- [ ] **Shopify**: view order history, process refunds from the inbox
- [ ] **Zapier / Make**: no-code automation bridge

### Infrastructure
- [ ] **Multi-region**: data residency options (US, EU, APAC)
- [ ] **SSO / SAML**: enterprise single sign-on
- [ ] **SCIM provisioning**: auto-manage team members from IdP
- [ ] **Audit log API**: export audit events for compliance
- [ ] **IP allowlisting**: restrict API and dashboard access by IP
- [ ] **Role-based permissions**: granular custom roles beyond OWNER/ADMIN/AGENT/VIEWER

---

## Phase 6: Enterprise

_Win the deals that require compliance, scale, and white-glove support._

### Security & Compliance
- [ ] **SOC 2 Type II**: audit and certification
- [ ] **GDPR controls**: data deletion requests, consent management, DPA
- [ ] **HIPAA compliance**: BAA, encrypted PHI handling
- [ ] **Data retention policies**: auto-delete conversations after configurable periods
- [ ] **PII redaction**: auto-detect and mask sensitive data in conversations

### Scale
- [ ] **Multi-brand**: manage multiple brands/products from one account
- [ ] **Sandbox environments**: test configuration changes before deploying
- [ ] **Bulk operations**: mass-update, mass-close, mass-assign via API and UI
- [ ] **Rate limiting tiers**: higher API limits for enterprise plans
- [ ] **Dedicated infrastructure**: single-tenant deployment option

### Voice
- [ ] **Click-to-call**: initiate voice calls from the inbox
- [ ] **Call recording**: record and attach to conversation
- [ ] **IVR**: interactive voice response with routing
- [ ] **Voicemail**: voicemail-to-ticket conversion
- [ ] **AI call summarization**: auto-transcribe and summarize calls

---

## Pricing Philosophy

| | Free | Starter | Team | Business |
|---|---|---|---|---|
| Price | $0 | $39/mo | $79/mo | $119/mo |
| Members | 3 | 5 | 10 | 25 |
| Conversations | Unlimited | Unlimited | Unlimited | Unlimited |
| GudBot | 50 answers/mo, default off | 500 | 1,000 | 2,500 |
| Channels | Chat; email outbound | Chat; email outbound | Chat; email outbound | Chat; email outbound |
| Support | Community | Email | Email | Email |

**Key principle:** One flat price per workspace, with no per-agent fees. GudBot is optional and off by default. No surprise bills. Annual billing is $384 / $780 / $1,188.

Existing $29 Pro customers keep that price.
A one-off $10 top-up adds 500 GudBot answers, which never expire and are used after the monthly allowance.
Teams over 25 members can email support@guddesk.com.

---

## Non-Goals

Things we deliberately won't build:

- **Sales CRM**: stay focused on support. Integrate with existing CRMs instead.
- **Marketing automation**: proactive messaging yes, but not a full marketing suite.
- **Project management**: conversations can link to Jira/Linear/GitHub, but we're not building a PM tool.
- **Social media management**: we handle support messages from social channels, not publishing/scheduling.
