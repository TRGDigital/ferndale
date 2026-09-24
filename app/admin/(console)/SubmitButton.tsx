"use client";

import { useFormStatus } from "react-dom";

// Every form in the console posts to a server action, and until the server replies
// the page looks exactly as it did before the click. On a slow action (AI generation
// takes several seconds) that reads as "nothing happened", so people click again.
// This button disables itself, says what it is doing and shows a spinner, from the
// moment it is pressed. It must be rendered INSIDE the <form> it belongs to, because
// useFormStatus reads the status of its closest parent form.

type Variant = "primary" | "dark" | "link" | "danger";

const STYLES: Record<Variant, string> = {
  primary: "rounded bg-brand-700 px-3 py-1.5 text-sm text-white hover:bg-brand-800",
  dark: "rounded bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-800",
  link: "text-sm text-brand-700 underline hover:text-brand-800",
  danger: "text-sm text-red-600 underline hover:text-red-700",
};

export function SubmitButton({
  children,
  pendingLabel,
  variant = "dark",
  className = "",
  confirm,
}: {
  children: React.ReactNode;
  /** Shown while the action runs. Defaults to the label plus an ellipsis. */
  pendingLabel?: string;
  variant?: Variant;
  className?: string;
  /** Ask first. Used for deletes and anything that takes a page off the site. */
  confirm?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className={`inline-flex items-center gap-2 transition-opacity disabled:cursor-wait disabled:opacity-60 ${STYLES[variant]} ${className}`}
    >
      {pending ? (
        <span
          aria-hidden
          className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {pending ? (pendingLabel ?? `${typeof children === "string" ? children : "Working"}…`) : children}
    </button>
  );
}
