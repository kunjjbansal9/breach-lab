import { useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";

export type LogLine = {
  id: number;
  text: string;
  type?: "info" | "guess" | "success" | "error" | "warn" | "system";
};

export function Terminal({ lines, running }: { lines: LogLine[]; running: boolean }) {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [lines]);

  const colorFor = (type?: LogLine["type"]) => {
    switch (type) {
      case "success":
        return "text-primary text-glow";
      case "error":
        return "text-destructive";
      case "warn":
        return "text-accent";
      case "system":
        return "text-muted-foreground";
      case "guess":
        return "text-foreground/80";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="scanlines rounded-md border border-border border-glow bg-card/80 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-destructive" />
          <span className="h-3 w-3 rounded-full bg-accent" />
          <span className="h-3 w-3 rounded-full bg-primary" />
        </div>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          /dev/tty — bruteforce.sh
        </span>
        <span className="text-xs text-muted-foreground">
          {running ? (
            <span className="text-primary">● {t("LIVE", "लाइव")}</span>
          ) : (
            <span>○ {t("IDLE", "निष्क्रिय")}</span>
          )}
        </span>
      </div>
      <div
        ref={ref}
        className="relative z-0 h-80 overflow-y-auto px-4 py-3 text-sm leading-relaxed"
      >
        {lines.length === 0 ? (
          <div className="text-muted-foreground">
            <span className="text-primary">root@simulator</span>:~${" "}
            <span className="cursor-blink">▊</span>
            <div className="mt-4 opacity-60">
              # {t("Awaiting target. Enter a password and press START SIMULATION.", "लक्ष्य की प्रतीक्षा। पासवर्ड दर्ज करें और START SIMULATION दबाएँ।")}
            </div>
          </div>
        ) : (
          lines.map((l) => (
            <div key={l.id} className={`whitespace-pre-wrap ${colorFor(l.type)}`}>
              {l.text}
            </div>
          ))
        )}
        {running && (
          <span className="text-primary cursor-blink">▊</span>
        )}
      </div>
    </div>
  );
}