"use client";

import { deleteQuestionProvider } from "@/lib/actions/admin";

export function DeleteQPButton({ userId, name }: { userId: string; name: string }) {
  return (
    <form
      action={deleteQuestionProvider}
      onSubmit={(e) => {
        if (!confirm(`Delete account for ${name}?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <button type="submit" className="text-xs text-destructive hover:underline">
        Delete
      </button>
    </form>
  );
}
