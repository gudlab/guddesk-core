import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export function MarketingFaq({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <MaxWidthWrapper className="max-w-3xl">
        <h2 className="text-center font-heading text-3xl text-balance md:text-4xl">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="max-w-prose text-pretty text-neutral-600 dark:text-neutral-300">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </MaxWidthWrapper>
    </section>
  );
}
