import * as React from "react";
import Link from "next/link";



import { footerLinks, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/layout/mode-toggle";



import { NewsletterForm } from "../forms/newsletter-form";
import { Icons } from "../shared/icons";


export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("border-t", className)}>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-14 md:grid-cols-5 md:px-8">
        {footerLinks.map((section) => (
          <div key={section.title}>
            <span className="text-sm font-medium text-foreground">
              {section.title}
            </span>
            <ul className="mt-4 list-inside space-y-3">
              {section.items?.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-600 hover:text-foreground dark:text-neutral-300"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="col-span-full flex flex-col items-end md:col-span-1 md:items-start">
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t py-4">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 md:px-8">
          <span className="text-sm text-neutral-600 dark:text-neutral-300">
            Copyright &copy; 2026. All rights reserved.
          </span>
          <p className="text-left text-sm text-neutral-600 dark:text-neutral-300">
            Started by{" "}
            <Link
              href="https://twitter.com/timchosen"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Tim
            </Link>
            . Available at{" "}
            <Link
              href="https://guddesk.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              guddesk.com
            </Link> and as open-source at{" "}
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer" className="font-medium underline underline-offset-4"
            >
              GudDesk
            </Link> under AGPL-3.0 license.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              <Icons.gitHub className="size-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}