import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PageTransition } from "@/components/PageTransition";
import { ThemeProvider } from "@/lib/theme";

const googleSans = localFont({
  src: [
    {
      path: "../public/fonts/google-sans/GoogleSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/google-sans/GoogleSans-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/google-sans/GoogleSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/google-sans/GoogleSans-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/fonts/google-sans/GoogleSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/google-sans/GoogleSans-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../public/fonts/google-sans/GoogleSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/google-sans/GoogleSans-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-body",
  display: "swap",
});

const merriweather = localFont({
  src: [
    {
      path: "../public/fonts/merriweather/Merriweather-VariableFont_opsz,wdth,wght.ttf",
      style: "normal",
    },
    {
      path: "../public/fonts/merriweather/Merriweather-Italic-VariableFont_opsz,wdth,wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-title",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Carl Stratton · Product Design & Strategy",
  description:
    "Minimal, Swiss-inspired portfolio for Carl Stratton showcasing product design and strategy case studies.",
  metadataBase: new URL("https://www.ccaarrll.com"),
  openGraph: {
    title: "Carl Stratton · Product Design & Strategy",
    description:
      "Minimal, Swiss-inspired portfolio for Carl Stratton showcasing product design and strategy case studies.",
    url: "https://www.ccaarrll.com",
    siteName: "Carl Stratton",
    locale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${googleSans.variable} ${merriweather.variable}`}
    >
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(!localStorage.getItem("carl-theme"))document.documentElement.setAttribute("data-theme","dark")})();`,
          }}
        />
        <ThemeProvider>
          <PageTransition>{children}</PageTransition>
        </ThemeProvider>
      </body>
    </html>
  );
}
