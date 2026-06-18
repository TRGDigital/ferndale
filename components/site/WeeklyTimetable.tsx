"use client";

// Day-tabbed weekly timetable (matches the live site's tabs layout): a row of
// day tabs, with the selected day's schedule below. Each event is its own card
// that gently enlarges on hover, the right column is offset down by half a step
// so the day reads as a zig-zag, and a dotted trail is drawn through the cards
// (in chronological order) to show the path through the day.

import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { Icon } from "@/components/site/Icon";

type Item = { label: string; time: string; icon: string };
type Day = { day: string; items: Item[] };

export function WeeklyTimetable({ schedule }: { schedule: Day[] }) {
  const [active, setActive] = useState(0);
  const day = schedule[active];

  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [path, setPath] = useState("");
  const [size, setSize] = useState({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const cont = list.getBoundingClientRect();
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < day.items.length; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      pts.push({
        x: r.left - cont.left + r.width / 2,
        y: r.top - cont.top + r.height / 2,
      });
    }
    setPath(pts.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" "));
    setSize({ w: list.clientWidth, h: list.clientHeight });
  }, [day.items.length]);

  useLayoutEffect(() => {
    measure();
    const list = listRef.current;
    if (!list) return;
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [measure, active]);

  return (
    <div>
      {/* Day tabs */}
      <div
        role="tablist"
        aria-label="Weekly activities"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        {schedule.map((d, i) => {
          const selected = i === active;
          return (
            <button
              key={d.day}
              role="tab"
              aria-selected={selected}
              aria-controls="weekly-timetable-panel"
              onClick={() => setActive(i)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? "bg-brand-600 text-white"
                  : "bg-brand-50 text-brand-700 hover:bg-brand-100"
              }`}
            >
              {d.day}
            </button>
          );
        })}
      </div>

      {/* Selected day's schedule */}
      <div className="relative mt-6">
        {/* Dotted trail through the cards (behind them), in day order */}
        <svg
          className="pointer-events-none absolute inset-0 z-0"
          width={size.w}
          height={size.h}
          aria-hidden="true"
        >
          <path
            d={path}
            fill="none"
            stroke="var(--color-brand-300, #7bb8e0)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 8"
          />
        </svg>

        <ul
          id="weekly-timetable-panel"
          ref={listRef}
          role="tabpanel"
          className="grid grid-cols-1 items-start gap-x-6 gap-y-3 sm:grid-cols-2 sm:[&>li:nth-child(even)]:mt-8"
        >
          {day.items.map((it, i) => (
            <li
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="group relative z-10 flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-3 shadow-[0_8px_24px_-16px_rgba(19,82,113,0.18)] transition duration-300 ease-out hover:z-20 hover:-translate-y-0.5 hover:scale-[1.04] hover:shadow-[0_18px_36px_-18px_rgba(19,82,113,0.30)]"
            >
              <span className="inline-flex shrink-0 rounded-lg bg-brand-50 p-2 text-brand-600 ring-1 ring-brand-100">
                <Icon name={it.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink/90">{it.label}</p>
                <p className="text-xs text-muted">{it.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
