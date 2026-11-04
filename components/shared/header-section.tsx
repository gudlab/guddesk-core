interface HeaderSectionProps {
  label?: string;
  title: string;
  subtitle?: string;
}

export function HeaderSection({ title, subtitle }: HeaderSectionProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="font-heading text-3xl text-balance md:text-4xl lg:text-[40px]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-5 max-w-2xl text-pretty text-lg text-neutral-600 dark:text-neutral-300">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
