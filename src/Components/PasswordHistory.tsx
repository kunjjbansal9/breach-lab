import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { analyzePassword } from "./PasswordStrength";

const KEY = "pw_check_history";
const EVT = "pw_check_history_update";
const MAX = 10;

export type HistoryEntry = {
  pw: string;
  score: number;
  label: string;
  crackTime: string;
  warning?: string;
  ts: number;
};

function read(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: HistoryEntry[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(EVT));
  } catch {
    /* ignore */
  }
}

export function recordPasswordCheck(pw: string, lang: "en" | "hi") {
  if (!pw) return;
  const s = analyzePassword(pw, lang);
  const entry: HistoryEntry = {
    pw,
    score: s.score,
    label: s.label,
    crackTime: s.crackTime,
    warning: s.warning,
    ts: Date.now(),
  };
  const next = [entry, ...read().filter((e) => e.pw !== pw)].slice(0, MAX);
  write(next);
}

function mask(pw: string) {
  if (pw.length <= 2) return "•".repeat(pw.length);
  if (pw.length <= 4) return pw[0] + "•".repeat(pw.length - 1);
  return pw[0] + "•".repeat(Math.min(pw.length - 2, 8)) + pw[pw.length - 1];
}

function scoreClasses(score: number) {
  if (score >= 4) return "bg-primary/15 text-primary border-primary/40";
  if (score === 3) return "bg-primary/10 text-primary border-primary/30";
  if (score === 2) return "bg-accent/15 text-accent border-accent/40";
  return "bg-destructive/15 text-destructive border-destructive/40";
}

export function PasswordHistory({ onPick }: { onPick: (pw: string) => void }) {
  const { t, lang } = useLang();
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [reveal, setReveal] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setItems(read());
    const handler = () => setItems(read());
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const clear = () => {
    write([]);
    setReveal({});
  };

  const fmtTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-md border border-border bg-card/60 p-5 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-widest text-primary">
          // {t("check history", "जाँच इतिहास")}
        </h3>
        {items.length > 0 && (
          <button
            onClick={clear}
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive"
          >
            {t("clear", "साफ़ करें")}
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {t(
            "No checks yet. Run a simulation to record history.",
            "अभी तक कोई जाँच नहीं। इतिहास दर्ज करने के लिए सिमुलेशन चलाएँ।",
          )}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((e) => (
            <li
              key={e.ts}
              className="group flex items-center gap-2 rounded-sm border border-border/60 bg-background/40 px-2 py-1.5 text-xs"
            >
              <span
                className={`shrink-0 rounded-sm border px-1.5 py-0.5 text-[9px] font-bold tracking-widest ${scoreClasses(
                  e.score,
                )}`}
              >
                {e.label}
              </span>
              <button
                onClick={() => onPick(e.pw)}
                className="min-w-0 flex-1 truncate text-left font-mono text-foreground hover:text-primary"
                title={t("Refill input", "इनपुट में भरें")}
              >
                {reveal[e.ts] ? e.pw : mask(e.pw)}
              </button>
              <span className="shrink-0 text-muted-foreground">{e.crackTime}</span>
              <button
                onClick={() =>
                  setReveal((r) => ({ ...r, [e.ts]: !r[e.ts] }))
                }
                className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                {reveal[e.ts] ? t("hide", "छिपा") : t("show", "दिखा")}
              </button>
              <span className="hidden shrink-0 text-muted-foreground sm:inline">
                {fmtTime(e.ts)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-[10px] text-muted-foreground">
        {t(
          "Stored locally in your browser only. Never sent anywhere.",
          "केवल आपके ब्राउज़र में स्थानीय रूप से सहेजा गया। कहीं नहीं भेजा जाता।",
        )}
      </p>
    </div>
  );
}
