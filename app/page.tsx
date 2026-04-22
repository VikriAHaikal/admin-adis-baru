"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [stats, setStats] = useState({ berita: 0, mitra: 0, anggota: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getStats() {
      const [news, partners, members] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("partners").select("*", { count: "exact", head: true }),
        supabase
          .from("site_settings")
          .select("value")
          .eq("key", "total_anggota")
          .single(),
      ]);

      setStats({
        berita: news.count || 0,
        mitra: partners.count || 0,
        anggota: parseInt(members.data?.value || "0"),
      });
      setLoading(false);
    }
    getStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12 space-y-8 lg:space-y-12">
      {/* Header - Stacking di Mobile */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-100 pb-10 mt-10 lg:mt-0">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Panel Eksekutif
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
            Kopkar Adis Dimension Footwear
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-5 py-3 rounded-2xl flex items-center gap-3 self-start md:self-center">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none">
            Sistem Aktif
          </span>
        </div>
      </div>

      {/* Grid Manajemen Utama - 1 Kolom di HP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {[
          {
            label: "Postingan Berita",
            val: stats.berita,
            path: "/berita",
            color: "bg-blue-600",
          },
          {
            label: "Mitra Strategis",
            val: stats.mitra,
            path: "/mitra-manager",
            color: "bg-emerald-600",
          },
        ].map((item, i) => (
          <div
            key={i}
            onClick={() => router.push(item.path)}
            className="bg-white p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3.5rem] border-2 border-slate-50 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
          >
            <p className="text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
              {item.label}
            </p>
            <div className="flex items-center justify-between">
              <h2 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter">
                {loading ? "..." : item.val}
              </h2>
              <div
                className={`p-4 lg:p-6 ${item.color} text-white rounded-2xl lg:rounded-3xl shadow-lg`}
              >
                <svg
                  className="w-6 h-6 lg:w-10 lg:h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistik Koperasi - Responsive Grid */}
      <div className="space-y-6 pt-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] px-2">
          Data Statistik
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl flex flex-col justify-between h-56 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Anggota Terdaftar
              </p>
              <h4 className="text-5xl font-black tracking-tighter">
                {loading ? "..." : stats.anggota.toLocaleString()}
              </h4>
            </div>
            <button
              onClick={() => router.push("/statistik-manager")}
              className="relative z-10 w-fit text-[10px] font-black text-blue-400 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full"
            >
              Update Data →
            </button>
          </div>
          {/* Box Placeholder tetep responsif */}
          <div className="hidden md:flex bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] items-center justify-center text-slate-300 font-bold text-xs uppercase tracking-widest">
            Locked
          </div>
          <div className="hidden md:flex bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] items-center justify-center text-slate-300 font-bold text-xs uppercase tracking-widest">
            Locked
          </div>
        </div>
      </div>
    </div>
  );
}
