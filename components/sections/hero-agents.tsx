import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

const capabilities = [
  {
    icon: Icons.inbox,
    title: "Shared inbox and live chat",
    description:
      "One inbox for widget conversations. Assign, tag, snooze, and leave internal notes. Bot replies land in the same thread as your team.",
  },
  {
    icon: Icons.bookOpen,
    title: "Help center on every plan",
    description:
      "Publish articles in collections. Public search, your branding, and article feedback ship on Free and Pro.",
  },
  {
    icon: Icons.code,
    title: "Open source and self-hostable",
    description:
      "AGPL-3.0 licensed. Run it on your own Postgres with no caps. Cloud Free covers 2 members and 500 conversations a month.",
  },
];

export default function HeroAgents() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center lg:max-w-4xl">
          <Link
            href={siteConfig.links.github}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm", rounded: "xl" }),
              "px-4",
            )}
            target="_blank"
          >
            <Icons.code className="mr-2 size-3.5" />
            Open source. AGPL-3.0.
          </Link>

          <h1 className="font-satoshi mt-6 text-4xl leading-[1.15] font-black tracking-tight text-balance sm:text-5xl md:text-6xl md:leading-[1.12]">
            Shared inbox, live chat, and a help center
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-neutral-600 lg:text-xl dark:text-neutral-300">
            GudDesk is an open-source Intercom alternative. Cloud Free is $0 for
            2 members and 500 conversations a month. Pro is $29 a month for the
            whole team. GudBot is optional and stays off until you turn it on.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              prefetch={true}
              className={cn(
                buttonVariants({ rounded: "xl", size: "lg" }),
                "gap-2 px-5",
              )}
            >
              <span>Create a free workspace</span>
              <Icons.arrowRight className="size-4" />
            </Link>
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  rounded: "xl",
                  size: "lg",
                }),
                "px-4",
              )}
            >
              <Icons.gitHub className="mr-2 size-4" />
              <span>
                <span className="hidden sm:inline">Star on </span>GitHub
              </span>
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-10 md:grid-cols-3 md:gap-12">
          {capabilities.map((cap) => (
            <div key={cap.title}>
              <div className="flex items-start gap-3">
                <cap.icon className="mt-0.5 size-5 shrink-0 text-emerald-800 dark:text-emerald-300" />
                <div>
                  <p className="font-heading text-lg">{cap.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                    {cap.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-lg">
          <div className="overflow-hidden rounded-2xl border">
            <div className="flex items-center gap-3 border-b bg-emerald-800 px-5 py-3.5">
              <div className="flex size-8 items-center justify-center rounded-full bg-white/15">
                <Icons.messageCircle className="size-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Acme support
                </div>
                <div className="text-sm text-emerald-100">Widget conversation</div>
              </div>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-br-md bg-emerald-800 px-4 py-2.5 text-sm text-white">
                  I can&apos;t reset my password. The reset mail never arrives.
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <Icons.messageCircle className="size-3.5 text-emerald-800 dark:text-emerald-300" />
                </div>
                <div className="max-w-[75%] rounded-2xl rounded-bl-md bg-neutral-100 px-4 py-2.5 text-sm dark:bg-neutral-800">
                  Here is the password-reset article. If the mail still does
                  not arrive, a teammate will check the account.
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-br-md bg-emerald-800 px-4 py-2.5 text-sm text-white">
                  Got it, thanks. That was fast.
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-300">
            Free plan is $0. Pro is $29 a month flat.
          </p>
        </div>
      </div>
    </section>
  );
}
