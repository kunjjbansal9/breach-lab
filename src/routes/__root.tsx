import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { LanguageProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
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
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7bef0b36-c230-488d-8803-e86598494560/id-preview-5d17124e--0d10d293-8775-4c2d-8f23-f4c334c06a51.lovable.app-1778231062649.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <LanguageProvider>
      <Outlet />
      <Toaster />
    </LanguageProvider>
  );
}
