import type { Metadata } from "next";
import { Inter, Poppins, Kalam } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { DefaultSkipLinks } from "@/components/ui/SkipLink";
import { MonitoringToggle } from "@/components/monitoring/MonitoringDashboard";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: "--font-poppins",
  display: 'swap',
});

const kalam = Kalam({
  subsets: ["latin"],
  weight: ['300', '400', '700'],
  variable: "--font-kalam",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Omoide - AI-Powered Child Growth Stories",
  description: "Upload your child's photos and let AI automatically generate growth records and comments to create beautiful storybooks.",
  keywords: ["AI", "child growth", "photo stories", "parenting", "memories"],
  authors: [{ name: "Omoide Team" }],
  openGraph: {
    title: "Omoide - AI-Powered Child Growth Stories",
    description: "Upload your child's photos and let AI automatically generate growth records and comments to create beautiful storybooks.",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omoide - AI-Powered Child Growth Stories",
    description: "Upload your child's photos and let AI automatically generate growth records and comments to create beautiful storybooks.",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ed8049",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${poppins.variable} ${kalam.variable}`}>
      <body className="font-sans antialiased">
        <DefaultSkipLinks />
        <LocaleProvider>
          <AuthProvider>
            <ToastProvider>
              <div id="root" role="application" aria-label="Omoide アプリケーション">
                {children}
                <MonitoringToggle />
              </div>
            </ToastProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
