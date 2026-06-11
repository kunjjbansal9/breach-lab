import { useLang } from "@/lib/i18n";

type Card = {
  icon: string;
  code: string;
  en: { name: string; meaning: string; example: string; defense: string };
  hi: { name: string; meaning: string; example: string; defense: string };
  tone: "primary" | "accent" | "destructive";
};

const CARDS: Card[] = [
  {
    icon: "🎣",
    code: "T1566",
    tone: "accent",
    en: {
      name: "Phishing",
      meaning: "Social engineering via fake emails, SMS, or chats that trick you into clicking or sharing data.",
      example: "An 'urgent' bank alert from secure-alerts@hdfc-verify.support asking you to verify in 2 hours.",
      defense: "Check sender domain, hover links, never share OTPs, report to SOC.",
    },
    hi: {
      name: "फ़िशिंग",
      meaning: "नकली ईमेल/SMS से धोखा देकर डेटा या क्लिक हासिल करना।",
      example: "'जल्दी' बैंक चेतावनी जो 2 घंटे में सत्यापन माँगती है।",
      defense: "डोमेन जाँचें, लिंक होवर करें, OTP कभी साझा न करें, रिपोर्ट करें।",
    },
  },
  {
    icon: "💉",
    code: "T1190",
    tone: "primary",
    en: {
      name: "SQL Injection",
      meaning: "Attacker injects SQL into an input box so the database runs commands it shouldn't.",
      example: "Typing ' OR '1'='1 in a login form to bypass authentication.",
      defense: "Parameterised queries / prepared statements, ORMs, input validation, least-privilege DB users.",
    },
    hi: {
      name: "SQL इंजेक्शन",
      meaning: "हमलावर इनपुट में SQL डालकर डेटाबेस से अनधिकृत कमांड चलवाता है।",
      example: "लॉगिन फॉर्म में ' OR '1'='1 डालकर पासवर्ड बाईपास करना।",
      defense: "Prepared statements, ORM, इनपुट सत्यापन, सीमित DB अनुमतियाँ।",
    },
  },
  {
    icon: "🪞",
    code: "T1059.007",
    tone: "accent",
    en: {
      name: "Cross-Site Scripting (XSS)",
      meaning: "Attacker injects JavaScript into a page so other visitors' browsers run it as if it were yours.",
      example: "A comment containing <script>steal(document.cookie)</script> shown unsanitised to every reader.",
      defense: "Escape output, Content-Security-Policy, sanitise HTML, set HttpOnly + Secure cookies.",
    },
    hi: {
      name: "क्रॉस-साइट स्क्रिप्टिंग (XSS)",
      meaning: "हमलावर पेज में JavaScript डालता है ताकि दूसरों के ब्राउज़र में चले।",
      example: "एक टिप्पणी में <script>cookie चुराओ</script> जो हर पाठक को दिखे।",
      defense: "आउटपुट escape, CSP, HTML sanitise, HttpOnly कुकीज़।",
    },
  },
];

const TONE: Record<Card["tone"], { border: string; text: string; bg: string; chip: string }> = {
  primary: { border: "border-primary/40", text: "text-primary", bg: "from-primary/10", chip: "border-primary/50 text-primary" },
  accent: { border: "border-accent/40", text: "text-accent", bg: "from-accent/10", chip: "border-accent/50 text-accent" },
  destructive: { border: "border-destructive/40", text: "text-destructive", bg: "from-destructive/10", chip: "border-destructive/50 text-destructive" },
};

export function AttackTypes() {
  const { t, lang } = useLang();
  return (
    <section className="mt-14">
      <div className="mb-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-primary text-glow">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        04 // {t("attack atlas", "हमला एटलस")}
      </div>
      <h2 className="mb-5 font-mono text-2xl font-bold leading-tight text-foreground">
        {t("Know your enemy — common cyber attacks", "अपने दुश्मन को जानें — आम साइबर हमले")}
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {CARDS.map((c) => {
          const tone = TONE[c.tone];
          const txt = c[lang];
          return (
            <article
              key={c.en.name}
              className={`group relative overflow-hidden rounded-lg border ${tone.border} bg-gradient-to-br ${tone.bg} via-card/60 to-card/80 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_var(--terminal-glow)]`}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-current opacity-5 blur-2xl" />
              <div className="flex items-start gap-3">
                <div className={`text-4xl drop-shadow-lg`}>{c.icon}</div>
                <div className="flex-1">
                  <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest ${tone.text}`}>
                    <span className={`rounded-sm border px-1.5 py-0.5 ${tone.chip}`}>{c.code}</span>
                    <span>// {t("technique", "तकनीक")}</span>
                  </div>
                  <h3 className={`mt-1 font-mono text-lg font-bold ${tone.text} text-glow`}>{txt.name}</h3>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground">{txt.meaning}</p>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="rounded-sm border border-border bg-background/40 p-2">
                  <span className="text-muted-foreground">🧪 {t("example", "उदाहरण")}:</span>{" "}
                  <span className="font-mono text-foreground">{txt.example}</span>
                </div>
                <div className="rounded-sm border border-border bg-background/40 p-2">
                  <span className="text-muted-foreground">🛡 {t("defense", "बचाव")}:</span>{" "}
                  <span className="text-foreground">{txt.defense}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}