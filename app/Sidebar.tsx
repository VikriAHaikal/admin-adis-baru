"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSlug = searchParams.get("slug");

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [manualOpenGroup, setManualOpenGroup] = useState<string | null>(null);

  const menuGroups = [
    {
      group: "Manajemen Beranda",
      items: [
        { name: "Dashboard Utama", path: "/" },
        { name: "Pengaturan Hero", path: "/beranda/hero" },
        { name: "Mitra Strategis", path: "/mitra-manager" },
        { name: "Statistik Koperasi", path: "/statistik-manager" },
      ],
    },
    {
      group: "Manajemen Profile",
      items: [
        { name: "Visi & Misi", path: "/pages-manager?slug=visi-misi" },
        { name: "Sejarah", path: "/pages-manager?slug=sejarah" },
        { name: "Struktur Organisasi", path: "/struktur" },
        { name: "Legalitas", path: "/pages-manager?slug=legalitas" },
        { name: "Prestasi", path: "/pages-manager?slug=prestasi" },
      ],
    },
    {
      group: "Manajemen Layanan",
      items: [
        { name: "Unit Ritel", path: "/programs?cat=unit-ritel" },
        {
          name: "Unit Simpan Pinjam",
          path: "/programs?cat=unit-simpan-pinjam",
        },
        { name: "Unit Jasa", path: "/programs?cat=unit-jasa" },
      ],
    },
    {
      group: "Manajemen Berita",
      items: [
        { name: "Berita Utama", path: "/berita" },
        { name: "Kategori Berita", path: "/berita/kategori" },
      ],
    },
    {
      group: "Pengaturan",
      items: [{ name: "WhatsApp Admin", path: "/settings/whatsapp" }],
    },
  ];

  // HITUNG OTOMATIS: Cari grup aktif langsung saat render (Tanpa UseEffect)
  const activeGroupFromUrl =
    menuGroups.find((group) =>
      group.items.some((item) => {
        const itemPath = item.path.split("?")[0];
        const itemSlug = new URLSearchParams(item.path.split("?")[1]).get(
          "slug",
        );
        return itemSlug
          ? pathname === itemPath && currentSlug === itemSlug
          : pathname === itemPath;
      }),
    )?.group || null;

  // Prioritaskan klik manual, kalau tidak ada pakai deteksi URL
  const openGroup = manualOpenGroup ?? activeGroupFromUrl;

  const handleLogout = async () => {
    if (confirm("Yakin ingin keluar?")) {
      await supabase.auth.signOut();
      router.push("/login");
    }
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 flex items-center px-6 z-50 border-b border-slate-800 shadow-md">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -ml-2 text-white"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h2 className="ml-4 text-lg font-black text-blue-500 uppercase">
          Admin Adis
        </h2>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-[60] w-72 bg-slate-900 text-white flex flex-col p-6 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-10 px-4">
          <h1 className="text-2xl font-black text-blue-500 uppercase leading-none">
            Admin Adis
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">
            Management System
          </p>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {menuGroups.map((group, idx) => {
            const isOpen = openGroup === group.group;
            return (
              <div key={idx} className="space-y-1">
                <button
                  onClick={() =>
                    setManualOpenGroup(isOpen ? "CLOSE_ALL" : group.group)
                  }
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isOpen ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800"}`}
                >
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    {group.group}
                  </span>
                  <span
                    className={`text-[10px] transition-transform ${isOpen ? "rotate-180" : ""}`}
                  >
                    ▼
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 mt-2" : "max-h-0"}`}
                >
                  <div className="pl-4 space-y-1 border-l-2 border-slate-800 ml-2">
                    {group.items.map((item) => {
                      const itemPath = item.path.split("?")[0];
                      const itemSlug = new URLSearchParams(
                        item.path.split("?")[1],
                      ).get("slug");
                      const isActive = itemSlug
                        ? pathname === itemPath && currentSlug === itemSlug
                        : pathname === itemPath;
                      return (
                        <button
                          key={item.path}
                          onClick={() => {
                            router.push(item.path);
                            setIsMobileOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold ${isActive ? "text-blue-500 bg-blue-500/10" : "text-slate-500 hover:text-slate-200"}`}
                        >
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-slate-800/30 text-slate-500 py-3 rounded-2xl font-black border border-slate-800 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          Logout
        </button>
      </aside>
    </>
  );
}
