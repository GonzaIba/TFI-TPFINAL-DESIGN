import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";
import Script from "next/script";

import "@/styles/auth/login.css";
import "@/styles/pages/forum.css";
import "@/styles/components/grid.css";
import "@/styles/components/skeleton.css";
import "@/styles/site.css";
import "./globals.css";
import { QueryProvider } from "@/providers/queryProvider";
import { AuthProvider } from "@/providers/authProvider";
import { SnackBarProvider } from "@/providers/snackBarProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ⬇️ NUEVO: Poppins global
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PLOFTEC",
  description: "La mejor plataforma educativa + foro",
  icons: {
    icon: '/PLOFTEC-ICON.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* iconos, roboto, etc. si querés los podés dejar */}
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.15.4/css/all.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Open+Sans"
        />
        <link
          rel="stylesheet"
          href="https://unicons.iconscout.com/release/v4.0.0/css/line.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css"
        />
        <link 
          rel="stylesheet" 
          type="text/css" 
          href="https://fonts.googleapis.com/css?family=Poppins" 
        />

        <Script src="https://code.jquery.com/jquery-3.5.1.min.js" />
      </head>
      {/* ⬇️ acá aplicamos Poppins como fuente base */}
      <body
        className={`${poppins.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <SnackBarProvider />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
