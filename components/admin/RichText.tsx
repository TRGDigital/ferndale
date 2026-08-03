"use client";

import { useRef, type MouseEvent } from "react";

// A small, dependency-free WYSIWYG editor for the admin. Wraps a contentEditable region and syncs
// its HTML into a hidden input so it submits with the surrounding <form action={serverAction}>.
// Output is plain HTML (<p>, <h2>, <h3>, <strong>, <em>, <a>, <ul>/<ol>) stored in the same
// columns the raw-HTML textareas used, so nothing downstream changes.
//
// The editable is kept OUT of React's render cycle: its content is set once (via
// dangerouslySetInnerHTML on the initial render) and thereafter React never touches it — edits are
// pushed straight into the hidden input via a ref. Driving it through useState re-renders the
// component on every keystroke, which makes React reconcile the contentEditable node and wipe the
// caret/content — so we deliberately avoid state here.
export function RichText({
  name,
  defaultValue = "",
  minHeight = 160,
}: {
  name: string;
  defaultValue?: string | null;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sync = () => {
    if (inputRef.current && ref.current) inputRef.current.value = ref.current.innerHTML;
  };

  const cmd = (command: string, value?: string) => {
    ref.current?.focus();
    // Prefer semantic tags (<b>/<i>) over inline styles.
    try {
      document.execCommand("styleWithCSS", false, "false");
    } catch {
      /* not supported — ignore */
    }
    document.execCommand(command, false, value);
    sync();
  };

  // formatBlock needs an uppercase, bracketed tag to work across Chrome/Safari/Firefox.
  const setBlock = (tag: string) => cmd("formatBlock", `<${tag.toUpperCase()}>`);

  const addLink = () => {
    const url = window.prompt(
      "Link URL (e.g. /funding-calculator/ for this site, or https://…)",
    );
    if (url) cmd("createLink", url.trim());
  };

  // Keep the caret/selection in the editable when a toolbar control is pressed — without this,
  // clicking the toolbar blurs the editable and execCommand has nothing to act on.
  const hold = (e: MouseEvent) => e.preventDefault();

  const btn =
    "rounded px-2 py-1 hover:bg-neutral-200 active:bg-neutral-300 min-w-[28px]";

  return (
    <div className="rounded border border-neutral-300">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-200 bg-neutral-50 p-1 text-sm">
        <button type="button" aria-label="Paragraph" title="Paragraph" className={`${btn} text-xs`} onMouseDown={hold} onClick={() => setBlock("p")}>
          ¶
        </button>
        <button type="button" aria-label="Heading 2" title="Heading 2" className={`${btn} text-sm font-bold`} onMouseDown={hold} onClick={() => setBlock("h2")}>
          H2
        </button>
        <button type="button" aria-label="Heading 3" title="Heading 3" className={`${btn} text-xs font-bold`} onMouseDown={hold} onClick={() => setBlock("h3")}>
          H3
        </button>
        <span className="mx-1 h-4 w-px bg-neutral-300" />
        <button type="button" aria-label="Bold" title="Bold" className={`${btn} font-bold`} onMouseDown={hold} onClick={() => cmd("bold")}>
          B
        </button>
        <button type="button" aria-label="Italic" title="Italic" className={`${btn} italic`} onMouseDown={hold} onClick={() => cmd("italic")}>
          I
        </button>
        <span className="mx-1 h-4 w-px bg-neutral-300" />
        <button type="button" aria-label="Bulleted list" title="Bulleted list" className={btn} onMouseDown={hold} onClick={() => cmd("insertUnorderedList")}>
          • List
        </button>
        <button type="button" aria-label="Numbered list" title="Numbered list" className={btn} onMouseDown={hold} onClick={() => cmd("insertOrderedList")}>
          1. List
        </button>
        <span className="mx-1 h-4 w-px bg-neutral-300" />
        <button type="button" aria-label="Add link" title="Add link" className={btn} onMouseDown={hold} onClick={addLink}>
          Link
        </button>
        <button type="button" aria-label="Remove link" title="Remove link" className={btn} onMouseDown={hold} onClick={() => cmd("unlink")}>
          Unlink
        </button>
        <button type="button" aria-label="Clear formatting" title="Clear formatting" className={btn} onMouseDown={hold} onClick={() => cmd("removeFormat")}>
          Clear
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={`${name} rich text`}
        onInput={sync}
        onBlur={sync}
        style={{ minHeight }}
        className="admin-richtext px-3 py-2 leading-relaxed focus:outline-none [&_a]:text-brand-700 [&_a]:underline [&_h2]:mt-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2"
        dangerouslySetInnerHTML={{ __html: defaultValue ?? "" }}
      />
      <input ref={inputRef} type="hidden" name={name} defaultValue={defaultValue ?? ""} />
    </div>
  );
}

// Labelled wrapper matching the admin's <Field>/<Area> style.
export function RichField({
  label,
  name,
  defaultValue,
  hint,
  minHeight,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
  minHeight?: number;
}) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className="text-neutral-600">{label}</span>
      {hint ? <span className="text-xs text-neutral-400">{hint}</span> : null}
      <RichText name={name} defaultValue={defaultValue} minHeight={minHeight} />
    </div>
  );
}
