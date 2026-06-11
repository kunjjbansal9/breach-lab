import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { analyzePassword } from "./PasswordStrength";

const WORDS = [
  "river", "otter", "quartz", "mint", "ember", "comet", "harbor", "willow",
  "cobalt", "lantern", "meadow", "saffron", "thistle", "velvet", "zephyr",
  "tundra", "nimbus", "pebble", "orchid", "falcon", "garnet", "kestrel",
  "marble", "pinecone", "ranger", "sable", "tiger", "umber", "vortex",
  "walnut", "indigo", "amber", "basalt", "cedar", "dune", "ember", "fjord",
  "glacier", "hazel", "ivory", "juniper", "koi", "lichen", "moss", "nectar",
  "opal", "prism", "quill", "rune", "spruce", "topaz", "umbra", "violet",
  "wisp", "xenon", "yarrow", "zinc", "anchor", "beacon", "canyon", "delta",
  "echo", "frost", "grove", "haven", "iris", "jade", "knoll", "loft",
  "moor", "nova", "oak", "plum", "quay", "reef", "stone", "tide",
];

const SYMBOLS = "!@#$%^&*-_=+?";
const ALL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

function rng(max: number) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function pick<T>(arr: T[]): T {
  return arr[rng(arr.length)];
}

function randStr(len: number, charset = ALL) {
  let out = "";
  for (let i = 0; i < len; i++) out += charset[rng(charset.length)];
  return out;
}

function passphrase() {
  const sep = pick(["-", ".", "_"]);
  return [pick(WORDS), pick(WORDS), pick(WORDS), pick(WORDS)].join(sep) +
    rng(100).toString();
}

function lengthBoost(pw: string) {
  if (!pw) return passphrase();
  return pw + randStr(6);
}

function substituted(pw: string) {
  if (!pw) return randStr(14);
  const map: Record<string, string> = { a: "@", s: "$", o: "0", i: "!", e: "3", l: "1" };
  let out = "";
  for (const ch of pw) {
    const lower = ch.toLowerCase();
    if (map[lower] && rng(2) === 0) out += map[lower];
    else if (/[a-z]/.test(ch) && rng(3) === 0) out += ch.toUpperCase();
    else out += ch;
  }
  return out + pick(SYMBOLS.split("")) + randStr(4);
}

function pureRandom() {
  return randStr(16);
}

function scoreClasses(score: number) {
  if (score >= 4) return "bg-primary/15 text-primary border-primary/40";
  if (score === 3) return "bg-primary/10 text-primary border-primary/30";
  if (score === 2) return "bg-accent/15 text-accent border-accent/40";
  return "bg-destructive/15 text-destructive border-destructive/40";
}

type Cand = { kind: string; pw: string };

export function PasswordAlternatives({
  password,
  onPick,
}: {
  password: string;
  onPick: (pw: string) => void;
}) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [seed, setSeed] = useState(0);

  const currentScore = useMemo(
    () => analyzePassword(password, lang).score,
    [password, lang],
  );
  const suggestions = useMemo(
    () => analyzePassword(password, lang).suggestions ?? [],
    [password, lang],
  );

  const candidates: Cand[] = useMemo(() => {
    // recompute on seed change
    void seed;
    return [
      { kind: t("Passphrase", "पासफ़्रेज़"), pw: passphrase() },
      { kind: t("Length boost", "लंबाई बढ़ाएँ"), pw: lengthBoost(password) },
      { kind: t("Substituted", "प्रतिस्थापित"), pw: substituted(password) },
      { kind: t("Pure random", "पूर्ण यादृच्छिक"), pw: pureRandom() },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, seed, lang]);

  const handlePick = async (pw: string) => {
    onPick(pw);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(pw);
        toast.success(t("Copied & filled", "कॉपी और भरा गया"));
      } else {
        toast.success(t("Filled into input", "इनपुट में भर दिया गया"));
      }
    } catch {
      toast.success(t("Filled into input", "इनपुट में भर दिया गया"));
    }
    setOpen(false);
  };

  const showBtn = currentScore < 3;

  return (
    <div className="space-y-3">
      {showBtn && (
        <Button
          type="button"
          onClick={() => setOpen((o) => !o)}
          variant="outline"
          className="w-full border-accent/50 bg-accent/5 uppercase tracking-widest text-accent hover:bg-accent/15"
        >
          {open
            ? t("✕ hide alternatives", "✕ विकल्प छिपाएँ")
            : t("✦ generate stronger alternatives", "✦ मज़बूत विकल्प बनाएँ")}
        </Button>
      )}
      {open && (
        <div className="rounded-md border border-border bg-card/60 p-4 backdrop-blur">
          {suggestions.length > 0 && (
            <div className="mb-3 space-y-1">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("why your password is weak", "आपका पासवर्ड कमज़ोर क्यों है")}
              </div>
              <ul className="space-y-0.5 text-xs text-muted-foreground">
                {suggestions.map((s, i) => (
                  <li key={i}>→ {s}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-primary">
              {t("tap a candidate to use it", "उपयोग के लिए विकल्प चुनें")}
            </span>
            <button
              onClick={() => setSeed((s) => s + 1)}
              className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              ↻ {t("regenerate", "फिर से बनाएँ")}
            </button>
          </div>
          <ul className="space-y-1.5">
            {candidates.map((c, i) => {
              const s = analyzePassword(c.pw, lang);
              return (
                <li key={i}>
                  <button
                    onClick={() => handlePick(c.pw)}
                    className="group flex w-full items-center gap-2 rounded-sm border border-border/60 bg-background/40 px-2 py-2 text-left text-xs hover:border-primary/60"
                  >
                    <span
                      className={`shrink-0 rounded-sm border px-1.5 py-0.5 text-[9px] font-bold tracking-widest ${scoreClasses(
                        s.score,
                      )}`}
                    >
                      {s.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-foreground group-hover:text-primary">
                        {c.pw}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {c.kind} · {s.crackTime}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
