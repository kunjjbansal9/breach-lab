import { useMemo, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";

let zxcvbnConfigured = false;
function configureZxcvbn() {
  if (zxcvbnConfigured) return;
  zxcvbnOptions.setOptions({
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
    },
  });
  zxcvbnConfigured = true;
}

export type Strength = {
  score: number; // 0-4
  label: string;
  entropy: number;
  crackTime: string; // realistic — offline slow hash (bcrypt-like, 10k guesses/s)
  crackTimeFast: string; // worst case — offline fast hash (GPU MD5, 10B guesses/s)
  crackTimeOnline: string; // throttled online attack (100/hr)
  color: string;
  warning?: string;
  suggestions?: string[];
};

const LABEL_HI = ["खाली", "बहुत कमज़ोर", "कमज़ोर", "ठीक-ठाक", "मज़बूत", "किला"];
const LABEL_EN = ["EMPTY", "VERY WEAK", "WEAK", "FAIR", "STRONG", "FORTRESS"];

export function analyzePassword(pw: string, lang: "en" | "hi" = "en"): Strength {
  if (!pw) {
    return {
      score: 0,
      label: lang === "hi" ? LABEL_HI[0] : LABEL_EN[0],
      entropy: 0,
      crackTime: "—",
      crackTimeFast: "—",
      crackTimeOnline: "—",
      color: "text-muted-foreground",
    };
  }
  configureZxcvbn();
  const result = zxcvbn(pw);
  const guesses = Math.max(result.guesses, 1);
  const entropy = Math.log2(guesses);
  // Realistic default — offline slow hash (bcrypt / argon2-style): 10k guesses/sec.
  // This is what most modern services actually do, so a strong password should
  // resist for centuries here. The "fast" figure is the worst-case unsalted GPU rig.
  const crackTime = formatTime(guesses / 1e4, lang);
  const crackTimeFast = formatTime(guesses / 1e10, lang);
  const crackTimeOnline = formatTime(guesses / (100 / 3600), lang);
  const score = result.score; // 0-4

  const labels = lang === "hi" ? LABEL_HI.slice(1) : LABEL_EN.slice(1);
  const colors = [
    "text-destructive",
    "text-destructive",
    "text-accent",
    "text-primary",
    "text-primary text-glow",
  ];
  return {
    score,
    label: labels[score],
    entropy,
    crackTime,
    crackTimeFast,
    crackTimeOnline,
    color: colors[score],
    warning: result.feedback.warning || undefined,
    suggestions: result.feedback.suggestions,
  };
}

function formatTime(seconds: number, lang: "en" | "hi" = "en"): string {
  const t = (e: string, h: string) => (lang === "hi" ? h : e);
  if (seconds < 0.001) return t("instantly", "तुरंत");
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)} ${t("ms", "मिलीसेकंड")}`;
  if (seconds < 60) return `${seconds.toFixed(1)} ${t("seconds", "सेकंड")}`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} ${t("minutes", "मिनट")}`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} ${t("hours", "घंटे")}`;
  if (seconds < 31536000) return `${(seconds / 86400).toFixed(1)} ${t("days", "दिन")}`;
  const years = seconds / 31536000;
  if (years < 1000) return `${years.toFixed(1)} ${t("years", "साल")}`;
  if (years < 1e6) return `${(years / 1000).toFixed(1)} ${t("thousand years", "हज़ार साल")}`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)} ${t("million years", "लाख साल")}`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)} ${t("billion years", "अरब साल")}`;
  return `${(years / 1e12).toExponential(1)} ${t("trillion years", "खरब साल")}`;
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const { lang, t } = useLang();
  const s = useMemo(() => analyzePassword(password, lang), [password, lang]);
  const bars = [0, 1, 2, 3, 4];
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {bars.map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-sm transition-all ${
              i < s.score
                ? s.score >= 3
                  ? "bg-primary border-glow"
                  : s.score === 2
                    ? "bg-accent"
                    : "bg-destructive"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs">
        <span className={`font-bold tracking-widest ${s.color}`}>{s.label}</span>
        <span className="text-muted-foreground">
          {t("ENTROPY", "एन्ट्रॉपी")}: <span className="text-foreground">{s.entropy.toFixed(1)} {t("bits", "बिट्स")}</span>
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        {t("Crack time", "क्रैक समय")} <span className="text-foreground">({t("slow hash, bcrypt-like", "धीमा हैश, bcrypt-जैसा")})</span>:{" "}
        <span className={`font-bold ${s.color}`}>{s.crackTime}</span>
      </div>
      <div className="text-[10px] text-muted-foreground">
        ⚡ {t("Worst-case GPU rig (10B/s)", "सबसे ख़राब GPU (10अरब/सेकंड)")}: <span className="text-accent">{s.crackTimeFast}</span>
        {" · "}
        🌐 {t("Throttled online", "थ्रॉटल्ड ऑनलाइन")}: <span className="text-primary">{s.crackTimeOnline}</span>
      </div>
      {s.warning && (
        <div className="text-xs text-destructive">
          ⚠ {s.warning}
        </div>
      )}
      {s.suggestions && s.suggestions.length > 0 && (
        <ul className="space-y-0.5 text-xs text-muted-foreground">
          {s.suggestions.map((sg, i) => (
            <li key={i}>→ {sg}</li>
          ))}
        </ul>
      )}
    </div>
  );
}