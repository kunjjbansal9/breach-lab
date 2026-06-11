import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (en: string, hi: string) => string;
};

const LangCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "cas_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang | null>(null);

  // Hydrate from storage (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved === "en" || saved === "hi") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  // While unselected, show the picker
  if (!lang) {
    return <LanguageGate onPick={setLang} />;
  }

  const t = (en: string, hi: string) => (lang === "hi" ? hi : en);

  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>
  );
}

export function useLang(): Ctx {
  const v = useContext(LangCtx);
  if (!v) {
    // Fallback so non-provider rendering doesn't crash
    return {
      lang: "en",
      setLang: () => {},
      t: (en: string) => en,
    };
  }
  return v;
}

/* ──────────────  Initial language selector  ────────────── */

function LanguageGate({ onPick }: { onPick: (l: Lang) => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-md border border-primary/40 bg-card/90 p-6 shadow-2xl border-glow scanlines">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span>secure_sandbox · select language</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-primary text-glow">
          &gt; Choose language<span className="cursor-blink">_</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          भाषा चुनें / Select your language to continue.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => onPick("en")}
            className="rounded-md border border-primary bg-primary/10 px-4 py-3 text-left transition hover:bg-primary/20"
          >
            <div className="text-lg font-bold uppercase tracking-widest text-primary text-glow">
              English
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Continue in English
            </div>
          </button>
          <button
            onClick={() => onPick("hi")}
            className="rounded-md border border-accent bg-accent/10 px-4 py-3 text-left transition hover:bg-accent/20"
          >
            <div className="text-lg font-bold uppercase tracking-widest text-accent">
              हिन्दी
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              हिन्दी में जारी रखें
            </div>
          </button>
        </div>

        <p className="mt-5 text-[10px] uppercase tracking-widest text-muted-foreground">
          # you can change this anytime from the top of the page
        </p>
      </div>
    </main>
  );
}

/* ──────────────  Small floating switcher used inside the app  ────────────── */

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest">
      <button
        onClick={() => setLang("en")}
        className={`rounded-sm border px-2 py-0.5 transition ${
          lang === "en"
            ? "border-primary bg-primary/10 text-primary text-glow"
            : "border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("hi")}
        className={`rounded-sm border px-2 py-0.5 transition ${
          lang === "hi"
            ? "border-accent bg-accent/10 text-accent"
            : "border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
}