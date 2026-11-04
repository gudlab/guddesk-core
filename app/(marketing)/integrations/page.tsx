import { Metadata } from "next";

import IntegrationsCatalog from "@/components/sections/integrations-catalog";
import { withCanonical } from "@/lib/canonical";

export const metadata: Metadata = withCanonical({
  title: "Integrations | GudDesk",
  description:
    "Connect your own AI agent, email and webhooks to GudDesk through the REST API and MCP server.",
}, "/integrations");

export default function IntegrationsPage() {
  return <IntegrationsCatalog />;
}
