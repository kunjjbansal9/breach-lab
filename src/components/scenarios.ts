import type { Lang } from "@/lib/i18n";

// Bilingual string helper
export type LStr = string | { en: string; hi: string };
export const L = (en: string, hi: string): LStr => ({ en, hi });
export const loc = (s: LStr | undefined, lang: Lang): string => {
  if (s == null) return "";
  if (typeof s === "string") return s;
  return s[lang];
};

export type Decision = {
  id: string;
  label: LStr;
  verdict: "correct" | "partial" | "wrong";
  damage: number;
  outcome: LStr;
  hint: LStr;
  story: LStr;
};

export type LogRow = {
  id: number;
  time: string;
  ip: string;
  user: string;
  event: LStr;
  suspicious: boolean;
  reason?: LStr;
  category?: Tactic;
};

export type PhishClue = { id: string; label: LStr; bad: boolean; reason: LStr };

export const TACTICS = [
  "Benign",
  "Recon",
  "InitialAccess",
  "PrivEsc",
  "Persistence",
  "DefenseEvasion",
  "Lateral",
  "C2",
  "Exfiltration",
  "Impact",
] as const;
export type Tactic = (typeof TACTICS)[number];

export const TACTIC_LABEL: Record<Tactic, LStr> = {
  Benign: L("Benign", "सामान्य"),
  Recon: L("Reconnaissance", "टोही"),
  InitialAccess: L("Initial Access", "प्रारंभिक प्रवेश"),
  PrivEsc: L("Privilege Escalation", "विशेषाधिकार वृद्धि"),
  Persistence: L("Persistence", "स्थायित्व"),
  DefenseEvasion: L("Defense Evasion", "रक्षा चोरी"),
  Lateral: L("Lateral Movement", "पार्श्व गति"),
  C2: L("Command & Control", "कमांड & नियंत्रण"),
  Exfiltration: L("Exfiltration", "डेटा चोरी"),
  Impact: L("Impact / Destruction", "विनाश"),
};

export type PhishEmail = {
  id: string;
  isPhish: boolean;
  from: string;
  subject: LStr;
  preview: LStr;
  clues: PhishClue[];
  story: { phish: LStr; real: LStr };
};

export type AttackStep = { step: LStr; detail: LStr };

export type Scenario = {
  id: string;
  name: LStr;
  attackType: LStr;
  entry: LStr;
  systems: LStr;
  recapStory: LStr;
  decisions: Decision[];
  attackFlow: AttackStep[];
  fixes: LStr[];
  logs: LogRow[];
  phish: PhishEmail;
};

/* ────────────── DECISION POOLS ────────────── */

const DECISIONS_BRUTE: Decision[] = [
  {
    id: "isolate",
    label: L("Isolate the affected machine from the network", "प्रभावित मशीन को नेटवर्क से अलग करें"),
    verdict: "correct",
    damage: 5,
    outcome: L("✓ Threat contained. Lateral movement blocked.", "✓ खतरा रोका गया। पार्श्व-गति अवरुद्ध।"),
    hint: L("Containment first — stop spread before investigating.", "पहले रोकथाम — जाँच से पहले फैलाव रोकें।"),
    story: L("You yank the ethernet cable. The attacker's shell freezes mid-command. Silence — for now.", "आपने ईथरनेट केबल खींची। हमलावर का शेल बीच कमांड में जम गया। फिलहाल सन्नाटा।"),
  },
  {
    id: "reset",
    label: L("Force-reset all user passwords + revoke sessions", "सभी उपयोगकर्ता पासवर्ड बलपूर्वक रीसेट करें + सत्र समाप्त करें"),
    verdict: "partial",
    damage: 25,
    outcome: L("~ Helpful, but the attacker may still be inside.", "~ उपयोगी, पर हमलावर अब भी अंदर हो सकता है।"),
    hint: L("Good hygiene, but doesn't stop an active intruder.", "अच्छी आदत, पर सक्रिय घुसपैठिये को नहीं रोकता।"),
    story: L("Help desk lights up with angry tickets. Meanwhile, the attacker's existing shell keeps humming on a backup port.", "हेल्प डेस्क पर गुस्साई शिकायतें भर गईं। इस बीच हमलावर का शेल बैकअप पोर्ट पर चलता रहा।"),
  },
  {
    id: "ignore",
    label: L("Wait and monitor — it might be a false alarm", "रुकें और देखें — शायद झूठा अलार्म हो"),
    verdict: "wrong",
    damage: 70,
    outcome: L("✗ Attacker pivoted to file server. Data exfiltration confirmed.", "✗ हमलावर फ़ाइल सर्वर तक पहुँचा। डेटा चोरी पुष्ट।"),
    hint: L("Never wait on a confirmed alert. Time = damage.", "पुष्ट अलर्ट पर कभी प्रतीक्षा न करें। समय = नुकसान।"),
    story: L("Twelve minutes pass. A 4.2 GB outbound transfer leaves the network. You realise your monitor was the only thing watching.", "बारह मिनट बीतते हैं। 4.2 GB का डेटा बाहर चला जाता है। तब समझ आता है कि देख रहा सिर्फ़ आपका मॉनिटर था।"),
  },
  {
    id: "shutdown",
    label: L("Shut down the entire network immediately", "तुरंत पूरा नेटवर्क बंद कर दें"),
    verdict: "partial",
    damage: 40,
    outcome: L("~ Stops the attack but causes massive downtime.", "~ हमला रुक जाता है पर भारी डाउनटाइम होता है।"),
    hint: L("Surgical isolation beats panic shutdown.", "घबराकर बंद करने से बेहतर है सटीक अलगाव।"),
    story: L("Production goes dark. The CEO calls. The attacker is gone — and so is your forensic trail.", "उत्पादन बंद। CEO का फोन आया। हमलावर गायब — और आपका फॉरेंसिक सबूत भी।"),
  },
  {
    id: "honeypot",
    label: L("Redirect attacker to a honeypot and observe", "हमलावर को हनीपॉट पर मोड़ें और निगरानी रखें"),
    verdict: "correct",
    damage: 8,
    outcome: L("✓ Tactics captured for threat intel without real damage.", "✓ बिना असली नुकसान के हमलावर की रणनीति दर्ज।"),
    hint: L("Deception buys time and intelligence — if rehearsed.", "धोखा देने से समय व जानकारी मिलती है — पर तैयारी ज़रूरी।"),
    story: L("The attacker happily exfiltrates a folder of fake invoices while your SOC quietly maps every command they run.", "हमलावर ख़ुश होकर नकली चालान चुरा रहा है, और आपका SOC उसकी हर कमांड चुपचाप दर्ज कर रहा है।"),
  },
];

const DECISIONS_PHISH: Decision[] = [
  {
    id: "block",
    label: L("Block the sender domain at the email gateway", "ईमेल गेटवे पर भेजने वाले डोमेन को ब्लॉक करें"),
    verdict: "correct",
    damage: 5,
    outcome: L("✓ Campaign neutralised across the org.", "✓ पूरे संगठन में अभियान निष्क्रिय।"),
    hint: L("Stop the funnel, not just one email.", "केवल एक ईमेल नहीं, पूरे स्रोत को रोकें।"),
    story: L("47 identical messages bounce in the next hour. The attacker shrugs and moves to the next target.", "अगले घंटे में 47 समान संदेश वापस लौटे। हमलावर अगला लक्ष्य ढूँढने चला गया।"),
  },
  {
    id: "warn",
    label: L("Send a company-wide 'do not click' warning", "कंपनी-व्यापी 'क्लिक न करें' चेतावनी भेजें"),
    verdict: "partial",
    damage: 30,
    outcome: L("~ Helpful, but three users already clicked.", "~ उपयोगी, पर तीन उपयोगकर्ता पहले ही क्लिक कर चुके।"),
    hint: L("Awareness lags exploitation by minutes.", "जागरूकता शोषण से कुछ मिनट पीछे रहती है।"),
    story: L("An intern in marketing reads the warning ten minutes after entering their password into the fake portal.", "मार्केटिंग का इंटर्न नकली पोर्टल में पासवर्ड डालने के दस मिनट बाद चेतावनी पढ़ता है।"),
  },
  {
    id: "click",
    label: L("Click the link yourself to 'check if it's real'", "लिंक खुद क्लिक करके 'जांच' करें कि असली है या नहीं"),
    verdict: "wrong",
    damage: 80,
    outcome: L("✗ Your admin token is now in attacker hands.", "✗ आपका एडमिन टोकन अब हमलावर के हाथ।"),
    hint: L("Detonate suspicious URLs in a sandbox, never on your box.", "संदिग्ध URL सैंडबॉक्स में खोलें, अपने सिस्टम पर कभी नहीं।"),
    story: L("A new browser tab loads. Three seconds later your session token pings a server in another country.", "नया ब्राउज़र टैब खुलता है। तीन सेकंड बाद आपका सत्र टोकन विदेश के सर्वर तक पहुँच जाता है।"),
  },
  {
    id: "report",
    label: L("Report to SOC and quarantine the message globally", "SOC को रिपोर्ट करें और संदेश को सर्वत्र क्वारंटीन करें"),
    verdict: "correct",
    damage: 8,
    outcome: L("✓ Threat hunters pull the message from every inbox.", "✓ थ्रेट हंटर्स ने हर इनबॉक्स से संदेश हटाया।"),
    hint: L("Reporting feeds detection rules for the next attack.", "रिपोर्टिंग अगले हमले के लिए डिटेक्शन नियमों को मज़बूत करती है।"),
    story: L("Within minutes the IOC is shared with the ISAC. Three peer companies block the same domain before lunch.", "कुछ मिनटों में IOC ISAC के साथ साझा हुआ। दोपहर से पहले तीन साथी कंपनियों ने वही डोमेन ब्लॉक किया।"),
  },
  {
    id: "delete",
    label: L("Just delete the email and move on", "बस ईमेल हटाओ और आगे बढ़ो"),
    verdict: "wrong",
    damage: 55,
    outcome: L("✗ Other users still receive and click it.", "✗ अन्य उपयोगकर्ता अब भी पाते और क्लिक करते हैं।"),
    hint: L("Your inbox isn't the only target.", "केवल आपका इनबॉक्स लक्ष्य नहीं है।"),
    story: L("Two days later, payroll calls: a wire transfer went to a 'new vendor account'. Same campaign. Same domain.", "दो दिन बाद पेरोल का फोन: एक 'नए वेंडर खाते' में पैसा भेजा गया। वही अभियान। वही डोमेन।"),
  },
];

const DECISIONS_RANSOM: Decision[] = [
  {
    id: "isolate-ransom",
    label: L("Isolate infected hosts and disable file shares", "संक्रमित होस्ट अलग करें और फ़ाइल शेयर बंद करें"),
    verdict: "correct",
    damage: 10,
    outcome: L("✓ Encryption stopped at 14% of fileserver.", "✓ फ़ाइलसर्वर के 14% पर एन्क्रिप्शन रुक गया।"),
    hint: L("Cut the blast radius before recovery.", "रिकवरी से पहले प्रभाव क्षेत्र सीमित करें।"),
    story: L("The encryption process dies mid-file. A README.txt sits half-written on the desktop, threatening a deadline that no longer matters.", "एन्क्रिप्शन प्रक्रिया फ़ाइल के बीच में रुक गई। डेस्कटॉप पर आधा-लिखा README.txt रह गया।"),
  },
  {
    id: "pay",
    label: L("Pay the ransom to make it go away", "मामला निपटाने के लिए फिरौती दे दें"),
    verdict: "wrong",
    damage: 95,
    outcome: L("✗ No guarantee of recovery. You're now a known payer.", "✗ रिकवरी की गारंटी नहीं। अब आप 'पैसा देने वाले' के तौर पर जाने जाते हैं।"),
    hint: L("Paying funds future attacks and rarely restores systems.", "फिरौती देना भविष्य के हमलों को पैसा देता है और शायद ही सिस्टम वापस लाता है।"),
    story: L("Three weeks later, a different group hits you with the same toolkit. Your name is on a list shared in a forum you'll never see.", "तीन हफ़्तों बाद, उसी टूलकिट से दूसरा समूह हमला करता है। आपका नाम एक गुप्त सूची में है।"),
  },
  {
    id: "restore",
    label: L("Restore from offline backups after eradication", "उन्मूलन के बाद ऑफ़लाइन बैकअप से बहाल करें"),
    verdict: "correct",
    damage: 15,
    outcome: L("✓ Clean recovery, minor data loss from last snapshot.", "✓ साफ रिकवरी, अंतिम स्नैपशॉट से थोड़ा डेटा नुकसान।"),
    hint: L("Backups only count if they're tested AND offline.", "बैकअप तभी मायने रखते हैं जब परखे गए हों और ऑफ़लाइन हों।"),
    story: L("Tape backups roll in from the vault. By morning, finance is invoicing again as if nothing happened.", "वॉल्ट से टेप बैकअप वापस आते हैं। सुबह तक फाइनेंस फिर से चालान बना रहा है, जैसे कुछ हुआ ही न हो।"),
  },
  {
    id: "negotiate",
    label: L("Negotiate to buy time without paying", "बिना पैसा दिए समय खरीदने के लिए बातचीत करें"),
    verdict: "partial",
    damage: 45,
    outcome: L("~ Buys hours but signals willingness to pay.", "~ कुछ घंटे मिलते हैं पर 'पैसा देने को तैयार' का संकेत जाता है।"),
    hint: L("Engage law enforcement and IR retainers, not the attacker alone.", "अकेले हमलावर से नहीं, क़ानून-व्यवस्था और IR टीम को जोड़ें।"),
    story: L("The attacker extends the deadline — and doubles the price. Your CFO is no longer making eye contact.", "हमलावर समय बढ़ाता है — और कीमत दोगुनी कर देता है। आपका CFO नज़रें मिलाना बंद कर देता है।"),
  },
];

/* ────────────── ATTACK FLOWS ────────────── */

const FLOW_BRUTE: AttackStep[] = [
  { step: L("🌐 Target login service discovered", "🌐 लक्ष्य लॉगिन सेवा मिली"), detail: L("Public-facing SSH on port 22 with no rate-limit.", "पोर्ट 22 पर खुली SSH, कोई रेट-लिमिट नहीं।") },
  { step: L("🤖 Automated guess loop launched", "🤖 स्वचालित अनुमान लूप शुरू"), detail: L("Botnet rotated 10B+ password candidates.", "बॉटनेट ने 10 अरब+ पासवर्ड आज़माए।") },
  { step: L("🔑 Credential pair matched", "🔑 क्रेडेंशियल जोड़ी मिली"), detail: L("Weak password fell within minutes.", "कमज़ोर पासवर्ड मिनटों में टूट गया।") },
  { step: L("🚪 Attacker authenticated", "🚪 हमलावर ने लॉगिन किया"), detail: L("No MFA — credentials were enough.", "MFA नहीं था — सिर्फ़ क्रेडेंशियल काफ़ी थे।") },
  { step: L("🦠 Lateral movement", "🦠 पार्श्व गति"), detail: L("Mapped internal network, found shared drives.", "आंतरिक नेटवर्क की मैपिंग की, साझा ड्राइव मिलीं।") },
];

const FLOW_PHISH: AttackStep[] = [
  { step: L("📧 Phishing email delivered", "📧 फ़िशिंग ईमेल पहुँचा"), detail: L("Spoofed 'IT-Support' sender, urgent password-reset bait.", "नकली 'IT-Support' भेजने वाला, जल्दी पासवर्ड रीसेट का चारा।") },
  { step: L("🖱 User clicked the link", "🖱 उपयोगकर्ता ने लिंक क्लिक किया"), detail: L("Landed on a cloned login page over HTTPS.", "HTTPS पर नकली लॉगिन पेज पर पहुँचा।") },
  { step: L("🔑 Credentials harvested", "🔑 क्रेडेंशियल चुरा लिए गए"), detail: L("Submitted username + password sent to attacker server.", "उपयोगकर्ता नाम + पासवर्ड हमलावर सर्वर पर भेजे गए।") },
  { step: L("🚪 Attacker logged in", "🚪 हमलावर ने लॉगिन किया"), detail: L("Session token replayed from new geography.", "नए स्थान से सेशन टोकन दोबारा इस्तेमाल किया।") },
  { step: L("📤 Mailbox rules planted", "📤 मेलबॉक्स नियम लगाए"), detail: L("Auto-forward + delete to hide further activity.", "गतिविधि छुपाने के लिए ऑटो-फॉरवर्ड + डिलीट।") },
];

const FLOW_RANSOM: AttackStep[] = [
  { step: L("📎 Macro-laden document opened", "📎 मैक्रो वाला दस्तावेज़ खुला"), detail: L("User ran an Excel macro from an emailed invoice.", "उपयोगकर्ता ने ईमेल किए चालान का Excel मैक्रो चलाया।") },
  { step: L("🛠 Loader fetched payload", "🛠 लोडर ने पेलोड डाउनलोड किया"), detail: L("PowerShell pulled second-stage from a CDN.", "PowerShell ने CDN से दूसरा चरण लाया।") },
  { step: L("👑 Privilege escalation", "👑 विशेषाधिकार बढ़ाया"), detail: L("Exploited unpatched local service.", "अनपैच सेवा का फ़ायदा उठाया।") },
  { step: L("🔐 Mass file encryption", "🔐 बड़े पैमाने पर फ़ाइल एन्क्रिप्शन"), detail: L("AES-256 over SMB shares, shadow copies wiped.", "SMB शेयर पर AES-256, शैडो कॉपी मिटाई गईं।") },
  { step: L("💰 Ransom note dropped", "💰 फिरौती नोट छोड़ा गया"), detail: L("Bitcoin wallet + countdown timer presented.", "बिटकॉइन वॉलेट + काउंटडाउन टाइमर दिखाया गया।") },
];

/* ────────────── LOG POOLS ────────────── */

const LOGS_A: LogRow[] = [
  { id: 1, time: "08:01", ip: "10.0.0.14", user: "alice", event: L("login OK", "लॉगिन OK"), suspicious: false },
  { id: 2, time: "02:47", ip: "185.220.101.4", user: "admin", event: L("login OK", "लॉगिन OK"), suspicious: true, category: "InitialAccess", reason: L("Off-hours login from Tor exit node.", "Tor एक्ज़िट नोड से ऑफ-ऑवर लॉगिन।") },
  { id: 3, time: "02:48", ip: "185.220.101.4", user: "admin", event: L("privilege escalation", "विशेषाधिकार बढ़ाव"), suspicious: true, category: "PrivEsc", reason: L("Privilege change right after suspicious login.", "संदिग्ध लॉगिन के तुरंत बाद विशेषाधिकार बदला।") },
  { id: 4, time: "09:10", ip: "10.0.0.14", user: "alice", event: L("file access", "फ़ाइल एक्सेस"), suspicious: false },
  { id: 5, time: "02:51", ip: "185.220.101.4", user: "admin", event: L("5x failed sudo", "5 बार sudo विफल"), suspicious: true, category: "PrivEsc", reason: L("Multiple failed sudo from anomalous IP.", "असामान्य IP से कई बार sudo विफल।") },
  { id: 6, time: "09:30", ip: "10.0.0.30", user: "carol", event: L("login OK", "लॉगिन OK"), suspicious: false },
  { id: 7, time: "03:02", ip: "45.9.148.99", user: "svc_backup", event: L("outbound 4.2GB", "बाहर भेजा गया 4.2GB"), suspicious: true, category: "Exfiltration", reason: L("Large outbound transfer from a service account.", "सेवा खाते से बड़ा डेटा बाहर भेजा गया।") },
];

const LOGS_B: LogRow[] = [
  { id: 1, time: "10:14", ip: "10.0.0.7", user: "dave", event: L("login OK", "लॉगिन OK"), suspicious: false },
  { id: 2, time: "10:15", ip: "10.0.0.7", user: "dave", event: L("MFA approved", "MFA स्वीकृत"), suspicious: false },
  { id: 3, time: "10:16", ip: "203.0.113.42", user: "dave", event: L("login OK (no MFA)", "लॉगिन OK (बिना MFA)"), suspicious: true, category: "InitialAccess", reason: L("Same user logging in from a foreign IP without MFA — token replay.", "वही उपयोगकर्ता विदेशी IP से बिना MFA — टोकन रीप्ले।") },
  { id: 4, time: "10:17", ip: "203.0.113.42", user: "dave", event: L("mailbox rule created", "मेलबॉक्स नियम बनाया"), suspicious: true, category: "Persistence", reason: L("Auto-forward rule added — typical BEC tradecraft.", "ऑटो-फॉरवर्ड नियम जोड़ा — विशिष्ट BEC तरीका।") },
  { id: 5, time: "10:22", ip: "10.0.0.7", user: "dave", event: L("doc download", "दस्तावेज़ डाउनलोड"), suspicious: false },
  { id: 6, time: "10:25", ip: "203.0.113.42", user: "dave", event: L("OAuth app consented", "OAuth ऐप अनुमोदित"), suspicious: true, category: "Persistence", reason: L("Unknown OAuth app granted mailbox.read scope.", "अज्ञात OAuth ऐप को mailbox.read अनुमति मिली।") },
  { id: 7, time: "11:00", ip: "10.0.0.50", user: "erin", event: L("login OK", "लॉगिन OK"), suspicious: false },
];

const LOGS_C: LogRow[] = [
  { id: 1, time: "23:40", ip: "10.0.2.55", user: "frank", event: L("doc opened", "दस्तावेज़ खोला"), suspicious: false },
  { id: 2, time: "23:41", ip: "10.0.2.55", user: "frank", event: L("powershell.exe -enc <b64>", "powershell.exe -enc <b64>"), suspicious: true, category: "DefenseEvasion", reason: L("Encoded PowerShell from a user workstation — suspicious LOLBin use.", "उपयोगकर्ता वर्कस्टेशन से एन्कोडेड PowerShell — संदिग्ध LOLBin उपयोग।") },
  { id: 3, time: "23:42", ip: "10.0.2.55", user: "frank", event: L("outbound 443 to 91.219.236.18", "बाहर 443 → 91.219.236.18"), suspicious: true, category: "C2", reason: L("Beaconing to a known malicious C2 IP.", "ज्ञात मैलिशियस C2 IP से संपर्क।") },
  { id: 4, time: "23:55", ip: "10.0.2.55", user: "SYSTEM", event: L("vssadmin delete shadows /all", "vssadmin delete shadows /all"), suspicious: true, category: "DefenseEvasion", reason: L("Shadow copies wiped — classic ransomware preparation.", "शैडो कॉपी मिटाई गईं — सामान्य रैनसमवेयर तैयारी।") },
  { id: 5, time: "00:01", ip: "10.0.2.55", user: "SYSTEM", event: L("mass file rename .locked", "बड़े पैमाने पर फ़ाइल नाम .locked"), suspicious: true, category: "Impact", reason: L("Mass extension change indicates active encryption.", "एक्सटेंशन में सामूहिक बदलाव सक्रिय एन्क्रिप्शन दर्शाता है।") },
  { id: 6, time: "07:30", ip: "10.0.0.9", user: "gina", event: L("login OK", "लॉगिन OK"), suspicious: false },
  { id: 7, time: "07:35", ip: "10.0.0.9", user: "gina", event: L("file access denied (encrypted)", "फ़ाइल एक्सेस अस्वीकृत (एन्क्रिप्टेड)"), suspicious: false },
];

/* ────────────── PHISHING EMAILS ────────────── */

const PHISH_EMAILS: PhishEmail[] = [
  {
    id: "paypal",
    isPhish: true,
    from: "it-support@secure-paypa1.com",
    subject: L("URGENT — verify your account within 24h", "अति आवश्यक — 24 घंटे में अपना खाता सत्यापित करें"),
    preview: L("We detected unusual activity. Click below to confirm or your account will be permanently locked.", "असामान्य गतिविधि का पता चला। पुष्टि करें वरना खाता स्थायी रूप से बंद हो जाएगा।"),
    clues: [
      { id: "from", label: L("From: it-support@secure-paypa1.com", "भेजने वाला: it-support@secure-paypa1.com"), bad: true, reason: L("Spoofed lookalike domain ('paypa1' with a 1).", "नकली डोमेन ('paypa1' में 1)।") },
      { id: "subject", label: L("Subject: URGENT — verify within 24h", "विषय: अति आवश्यक — 24 घंटे में सत्यापित करें"), bad: true, reason: L("Urgency pressure is classic social engineering.", "जल्दबाज़ी का दबाव विशिष्ट सोशल इंजीनियरिंग है।") },
      { id: "body", label: L("\u201CClick here or your account will be locked.\u201D", "“यहाँ क्लिक करें वरना खाता बंद कर दिया जाएगा।”"), bad: true, reason: L("Threat + vague CTA = phishing pattern.", "धमकी + अस्पष्ट कॉल-टू-एक्शन = फ़िशिंग पैटर्न।") },
      { id: "link", label: L("Link: https://paypa1-secure.ru/verify", "लिंक: https://paypa1-secure.ru/verify"), bad: true, reason: L("Mismatched domain + suspicious TLD.", "बेमेल डोमेन + संदिग्ध TLD।") },
      { id: "sig", label: L("— PayPal Security Team", "— PayPal सुरक्षा टीम"), bad: false, reason: L("Signature alone isn't a strong signal.", "केवल हस्ताक्षर मज़बूत संकेत नहीं।") },
    ],
    story: {
      phish: L("You flagged it. The link's WHOIS record shows the domain was registered 6 hours ago in a country PayPal doesn't operate from.", "आपने इसे फ़्लैग किया। WHOIS रिकॉर्ड दिखाता है कि डोमेन 6 घंटे पहले एक ऐसे देश में पंजीकृत हुआ जहाँ PayPal नहीं चलता।"),
      real:  L("You trusted it. Your password — and the password manager you reuse it with — are now part of someone else's spreadsheet.", "आपने भरोसा किया। आपका पासवर्ड — और जिस मैनेजर में आप उसे दोहराते हैं — अब किसी और की स्प्रेडशीट का हिस्सा है।"),
    },
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
      { id: "body", label: L("\u201CBuy 10 gift cards, send me the codes.\u201D", "“10 गिफ्ट कार्ड खरीदो, कोड भेज दो।”"), bad: true, reason: L("Gift cards are the universal fraud payment rail.", "गिफ्ट कार्ड धोखाधड़ी का सबसे प्रचलित ज़रिया हैं।") },
      { id: "link", label: L("(no link, reply requested)", "(कोई लिंक नहीं, जवाब माँगा)"), bad: true, reason: L("BEC often skips links to avoid URL filters.", "BEC अक्सर URL फ़िल्टर से बचने के लिए लिंक नहीं रखता।") },
      { id: "sig", label: L("Sent from my iPhone", "मेरे iPhone से भेजा गया"), bad: false, reason: L("Mobile signatures are common — not a strong signal alone.", "मोबाइल हस्ताक्षर आम — अकेले मज़बूत संकेत नहीं।") },
    ],
    story: {
      phish: L("You called the CEO's actual desk. She's not in a meeting. She's on vacation in Crete and has never sent that email.", "आपने CEO के असली नंबर पर फ़ोन किया। वह मीटिंग में नहीं हैं — छुट्टी पर हैं और उन्होंने यह ईमेल नहीं भेजा।"),
      real:  L("You bought the cards. Twenty minutes later, the codes were resold on a Telegram channel. Finance wants a word.", "आपने कार्ड खरीदे। बीस मिनट बाद कोड एक टेलीग्राम चैनल पर बेच दिए गए। फाइनेंस से बातचीत बाकी है।"),
    },
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
      { id: "body", label: L("\u201CPay $2.99 to release your parcel.\u201D", "“पार्सल छुड़ाने के लिए $2.99 दें।”"), bad: true, reason: L("Couriers don't email random customs fees.", "कूरियर कंपनियाँ ऐसे ईमेल पर कस्टम शुल्क नहीं माँगतीं।") },
      { id: "link", label: L("Link: https://dh1-tracking.shop/pay", "लिंक: https://dh1-tracking.shop/pay"), bad: true, reason: L("Form harvests full card details, not $2.99.", "फ़ॉर्म $2.99 नहीं, पूरा कार्ड विवरण चुराता है।") },
      { id: "sig", label: L("DHL Express Team", "DHL Express टीम"), bad: false, reason: L("Brand name in signature is trivially copied.", "ब्रांड नाम हस्ताक्षर में नकल करना आसान।") },
    ],
    story: {
      phish: L("You ignored it. A week later your colleague paid the 'fee'. Their card was charged $890 at a luxury site in another timezone.", "आपने नज़रअंदाज़ किया। एक हफ़्ते बाद आपके साथी ने 'शुल्क' दिया। उनके कार्ड से दूसरे टाइमज़ोन की लग्ज़री साइट पर $890 कटे।"),
      real:  L("You paid. The $2.99 charge cleared. Then $89, then $890. Your bank's fraud line answers in 27 minutes.", "आपने पैसा दिया। पहले $2.99, फिर $89, फिर $890 कटे। बैंक की फ्रॉड हेल्पलाइन 27 मिनट में जवाब देती है।"),
    },
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
      { id: "body", label: L("\u201CIf this was you, no action is needed.\u201D", "“यदि यह आप थे तो कुछ करने की ज़रूरत नहीं।”"), bad: false, reason: L("No pressure, no payment, informative tone.", "कोई दबाव नहीं, कोई भुगतान नहीं, सूचनात्मक स्वर।") },
      { id: "link", label: L("Link: https://github.com/settings/security", "लिंक: https://github.com/settings/security"), bad: false, reason: L("Real GitHub domain — hover confirms it.", "असली GitHub डोमेन — होवर से पुष्टि।") },
      { id: "sig", label: L("Thanks, the GitHub Team", "धन्यवाद, GitHub टीम"), bad: false, reason: L("Matches GitHub's normal signature style.", "GitHub की सामान्य हस्ताक्षर शैली से मेल खाता है।") },
    ],
    story: {
      phish: L("You blocked a real notification. A real attacker login two weeks later goes unnoticed because you trained yourself to ignore these.", "आपने असली सूचना ब्लॉक की। दो हफ्ते बाद असली हमलावर का लॉगिन छूट गया क्योंकि आपने इन्हें अनदेखा करना सीख लिया।"),
      real:  L("You verified the location. It was you, on the train, on your laptop. No action needed — exactly as the email said.", "आपने स्थान सत्यापित किया। यह आप ही थे, ट्रेन में, लैपटॉप पर। कुछ करने की ज़रूरत नहीं — जैसा ईमेल ने कहा।"),
    },
  },
];

/* ────────────── SCENARIOS ────────────── */

export const SCENARIOS: Scenario[] = [
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
      L("Move admin endpoints behind a VPN or zero-trust proxy.", "एडमिन एंडपॉइंट VPN या ज़ीरो-ट्रस्ट प्रॉक्सी के पीछे रखें।"),
    ],
    logs: LOGS_A,
    phish: PHISH_EMAILS[0],
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
      L("Run quarterly phishing drills with real metrics.", "हर तिमाही फ़िशिंग अभ्यास करें और परिणाम मापें।"),
    ],
    logs: LOGS_B,
    phish: PHISH_EMAILS[1],
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
      L("Network segmentation around file servers.", "फ़ाइल सर्वर के चारों ओर नेटवर्क विभाजन।"),
    ],
    logs: LOGS_C,
    phish: PHISH_EMAILS[2],
  },
];

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

export function pickRandomScenario(): Scenario {
  const base = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  const phish = PHISH_EMAILS[Math.floor(Math.random() * PHISH_EMAILS.length)];
  const pool =
    base.id === "brute" ? DECISIONS_BRUTE : base.id === "phish" ? DECISIONS_PHISH : DECISIONS_RANSOM;
  return { ...base, decisions: pickN(pool, 4), phish };
}

export const INCIDENT_STEPS = ["Detection", "Containment", "Eradication", "Recovery"] as const;

export const IR_STEP_LABEL: Record<(typeof INCIDENT_STEPS)[number], LStr> = {
  Detection: L("Detection", "पहचान"),
  Containment: L("Containment", "रोकथाम"),
  Eradication: L("Eradication", "उन्मूलन"),
  Recovery: L("Recovery", "रिकवरी"),
};

const IR_POOL: Record<(typeof INCIDENT_STEPS)[number], { label: LStr; correct: boolean }[]> = {
  Detection: [
    { label: L("Review SIEM alerts and correlate logs", "SIEM अलर्ट देखें और लॉग मिलाएँ"), correct: true },
    { label: L("Restart the server and hope it goes away", "सर्वर रीस्टार्ट करें और उम्मीद करें कि ठीक हो जाएगा"), correct: false },
    { label: L("Pivot through EDR telemetry to find the entry host", "एंट्री होस्ट खोजने के लिए EDR टेलीमेट्री में जाँच करें"), correct: true },
    { label: L("Ask the user 'are you sure something is wrong?'", "उपयोगकर्ता से पूछें 'क्या सच में कुछ गड़बड़ है?'"), correct: false },
    { label: L("Check threat-intel feeds for matching IOCs", "मिलते IOC के लिए थ्रेट-इंटेल फ़ीड देखें"), correct: true },
  ],
  Containment: [
    { label: L("Isolate affected hosts from the network", "प्रभावित होस्ट नेटवर्क से अलग करें"), correct: true },
    { label: L("Email everyone the attacker's IP", "हमलावर का IP सबको ईमेल कर दें"), correct: false },
    { label: L("Block C2 domains at the firewall", "फ़ायरवॉल पर C2 डोमेन ब्लॉक करें"), correct: true },
    { label: L("Tweet about the incident in real time", "लाइव घटना के बारे में ट्वीट करें"), correct: false },
    { label: L("Disable compromised accounts and rotate tokens", "समझौता खातों को बंद करें और टोकन बदलें"), correct: true },
  ],
  Eradication: [
    { label: L("Remove malware, rotate credentials, patch entry point", "मैलवेयर हटाएँ, क्रेडेंशियल बदलें, एंट्री पॉइंट पैच करें"), correct: true },
    { label: L("Just delete the suspicious file", "बस संदिग्ध फ़ाइल हटा दें"), correct: false },
    { label: L("Rebuild affected hosts from a known-good image", "प्रभावित होस्ट को सही इमेज से फिर से बनाएँ"), correct: true },
    { label: L("Rename the malware so it can't run", "मैलवेयर का नाम बदल दें ताकि वह न चले"), correct: false },
    { label: L("Hunt for persistence mechanisms across the fleet", "पूरे सिस्टम में परसिस्टेंस तंत्र की खोज करें"), correct: true },
  ],
  Recovery: [
    { label: L("Restore from clean backup and monitor closely", "साफ़ बैकअप से बहाल करें और बारीकी से निगरानी रखें"), correct: true },
    { label: L("Bring everything back online immediately", "तुरंत सब कुछ वापस ऑनलाइन ले आएँ"), correct: false },
    { label: L("Re-enable accounts after MFA enrolment", "MFA पंजीकरण के बाद खाते फिर से चालू करें"), correct: true },
    { label: L("Skip the post-mortem to save time", "समय बचाने के लिए पोस्ट-मॉर्टम छोड़ दें"), correct: false },
    { label: L("Run validation tests before reconnecting users", "उपयोगकर्ताओं को जोड़ने से पहले सत्यापन परीक्षण करें"), correct: true },
  ],
};

export function pickIROptions() {
  const out: Record<(typeof INCIDENT_STEPS)[number], { label: LStr; correct: boolean }[]> = {
    Detection: [],
    Containment: [],
    Eradication: [],
    Recovery: [],
  };
  for (const step of INCIDENT_STEPS) {
    const good = IR_POOL[step].filter((o) => o.correct);
    const bad = IR_POOL[step].filter((o) => !o.correct);
    const picked = [
      good[Math.floor(Math.random() * good.length)],
      bad[Math.floor(Math.random() * bad.length)],
    ];
    if (Math.random() < 0.5) picked.reverse();
    out[step] = picked;
  }
  return out;
}
