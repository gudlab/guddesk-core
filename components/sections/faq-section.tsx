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
      "An agent is a bot you connect to GudDesk. Installing one gives it a webhook and an API key. It hears about new messages and replies as BOT, and those replies show in the widget and inbox. A built-in GudDesk AI agent is on the roadmap.",
  },
  {
    question: "Can I build my own agent?",
    answer:
      "Yes. Webhooks fire on new conversations, new messages, assignments and closed conversations. Your agent can answer through the REST API or the MCP server, in any language you like. Its replies are stored as BOT messages.",
  },
  {
    question: "How does GudDesk compare to Intercom?",
    answer:
      "Intercom charges per seat, from $29 a month on Essential billed annually, plus $0.99 for each Fin AI outcome. GudDesk Pro is $29 a month flat for the whole team, with no per-resolution fee. You can also self-host GudDesk, which Intercom doesn't offer. Intercom has a built-in autonomous AI agent today; GudDesk doesn't yet.",
  },
  {
    question: "Can I self-host GudDesk?",
    answer:
      "Yes. Clone the repo, point it at your own Postgres and run it on any Node host, or use GudDesk Cloud. When you self-host, your data stays on your servers.",
  },
  {
    question: "Does GudDesk have built-in AI?",
    answer:
      "Not yet. AI reply suggestions and summaries are planned and will ship with GudBot v1. Today you can connect your own AI agent, which replies as BOT through the API.",
  },
  {
    question: "How do I install the chat widget?",
    answer:
      "Add two lines of JavaScript to your site. The widget loads asynchronously, is fully customizable — colors, position, welcome message — and works on any website or web app. Agent and bot messages appear natively in the widget.",
  },
  {
    question: "Can I migrate from Intercom?",
    answer:
      "We are building migration tools to import your conversations and articles. In the meantime, you can run both tools side by side during your transition.",
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
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </MaxWidthWrapper>
    </section>
  );
}
