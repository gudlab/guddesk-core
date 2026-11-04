import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const faqs = [
  {
    question: "Is GudDesk really free?",
    answer:
      "The code is open source under AGPL-3.0 and free to self-host with no caps. GudDesk Cloud has a Free plan for 2 members and 500 conversations a month. Pro is $29 a month flat for any number of seats.",
  },
  {
    question: "What are AI agent plugins?",
    answer:
      "An agent is a bot you connect to GudDesk. Installing one gives it a webhook and an API key. It hears about new messages and replies as BOT, and those replies show in the widget and inbox. GudBot is optional and off by default.",
  },
  {
    question: "Can I build my own agent?",
    answer:
      "Yes. Webhooks fire on new conversations, new messages, assignments and closed conversations. Your agent can answer through the REST API or the MCP server, in any language you like. Its replies are stored as BOT messages.",
  },
  {
    question: "How does GudDesk compare to Intercom?",
    answer:
      "Intercom charges per seat, from $29 a month on Essential billed annually, plus $0.99 for each Fin AI outcome. GudDesk Pro is $29 a month flat for the whole team, with no per-resolution fee. You can also self-host GudDesk, which Intercom doesn't offer. GudBot is optional and off by default.",
  },
  {
    question: "Can I self-host GudDesk?",
    answer:
      "Yes. Clone the repo, point it at your own Postgres and run it on any Node host, or use GudDesk Cloud. When you self-host, your data stays on your servers.",
  },
  {
    question: "Does GudDesk have built-in AI?",
    answer:
      "GudBot is optional and off by default. When you turn it on, it can suggest replies and summaries. You can also connect your own agent, which replies as BOT through the API.",
  },
  {
    question: "How do I install the chat widget?",
    answer:
      "Two lines: set window.GudDeskSettings.appId to your gd_pub_ key, then load https://cdn.guddesk.com/widget.js. Never put server API keys in the page. Self-host by pointing the script at your own origin.",
  },
  {
    question: "Can I migrate from Intercom?",
    answer:
      "Owners and admins can upload an Intercom JSON or zip export under Workspace → Settings → Import. Contacts, help articles, and conversations are copied over. Uploading the same file again skips rows that already exist. Keep Intercom running until you swap the widget snippet.",
  },
];

export default function FAQSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <MaxWidthWrapper className="max-w-3xl">
        <HeaderSection title="Frequently asked questions" />

        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-neutral-600 dark:text-neutral-300">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </MaxWidthWrapper>
    </section>
  );
}
