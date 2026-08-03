"use client";

// One shared enquiry modal for a page, opened by any <EnquiryButton>. Reuses the site ContactForm
// so the fields + /api/public/leads submission stay identical to the contact page. Accessible
// (focus trap, ESC, backdrop close, scroll lock), matching the ExitPopup pattern.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ContactForm } from "@/components/site/ContactForm";

const EnquiryCtx = createContext<() => void>(() => {});
export const useEnquiry = () => useContext(EnquiryCtx);

export function EnquiryProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const openModal = useCallback(() => {
    lastFocused.current = document.activeElement as HTMLElement;
    setOpen(true);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    lastFocused.current?.focus?.();
  }, []);

  // Focus management + ESC + focus trap + scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    const focusables = node?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "Tab" && focusables && focusables.length > 0) {
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  const source =
    typeof window !== "undefined" ? `enquiry:${window.location.pathname}` : "enquiry";

  return (
    <EnquiryCtx.Provider value={openModal}>
      {children}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4"
          onClick={close}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cw-enquiry-title"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-cream p-6 shadow-xl sm:rounded-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="cw-enquiry-title"
                  className="font-serif text-2xl text-brand-700"
                >
                  Get in touch
                </h2>
                <p className="mt-1 text-sm text-ink/70">
                  Book a visit or ask us anything, we&rsquo;ll be in touch shortly.
                </p>
              </div>
              <button
                onClick={close}
                aria-label="Close"
                className="-mr-1 rounded-full px-2 text-2xl leading-none text-muted hover:text-ink"
              >
                &times;
              </button>
            </div>
            <div className="mt-5">
              <ContactForm source={source} />
            </div>
          </div>
        </div>
      ) : null}
    </EnquiryCtx.Provider>
  );
}

export function EnquiryButton({
  children = "Contact us",
  variant = "outline",
  className = "",
}: {
  children?: React.ReactNode;
  variant?: "solid" | "outline" | "light";
  className?: string;
}) {
  const openModal = useEnquiry();
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors";
  const styles = {
    solid: "bg-brand-600 text-white hover:bg-brand-700",
    outline: "border border-brand-600 text-brand-700 hover:bg-brand-50",
    light: "bg-white text-brand-700 hover:bg-brand-50",
  }[variant];
  return (
    <button type="button" onClick={openModal} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}
