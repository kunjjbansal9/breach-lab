import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { u as useLang, L as LanguageSwitcher } from "./router-CmgP9Fjy.js";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "@tanstack/react-router";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
function Terminal({ lines, running }) {
  const { t } = useLang();
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [lines]);
  const colorFor = (type) => {
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
  return /* @__PURE__ */ jsxs("div", { className: "scanlines rounded-md border border-border border-glow bg-card/80 backdrop-blur", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border px-4 py-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "h-3 w-3 rounded-full bg-destructive" }),
        /* @__PURE__ */ jsx("span", { className: "h-3 w-3 rounded-full bg-accent" }),
        /* @__PURE__ */ jsx("span", { className: "h-3 w-3 rounded-full bg-primary" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "/dev/tty — bruteforce.sh" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: running ? /* @__PURE__ */ jsxs("span", { className: "text-primary", children: [
        "● ",
        t("LIVE", "लाइव")
      ] }) : /* @__PURE__ */ jsxs("span", { children: [
        "○ ",
        t("IDLE", "निष्क्रिय")
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref,
        className: "relative z-0 h-80 overflow-y-auto px-4 py-3 text-sm leading-relaxed",
        children: [
          lines.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { className: "text-primary", children: "root@simulator" }),
            ":~$",
            " ",
            /* @__PURE__ */ jsx("span", { className: "cursor-blink", children: "▊" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 opacity-60", children: [
              "# ",
              t("Awaiting target. Enter a password and press START SIMULATION.", "लक्ष्य की प्रतीक्षा। पासवर्ड दर्ज करें और START SIMULATION दबाएँ।")
            ] })
          ] }) : lines.map((l) => /* @__PURE__ */ jsx("div", { className: `whitespace-pre-wrap ${colorFor(l.type)}`, children: l.text }, l.id)),
          running && /* @__PURE__ */ jsx("span", { className: "text-primary cursor-blink", children: "▊" })
        ]
      }
    )
  ] });
}
let zxcvbnConfigured = false;
function configureZxcvbn() {
  if (zxcvbnConfigured) return;
  zxcvbnOptions.setOptions({
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary
    }
  });
  zxcvbnConfigured = true;
}
const LABEL_HI = ["खाली", "बहुत कमज़ोर", "कमज़ोर", "ठीक-ठाक", "मज़बूत", "किला"];
const LABEL_EN = ["EMPTY", "VERY WEAK", "WEAK", "FAIR", "STRONG", "FORTRESS"];
function analyzePassword(pw, lang = "en") {
  if (!pw) {
    return {
      score: 0,
      label: lang === "hi" ? LABEL_HI[0] : LABEL_EN[0],
      entropy: 0,
      crackTime: "—",
      crackTimeFast: "—",
      crackTimeOnline: "—",
      color: "text-muted-foreground"
    };
  }
  configureZxcvbn();
  const result = zxcvbn(pw);
  const guesses = Math.max(result.guesses, 1);
  const entropy = Math.log2(guesses);
  const crackTime = formatTime(guesses / 1e4, lang);
  const crackTimeFast = formatTime(guesses / 1e10, lang);
  const crackTimeOnline = formatTime(guesses / (100 / 3600), lang);
  const score = result.score;
  const labels = lang === "hi" ? LABEL_HI.slice(1) : LABEL_EN.slice(1);
  const colors = [
    "text-destructive",
    "text-destructive",
    "text-accent",
    "text-primary",
    "text-primary text-glow"
  ];
  return {
    score,
    label: labels[score],
    entropy,
    crackTime,
    crackTimeFast,
    crackTimeOnline,
    color: colors[score],
    warning: result.feedback.warning || void 0,
    suggestions: result.feedback.suggestions
  };
}
function formatTime(seconds, lang = "en") {
  const t = (e, h) => lang === "hi" ? h : e;
  if (seconds < 1e-3) return t("instantly", "तुरंत");
  if (seconds < 1) return `${(seconds * 1e3).toFixed(0)} ${t("ms", "मिलीसेकंड")}`;
  if (seconds < 60) return `${seconds.toFixed(1)} ${t("seconds", "सेकंड")}`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} ${t("minutes", "मिनट")}`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} ${t("hours", "घंटे")}`;
  if (seconds < 31536e3) return `${(seconds / 86400).toFixed(1)} ${t("days", "दिन")}`;
  const years = seconds / 31536e3;
  if (years < 1e3) return `${years.toFixed(1)} ${t("years", "साल")}`;
  if (years < 1e6) return `${(years / 1e3).toFixed(1)} ${t("thousand years", "हज़ार साल")}`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)} ${t("million years", "लाख साल")}`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)} ${t("billion years", "अरब साल")}`;
  return `${(years / 1e12).toExponential(1)} ${t("trillion years", "खरब साल")}`;
}
function PasswordStrengthMeter({ password }) {
  const { lang, t } = useLang();
  const s = useMemo(() => analyzePassword(password, lang), [password, lang]);
  const bars = [0, 1, 2, 3, 4];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: bars.map((i) => /* @__PURE__ */ jsx(
      "div",
      {
        className: `h-2 flex-1 rounded-sm transition-all ${i < s.score ? s.score >= 3 ? "bg-primary border-glow" : s.score === 2 ? "bg-accent" : "bg-destructive" : "bg-muted"}`
      },
      i
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs", children: [
      /* @__PURE__ */ jsx("span", { className: `font-bold tracking-widest ${s.color}`, children: s.label }),
      /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
        t("ENTROPY", "एन्ट्रॉपी"),
        ": ",
        /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
          s.entropy.toFixed(1),
          " ",
          t("bits", "बिट्स")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
      t("Crack time", "क्रैक समय"),
      " ",
      /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
        "(",
        t("slow hash, bcrypt-like", "धीमा हैश, bcrypt-जैसा"),
        ")"
      ] }),
      ":",
      " ",
      /* @__PURE__ */ jsx("span", { className: `font-bold ${s.color}`, children: s.crackTime })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
      "⚡ ",
      t("Worst-case GPU rig (10B/s)", "सबसे ख़राब GPU (10अरब/सेकंड)"),
      ": ",
      /* @__PURE__ */ jsx("span", { className: "text-accent", children: s.crackTimeFast }),
      " · ",
      "🌐 ",
      t("Throttled online", "थ्रॉटल्ड ऑनलाइन"),
      ": ",
      /* @__PURE__ */ jsx("span", { className: "text-primary", children: s.crackTimeOnline })
    ] }),
    s.warning && /* @__PURE__ */ jsxs("div", { className: "text-xs text-destructive", children: [
      "⚠ ",
      s.warning
    ] }),
    s.suggestions && s.suggestions.length > 0 && /* @__PURE__ */ jsx("ul", { className: "space-y-0.5 text-xs text-muted-foreground", children: s.suggestions.map((sg, i) => /* @__PURE__ */ jsxs("li", { children: [
      "→ ",
      sg
    ] }, i)) })
  ] });
}
const L = (en, hi) => ({ en, hi });
const loc = (s, lang) => {
  if (s == null) return "";
  if (typeof s === "string") return s;
  return s[lang];
};
const TACTICS = [
  "Benign",
  "Recon",
  "InitialAccess",
  "PrivEsc",
  "Persistence",
  "DefenseEvasion",
  "Lateral",
  "C2",
  "Exfiltration",
  "Impact"
];
const TACTIC_LABEL = {
  Benign: L("Benign", "सामान्य"),
  Recon: L("Reconnaissance", "टोही"),
  InitialAccess: L("Initial Access", "प्रारंभिक प्रवेश"),
  PrivEsc: L("Privilege Escalation", "विशेषाधिकार वृद्धि"),
  Persistence: L("Persistence", "स्थायित्व"),
  DefenseEvasion: L("Defense Evasion", "रक्षा चोरी"),
  Lateral: L("Lateral Movement", "पार्श्व गति"),
  C2: L("Command & Control", "कमांड & नियंत्रण"),
  Exfiltration: L("Exfiltration", "डेटा चोरी"),
  Impact: L("Impact / Destruction", "विनाश")
};
const DECISIONS_BRUTE = [
  {
    id: "isolate",
    label: L("Isolate the affected machine from the network", "प्रभावित मशीन को नेटवर्क से अलग करें"),
    verdict: "correct",
    damage: 5,
    outcome: L("✓ Threat contained. Lateral movement blocked.", "✓ खतरा रोका गया। पार्श्व-गति अवरुद्ध।"),
    hint: L("Containment first — stop spread before investigating.", "पहले रोकथाम — जाँच से पहले फैलाव रोकें।"),
    story: L("You yank the ethernet cable. The attacker's shell freezes mid-command. Silence — for now.", "आपने ईथरनेट केबल खींची। हमलावर का शेल बीच कमांड में जम गया। फिलहाल सन्नाटा।")
  },
  {
    id: "reset",
    label: L("Force-reset all user passwords + revoke sessions", "सभी उपयोगकर्ता पासवर्ड बलपूर्वक रीसेट करें + सत्र समाप्त करें"),
    verdict: "partial",
    damage: 25,
    outcome: L("~ Helpful, but the attacker may still be inside.", "~ उपयोगी, पर हमलावर अब भी अंदर हो सकता है।"),
    hint: L("Good hygiene, but doesn't stop an active intruder.", "अच्छी आदत, पर सक्रिय घुसपैठिये को नहीं रोकता।"),
    story: L("Help desk lights up with angry tickets. Meanwhile, the attacker's existing shell keeps humming on a backup port.", "हेल्प डेस्क पर गुस्साई शिकायतें भर गईं। इस बीच हमलावर का शेल बैकअप पोर्ट पर चलता रहा।")
  },
  {
    id: "ignore",
    label: L("Wait and monitor — it might be a false alarm", "रुकें और देखें — शायद झूठा अलार्म हो"),
    verdict: "wrong",
    damage: 70,
    outcome: L("✗ Attacker pivoted to file server. Data exfiltration confirmed.", "✗ हमलावर फ़ाइल सर्वर तक पहुँचा। डेटा चोरी पुष्ट।"),
    hint: L("Never wait on a confirmed alert. Time = damage.", "पुष्ट अलर्ट पर कभी प्रतीक्षा न करें। समय = नुकसान।"),
    story: L("Twelve minutes pass. A 4.2 GB outbound transfer leaves the network. You realise your monitor was the only thing watching.", "बारह मिनट बीतते हैं। 4.2 GB का डेटा बाहर चला जाता है। तब समझ आता है कि देख रहा सिर्फ़ आपका मॉनिटर था।")
  },
  {
    id: "shutdown",
    label: L("Shut down the entire network immediately", "तुरंत पूरा नेटवर्क बंद कर दें"),
    verdict: "partial",
    damage: 40,
    outcome: L("~ Stops the attack but causes massive downtime.", "~ हमला रुक जाता है पर भारी डाउनटाइम होता है।"),
    hint: L("Surgical isolation beats panic shutdown.", "घबराकर बंद करने से बेहतर है सटीक अलगाव।"),
    story: L("Production goes dark. The CEO calls. The attacker is gone — and so is your forensic trail.", "उत्पादन बंद। CEO का फोन आया। हमलावर गायब — और आपका फॉरेंसिक सबूत भी।")
  },
  {
    id: "honeypot",
    label: L("Redirect attacker to a honeypot and observe", "हमलावर को हनीपॉट पर मोड़ें और निगरानी रखें"),
    verdict: "correct",
    damage: 8,
    outcome: L("✓ Tactics captured for threat intel without real damage.", "✓ बिना असली नुकसान के हमलावर की रणनीति दर्ज।"),
    hint: L("Deception buys time and intelligence — if rehearsed.", "धोखा देने से समय व जानकारी मिलती है — पर तैयारी ज़रूरी।"),
    story: L("The attacker happily exfiltrates a folder of fake invoices while your SOC quietly maps every command they run.", "हमलावर ख़ुश होकर नकली चालान चुरा रहा है, और आपका SOC उसकी हर कमांड चुपचाप दर्ज कर रहा है।")
  }
];
const DECISIONS_PHISH = [
  {
    id: "block",
    label: L("Block the sender domain at the email gateway", "ईमेल गेटवे पर भेजने वाले डोमेन को ब्लॉक करें"),
    verdict: "correct",
    damage: 5,
    outcome: L("✓ Campaign neutralised across the org.", "✓ पूरे संगठन में अभियान निष्क्रिय।"),
    hint: L("Stop the funnel, not just one email.", "केवल एक ईमेल नहीं, पूरे स्रोत को रोकें।"),
    story: L("47 identical messages bounce in the next hour. The attacker shrugs and moves to the next target.", "अगले घंटे में 47 समान संदेश वापस लौटे। हमलावर अगला लक्ष्य ढूँढने चला गया।")
  },
  {
    id: "warn",
    label: L("Send a company-wide 'do not click' warning", "कंपनी-व्यापी 'क्लिक न करें' चेतावनी भेजें"),
    verdict: "partial",
    damage: 30,
    outcome: L("~ Helpful, but three users already clicked.", "~ उपयोगी, पर तीन उपयोगकर्ता पहले ही क्लिक कर चुके।"),
    hint: L("Awareness lags exploitation by minutes.", "जागरूकता शोषण से कुछ मिनट पीछे रहती है।"),
    story: L("An intern in marketing reads the warning ten minutes after entering their password into the fake portal.", "मार्केटिंग का इंटर्न नकली पोर्टल में पासवर्ड डालने के दस मिनट बाद चेतावनी पढ़ता है।")
  },
  {
    id: "click",
    label: L("Click the link yourself to 'check if it's real'", "लिंक खुद क्लिक करके 'जांच' करें कि असली है या नहीं"),
    verdict: "wrong",
    damage: 80,
    outcome: L("✗ Your admin token is now in attacker hands.", "✗ आपका एडमिन टोकन अब हमलावर के हाथ।"),
    hint: L("Detonate suspicious URLs in a sandbox, never on your box.", "संदिग्ध URL सैंडबॉक्स में खोलें, अपने सिस्टम पर कभी नहीं।"),
    story: L("A new browser tab loads. Three seconds later your session token pings a server in another country.", "नया ब्राउज़र टैब खुलता है। तीन सेकंड बाद आपका सत्र टोकन विदेश के सर्वर तक पहुँच जाता है।")
  },
  {
    id: "report",
    label: L("Report to SOC and quarantine the message globally", "SOC को रिपोर्ट करें और संदेश को सर्वत्र क्वारंटीन करें"),
    verdict: "correct",
    damage: 8,
    outcome: L("✓ Threat hunters pull the message from every inbox.", "✓ थ्रेट हंटर्स ने हर इनबॉक्स से संदेश हटाया।"),
    hint: L("Reporting feeds detection rules for the next attack.", "रिपोर्टिंग अगले हमले के लिए डिटेक्शन नियमों को मज़बूत करती है।"),
    story: L("Within minutes the IOC is shared with the ISAC. Three peer companies block the same domain before lunch.", "कुछ मिनटों में IOC ISAC के साथ साझा हुआ। दोपहर से पहले तीन साथी कंपनियों ने वही डोमेन ब्लॉक किया।")
  },
  {
    id: "delete",
    label: L("Just delete the email and move on", "बस ईमेल हटाओ और आगे बढ़ो"),
    verdict: "wrong",
    damage: 55,
    outcome: L("✗ Other users still receive and click it.", "✗ अन्य उपयोगकर्ता अब भी पाते और क्लिक करते हैं।"),
    hint: L("Your inbox isn't the only target.", "केवल आपका इनबॉक्स लक्ष्य नहीं है।"),
    story: L("Two days later, payroll calls: a wire transfer went to a 'new vendor account'. Same campaign. Same domain.", "दो दिन बाद पेरोल का फोन: एक 'नए वेंडर खाते' में पैसा भेजा गया। वही अभियान। वही डोमेन।")
  }
];
const DECISIONS_RANSOM = [
  {
    id: "isolate-ransom",
    label: L("Isolate infected hosts and disable file shares", "संक्रमित होस्ट अलग करें और फ़ाइल शेयर बंद करें"),
    verdict: "correct",
    damage: 10,
    outcome: L("✓ Encryption stopped at 14% of fileserver.", "✓ फ़ाइलसर्वर के 14% पर एन्क्रिप्शन रुक गया।"),
    hint: L("Cut the blast radius before recovery.", "रिकवरी से पहले प्रभाव क्षेत्र सीमित करें।"),
    story: L("The encryption process dies mid-file. A README.txt sits half-written on the desktop, threatening a deadline that no longer matters.", "एन्क्रिप्शन प्रक्रिया फ़ाइल के बीच में रुक गई। डेस्कटॉप पर आधा-लिखा README.txt रह गया।")
  },
  {
    id: "pay",
    label: L("Pay the ransom to make it go away", "मामला निपटाने के लिए फिरौती दे दें"),
    verdict: "wrong",
    damage: 95,
    outcome: L("✗ No guarantee of recovery. You're now a known payer.", "✗ रिकवरी की गारंटी नहीं। अब आप 'पैसा देने वाले' के तौर पर जाने जाते हैं।"),
    hint: L("Paying funds future attacks and rarely restores systems.", "फिरौती देना भविष्य के हमलों को पैसा देता है और शायद ही सिस्टम वापस लाता है।"),
    story: L("Three weeks later, a different group hits you with the same toolkit. Your name is on a list shared in a forum you'll never see.", "तीन हफ़्तों बाद, उसी टूलकिट से दूसरा समूह हमला करता है। आपका नाम एक गुप्त सूची में है।")
  },
  {
    id: "restore",
    label: L("Restore from offline backups after eradication", "उन्मूलन के बाद ऑफ़लाइन बैकअप से बहाल करें"),
    verdict: "correct",
    damage: 15,
    outcome: L("✓ Clean recovery, minor data loss from last snapshot.", "✓ साफ रिकवरी, अंतिम स्नैपशॉट से थोड़ा डेटा नुकसान।"),
    hint: L("Backups only count if they're tested AND offline.", "बैकअप तभी मायने रखते हैं जब परखे गए हों और ऑफ़लाइन हों।"),
    story: L("Tape backups roll in from the vault. By morning, finance is invoicing again as if nothing happened.", "वॉल्ट से टेप बैकअप वापस आते हैं। सुबह तक फाइनेंस फिर से चालान बना रहा है, जैसे कुछ हुआ ही न हो।")
  },
  {
    id: "negotiate",
    label: L("Negotiate to buy time without paying", "बिना पैसा दिए समय खरीदने के लिए बातचीत करें"),
    verdict: "partial",
    damage: 45,
    outcome: L("~ Buys hours but signals willingness to pay.", "~ कुछ घंटे मिलते हैं पर 'पैसा देने को तैयार' का संकेत जाता है।"),
    hint: L("Engage law enforcement and IR retainers, not the attacker alone.", "अकेले हमलावर से नहीं, क़ानून-व्यवस्था और IR टीम को जोड़ें।"),
    story: L("The attacker extends the deadline — and doubles the price. Your CFO is no longer making eye contact.", "हमलावर समय बढ़ाता है — और कीमत दोगुनी कर देता है। आपका CFO नज़रें मिलाना बंद कर देता है।")
  }
];
const FLOW_BRUTE = [
  { step: L("🌐 Target login service discovered", "🌐 लक्ष्य लॉगिन सेवा मिली"), detail: L("Public-facing SSH on port 22 with no rate-limit.", "पोर्ट 22 पर खुली SSH, कोई रेट-लिमिट नहीं।") },
  { step: L("🤖 Automated guess loop launched", "🤖 स्वचालित अनुमान लूप शुरू"), detail: L("Botnet rotated 10B+ password candidates.", "बॉटनेट ने 10 अरब+ पासवर्ड आज़माए।") },
  { step: L("🔑 Credential pair matched", "🔑 क्रेडेंशियल जोड़ी मिली"), detail: L("Weak password fell within minutes.", "कमज़ोर पासवर्ड मिनटों में टूट गया।") },
  { step: L("🚪 Attacker authenticated", "🚪 हमलावर ने लॉगिन किया"), detail: L("No MFA — credentials were enough.", "MFA नहीं था — सिर्फ़ क्रेडेंशियल काफ़ी थे।") },
  { step: L("🦠 Lateral movement", "🦠 पार्श्व गति"), detail: L("Mapped internal network, found shared drives.", "आंतरिक नेटवर्क की मैपिंग की, साझा ड्राइव मिलीं।") }
];
const FLOW_PHISH = [
  { step: L("📧 Phishing email delivered", "📧 फ़िशिंग ईमेल पहुँचा"), detail: L("Spoofed 'IT-Support' sender, urgent password-reset bait.", "नकली 'IT-Support' भेजने वाला, जल्दी पासवर्ड रीसेट का चारा।") },
  { step: L("🖱 User clicked the link", "🖱 उपयोगकर्ता ने लिंक क्लिक किया"), detail: L("Landed on a cloned login page over HTTPS.", "HTTPS पर नकली लॉगिन पेज पर पहुँचा।") },
  { step: L("🔑 Credentials harvested", "🔑 क्रेडेंशियल चुरा लिए गए"), detail: L("Submitted username + password sent to attacker server.", "उपयोगकर्ता नाम + पासवर्ड हमलावर सर्वर पर भेजे गए।") },
  { step: L("🚪 Attacker logged in", "🚪 हमलावर ने लॉगिन किया"), detail: L("Session token replayed from new geography.", "नए स्थान से सेशन टोकन दोबारा इस्तेमाल किया।") },
  { step: L("📤 Mailbox rules planted", "📤 मेलबॉक्स नियम लगाए"), detail: L("Auto-forward + delete to hide further activity.", "गतिविधि छुपाने के लिए ऑटो-फॉरवर्ड + डिलीट।") }
];
const FLOW_RANSOM = [
  { step: L("📎 Macro-laden document opened", "📎 मैक्रो वाला दस्तावेज़ खुला"), detail: L("User ran an Excel macro from an emailed invoice.", "उपयोगकर्ता ने ईमेल किए चालान का Excel मैक्रो चलाया।") },
  { step: L("🛠 Loader fetched payload", "🛠 लोडर ने पेलोड डाउनलोड किया"), detail: L("PowerShell pulled second-stage from a CDN.", "PowerShell ने CDN से दूसरा चरण लाया।") },
  { step: L("👑 Privilege escalation", "👑 विशेषाधिकार बढ़ाया"), detail: L("Exploited unpatched local service.", "अनपैच सेवा का फ़ायदा उठाया।") },
  { step: L("🔐 Mass file encryption", "🔐 बड़े पैमाने पर फ़ाइल एन्क्रिप्शन"), detail: L("AES-256 over SMB shares, shadow copies wiped.", "SMB शेयर पर AES-256, शैडो कॉपी मिटाई गईं।") },
  { step: L("💰 Ransom note dropped", "💰 फिरौती नोट छोड़ा गया"), detail: L("Bitcoin wallet + countdown timer presented.", "बिटकॉइन वॉलेट + काउंटडाउन टाइमर दिखाया गया।") }
];
const LOGS_A = [
  { id: 1, time: "08:01", ip: "10.0.0.14", user: "alice", event: L("login OK", "लॉगिन OK"), suspicious: false },
  { id: 2, time: "02:47", ip: "185.220.101.4", user: "admin", event: L("login OK", "लॉगिन OK"), suspicious: true, category: "InitialAccess", reason: L("Off-hours login from Tor exit node.", "Tor एक्ज़िट नोड से ऑफ-ऑवर लॉगिन।") },
  { id: 3, time: "02:48", ip: "185.220.101.4", user: "admin", event: L("privilege escalation", "विशेषाधिकार बढ़ाव"), suspicious: true, category: "PrivEsc", reason: L("Privilege change right after suspicious login.", "संदिग्ध लॉगिन के तुरंत बाद विशेषाधिकार बदला।") },
  { id: 4, time: "09:10", ip: "10.0.0.14", user: "alice", event: L("file access", "फ़ाइल एक्सेस"), suspicious: false },
  { id: 5, time: "02:51", ip: "185.220.101.4", user: "admin", event: L("5x failed sudo", "5 बार sudo विफल"), suspicious: true, category: "PrivEsc", reason: L("Multiple failed sudo from anomalous IP.", "असामान्य IP से कई बार sudo विफल।") },
  { id: 6, time: "09:30", ip: "10.0.0.30", user: "carol", event: L("login OK", "लॉगिन OK"), suspicious: false },
  { id: 7, time: "03:02", ip: "45.9.148.99", user: "svc_backup", event: L("outbound 4.2GB", "बाहर भेजा गया 4.2GB"), suspicious: true, category: "Exfiltration", reason: L("Large outbound transfer from a service account.", "सेवा खाते से बड़ा डेटा बाहर भेजा गया।") }
];
const LOGS_B = [
  { id: 1, time: "10:14", ip: "10.0.0.7", user: "dave", event: L("login OK", "लॉगिन OK"), suspicious: false },
  { id: 2, time: "10:15", ip: "10.0.0.7", user: "dave", event: L("MFA approved", "MFA स्वीकृत"), suspicious: false },
  { id: 3, time: "10:16", ip: "203.0.113.42", user: "dave", event: L("login OK (no MFA)", "लॉगिन OK (बिना MFA)"), suspicious: true, category: "InitialAccess", reason: L("Same user logging in from a foreign IP without MFA — token replay.", "वही उपयोगकर्ता विदेशी IP से बिना MFA — टोकन रीप्ले।") },
  { id: 4, time: "10:17", ip: "203.0.113.42", user: "dave", event: L("mailbox rule created", "मेलबॉक्स नियम बनाया"), suspicious: true, category: "Persistence", reason: L("Auto-forward rule added — typical BEC tradecraft.", "ऑटो-फॉरवर्ड नियम जोड़ा — विशिष्ट BEC तरीका।") },
  { id: 5, time: "10:22", ip: "10.0.0.7", user: "dave", event: L("doc download", "दस्तावेज़ डाउनलोड"), suspicious: false },
  { id: 6, time: "10:25", ip: "203.0.113.42", user: "dave", event: L("OAuth app consented", "OAuth ऐप अनुमोदित"), suspicious: true, category: "Persistence", reason: L("Unknown OAuth app granted mailbox.read scope.", "अज्ञात OAuth ऐप को mailbox.read अनुमति मिली।") },
  { id: 7, time: "11:00", ip: "10.0.0.50", user: "erin", event: L("login OK", "लॉगिन OK"), suspicious: false }
];
const LOGS_C = [
  { id: 1, time: "23:40", ip: "10.0.2.55", user: "frank", event: L("doc opened", "दस्तावेज़ खोला"), suspicious: false },
  { id: 2, time: "23:41", ip: "10.0.2.55", user: "frank", event: L("powershell.exe -enc <b64>", "powershell.exe -enc <b64>"), suspicious: true, category: "DefenseEvasion", reason: L("Encoded PowerShell from a user workstation — suspicious LOLBin use.", "उपयोगकर्ता वर्कस्टेशन से एन्कोडेड PowerShell — संदिग्ध LOLBin उपयोग।") },
  { id: 3, time: "23:42", ip: "10.0.2.55", user: "frank", event: L("outbound 443 to 91.219.236.18", "बाहर 443 → 91.219.236.18"), suspicious: true, category: "C2", reason: L("Beaconing to a known malicious C2 IP.", "ज्ञात मैलिशियस C2 IP से संपर्क।") },
  { id: 4, time: "23:55", ip: "10.0.2.55", user: "SYSTEM", event: L("vssadmin delete shadows /all", "vssadmin delete shadows /all"), suspicious: true, category: "DefenseEvasion", reason: L("Shadow copies wiped — classic ransomware preparation.", "शैडो कॉपी मिटाई गईं — सामान्य रैनसमवेयर तैयारी।") },
  { id: 5, time: "00:01", ip: "10.0.2.55", user: "SYSTEM", event: L("mass file rename .locked", "बड़े पैमाने पर फ़ाइल नाम .locked"), suspicious: true, category: "Impact", reason: L("Mass extension change indicates active encryption.", "एक्सटेंशन में सामूहिक बदलाव सक्रिय एन्क्रिप्शन दर्शाता है।") },
  { id: 6, time: "07:30", ip: "10.0.0.9", user: "gina", event: L("login OK", "लॉगिन OK"), suspicious: false },
  { id: 7, time: "07:35", ip: "10.0.0.9", user: "gina", event: L("file access denied (encrypted)", "फ़ाइल एक्सेस अस्वीकृत (एन्क्रिप्टेड)"), suspicious: false }
];
const PHISH_EMAILS = [
  {
    id: "paypal",
    isPhish: true,
    from: "it-support@secure-paypa1.com",
    subject: L("URGENT — verify your account within 24h", "अति आवश्यक — 24 घंटे में अपना खाता सत्यापित करें"),
    preview: L("We detected unusual activity. Click below to confirm or your account will be permanently locked.", "असामान्य गतिविधि का पता चला। पुष्टि करें वरना खाता स्थायी रूप से बंद हो जाएगा।"),
    clues: [
      { id: "from", label: L("From: it-support@secure-paypa1.com", "भेजने वाला: it-support@secure-paypa1.com"), bad: true, reason: L("Spoofed lookalike domain ('paypa1' with a 1).", "नकली डोमेन ('paypa1' में 1)।") },
      { id: "subject", label: L("Subject: URGENT — verify within 24h", "विषय: अति आवश्यक — 24 घंटे में सत्यापित करें"), bad: true, reason: L("Urgency pressure is classic social engineering.", "जल्दबाज़ी का दबाव विशिष्ट सोशल इंजीनियरिंग है।") },
      { id: "body", label: L("“Click here or your account will be locked.”", "“यहाँ क्लिक करें वरना खाता बंद कर दिया जाएगा।”"), bad: true, reason: L("Threat + vague CTA = phishing pattern.", "धमकी + अस्पष्ट कॉल-टू-एक्शन = फ़िशिंग पैटर्न।") },
      { id: "link", label: L("Link: https://paypa1-secure.ru/verify", "लिंक: https://paypa1-secure.ru/verify"), bad: true, reason: L("Mismatched domain + suspicious TLD.", "बेमेल डोमेन + संदिग्ध TLD।") },
      { id: "sig", label: L("— PayPal Security Team", "— PayPal सुरक्षा टीम"), bad: false, reason: L("Signature alone isn't a strong signal.", "केवल हस्ताक्षर मज़बूत संकेत नहीं।") }
    ],
    story: {
      phish: L("You flagged it. The link's WHOIS record shows the domain was registered 6 hours ago in a country PayPal doesn't operate from.", "आपने इसे फ़्लैग किया। WHOIS रिकॉर्ड दिखाता है कि डोमेन 6 घंटे पहले एक ऐसे देश में पंजीकृत हुआ जहाँ PayPal नहीं चलता।"),
      real: L("You trusted it. Your password — and the password manager you reuse it with — are now part of someone else's spreadsheet.", "आपने भरोसा किया। आपका पासवर्ड — और जिस मैनेजर में आप उसे दोहराते हैं — अब किसी और की स्प्रेडशीट का हिस्सा है।")
    }
  },
  {
    id: "ceo",
    isPhish: true,
    from: "ceo.office@yourco-mail.co",
    subject: L("Quick favor — are you at your desk?", "एक छोटा सा काम — आप डेस्क पर हैं?"),
    preview: L("I'm in a board meeting and can't talk. Need you to buy 10 Apple gift cards for client gifts. Reply ASAP.", "मैं बोर्ड मीटिंग में हूँ, बात नहीं कर सकती। क्लाइंट गिफ्ट के लिए 10 Apple गिफ्ट कार्ड खरीदो। जल्दी जवाब दो।"),
    clues: [
      { id: "from", label: L("From: ceo.office@yourco-mail.co", "भेजने वाला: ceo.office@yourco-mail.co"), bad: true, reason: L("Lookalike domain ('yourco-mail.co' instead of 'yourco.com').", "नकल वाला डोमेन ('yourco-mail.co' न कि 'yourco.com')।") },
      { id: "subject", label: L("Subject: Quick favor — are you at your desk?", "विषय: एक छोटा सा काम — आप डेस्क पर हैं?"), bad: true, reason: L("Vague urgency + executive impersonation = BEC pattern.", "अस्पष्ट जल्दी + अधिकारी की नकल = BEC पैटर्न।") },
      { id: "body", label: L("“Buy 10 gift cards, send me the codes.”", "“10 गिफ्ट कार्ड खरीदो, कोड भेज दो।”"), bad: true, reason: L("Gift cards are the universal fraud payment rail.", "गिफ्ट कार्ड धोखाधड़ी का सबसे प्रचलित ज़रिया हैं।") },
      { id: "link", label: L("(no link, reply requested)", "(कोई लिंक नहीं, जवाब माँगा)"), bad: true, reason: L("BEC often skips links to avoid URL filters.", "BEC अक्सर URL फ़िल्टर से बचने के लिए लिंक नहीं रखता।") },
      { id: "sig", label: L("Sent from my iPhone", "मेरे iPhone से भेजा गया"), bad: false, reason: L("Mobile signatures are common — not a strong signal alone.", "मोबाइल हस्ताक्षर आम — अकेले मज़बूत संकेत नहीं।") }
    ],
    story: {
      phish: L("You called the CEO's actual desk. She's not in a meeting. She's on vacation in Crete and has never sent that email.", "आपने CEO के असली नंबर पर फ़ोन किया। वह मीटिंग में नहीं हैं — छुट्टी पर हैं और उन्होंने यह ईमेल नहीं भेजा।"),
      real: L("You bought the cards. Twenty minutes later, the codes were resold on a Telegram channel. Finance wants a word.", "आपने कार्ड खरीदे। बीस मिनट बाद कोड एक टेलीग्राम चैनल पर बेच दिए गए। फाइनेंस से बातचीत बाकी है।")
    }
  },
  {
    id: "delivery",
    isPhish: true,
    from: "no-reply@dh1-tracking.shop",
    subject: L("📦 Your package is held at customs — pay $2.99 fee", "📦 आपका पैकेज कस्टम पर रुका है — $2.99 शुल्क दें"),
    preview: L("Your parcel #DHL884712 is on hold. Settle the small customs fee to release shipment.", "आपका पार्सल #DHL884712 रोका गया है। छोटा कस्टम शुल्क देकर डिलीवरी छुड़ाएँ।"),
    clues: [
      { id: "from", label: L("From: no-reply@dh1-tracking.shop", "भेजने वाला: no-reply@dh1-tracking.shop"), bad: true, reason: L("Bogus tracking domain on a .shop TLD.", "नकली ट्रैकिंग डोमेन, .shop TLD पर।") },
      { id: "subject", label: L("Subject: Package held at customs — pay $2.99", "विषय: पैकेज कस्टम पर रुका — $2.99 दें"), bad: true, reason: L("Tiny fee lowers your guard; it's a card-harvesting setup.", "छोटा शुल्क सतर्कता कम करता है; असली मकसद कार्ड चुराना है।") },
      { id: "body", label: L("“Pay $2.99 to release your parcel.”", "“पार्सल छुड़ाने के लिए $2.99 दें।”"), bad: true, reason: L("Couriers don't email random customs fees.", "कूरियर कंपनियाँ ऐसे ईमेल पर कस्टम शुल्क नहीं माँगतीं।") },
      { id: "link", label: L("Link: https://dh1-tracking.shop/pay", "लिंक: https://dh1-tracking.shop/pay"), bad: true, reason: L("Form harvests full card details, not $2.99.", "फ़ॉर्म $2.99 नहीं, पूरा कार्ड विवरण चुराता है।") },
      { id: "sig", label: L("DHL Express Team", "DHL Express टीम"), bad: false, reason: L("Brand name in signature is trivially copied.", "ब्रांड नाम हस्ताक्षर में नकल करना आसान।") }
    ],
    story: {
      phish: L("You ignored it. A week later your colleague paid the 'fee'. Their card was charged $890 at a luxury site in another timezone.", "आपने नज़रअंदाज़ किया। एक हफ़्ते बाद आपके साथी ने 'शुल्क' दिया। उनके कार्ड से दूसरे टाइमज़ोन की लग्ज़री साइट पर $890 कटे।"),
      real: L("You paid. The $2.99 charge cleared. Then $89, then $890. Your bank's fraud line answers in 27 minutes.", "आपने पैसा दिया। पहले $2.99, फिर $89, फिर $890 कटे। बैंक की फ्रॉड हेल्पलाइन 27 मिनट में जवाब देती है।")
    }
  },
  {
    id: "github",
    isPhish: false,
    from: "noreply@github.com",
    subject: L("[GitHub] New sign-in to your account", "[GitHub] आपके खाते में नया साइन-इन"),
    preview: L("We noticed a new sign-in from Chrome on macOS in Berlin, DE. If this was you, no action is needed.", "बर्लिन, DE में macOS पर Chrome से नया साइन-इन देखा गया। यदि यह आप थे तो कुछ करने की ज़रूरत नहीं।"),
    clues: [
      { id: "from", label: L("From: noreply@github.com", "भेजने वाला: noreply@github.com"), bad: false, reason: L("Authentic sender domain matches GitHub's SPF/DKIM.", "वास्तविक भेजने वाला डोमेन GitHub के SPF/DKIM से मेल खाता है।") },
      { id: "subject", label: L("Subject: New sign-in to your account", "विषय: आपके खाते में नया साइन-इन"), bad: false, reason: L("Standard security notification format.", "मानक सुरक्षा सूचना का स्वरूप।") },
      { id: "body", label: L("“If this was you, no action is needed.”", "“यदि यह आप थे तो कुछ करने की ज़रूरत नहीं।”"), bad: false, reason: L("No pressure, no payment, informative tone.", "कोई दबाव नहीं, कोई भुगतान नहीं, सूचनात्मक स्वर।") },
      { id: "link", label: L("Link: https://github.com/settings/security", "लिंक: https://github.com/settings/security"), bad: false, reason: L("Real GitHub domain — hover confirms it.", "असली GitHub डोमेन — होवर से पुष्टि।") },
      { id: "sig", label: L("Thanks, the GitHub Team", "धन्यवाद, GitHub टीम"), bad: false, reason: L("Matches GitHub's normal signature style.", "GitHub की सामान्य हस्ताक्षर शैली से मेल खाता है।") }
    ],
    story: {
      phish: L("You blocked a real notification. A real attacker login two weeks later goes unnoticed because you trained yourself to ignore these.", "आपने असली सूचना ब्लॉक की। दो हफ्ते बाद असली हमलावर का लॉगिन छूट गया क्योंकि आपने इन्हें अनदेखा करना सीख लिया।"),
      real: L("You verified the location. It was you, on the train, on your laptop. No action needed — exactly as the email said.", "आपने स्थान सत्यापित किया। यह आप ही थे, ट्रेन में, लैपटॉप पर। कुछ करने की ज़रूरत नहीं — जैसा ईमेल ने कहा।")
    }
  }
];
const SCENARIOS$1 = [
  {
    id: "brute",
    name: L("Brute-force credential attack", "ब्रूट-फोर्स क्रेडेंशियल हमला"),
    attackType: L("Brute-force credential attack", "ब्रूट-फोर्स क्रेडेंशियल हमला"),
    entry: L("Public SSH / login form", "सार्वजनिक SSH / लॉगिन फ़ॉर्म"),
    systems: L("Auth service, user account", "ऑथ सेवा, उपयोगकर्ता खाता"),
    recapStory: L("At 02:47 your auth logs caught fire. Thousands of guesses per second — and one of them landed.", "02:47 पर आपके ऑथ लॉग में आग लगी। प्रति सेकंड हज़ारों अनुमान — और उनमें से एक सही निकला।"),
    decisions: pickN(DECISIONS_BRUTE, 4),
    attackFlow: FLOW_BRUTE,
    fixes: [
      L("Enforce MFA on every external login.", "हर बाहरी लॉगिन पर MFA लागू करें।"),
      L("Rate-limit + lockout after N failures.", "N विफलताओं के बाद रेट-लिमिट + लॉकआउट।"),
      L("Block known malicious IP ranges (Tor, VPS abuse).", "ज्ञात मैलिशियस IP रेंज ब्लॉक करें (Tor, VPS दुरुपयोग)।"),
      L("Move admin endpoints behind a VPN or zero-trust proxy.", "एडमिन एंडपॉइंट VPN या ज़ीरो-ट्रस्ट प्रॉक्सी के पीछे रखें।")
    ],
    logs: LOGS_A,
    phish: PHISH_EMAILS[0]
  },
  {
    id: "phish",
    name: L("Targeted phishing campaign", "लक्षित फ़िशिंग अभियान"),
    attackType: L("Phishing → session hijack", "फ़िशिंग → सत्र हाईजैक"),
    entry: L("Email → cloned login page", "ईमेल → नकली लॉगिन पेज"),
    systems: L("Mailbox, SSO session", "मेलबॉक्स, SSO सत्र"),
    recapStory: L("A spoofed exec email arrived at 10:14. By 10:17, an inbox rule was quietly forwarding finance threads abroad.", "10:14 पर नकली अधिकारी ईमेल आया। 10:17 तक एक इनबॉक्स नियम चुपचाप फाइनेंस की बातचीत विदेश भेज रहा था।"),
    decisions: pickN(DECISIONS_PHISH, 4),
    attackFlow: FLOW_PHISH,
    fixes: [
      L("Phishing-resistant MFA (FIDO2 / passkeys).", "फ़िशिंग-रोधी MFA (FIDO2 / पासकीज़)।"),
      L("Banner external emails clearly.", "बाहरी ईमेल पर स्पष्ट बैनर दिखाएँ।"),
      L("Disable legacy auth + restrict OAuth app consent.", "पुरानी ऑथ बंद करें + OAuth ऐप अनुमति सीमित करें।"),
      L("Run quarterly phishing drills with real metrics.", "हर तिमाही फ़िशिंग अभ्यास करें और परिणाम मापें।")
    ],
    logs: LOGS_B,
    phish: PHISH_EMAILS[1]
  },
  {
    id: "ransom",
    name: L("Ransomware via macro document", "मैक्रो दस्तावेज़ से रैनसमवेयर"),
    attackType: L("Macro loader → ransomware", "मैक्रो लोडर → रैनसमवेयर"),
    entry: L("Emailed invoice with macros", "मैक्रो वाला ईमेल चालान"),
    systems: L("Workstation, file server", "वर्कस्टेशन, फ़ाइल सर्वर"),
    recapStory: L("Just before midnight an 'invoice.xlsm' ran code no human typed. By 00:01 files were getting .locked extensions.", "आधी रात से ठीक पहले एक 'invoice.xlsm' ने ऐसा कोड चलाया जो किसी इंसान ने नहीं लिखा। 00:01 तक फ़ाइलों के नाम के अंत में .locked लगने लगा।"),
    decisions: pickN(DECISIONS_RANSOM, 4),
    attackFlow: FLOW_RANSOM,
    fixes: [
      L("Disable Office macros from the internet by policy.", "इंटरनेट से आए Office मैक्रो को नीति से बंद करें।"),
      L("EDR with behavioural detection on shadow-copy deletion.", "शैडो कॉपी हटाए जाने पर EDR व्यवहार-आधारित डिटेक्शन।"),
      L("Offline, immutable backups tested monthly.", "ऑफ़लाइन, अपरिवर्तनीय बैकअप, मासिक परीक्षण।"),
      L("Network segmentation around file servers.", "फ़ाइल सर्वर के चारों ओर नेटवर्क विभाजन।")
    ],
    logs: LOGS_C,
    phish: PHISH_EMAILS[2]
  }
];
function pickN(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}
function pickRandomScenario() {
  const base = SCENARIOS$1[Math.floor(Math.random() * SCENARIOS$1.length)];
  const phish = PHISH_EMAILS[Math.floor(Math.random() * PHISH_EMAILS.length)];
  const pool = base.id === "brute" ? DECISIONS_BRUTE : base.id === "phish" ? DECISIONS_PHISH : DECISIONS_RANSOM;
  return { ...base, decisions: pickN(pool, 4), phish };
}
const INCIDENT_STEPS = ["Detection", "Containment", "Eradication", "Recovery"];
const IR_STEP_LABEL = {
  Detection: L("Detection", "पहचान"),
  Containment: L("Containment", "रोकथाम"),
  Eradication: L("Eradication", "उन्मूलन"),
  Recovery: L("Recovery", "रिकवरी")
};
const IR_POOL = {
  Detection: [
    { label: L("Review SIEM alerts and correlate logs", "SIEM अलर्ट देखें और लॉग मिलाएँ"), correct: true },
    { label: L("Restart the server and hope it goes away", "सर्वर रीस्टार्ट करें और उम्मीद करें कि ठीक हो जाएगा"), correct: false },
    { label: L("Pivot through EDR telemetry to find the entry host", "एंट्री होस्ट खोजने के लिए EDR टेलीमेट्री में जाँच करें"), correct: true },
    { label: L("Ask the user 'are you sure something is wrong?'", "उपयोगकर्ता से पूछें 'क्या सच में कुछ गड़बड़ है?'"), correct: false },
    { label: L("Check threat-intel feeds for matching IOCs", "मिलते IOC के लिए थ्रेट-इंटेल फ़ीड देखें"), correct: true }
  ],
  Containment: [
    { label: L("Isolate affected hosts from the network", "प्रभावित होस्ट नेटवर्क से अलग करें"), correct: true },
    { label: L("Email everyone the attacker's IP", "हमलावर का IP सबको ईमेल कर दें"), correct: false },
    { label: L("Block C2 domains at the firewall", "फ़ायरवॉल पर C2 डोमेन ब्लॉक करें"), correct: true },
    { label: L("Tweet about the incident in real time", "लाइव घटना के बारे में ट्वीट करें"), correct: false },
    { label: L("Disable compromised accounts and rotate tokens", "समझौता खातों को बंद करें और टोकन बदलें"), correct: true }
  ],
  Eradication: [
    { label: L("Remove malware, rotate credentials, patch entry point", "मैलवेयर हटाएँ, क्रेडेंशियल बदलें, एंट्री पॉइंट पैच करें"), correct: true },
    { label: L("Just delete the suspicious file", "बस संदिग्ध फ़ाइल हटा दें"), correct: false },
    { label: L("Rebuild affected hosts from a known-good image", "प्रभावित होस्ट को सही इमेज से फिर से बनाएँ"), correct: true },
    { label: L("Rename the malware so it can't run", "मैलवेयर का नाम बदल दें ताकि वह न चले"), correct: false },
    { label: L("Hunt for persistence mechanisms across the fleet", "पूरे सिस्टम में परसिस्टेंस तंत्र की खोज करें"), correct: true }
  ],
  Recovery: [
    { label: L("Restore from clean backup and monitor closely", "साफ़ बैकअप से बहाल करें और बारीकी से निगरानी रखें"), correct: true },
    { label: L("Bring everything back online immediately", "तुरंत सब कुछ वापस ऑनलाइन ले आएँ"), correct: false },
    { label: L("Re-enable accounts after MFA enrolment", "MFA पंजीकरण के बाद खाते फिर से चालू करें"), correct: true },
    { label: L("Skip the post-mortem to save time", "समय बचाने के लिए पोस्ट-मॉर्टम छोड़ दें"), correct: false },
    { label: L("Run validation tests before reconnecting users", "उपयोगकर्ताओं को जोड़ने से पहले सत्यापन परीक्षण करें"), correct: true }
  ]
};
function pickIROptions() {
  const out = {
    Detection: [],
    Containment: [],
    Eradication: [],
    Recovery: []
  };
  for (const step of INCIDENT_STEPS) {
    const good = IR_POOL[step].filter((o) => o.correct);
    const bad = IR_POOL[step].filter((o) => !o.correct);
    const picked = [
      good[Math.floor(Math.random() * good.length)],
      bad[Math.floor(Math.random() * bad.length)]
    ];
    if (Math.random() < 0.5) picked.reverse();
    out[step] = picked;
  }
  return out;
}
const SCENARIOS = [
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
    body: "Dear Customer,\n\nWe detected an unusual login from a new device. Your account will be permanently suspended in 2 hours unless you verify your identity immediately. Do not share this with anyone — this is a confidential security matter.\n\nClick the secure link below to confirm your details now.",
    link: { label: "Verify my account", href: "https://hdfc-verify.support/login" },
    isPhish: true,
    tactics: [
      { phrase: "URGENT", name: "Urgency", explain: "Forces instant action so you skip critical thinking." },
      { phrase: "permanently suspended in 2 hours", name: "Fear of loss", explain: "Threat of irreversible damage triggers panic decisions." },
      { phrase: "Do not share this", name: "Isolation", explain: "Stops you from asking a colleague who might spot the scam." },
      { phrase: "verify your identity immediately", name: "Authority pressure", explain: "Mimics a trusted institution issuing a command." }
    ],
    redFlags: [
      "Domain is hdfc-verify.support — banks never use lookalike TLDs.",
      "Sent at 02:14 — banks don't trigger account suspension at night.",
      "Generic 'Dear Customer' — real bank emails use your name."
    ],
    outcomes: {
      open_link: { safe: false, scoreDelta: -20, headline: "Credentials exposed", detail: "Cloned login page captured your username + password. Attacker is replaying them across 6 other banks right now." },
      reply: { safe: false, scoreDelta: -8, headline: "You confirmed you're a live target", detail: "Replying tells the attacker the address is monitored. Expect more sophisticated follow-ups." },
      report: { safe: true, scoreDelta: 25, headline: "Reported to SOC", detail: "The phishing domain was added to the gateway blocklist within minutes — protecting 10k+ employees." },
      verify_sender: { safe: true, scoreDelta: 15, headline: "Sender mismatch confirmed", detail: "WHOIS shows hdfc-verify.support was registered 6 hours ago in a country HDFC doesn't operate from." },
      ignore: { safe: true, scoreDelta: 5, headline: "Threat avoided — but not neutralised", detail: "You stayed safe, but other employees still received the same email. Reporting would have stopped the campaign." }
    },
    assistantHints: [
      "Look at the sender domain carefully — does it really belong to your bank?",
      "Real banks never threaten to suspend your account in 2 hours.",
      "When in doubt, open your banking app directly — never via an email link."
    ]
  },
  {
    id: "delivery-scam",
    difficulty: "BEGINNER",
    channel: "sms",
    senderName: "DHL Express",
    senderHandle: "+91-808-441-2233",
    avatarColor: "var(--neon-amber)",
    timestamp: "Today, 11:02",
    body: "DHL: Your package #IN884712 is held at customs. Pay a small fee of ₹49 to release shipment. Tap the link to settle now: https://dhl-in.tracking-pay.shop/release",
    link: { label: "Pay ₹49 release fee", href: "https://dhl-in.tracking-pay.shop/release" },
    isPhish: true,
    tactics: [
      { phrase: "small fee of ₹49", name: "Lowered guard", explain: "A trivial amount makes you skip the usual fraud checks." },
      { phrase: "held at customs", name: "Plausible scenario", explain: "Sounds bureaucratic and routine — exploits familiarity." }
    ],
    redFlags: [
      "Real couriers send tracking links to dhl.com, not .shop domains.",
      "Customs fees are paid to government portals, not via SMS link.",
      "SMS sender is a personal mobile number, not a verified shortcode."
    ],
    outcomes: {
      open_link: { safe: false, scoreDelta: -22, headline: "Card details harvested", detail: "The page asked for full card + CVV + OTP. The 'fee' was ₹49 — but the same form charged ₹89,000 at a luxury site abroad." },
      ignore: { safe: true, scoreDelta: 10, headline: "Smart call", detail: "You weren't expecting a delivery — and unexpected = suspicious." },
      report: { safe: true, scoreDelta: 22, headline: "Reported to 1930 cybercrime helpline", detail: "Your report contributed to a takedown notice issued for the malicious domain." },
      verify_sender: { safe: true, scoreDelta: 12, headline: "Number flagged", detail: "Reverse lookup shows the number is unregistered and previously linked to fraud reports." },
      reply: { safe: false, scoreDelta: -6, headline: "Attacker confirmed you're reachable", detail: "Expect a follow-up call from a 'DHL agent' walking you through the payment." }
    },
    assistantHints: [
      "Were you actually expecting a parcel? If not, default to suspicion.",
      "Hover the link — the domain ends in .shop, not .dhl.com."
    ]
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
    body: "Hi,\n\nCongratulations! You've been shortlisted for the Google STEP Internship 2026 based on your public profile. To confirm your slot, please fill the attached onboarding form and submit your Aadhaar + PAN scan within 24 hours. Slots are limited — only 12 left.\n\nLooking forward to onboarding you.\n\nPriya Mehta\nTalent Acquisition, Google India",
    attachment: { name: "Google_STEP_Onboarding_2026.docm", size: "412 KB" },
    isPhish: true,
    tactics: [
      { phrase: "Congratulations", name: "Reward bait", explain: "Excitement bypasses skepticism — you want it to be real." },
      { phrase: "only 12 left", name: "Scarcity", explain: "Manufactured scarcity rushes you past verification." },
      { phrase: "Aadhaar + PAN scan", name: "Identity harvest", explain: "Real recruiters never collect government IDs at first contact." },
      { phrase: "within 24 hours", name: "Urgency", explain: "Compresses the timeline so you don't research the role." }
    ],
    redFlags: [
      "Domain google-careers-in.com is not owned by Google.",
      ".docm attachment carries macros — Google never sends these.",
      "You never applied to STEP; cold-shortlisting is not how it works."
    ],
    outcomes: {
      download: { safe: false, scoreDelta: -28, headline: "Malware payload downloaded", detail: "The macro fetched a remote-access trojan. Your webcam, files and saved passwords are now reachable from a server in another country." },
      open_link: { safe: false, scoreDelta: -15, headline: "Phishing portal logged your details", detail: "A fake 'Google careers' portal recorded everything you typed." },
      reply: { safe: false, scoreDelta: -6, headline: "Conversation hijack started", detail: "The 'recruiter' is now building rapport over chat — a long-con setup." },
      report: { safe: true, scoreDelta: 25, headline: "Campaign disrupted", detail: "Your report helped the placement cell warn 4,000+ students within the same evening." },
      verify_sender: { safe: true, scoreDelta: 18, headline: "Domain spoof confirmed", detail: "Google Careers always uses google.com — anything else is suspicious." },
      ignore: { safe: true, scoreDelta: 6, headline: "You stayed safe", detail: "But peers are still getting the same email. Reporting helps everyone." }
    },
    assistantHints: [
      "Did you actually apply for this role? Cold offers are almost always scams.",
      "Check the domain: real Google emails come from @google.com.",
      "Macro-enabled (.docm) attachments from strangers — never open."
    ]
  },
  {
    id: "otp-request",
    difficulty: "INTERMEDIATE",
    channel: "chat",
    senderName: "Bank Support",
    senderHandle: "@official_kyc_support",
    avatarColor: "var(--neon-amber)",
    timestamp: "Just now",
    body: "Hello, this is RBI-authorised KYC support. Your KYC will expire today. We've sent an OTP to your number — please share it here so we can complete the re-KYC. This is a secure verified channel.",
    isPhish: true,
    tactics: [
      { phrase: "RBI-authorised", name: "False authority", explain: "Invokes a regulator to manufacture trust." },
      { phrase: "share it here", name: "Direct credential request", explain: "No legitimate org ever asks you to share an OTP." },
      { phrase: "secure verified channel", name: "Reassurance framing", explain: "Telling you it's 'secure' is a manipulation, not proof." },
      { phrase: "expire today", name: "Urgency", explain: "Time pressure prevents you from calling the bank to verify." }
    ],
    redFlags: [
      "RBI never contacts customers directly for KYC.",
      "OTPs are NEVER to be shared — that line is on every bank SMS.",
      "Username @official_kyc_support has no verification badge."
    ],
    outcomes: {
      reply: { safe: false, scoreDelta: -30, headline: "Account drained", detail: "Sharing the OTP authorised a UPI mandate of ₹98,500. The transfer cleared in 11 seconds." },
      ignore: { safe: true, scoreDelta: 12, headline: "Trust your instincts", detail: "Every bank tells you the same thing: never share an OTP. You followed it." },
      report: { safe: true, scoreDelta: 22, headline: "Reported to 1930", detail: "The cybercrime portal flagged the handle for takedown." },
      verify_sender: { safe: true, scoreDelta: 15, headline: "Imposter confirmed", detail: "Calling your bank's official number confirmed they never initiated this conversation." }
    },
    assistantHints: [
      "Stop. No real bank — and definitely not the RBI — will ever ask for an OTP.",
      "If they invoke a regulator, that's a red flag, not a green one."
    ]
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
    body: "Hey,\n\nI'm in the middle of a board call so I can't talk on the phone. I need you to discreetly process a wire of ₹14,80,000 to a new vendor account today — it's tied to the Bengaluru acquisition we discussed last week. I'll loop in legal afterwards.\n\nKeep this between us until close — public knowledge could move the deal price.\n\nSent from my iPhone\nAnjali",
    isPhish: true,
    tactics: [
      { phrase: "discreetly", name: "Secrecy compulsion", explain: "Asks you to bypass the colleagues who would otherwise spot the fraud." },
      { phrase: "I can't talk on the phone", name: "Out-of-band block", explain: "Removes the easiest verification path — voice." },
      { phrase: "Keep this between us", name: "Authority + secrecy", explain: "Combines hierarchy pressure with isolation." },
      { phrase: "Sent from my iPhone", name: "Casual cover", explain: "Mobile signature explains away grammatical or process oddities." }
    ],
    redFlags: [
      "Domain is yourco-mail.co — close, but not yourco.com.",
      "No project codename, no vendor ID, no CFO in copy.",
      "Asks for secrecy — a red flag in any corporate process."
    ],
    outcomes: {
      reply: { safe: false, scoreDelta: -18, headline: "Attacker now coaching you", detail: "They'll send 'banking instructions' next, walk you through the wire, and apply more time pressure." },
      open_link: { safe: false, scoreDelta: -12, headline: "Tracking pixel triggered", detail: "Confirmed your inbox is live and read in real-time. The next email will be even more targeted." },
      verify_sender: { safe: true, scoreDelta: 25, headline: "BEC neutralised", detail: "You called the CEO's known mobile. She's not on a board call — and she didn't send this email." },
      report: { safe: true, scoreDelta: 22, headline: "Treasury freeze in time", detail: "Finance flagged the new vendor account; banking partners blocked the transfer template." },
      ignore: { safe: false, scoreDelta: -4, headline: "Risk left active", detail: "Ignoring a CEO impersonation lets the attacker try someone else in finance." }
    },
    assistantHints: [
      "Would the real CEO bypass finance and legal to wire money? No corporate process works this way.",
      "Verify out-of-band — call her on a number you already had, not one in the email.",
      "The domain ends in .co, not .com. One letter, six-figure consequences."
    ]
  },
  {
    id: "ai-clone-voice",
    difficulty: "ADVANCED",
    channel: "chat",
    senderName: "Rohit (Cousin)",
    senderHandle: "+44-7-447-91-2240",
    avatarColor: "var(--neon-red)",
    timestamp: "Today, 23:11",
    body: "bhaiya it's me rohit, my phone got stolen in london — using my friend's. i'm stuck at the airport, please send ₹40,000 to this UPI id quickly: rescue.rohit@okicici i'll pay back tomorrow. don't tell mom she'll panic. calling you in 2 min from this number.",
    isPhish: true,
    tactics: [
      { phrase: "it's me rohit", name: "Familiarity claim", explain: "Asserted identity exploits emotional shortcuts — you want it to be him." },
      { phrase: "phone got stolen", name: "Plausible distress", explain: "Explains the unknown number AND prevents normal verification." },
      { phrase: "don't tell mom", name: "Isolation", explain: "Cuts off the family member who would catch the inconsistency." },
      { phrase: "calling you in 2 min", name: "Urgency + AI voice prep", explain: "Sets up a deepfake voice call to reinforce the lie." }
    ],
    redFlags: [
      "UPI handle is generic 'rescue.*' — clearly a mule account.",
      "An unknown +44 number with personal claims should always be verified.",
      "Tone shift: real Rohit doesn't write like this."
    ],
    outcomes: {
      reply: { safe: false, scoreDelta: -10, headline: "Engagement deepens the trap", detail: "An AI-cloned voice will call you in seconds. The voice will sound exactly like Rohit." },
      open_link: { safe: false, scoreDelta: -25, headline: "UPI authorisation page opened", detail: "₹40,000 left your account in under 6 seconds. UPI is irreversible." },
      verify_sender: { safe: true, scoreDelta: 28, headline: "Cousin is fine", detail: "You called Rohit's actual number. He's at home in Pune. The whole story was synthetic." },
      ignore: { safe: true, scoreDelta: 10, headline: "Right call", detail: "An unknown number with an emotional money request — default to suspicion." },
      report: { safe: true, scoreDelta: 18, headline: "Reported on chakshu.gov.in", detail: "The number and UPI id were submitted to the DoT fraud portal." }
    },
    assistantHints: [
      "Voice can be cloned from 3 seconds of audio. Trust process, not vibes.",
      "Always call back on a number you already have saved — never the new one.",
      "Ask a question only the real person would know — but only on a verified channel."
    ]
  }
];
const ACTIONS = [
  { id: "open_link", label: "Open Link", icon: "🔗", vibe: "danger" },
  { id: "download", label: "Download Attachment", icon: "📎", vibe: "danger" },
  { id: "reply", label: "Reply", icon: "↩", vibe: "neutral" },
  { id: "verify_sender", label: "Verify Sender", icon: "🔍", vibe: "safe" },
  { id: "report", label: "Report Scam", icon: "🚩", vibe: "safe" },
  { id: "ignore", label: "Ignore Message", icon: "🚫", vibe: "neutral" }
];
function highlight(body, tactics) {
  let nodes = [{ text: body }];
  tactics.forEach((t) => {
    const next = [];
    nodes.forEach((n) => {
      if (n.tactic) {
        next.push(n);
        return;
      }
      const i = n.text.indexOf(t.phrase);
      if (i === -1) {
        next.push(n);
        return;
      }
      if (i > 0) next.push({ text: n.text.slice(0, i) });
      next.push({ text: t.phrase, tactic: t });
      const rest = n.text.slice(i + t.phrase.length);
      if (rest) next.push({ text: rest });
    });
    nodes = next;
  });
  return nodes;
}
function rank(score) {
  if (score >= 90) return { label: "CYBER GUARDIAN", tone: "text-primary" };
  if (score >= 70) return { label: "ANALYST", tone: "text-primary" };
  if (score >= 50) return { label: "AWARE", tone: "text-accent" };
  if (score >= 25) return { label: "AT RISK", tone: "text-accent" };
  return { label: "VULNERABLE", tone: "text-destructive" };
}
function PhishingSimulation({
  difficulty = "BEGINNER",
  onComplete
}) {
  const { t } = useLang();
  const [diff, setDiff] = useState(difficulty);
  const queue = useMemo(
    () => SCENARIOS.filter((s) => s.difficulty === diff),
    [diff]
  );
  const [idx, setIdx] = useState(0);
  const scenario = queue[idx];
  const [phase, setPhase] = useState("intro");
  const [score, setScore] = useState(70);
  const [scoreFlash, setScoreFlash] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [revealedTactics, setRevealedTactics] = useState(/* @__PURE__ */ new Set());
  const [hintIdx, setHintIdx] = useState(0);
  const [history, setHistory] = useState([]);
  useEffect(() => {
    setPhase("intro");
    setChosen(null);
    setRevealedTactics(/* @__PURE__ */ new Set());
    setHintIdx(0);
  }, [idx, diff]);
  useEffect(() => {
    if (!scoreFlash) return;
    const t2 = setTimeout(() => setScoreFlash(null), 900);
    return () => clearTimeout(t2);
  }, [scoreFlash]);
  if (!scenario) {
    return /* @__PURE__ */ jsx("div", { className: "rounded-md border border-border bg-card/60 p-5 text-sm text-muted-foreground", children: t("No scenarios available for this difficulty.", "इस कठिनाई स्तर के लिए कोई परिदृश्य उपलब्ध नहीं।") });
  }
  const applyAction = (a) => {
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
  const channelBadge = scenario.channel === "email" ? "EMAIL" : scenario.channel === "sms" ? "SMS" : "CHAT";
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-card/60 p-5 backdrop-blur animate-fade-in space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-sm uppercase tracking-widest text-primary text-glow", children: [
        "// ",
        t("social engineering decision sim", "सोशल इंजीनियरिंग निर्णय सिम")
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "rounded-sm border border-accent/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-accent", children: [
        t("scenario", "परिदृश्य"),
        " ",
        idx + 1,
        " / ",
        queue.length
      ] }),
      /* @__PURE__ */ jsx("span", { className: "rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground", children: scenario.difficulty }),
      /* @__PURE__ */ jsx("div", { className: "ml-auto flex items-center gap-1", children: ["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((d) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setDiff(d);
            setIdx(0);
            setHistory([]);
            setScore(70);
          },
          className: `rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-widest transition ${diff === d ? "border-primary bg-primary/10 text-primary text-glow" : "border-border text-muted-foreground hover:text-foreground"}`,
          children: d.slice(0, 3)
        },
        d
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-background/40 p-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground", children: [
        /* @__PURE__ */ jsx("span", { children: t("Cyber Awareness Score", "साइबर जागरूकता स्कोर") }),
        /* @__PURE__ */ jsx("span", { className: rank(score).tone + " text-glow", children: rank(score).label })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-2 flex-1 overflow-hidden rounded-sm bg-muted", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full transition-all duration-500",
            style: {
              width: `${score}%`,
              background: score >= 70 ? "var(--neon-green)" : score >= 40 ? "var(--neon-amber)" : "var(--neon-red)",
              boxShadow: "var(--terminal-glow)"
            }
          }
        ) }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `w-14 text-right font-mono text-lg ${scoreFlash === "up" ? "text-primary text-glow" : scoreFlash === "down" ? "text-destructive text-glow" : "text-foreground"}`,
            children: [
              score,
              "/100"
            ]
          }
        )
      ] })
    ] }),
    phase === "intro" && /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-accent/40 bg-background/40 p-4", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-widest text-accent", children: "// briefing" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-foreground", children: [
        "A new ",
        channelBadge.toLowerCase(),
        " just landed. Investigate it like a real analyst — inspect the sender, hover the link, identify manipulation tactics. Your decision will have ",
        /* @__PURE__ */ jsx("span", { className: "text-primary", children: "real consequences" }),
        "."
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs italic text-muted-foreground", children: [
        'Threat Assistant: "',
        scenario.assistantHints[0],
        '"'
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: () => setPhase("message"),
          className: "mt-3 border border-primary bg-primary/10 text-primary hover:bg-primary/20",
          children: [
            "▶ open ",
            channelBadge.toLowerCase()
          ]
        }
      )
    ] }),
    (phase === "message" || phase === "decision") && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-sm border border-border bg-background/70 shadow-inner", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border bg-muted/30 px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            channelBadge,
            " client"
          ] }),
          /* @__PURE__ */ jsx("span", { children: scenario.timestamp })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-border px-3 py-2", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-background",
              style: { background: scenario.avatarColor },
              children: scenario.senderName.slice(0, 1)
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: "truncate text-sm text-foreground", children: scenario.senderName }),
            /* @__PURE__ */ jsx("div", { className: "truncate font-mono text-xs text-muted-foreground", children: scenario.senderHandle })
          ] })
        ] }),
        scenario.subject && /* @__PURE__ */ jsxs("div", { className: "border-b border-border px-3 py-2 text-sm text-foreground", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: "subject " }),
          scenario.subject
        ] }),
        /* @__PURE__ */ jsx("div", { className: "px-3 py-3 text-sm leading-relaxed text-foreground whitespace-pre-line", children: highlight(scenario.body, scenario.tactics).map(
          (node, i) => node.tactic ? /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setRevealedTactics((p) => new Set(p).add(node.tactic.name));
              },
              title: `${node.tactic.name} — click to analyze`,
              className: `relative rounded-sm px-1 transition ${revealedTactics.has(node.tactic.name) ? "bg-destructive/30 text-destructive border border-destructive/60" : "bg-destructive/10 text-destructive underline decoration-destructive/60 decoration-dotted underline-offset-4 hover:bg-destructive/20 animate-pulse"}`,
              children: node.text
            },
            i
          ) : /* @__PURE__ */ jsx("span", { children: node.text }, i)
        ) }),
        scenario.link && /* @__PURE__ */ jsxs("div", { className: "border-t border-border bg-background/30 px-3 py-2 text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "link preview: " }),
          /* @__PURE__ */ jsx("span", { className: "font-mono text-destructive", children: scenario.link.href })
        ] }),
        scenario.attachment && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-t border-border bg-background/30 px-3 py-2 text-xs", children: [
          /* @__PURE__ */ jsx("span", { children: "📎" }),
          /* @__PURE__ */ jsx("span", { className: "font-mono text-foreground", children: scenario.attachment.name }),
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            "(",
            scenario.attachment.size,
            ")"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "ml-auto rounded-sm border border-destructive/60 px-1 text-[10px] uppercase tracking-widest text-destructive", children: "macro-enabled" })
        ] })
      ] }),
      revealedTactics.size > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-destructive/40 bg-destructive/5 p-3", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-widest text-destructive", children: "// manipulation tactics detected" }),
        /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1 text-xs", children: scenario.tactics.filter((t2) => revealedTactics.has(t2.name)).map((t2) => /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsxs("span", { className: "text-destructive", children: [
            "▸ ",
            t2.name,
            ":"
          ] }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: t2.explain })
        ] }, t2.name)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-accent/40 bg-accent/5 p-3 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "uppercase tracking-widest text-accent", children: "// threat assistant" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setHintIdx((i) => (i + 1) % scenario.assistantHints.length),
              className: "text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground",
              children: "next hint →"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 italic text-foreground", children: [
          '"',
          scenario.assistantHints[hintIdx],
          '"'
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "mb-2 text-xs uppercase tracking-widest text-muted-foreground", children: "→ choose your action" }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-3", children: ACTIONS.map((a) => {
          const enabled = !!scenario.outcomes[a.id] && (a.id !== "open_link" || !!scenario.link) && (a.id !== "download" || !!scenario.attachment);
          if (!enabled) return null;
          const cls = a.vibe === "danger" ? "border-destructive/60 text-destructive hover:bg-destructive/10" : a.vibe === "safe" ? "border-primary/60 text-primary hover:bg-primary/10" : "border-border text-foreground hover:bg-muted/40";
          return /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => applyAction(a.id),
              className: `rounded-sm border px-3 py-2 text-left text-sm transition ${cls}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "mr-2", children: a.icon }),
                a.label
              ]
            },
            a.id
          );
        }) })
      ] })
    ] }),
    phase === "consequence" && chosen && scenario.outcomes[chosen] && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: `rounded-sm border p-4 ${scenario.outcomes[chosen].safe ? "border-primary bg-primary/10" : "border-destructive bg-destructive/10"}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: `text-xs uppercase tracking-widest ${scenario.outcomes[chosen].safe ? "text-primary" : "text-destructive"}`, children: scenario.outcomes[chosen].safe ? "// safe outcome" : "// breach simulated" }),
            /* @__PURE__ */ jsx("h4", { className: `mt-1 text-base font-bold text-glow ${scenario.outcomes[chosen].safe ? "text-primary" : "text-destructive"}`, children: scenario.outcomes[chosen].headline }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-foreground", children: scenario.outcomes[chosen].detail }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 text-xs", children: [
              "Score change:",
              " ",
              /* @__PURE__ */ jsxs("span", { className: scenario.outcomes[chosen].scoreDelta >= 0 ? "text-primary" : "text-destructive", children: [
                scenario.outcomes[chosen].scoreDelta >= 0 ? "+" : "",
                scenario.outcomes[chosen].scoreDelta
              ] })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-background/40 p-3", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-widest text-accent", children: "// red flags you should have seen" }),
        /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1 text-xs text-foreground", children: scenario.redFlags.map((f, i) => /* @__PURE__ */ jsxs("li", { children: [
          "▸ ",
          f
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-background/40 p-3", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-widest text-accent", children: "// attack psychology" }),
        /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1 text-xs", children: scenario.tactics.map((t2) => /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsxs("span", { className: "text-destructive", children: [
            "▸ ",
            t2.name,
            ":"
          ] }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: t2.explain })
        ] }, t2.name)) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
        Button,
        {
          onClick: nextScenario,
          className: "border border-primary bg-primary/10 text-primary hover:bg-primary/20",
          children: idx + 1 < queue.length ? "▶ next scenario" : "▶ generate report"
        }
      ) })
    ] }),
    phase === "report" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-primary/60 bg-background/40 p-5 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "cyber defense rating" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 text-5xl font-bold text-primary text-glow-strong", children: score }),
        /* @__PURE__ */ jsx("div", { className: `mt-1 text-sm uppercase tracking-widest ${rank(score).tone}`, children: rank(score).label })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-2 text-sm sm:grid-cols-2", children: [
        /* @__PURE__ */ jsx(Stat, { label: "Phishing detection accuracy", value: `${Math.round(history.filter((h) => h.safe).length / Math.max(1, history.length) * 100)}%` }),
        /* @__PURE__ */ jsx(Stat, { label: "Safe decisions", value: `${history.filter((h) => h.safe).length} / ${history.length}` }),
        /* @__PURE__ */ jsx(Stat, { label: "Risky / impulsive actions", value: `${history.filter((h) => !h.safe).length}` }),
        /* @__PURE__ */ jsx(Stat, { label: "Verification behaviour", value: `${history.filter((h) => h.action === "verify_sender").length}× used` }),
        /* @__PURE__ */ jsx(Stat, { label: "Reporting behaviour", value: `${history.filter((h) => h.action === "report").length}× reported` }),
        /* @__PURE__ */ jsx(Stat, { label: "Difficulty completed", value: diff })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-background/40 p-3 text-xs", children: [
        /* @__PURE__ */ jsx("div", { className: "uppercase tracking-widest text-accent", children: "// personalised insights" }),
        /* @__PURE__ */ jsxs("ul", { className: "mt-2 space-y-1 text-foreground", children: [
          history.some((h) => h.action === "verify_sender") ? /* @__PURE__ */ jsx("li", { className: "text-primary", children: "✓ Strong verification habit — you check before you act." }) : /* @__PURE__ */ jsx("li", { className: "text-destructive", children: "✗ You rarely verified the sender — make this your default reflex." }),
          history.some((h) => h.action === "report") ? /* @__PURE__ */ jsx("li", { className: "text-primary", children: "✓ Good reporting reflex — you protect others, not just yourself." }) : /* @__PURE__ */ jsx("li", { className: "text-accent", children: "~ Few reports filed — reporting kills the campaign for everyone." }),
          history.some((h) => h.action === "open_link" || h.action === "download") ? /* @__PURE__ */ jsx("li", { className: "text-destructive", children: "✗ Impulsive clicks detected — slow down on urgency-laden messages." }) : /* @__PURE__ */ jsx("li", { className: "text-primary", children: "✓ Strong resistance to bait links and attachments." }),
          history.some((h) => h.action === "reply") ? /* @__PURE__ */ jsx("li", { className: "text-accent", children: "~ Replies confirm you're a live target — engage less, verify more." }) : /* @__PURE__ */ jsx("li", { className: "text-primary", children: "✓ You avoided engaging with attackers directly." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            className: "border-border",
            onClick: () => {
              setIdx(0);
              setHistory([]);
              setScore(70);
              setPhase("intro");
            },
            children: "↻ retry simulation"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: finishAndReport,
            className: "border border-primary bg-primary/10 text-primary text-glow hover:bg-primary/20",
            children: "▶ continue to incident response"
          }
        )
      ] })
    ] })
  ] });
}
function Stat({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-background/30 p-2", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-foreground", children: value })
  ] });
}
function rankFor(score, lang) {
  const en = score >= 90 ? "EXPERT" : score >= 75 ? "ANALYST" : score >= 50 ? "RESPONDER" : score >= 25 ? "TRAINEE" : "BEGINNER";
  const hi = score >= 90 ? "विशेषज्ञ" : score >= 75 ? "विश्लेषक" : score >= 50 ? "प्रतिक्रियाकर्ता" : score >= 25 ? "प्रशिक्षु" : "शुरुआती";
  return lang === "hi" ? hi : en;
}
function rankIconFor(score) {
  if (score >= 90) return "🛡️";
  if (score >= 75) return "🎖️";
  if (score >= 50) return "⚔️";
  if (score >= 25) return "🔰";
  return "🌱";
}
function StoryPopup({ story, onClose, t }) {
  const tone = story.tone === "good" ? "border-primary text-primary" : story.tone === "bad" ? "border-destructive text-destructive" : "border-accent text-accent";
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur animate-fade-in", children: /* @__PURE__ */ jsxs("div", { className: `w-full max-w-md rounded-md border ${tone} bg-card/95 p-5 shadow-2xl border-glow scanlines`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b border-border pb-2 text-xs uppercase tracking-widest text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { className: tone, children: [
        "// ",
        t("transmission", "संदेश")
      ] }),
      /* @__PURE__ */ jsx("span", { className: "ml-auto cursor-blink", children: "▌" })
    ] }),
    /* @__PURE__ */ jsx("h4", { className: `mt-3 text-sm font-bold uppercase tracking-widest ${tone} text-glow`, children: story.title }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground", children: story.body }),
    /* @__PURE__ */ jsxs(
      Button,
      {
        onClick: onClose,
        className: "mt-4 w-full border border-primary bg-primary/10 text-primary text-glow hover:bg-primary/20",
        children: [
          "▶ ",
          t("continue", "जारी रखें")
        ]
      }
    )
  ] }) });
}
function PostSimulation({ password, onRestart }) {
  const { t, lang } = useLang();
  const [scenario, setScenario] = useState(() => pickRandomScenario());
  const [irOptions, setIrOptions] = useState(() => pickIROptions());
  const [stage, setStage] = useState("recap");
  const [chosen, setChosen] = useState(null);
  const [damage, setDamage] = useState(0);
  const [locked, setLocked] = useState(false);
  const [classify, setClassify] = useState({});
  const [classifySubmitted, setClassifySubmitted] = useState(false);
  const [forensicsTime, setForensicsTime] = useState(60);
  const [kcOrder, setKcOrder] = useState([]);
  const [kcSubmitted, setKcSubmitted] = useState(false);
  const [kcShuffleSeed, setKcShuffleSeed] = useState(0);
  const [phishVerdict, setPhishVerdict] = useState(null);
  const [irChoices, setIrChoices] = useState({});
  const [story, setStory] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLog, setAssistantLog] = useState([
    { from: "bot", text: t("Hi! I'm your Threat Assistant. Ask for a hint anytime.", "नमस्ते! मैं आपका थ्रेट असिस्टेंट हूँ। कभी भी संकेत माँगें।") }
  ]);
  useEffect(() => {
    setStory({
      title: `${t("Scenario", "परिदृश्य")}: ${loc(scenario.name, lang)}`,
      body: loc(scenario.recapStory, lang),
      tone: "warn"
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
  const shuffledKc = useMemo(() => {
    const ids = scenario.attackFlow.map((_, i) => i);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
  }, [scenario, kcShuffleSeed]);
  const kcCorrectCount = kcOrder.filter((id, idx) => id === idx).length;
  useEffect(() => {
    if (stage !== "forensics" || classifySubmitted) return;
    if (forensicsTime <= 0) {
      setClassifySubmitted(true);
      return;
    }
    const id = setTimeout(() => setForensicsTime((t2) => t2 - 1), 1e3);
    return () => clearTimeout(id);
  }, [stage, forensicsTime, classifySubmitted]);
  const score = useMemo(() => {
    let s = 0;
    if (chosen?.verdict === "correct") s += 22;
    else if (chosen?.verdict === "partial") s += 11;
    const kcWrong = kcOrder.length - kcCorrectCount;
    s += kcCorrectCount * 5 - kcWrong * 2;
    let cc = 0, cw = 0;
    scenario.logs.forEach((l) => {
      const expected = l.suspicious ? l.category ?? "Benign" : "Benign";
      const actual = classify[l.id];
      if (actual && actual === expected) cc++;
      else if (actual && actual !== expected) cw++;
    });
    s += cc * 5 - cw * 5;
    if (classifySubmitted) s += Math.floor(forensicsTime / 6);
    if (phishVerdict && phishVerdict === "phish" === scenario.phish.isPhish) s += 15;
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
    const next = [...assistantLog, { from: "you", text: q }];
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
  const colorVerdict = (v) => v === "correct" ? "text-primary" : v === "partial" ? "text-accent" : "text-destructive";
  const verdictLabel = (v) => v === "correct" ? t("CORRECT", "सही") : v === "partial" ? t("PARTIAL", "आंशिक") : t("WRONG", "ग़लत");
  const STAGES = ["recap", "decision", "consequence", "explain", "killchain", "forensics", "phishing", "incident", "score"];
  const STAGE_LABEL = {
    recap: t("recap", "सारांश"),
    decision: t("decision", "निर्णय"),
    consequence: t("consequence", "परिणाम"),
    explain: t("explain", "व्याख्या"),
    killchain: t("kill-chain", "किल-चेन"),
    forensics: t("forensics", "फॉरेंसिक"),
    phishing: t("phishing", "फ़िशिंग"),
    incident: t("incident", "घटना"),
    score: t("score", "स्कोर")
  };
  const stageIndex = STAGES.indexOf(stage);
  const goPrev = () => stageIndex > 0 && setStage(STAGES[stageIndex - 1]);
  const goNext = () => stageIndex < STAGES.length - 1 && setStage(STAGES[stageIndex + 1]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    story && /* @__PURE__ */ jsx(StoryPopup, { story, onClose: () => setStory(null), t }),
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-background/80 backdrop-blur-sm p-4 sm:p-8 animate-fade-in", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-3xl rounded-md border border-primary/40 bg-card/95 shadow-2xl border-glow scanlines", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 border-b border-border p-4", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-xs uppercase tracking-widest text-primary text-glow", children: [
          "// ",
          t("step", "चरण"),
          " ",
          stageIndex + 1,
          " / ",
          STAGES.length
        ] }),
        /* @__PURE__ */ jsx("span", { className: "rounded-sm border border-accent/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-accent", children: loc(scenario.name, lang) }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: reshuffle,
            className: "rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground",
            children: [
              "⟲ ",
              t("randomize", "बेतरतीब")
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-3 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: t("DAMAGE", "नुकसान") }),
          /* @__PURE__ */ jsx("div", { className: "h-2 w-24 overflow-hidden rounded-sm bg-muted", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full transition-all",
              style: {
                width: `${damage}%`,
                background: damage > 60 ? "var(--neon-red)" : damage > 30 ? "var(--neon-amber)" : "var(--neon-green)"
              }
            }
          ) }),
          /* @__PURE__ */ jsxs("span", { className: "w-8 text-right", children: [
            damage,
            "%"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-1 w-full bg-muted", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full bg-primary transition-all",
          style: { width: `${(stageIndex + 1) / STAGES.length * 100}%`, boxShadow: "var(--terminal-glow)" }
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 px-4 pt-3 text-[10px]", children: STAGES.map((s, i) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setStage(s),
          className: `rounded-sm border px-2 py-0.5 uppercase tracking-widest ${i === stageIndex ? "border-primary bg-primary/10 text-primary text-glow" : i < stageIndex ? "border-primary/40 text-primary/70" : "border-border text-muted-foreground hover:text-foreground"}`,
          children: i + 1
        },
        s
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-6", children: [
        stage === "recap" && /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-lg border border-destructive/50 bg-gradient-to-br from-card/95 via-card/80 to-destructive/10 p-0 backdrop-blur animate-fade-in border-glow", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-destructive", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-flex h-2 w-2 animate-ping rounded-full bg-destructive" }),
            /* @__PURE__ */ jsx("span", { className: "inline-flex h-2 w-2 -ml-3 rounded-full bg-destructive" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: t("// LIVE INCIDENT // CODE RED //", "// सक्रिय घटना // कोड रेड //") }),
            /* @__PURE__ */ jsx("span", { className: "ml-auto font-mono text-foreground", children: (/* @__PURE__ */ new Date()).toLocaleTimeString() })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "absolute -right-16 -top-16 h-56 w-56 rounded-full bg-destructive/15 blur-3xl" }),
          /* @__PURE__ */ jsx("div", { className: "absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" }),
          /* @__PURE__ */ jsxs("div", { className: "relative p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-4 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-full border-2 border-destructive/60 bg-destructive/10 text-3xl shadow-[0_0_30px_rgba(255,0,80,0.3)]", children: "🚨" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.25em] text-destructive", children: t("breach detected", "उल्लंघन पाया गया") }),
                /* @__PURE__ */ jsx("h3", { className: "font-mono text-2xl font-black text-foreground text-glow leading-tight", children: loc(scenario.name, lang) }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-widest", children: [
                  /* @__PURE__ */ jsx("span", { className: "rounded-sm border border-destructive/60 bg-destructive/10 px-2 py-0.5 text-destructive", children: t("severity: critical", "गंभीरता: गंभीर") }),
                  /* @__PURE__ */ jsx("span", { className: "rounded-sm border border-accent/60 bg-accent/10 px-2 py-0.5 text-accent", children: t("status: active", "स्थिति: सक्रिय") }),
                  /* @__PURE__ */ jsx("span", { className: "rounded-sm border border-primary/60 bg-primary/10 px-2 py-0.5 text-primary", children: t("you: lead responder", "आप: मुख्य प्रतिक्रियाकर्ता") })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mb-4 grid gap-2 sm:grid-cols-2", children: [
              { icon: "🎯", k: t("Attack vector", "हमले का प्रकार"), v: loc(scenario.attackType, lang), tone: "destructive" },
              { icon: "🚪", k: t("Entry point", "प्रवेश बिंदु"), v: loc(scenario.entry, lang), tone: "accent" },
              { icon: "🔑", k: t("Target credential", "लक्ष्य क्रेडेंशियल"), v: `"${password}"`, tone: "accent" },
              { icon: "💻", k: t("Systems affected", "प्रभावित सिस्टम"), v: loc(scenario.systems, lang), tone: "primary" }
            ].map((tile, i) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: `group rounded-md border bg-background/50 p-2.5 transition-all hover:-translate-y-0.5 ${tile.tone === "destructive" ? "border-destructive/40 hover:border-destructive/70" : tile.tone === "accent" ? "border-accent/40 hover:border-accent/70" : "border-primary/40 hover:border-primary/70"}`,
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-muted-foreground", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-lg", children: tile.icon }),
                    tile.k
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono text-sm text-foreground", children: tile.v })
                ]
              },
              i
            )) }),
            /* @__PURE__ */ jsxs("div", { className: "mb-4 rounded-md border border-primary/30 bg-black/40 p-3 font-mono text-xs leading-relaxed text-primary", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-1 text-[10px] uppercase tracking-widest text-muted-foreground", children: [
                "▌ ",
                t("intel feed", "इंटेल फ़ीड")
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-foreground", children: [
                /* @__PURE__ */ jsx("span", { className: "text-primary", children: "$" }),
                " tail -f /var/log/incident.log"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 whitespace-pre-line text-accent", children: loc(scenario.recapStory, lang) }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 text-primary", children: [
                "> ",
                t("Mission: contain. investigate. recover.", "मिशन: रोकें। जाँचें। ठीक करें।"),
                /* @__PURE__ */ jsx("span", { className: "cursor-blink", children: "▌" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Button, { className: "w-full border border-primary bg-primary/15 text-primary text-glow hover:bg-primary/25 text-sm uppercase tracking-widest", onClick: () => setStage("decision"), children: [
              "⚡ ",
              t("take command — make first call", "कमान सँभालें — पहला निर्णय लें")
            ] })
          ] })
        ] }),
        stage === "decision" && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-accent/40 bg-gradient-to-br from-card/95 to-accent/5 p-5 backdrop-blur animate-fade-in", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full border border-accent/60 bg-accent/10 text-xl animate-pulse", children: "⚡" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.25em] text-accent", children: t("decision point", "निर्णय बिंदु") }),
              /* @__PURE__ */ jsx("h3", { className: "font-mono text-lg font-bold text-foreground text-glow", children: t("the next 60 seconds decide everything", "अगले 60 सेकंड सब तय करेंगे") })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "ml-auto rounded-sm border border-destructive/60 bg-destructive/10 px-2 py-1 font-mono text-xs text-destructive animate-pulse", children: [
              "⏱ ",
              t("CLOCK RUNNING", "घड़ी चल रही")
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: t("Each choice carries hidden cost. Read carefully — wrong moves cascade.", "हर विकल्प की छुपी कीमत है। ध्यान से पढ़ें — ग़लत कदम बढ़ते जाते हैं।") }),
          /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: scenario.decisions.map((d, di) => /* @__PURE__ */ jsx(
            "button",
            {
              disabled: locked && chosen?.id !== d.id,
              onClick: () => {
                setChosen(d);
                setDamage((x) => Math.min(100, x + d.damage));
                setStory({
                  title: d.verdict === "correct" ? t("Clean call.", "सही फ़ैसला।") : d.verdict === "partial" ? t("Mixed outcome…", "मिश्रित परिणाम…") : t("Things just got worse.", "हालात और बिगड़ गए।"),
                  body: loc(d.story, lang),
                  tone: d.verdict === "correct" ? "good" : d.verdict === "partial" ? "warn" : "bad"
                });
                setStage("consequence");
              },
              className: `group relative w-full overflow-hidden rounded-md border px-3 py-3 text-left transition-all ${chosen?.id === d.id ? "border-primary bg-primary/10 -translate-y-0.5" : "border-border bg-background/40 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5"} disabled:opacity-40 disabled:hover:translate-y-0`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background/60 font-mono text-xs text-primary", children: String.fromCharCode(65 + di) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-sm text-foreground", children: loc(d.label, lang) }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex flex-wrap gap-1 text-[9px] uppercase tracking-widest", children: [
                    /* @__PURE__ */ jsxs("span", { className: `rounded-sm border px-1.5 py-0.5 ${d.damage > 50 ? "border-destructive/60 text-destructive" : d.damage > 20 ? "border-accent/60 text-accent" : "border-primary/60 text-primary"}`, children: [
                      t("risk", "जोखिम"),
                      ": ",
                      d.damage > 50 ? "■■■" : d.damage > 20 ? "■■□" : "■□□"
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "rounded-sm border border-border px-1.5 py-0.5 text-muted-foreground", children: [
                      t("impact", "प्रभाव"),
                      ": +",
                      d.damage,
                      "%"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "self-center text-lg text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary", children: "→" })
              ] })
            },
            d.id
          )) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex gap-2 text-xs", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setChosen(null);
                  setDamage(0);
                  setLocked(false);
                },
                className: "rounded-sm border border-border px-3 py-1 uppercase tracking-widest text-muted-foreground hover:text-foreground",
                children: [
                  "↶ ",
                  t("undo (learning mode)", "पूर्ववत करें (शिक्षण मोड)")
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setLocked(true),
                className: "rounded-sm border border-accent/60 px-3 py-1 uppercase tracking-widest text-accent hover:bg-accent/10",
                children: [
                  "🔒 ",
                  t("lock decision (challenge)", "निर्णय लॉक करें (चुनौती)")
                ]
              }
            )
          ] })
        ] }),
        stage === "consequence" && chosen && /* @__PURE__ */ jsxs("div", { className: `relative overflow-hidden rounded-lg border-2 ${chosen.verdict === "correct" ? "border-primary/60" : chosen.verdict === "partial" ? "border-accent/60" : "border-destructive/60"} bg-card/80 p-0 backdrop-blur animate-scale-in border-glow`, children: [
          /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.25em] ${chosen.verdict === "correct" ? "bg-primary/10 text-primary" : chosen.verdict === "partial" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`, children: [
            /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
              "// ",
              t("aftermath report", "परिणाम रिपोर्ट")
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "ml-auto font-mono", children: [
              "T+",
              chosen.verdict === "wrong" ? "13m" : chosen.verdict === "partial" ? "6m" : "90s"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "absolute -right-12 -top-12 h-40 w-40 rounded-full bg-current opacity-10 blur-3xl" }),
          /* @__PURE__ */ jsxs("div", { className: "relative p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-3 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center", children: [
              /* @__PURE__ */ jsx("div", { className: `flex h-20 w-20 items-center justify-center rounded-full border-2 text-5xl ${chosen.verdict === "correct" ? "border-primary bg-primary/10" : chosen.verdict === "partial" ? "border-accent bg-accent/10" : "border-destructive bg-destructive/10 animate-pulse"}`, children: chosen.verdict === "correct" ? "✅" : chosen.verdict === "partial" ? "⚠️" : "💥" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: `text-[10px] uppercase tracking-[0.25em] ${colorVerdict(chosen.verdict)}`, children: [
                  t("verdict", "फ़ैसला"),
                  ": ",
                  verdictLabel(chosen.verdict)
                ] }),
                /* @__PURE__ */ jsx("div", { className: `mt-1 font-mono text-xl font-bold leading-tight ${colorVerdict(chosen.verdict)}`, children: loc(chosen.outcome, lang) })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mb-3 grid grid-cols-3 gap-2 text-xs", children: [
              { k: t("RESPONSE", "प्रतिक्रिया"), v: chosen.verdict === "wrong" ? "13m" : chosen.verdict === "partial" ? "6m" : "90s", icon: "⏱" },
              { k: t("BLAST", "विस्फोट"), v: `${chosen.damage}%`, icon: "💢" },
              { k: t("SYSTEMS", "सिस्टम"), v: chosen.damage > 50 ? t("DOWN", "बंद") : t("UP", "चालू"), icon: chosen.damage > 50 ? "🔴" : "🟢" }
            ].map((m, i) => /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-background/60 p-2.5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-[9px] uppercase tracking-widest text-muted-foreground", children: [
                /* @__PURE__ */ jsx("span", { children: m.icon }),
                m.k
              ] }),
              /* @__PURE__ */ jsx("div", { className: `mt-1 font-mono text-lg font-bold ${colorVerdict(chosen.verdict)}`, children: m.v })
            ] }, i)) }),
            /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-1 flex justify-between text-[9px] uppercase tracking-widest text-muted-foreground", children: [
                /* @__PURE__ */ jsx("span", { children: t("blast radius", "विस्फोट दायरा") }),
                /* @__PURE__ */ jsxs("span", { children: [
                  chosen.damage,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "h-2 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: `h-full transition-all duration-1000 ${chosen.damage > 50 ? "bg-destructive" : chosen.damage > 20 ? "bg-accent" : "bg-primary"}`,
                  style: { width: `${chosen.damage}%` }
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-accent/40 bg-accent/5 p-2.5", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-[10px] uppercase tracking-widest text-accent", children: [
                  "💡 ",
                  t("analyst insight", "विश्लेषक अंतर्दृष्टि")
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-foreground", children: loc(chosen.hint, lang) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-background/40 p-2.5", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: [
                  "📖 ",
                  t("what happened next", "उसके बाद क्या हुआ")
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs italic text-foreground", children: loc(chosen.story, lang) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Button, { className: "mt-4 w-full border border-primary bg-primary/15 text-primary text-glow hover:bg-primary/25 text-sm uppercase tracking-widest", onClick: () => setStage("explain"), children: [
              "🔍 ",
              t("dissect the attack", "हमला विच्छेदित करें")
            ] })
          ] })
        ] }),
        stage === "explain" && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-primary/40 bg-gradient-to-br from-card/95 to-primary/5 p-5 backdrop-blur animate-fade-in", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-md border border-primary/60 bg-primary/10 text-xl", children: "🧬" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.25em] text-primary", children: t("attack anatomy", "हमले की संरचना") }),
              /* @__PURE__ */ jsx("h3", { className: "font-mono text-lg font-bold text-foreground", children: t("inside the attacker's playbook", "हमलावर की प्लेबुक के अंदर") })
            ] })
          ] }),
          /* @__PURE__ */ jsx("ol", { className: "relative space-y-3 border-l-2 border-dashed border-primary/40 pl-6", children: scenario.attackFlow.map((s, i) => {
            const phases = ["🕵️", "🎯", "🔓", "👻", "💣"];
            const phaseLabels = [
              t("recon", "टोही"),
              t("intrude", "घुसपैठ"),
              t("escalate", "ऊँचा करें"),
              t("evade", "बचाव"),
              t("impact", "प्रभाव")
            ];
            const phaseIdx = Math.min(i, phases.length - 1);
            return /* @__PURE__ */ jsxs("li", { className: "relative", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute -left-[34px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/60 bg-background text-base shadow-[0_0_15px_rgba(0,200,200,0.3)]", children: phases[phaseIdx] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-background/60 p-3 transition hover:border-primary/60 hover:-translate-y-0.5", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-1 flex items-center gap-2", children: /* @__PURE__ */ jsxs("span", { className: "rounded-sm border border-primary/60 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary", children: [
                  String(i + 1).padStart(2, "0"),
                  " · ",
                  phaseLabels[phaseIdx]
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: "font-bold text-sm text-foreground", children: loc(s.step, lang) }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: loc(s.detail, lang) })
              ] })
            ] }, i);
          }) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 rounded-md border border-accent/40 bg-accent/5 p-3", children: [
            /* @__PURE__ */ jsxs("h4", { className: "mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-accent", children: [
              /* @__PURE__ */ jsx("span", { className: "text-lg", children: "🛡️" }),
              " ",
              t("defender's playbook — what would've stopped this", "रक्षक की प्लेबुक — क्या इसे रोकता")
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid gap-1.5 sm:grid-cols-2", children: scenario.fixes.map((f, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 rounded-sm border border-border bg-background/40 px-2 py-1.5 text-xs text-foreground", children: [
              /* @__PURE__ */ jsx("span", { className: "text-primary", children: "✓" }),
              /* @__PURE__ */ jsx("span", { children: loc(f, lang) })
            ] }, i)) })
          ] }),
          /* @__PURE__ */ jsxs(Button, { className: "mt-4 w-full border border-primary bg-primary/15 text-primary text-glow hover:bg-primary/25 text-sm uppercase tracking-widest", onClick: () => setStage("killchain"), children: [
            "🧩 ",
            t("now you try — rebuild the kill-chain", "अब आप करें — किल-चेन बनाएँ")
          ] })
        ] }),
        stage === "killchain" && /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-primary/40 bg-card/60 p-5 backdrop-blur animate-fade-in", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-sm uppercase tracking-widest text-primary text-glow", children: [
              "// ",
              t("kill-chain reconstructor", "किल-चेन पुनर्निर्माण")
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "rounded-sm border border-accent/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-accent", children: [
              kcOrder.length,
              "/",
              scenario.attackFlow.length
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mb-3 text-xs text-muted-foreground", children: [
            "🧩 ",
            t(
              "The attack steps below are shuffled. Click them in the order an attacker would actually run them — recon first, impact last. Wrong picks lock in. No second chances.",
              "नीचे के चरण बेतरतीब हैं। हमलावर वास्तव में जिस क्रम में करेगा, उसी क्रम में क्लिक करें — पहले टोही, अंत में प्रभाव।"
            )
          ] }),
          /* @__PURE__ */ jsx("ol", { className: "mb-4 space-y-1.5", children: Array.from({ length: scenario.attackFlow.length }).map((_, idx) => {
            const pickedIdx = kcOrder[idx];
            const step = pickedIdx != null ? scenario.attackFlow[pickedIdx] : null;
            const right = pickedIdx != null && pickedIdx === idx;
            const wrong = kcSubmitted && pickedIdx != null && pickedIdx !== idx;
            return /* @__PURE__ */ jsxs(
              "li",
              {
                className: `flex items-center gap-2 rounded-sm border px-2 py-1.5 text-xs ${step ? right ? "border-primary/60 bg-primary/10 text-foreground" : wrong ? "border-destructive/60 bg-destructive/10 text-destructive" : "border-accent/40 bg-accent/5 text-foreground" : "border-dashed border-border text-muted-foreground"}`,
                children: [
                  /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] text-muted-foreground", children: [
                    idx + 1,
                    "."
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "flex-1", children: step ? loc(step.step, lang) : t("— empty slot —", "— खाली स्थान —") }),
                  kcSubmitted && step && (right ? "✓" : "✗")
                ]
              },
              idx
            );
          }) }),
          !kcSubmitted && /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: shuffledKc.filter((id) => !kcOrder.includes(id)).map((id) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setKcOrder([...kcOrder, id]),
              className: "rounded-sm border border-border bg-background/40 px-2 py-1.5 text-left text-xs text-foreground transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5",
              children: [
                "→ ",
                loc(scenario.attackFlow[id].step, lang)
              ]
            },
            id
          )) }),
          kcSubmitted && /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-1.5 text-xs", children: scenario.attackFlow.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-muted/30 p-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] uppercase tracking-widest text-accent", children: [
              t("correct", "सही"),
              " ",
              i + 1,
              "."
            ] }),
            /* @__PURE__ */ jsx("div", { className: "font-bold text-foreground", children: loc(s.step, lang) }),
            /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: loc(s.detail, lang) })
          ] }, i)) }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: !kcSubmitted ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                disabled: kcOrder.length === 0,
                onClick: () => setKcOrder(kcOrder.slice(0, -1)),
                variant: "outline",
                className: "border-border text-xs uppercase tracking-widest",
                children: [
                  "↶ ",
                  t("undo last", "अंतिम पूर्ववत")
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                disabled: kcOrder.length !== scenario.attackFlow.length,
                onClick: () => {
                  setKcSubmitted(true);
                  const right = kcOrder.filter((id, idx) => id === idx).length;
                  setStory({
                    title: `${t("Kill-chain", "किल-चेन")}: ${right}/${scenario.attackFlow.length}`,
                    body: right === scenario.attackFlow.length ? t("Flawless reconstruction. You'd brief this scenario to executives without a single correction.", "बेदाग पुनर्निर्माण। आप यह परिदृश्य अधिकारियों को बिना सुधार के बता सकते हैं।") : right >= 3 ? t("Close — but the order you got wrong is exactly where defenders lose minutes during a real breach.", "करीब — पर जो क्रम ग़लत हुआ, वहीं असली हमले में मिनट खोते हैं।") : t("The attacker doesn't think in your order. Study the kill-chain — recon → access → action.", "हमलावर आपके क्रम में नहीं सोचता। किल-चेन पढ़ें — टोही → प्रवेश → कार्रवाई।"),
                    tone: right === scenario.attackFlow.length ? "good" : right >= 3 ? "warn" : "bad"
                  });
                },
                className: "border border-primary bg-primary/10 text-primary hover:bg-primary/20",
                children: t("submit chain", "चेन जमा करें")
              }
            )
          ] }) : /* @__PURE__ */ jsxs(Button, { onClick: () => setStage("forensics"), className: "border border-primary bg-primary/10 text-primary hover:bg-primary/20", children: [
            "▶ ",
            t("threat classifier", "थ्रेट क्लासिफायर")
          ] }) })
        ] }),
        stage === "forensics" && /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-accent/40 bg-card/60 p-5 backdrop-blur animate-fade-in", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-sm uppercase tracking-widest text-primary text-glow", children: [
              "// ",
              t("threat classifier — MITRE-style triage", "थ्रेट क्लासिफायर — MITRE शैली ट्राइएज")
            ] }),
            /* @__PURE__ */ jsxs("span", { className: `rounded-sm border px-2 py-0.5 font-mono text-xs ${forensicsTime <= 15 ? "border-destructive text-destructive animate-pulse" : "border-accent/60 text-accent"}`, children: [
              "⏱ ",
              String(Math.max(0, forensicsTime)).padStart(2, "0"),
              "s"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mb-3 text-xs text-muted-foreground", children: [
            "🔬 ",
            t(
              "For every log line, pick the attacker tactic — or mark it Benign. Wrong category costs more than skipping. The clock is running.",
              "हर लॉग के लिए हमलावर तकनीक चुनें — या सामान्य चिह्नित करें। ग़लत श्रेणी छोड़ने से ज़्यादा महंगी।"
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-muted-foreground", children: [
              /* @__PURE__ */ jsx("th", { className: "p-1 text-left", children: t("time", "समय") }),
              /* @__PURE__ */ jsx("th", { className: "p-1 text-left", children: t("ip", "ip") }),
              /* @__PURE__ */ jsx("th", { className: "p-1 text-left", children: t("user", "उपयोगकर्ता") }),
              /* @__PURE__ */ jsx("th", { className: "p-1 text-left", children: t("event", "घटना") }),
              /* @__PURE__ */ jsx("th", { className: "p-1 text-left", children: t("tactic", "तकनीक") })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: scenario.logs.map((l) => {
              const expected = l.suspicious ? l.category ?? "Benign" : "Benign";
              const picked = classify[l.id];
              const right = classifySubmitted && picked && picked === expected;
              const wrong = classifySubmitted && picked && picked !== expected;
              const missed = classifySubmitted && !picked && expected !== "Benign";
              return /* @__PURE__ */ jsxs("tr", { className: `border-t border-border ${right ? "bg-primary/10" : wrong ? "bg-destructive/10" : missed ? "bg-accent/10" : ""}`, children: [
                /* @__PURE__ */ jsx("td", { className: "p-1 text-foreground", children: l.time }),
                /* @__PURE__ */ jsx("td", { className: "p-1 text-foreground", children: l.ip }),
                /* @__PURE__ */ jsx("td", { className: "p-1 text-foreground", children: l.user }),
                /* @__PURE__ */ jsxs("td", { className: "p-1 text-muted-foreground", children: [
                  loc(l.event, lang),
                  classifySubmitted && l.suspicious && /* @__PURE__ */ jsxs("span", { className: "text-accent", children: [
                    " — ",
                    loc(l.reason, lang)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("td", { className: "p-1", children: [
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      disabled: classifySubmitted,
                      value: picked ?? "",
                      onChange: (e) => setClassify({ ...classify, [l.id]: e.target.value }),
                      className: "rounded-sm border border-border bg-input px-1 py-0.5 text-[11px] text-foreground",
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", children: t("— pick —", "— चुनें —") }),
                        TACTICS.map((tc) => /* @__PURE__ */ jsx("option", { value: tc, children: loc(TACTIC_LABEL[tc], lang) }, tc))
                      ]
                    }
                  ),
                  classifySubmitted && wrong && /* @__PURE__ */ jsxs("div", { className: "mt-0.5 text-[10px] text-accent", children: [
                    "→ ",
                    loc(TACTIC_LABEL[expected], lang)
                  ] })
                ] })
              ] }, l.id);
            }) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: !classifySubmitted ? /* @__PURE__ */ jsx(
            Button,
            {
              onClick: () => {
                setClassifySubmitted(true);
                let cc = 0, cw = 0, miss = 0;
                scenario.logs.forEach((l) => {
                  const expected = l.suspicious ? l.category ?? "Benign" : "Benign";
                  const picked = classify[l.id];
                  if (picked && picked === expected) cc++;
                  else if (picked && picked !== expected) cw++;
                  else if (!picked && expected !== "Benign") miss++;
                });
                setStory({
                  title: `${t("Triage verdict", "ट्राइएज परिणाम")}: ${cc} ✓ / ${cw} ✗ / ${miss} ${t("missed", "छूटे")}`,
                  body: cw === 0 && miss === 0 ? t("Every signal mapped to the right tactic. This is exactly how a senior SOC analyst reads a wire.", "हर संकेत सही तकनीक से जुड़ा। यही वरिष्ठ SOC विश्लेषक की पहचान है।") : cw > miss ? t("Too many wrong labels — false categorisation sends responders chasing the wrong playbook.", "बहुत सी ग़लत श्रेणियाँ — टीम ग़लत प्लेबुक के पीछे दौड़ती है।") : t("You hesitated on entries you should have classified. Silence ≠ safety in a live incident.", "जिन्हें वर्गीकृत करना था, उनमें हिचकिचाए। चुप्पी = सुरक्षा नहीं।"),
                  tone: cw === 0 && miss === 0 ? "good" : cw > miss ? "bad" : "warn"
                });
              },
              className: "border border-primary bg-primary/10 text-primary hover:bg-primary/20",
              children: t("submit triage", "ट्राइएज जमा करें")
            }
          ) : /* @__PURE__ */ jsxs(Button, { onClick: () => setStage("phishing"), className: "border border-primary bg-primary/10 text-primary hover:bg-primary/20", children: [
            "▶ ",
            t("phishing trainer", "फ़िशिंग प्रशिक्षक")
          ] }) })
        ] }),
        stage === "phishing" && /* @__PURE__ */ jsx(
          PhishingSimulation,
          {
            onComplete: (r) => {
              setPhishVerdict(r.detectionAccuracy >= 0.5 ? "phish" : "real");
              setDamage(Math.max(0, Math.min(100, 100 - r.finalScore)));
              setStage("incident");
            }
          }
        ),
        stage === "incident" && /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-card/60 p-5 backdrop-blur animate-fade-in", children: [
          /* @__PURE__ */ jsxs("h3", { className: "mb-3 text-sm uppercase tracking-widest text-primary text-glow", children: [
            "// ",
            t("incident response walkthrough", "घटना प्रतिक्रिया गाइड")
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-4", children: INCIDENT_STEPS.map((step, idx) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "text-xs uppercase tracking-widest text-accent", children: [
              t("step", "चरण"),
              " ",
              idx + 1,
              " — ",
              loc(IR_STEP_LABEL[step], lang)
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 grid gap-2 sm:grid-cols-2", children: irOptions[step].map((opt, i) => {
              const picked = irChoices[step] === i;
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    setIrChoices({ ...irChoices, [step]: i });
                    setStory({
                      title: `${loc(IR_STEP_LABEL[step], lang)}: ${opt.correct ? t("good move", "अच्छा कदम") : t("bad move", "ग़लत कदम")}`,
                      body: opt.correct ? t(`Your ${step.toLowerCase()} call buys the team breathing room and a clean path forward.`, `आपका ${loc(IR_STEP_LABEL[step], lang)} फ़ैसला टीम को राहत और साफ़ रास्ता देता है।`) : t(`A wrong ${step.toLowerCase()} step here cascades — every later phase costs more time, money, and trust.`, `यहाँ ${loc(IR_STEP_LABEL[step], lang)} में ग़लत कदम आगे की हर अवस्था में समय, पैसा और भरोसा बढ़ाकर खर्च कराता है।`),
                      tone: opt.correct ? "good" : "bad"
                    });
                  },
                  className: `rounded-sm border px-2 py-1 text-left text-sm ${picked ? opt.correct ? "border-primary bg-primary/10 text-primary" : "border-destructive bg-destructive/10 text-destructive" : "border-border hover:bg-muted/40"}`,
                  children: [
                    picked && opt.correct ? "✓ " : picked && !opt.correct ? "✗ " : "→ ",
                    loc(opt.label, lang)
                  ]
                },
                i
              );
            }) })
          ] }, step)) }),
          /* @__PURE__ */ jsxs(Button, { className: "mt-4 border border-primary bg-primary/10 text-primary text-glow hover:bg-primary/20", onClick: () => setStage("score"), children: [
            "▶ ",
            t("final score", "अंतिम स्कोर")
          ] })
        ] }),
        stage === "score" && (() => {
          let correctClass = 0, wrongClass = 0, missedClass = 0;
          const totalSuspicious = scenario.logs.filter((l) => l.suspicious).length;
          scenario.logs.forEach((l) => {
            const expected = l.suspicious ? l.category ?? "Benign" : "Benign";
            const picked = classify[l.id];
            if (picked && picked === expected) correctClass++;
            else if (picked && picked !== expected) wrongClass++;
            else if (!picked && expected !== "Benign") missedClass++;
          });
          const kcTotal = scenario.attackFlow.length;
          const irCorrect = INCIDENT_STEPS.filter((k) => {
            const i = irChoices[k];
            return i != null && irOptions[k][i].correct;
          }).length;
          const phishRight = phishVerdict != null && phishVerdict === "phish" === scenario.phish.isPhish;
          const badges = [
            { icon: "🎯", en: "First Responder", hi: "प्रथम प्रतिक्रिया", earned: chosen?.verdict === "correct" },
            { icon: "🕵️", en: "Tactic Analyst", hi: "तकनीक विश्लेषक", earned: totalSuspicious > 0 && correctClass === totalSuspicious && wrongClass === 0 },
            { icon: "⛓️", en: "Chain Architect", hi: "चेन वास्तुकार", earned: kcCorrectCount === kcTotal && kcSubmitted },
            { icon: "🎣", en: "Phish Slayer", hi: "फ़िश-संहारक", earned: phishRight },
            { icon: "🛡️", en: "Containment Pro", hi: "रोकथाम विशेषज्ञ", earned: irCorrect >= 3 },
            { icon: "💎", en: "Zero Damage", hi: "शून्य नुकसान", earned: damage === 0 },
            { icon: "👑", en: "Perfect Run", hi: "सटीक रन", earned: score >= 95 }
          ];
          const earnedCount = badges.filter((b) => b.earned).length;
          const subs = [
            { en: "Decision", hi: "निर्णय", pct: chosen?.verdict === "correct" ? 100 : chosen?.verdict === "partial" ? 50 : chosen ? 10 : 0 },
            { en: "Kill-Chain", hi: "किल-चेन", pct: kcTotal ? Math.round(kcCorrectCount / kcTotal * 100) : 0 },
            { en: "Triage", hi: "ट्राइएज", pct: totalSuspicious ? Math.round(correctClass / totalSuspicious * 100) - wrongClass * 12 : 0 },
            { en: "Phishing", hi: "फ़िशिंग", pct: phishRight ? 100 : phishVerdict != null ? 0 : 0 },
            { en: "Response", hi: "प्रतिक्रिया", pct: Math.round(irCorrect / 4 * 100) },
            { en: "Containment", hi: "रोकथाम", pct: Math.max(0, 100 - damage) }
          ].map((s) => ({ ...s, pct: Math.max(0, Math.min(100, s.pct)) }));
          const timeline = [
            chosen ? {
              icon: chosen.verdict === "correct" ? "✓" : chosen.verdict === "partial" ? "~" : "✗",
              tone: chosen.verdict === "correct" ? "good" : chosen.verdict === "partial" ? "warn" : "bad",
              title: `${t("Decision", "निर्णय")}: ${loc(chosen.label, lang)}`,
              detail: `${verdictLabel(chosen.verdict)} · +${chosen.damage}% ${t("damage", "नुकसान")}`
            } : { icon: "·", tone: "muted", title: t("Decision skipped", "निर्णय छोड़ा"), detail: "—" },
            {
              icon: kcSubmitted ? kcCorrectCount === kcTotal ? "✓" : kcCorrectCount >= 3 ? "~" : "✗" : "·",
              tone: !kcSubmitted ? "muted" : kcCorrectCount === kcTotal ? "good" : kcCorrectCount >= 3 ? "warn" : "bad",
              title: t("Kill-chain reconstruction", "किल-चेन पुनर्निर्माण"),
              detail: `${kcCorrectCount}/${kcTotal} ${t("steps in order", "क्रम में चरण")}`
            },
            {
              icon: classifySubmitted ? wrongClass === 0 && missedClass === 0 ? "✓" : correctClass > 0 ? "~" : "✗" : "·",
              tone: !classifySubmitted ? "muted" : wrongClass === 0 && missedClass === 0 ? "good" : correctClass > 0 ? "warn" : "bad",
              title: t("Threat classification", "थ्रेट वर्गीकरण"),
              detail: `${correctClass} ✓ · ${wrongClass} ✗ · ${missedClass} ${t("missed", "छूटे")}`
            },
            {
              icon: phishVerdict == null ? "·" : phishRight ? "✓" : "✗",
              tone: phishVerdict == null ? "muted" : phishRight ? "good" : "bad",
              title: t("Phishing verdict", "फ़िशिंग निर्णय"),
              detail: phishVerdict == null ? "—" : `${phishVerdict.toUpperCase()} · ${t("actual was", "वास्तविक")} ${scenario.phish.isPhish ? "PHISH" : "REAL"}`
            },
            {
              icon: irCorrect === 4 ? "✓" : irCorrect >= 2 ? "~" : "✗",
              tone: irCorrect === 4 ? "good" : irCorrect >= 2 ? "warn" : "bad",
              title: t("Incident response", "घटना प्रतिक्रिया"),
              detail: `${irCorrect}/4 ${t("steps correct", "चरण सही")}`
            }
          ];
          const downloadReport = () => {
            const ts = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
            const line = "═".repeat(60);
            const body = [
              line,
              `  BREACH_LAB — INCIDENT REPORT`,
              `  Generated: ${(/* @__PURE__ */ new Date()).toLocaleString()}`,
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
              ...subs.map((s) => {
                const filled = Math.round(s.pct / 5);
                return `  ${s.en.padEnd(14)} [${"█".repeat(filled)}${"░".repeat(20 - filled)}] ${s.pct}%`;
              }),
              ``,
              `── REPLAY TIMELINE ──`,
              ...timeline.map((e, i) => `  ${i + 1}. [${e.icon}] ${e.title}
     ${e.detail}`),
              ``,
              `── BADGES ──`,
              ...badges.map((b) => `  ${b.earned ? "✓" : "·"} ${b.icon}  ${b.en}`),
              ``,
              `── RECOMMENDED FIXES ──`,
              ...scenario.fixes.map((f) => `  → ${loc(f, lang)}`),
              ``,
              line,
              `  This is a training exercise. No real systems were touched.`,
              line
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
                `Breach_Lab — ${rankFor(score, lang)} (${score}/100) · ${earnedCount}/${badges.length} badges · ${loc(scenario.name, lang)}`
              );
              toast.success(t("Summary copied", "सारांश कॉपी हुआ"));
            } catch {
            }
          };
          const downloadPDF = () => {
            const doc = new jsPDF({ unit: "pt", format: "a4" });
            const W = doc.internal.pageSize.getWidth();
            let y = 50;
            const line = (s, size = 10, bold = false, color = [30, 30, 40]) => {
              doc.setFont("helvetica", bold ? "bold" : "normal");
              doc.setFontSize(size);
              doc.setTextColor(...color);
              const wrapped = doc.splitTextToSize(s, W - 80);
              wrapped.forEach((w) => {
                if (y > 780) {
                  doc.addPage();
                  y = 50;
                }
                doc.text(w, 40, y);
                y += size + 4;
              });
            };
            const rule = () => {
              if (y > 780) {
                doc.addPage();
                y = 50;
              }
              doc.setDrawColor(0, 180, 200);
              doc.line(40, y, W - 40, y);
              y += 12;
            };
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
            doc.text((/* @__PURE__ */ new Date()).toLocaleString(), W - 200, 35);
            y = 100;
            line(`SCENARIO: ${loc(scenario.name, lang)}`, 12, true, [10, 10, 30]);
            line(`Attack: ${loc(scenario.attackType, lang)}`);
            line(`Entry:  ${loc(scenario.entry, lang)}`);
            line(`Systems: ${loc(scenario.systems, lang)}`);
            y += 8;
            rule();
            const severity = score >= 75 ? "LOW" : score >= 50 ? "MEDIUM" : score >= 25 ? "HIGH" : "CRITICAL";
            const sevColor = score >= 75 ? [0, 160, 90] : score >= 50 ? [220, 160, 0] : score >= 25 ? [220, 80, 40] : [200, 0, 0];
            line(`Responder Score: ${score} / 100`, 14, true);
            line(`Rank: ${rankFor(score, lang)}`, 11);
            line(`Severity: ${severity}`, 13, true, sevColor);
            line(`Damage taken: ${damage}%`);
            line(`Badges earned: ${earnedCount} / ${badges.length}`);
            y += 8;
            rule();
            line("PERFORMANCE BREAKDOWN", 12, true);
            subs.forEach((s) => {
              const filled = Math.round(s.pct / 5);
              line(`${(lang === "hi" ? s.hi : s.en).padEnd(14)}  [${"#".repeat(filled)}${".".repeat(20 - filled)}] ${s.pct}%`, 9);
            });
            y += 6;
            rule();
            line("REPLAY TIMELINE", 12, true);
            timeline.forEach((e, i) => {
              line(`${i + 1}. [${e.icon}] ${e.title}`, 10, true);
              line(`   ${e.detail}`, 9, false, [80, 80, 90]);
            });
            y += 6;
            rule();
            line("BADGES", 12, true);
            badges.forEach((b) => line(`${b.earned ? "[x]" : "[ ]"} ${b.icon} ${lang === "hi" ? b.hi : b.en}`, 10));
            y += 6;
            rule();
            line("RECOMMENDED FIXES", 12, true);
            scenario.fixes.forEach((f) => line(`- ${loc(f, lang)}`, 10));
            y += 10;
            line("Training exercise only. No real systems were touched.", 9, false, [120, 120, 130]);
            doc.save(`breach-lab-report-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/[:T]/g, "-")}.pdf`);
            toast.success(t("PDF report downloaded", "PDF रिपोर्ट डाउनलोड हुई"));
          };
          const toneColor = (tone) => tone === "good" ? "border-primary/60 text-primary" : tone === "warn" ? "border-accent/60 text-accent" : tone === "bad" ? "border-destructive/60 text-destructive" : "border-border text-muted-foreground";
          return /* @__PURE__ */ jsxs("div", { className: "space-y-5 animate-fade-in", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-lg border border-primary/50 bg-gradient-to-br from-card/90 via-card/70 to-primary/10 p-6 backdrop-blur border-glow", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/15 blur-3xl" }),
              /* @__PURE__ */ jsx("div", { className: "absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-accent/15 blur-3xl" }),
              /* @__PURE__ */ jsxs("div", { className: "relative grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-6xl", children: rankIconFor(score) }),
                  /* @__PURE__ */ jsx("div", { className: "mt-1 text-[10px] uppercase tracking-[0.2em] text-accent", children: rankFor(score, lang) })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-[10px] uppercase tracking-[0.2em] text-muted-foreground", children: [
                    "// ",
                    t("responder score", "रिस्पॉन्डर स्कोर")
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "font-mono text-7xl font-black text-primary text-glow-strong leading-none", children: score }),
                    /* @__PURE__ */ jsx("div", { className: "pb-2 text-xl text-muted-foreground", children: "/ 100" })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "mt-3 h-2 overflow-hidden rounded-sm bg-muted", children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "h-full bg-gradient-to-r from-accent via-primary to-primary transition-all",
                      style: { width: `${score}%`, boxShadow: "var(--terminal-glow)" }
                    }
                  ) }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2 text-xs text-muted-foreground", children: [
                    "🏆 ",
                    earnedCount,
                    " / ",
                    badges.length,
                    " ",
                    t("badges earned", "बैज प्राप्त")
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-card/60 p-5 backdrop-blur", children: [
              /* @__PURE__ */ jsxs("h4", { className: "mb-3 text-xs uppercase tracking-widest text-primary text-glow", children: [
                "// ",
                t("performance dashboard", "प्रदर्शन डैशबोर्ड")
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2", children: subs.map((s) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs", children: [
                /* @__PURE__ */ jsx("span", { className: "w-24 shrink-0 uppercase tracking-widest text-muted-foreground", children: lang === "hi" ? s.hi : s.en }),
                /* @__PURE__ */ jsxs("div", { className: "relative h-4 flex-1 overflow-hidden rounded-sm border border-border bg-background/40", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: `h-full transition-all ${s.pct >= 75 ? "bg-primary" : s.pct >= 40 ? "bg-accent" : "bg-destructive"}`,
                      style: { width: `${s.pct}%`, boxShadow: s.pct >= 75 ? "var(--terminal-glow)" : void 0 }
                    }
                  ),
                  /* @__PURE__ */ jsxs("span", { className: "absolute inset-0 flex items-center justify-end px-2 font-mono text-[10px] text-foreground/80", children: [
                    s.pct,
                    "%"
                  ] })
                ] })
              ] }, s.en)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-card/60 p-5 backdrop-blur", children: [
              /* @__PURE__ */ jsxs("h4", { className: "mb-3 text-xs uppercase tracking-widest text-accent", children: [
                "// ",
                t("badges", "बैज")
              ] }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2 sm:grid-cols-6", children: badges.map((b) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `group relative flex flex-col items-center rounded-md border p-2 text-center transition-all ${b.earned ? "border-primary/60 bg-primary/10 text-foreground hover:-translate-y-0.5 border-glow" : "border-border/40 bg-background/20 text-muted-foreground opacity-50"}`,
                  title: lang === "hi" ? b.hi : b.en,
                  children: [
                    /* @__PURE__ */ jsx("div", { className: `text-3xl ${b.earned ? "" : "grayscale"}`, children: b.icon }),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 text-[9px] uppercase tracking-widest leading-tight", children: lang === "hi" ? b.hi : b.en }),
                    b.earned && /* @__PURE__ */ jsx("div", { className: "absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary text-glow" })
                  ]
                },
                b.en
              )) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-card/60 p-5 backdrop-blur", children: [
              /* @__PURE__ */ jsxs("h4", { className: "mb-3 text-xs uppercase tracking-widest text-primary text-glow", children: [
                "// ",
                t("interactive replay timeline", "इंटरैक्टिव रीप्ले टाइमलाइन")
              ] }),
              /* @__PURE__ */ jsx("ol", { className: "relative space-y-3 border-l-2 border-border pl-5", children: timeline.map((e, i) => /* @__PURE__ */ jsxs("li", { className: "relative", children: [
                /* @__PURE__ */ jsx("span", { className: `absolute -left-[28px] flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background font-mono text-[10px] font-bold ${toneColor(e.tone)}`, children: e.icon }),
                /* @__PURE__ */ jsxs("div", { className: `rounded-sm border bg-background/40 p-2 ${toneColor(e.tone)}`, children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-bold uppercase tracking-widest", children: e.title }),
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: e.detail })
                ] })
              ] }, i)) }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-[10px] text-muted-foreground", children: t(
                "Each step branches. Replay with different choices to see how outcomes change.",
                "हर कदम शाखाओं में बँटता है। अलग-अलग विकल्पों के साथ दोबारा खेलें।"
              ) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-card/60 p-5 backdrop-blur", children: [
              /* @__PURE__ */ jsxs("h4", { className: "mb-2 text-xs uppercase tracking-widest text-accent", children: [
                "// ",
                t("learning hub — recommended for you", "लर्निंग हब — आपके लिए सुझाव")
              ] }),
              /* @__PURE__ */ jsxs("ul", { className: "space-y-1 text-sm text-muted-foreground", children: [
                chosen?.verdict !== "correct" && /* @__PURE__ */ jsxs("li", { children: [
                  "📘 ",
                  t("Incident response basics — 1 min", "घटना प्रतिक्रिया मूल बातें — 1 मिनट")
                ] }),
                !phishRight && /* @__PURE__ */ jsxs("li", { children: [
                  "📘 ",
                  t("Spotting phishing emails — 1 min", "फ़िशिंग ईमेल पहचानना — 1 मिनट")
                ] }),
                correctClass < 2 && /* @__PURE__ */ jsxs("li", { children: [
                  "📘 ",
                  t("Mapping events to MITRE tactics — 2 min", "घटनाओं को MITRE तकनीकों से जोड़ना — 2 मिनट")
                ] }),
                kcCorrectCount < kcTotal && /* @__PURE__ */ jsxs("li", { children: [
                  "📘 ",
                  t("Reading the cyber kill-chain — 2 min", "साइबर किल-चेन समझना — 2 मिनट")
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  "📘 ",
                  t("Password security & MFA — 1 min", "पासवर्ड सुरक्षा और MFA — 1 मिनट")
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxs(Button, { onClick: downloadReport, className: "border border-primary bg-primary/10 text-primary text-glow hover:bg-primary/20", children: [
                "📄 ",
                t("download threat report", "थ्रेट रिपोर्ट डाउनलोड करें")
              ] }),
              /* @__PURE__ */ jsxs(Button, { onClick: downloadPDF, className: "border border-accent bg-accent/10 text-accent hover:bg-accent/20", children: [
                "🧾 ",
                t("export styled PDF", "स्टाइल PDF निर्यात")
              ] }),
              /* @__PURE__ */ jsxs(Button, { onClick: copyReport, variant: "outline", className: "border-accent/60 text-accent hover:bg-accent/10", children: [
                "📋 ",
                t("share summary", "सारांश साझा करें")
              ] }),
              /* @__PURE__ */ jsxs(Button, { className: "border border-primary bg-primary/10 text-primary text-glow hover:bg-primary/20", onClick: reshuffle, children: [
                "🎲 ",
                t("new randomized scenario", "नया बेतरतीब परिदृश्य")
              ] }),
              /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "border-border", onClick: onRestart, children: [
                "↻ ",
                t("run another simulation", "और सिमुलेशन चलाएँ")
              ] })
            ] })
          ] });
        })(),
        /* @__PURE__ */ jsxs("p", { className: "text-center text-xs text-muted-foreground", children: [
          "⚠ ",
          t("Educational only — no real exploitation. Focus: awareness, detection, prevention, response.", "केवल शैक्षिक — कोई वास्तविक शोषण नहीं। ध्यान: जागरूकता, पहचान, रोकथाम, प्रतिक्रिया।")
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 border-t border-border pt-4", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              disabled: stageIndex === 0,
              onClick: goPrev,
              className: "border-border text-xs uppercase tracking-widest",
              children: [
                "← ",
                t("back", "वापस")
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: STAGE_LABEL[STAGES[stageIndex]] }),
          stageIndex < STAGES.length - 1 ? /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: goNext,
              className: "border border-primary bg-primary/10 text-primary text-glow hover:bg-primary/20 text-xs uppercase tracking-widest",
              children: [
                t("next", "अगला"),
                ": ",
                STAGE_LABEL[STAGES[stageIndex + 1]],
                " →"
              ]
            }
          ) : /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: onRestart,
              className: "border border-primary bg-primary/10 text-primary text-glow hover:bg-primary/20 text-xs uppercase tracking-widest",
              children: [
                "↻ ",
                t("finish", "समाप्त")
              ]
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("aside", { className: "fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]", children: /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border border-glow bg-card/80 backdrop-blur", children: [
      /* @__PURE__ */ jsxs("button", { onClick: () => setAssistantOpen(!assistantOpen), className: "flex w-full items-center justify-between border-b border-border px-3 py-2 text-xs uppercase tracking-widest text-primary text-glow", children: [
        "🤖 ",
        t("threat assistant", "थ्रेट असिस्टेंट"),
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: assistantOpen ? "−" : "+" })
      ] }),
      assistantOpen && /* @__PURE__ */ jsxs("div", { className: "p-3", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-2 max-h-56 space-y-2 overflow-y-auto text-xs", children: assistantLog.map((m, i) => /* @__PURE__ */ jsxs("div", { className: m.from === "bot" ? "text-primary" : "text-foreground", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: m.from === "bot" ? "bot>" : "you>" }),
          " ",
          m.text
        ] }, i)) }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              value: assistantInput,
              onChange: (e) => setAssistantInput(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && sendAssistant(),
              placeholder: t("ask for a hint...", "संकेत माँगें..."),
              className: "h-8 border-border bg-input text-xs"
            }
          ),
          /* @__PURE__ */ jsx(Button, { size: "sm", onClick: sendAssistant, className: "border border-primary bg-primary/10 text-primary hover:bg-primary/20", children: t("send", "भेजें") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 text-[10px] text-muted-foreground", children: [
          t("try", "आज़माएँ"),
          ': "hint", "phishing", "logs", "ransom"'
        ] })
      ] })
    ] }) })
  ] });
}
const KEY = "pw_check_history";
const EVT = "pw_check_history_update";
const MAX = 10;
function read() {
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
function write(items) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(EVT));
  } catch {
  }
}
function recordPasswordCheck(pw, lang) {
  if (!pw) return;
  const s = analyzePassword(pw, lang);
  const entry = {
    pw,
    score: s.score,
    label: s.label,
    crackTime: s.crackTime,
    warning: s.warning,
    ts: Date.now()
  };
  const next = [entry, ...read().filter((e) => e.pw !== pw)].slice(0, MAX);
  write(next);
}
function mask(pw) {
  if (pw.length <= 2) return "•".repeat(pw.length);
  if (pw.length <= 4) return pw[0] + "•".repeat(pw.length - 1);
  return pw[0] + "•".repeat(Math.min(pw.length - 2, 8)) + pw[pw.length - 1];
}
function scoreClasses$1(score) {
  if (score >= 4) return "bg-primary/15 text-primary border-primary/40";
  if (score === 3) return "bg-primary/10 text-primary border-primary/30";
  if (score === 2) return "bg-accent/15 text-accent border-accent/40";
  return "bg-destructive/15 text-destructive border-destructive/40";
}
function PasswordHistory({ onPick }) {
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);
  const [reveal, setReveal] = useState({});
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
  const fmtTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-card/60 p-5 backdrop-blur", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-xs uppercase tracking-widest text-primary", children: [
        "// ",
        t("check history", "जाँच इतिहास")
      ] }),
      items.length > 0 && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: clear,
          className: "text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive",
          children: t("clear", "साफ़ करें")
        }
      )
    ] }),
    items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t(
      "No checks yet. Run a simulation to record history.",
      "अभी तक कोई जाँच नहीं। इतिहास दर्ज करने के लिए सिमुलेशन चलाएँ।"
    ) }) : /* @__PURE__ */ jsx("ul", { className: "space-y-1.5", children: items.map((e) => /* @__PURE__ */ jsxs(
      "li",
      {
        className: "group flex items-center gap-2 rounded-sm border border-border/60 bg-background/40 px-2 py-1.5 text-xs",
        children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: `shrink-0 rounded-sm border px-1.5 py-0.5 text-[9px] font-bold tracking-widest ${scoreClasses$1(
                e.score
              )}`,
              children: e.label
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => onPick(e.pw),
              className: "min-w-0 flex-1 truncate text-left font-mono text-foreground hover:text-primary",
              title: t("Refill input", "इनपुट में भरें"),
              children: reveal[e.ts] ? e.pw : mask(e.pw)
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground", children: e.crackTime }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setReveal((r) => ({ ...r, [e.ts]: !r[e.ts] })),
              className: "shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground",
              children: reveal[e.ts] ? t("hide", "छिपा") : t("show", "दिखा")
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "hidden shrink-0 text-muted-foreground sm:inline", children: fmtTime(e.ts) })
        ]
      },
      e.ts
    )) }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-[10px] text-muted-foreground", children: t(
      "Stored locally in your browser only. Never sent anywhere.",
      "केवल आपके ब्राउज़र में स्थानीय रूप से सहेजा गया। कहीं नहीं भेजा जाता।"
    ) })
  ] });
}
const WORDS = [
  "river",
  "otter",
  "quartz",
  "mint",
  "ember",
  "comet",
  "harbor",
  "willow",
  "cobalt",
  "lantern",
  "meadow",
  "saffron",
  "thistle",
  "velvet",
  "zephyr",
  "tundra",
  "nimbus",
  "pebble",
  "orchid",
  "falcon",
  "garnet",
  "kestrel",
  "marble",
  "pinecone",
  "ranger",
  "sable",
  "tiger",
  "umber",
  "vortex",
  "walnut",
  "indigo",
  "amber",
  "basalt",
  "cedar",
  "dune",
  "ember",
  "fjord",
  "glacier",
  "hazel",
  "ivory",
  "juniper",
  "koi",
  "lichen",
  "moss",
  "nectar",
  "opal",
  "prism",
  "quill",
  "rune",
  "spruce",
  "topaz",
  "umbra",
  "violet",
  "wisp",
  "xenon",
  "yarrow",
  "zinc",
  "anchor",
  "beacon",
  "canyon",
  "delta",
  "echo",
  "frost",
  "grove",
  "haven",
  "iris",
  "jade",
  "knoll",
  "loft",
  "moor",
  "nova",
  "oak",
  "plum",
  "quay",
  "reef",
  "stone",
  "tide"
];
const SYMBOLS = "!@#$%^&*-_=+?";
const ALL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
function rng(max) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] % max;
  }
  return Math.floor(Math.random() * max);
}
function pick(arr) {
  return arr[rng(arr.length)];
}
function randStr(len, charset = ALL) {
  let out = "";
  for (let i = 0; i < len; i++) out += charset[rng(charset.length)];
  return out;
}
function passphrase() {
  const sep = pick(["-", ".", "_"]);
  return [pick(WORDS), pick(WORDS), pick(WORDS), pick(WORDS)].join(sep) + rng(100).toString();
}
function lengthBoost(pw) {
  if (!pw) return passphrase();
  return pw + randStr(6);
}
function substituted(pw) {
  if (!pw) return randStr(14);
  const map = { a: "@", s: "$", o: "0", i: "!", e: "3", l: "1" };
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
function scoreClasses(score) {
  if (score >= 4) return "bg-primary/15 text-primary border-primary/40";
  if (score === 3) return "bg-primary/10 text-primary border-primary/30";
  if (score === 2) return "bg-accent/15 text-accent border-accent/40";
  return "bg-destructive/15 text-destructive border-destructive/40";
}
function PasswordAlternatives({
  password,
  onPick
}) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [seed, setSeed] = useState(0);
  const currentScore = useMemo(
    () => analyzePassword(password, lang).score,
    [password, lang]
  );
  const suggestions = useMemo(
    () => analyzePassword(password, lang).suggestions ?? [],
    [password, lang]
  );
  const candidates = useMemo(() => {
    return [
      { kind: t("Passphrase", "पासफ़्रेज़"), pw: passphrase() },
      { kind: t("Length boost", "लंबाई बढ़ाएँ"), pw: lengthBoost(password) },
      { kind: t("Substituted", "प्रतिस्थापित"), pw: substituted(password) },
      { kind: t("Pure random", "पूर्ण यादृच्छिक"), pw: pureRandom() }
    ];
  }, [password, seed, lang]);
  const handlePick = async (pw) => {
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
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    showBtn && /* @__PURE__ */ jsx(
      Button,
      {
        type: "button",
        onClick: () => setOpen((o) => !o),
        variant: "outline",
        className: "w-full border-accent/50 bg-accent/5 uppercase tracking-widest text-accent hover:bg-accent/15",
        children: open ? t("✕ hide alternatives", "✕ विकल्प छिपाएँ") : t("✦ generate stronger alternatives", "✦ मज़बूत विकल्प बनाएँ")
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-card/60 p-4 backdrop-blur", children: [
      suggestions.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-3 space-y-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: t("why your password is weak", "आपका पासवर्ड कमज़ोर क्यों है") }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-0.5 text-xs text-muted-foreground", children: suggestions.map((s, i) => /* @__PURE__ */ jsxs("li", { children: [
          "→ ",
          s
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-widest text-primary", children: t("tap a candidate to use it", "उपयोग के लिए विकल्प चुनें") }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSeed((s) => s + 1),
            className: "text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground",
            children: [
              "↻ ",
              t("regenerate", "फिर से बनाएँ")
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-1.5", children: candidates.map((c, i) => {
        const s = analyzePassword(c.pw, lang);
        return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handlePick(c.pw),
            className: "group flex w-full items-center gap-2 rounded-sm border border-border/60 bg-background/40 px-2 py-2 text-left text-xs hover:border-primary/60",
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `shrink-0 rounded-sm border px-1.5 py-0.5 text-[9px] font-bold tracking-widest ${scoreClasses(
                    s.score
                  )}`,
                  children: s.label
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("div", { className: "truncate font-mono text-foreground group-hover:text-primary", children: c.pw }),
                /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
                  c.kind,
                  " · ",
                  s.crackTime
                ] })
              ] })
            ]
          }
        ) }, i);
      }) })
    ] })
  ] });
}
const CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
function randomGuess(len) {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return out;
}
function randomIp() {
  return `${rand(10, 250)}.${rand(0, 255)}.${rand(0, 255)}.${rand(0, 255)}`;
}
function rand(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
function Simulator() {
  const { t, lang } = useLang();
  const [password, setPassword] = useState("");
  const [lines, setLines] = useState([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const idRef = useRef(0);
  const cancelRef = useRef(false);
  const push = useCallback((text, type) => {
    idRef.current += 1;
    setLines((prev) => [...prev, { id: idRef.current, text, type }]);
  }, []);
  const sleep = (ms) => new Promise((resolve) => {
    const start2 = Date.now();
    const tick = () => {
      if (cancelRef.current) return resolve();
      if (Date.now() - start2 >= ms) return resolve();
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
    const guessTable = [6, 18, 50, 120, 240];
    const totalGuesses = guessTable[strength.score] ?? 20;
    const baseDelay = 30 + strength.score * 18;
    push(
      t(
        `# estimated guesses needed (visualized): ${totalGuesses.toLocaleString()}`,
        `# अनुमानित आवश्यक प्रयास (दृश्य): ${totalGuesses.toLocaleString()}`
      ),
      "system"
    );
    for (let i = 0; i < totalGuesses; i++) {
      if (cancelRef.current) {
        push(t(`! aborted by user`, `! उपयोगकर्ता द्वारा रद्द`), "error");
        setRunning(false);
        return;
      }
      const guess = randomGuess(password.length);
      push(`${tryWord}: ${guess.padEnd(20)} ✗`, "guess");
      setProgress((i + 1) / (totalGuesses + 1) * 100);
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
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-[1fr_1.3fr]", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-card/60 p-5 backdrop-blur", children: [
        /* @__PURE__ */ jsxs("label", { className: "mb-2 block text-xs uppercase tracking-widest text-muted-foreground", children: [
          "> ",
          t("target_password", "लक्ष्य_पासवर्ड")
        ] }),
        /* @__PURE__ */ jsx(
          Input,
          {
            value: password,
            onChange: (e) => setPassword(e.target.value),
            placeholder: t("enter a password to attack...", "हमले के लिए पासवर्ड दर्ज करें..."),
            disabled: running,
            className: "h-12 border-border bg-input font-mono text-base text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(PasswordStrengthMeter, { password }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 flex gap-2", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              onClick: start,
              disabled: !password || running,
              className: "flex-1 border border-primary bg-primary/10 font-bold uppercase tracking-widest text-primary text-glow hover:bg-primary/20 disabled:opacity-40",
              children: running ? t("▶ attacking...", "▶ हमला जारी...") : t("▶ start simulation", "▶ सिमुलेशन शुरू करें")
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              onClick: reset,
              variant: "outline",
              className: "border-border bg-transparent uppercase tracking-widest text-muted-foreground hover:bg-muted",
              children: t("reset", "रीसेट")
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(PasswordAlternatives, { password, onPick: setPassword }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-1 flex justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: t("PROGRESS", "प्रगति") }),
            /* @__PURE__ */ jsxs("span", { children: [
              progress.toFixed(0),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-2 overflow-hidden rounded-sm bg-muted", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full bg-primary transition-all duration-150",
              style: {
                width: `${progress}%`,
                boxShadow: progress > 0 ? "var(--terminal-glow)" : void 0
              }
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-card/60 p-5 backdrop-blur", children: [
        /* @__PURE__ */ jsxs("h3", { className: "mb-3 text-xs uppercase tracking-widest text-primary", children: [
          "// ",
          t("why this matters", "यह क्यों मायने रखता है")
        ] }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "→" }),
            " ",
            t("Attackers use GPUs that try", "हमलावर GPU से प्रति सेकंड"),
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-accent", children: t("10+ billion", "10+ अरब") }),
            " ",
            t("guesses per second.", "अनुमान आज़माते हैं।")
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "→" }),
            " ",
            t("Adding length matters more than complexity.", "लंबाई बढ़ाना जटिलता से अधिक मायने रखता है।")
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "→" }),
            " ",
            t("Reusing passwords across sites multiplies the risk.", "हर साइट पर एक ही पासवर्ड दोहराने से जोखिम कई गुना बढ़ जाता है।")
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "→" }),
            " ",
            t("Use a password manager + 2FA wherever possible.", "जहाँ संभव हो पासवर्ड मैनेजर + 2FA का उपयोग करें।")
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(PasswordHistory, { onPick: setPassword })
    ] }),
    /* @__PURE__ */ jsx(Terminal, { lines, running }),
    completed && /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsx(PostSimulation, { password, onRestart: reset }) })
  ] });
}
const CARDS = [
  {
    icon: "🎣",
    code: "T1566",
    tone: "accent",
    en: {
      name: "Phishing",
      meaning: "Social engineering via fake emails, SMS, or chats that trick you into clicking or sharing data.",
      example: "An 'urgent' bank alert from secure-alerts@hdfc-verify.support asking you to verify in 2 hours.",
      defense: "Check sender domain, hover links, never share OTPs, report to SOC."
    },
    hi: {
      name: "फ़िशिंग",
      meaning: "नकली ईमेल/SMS से धोखा देकर डेटा या क्लिक हासिल करना।",
      example: "'जल्दी' बैंक चेतावनी जो 2 घंटे में सत्यापन माँगती है।",
      defense: "डोमेन जाँचें, लिंक होवर करें, OTP कभी साझा न करें, रिपोर्ट करें।"
    }
  },
  {
    icon: "💉",
    code: "T1190",
    tone: "primary",
    en: {
      name: "SQL Injection",
      meaning: "Attacker injects SQL into an input box so the database runs commands it shouldn't.",
      example: "Typing ' OR '1'='1 in a login form to bypass authentication.",
      defense: "Parameterised queries / prepared statements, ORMs, input validation, least-privilege DB users."
    },
    hi: {
      name: "SQL इंजेक्शन",
      meaning: "हमलावर इनपुट में SQL डालकर डेटाबेस से अनधिकृत कमांड चलवाता है।",
      example: "लॉगिन फॉर्म में ' OR '1'='1 डालकर पासवर्ड बाईपास करना।",
      defense: "Prepared statements, ORM, इनपुट सत्यापन, सीमित DB अनुमतियाँ।"
    }
  },
  {
    icon: "🪞",
    code: "T1059.007",
    tone: "accent",
    en: {
      name: "Cross-Site Scripting (XSS)",
      meaning: "Attacker injects JavaScript into a page so other visitors' browsers run it as if it were yours.",
      example: "A comment containing <script>steal(document.cookie)<\/script> shown unsanitised to every reader.",
      defense: "Escape output, Content-Security-Policy, sanitise HTML, set HttpOnly + Secure cookies."
    },
    hi: {
      name: "क्रॉस-साइट स्क्रिप्टिंग (XSS)",
      meaning: "हमलावर पेज में JavaScript डालता है ताकि दूसरों के ब्राउज़र में चले।",
      example: "एक टिप्पणी में <script>cookie चुराओ<\/script> जो हर पाठक को दिखे।",
      defense: "आउटपुट escape, CSP, HTML sanitise, HttpOnly कुकीज़।"
    }
  }
];
const TONE = {
  primary: { border: "border-primary/40", text: "text-primary", bg: "from-primary/10", chip: "border-primary/50 text-primary" },
  accent: { border: "border-accent/40", text: "text-accent", bg: "from-accent/10", chip: "border-accent/50 text-accent" },
  destructive: { border: "border-destructive/40", text: "text-destructive", bg: "from-destructive/10", chip: "border-destructive/50 text-destructive" }
};
function AttackTypes() {
  const { t, lang } = useLang();
  return /* @__PURE__ */ jsxs("section", { className: "mt-14", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-primary text-glow", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" }),
      "04 // ",
      t("attack atlas", "हमला एटलस")
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "mb-5 font-mono text-2xl font-bold leading-tight text-foreground", children: t("Know your enemy — common cyber attacks", "अपने दुश्मन को जानें — आम साइबर हमले") }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2", children: CARDS.map((c) => {
      const tone = TONE[c.tone];
      const txt = c[lang];
      return /* @__PURE__ */ jsxs(
        "article",
        {
          className: `group relative overflow-hidden rounded-lg border ${tone.border} bg-gradient-to-br ${tone.bg} via-card/60 to-card/80 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_var(--terminal-glow)]`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "absolute -right-8 -top-8 h-24 w-24 rounded-full bg-current opacity-5 blur-2xl" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: `text-4xl drop-shadow-lg`, children: c.icon }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 text-[10px] uppercase tracking-widest ${tone.text}`, children: [
                  /* @__PURE__ */ jsx("span", { className: `rounded-sm border px-1.5 py-0.5 ${tone.chip}`, children: c.code }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "// ",
                    t("technique", "तकनीक")
                  ] })
                ] }),
                /* @__PURE__ */ jsx("h3", { className: `mt-1 font-mono text-lg font-bold ${tone.text} text-glow`, children: txt.name })
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-foreground", children: txt.meaning }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-1.5 text-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-background/40 p-2", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                  "🧪 ",
                  t("example", "उदाहरण"),
                  ":"
                ] }),
                " ",
                /* @__PURE__ */ jsx("span", { className: "font-mono text-foreground", children: txt.example })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-background/40 p-2", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                  "🛡 ",
                  t("defense", "बचाव"),
                  ":"
                ] }),
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-foreground", children: txt.defense })
              ] })
            ] })
          ]
        },
        c.en.name
      );
    }) })
  ] });
}
function Index() {
  const {
    t
  } = useLang();
  return /* @__PURE__ */ jsx("main", { className: "min-h-screen px-4 py-10 sm:px-6 lg:px-10", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-10 flex flex-col gap-3 border-b border-border pb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2 w-2 animate-pulse rounded-full bg-primary" }),
        /* @__PURE__ */ jsx("span", { children: t("secure_sandbox · v1.0.0 · educational use only", "सुरक्षित_सैंडबॉक्स · v1.0.0 · केवल शैक्षिक उपयोग") }),
        /* @__PURE__ */ jsx("span", { className: "ml-auto flex items-center gap-2", children: /* @__PURE__ */ jsx(LanguageSwitcher, {}) })
      ] }),
      /* @__PURE__ */ jsxs("h1", { className: "text-4xl font-bold tracking-tight text-primary text-glow flicker sm:text-5xl", children: [
        "> ",
        t("Breach_Lab", "ब्रीच_लैब"),
        /* @__PURE__ */ jsx("span", { className: "cursor-blink", children: "_" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "max-w-2xl text-sm text-muted-foreground sm:text-base", children: t("A safe, visual demo of how brute-force attacks work and why password strength matters. Nothing real is hacked — every attack runs in your browser as a learning tool.", "एक सुरक्षित, दृश्य प्रदर्शन कि ब्रूट-फोर्स हमले कैसे काम करते हैं और पासवर्ड की मजबूती क्यों मायने रखती है। कुछ भी असली रूप से हैक नहीं किया जाता — हर हमला सिर्फ़ सीखने के लिए आपके ब्राउज़र में चलता है।") }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2 rounded-md border border-accent/40 bg-accent/5 px-4 py-3 text-xs text-accent sm:text-sm", children: [
        "⚠ ",
        t("DISCLAIMER: This is a simulation for educational purposes only. No real hacking is performed.", "अस्वीकरण: यह केवल शैक्षिक उद्देश्यों के लिए एक सिमुलेशन है। वास्तविक हैकिंग नहीं की जाती।")
      ] })
    ] }),
    /* @__PURE__ */ jsx(Simulator, {}),
    /* @__PURE__ */ jsx(AttackTypes, {}),
    /* @__PURE__ */ jsxs("section", { className: "mt-14 grid gap-5 md:grid-cols-6", children: [
      /* @__PURE__ */ jsxs("article", { className: "group relative overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-br from-card/80 via-card/60 to-primary/5 p-6 backdrop-blur md:col-span-3 transition-all hover:border-primary/60 hover:-translate-y-1", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-primary text-glow", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" }),
            "01 // ",
            t("brute force", "ब्रूट फोर्स")
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "mb-3 font-mono text-2xl font-bold leading-tight text-foreground", children: t("what is brute force?", "ब्रूट फोर्स क्या है?") }),
          /* @__PURE__ */ jsxs("div", { className: "mb-3 font-mono text-3xl font-black text-primary text-glow", children: [
            "10",
            /* @__PURE__ */ jsx("span", { className: "text-base align-top", children: "B" }),
            /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs font-normal uppercase tracking-widest text-muted-foreground", children: t("guesses / sec", "अनुमान / सेकंड") })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-muted-foreground", children: t("A brute-force attack systematically tries every possible combination of characters until it finds the correct password. Modern GPUs can test billions of guesses per second.", "ब्रूट-फोर्स हमला हर संभव अक्षर संयोजन को क्रमबद्ध रूप से तब तक आज़माता है जब तक सही पासवर्ड न मिल जाए। आधुनिक GPU प्रति सेकंड अरबों अनुमान लगा सकते हैं।") })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("article", { className: "group relative overflow-hidden rounded-lg border border-accent/40 bg-gradient-to-br from-card/80 via-card/60 to-accent/10 p-6 backdrop-blur md:col-span-3 transition-all hover:border-accent/70 hover:-translate-y-1", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl transition-all group-hover:bg-accent/20" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-accent", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" }),
            "02 // ",
            t("length wins", "लंबाई जीतती है")
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "mb-3 font-mono text-2xl font-bold leading-tight text-foreground", children: t("why strong passwords?", "मज़बूत पासवर्ड क्यों?") }),
          /* @__PURE__ */ jsx("div", { className: "mb-4 space-y-1.5", children: [{
            len: "8",
            bar: 8,
            label: t("seconds", "सेकंड"),
            tone: "bg-destructive"
          }, {
            len: "10",
            bar: 24,
            label: t("hours", "घंटे"),
            tone: "bg-destructive/70"
          }, {
            len: "12",
            bar: 55,
            label: t("years", "साल"),
            tone: "bg-accent"
          }, {
            len: "16",
            bar: 100,
            label: t("centuries", "सदियाँ"),
            tone: "bg-primary text-glow"
          }].map((r) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[10px] uppercase tracking-widest", children: [
            /* @__PURE__ */ jsxs("span", { className: "w-6 font-mono text-muted-foreground", children: [
              r.len,
              "ch"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-2 flex-1 overflow-hidden rounded-sm bg-muted", children: /* @__PURE__ */ jsx("div", { className: `h-full ${r.tone}`, style: {
              width: `${r.bar}%`
            } }) }),
            /* @__PURE__ */ jsx("span", { className: "w-16 text-right text-muted-foreground", children: r.label })
          ] }, r.len)) }),
          /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed text-muted-foreground", children: t("Each extra character makes the search space exponentially larger.", "हर अतिरिक्त अक्षर खोज क्षेत्र को कई गुना बड़ा बना देता है।") })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("article", { className: "group relative overflow-hidden rounded-lg border border-border bg-card/60 p-6 backdrop-blur md:col-span-6", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-primary text-glow", children: [
          /* @__PURE__ */ jsx("span", { className: "inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" }),
          "03 // ",
          t("safety tips", "सुरक्षा सुझाव")
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "mb-5 font-mono text-2xl font-bold leading-tight text-foreground", children: t("Your 5 rules of defense", "रक्षा के 5 नियम") }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5", children: [{
          icon: "📏",
          en: "Use 12+ characters minimum",
          hi: "कम से कम 12 अक्षर रखें"
        }, {
          icon: "🎲",
          en: "Mix upper, lower, numbers, symbols",
          hi: "बड़े, छोटे, संख्या और चिह्न मिलाएँ"
        }, {
          icon: "🚫",
          en: "Never reuse passwords",
          hi: "पासवर्ड कभी दोबारा इस्तेमाल न करें"
        }, {
          icon: "🔐",
          en: "Enable 2FA everywhere",
          hi: "हर जगह 2FA चालू रखें"
        }, {
          icon: "🗝️",
          en: "Use a password manager",
          hi: "पासवर्ड मैनेजर का उपयोग करें"
        }].map((tip, i) => /* @__PURE__ */ jsxs("div", { className: "group/tip relative overflow-hidden rounded-md border border-border bg-background/40 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-1 text-2xl", children: tip.icon }),
          /* @__PURE__ */ jsxs("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: [
            "#",
            (i + 1).toString().padStart(2, "0")
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs leading-snug text-foreground", children: t(tip.en, tip.hi) })
        ] }, i)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("footer", { className: "mt-12 border-t border-border pt-6 text-center text-xs uppercase tracking-widest text-muted-foreground", children: [
      "# ",
      t("stay curious. stay secure. # never use these techniques on systems you don't own.", "जिज्ञासु रहें। सुरक्षित रहें। # इन तकनीकों का उपयोग कभी उन सिस्टम पर न करें जो आपके नहीं हैं।")
    ] })
  ] }) });
}
export {
  Index as component
};
