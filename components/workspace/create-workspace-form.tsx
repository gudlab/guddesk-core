"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { createWorkspace } from "@/actions/create-workspace";
import { createWorkspaceSchema } from "@/lib/validations/workspace";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/shared/icons";

type FormValues = z.infer<typeof createWorkspaceSchema>;

interface CreateWorkspaceFormProps {
  canCreate?: boolean;
}

export function CreateWorkspaceForm({ canCreate = true }: CreateWorkspaceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  function onNameChange(name: string) {
    form.setValue("name", name);
    // Auto-generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30);
    form.setValue("slug", slug);
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await createWorkspace(values);

      if (result.status === "error") {
        toast.error(result.message || "Failed to create workspace");
        return;
      }

      toast.success("Workspace created successfully!");
      router.push(`/workspace/${result.workspaceSlug}/inbox`);
    });
  }

  if (!canCreate) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950/30">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
          <Icons.billing className="size-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="font-semibold">Workspace limit reached</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The free plan includes 1 workspace. Upgrade to Pro for unlimited workspaces.
        </p>
        <Link href="/pricing">
          <Button className="mt-4">Upgrade to Pro</Button>
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="My Workspace"
                  {...field}
                  onChange={(e) => onNameChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <Input placeholder="my-workspace" {...field} />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Your workspace URL: guddesk.com/workspace/{field.value || "my-workspace"}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && (
            <Icons.spinner className="mr-2 size-4 animate-spin" />
          )}
          Create Workspace
        </Button>
      </form>
    </Form>
  );
}
