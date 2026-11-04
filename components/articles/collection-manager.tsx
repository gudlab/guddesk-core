"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createCollection,
  updateCollection,
  deleteCollection,
} from "@/actions/manage-collection";
import { generateCollectionSlug } from "@/lib/help-center/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";

interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  isPublished: boolean;
  articleCount: number;
}

interface CollectionManagerProps {
  workspaceId: string;
  collections: CollectionItem[];
}

export function CollectionManager({
  workspaceId,
  collections,
}: CollectionManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  function handleNameChange(value: string) {
    setName(value);
    setSlug(generateCollectionSlug(value));
  }

  function handleCreate() {
    startTransition(async () => {
      const result = await createCollection(workspaceId, {
        name,
        slug,
        description: description || undefined,
      });

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success("Collection created");
      setName("");
      setSlug("");
      setDescription("");
      setShowForm(false);
      router.refresh();
    });
  }

  function handleTogglePublish(collection: CollectionItem) {
    startTransition(async () => {
      const result = await updateCollection(collection.id, {
        isPublished: !collection.isPublished,
      });
      if (result.status === "error") toast.error(result.message);
      else router.refresh();
    });
  }

  function handleDelete(collectionId: string) {
    startTransition(async () => {
      const result = await deleteCollection(collectionId);
      if (result.status === "error") toast.error(result.message);
      else {
        toast.success("Collection deleted");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <Button size="sm" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "New Collection"}
      </Button>

      {showForm && (
        <div className="space-y-3 rounded-lg border p-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Getting Started"
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="getting-started"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || !slug.trim() || isPending}
            size="sm"
          >
            {isPending && <Icons.spinner className="mr-2 size-3 animate-spin" />}
            Create
          </Button>
        </div>
      )}

      <div className="rounded-lg border">
        {collections.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No collections yet. Create one to organize your articles.
          </div>
        ) : (
          <div className="divide-y">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    {collection.icon && <span>{collection.icon}</span>}
                    <span className="text-sm font-medium">
                      {collection.name}
                    </span>
                    <Badge
                      variant={collection.isPublished ? "default" : "secondary"}
                    >
                      {collection.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {collection.articleCount} article
                    {collection.articleCount !== 1 ? "s" : ""}
                    {collection.description && ` — ${collection.description}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePublish(collection)}
                    disabled={isPending}
                  >
                    {collection.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(collection.id)}
                    disabled={isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
