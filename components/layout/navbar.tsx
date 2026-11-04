"use client";

import { useContext } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useSession } from "next-auth/react";

import { docsConfig } from "@/config/docs";
import { marketingConfig } from "@/config/marketing";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DocsSearch } from "@/components/docs/search";
import { ModalContext } from "@/components/modals/providers";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface NavBarProps {
  scroll?: boolean;
  large?: boolean;
}

export function NavBar({ scroll = false }: NavBarProps) {
  const scrolled = useScroll(50);
  const { data: session, status } = useSession();
  const { setShowSignInModal } = useContext(ModalContext);

  const selectedLayout = useSelectedLayoutSegment();
  const documentation = selectedLayout === "docs";

  const configMap = {
    docs: docsConfig.mainNav,
  };

  const links =
    (selectedLayout && configMap[selectedLayout]) || marketingConfig.mainNav;

  return (
    <header
      className={`sticky top-0 z-40 flex w-full justify-center bg-background/60 backdrop-blur-xl transition-all ${
        scroll ? (scrolled ? "border-b" : "bg-transparent") : "border-b"
      }`}
    >
      <MaxWidthWrapper
        className="flex h-14 items-center justify-between py-4"
        large={documentation}
      >
        {/* Left: Logo only */}
        <Link href="/" className="flex items-center space-x-1.5">
          <Icons.logo className="size-8" />
          <span className="font-satoshi text-xl font-bold">
            {siteConfig.name}
          </span>
        </Link>

        {/* Right: Nav links + auth */}
        <div className="flex items-center gap-1">
          {/* Docs-specific right header */}
          {documentation ? (
            <div className="hidden flex-1 items-center space-x-4 sm:justify-end lg:flex">
              <div className="hidden lg:flex lg:grow-0">
                <DocsSearch />
              </div>
              <div className="flex lg:hidden">
                <Icons.search className="size-6 text-muted-foreground" />
              </div>
              <div className="flex space-x-4">
                <Link
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icons.gitHub className="size-7" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </div>
            </div>
          ) : null}

          {/* Nav links */}
          {links && links.length > 0 ? (
            <nav className="hidden items-center gap-1 md:flex">
              {links.map((item, index) => (
                <Link
                  key={index}
                  href={item.disabled ? "#" : item.href}
                  prefetch={true}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:text-foreground",
                    item.href.startsWith(`/${selectedLayout}`)
                      ? "text-foreground"
                      : "text-neutral-600 dark:text-neutral-300",
                    item.disabled && "cursor-not-allowed opacity-80",
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          ) : null}

          {/* Divider */}
          <div className="mx-2 hidden h-5 w-px bg-border md:block" />

          {/* Auth buttons */}
          {session ? (
            <Link
              href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}
              className="hidden md:block"
            >
              <Button
                className="gap-2 px-4"
                variant="default"
                size="sm"
                rounded="xl"
              >
                <span>Dashboard</span>
              </Button>
            </Link>
          ) : status === "unauthenticated" ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm" rounded="lg">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  className="gap-2 px-4"
                  variant="default"
                  size="sm"
                  rounded="xl"
                >
                  Get Started
                  <Icons.arrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <Skeleton className="hidden h-9 w-24 rounded-xl lg:flex" />
          )}
        </div>
      </MaxWidthWrapper>
    </header>
  );
}
