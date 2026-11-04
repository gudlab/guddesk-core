import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const trustItems = [
  "Open source, AGPL-3.0",
  "Self-host on your Postgres",
  "Help center on every plan",
  "REST API and MCP",
  "GudBot optional, default off",
];

export default function TrustBar() {
  return (
    <section className="py-8 sm:py-12">
      <MaxWidthWrapper>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {trustItems.map((label) => (
            <li
              key={label}
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {label}
            </li>
          ))}
        </ul>
      </MaxWidthWrapper>
    </section>
  );
}
