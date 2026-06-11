import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  INCIDENT_STEPS,
  IR_STEP_LABEL,
  loc,
  pickIROptions,
  pickRandomScenario,
  TACTICS,
  TACTIC_LABEL,
  type Tactic,
  type Decision,
  type Scenario,
} from "./scenarios";
import { PhishingSimulation } from "./PhishingSimulation";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import jsPDF from "jspdf";

type Stage =
  | "recap"
  | "decision"
  | "consequence"
  | "explain"
  | "killchain"
  | "forensics"
  | "phishing"
  | "incident"
  | "score";

function rankFor(score: number, lang: "en" | "hi") {
  const en = score >= 90 ? "EXPERT" : score >= 75 ? "ANALYST" : score >= 50 ? "RESPONDER" : score >= 25 ? "TRAINEE" : "BEGINNER";
  const hi = score >= 90 ? "विशेषज्ञ" : score >= 75 ? "विश्लेषक" : score >= 50 ? "प्रतिक्रियाकर्ता" : score >= 25 ? "प्रशिक्षु" : "शुरुआती";
  return lang === "hi" ? hi : en;
}

function rankIconFor(score: number) {
  if (score >= 90) return "🛡️";
  if (score >= 75) return "🎖️";
  if (score >= 50) return "⚔️";
  if (score >= 25) return "🔰";
  return "🌱";
}

/* ────────────── Story popup ────────────── */

type Story = { title: string; body: string; tone: "good" | "warn" | "bad" };

function StoryPopup({ story, onClose, t }: { story: Story; onClose: () => void; t: (e: string, h: string) => string }) {
  const tone =
    story.tone === "good"
      ? "border-primary text-primary"
      : story.tone === "bad"
        ? "border-destructive text-destructive"
        : "border-accent text-accent";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur animate-fade-in">
      <div className={`w-full max-w-md rounded-md border ${tone} bg-card/95 p-5 shadow-2xl border-glow scanlines`}>
        <div className="flex items-center gap-2 border-b border-border pb-2 text-xs uppercase tracking-widest text-muted-foreground">
          <span className={tone}>// {t("transmission", "संदेश")}</span>
          <span className="ml-auto cursor-blink">▌</span>
        </div>
        <h4 className={`mt-3 text-sm font-bold uppercase tracking-widest ${tone} text-glow`}>
          {story.title}
        </h4>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
          {story.body}
        </p>
        <Button
          onClick={onClose}
          className="mt-4 w-full border border-primary bg-primary/10 text-primary text-glow hover:bg-primary/20"
        >
          ▶ {t("continue", "जारी रखें")}
        </Button>
      </div>
    </div>
  );
}

export function PostSimulation({ password, onRestart }: { password: string; onRestart: () => void }) {
  const { t, lang } = useLang();
  const [scenario, setScenario] = useState<Scenario>(() => pickRandomScenario());
  const [irOptions, setIrOptions] = useState(() => pickIROptions());

  const [stage, setStage] = useState<Stage>("recap");
  const [chosen, setChosen] = useState<Decision | null>(null);
  const [damage, setDamage] = useState(0);
  const [locked, setLocked] = useState(false);
  const [classify, setClassify] = useState<Record<number, Tactic>>({});
  const [classifySubmitted, setClassifySubmitted] = useState(false);
  const [forensicsTime, setForensicsTime] = useState(60);
  const [kcOrder, setKcOrder] = useState<number[]>([]);
  const [kcSubmitted, setKcSubmitted] = useState(false);
  const [kcShuffleSeed, setKcShuffleSeed] = useState(0);
  const [phishVerdict, setPhishVerdict] = useState<"phish" | "real" | null>(null);
  const [irChoices, setIrChoices] = useState<Record<string, number | null>>({});
  const [story, setStory] = useState<Story | null>(null);

  const [assistantOpen, setAssistantOpen] = useState(true);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLog, setAssistantLog] = useState<{ from: "bot" | "you"; text: string }[]>([
    { from: "bot", text: t("Hi! I'm your Threat Assistant. Ask for a hint anytime.", "नमस्ते! मैं आपका थ्रेट असिस्टेंट हूँ। कभी भी संकेत माँगें।") },
  ]);

  // Intro story
  useEffect(() => {
    setStory({
      title: `${t("Scenario", "परिदृश्य")}: ${loc(scenario.name, lang)}`,
      body: loc(scenario.recapStory, lang),
      tone: "warn",
    });
  }, [scenario, lang, t]);

  const reshuffle = () => {
    setScenario(pickRandomScenario());
    setIrOptions(pickIROptions());
    setStage("recap");
    setChosen(null);
    setDamage(0);
    setLocked(false);
    setClassify({});
    setClassifySubmitted(false);
    setForensicsTime(60);
    setKcOrder([]);
    setKcSubmitted(false);
    setKcShuffleSeed((n) => n + 1);
    setPhishVerdict(null);
    setIrChoices({});
  };

  // Shuffle for killchain (re-seeded on reshuffle)
  const shuffledKc = useMemo(() => {
    const ids = scenario.attackFlow.map((_, i) => i);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, kcShuffleSeed]);

  const kcCorrectCount = kcOrder.filter((id, idx) => id === idx).length;

  // Forensics countdown
  useEffect(() => {
    if (stage !== "forensics" || classifySubmitted) return;
    if (forensicsTime <= 0) { setClassifySubmitted(true); return; }
    const id = setTimeout(() => setForensicsTime((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [stage, forensicsTime, classifySubmitted]);

  const score = useMemo(() => {
    let s = 0;
    if (chosen?.verdict === "correct") s += 22;
    else if (chosen?.verdict === "partial") s += 11;
    // Kill-chain reconstruction — reward correctness, punish misplacement
    const kcWrong = kcOrder.length - kcCorrectCount;
    s += kcCorrectCount * 5 - kcWrong * 2;
    // Threat classifier
    let cc = 0, cw = 0;
    scenario.logs.forEach((l) => {
      const expected: Tactic = l.suspicious ? (l.category ?? "Benign") : "Benign";
      const actual = classify[l.id];
      if (actual && actual === expected) cc++;
      else if (actual && actual !== expected) cw++;
    });
    // Harder: bigger reward, bigger penalty, time bonus
    s += cc * 5 - cw * 5;
    if (classifySubmitted) s += Math.floor(forensicsTime / 6); // speed bonus
    if (phishVerdict && ((phishVerdict === "phish") === scenario.phish.isPhish)) s += 15;
    const irCorrect = INCIDENT_STEPS.filter((k) => {
      const i = irChoices[k];
      return i != null && irOptions[k][i].correct;
    }).length;
    s += irCorrect * 5;
    s -= Math.floor(damage / 4);
    return Math.max(0, Math.min(100, s));
  }, [chosen, kcCorrectCount, kcOrder.length, classify, classifySubmitted, forensicsTime, phishVerdict, irChoices, damage, scenario, irOptions]);

  const sendAssistant = () => {
    const q = assistantInput.trim();
    if (!q) return;
    setAssistantInput("");
    const next = [...assistantLog, { from: "you" as const, text: q }];
    const ql = q.toLowerCase();
    let reply = t("Tip: contain first, investigate second, communicate third.", "सुझाव: पहले रोकें, फिर जाँचें, फिर सूचित करें।");
    if (ql.includes("phish") || ql.includes("फ़िश"))
      reply = t("Check sender domain, hover links, and watch for urgency language.", "भेजने वाले का डोमेन देखें, लिंक पर होवर करें, जल्दबाज़ी की भाषा से सावधान रहें।");
    else if (ql.includes("password") || ql.includes("पासवर्ड"))
      reply = t("12+ chars, unique per site, in a manager. Enable MFA.", "12+ अक्षर, हर साइट के लिए अलग, मैनेजर में रखें। MFA चालू करें।");
    else if (ql.includes("log") || ql.includes("लॉग"))
      reply = t("Off-hours activity, unusual IPs, repeated failures, mass renames.", "ऑफ-ऑवर गतिविधि, असामान्य IP, बार-बार विफलताएँ, बड़े पैमाने पर नाम बदलना।");
    else if (ql.includes("hint") || ql.includes("संकेत"))
      reply = t("Containment beats investigation when an attack is confirmed.", "जब हमला पुष्ट हो, तब जाँच से ज़्यादा रोकथाम ज़रूरी है।");
    else if (ql.includes("ransom") || ql.includes("फिरौती"))
      reply = t("Don't pay. Isolate, eradicate, restore from offline backup.", "पैसे न दें। अलग करें, हटाएँ, ऑफ़लाइन बैकअप से बहाल करें।");
    setAssistantLog([...next, { from: "bot", text: reply }]);
  };

  const colorVerdict = (v: Decision["verdict"]) =>
    v === "correct" ? "text-primary" : v === "partial" ? "text-accent" : "text-destructive";

  const verdictLabel = (v: Decision["verdict"]) =>
    v === "correct" ? t("CORRECT", "सही") : v === "partial" ? t("PARTIAL", "आंशिक") : t("WRONG", "ग़लत");

  const STAGES: Stage[] = ["recap", "decision", "consequence", "explain", "killchain", "forensics", "phishing", "incident", "score"];
  const STAGE_LABEL: Record<Stage, string> = {
    recap: t("recap", "सारांश"),
    decision: t("decision", "निर्णय"),
    consequence: t("consequence", "परिणाम"),
    explain: t("explain", "व्याख्या"),
    killchain: t("kill-chain", "किल-चेन"),
    forensics: t("forensics", "फॉरेंसिक"),
    phishing: t("phishing", "फ़िशिंग"),
    incident: t("incident", "घटना"),
    score: t("score", "स्कोर"),
  };
  const stageIndex = STAGES.indexOf(stage);
  const goPrev = () => stageIndex > 0 && setStage(STAGES[stageIndex - 1]);
  const goNext = () => stageIndex < STAGES.length - 1 && setStage(STAGES[stageIndex + 1]);

  return (
    <>
      {story && <StoryPopup story={story} onClose={() => setStory(null)} t={t} />}

      <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-background/80 backdrop-blur-sm p-4 sm:p-8 animate-fade-in">
        <div className="w-full max-w-3xl rounded-md border border-primary/40 bg-card/95 shadow-2xl border-glow scanlines">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <span className="text-xs uppercase tracking-widest text-primary text-glow">
              // {t("step", "चरण")} {stageIndex + 1} / {STAGES.length}
          </span>
          <span className="rounded-sm border border-accent/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-accent">
              {loc(scenario.name, lang)}
          </span>
          <button
            onClick={reshuffle}
            className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            ⟲ {t("randomize", "बेतरतीब")}
          </button>
          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span>{t("DAMAGE", "नुकसान")}</span>
              <div className="h-2 w-24 overflow-hidden rounded-sm bg-muted">
              <div
                className="h-full transition-all"
                style={{
                  width: `${damage}%`,
                  background:
                    damage > 60
                      ? "var(--neon-red)"
                      : damage > 30
                        ? "var(--neon-amber)"
                        : "var(--neon-green)",
                }}
              />
            </div>
            <span className="w-8 text-right">{damage}%</span>
          </div>
        </div>

          <div className="h-1 w-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%`, boxShadow: "var(--terminal-glow)" }}
            />
          </div>

          <div className="flex flex-wrap gap-1 px-4 pt-3 text-[10px]">
            {STAGES.map((s, i) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`rounded-sm border px-2 py-0.5 uppercase tracking-widest ${
                  i === stageIndex
                    ? "border-primary bg-primary/10 text-primary text-glow"
                    : i < stageIndex
                      ? "border-primary/40 text-primary/70"
                      : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-6">

        {stage === "recap" && (
          <div className="relative overflow-hidden rounded-lg border border-destructive/50 bg-gradient-to-br from-card/95 via-card/80 to-destructive/10 p-0 backdrop-blur animate-fade-in border-glow">
            {/* Top alert siren bar */}
            <div className="flex items-center gap-2 border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-destructive">
              <span className="inline-flex h-2 w-2 animate-ping rounded-full bg-destructive" />
              <span className="inline-flex h-2 w-2 -ml-3 rounded-full bg-destructive" />
              <span className="font-bold">{t("// LIVE INCIDENT // CODE RED //", "// सक्रिय घटना // कोड रेड //")}</span>
              <span className="ml-auto font-mono text-foreground">{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-destructive/15 blur-3xl" />
            <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
            <div className="relative p-5">
              <div className="mb-4 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-destructive/60 bg-destructive/10 text-3xl shadow-[0_0_30px_rgba(255,0,80,0.3)]">
                  🚨
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-destructive">{t("breach detected", "उल्लंघन पाया गया")}</div>
                  <h3 className="font-mono text-2xl font-black text-foreground text-glow leading-tight">
                    {loc(scenario.name, lang)}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-widest">
                    <span className="rounded-sm border border-destructive/60 bg-destructive/10 px-2 py-0.5 text-destructive">{t("severity: critical", "गंभीरता: गंभीर")}</span>
                    <span className="rounded-sm border border-accent/60 bg-accent/10 px-2 py-0.5 text-accent">{t("status: active", "स्थिति: सक्रिय")}</span>
                    <span className="rounded-sm border border-primary/60 bg-primary/10 px-2 py-0.5 text-primary">{t("you: lead responder", "आप: मुख्य प्रतिक्रियाकर्ता")}</span>
                  </div>
                </div>
              </div>

              {/* Briefing tiles */}
              <div className="mb-4 grid gap-2 sm:grid-cols-2">
                {[
                  { icon: "🎯", k: t("Attack vector", "हमले का प्रकार"), v: loc(scenario.attackType, lang), tone: "destructive" },
                  { icon: "🚪", k: t("Entry point", "प्रवेश बिंदु"), v: loc(scenario.entry, lang), tone: "accent" },
                  { icon: "🔑", k: t("Target credential", "लक्ष्य क्रेडेंशियल"), v: `"${password}"`, tone: "accent" },
                  { icon: "💻", k: t("Systems affected", "प्रभावित सिस्टम"), v: loc(scenario.systems, lang), tone: "primary" },
                ].map((tile, i) => (
                  <div
                    key={i}
                    className={`group rounded-md border bg-background/50 p-2.5 transition-all hover:-translate-y-0.5 ${
                      tile.tone === "destructive" ? "border-destructive/40 hover:border-destructive/70" :
                      tile.tone === "accent" ? "border-accent/40 hover:border-accent/70" :
                      "border-primary/40 hover:border-primary/70"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      <span className="text-lg">{tile.icon}</span>
                      {tile.k}
                    </div>
                    <div className="mt-1 font-mono text-sm text-foreground">{tile.v}</div>
                  </div>
                ))}
              </div>

              {/* Typewriter-style intel feed */}
              <div className="mb-4 rounded-md border border-primary/30 bg-black/40 p-3 font-mono text-xs leading-relaxed text-primary">
                <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  ▌ {t("intel feed", "इंटेल फ़ीड")}
                </div>
                <div className="text-foreground">
                  <span className="text-primary">$</span> tail -f /var/log/incident.log
                </div>
                <div className="mt-1 whitespace-pre-line text-accent">
                  {loc(scenario.recapStory, lang)}
                </div>
                <div className="mt-1 text-primary">
                  &gt; {t("Mission: contain. investigate. recover.", "मिशन: रोकें। जाँचें। ठीक करें।")}<span className="cursor-blink">▌</span>
                </div>
              </div>

              <Button className="w-full border border-primary bg-primary/15 text-primary text-glow hover:bg-primary/25 text-sm uppercase tracking-widest" onClick={() => setStage("decision")}>
                ⚡ {t("take command — make first call", "कमान सँभालें — पहला निर्णय लें")}
              </Button>
            </div>
          </div>
        )}

        {stage === "decision" && (
          <div className="rounded-lg border border-accent/40 bg-gradient-to-br from-card/95 to-accent/5 p-5 backdrop-blur animate-fade-in">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/60 bg-accent/10 text-xl animate-pulse">⚡</div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-accent">{t("decision point", "निर्णय बिंदु")}</div>
                <h3 className="font-mono text-lg font-bold text-foreground text-glow">{t("the next 60 seconds decide everything", "अगले 60 सेकंड सब तय करेंगे")}</h3>
              </div>
              <span className="ml-auto rounded-sm border border-destructive/60 bg-destructive/10 px-2 py-1 font-mono text-xs text-destructive animate-pulse">
                ⏱ {t("CLOCK RUNNING", "घड़ी चल रही")}
              </span>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              {t("Each choice carries hidden cost. Read carefully — wrong moves cascade.", "हर विकल्प की छुपी कीमत है। ध्यान से पढ़ें — ग़लत कदम बढ़ते जाते हैं।")}
            </p>
            <div className="grid gap-2">
              {scenario.decisions.map((d, di) => (
                <button
                  key={d.id}
                  disabled={locked && chosen?.id !== d.id}
                  onClick={() => {
                    setChosen(d);
                    setDamage((x) => Math.min(100, x + d.damage));
                    setStory({
                      title:
                        d.verdict === "correct"
                          ? t("Clean call.", "सही फ़ैसला।")
                          : d.verdict === "partial"
                            ? t("Mixed outcome…", "मिश्रित परिणाम…")
                            : t("Things just got worse.", "हालात और बिगड़ गए।"),
                      body: loc(d.story, lang),
                      tone: d.verdict === "correct" ? "good" : d.verdict === "partial" ? "warn" : "bad",
                    });
                    setStage("consequence");
                  }}
                  className={`group relative w-full overflow-hidden rounded-md border px-3 py-3 text-left transition-all ${
                    chosen?.id === d.id
                      ? "border-primary bg-primary/10 -translate-y-0.5"
                      : "border-border bg-background/40 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5"
                  } disabled:opacity-40 disabled:hover:translate-y-0`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background/60 font-mono text-xs text-primary">
                      {String.fromCharCode(65 + di)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-foreground">{loc(d.label, lang)}</div>
                      <div className="mt-1.5 flex flex-wrap gap-1 text-[9px] uppercase tracking-widest">
                        <span className={`rounded-sm border px-1.5 py-0.5 ${
                          d.damage > 50 ? "border-destructive/60 text-destructive" :
                          d.damage > 20 ? "border-accent/60 text-accent" :
                          "border-primary/60 text-primary"
                        }`}>
                          {t("risk", "जोखिम")}: {d.damage > 50 ? "■■■" : d.damage > 20 ? "■■□" : "■□□"}
                        </span>
                        <span className="rounded-sm border border-border px-1.5 py-0.5 text-muted-foreground">
                          {t("impact", "प्रभाव")}: +{d.damage}%
                        </span>
                      </div>
                    </div>
                    <span className="self-center text-lg text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary">→</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2 text-xs">
              <button
                onClick={() => { setChosen(null); setDamage(0); setLocked(false); }}
                className="rounded-sm border border-border px-3 py-1 uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >↶ {t("undo (learning mode)", "पूर्ववत करें (शिक्षण मोड)")}</button>
              <button
                onClick={() => setLocked(true)}
                className="rounded-sm border border-accent/60 px-3 py-1 uppercase tracking-widest text-accent hover:bg-accent/10"
              >🔒 {t("lock decision (challenge)", "निर्णय लॉक करें (चुनौती)")}</button>
            </div>
          </div>
        )}

        {stage === "consequence" && chosen && (
          <div className={`relative overflow-hidden rounded-lg border-2 ${
            chosen.verdict === "correct" ? "border-primary/60" :
            chosen.verdict === "partial" ? "border-accent/60" :
            "border-destructive/60"
          } bg-card/80 p-0 backdrop-blur animate-scale-in border-glow`}>
            <div className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.25em] ${
              chosen.verdict === "correct" ? "bg-primary/10 text-primary" :
              chosen.verdict === "partial" ? "bg-accent/10 text-accent" :
              "bg-destructive/10 text-destructive"
            }`}>
              <span className="font-bold">// {t("aftermath report", "परिणाम रिपोर्ट")}</span>
              <span className="ml-auto font-mono">T+{chosen.verdict === "wrong" ? "13m" : chosen.verdict === "partial" ? "6m" : "90s"}</span>
            </div>
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-current opacity-10 blur-3xl" />
            <div className="relative p-5">
              <div className="mb-3 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
                <div className={`flex h-20 w-20 items-center justify-center rounded-full border-2 text-5xl ${
                  chosen.verdict === "correct" ? "border-primary bg-primary/10" :
                  chosen.verdict === "partial" ? "border-accent bg-accent/10" :
                  "border-destructive bg-destructive/10 animate-pulse"
                }`}>
                  {chosen.verdict === "correct" ? "✅" : chosen.verdict === "partial" ? "⚠️" : "💥"}
                </div>
                <div>
                  <div className={`text-[10px] uppercase tracking-[0.25em] ${colorVerdict(chosen.verdict)}`}>
                    {t("verdict", "फ़ैसला")}: {verdictLabel(chosen.verdict)}
                  </div>
                  <div className={`mt-1 font-mono text-xl font-bold leading-tight ${colorVerdict(chosen.verdict)}`}>
                    {loc(chosen.outcome, lang)}
                  </div>
                </div>
              </div>

              <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
                {[
                  { k: t("RESPONSE", "प्रतिक्रिया"), v: chosen.verdict === "wrong" ? "13m" : chosen.verdict === "partial" ? "6m" : "90s", icon: "⏱" },
                  { k: t("BLAST", "विस्फोट"), v: `${chosen.damage}%`, icon: "💢" },
                  { k: t("SYSTEMS", "सिस्टम"), v: chosen.damage > 50 ? t("DOWN", "बंद") : t("UP", "चालू"), icon: chosen.damage > 50 ? "🔴" : "🟢" },
                ].map((m, i) => (
                  <div key={i} className="rounded-md border border-border bg-background/60 p-2.5">
                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                      <span>{m.icon}</span>{m.k}
                    </div>
                    <div className={`mt-1 font-mono text-lg font-bold ${colorVerdict(chosen.verdict)}`}>{m.v}</div>
                  </div>
                ))}
              </div>

              {/* Blast radius bar */}
              <div className="mb-3">
                <div className="mb-1 flex justify-between text-[9px] uppercase tracking-widest text-muted-foreground">
                  <span>{t("blast radius", "विस्फोट दायरा")}</span>
                  <span>{chosen.damage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      chosen.damage > 50 ? "bg-destructive" : chosen.damage > 20 ? "bg-accent" : "bg-primary"
                    }`}
                    style={{ width: `${chosen.damage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="rounded-md border border-accent/40 bg-accent/5 p-2.5">
                  <div className="text-[10px] uppercase tracking-widest text-accent">💡 {t("analyst insight", "विश्लेषक अंतर्दृष्टि")}</div>
                  <p className="mt-1 text-xs text-foreground">{loc(chosen.hint, lang)}</p>
                </div>
                <div className="rounded-md border border-border bg-background/40 p-2.5">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">📖 {t("what happened next", "उसके बाद क्या हुआ")}</div>
                  <p className="mt-1 text-xs italic text-foreground">{loc(chosen.story, lang)}</p>
                </div>
              </div>

              <Button className="mt-4 w-full border border-primary bg-primary/15 text-primary text-glow hover:bg-primary/25 text-sm uppercase tracking-widest" onClick={() => setStage("explain")}>
                🔍 {t("dissect the attack", "हमला विच्छेदित करें")}
              </Button>
            </div>
          </div>
        )}

        {stage === "explain" && (
          <div className="rounded-lg border border-primary/40 bg-gradient-to-br from-card/95 to-primary/5 p-5 backdrop-blur animate-fade-in">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/60 bg-primary/10 text-xl">🧬</div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-primary">{t("attack anatomy", "हमले की संरचना")}</div>
                <h3 className="font-mono text-lg font-bold text-foreground">{t("inside the attacker's playbook", "हमलावर की प्लेबुक के अंदर")}</h3>
              </div>
            </div>

            {/* Vertical connected timeline */}
            <ol className="relative space-y-3 border-l-2 border-dashed border-primary/40 pl-6">
              {scenario.attackFlow.map((s, i) => {
                const phases = ["🕵️", "🎯", "🔓", "👻", "💣"];
                const phaseLabels = [
                  t("recon", "टोही"),
                  t("intrude", "घुसपैठ"),
                  t("escalate", "ऊँचा करें"),
                  t("evade", "बचाव"),
                  t("impact", "प्रभाव"),
                ];
                const phaseIdx = Math.min(i, phases.length - 1);
                return (
                  <li key={i} className="relative">
                    <span className="absolute -left-[34px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/60 bg-background text-base shadow-[0_0_15px_rgba(0,200,200,0.3)]">
                      {phases[phaseIdx]}
                    </span>
                    <div className="rounded-md border border-border bg-background/60 p-3 transition hover:border-primary/60 hover:-translate-y-0.5">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded-sm border border-primary/60 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary">
                          {String(i + 1).padStart(2, "0")} · {phaseLabels[phaseIdx]}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-foreground">{loc(s.step, lang)}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{loc(s.detail, lang)}</div>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Defender countermeasures */}
            <div className="mt-5 rounded-md border border-accent/40 bg-accent/5 p-3">
              <h4 className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-accent">
                <span className="text-lg">🛡️</span> {t("defender's playbook — what would've stopped this", "रक्षक की प्लेबुक — क्या इसे रोकता")}
              </h4>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {scenario.fixes.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-sm border border-border bg-background/40 px-2 py-1.5 text-xs text-foreground">
                    <span className="text-primary">✓</span>
                    <span>{loc(f, lang)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button className="mt-4 w-full border border-primary bg-primary/15 text-primary text-glow hover:bg-primary/25 text-sm uppercase tracking-widest" onClick={() => setStage("killchain")}>
              🧩 {t("now you try — rebuild the kill-chain", "अब आप करें — किल-चेन बनाएँ")}
            </Button>
          </div>
        )}

        {stage === "killchain" && (
          <div className="rounded-md border border-primary/40 bg-card/60 p-5 backdrop-blur animate-fade-in">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-widest text-primary text-glow">
                // {t("kill-chain reconstructor", "किल-चेन पुनर्निर्माण")}
              </h3>
              <span className="rounded-sm border border-accent/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-accent">
                {kcOrder.length}/{scenario.attackFlow.length}
              </span>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              🧩 {t(
                "The attack steps below are shuffled. Click them in the order an attacker would actually run them — recon first, impact last. Wrong picks lock in. No second chances.",
                "नीचे के चरण बेतरतीब हैं। हमलावर वास्तव में जिस क्रम में करेगा, उसी क्रम में क्लिक करें — पहले टोही, अंत में प्रभाव।",
              )}
            </p>

            {/* Player's ordered chain */}
            <ol className="mb-4 space-y-1.5">
              {Array.from({ length: scenario.attackFlow.length }).map((_, idx) => {
                const pickedIdx = kcOrder[idx];
                const step = pickedIdx != null ? scenario.attackFlow[pickedIdx] : null;
                const right = pickedIdx != null && pickedIdx === idx;
                const wrong = kcSubmitted && pickedIdx != null && pickedIdx !== idx;
                return (
                  <li
                    key={idx}
                    className={`flex items-center gap-2 rounded-sm border px-2 py-1.5 text-xs ${
                      step
                        ? right
                          ? "border-primary/60 bg-primary/10 text-foreground"
                          : wrong
                            ? "border-destructive/60 bg-destructive/10 text-destructive"
                            : "border-accent/40 bg-accent/5 text-foreground"
                        : "border-dashed border-border text-muted-foreground"
                    }`}
                  >
                    <span className="font-mono text-[10px] text-muted-foreground">{idx + 1}.</span>
                    <span className="flex-1">{step ? loc(step.step, lang) : t("— empty slot —", "— खाली स्थान —")}</span>
                    {kcSubmitted && step && (right ? "✓" : "✗")}
                  </li>
                );
              })}
            </ol>

            {/* Shuffled pool */}
            {!kcSubmitted && (
              <div className="grid gap-2 sm:grid-cols-2">
                {shuffledKc.filter((id) => !kcOrder.includes(id)).map((id) => (
                  <button
                    key={id}
                    onClick={() => setKcOrder([...kcOrder, id])}
                    className="rounded-sm border border-border bg-background/40 px-2 py-1.5 text-left text-xs text-foreground transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5"
                  >
                    → {loc(scenario.attackFlow[id].step, lang)}
                  </button>
                ))}
              </div>
            )}

            {kcSubmitted && (
              <div className="mt-3 space-y-1.5 text-xs">
                {scenario.attackFlow.map((s, i) => (
                  <div key={i} className="rounded-sm border border-border bg-muted/30 p-2">
                    <div className="text-[10px] uppercase tracking-widest text-accent">
                      {t("correct", "सही")} {i + 1}.
                    </div>
                    <div className="font-bold text-foreground">{loc(s.step, lang)}</div>
                    <div className="text-muted-foreground">{loc(s.detail, lang)}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {!kcSubmitted ? (
                <>
                  <Button
                    disabled={kcOrder.length === 0}
                    onClick={() => setKcOrder(kcOrder.slice(0, -1))}
                    variant="outline"
                    className="border-border text-xs uppercase tracking-widest"
                  >↶ {t("undo last", "अंतिम पूर्ववत")}</Button>
                  <Button
                    disabled={kcOrder.length !== scenario.attackFlow.length}
                    onClick={() => {
                      setKcSubmitted(true);
                      const right = kcOrder.filter((id, idx) => id === idx).length;
                      setStory({
                        title: `${t("Kill-chain", "किल-चेन")}: ${right}/${scenario.attackFlow.length}`,
                        body: right === scenario.attackFlow.length
                          ? t("Flawless reconstruction. You'd brief this scenario to executives without a single correction.", "बेदाग पुनर्निर्माण। आप यह परिदृश्य अधिकारियों को बिना सुधार के बता सकते हैं।")
                          : right >= 3
                            ? t("Close — but the order you got wrong is exactly where defenders lose minutes during a real breach.", "करीब — पर जो क्रम ग़लत हुआ, वहीं असली हमले में मिनट खोते हैं।")
                            : t("The attacker doesn't think in your order. Study the kill-chain — recon → access → action.", "हमलावर आपके क्रम में नहीं सोचता। किल-चेन पढ़ें — टोही → प्रवेश → कार्रवाई।"),
                        tone: right === scenario.attackFlow.length ? "good" : right >= 3 ? "warn" : "bad",
                      });
                    }}
                    className="border border-primary bg-primary/10 text-primary hover:bg-primary/20"
                  >{t("submit chain", "चेन जमा करें")}</Button>
                </>
              ) : (
                <Button onClick={() => setStage("forensics")} className="border border-primary bg-primary/10 text-primary hover:bg-primary/20">
                  ▶ {t("threat classifier", "थ्रेट क्लासिफायर")}
                </Button>
              )}
            </div>
          </div>
        )}

        {stage === "forensics" && (
          <div className="rounded-md border border-accent/40 bg-card/60 p-5 backdrop-blur animate-fade-in">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm uppercase tracking-widest text-primary text-glow">
                // {t("threat classifier — MITRE-style triage", "थ्रेट क्लासिफायर — MITRE शैली ट्राइएज")}
              </h3>
              <span className={`rounded-sm border px-2 py-0.5 font-mono text-xs ${forensicsTime <= 15 ? "border-destructive text-destructive animate-pulse" : "border-accent/60 text-accent"}`}>
                ⏱ {String(Math.max(0, forensicsTime)).padStart(2, "0")}s
              </span>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              🔬 {t(
                "For every log line, pick the attacker tactic — or mark it Benign. Wrong category costs more than skipping. The clock is running.",
                "हर लॉग के लिए हमलावर तकनीक चुनें — या सामान्य चिह्नित करें। ग़लत श्रेणी छोड़ने से ज़्यादा महंगी।",
              )}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="p-1 text-left">{t("time", "समय")}</th>
                    <th className="p-1 text-left">{t("ip", "ip")}</th>
                    <th className="p-1 text-left">{t("user", "उपयोगकर्ता")}</th>
                    <th className="p-1 text-left">{t("event", "घटना")}</th>
                    <th className="p-1 text-left">{t("tactic", "तकनीक")}</th>
                  </tr>
                </thead>
                <tbody>
                  {scenario.logs.map((l) => {
                    const expected: Tactic = l.suspicious ? (l.category ?? "Benign") : "Benign";
                    const picked = classify[l.id];
                    const right = classifySubmitted && picked && picked === expected;
                    const wrong = classifySubmitted && picked && picked !== expected;
                    const missed = classifySubmitted && !picked && expected !== "Benign";
                    return (
                      <tr key={l.id} className={`border-t border-border ${right ? "bg-primary/10" : wrong ? "bg-destructive/10" : missed ? "bg-accent/10" : ""}`}>
                        <td className="p-1 text-foreground">{l.time}</td>
                        <td className="p-1 text-foreground">{l.ip}</td>
                        <td className="p-1 text-foreground">{l.user}</td>
                        <td className="p-1 text-muted-foreground">
                          {loc(l.event, lang)}
                          {classifySubmitted && l.suspicious && <span className="text-accent"> — {loc(l.reason, lang)}</span>}
                        </td>
                        <td className="p-1">
                          <select
                            disabled={classifySubmitted}
                            value={picked ?? ""}
                            onChange={(e) => setClassify({ ...classify, [l.id]: e.target.value as Tactic })}
                            className="rounded-sm border border-border bg-input px-1 py-0.5 text-[11px] text-foreground"
                          >
                            <option value="">{t("— pick —", "— चुनें —")}</option>
                            {TACTICS.map((tc) => (
                              <option key={tc} value={tc}>{loc(TACTIC_LABEL[tc], lang)}</option>
                            ))}
                          </select>
                          {classifySubmitted && wrong && (
                            <div className="mt-0.5 text-[10px] text-accent">
                              → {loc(TACTIC_LABEL[expected], lang)}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {!classifySubmitted ? (
                <Button
                  onClick={() => {
                    setClassifySubmitted(true);
                    let cc = 0, cw = 0, miss = 0;
                    scenario.logs.forEach((l) => {
                      const expected: Tactic = l.suspicious ? (l.category ?? "Benign") : "Benign";
                      const picked = classify[l.id];
                      if (picked && picked === expected) cc++;
                      else if (picked && picked !== expected) cw++;
                      else if (!picked && expected !== "Benign") miss++;
                    });
                    setStory({
                      title: `${t("Triage verdict", "ट्राइएज परिणाम")}: ${cc} ✓ / ${cw} ✗ / ${miss} ${t("missed", "छूटे")}`,
                      body: cw === 0 && miss === 0
                        ? t("Every signal mapped to the right tactic. This is exactly how a senior SOC analyst reads a wire.", "हर संकेत सही तकनीक से जुड़ा। यही वरिष्ठ SOC विश्लेषक की पहचान है।")
                        : cw > miss
                          ? t("Too many wrong labels — false categorisation sends responders chasing the wrong playbook.", "बहुत सी ग़लत श्रेणियाँ — टीम ग़लत प्लेबुक के पीछे दौड़ती है।")
                          : t("You hesitated on entries you should have classified. Silence ≠ safety in a live incident.", "जिन्हें वर्गीकृत करना था, उनमें हिचकिचाए। चुप्पी = सुरक्षा नहीं।"),
                      tone: cw === 0 && miss === 0 ? "good" : cw > miss ? "bad" : "warn",
                    });
                  }}
                  className="border border-primary bg-primary/10 text-primary hover:bg-primary/20"
                >{t("submit triage", "ट्राइएज जमा करें")}</Button>
              ) : (
                <Button onClick={() => setStage("phishing")} className="border border-primary bg-primary/10 text-primary hover:bg-primary/20">▶ {t("phishing trainer", "फ़िशिंग प्रशिक्षक")}</Button>
              )}
            </div>
          </div>
        )}

        {stage === "phishing" && (
          <PhishingSimulation
            onComplete={(r) => {
              setPhishVerdict(r.detectionAccuracy >= 0.5 ? "phish" : "real");
              setDamage(Math.max(0, Math.min(100, 100 - r.finalScore)));
              setStage("incident");
            }}
          />
        )}

        {stage === "incident" && (
          <div className="rounded-md border border-border bg-card/60 p-5 backdrop-blur animate-fade-in">
            <h3 className="mb-3 text-sm uppercase tracking-widest text-primary text-glow">// {t("incident response walkthrough", "घटना प्रतिक्रिया गाइड")}</h3>
            <div className="space-y-4">
              {INCIDENT_STEPS.map((step, idx) => (
                <div key={step}>
                  <div className="text-xs uppercase tracking-widest text-accent">{t("step", "चरण")} {idx + 1} — {loc(IR_STEP_LABEL[step], lang)}</div>
                  <div className="mt-1 grid gap-2 sm:grid-cols-2">
                    {irOptions[step].map((opt, i) => {
                      const picked = irChoices[step] === i;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setIrChoices({ ...irChoices, [step]: i });
                            setStory({
                              title: `${loc(IR_STEP_LABEL[step], lang)}: ${opt.correct ? t("good move", "अच्छा कदम") : t("bad move", "ग़लत कदम")}`,
                              body: opt.correct
                                ? t(`Your ${step.toLowerCase()} call buys the team breathing room and a clean path forward.`, `आपका ${loc(IR_STEP_LABEL[step], lang)} फ़ैसला टीम को राहत और साफ़ रास्ता देता है।`)
                                : t(`A wrong ${step.toLowerCase()} step here cascades — every later phase costs more time, money, and trust.`, `यहाँ ${loc(IR_STEP_LABEL[step], lang)} में ग़लत कदम आगे की हर अवस्था में समय, पैसा और भरोसा बढ़ाकर खर्च कराता है।`),
                              tone: opt.correct ? "good" : "bad",
                            });
                          }}
                          className={`rounded-sm border px-2 py-1 text-left text-sm ${picked ? (opt.correct ? "border-primary bg-primary/10 text-primary" : "border-destructive bg-destructive/10 text-destructive") : "border-border hover:bg-muted/40"}`}
                        >
                          {picked && opt.correct ? "✓ " : picked && !opt.correct ? "✗ " : "→ "}{loc(opt.label, lang)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4 border border-primary bg-primary/10 text-primary text-glow hover:bg-primary/20" onClick={() => setStage("score")}>▶ {t("final score", "अंतिम स्कोर")}</Button>
          </div>
        )}

        {stage === "score" && (() => {
          // Classifier accuracy (replaces basic flag-the-row game)
          let correctClass = 0, wrongClass = 0, missedClass = 0;
          const totalSuspicious = scenario.logs.filter(l => l.suspicious).length;
          scenario.logs.forEach((l) => {
            const expected: Tactic = l.suspicious ? (l.category ?? "Benign") : "Benign";
            const picked = classify[l.id];
            if (picked && picked === expected) correctClass++;
            else if (picked && picked !== expected) wrongClass++;
            else if (!picked && expected !== "Benign") missedClass++;
          });
          const kcTotal = scenario.attackFlow.length;
          const irCorrect = INCIDENT_STEPS.filter(k => { const i = irChoices[k]; return i != null && irOptions[k][i].correct; }).length;
          const phishRight = phishVerdict != null && ((phishVerdict === "phish") === scenario.phish.isPhish);

          // ── Gamified Badges ──
          const badges: { icon: string; en: string; hi: string; earned: boolean }[] = [
            { icon: "🎯", en: "First Responder", hi: "प्रथम प्रतिक्रिया", earned: chosen?.verdict === "correct" },
            { icon: "🕵️", en: "Tactic Analyst", hi: "तकनीक विश्लेषक", earned: totalSuspicious > 0 && correctClass === totalSuspicious && wrongClass === 0 },
            { icon: "⛓️", en: "Chain Architect", hi: "चेन वास्तुकार", earned: kcCorrectCount === kcTotal && kcSubmitted },
            { icon: "🎣", en: "Phish Slayer", hi: "फ़िश-संहारक", earned: phishRight },
            { icon: "🛡️", en: "Containment Pro", hi: "रोकथाम विशेषज्ञ", earned: irCorrect >= 3 },
            { icon: "💎", en: "Zero Damage", hi: "शून्य नुकसान", earned: damage === 0 },
            { icon: "👑", en: "Perfect Run", hi: "सटीक रन", earned: score >= 95 },
          ];
          const earnedCount = badges.filter(b => b.earned).length;

          // ── Subsystem dashboards ──
          const subs = [
            { en: "Decision", hi: "निर्णय", pct: chosen?.verdict === "correct" ? 100 : chosen?.verdict === "partial" ? 50 : chosen ? 10 : 0 },
            { en: "Kill-Chain", hi: "किल-चेन", pct: kcTotal ? Math.round((kcCorrectCount / kcTotal) * 100) : 0 },
            { en: "Triage", hi: "ट्राइएज", pct: totalSuspicious ? Math.round((correctClass / totalSuspicious) * 100) - wrongClass * 12 : 0 },
            { en: "Phishing", hi: "फ़िशिंग", pct: phishRight ? 100 : phishVerdict != null ? 0 : 0 },
            { en: "Response", hi: "प्रतिक्रिया", pct: Math.round((irCorrect / 4) * 100) },
            { en: "Containment", hi: "रोकथाम", pct: Math.max(0, 100 - damage) },
          ].map(s => ({ ...s, pct: Math.max(0, Math.min(100, s.pct)) }));

          // ── Replay timeline ──
          const timeline: { icon: string; tone: "good" | "warn" | "bad" | "muted"; title: string; detail: string }[] = [
            chosen ? {
              icon: chosen.verdict === "correct" ? "✓" : chosen.verdict === "partial" ? "~" : "✗",
              tone: chosen.verdict === "correct" ? "good" : chosen.verdict === "partial" ? "warn" : "bad",
              title: `${t("Decision", "निर्णय")}: ${loc(chosen.label, lang)}`,
              detail: `${verdictLabel(chosen.verdict)} · +${chosen.damage}% ${t("damage", "नुकसान")}`,
            } : { icon: "·", tone: "muted" as const, title: t("Decision skipped", "निर्णय छोड़ा"), detail: "—" },
            {
              icon: kcSubmitted ? (kcCorrectCount === kcTotal ? "✓" : kcCorrectCount >= 3 ? "~" : "✗") : "·",
              tone: !kcSubmitted ? "muted" : kcCorrectCount === kcTotal ? "good" : kcCorrectCount >= 3 ? "warn" : "bad",
              title: t("Kill-chain reconstruction", "किल-चेन पुनर्निर्माण"),
              detail: `${kcCorrectCount}/${kcTotal} ${t("steps in order", "क्रम में चरण")}`,
            },
            {
              icon: classifySubmitted ? (wrongClass === 0 && missedClass === 0 ? "✓" : correctClass > 0 ? "~" : "✗") : "·",
              tone: !classifySubmitted ? "muted" : wrongClass === 0 && missedClass === 0 ? "good" : correctClass > 0 ? "warn" : "bad",
              title: t("Threat classification", "थ्रेट वर्गीकरण"),
              detail: `${correctClass} ✓ · ${wrongClass} ✗ · ${missedClass} ${t("missed", "छूटे")}`,
            },
            {
              icon: phishVerdict == null ? "·" : phishRight ? "✓" : "✗",
              tone: phishVerdict == null ? "muted" : phishRight ? "good" : "bad",
              title: t("Phishing verdict", "फ़िशिंग निर्णय"),
              detail: phishVerdict == null ? "—" : `${phishVerdict.toUpperCase()} · ${t("actual was", "वास्तविक")} ${scenario.phish.isPhish ? "PHISH" : "REAL"}`,
            },
            {
              icon: irCorrect === 4 ? "✓" : irCorrect >= 2 ? "~" : "✗",
              tone: irCorrect === 4 ? "good" : irCorrect >= 2 ? "warn" : "bad",
              title: t("Incident response", "घटना प्रतिक्रिया"),
              detail: `${irCorrect}/4 ${t("steps correct", "चरण सही")}`,
            },
          ];

          // ── Threat Report download ──
          const downloadReport = () => {
            const ts = new Date().toISOString().replace(/[:.]/g, "-");
            const line = "═".repeat(60);
            const body = [
              line,
              `  BREACH_LAB — INCIDENT REPORT`,
              `  Generated: ${new Date().toLocaleString()}`,
              line,
              ``,
              `SCENARIO:    ${loc(scenario.name, lang)}`,
              `ATTACK:      ${loc(scenario.attackType, lang)}`,
              `ENTRY:       ${loc(scenario.entry, lang)}`,
              `SYSTEMS:     ${loc(scenario.systems, lang)}`,
              ``,
              line,
              `  RESPONDER SCORE: ${score} / 100   RANK: ${rankIconFor(score)} ${rankFor(score, lang)}`,
              `  BADGES EARNED:   ${earnedCount} / ${badges.length}`,
              line,
              ``,
              `── PERFORMANCE BREAKDOWN ──`,
              ...subs.map(s => {
                const filled = Math.round(s.pct / 5);
                return `  ${s.en.padEnd(14)} [${"█".repeat(filled)}${"░".repeat(20 - filled)}] ${s.pct}%`;
              }),
              ``,
              `── REPLAY TIMELINE ──`,
              ...timeline.map((e, i) => `  ${i + 1}. [${e.icon}] ${e.title}\n     ${e.detail}`),
              ``,
              `── BADGES ──`,
              ...badges.map(b => `  ${b.earned ? "✓" : "·"} ${b.icon}  ${b.en}`),
              ``,
              `── RECOMMENDED FIXES ──`,
              ...scenario.fixes.map(f => `  → ${loc(f, lang)}`),
              ``,
              line,
              `  This is a training exercise. No real systems were touched.`,
              line,
            ].join("\n");
            const blob = new Blob([body], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `breach-lab-report-${ts}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(t("Report downloaded", "रिपोर्ट डाउनलोड हो गई"));
          };

          const copyReport = async () => {
            try {
              await navigator.clipboard.writeText(
                `Breach_Lab — ${rankFor(score, lang)} (${score}/100) · ${earnedCount}/${badges.length} badges · ${loc(scenario.name, lang)}`,
              );
              toast.success(t("Summary copied", "सारांश कॉपी हुआ"));
            } catch { /* ignore */ }
          };

          const downloadPDF = () => {
            const doc = new jsPDF({ unit: "pt", format: "a4" });
            const W = doc.internal.pageSize.getWidth();
            let y = 50;
            const line = (s: string, size = 10, bold = false, color: [number, number, number] = [30, 30, 40]) => {
              doc.setFont("helvetica", bold ? "bold" : "normal");
              doc.setFontSize(size);
              doc.setTextColor(...color);
              const wrapped = doc.splitTextToSize(s, W - 80);
              wrapped.forEach((w: string) => {
                if (y > 780) { doc.addPage(); y = 50; }
                doc.text(w, 40, y);
                y += size + 4;
              });
            };
            const rule = () => {
              if (y > 780) { doc.addPage(); y = 50; }
              doc.setDrawColor(0, 180, 200);
              doc.line(40, y, W - 40, y);
              y += 12;
            };
            // Header band
            doc.setFillColor(15, 18, 40);
            doc.rect(0, 0, W, 70, "F");
            doc.setTextColor(0, 230, 230);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.text("BREACH_LAB", 40, 35);
            doc.setFontSize(11);
            doc.setTextColor(240, 100, 200);
            doc.text("Incident Threat Report", 40, 55);
            doc.setTextColor(180, 180, 180);
            doc.setFontSize(9);
            doc.text(new Date().toLocaleString(), W - 200, 35);
            y = 100;

            line(`SCENARIO: ${loc(scenario.name, lang)}`, 12, true, [10, 10, 30]);
            line(`Attack: ${loc(scenario.attackType, lang)}`);
            line(`Entry:  ${loc(scenario.entry, lang)}`);
            line(`Systems: ${loc(scenario.systems, lang)}`);
            y += 8; rule();

            // Severity summary
            const severity = score >= 75 ? "LOW" : score >= 50 ? "MEDIUM" : score >= 25 ? "HIGH" : "CRITICAL";
            const sevColor: [number, number, number] = score >= 75 ? [0, 160, 90] : score >= 50 ? [220, 160, 0] : score >= 25 ? [220, 80, 40] : [200, 0, 0];
            line(`Responder Score: ${score} / 100`, 14, true);
            line(`Rank: ${rankFor(score, lang)}`, 11);
            line(`Severity: ${severity}`, 13, true, sevColor);
            line(`Damage taken: ${damage}%`);
            line(`Badges earned: ${earnedCount} / ${badges.length}`);
            y += 8; rule();

            line("PERFORMANCE BREAKDOWN", 12, true);
            subs.forEach((s) => {
              const filled = Math.round(s.pct / 5);
              line(`${(lang === "hi" ? s.hi : s.en).padEnd(14)}  [${"#".repeat(filled)}${".".repeat(20 - filled)}] ${s.pct}%`, 9);
            });
            y += 6; rule();

            line("REPLAY TIMELINE", 12, true);
            timeline.forEach((e, i) => {
              line(`${i + 1}. [${e.icon}] ${e.title}`, 10, true);
              line(`   ${e.detail}`, 9, false, [80, 80, 90]);
            });
            y += 6; rule();

            line("BADGES", 12, true);
            badges.forEach((b) => line(`${b.earned ? "[x]" : "[ ]"} ${b.icon} ${lang === "hi" ? b.hi : b.en}`, 10));
            y += 6; rule();

            line("RECOMMENDED FIXES", 12, true);
            scenario.fixes.forEach((f) => line(`- ${loc(f, lang)}`, 10));
            y += 10;
            line("Training exercise only. No real systems were touched.", 9, false, [120, 120, 130]);

            doc.save(`breach-lab-report-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.pdf`);
            toast.success(t("PDF report downloaded", "PDF रिपोर्ट डाउनलोड हुई"));
          };

          const toneColor = (tone: "good" | "warn" | "bad" | "muted") =>
            tone === "good" ? "border-primary/60 text-primary"
            : tone === "warn" ? "border-accent/60 text-accent"
            : tone === "bad" ? "border-destructive/60 text-destructive"
            : "border-border text-muted-foreground";

          return (
            <div className="space-y-5 animate-fade-in">
              {/* Hero score */}
              <div className="relative overflow-hidden rounded-lg border border-primary/50 bg-gradient-to-br from-card/90 via-card/70 to-primary/10 p-6 backdrop-blur border-glow">
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
                <div className="relative grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
                  <div className="text-center">
                    <div className="text-6xl">{rankIconFor(score)}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-accent">{rankFor(score, lang)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">// {t("responder score", "रिस्पॉन्डर स्कोर")}</div>
                    <div className="flex items-end gap-2">
                      <div className="font-mono text-7xl font-black text-primary text-glow-strong leading-none">{score}</div>
                      <div className="pb-2 text-xl text-muted-foreground">/ 100</div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-sm bg-muted">
                      <div
                        className="h-full bg-gradient-to-r from-accent via-primary to-primary transition-all"
                        style={{ width: `${score}%`, boxShadow: "var(--terminal-glow)" }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      🏆 {earnedCount} / {badges.length} {t("badges earned", "बैज प्राप्त")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subsystem dashboard */}
              <div className="rounded-md border border-border bg-card/60 p-5 backdrop-blur">
                <h4 className="mb-3 text-xs uppercase tracking-widest text-primary text-glow">// {t("performance dashboard", "प्रदर्शन डैशबोर्ड")}</h4>
                <div className="space-y-2">
                  {subs.map((s) => (
                    <div key={s.en} className="flex items-center gap-3 text-xs">
                      <span className="w-24 shrink-0 uppercase tracking-widest text-muted-foreground">{lang === "hi" ? s.hi : s.en}</span>
                      <div className="relative h-4 flex-1 overflow-hidden rounded-sm border border-border bg-background/40">
                        <div
                          className={`h-full transition-all ${s.pct >= 75 ? "bg-primary" : s.pct >= 40 ? "bg-accent" : "bg-destructive"}`}
                          style={{ width: `${s.pct}%`, boxShadow: s.pct >= 75 ? "var(--terminal-glow)" : undefined }}
                        />
                        <span className="absolute inset-0 flex items-center justify-end px-2 font-mono text-[10px] text-foreground/80">{s.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="rounded-md border border-border bg-card/60 p-5 backdrop-blur">
                <h4 className="mb-3 text-xs uppercase tracking-widest text-accent">// {t("badges", "बैज")}</h4>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {badges.map((b) => (
                    <div
                      key={b.en}
                      className={`group relative flex flex-col items-center rounded-md border p-2 text-center transition-all ${
                        b.earned
                          ? "border-primary/60 bg-primary/10 text-foreground hover:-translate-y-0.5 border-glow"
                          : "border-border/40 bg-background/20 text-muted-foreground opacity-50"
                      }`}
                      title={lang === "hi" ? b.hi : b.en}
                    >
                      <div className={`text-3xl ${b.earned ? "" : "grayscale"}`}>{b.icon}</div>
                      <div className="mt-1 text-[9px] uppercase tracking-widest leading-tight">{lang === "hi" ? b.hi : b.en}</div>
                      {b.earned && (
                        <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary text-glow" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Replay timeline */}
              <div className="rounded-md border border-border bg-card/60 p-5 backdrop-blur">
                <h4 className="mb-3 text-xs uppercase tracking-widest text-primary text-glow">// {t("interactive replay timeline", "इंटरैक्टिव रीप्ले टाइमलाइन")}</h4>
                <ol className="relative space-y-3 border-l-2 border-border pl-5">
                  {timeline.map((e, i) => (
                    <li key={i} className="relative">
                      <span className={`absolute -left-[28px] flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background font-mono text-[10px] font-bold ${toneColor(e.tone)}`}>
                        {e.icon}
                      </span>
                      <div className={`rounded-sm border bg-background/40 p-2 ${toneColor(e.tone)}`}>
                        <div className="text-xs font-bold uppercase tracking-widest">{e.title}</div>
                        <div className="text-[11px] text-muted-foreground">{e.detail}</div>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 text-[10px] text-muted-foreground">
                  {t(
                    "Each step branches. Replay with different choices to see how outcomes change.",
                    "हर कदम शाखाओं में बँटता है। अलग-अलग विकल्पों के साथ दोबारा खेलें।",
                  )}
                </p>
              </div>

              {/* Learning hub */}
              <div className="rounded-md border border-border bg-card/60 p-5 backdrop-blur">
                <h4 className="mb-2 text-xs uppercase tracking-widest text-accent">// {t("learning hub — recommended for you", "लर्निंग हब — आपके लिए सुझाव")}</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {(chosen?.verdict !== "correct") && <li>📘 {t("Incident response basics — 1 min", "घटना प्रतिक्रिया मूल बातें — 1 मिनट")}</li>}
                  {!phishRight && <li>📘 {t("Spotting phishing emails — 1 min", "फ़िशिंग ईमेल पहचानना — 1 मिनट")}</li>}
                  {correctClass < 2 && <li>📘 {t("Mapping events to MITRE tactics — 2 min", "घटनाओं को MITRE तकनीकों से जोड़ना — 2 मिनट")}</li>}
                  {kcCorrectCount < kcTotal && <li>📘 {t("Reading the cyber kill-chain — 2 min", "साइबर किल-चेन समझना — 2 मिनट")}</li>}
                  <li>📘 {t("Password security & MFA — 1 min", "पासवर्ड सुरक्षा और MFA — 1 मिनट")}</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={downloadReport} className="border border-primary bg-primary/10 text-primary text-glow hover:bg-primary/20">
                  📄 {t("download threat report", "थ्रेट रिपोर्ट डाउनलोड करें")}
                </Button>
                <Button onClick={downloadPDF} className="border border-accent bg-accent/10 text-accent hover:bg-accent/20">
                  🧾 {t("export styled PDF", "स्टाइल PDF निर्यात")}
                </Button>
                <Button onClick={copyReport} variant="outline" className="border-accent/60 text-accent hover:bg-accent/10">
                  📋 {t("share summary", "सारांश साझा करें")}
                </Button>
                <Button className="border border-primary bg-primary/10 text-primary text-glow hover:bg-primary/20" onClick={reshuffle}>
                  🎲 {t("new randomized scenario", "नया बेतरतीब परिदृश्य")}
                </Button>
                <Button variant="outline" className="border-border" onClick={onRestart}>
                  ↻ {t("run another simulation", "और सिमुलेशन चलाएँ")}
                </Button>
              </div>
            </div>
          );
        })()}

        <p className="text-center text-xs text-muted-foreground">
          ⚠ {t("Educational only — no real exploitation. Focus: awareness, detection, prevention, response.", "केवल शैक्षिक — कोई वास्तविक शोषण नहीं। ध्यान: जागरूकता, पहचान, रोकथाम, प्रतिक्रिया।")}
        </p>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            disabled={stageIndex === 0}
            onClick={goPrev}
            className="border-border text-xs uppercase tracking-widest"
          >
            ← {t("back", "वापस")}
          </Button>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {STAGE_LABEL[STAGES[stageIndex]]}
          </div>
          {stageIndex < STAGES.length - 1 ? (
            <Button
              onClick={goNext}
              className="border border-primary bg-primary/10 text-primary text-glow hover:bg-primary/20 text-xs uppercase tracking-widest"
            >
              {t("next", "अगला")}: {STAGE_LABEL[STAGES[stageIndex + 1]]} →
            </Button>
          ) : (
            <Button
              onClick={onRestart}
              className="border border-primary bg-primary/10 text-primary text-glow hover:bg-primary/20 text-xs uppercase tracking-widest"
            >
              ↻ {t("finish", "समाप्त")}
            </Button>
          )}
        </div>
          </div>
        </div>
      </div>

      <aside className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
        <div className="rounded-md border border-border border-glow bg-card/80 backdrop-blur">
          <button onClick={() => setAssistantOpen(!assistantOpen)} className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-xs uppercase tracking-widest text-primary text-glow">
            🤖 {t("threat assistant", "थ्रेट असिस्टेंट")}
            <span className="text-muted-foreground">{assistantOpen ? "−" : "+"}</span>
          </button>
          {assistantOpen && (
            <div className="p-3">
              <div className="mb-2 max-h-56 space-y-2 overflow-y-auto text-xs">
                {assistantLog.map((m, i) => (
                  <div key={i} className={m.from === "bot" ? "text-primary" : "text-foreground"}>
                    <span className="text-muted-foreground">{m.from === "bot" ? "bot>" : "you>"}</span> {m.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendAssistant()}
                  placeholder={t("ask for a hint...", "संकेत माँगें...")}
                  className="h-8 border-border bg-input text-xs"
                />
                <Button size="sm" onClick={sendAssistant} className="border border-primary bg-primary/10 text-primary hover:bg-primary/20">{t("send", "भेजें")}</Button>
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">{t("try", "आज़माएँ")}: "hint", "phishing", "logs", "ransom"</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
