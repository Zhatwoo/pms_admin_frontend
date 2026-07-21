import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { BRAND_CONFIG } from "@/lib/brand-config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    template: `%s | ${BRAND_CONFIG.shortCompanyName}`,
    default: BRAND_CONFIG.companyName,
  },
  description: BRAND_CONFIG.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased`}>
        <Providers>
          {children}
          <Toaster 
            position="top-center" 
            richColors 
            theme="system" 
            toastOptions={{
              className: "font-sans",
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
