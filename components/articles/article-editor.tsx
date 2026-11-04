"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createArticle, updateArticle, publishArticle, deleteArticle } from "@/actions/manage-article";
import { generateArticleSlug } from "@/lib/help-center/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/shared/icons";

interface Collection {
  id: string;
  name: string;
}

interface ArticleEditorProps {
  workspaceId: string;
  workspaceSlug: string;
  collections: Collection[];
  article?: {
    id: string;
    title: string;
    slug: string;
    body: string;
    excerpt: string | null;
    collectionId: string | null;
    isPublished: boolean;
  };
}

export function ArticleEditor({
  workspaceId,
  workspaceSlug,
  collections,
  article,
}: ArticleEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [collectionId, setCollectionId] = useState(
    article?.collectionId ?? "none",
  );

  const isEditing = !!article;

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isEditing) {
      setSlug(generateArticleSlug(value));
    }
  }

  function handleSave() {
    startTransition(async () => {
      const data = {
        title,
        slug,
        body,
        excerpt: excerpt || undefined,
        collectionId: collectionId === "none" ? null : collectionId,
      };

      const result = isEditing
        ? await updateArticle(article.id, data)
        : await createArticle(workspaceId, data);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(isEditing ? "Article updated" : "Article created");
      router.push(`/workspace/${workspaceSlug}/articles`);
    });
  }

  function handlePublish() {
    if (!article) return;
    startTransition(async () => {
      const result = await publishArticle(article.id, !article.isPublished);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(article.isPublished ? "Article unpublished" : "Article published");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!article) return;
    startTransition(async () => {
      const result = await deleteArticle(article.id);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success("Article deleted");
      router.push(`/workspace/${workspaceSlug}/articles`);
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main editor */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Article title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="article-slug"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Content</Label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your article content here..."
              className="min-h-[400px] w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collection">Collection</Label>
            <Select
              value={collectionId}
              onValueChange={setCollectionId}
            >
              <SelectTrigger>
                <SelectValue placeholder="No collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No collection</SelectItem>
                {collections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description..."
              className="min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={!title.trim() || !body.trim() || isPending}
            className="w-full"
          >
            {isPending && <Icons.spinner className="mr-2 size-4 animate-spin" />}
            {isEditing ? "Update Article" : "Create Article"}
          </Button>

          {isEditing && (
            <>
              <Button
                variant="outline"
                onClick={handlePublish}
                disabled={isPending}
                className="w-full"
              >
                {article.isPublished ? "Unpublish" : "Publish"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
                className="w-full"
              >
                Delete Article
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
