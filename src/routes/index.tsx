import { createFileRoute } from "@tanstack/react-router";
import { Simulator } from "@/components/Simulator";
import { LanguageSwitcher, useLang } from "@/lib/i18n";
import { AttackTypes } from "@/components/AttackTypes";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t } = useLang();
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-3 border-b border-border pb-6">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span>
              {t(
                "secure_sandbox · v1.0.0 · educational use only",
                "सुरक्षित_सैंडबॉक्स · v1.0.0 · केवल शैक्षिक उपयोग",
              )}
            </span>
            <span className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary text-glow flicker sm:text-5xl">
            &gt; {t("Breach_Lab", "ब्रीच_लैब")}<span className="cursor-blink">_</span>
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            {t(
              "A safe, visual demo of how brute-force attacks work and why password strength matters. Nothing real is hacked — every attack runs in your browser as a learning tool.",
              "एक सुरक्षित, दृश्य प्रदर्शन कि ब्रूट-फोर्स हमले कैसे काम करते हैं और पासवर्ड की मजबूती क्यों मायने रखती है। कुछ भी असली रूप से हैक नहीं किया जाता — हर हमला सिर्फ़ सीखने के लिए आपके ब्राउज़र में चलता है।",
            )}
          </p>
          <div className="mt-2 rounded-md border border-accent/40 bg-accent/5 px-4 py-3 text-xs text-accent sm:text-sm">
            ⚠ {t(
              "DISCLAIMER: This is a simulation for educational purposes only. No real hacking is performed.",
              "अस्वीकरण: यह केवल शैक्षिक उद्देश्यों के लिए एक सिमुलेशन है। वास्तविक हैकिंग नहीं की जाती।",
            )}
          </div>
        </header>

        <Simulator />

        <AttackTypes />

        <section className="mt-14 grid gap-5 md:grid-cols-6">
          {/* Card 1 — wide, big number */}
          <article className="group relative overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-br from-card/80 via-card/60 to-primary/5 p-6 backdrop-blur md:col-span-3 transition-all hover:border-primary/60 hover:-translate-y-1">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />
            <div className="relative">
              <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-primary text-glow">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                01 // {t("brute force", "ब्रूट फोर्स")}
              </div>
              <h2 className="mb-3 font-mono text-2xl font-bold leading-tight text-foreground">
                {t("what is brute force?", "ब्रूट फोर्स क्या है?")}
              </h2>
              <div className="mb-3 font-mono text-3xl font-black text-primary text-glow">
                10<span className="text-base align-top">B</span>
                <span className="ml-2 text-xs font-normal uppercase tracking-widest text-muted-foreground">{t("guesses / sec", "अनुमान / सेकंड")}</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(
                  "A brute-force attack systematically tries every possible combination of characters until it finds the correct password. Modern GPUs can test billions of guesses per second.",
                  "ब्रूट-फोर्स हमला हर संभव अक्षर संयोजन को क्रमबद्ध रूप से तब तक आज़माता है जब तक सही पासवर्ड न मिल जाए। आधुनिक GPU प्रति सेकंड अरबों अनुमान लगा सकते हैं।",
                )}
              </p>
            </div>
          </article>

          {/* Card 2 — narrow, accent vibe */}
          <article className="group relative overflow-hidden rounded-lg border border-accent/40 bg-gradient-to-br from-card/80 via-card/60 to-accent/10 p-6 backdrop-blur md:col-span-3 transition-all hover:border-accent/70 hover:-translate-y-1">
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl transition-all group-hover:bg-accent/20" />
            <div className="relative">
              <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-accent">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                02 // {t("length wins", "लंबाई जीतती है")}
              </div>
              <h2 className="mb-3 font-mono text-2xl font-bold leading-tight text-foreground">
                {t("why strong passwords?", "मज़बूत पासवर्ड क्यों?")}
              </h2>
              {/* mini length-vs-time chart */}
              <div className="mb-4 space-y-1.5">
                {[
                  { len: "8", bar: 8, label: t("seconds", "सेकंड"), tone: "bg-destructive" },
                  { len: "10", bar: 24, label: t("hours", "घंटे"), tone: "bg-destructive/70" },
                  { len: "12", bar: 55, label: t("years", "साल"), tone: "bg-accent" },
                  { len: "16", bar: 100, label: t("centuries", "सदियाँ"), tone: "bg-primary text-glow" },
                ].map((r) => (
                  <div key={r.len} className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
                    <span className="w-6 font-mono text-muted-foreground">{r.len}ch</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-sm bg-muted">
                      <div className={`h-full ${r.tone}`} style={{ width: `${r.bar}%` }} />
                    </div>
                    <span className="w-16 text-right text-muted-foreground">{r.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t(
                  "Each extra character makes the search space exponentially larger.",
                  "हर अतिरिक्त अक्षर खोज क्षेत्र को कई गुना बड़ा बना देता है।",
                )}
              </p>
            </div>
          </article>

          {/* Card 3 — full-width tips with icons */}
          <article className="group relative overflow-hidden rounded-lg border border-border bg-card/60 p-6 backdrop-blur md:col-span-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-primary text-glow">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              03 // {t("safety tips", "सुरक्षा सुझाव")}
            </div>
            <h2 className="mb-5 font-mono text-2xl font-bold leading-tight text-foreground">
              {t("Your 5 rules of defense", "रक्षा के 5 नियम")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { icon: "📏", en: "Use 12+ characters minimum", hi: "कम से कम 12 अक्षर रखें" },
                { icon: "🎲", en: "Mix upper, lower, numbers, symbols", hi: "बड़े, छोटे, संख्या और चिह्न मिलाएँ" },
                { icon: "🚫", en: "Never reuse passwords", hi: "पासवर्ड कभी दोबारा इस्तेमाल न करें" },
                { icon: "🔐", en: "Enable 2FA everywhere", hi: "हर जगह 2FA चालू रखें" },
                { icon: "🗝️", en: "Use a password manager", hi: "पासवर्ड मैनेजर का उपयोग करें" },
              ].map((tip, i) => (
                <div
                  key={i}
                  className="group/tip relative overflow-hidden rounded-md border border-border bg-background/40 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5"
                >
                  <div className="mb-1 text-2xl">{tip.icon}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    #{(i + 1).toString().padStart(2, "0")}
                  </div>
                  <div className="mt-1 text-xs leading-snug text-foreground">{t(tip.en, tip.hi)}</div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <footer className="mt-12 border-t border-border pt-6 text-center text-xs uppercase tracking-widest text-muted-foreground">
          # {t(
            "stay curious. stay secure. # never use these techniques on systems you don't own.",
            "जिज्ञासु रहें। सुरक्षित रहें। # इन तकनीकों का उपयोग कभी उन सिस्टम पर न करें जो आपके नहीं हैं।",
          )}
        </footer>
      </div>
    </main>
  );
}
