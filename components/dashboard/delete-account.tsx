"use client";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { SectionColumns } from "@/components/dashboard/section-columns";
import { useDeleteAccountModal } from "@/components/modals/delete-account-modal";
import { Icons } from "@/components/shared/icons";

export function DeleteAccountSection() {
  const { setShowDeleteAccountModal, DeleteAccountModal } =
    useDeleteAccountModal();

  return (
    <>
      <DeleteAccountModal />
      <SectionColumns
        title="Delete Account"
        description="Permanently remove your account and data."
      >
        <div className="flex flex-col gap-4 rounded-xl border border-red-400 p-4 dark:border-red-900">
          <div className="flex flex-col gap-2">
            <span className="text-[15px] font-medium">Are you sure?</span>
            <div className="text-sm text-balance text-neutral-600 dark:text-neutral-300">
              Permanently delete your {siteConfig.name} account and all
              associated data. This action cannot be undone.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="destructive"
              onClick={() => setShowDeleteAccountModal(true)}
            >
              <Icons.trash className="mr-2 size-4" />
              <span>Delete Account</span>
            </Button>
          </div>
        </div>
      </SectionColumns>
    </>
  );
}
