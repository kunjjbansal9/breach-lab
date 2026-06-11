import { jsx, jsxs } from "react/jsx-runtime";
import { createRootRoute, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter, useRouter } from "@tanstack/react-router";
import { useState, useEffect, createContext, useContext } from "react";
import { Toaster as Toaster$1 } from "sonner";
const appCss = "/assets/styles-DKn1OW5Y.css";
const LangCtx = createContext(null);
const STORAGE_KEY = "cas_lang";
function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "hi") setLangState(saved);
  }, []);
  const setLang = (l) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
    }
  };
  if (!lang) {
    return /* @__PURE__ */ jsx(LanguageGate, { onPick: setLang });
  }
  const t = (en, hi) => lang === "hi" ? hi : en;
  return /* @__PURE__ */ jsx(LangCtx.Provider, { value: { lang, setLang, t }, children });
}
function useLang() {
  const v = useContext(LangCtx);
  if (!v) {
    return {
      lang: "en",
      setLang: () => {
      },
      t: (en) => en
    };
  }
  return v;
}
function LanguageGate({ onPick }) {
  return /* @__PURE__ */ jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md rounded-md border border-primary/40 bg-card/90 p-6 shadow-2xl border-glow scanlines", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { className: "h-2 w-2 animate-pulse rounded-full bg-primary" }),
      /* @__PURE__ */ jsx("span", { children: "secure_sandbox · select language" })
    ] }),
    /* @__PURE__ */ jsxs("h1", { className: "mt-3 text-2xl font-bold text-primary text-glow", children: [
      "> Choose language",
      /* @__PURE__ */ jsx("span", { className: "cursor-blink", children: "_" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "भाषा चुनें / Select your language to continue." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onPick("en"),
          className: "rounded-md border border-primary bg-primary/10 px-4 py-3 text-left transition hover:bg-primary/20",
          children: [
            /* @__PURE__ */ jsx("div", { className: "text-lg font-bold uppercase tracking-widest text-primary text-glow", children: "English" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: "Continue in English" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onPick("hi"),
          className: "rounded-md border border-accent bg-accent/10 px-4 py-3 text-left transition hover:bg-accent/20",
          children: [
            /* @__PURE__ */ jsx("div", { className: "text-lg font-bold uppercase tracking-widest text-accent", children: "हिन्दी" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: "हिन्दी में जारी रखें" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-5 text-[10px] uppercase tracking-widest text-muted-foreground", children: "# you can change this anytime from the top of the page" })
  ] }) });
}
function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-[10px] uppercase tracking-widest", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setLang("en"),
        className: `rounded-sm border px-2 py-0.5 transition ${lang === "en" ? "border-primary bg-primary/10 text-primary text-glow" : "border-border text-muted-foreground hover:text-foreground"}`,
        children: "EN"
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setLang("hi"),
        className: `rounded-sm border px-2 py-0.5 transition ${lang === "hi" ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground"}`,
        children: "हिन्दी"
      }
    )
  ] });
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
const Route$1 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cyber Attack Simulator — Learn How Hackers Crack Passwords" },
      { name: "description", content: "Educational cybersecurity simulator. Visualize brute force attacks, test password strength, and learn how to stay safe online." },
      { name: "author", content: "Cyber Attack Simulator" },
      { property: "og:title", content: "Cyber Attack Simulator — Learn How Hackers Crack Passwords" },
      { property: "og:description", content: "Educational cybersecurity simulator. Visualize brute force attacks, test password strength, and learn how to stay safe online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Cyber Attack Simulator — Learn How Hackers Crack Passwords" },
      { name: "twitter:description", content: "Educational cybersecurity simulator. Visualize brute force attacks, test password strength, and learn how to stay safe online." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7bef0b36-c230-488d-8803-e86598494560/id-preview-5d17124e--0d10d293-8775-4c2d-8f23-f4c334c06a51.lovable.app-1778231062649.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7bef0b36-c230-488d-8803-e86598494560/id-preview-5d17124e--0d10d293-8775-4c2d-8f23-f4c334c06a51.lovable.app-1778231062649.png" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  return /* @__PURE__ */ jsxs(LanguageProvider, { children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
const $$splitComponentImporter = () => import("./index-BLYPArQg.js");
const Route = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$1
});
const rootRouteChildren = {
  IndexRoute
};
const routeTree = Route$1._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultErrorComponent({ error, reset }) {
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10", children: /* @__PURE__ */ jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-destructive",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        children: /* @__PURE__ */ jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "An unexpected error occurred. Please try again." }),
    false,
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  LanguageSwitcher as L,
  router as r,
  useLang as u
};
