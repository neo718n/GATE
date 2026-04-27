"use client";

import { useRef } from "react";
import { deleteUser } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function DeleteUserButton({ userId, name }: { userId: string; name: string | null }) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleClick() {
    if (!confirm(`Delete user "${name ?? userId}"? This cannot be undone.`)) return;
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={deleteUser}>
      <input type="hidden" name="userId" value={userId} />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
      >
        Delete
      </Button>
    </form>
  );
}
