import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, type LogLine } from "./Terminal";
import { PasswordStrengthMeter, analyzePassword } from "./PasswordStrength";
import { PostSimulation } from "./PostSimulation";
import { PasswordHistory, recordPasswordCheck } from "./PasswordHistory";
import { PasswordAlternatives } from "./PasswordAlternatives";
import { useLang } from "@/lib/i18n";

const CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";

function randomGuess(len: number) {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return out;
}

function randomIp() {
  return `${rand(10, 250)}.${rand(0, 255)}.${rand(0, 255)}.${rand(0, 255)}`;
}
function rand(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

export function Simulator() {
  const { t, lang } = useLang();
  const [password, setPassword] = useState("");
  const [lines, setLines] = useState<LogLine[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const idRef = useRef(0);
  const cancelRef = useRef(false);

  const push = useCallback((text: string, type?: LogLine["type"]) => {
    idRef.current += 1;
    setLines((prev) => [...prev, { id: idRef.current, text, type }]);
  }, []);

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      const start = Date.now();
      const tick = () => {
        if (cancelRef.current) return resolve();
        if (Date.now() - start >= ms) return resolve();
        requestAnimationFrame(tick);
      };
      tick();
    });

  const reset = () => {
    cancelRef.current = true;
    setRunning(false);
    setLines([]);
    setProgress(0);
    setCompleted(false);
  };

  const start = async () => {
    if (!password) return;
    cancelRef.current = false;
    setLines([]);
    setProgress(0);
    setRunning(true);
    setCompleted(false);
    recordPasswordCheck(password, lang);

    const ip = randomIp();
    const strength = analyzePassword(password, lang);
    const tryWord = t("trying", "कोशिश");

    push(t(`> initializing payload...`, `> पेलोड शुरू किया जा रहा है...`), "system");
    await sleep(300);
    push(t(`> spoofing source IP: ${ip}`, `> स्रोत IP स्पूफ किया जा रहा है: ${ip}`), "system");
    await sleep(250);
    push(t(`> connecting to target.host:22 ...`, `> target.host:22 से कनेक्ट किया जा रहा है ...`), "system");
    await sleep(400);
    push(t(`✓ handshake complete. session established.`, `✓ हैंडशेक पूरा। सत्र स्थापित।`), "info");
    await sleep(300);
    push(t(`> launching brute-force module (dictionary + random)`, `> ब्रूट-फोर्स मॉड्यूल चालू (डिक्शनरी + रैंडम)`), "warn");
    push(`──────────────────────────────────────────────`, "system");
    await sleep(200);

    // Accuracy: a weak password should LOOK like it cracks in fewer tries;
    // a fortress should chew through many visible guesses before "breaking".
    // Map zxcvbn score 0..4 → 6, 18, 50, 120, 240 visible guesses.
    const guessTable = [6, 18, 50, 120, 240];
    const totalGuesses = guessTable[strength.score] ?? 20;
    // Stronger passwords also feel slower per-guess (deeper search).
    const baseDelay = 30 + strength.score * 18;
    push(
      t(
        `# estimated guesses needed (visualized): ${totalGuesses.toLocaleString()}`,
        `# अनुमानित आवश्यक प्रयास (दृश्य): ${totalGuesses.toLocaleString()}`,
      ),
      "system",
    );

    for (let i = 0; i < totalGuesses; i++) {
      if (cancelRef.current) {
        push(t(`! aborted by user`, `! उपयोगकर्ता द्वारा रद्द`), "error");
        setRunning(false);
        return;
      }
      const guess = randomGuess(password.length);
      push(`${tryWord}: ${guess.padEnd(20)} ✗`, "guess");
      setProgress(((i + 1) / (totalGuesses + 1)) * 100);
      await sleep(baseDelay);
    }

    if (cancelRef.current) return;

    for (let i = 1; i <= password.length; i++) {
      const partial = password.slice(0, i) + randomGuess(password.length - i);
      push(`${tryWord}: ${partial.padEnd(20)} ${i === password.length ? "✓" : "~"}`, i === password.length ? "success" : "guess");
      await sleep(80);
    }

    setProgress(100);
    push(`──────────────────────────────────────────────`, "system");
    await sleep(200);
    push(t(`✓ MATCH FOUND: "${password}"`, `✓ मिलान मिला: "${password}"`), "success");
    push(t(`✓ ACCESS GRANTED`, `✓ पहुँच प्राप्त`), "success");
    push(``);
    push(t(`# Real-world crack time: ${strength.crackTime}`, `# वास्तविक क्रैक समय: ${strength.crackTime}`), "system");
    push(t(`# Strength rating: ${strength.label} (${strength.entropy.toFixed(1)} bits)`, `# मजबूती रेटिंग: ${strength.label} (${strength.entropy.toFixed(1)} बिट्स)`), "system");
    if (strength.score < 3) {
      push(t(`! WARNING: This password would be cracked quickly by a real attacker.`, `! चेतावनी: इस पासवर्ड को असली हमलावर तुरंत तोड़ सकता है।`), "error");
      push(t(`  → Use 12+ characters mixing upper, lower, numbers and symbols.`, `  → 12+ अक्षर — बड़े, छोटे, संख्या और चिह्न मिलाकर रखें।`), "warn");
    } else {
      push(t(`✓ Strong password. A real brute-force attempt would be impractical.`, `✓ मज़बूत पासवर्ड। असली ब्रूट-फोर्स हमला व्यावहारिक रूप से असंभव।`), "success");
    }
    setRunning(false);
    setCompleted(true);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <div className="space-y-6">
        <div className="rounded-md border border-border bg-card/60 p-5 backdrop-blur">
          <label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
            &gt; {t("target_password", "लक्ष्य_पासवर्ड")}
          </label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("enter a password to attack...", "हमले के लिए पासवर्ड दर्ज करें...")}
            disabled={running}
            className="h-12 border-border bg-input font-mono text-base text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary"
          />
          <div className="mt-4">
            <PasswordStrengthMeter password={password} />
          </div>

          <div className="mt-5 flex gap-2">
            <Button
              onClick={start}
              disabled={!password || running}
              className="flex-1 border border-primary bg-primary/10 font-bold uppercase tracking-widest text-primary text-glow hover:bg-primary/20 disabled:opacity-40"
            >
              {running ? t("▶ attacking...", "▶ हमला जारी...") : t("▶ start simulation", "▶ सिमुलेशन शुरू करें")}
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              className="border-border bg-transparent uppercase tracking-widest text-muted-foreground hover:bg-muted"
            >
              {t("reset", "रीसेट")}
            </Button>
          </div>

          <div className="mt-4">
            <PasswordAlternatives password={password} onPick={setPassword} />
          </div>

          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>{t("PROGRESS", "प्रगति")}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-sm bg-muted">
              <div
                className="h-full bg-primary transition-all duration-150"
                style={{
                  width: `${progress}%`,
                  boxShadow: progress > 0 ? "var(--terminal-glow)" : undefined,
                }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card/60 p-5 backdrop-blur">
          <h3 className="mb-3 text-xs uppercase tracking-widest text-primary">
            // {t("why this matters", "यह क्यों मायने रखता है")}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="text-foreground">→</span>{" "}
              {t("Attackers use GPUs that try", "हमलावर GPU से प्रति सेकंड")}{" "}
              <span className="text-accent">{t("10+ billion", "10+ अरब")}</span>{" "}
              {t("guesses per second.", "अनुमान आज़माते हैं।")}
            </li>
            <li>
              <span className="text-foreground">→</span>{" "}
              {t("Adding length matters more than complexity.", "लंबाई बढ़ाना जटिलता से अधिक मायने रखता है।")}
            </li>
            <li>
              <span className="text-foreground">→</span>{" "}
              {t("Reusing passwords across sites multiplies the risk.", "हर साइट पर एक ही पासवर्ड दोहराने से जोखिम कई गुना बढ़ जाता है।")}
            </li>
            <li>
              <span className="text-foreground">→</span>{" "}
              {t("Use a password manager + 2FA wherever possible.", "जहाँ संभव हो पासवर्ड मैनेजर + 2FA का उपयोग करें।")}
            </li>
          </ul>
        </div>

        <PasswordHistory onPick={setPassword} />
      </div>

      <Terminal lines={lines} running={running} />
      {completed && (
        <div className="lg:col-span-2">
          <PostSimulation password={password} onRestart={reset} />
        </div>
      )}
    </div>
  );
}
