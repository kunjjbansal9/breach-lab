import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

/* ══════════════════════════════════════════════════════════════
   SOCIAL ENGINEERING DECISION SIMULATION
   Narrative-driven, adaptive, consequence-based phishing trainer.
   ══════════════════════════════════════════════════════════════ */

type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type Channel = "email" | "sms" | "chat";
type ActionId =
  | "open_link"
  | "download"
  | "reply"
  | "verify_sender"
  | "report"
  | "ignore";

type Tactic = {
  phrase: string;          // exact substring in body
  name: string;            // tactic label
  explain: string;         // psychology explanation
};

type ActionOutcome = {
  safe: boolean;
  scoreDelta: number;
  headline: string;
  detail: string;
};

type Scenario = {
  id: string;
  difficulty: Difficulty;
  channel: Channel;
  senderName: string;
  senderHandle: string;     // email / phone / username
  avatarColor: string;      // tailwind utility hint
  timestamp: string;
  subject?: string;
  body: string;             // plain text — tactic phrases highlighted automatically
  link?: { label: string; href: string };
  attachment?: { name: string; size: string };
  isPhish: boolean;
  tactics: Tactic[];
  redFlags: string[];       // what a sharp analyst would catch
  outcomes: Partial<Record<ActionId, ActionOutcome>>;
  assistantHints: string[]; // contextual nudges
};

/* ────────────── SCENARIO LIBRARY ────────────── */

const SCENARIOS: Scenario[] = [
  /* ── BEGINNER ── */
  {
    id: "bank-alert",
    difficulty: "BEGINNER",
    channel: "email",
    senderName: "HDFC Bank Alerts",
    senderHandle: "secure-alerts@hdfc-verify.support",
    avatarColor: "var(--neon-red)",
    timestamp: "Today, 02:14",
    subject: "URGENT: Unusual login detected — verify within 2 hours",
    body:
      "Dear Customer,\n\nWe detected an unusual login from a new device. Your account will be permanently suspended in 2 hours unless you verify your identity immediately. Do not share this with anyone — this is a confidential security matter.\n\nClick the secure link below to confirm your details now.",
    link: { label: "Verify my account", href: "https://hdfc-verify.support/login" },
    isPhish: true,
    tactics: [
      { phrase: "URGENT", name: "Urgency", explain: "Forces instant action so you skip critical thinking." },
      { phrase: "permanently suspended in 2 hours", name: "Fear of loss", explain: "Threat of irreversible damage triggers panic decisions." },
      { phrase: "Do not share this", name: "Isolation", explain: "Stops you from asking a colleague who might spot the scam." },
      { phrase: "verify your identity immediately", name: "Authority pressure", explain: "Mimics a trusted institution issuing a command." },
    ],
    redFlags: [
      "Domain is hdfc-verify.support — banks never use lookalike TLDs.",
      "Sent at 02:14 — banks don't trigger account suspension at night.",
      "Generic 'Dear Customer' — real bank emails use your name.",
    ],
    outcomes: {
      open_link: { safe: false, scoreDelta: -20, headline: "Credentials exposed", detail: "Cloned login page captured your username + password. Attacker is replaying them across 6 other banks right now." },
      reply:     { safe: false, scoreDelta: -8,  headline: "You confirmed you're a live target", detail: "Replying tells the attacker the address is monitored. Expect more sophisticated follow-ups." },
      report:    { safe: true,  scoreDelta: 25, headline: "Reported to SOC", detail: "The phishing domain was added to the gateway blocklist within minutes — protecting 10k+ employees." },
      verify_sender: { safe: true, scoreDelta: 15, headline: "Sender mismatch confirmed", detail: "WHOIS shows hdfc-verify.support was registered 6 hours ago in a country HDFC doesn't operate from." },
      ignore:    { safe: true,  scoreDelta: 5,  headline: "Threat avoided — but not neutralised", detail: "You stayed safe, but other employees still received the same email. Reporting would have stopped the campaign." },
    },
    assistantHints: [
      "Look at the sender domain carefully — does it really belong to your bank?",
      "Real banks never threaten to suspend your account in 2 hours.",
      "When in doubt, open your banking app directly — never via an email link.",
    ],
  },
  {
    id: "delivery-scam",
    difficulty: "BEGINNER",
    channel: "sms",
    senderName: "DHL Express",
    senderHandle: "+91-808-441-2233",
    avatarColor: "var(--neon-amber)",
    timestamp: "Today, 11:02",
    body:
      "DHL: Your package #IN884712 is held at customs. Pay a small fee of ₹49 to release shipment. Tap the link to settle now: https://dhl-in.tracking-pay.shop/release",
    link: { label: "Pay ₹49 release fee", href: "https://dhl-in.tracking-pay.shop/release" },
    isPhish: true,
    tactics: [
      { phrase: "small fee of ₹49", name: "Lowered guard", explain: "A trivial amount makes you skip the usual fraud checks." },
      { phrase: "held at customs", name: "Plausible scenario", explain: "Sounds bureaucratic and routine — exploits familiarity." },
    ],
    redFlags: [
      "Real couriers send tracking links to dhl.com, not .shop domains.",
      "Customs fees are paid to government portals, not via SMS link.",
      "SMS sender is a personal mobile number, not a verified shortcode.",
    ],
    outcomes: {
      open_link: { safe: false, scoreDelta: -22, headline: "Card details harvested", detail: "The page asked for full card + CVV + OTP. The 'fee' was ₹49 — but the same form charged ₹89,000 at a luxury site abroad." },
      ignore:    { safe: true,  scoreDelta: 10, headline: "Smart call", detail: "You weren't expecting a delivery — and unexpected = suspicious." },
      report:    { safe: true,  scoreDelta: 22, headline: "Reported to 1930 cybercrime helpline", detail: "Your report contributed to a takedown notice issued for the malicious domain." },
      verify_sender: { safe: true, scoreDelta: 12, headline: "Number flagged", detail: "Reverse lookup shows the number is unregistered and previously linked to fraud reports." },
      reply:     { safe: false, scoreDelta: -6, headline: "Attacker confirmed you're reachable", detail: "Expect a follow-up call from a 'DHL agent' walking you through the payment." },
    },
    assistantHints: [
      "Were you actually expecting a parcel? If not, default to suspicion.",
      "Hover the link — the domain ends in .shop, not .dhl.com.",
    ],
  },

  /* ── INTERMEDIATE ── */
  {
    id: "internship-offer",
    difficulty: "INTERMEDIATE",
    channel: "email",
    senderName: "Priya Mehta — Google India Talent",
    senderHandle: "priya.mehta@google-careers-in.com",
    avatarColor: "var(--neon-amber)",
    timestamp: "Yesterday, 18:47",
    subject: "Selected: Google STEP Internship 2026 — onboarding form",
    body:
      "Hi,\n\nCongratulations! You've been shortlisted for the Google STEP Internship 2026 based on your public profile. To confirm your slot, please fill the attached onboarding form and submit your Aadhaar + PAN scan within 24 hours. Slots are limited — only 12 left.\n\nLooking forward to onboarding you.\n\nPriya Mehta\nTalent Acquisition, Google India",
    attachment: { name: "Google_STEP_Onboarding_2026.docm", size: "412 KB" },
    isPhish: true,
    tactics: [
      { phrase: "Congratulations", name: "Reward bait", explain: "Excitement bypasses skepticism — you want it to be real." },
      { phrase: "only 12 left", name: "Scarcity", explain: "Manufactured scarcity rushes you past verification." },
      { phrase: "Aadhaar + PAN scan", name: "Identity harvest", explain: "Real recruiters never collect government IDs at first contact." },
      { phrase: "within 24 hours", name: "Urgency", explain: "Compresses the timeline so you don't research the role." },
    ],
    redFlags: [
      "Domain google-careers-in.com is not owned by Google.",
      ".docm attachment carries macros — Google never sends these.",
      "You never applied to STEP; cold-shortlisting is not how it works.",
    ],
    outcomes: {
      download:  { safe: false, scoreDelta: -28, headline: "Malware payload downloaded", detail: "The macro fetched a remote-access trojan. Your webcam, files and saved passwords are now reachable from a server in another country." },
      open_link: { safe: false, scoreDelta: -15, headline: "Phishing portal logged your details", detail: "A fake 'Google careers' portal recorded everything you typed." },
      reply:     { safe: false, scoreDelta: -6,  headline: "Conversation hijack started", detail: "The 'recruiter' is now building rapport over chat — a long-con setup." },
      report:    { safe: true,  scoreDelta: 25, headline: "Campaign disrupted", detail: "Your report helped the placement cell warn 4,000+ students within the same evening." },
      verify_sender: { safe: true, scoreDelta: 18, headline: "Domain spoof confirmed", detail: "Google Careers always uses google.com — anything else is suspicious." },
      ignore:    { safe: true,  scoreDelta: 6,  headline: "You stayed safe", detail: "But peers are still getting the same email. Reporting helps everyone." },
    },
    assistantHints: [
      "Did you actually apply for this role? Cold offers are almost always scams.",
      "Check the domain: real Google emails come from @google.com.",
      "Macro-enabled (.docm) attachments from strangers — never open.",
    ],
  },
  {
    id: "otp-request",
    difficulty: "INTERMEDIATE",
    channel: "chat",
    senderName: "Bank Support",
    senderHandle: "@official_kyc_support",
    avatarColor: "var(--neon-amber)",
    timestamp: "Just now",
    body:
      "Hello, this is RBI-authorised KYC support. Your KYC will expire today. We've sent an OTP to your number — please share it here so we can complete the re-KYC. This is a secure verified channel.",
    isPhish: true,
    tactics: [
      { phrase: "RBI-authorised", name: "False authority", explain: "Invokes a regulator to manufacture trust." },
      { phrase: "share it here", name: "Direct credential request", explain: "No legitimate org ever asks you to share an OTP." },
      { phrase: "secure verified channel", name: "Reassurance framing", explain: "Telling you it's 'secure' is a manipulation, not proof." },
      { phrase: "expire today", name: "Urgency", explain: "Time pressure prevents you from calling the bank to verify." },
    ],
    redFlags: [
      "RBI never contacts customers directly for KYC.",
      "OTPs are NEVER to be shared — that line is on every bank SMS.",
      "Username @official_kyc_support has no verification badge.",
    ],
    outcomes: {
      reply:     { safe: false, scoreDelta: -30, headline: "Account drained", detail: "Sharing the OTP authorised a UPI mandate of ₹98,500. The transfer cleared in 11 seconds." },
      ignore:    { safe: true,  scoreDelta: 12, headline: "Trust your instincts", detail: "Every bank tells you the same thing: never share an OTP. You followed it." },
      report:    { safe: true,  scoreDelta: 22, headline: "Reported to 1930", detail: "The cybercrime portal flagged the handle for takedown." },
      verify_sender: { safe: true, scoreDelta: 15, headline: "Imposter confirmed", detail: "Calling your bank's official number confirmed they never initiated this conversation." },
    },
    assistantHints: [
      "Stop. No real bank — and definitely not the RBI — will ever ask for an OTP.",
      "If they invoke a regulator, that's a red flag, not a green one.",
    ],
  },

  /* ── ADVANCED ── */
  {
    id: "ceo-bec",
    difficulty: "ADVANCED",
    channel: "email",
    senderName: "Anjali Rao (CEO)",
    senderHandle: "anjali.rao@yourco-mail.co",
    avatarColor: "var(--neon-green)",
    timestamp: "Today, 14:38",
    subject: "Quick — discreet wire to close the Bengaluru deal",
    body:
      "Hey,\n\nI'm in the middle of a board call so I can't talk on the phone. I need you to discreetly process a wire of ₹14,80,000 to a new vendor account today — it's tied to the Bengaluru acquisition we discussed last week. I'll loop in legal afterwards.\n\nKeep this between us until close — public knowledge could move the deal price.\n\nSent from my iPhone\nAnjali",
    isPhish: true,
    tactics: [
      { phrase: "discreetly", name: "Secrecy compulsion", explain: "Asks you to bypass the colleagues who would otherwise spot the fraud." },
      { phrase: "I can't talk on the phone", name: "Out-of-band block", explain: "Removes the easiest verification path — voice." },
      { phrase: "Keep this between us", name: "Authority + secrecy", explain: "Combines hierarchy pressure with isolation." },
      { phrase: "Sent from my iPhone", name: "Casual cover", explain: "Mobile signature explains away grammatical or process oddities." },
    ],
    redFlags: [
      "Domain is yourco-mail.co — close, but not yourco.com.",
      "No project codename, no vendor ID, no CFO in copy.",
      "Asks for secrecy — a red flag in any corporate process.",
    ],
    outcomes: {
      reply:     { safe: false, scoreDelta: -18, headline: "Attacker now coaching you", detail: "They'll send 'banking instructions' next, walk you through the wire, and apply more time pressure." },
      open_link: { safe: false, scoreDelta: -12, headline: "Tracking pixel triggered", detail: "Confirmed your inbox is live and read in real-time. The next email will be even more targeted." },
      verify_sender: { safe: true, scoreDelta: 25, headline: "BEC neutralised", detail: "You called the CEO's known mobile. She's not on a board call — and she didn't send this email." },
      report:    { safe: true,  scoreDelta: 22, headline: "Treasury freeze in time", detail: "Finance flagged the new vendor account; banking partners blocked the transfer template." },
      ignore:    { safe: false, scoreDelta: -4, headline: "Risk left active", detail: "Ignoring a CEO impersonation lets the attacker try someone else in finance." },
    },
    assistantHints: [
      "Would the real CEO bypass finance and legal to wire money? No corporate process works this way.",
      "Verify out-of-band — call her on a number you already had, not one in the email.",
      "The domain ends in .co, not .com. One letter, six-figure consequences.",
    ],
  },
  {
    id: "ai-clone-voice",
    difficulty: "ADVANCED",
    channel: "chat",
    senderName: "Rohit (Cousin)",
    senderHandle: "+44-7-447-91-2240",
    avatarColor: "var(--neon-red)",
    timestamp: "Today, 23:11",
    body:
      "bhaiya it's me rohit, my phone got stolen in london — using my friend's. i'm stuck at the airport, please send ₹40,000 to this UPI id quickly: rescue.rohit@okicici i'll pay back tomorrow. don't tell mom she'll panic. calling you in 2 min from this number.",
    isPhish: true,
    tactics: [
      { phrase: "it's me rohit", name: "Familiarity claim", explain: "Asserted identity exploits emotional shortcuts — you want it to be him." },
      { phrase: "phone got stolen", name: "Plausible distress", explain: "Explains the unknown number AND prevents normal verification." },
      { phrase: "don't tell mom", name: "Isolation", explain: "Cuts off the family member who would catch the inconsistency." },
      { phrase: "calling you in 2 min", name: "Urgency + AI voice prep", explain: "Sets up a deepfake voice call to reinforce the lie." },
    ],
    redFlags: [
      "UPI handle is generic 'rescue.*' — clearly a mule account.",
      "An unknown +44 number with personal claims should always be verified.",
      "Tone shift: real Rohit doesn't write like this.",
    ],
    outcomes: {
      reply:     { safe: false, scoreDelta: -10, headline: "Engagement deepens the trap", detail: "An AI-cloned voice will call you in seconds. The voice will sound exactly like Rohit." },
      open_link: { safe: false, scoreDelta: -25, headline: "UPI authorisation page opened", detail: "₹40,000 left your account in under 6 seconds. UPI is irreversible." },
      verify_sender: { safe: true, scoreDelta: 28, headline: "Cousin is fine", detail: "You called Rohit's actual number. He's at home in Pune. The whole story was synthetic." },
      ignore:    { safe: true,  scoreDelta: 10, headline: "Right call", detail: "An unknown number with an emotional money request — default to suspicion." },
      report:    { safe: true,  scoreDelta: 18, headline: "Reported on chakshu.gov.in", detail: "The number and UPI id were submitted to the DoT fraud portal." },
    },
    assistantHints: [
      "Voice can be cloned from 3 seconds of audio. Trust process, not vibes.",
      "Always call back on a number you already have saved — never the new one.",
      "Ask a question only the real person would know — but only on a verified channel.",
    ],
  },
];

/* ────────────── ACTIONS METADATA ────────────── */

const ACTIONS: { id: ActionId; label: string; icon: string; vibe: "danger" | "neutral" | "safe" }[] = [
  { id: "open_link",     label: "Open Link",        icon: "🔗", vibe: "danger"  },
  { id: "download",      label: "Download Attachment", icon: "📎", vibe: "danger" },
  { id: "reply",         label: "Reply",            icon: "↩",  vibe: "neutral" },
  { id: "verify_sender", label: "Verify Sender",    icon: "🔍", vibe: "safe"    },
  { id: "report",        label: "Report Scam",      icon: "🚩", vibe: "safe"    },
  { id: "ignore",        label: "Ignore Message",   icon: "🚫", vibe: "neutral" },
];

/* ────────────── HELPERS ────────────── */

function highlight(body: string, tactics: Tactic[]) {
  // split body into nodes around tactic phrases
  let nodes: Array<{ text: string; tactic?: Tactic }> = [{ text: body }];
  tactics.forEach((t) => {
    const next: typeof nodes = [];
    nodes.forEach((n) => {
      if (n.tactic) { next.push(n); return; }
      const i = n.text.indexOf(t.phrase);
      if (i === -1) { next.push(n); return; }
      if (i > 0) next.push({ text: n.text.slice(0, i) });
      next.push({ text: t.phrase, tactic: t });
      const rest = n.text.slice(i + t.phrase.length);
      if (rest) next.push({ text: rest });
    });
    nodes = next;
  });
  return nodes;
}

function rank(score: number) {
  if (score >= 90) return { label: "CYBER GUARDIAN", tone: "text-primary" };
  if (score >= 70) return { label: "ANALYST",        tone: "text-primary" };
  if (score >= 50) return { label: "AWARE",          tone: "text-accent"  };
  if (score >= 25) return { label: "AT RISK",        tone: "text-accent"  };
  return            { label: "VULNERABLE",          tone: "text-destructive" };
}

/* ────────────── COMPONENT ────────────── */

type Phase = "intro" | "message" | "decision" | "consequence" | "report";

export type PhishingResult = {
  finalScore: number;        // 0..100
  detectionAccuracy: number; // 0..1
  safeChoices: number;
  riskyChoices: number;
};

export function PhishingSimulation({
  difficulty = "BEGINNER",
  onComplete,
}: {
  difficulty?: Difficulty;
  onComplete?: (r: PhishingResult) => void;
}) {
  const { t } = useLang();
  const [diff, setDiff] = useState<Difficulty>(difficulty);
  const queue = useMemo(
    () => SCENARIOS.filter((s) => s.difficulty === diff),
    [diff],
  );
  const [idx, setIdx] = useState(0);
  const scenario = queue[idx];

  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState(70);
  const [scoreFlash, setScoreFlash] = useState<"up" | "down" | null>(null);
  const [chosen, setChosen] = useState<ActionId | null>(null);
  const [revealedTactics, setRevealedTactics] = useState<Set<string>>(new Set());
  const [hintIdx, setHintIdx] = useState(0);
  const [history, setHistory] = useState<Array<{ scenarioId: string; action: ActionId; safe: boolean }>>([]);

  // reset per scenario
  useEffect(() => {
    setPhase("intro");
    setChosen(null);
    setRevealedTactics(new Set());
    setHintIdx(0);
  }, [idx, diff]);

  // scoreFlash auto-clear
  useEffect(() => {
    if (!scoreFlash) return;
    const t = setTimeout(() => setScoreFlash(null), 900);
    return () => clearTimeout(t);
  }, [scoreFlash]);

  if (!scenario) {
    return (
      <div className="rounded-md border border-border bg-card/60 p-5 text-sm text-muted-foreground">
        {t("No scenarios available for this difficulty.", "इस कठिनाई स्तर के लिए कोई परिदृश्य उपलब्ध नहीं।")}
      </div>
    );
  }

  const applyAction = (a: ActionId) => {
    const outcome = scenario.outcomes[a];
    if (!outcome) return;
    setChosen(a);
    setScore((s) => {
      const next = Math.max(0, Math.min(100, s + outcome.scoreDelta));
      setScoreFlash(outcome.scoreDelta >= 0 ? "up" : "down");
      return next;
    });
    setHistory((h) => [...h, { scenarioId: scenario.id, action: a, safe: outcome.safe }]);
    setPhase("consequence");
  };

  const nextScenario = () => {
    if (idx + 1 < queue.length) {
      setIdx(idx + 1);
    } else {
      setPhase("report");
    }
  };

  const finishAndReport = () => {
    const safeChoices = history.filter((h) => h.safe).length;
    const riskyChoices = history.length - safeChoices;
    const detectionAccuracy = history.length ? safeChoices / history.length : 0;
    onComplete?.({ finalScore: score, detectionAccuracy, safeChoices, riskyChoices });
  };

  const channelBadge =
    scenario.channel === "email" ? "EMAIL"
    : scenario.channel === "sms" ? "SMS"
    : "CHAT";

  return (
    <div className="rounded-md border border-border bg-card/60 p-5 backdrop-blur animate-fade-in space-y-4">
      {/* ── header strip ── */}
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-sm uppercase tracking-widest text-primary text-glow">
          // {t("social engineering decision sim", "सोशल इंजीनियरिंग निर्णय सिम")}
        </h3>
        <span className="rounded-sm border border-accent/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-accent">
          {t("scenario", "परिदृश्य")} {idx + 1} / {queue.length}
        </span>
        <span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
          {scenario.difficulty}
        </span>

        {/* difficulty selector */}
        <div className="ml-auto flex items-center gap-1">
          {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => { setDiff(d); setIdx(0); setHistory([]); setScore(70); }}
              className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-widest transition ${
                diff === d
                  ? "border-primary bg-primary/10 text-primary text-glow"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* ── live score ── */}
      <div className="rounded-sm border border-border bg-background/40 p-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
          <span>{t("Cyber Awareness Score", "साइबर जागरूकता स्कोर")}</span>
          <span className={rank(score).tone + " text-glow"}>{rank(score).label}</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-sm bg-muted">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${score}%`,
                background:
                  score >= 70 ? "var(--neon-green)" :
                  score >= 40 ? "var(--neon-amber)" : "var(--neon-red)",
                boxShadow: "var(--terminal-glow)",
              }}
            />
          </div>
          <div
            className={`w-14 text-right font-mono text-lg ${
              scoreFlash === "up" ? "text-primary text-glow" :
              scoreFlash === "down" ? "text-destructive text-glow" :
              "text-foreground"
            }`}
          >
            {score}/100
          </div>
        </div>
      </div>

      {/* ══════ INTRO ══════ */}
      {phase === "intro" && (
        <div className="rounded-sm border border-accent/40 bg-background/40 p-4">
          <div className="text-xs uppercase tracking-widest text-accent">// briefing</div>
          <p className="mt-2 text-sm text-foreground">
            A new {channelBadge.toLowerCase()} just landed. Investigate it like a real analyst —
            inspect the sender, hover the link, identify manipulation tactics.
            Your decision will have <span className="text-primary">real consequences</span>.
          </p>
          <p className="mt-2 text-xs italic text-muted-foreground">
            Threat Assistant: "{scenario.assistantHints[0]}"
          </p>
          <Button
            onClick={() => setPhase("message")}
            className="mt-3 border border-primary bg-primary/10 text-primary hover:bg-primary/20"
          >
            ▶ open {channelBadge.toLowerCase()}
          </Button>
        </div>
      )}

      {/* ══════ MESSAGE / DECISION ══════ */}
      {(phase === "message" || phase === "decision") && (
        <>
          {/* realistic message UI */}
          <div className="overflow-hidden rounded-sm border border-border bg-background/70 shadow-inner">
            {/* client chrome */}
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>{channelBadge} client</span>
              <span>{scenario.timestamp}</span>
            </div>

            {/* sender row */}
            <div className="flex items-center gap-3 border-b border-border px-3 py-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-background"
                style={{ background: scenario.avatarColor }}
              >
                {scenario.senderName.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-foreground">{scenario.senderName}</div>
                <div className="truncate font-mono text-xs text-muted-foreground">
                  {scenario.senderHandle}
                </div>
              </div>
            </div>

            {/* subject (email only) */}
            {scenario.subject && (
              <div className="border-b border-border px-3 py-2 text-sm text-foreground">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">subject </span>
                {scenario.subject}
              </div>
            )}

            {/* body with manipulation highlights */}
            <div className="px-3 py-3 text-sm leading-relaxed text-foreground whitespace-pre-line">
              {highlight(scenario.body, scenario.tactics).map((node, i) =>
                node.tactic ? (
                  <button
                    key={i}
                    onClick={() => {
                      setRevealedTactics((p) => new Set(p).add(node.tactic!.name));
                    }}
                    title={`${node.tactic.name} — click to analyze`}
                    className={`relative rounded-sm px-1 transition ${
                      revealedTactics.has(node.tactic.name)
                        ? "bg-destructive/30 text-destructive border border-destructive/60"
                        : "bg-destructive/10 text-destructive underline decoration-destructive/60 decoration-dotted underline-offset-4 hover:bg-destructive/20 animate-pulse"
                    }`}
                  >
                    {node.text}
                  </button>
                ) : (
                  <span key={i}>{node.text}</span>
                )
              )}
            </div>

            {/* link */}
            {scenario.link && (
              <div className="border-t border-border bg-background/30 px-3 py-2 text-xs">
                <span className="text-muted-foreground">link preview: </span>
                <span className="font-mono text-destructive">{scenario.link.href}</span>
              </div>
            )}

            {/* attachment */}
            {scenario.attachment && (
              <div className="flex items-center gap-2 border-t border-border bg-background/30 px-3 py-2 text-xs">
                <span>📎</span>
                <span className="font-mono text-foreground">{scenario.attachment.name}</span>
                <span className="text-muted-foreground">({scenario.attachment.size})</span>
                <span className="ml-auto rounded-sm border border-destructive/60 px-1 text-[10px] uppercase tracking-widest text-destructive">
                  macro-enabled
                </span>
              </div>
            )}
          </div>

          {/* manipulation tactic panel */}
          {revealedTactics.size > 0 && (
            <div className="rounded-sm border border-destructive/40 bg-destructive/5 p-3">
              <div className="text-xs uppercase tracking-widest text-destructive">
                // manipulation tactics detected
              </div>
              <ul className="mt-2 space-y-1 text-xs">
                {scenario.tactics
                  .filter((t) => revealedTactics.has(t.name))
                  .map((t) => (
                    <li key={t.name}>
                      <span className="text-destructive">▸ {t.name}:</span>{" "}
                      <span className="text-foreground">{t.explain}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* assistant hint */}
          <div className="rounded-sm border border-accent/40 bg-accent/5 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-widest text-accent">// threat assistant</span>
              <button
                onClick={() => setHintIdx((i) => (i + 1) % scenario.assistantHints.length)}
                className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                next hint →
              </button>
            </div>
            <p className="mt-1 italic text-foreground">"{scenario.assistantHints[hintIdx]}"</p>
          </div>

          {/* action grid */}
          <div>
            <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              → choose your action
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {ACTIONS.map((a) => {
                const enabled = !!scenario.outcomes[a.id]
                  && (a.id !== "open_link" || !!scenario.link)
                  && (a.id !== "download" || !!scenario.attachment);
                if (!enabled) return null;
                const cls =
                  a.vibe === "danger"
                    ? "border-destructive/60 text-destructive hover:bg-destructive/10"
                    : a.vibe === "safe"
                      ? "border-primary/60 text-primary hover:bg-primary/10"
                      : "border-border text-foreground hover:bg-muted/40";
                return (
                  <button
                    key={a.id}
                    onClick={() => applyAction(a.id)}
                    className={`rounded-sm border px-3 py-2 text-left text-sm transition ${cls}`}
                  >
                    <span className="mr-2">{a.icon}</span>{a.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ══════ CONSEQUENCE ══════ */}
      {phase === "consequence" && chosen && scenario.outcomes[chosen] && (
        <div className="space-y-3">
          <div
            className={`rounded-sm border p-4 ${
              scenario.outcomes[chosen]!.safe
                ? "border-primary bg-primary/10"
                : "border-destructive bg-destructive/10"
            }`}
          >
            <div className={`text-xs uppercase tracking-widest ${
              scenario.outcomes[chosen]!.safe ? "text-primary" : "text-destructive"
            }`}>
              {scenario.outcomes[chosen]!.safe ? "// safe outcome" : "// breach simulated"}
            </div>
            <h4 className={`mt-1 text-base font-bold text-glow ${
              scenario.outcomes[chosen]!.safe ? "text-primary" : "text-destructive"
            }`}>
              {scenario.outcomes[chosen]!.headline}
            </h4>
            <p className="mt-2 text-sm text-foreground">{scenario.outcomes[chosen]!.detail}</p>
            <div className="mt-2 text-xs">
              Score change:{" "}
              <span className={scenario.outcomes[chosen]!.scoreDelta >= 0 ? "text-primary" : "text-destructive"}>
                {scenario.outcomes[chosen]!.scoreDelta >= 0 ? "+" : ""}
                {scenario.outcomes[chosen]!.scoreDelta}
              </span>
            </div>
          </div>

          {/* full debrief */}
          <div className="rounded-sm border border-border bg-background/40 p-3">
            <div className="text-xs uppercase tracking-widest text-accent">// red flags you should have seen</div>
            <ul className="mt-2 space-y-1 text-xs text-foreground">
              {scenario.redFlags.map((f, i) => (
                <li key={i}>▸ {f}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-sm border border-border bg-background/40 p-3">
            <div className="text-xs uppercase tracking-widest text-accent">// attack psychology</div>
            <ul className="mt-2 space-y-1 text-xs">
              {scenario.tactics.map((t) => (
                <li key={t.name}>
                  <span className="text-destructive">▸ {t.name}:</span>{" "}
                  <span className="text-foreground">{t.explain}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={nextScenario}
              className="border border-primary bg-primary/10 text-primary hover:bg-primary/20"
            >
              {idx + 1 < queue.length ? "▶ next scenario" : "▶ generate report"}
            </Button>
          </div>
        </div>
      )}

      {/* ══════ FINAL REPORT ══════ */}
      {phase === "report" && (
        <div className="space-y-4">
          <div className="rounded-sm border border-primary/60 bg-background/40 p-5 text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              cyber defense rating
            </div>
            <div className="mt-1 text-5xl font-bold text-primary text-glow-strong">{score}</div>
            <div className={`mt-1 text-sm uppercase tracking-widest ${rank(score).tone}`}>
              {rank(score).label}
            </div>
          </div>

          {/* stat grid */}
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <Stat label="Phishing detection accuracy" value={`${Math.round((history.filter(h => h.safe).length / Math.max(1, history.length)) * 100)}%`} />
            <Stat label="Safe decisions" value={`${history.filter(h => h.safe).length} / ${history.length}`} />
            <Stat label="Risky / impulsive actions" value={`${history.filter(h => !h.safe).length}`} />
            <Stat label="Verification behaviour" value={`${history.filter(h => h.action === "verify_sender").length}× used`} />
            <Stat label="Reporting behaviour" value={`${history.filter(h => h.action === "report").length}× reported`} />
            <Stat label="Difficulty completed" value={diff} />
          </div>

          {/* personalised insights */}
          <div className="rounded-sm border border-border bg-background/40 p-3 text-xs">
            <div className="uppercase tracking-widest text-accent">// personalised insights</div>
            <ul className="mt-2 space-y-1 text-foreground">
              {history.some(h => h.action === "verify_sender")
                ? <li className="text-primary">✓ Strong verification habit — you check before you act.</li>
                : <li className="text-destructive">✗ You rarely verified the sender — make this your default reflex.</li>}
              {history.some(h => h.action === "report")
                ? <li className="text-primary">✓ Good reporting reflex — you protect others, not just yourself.</li>
                : <li className="text-accent">~ Few reports filed — reporting kills the campaign for everyone.</li>}
              {history.some(h => h.action === "open_link" || h.action === "download")
                ? <li className="text-destructive">✗ Impulsive clicks detected — slow down on urgency-laden messages.</li>
                : <li className="text-primary">✓ Strong resistance to bait links and attachments.</li>}
              {history.some(h => h.action === "reply")
                ? <li className="text-accent">~ Replies confirm you're a live target — engage less, verify more.</li>
                : <li className="text-primary">✓ You avoided engaging with attackers directly.</li>}
            </ul>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              className="border-border"
              onClick={() => { setIdx(0); setHistory([]); setScore(70); setPhase("intro"); }}
            >
              ↻ retry simulation
            </Button>
            <Button
              onClick={finishAndReport}
              className="border border-primary bg-primary/10 text-primary text-glow hover:bg-primary/20"
            >
              ▶ continue to incident response
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-background/30 p-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-foreground">{value}</div>
    </div>
  );
}