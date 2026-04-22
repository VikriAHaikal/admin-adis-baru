"use client"; // Wajib agar usePathname bisa jalan
import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  // Logika pengecekan halaman login
  const isLoginPage = pathname === "/login";

  return (
    <html lang="id" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <div className="flex h-screen overflow-hidden bg-gray-50">
          {/* SIDEBAR: Hanya muncul jika BUKAN di halaman login */}
          {!isLoginPage && <Sidebar />}

          {/* MAIN CONTENT */}
          <main
            className={`
            flex-1 overflow-y-auto bg-gray-50 transition-all
            ${!isLoginPage ? "pt-24 lg:pt-10 p-6 lg:p-10" : "p-0"} 
          `}
          >
            {/* pt-24 di atas berfungsi agar konten tidak tertutup Top Bar Mobile (h-16) */}
            <div
              className={!isLoginPage ? "max-w-6xl mx-auto" : "h-full w-full"}
            >
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
