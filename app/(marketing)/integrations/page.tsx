import { Metadata } from "next";

import IntegrationsCatalog from "@/components/sections/integrations-catalog";

export const metadata: Metadata = {
  title: "Integrations | GudDesk",
  description:
    "Connect your own AI agent, Slack, email and webhooks to GudDesk through the REST API and MCP server.",
};

export default function IntegrationsPage() {
  return <IntegrationsCatalog />;
}
