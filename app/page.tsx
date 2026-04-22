"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [stats, setStats] = useState({
    berita: 0,
    mitra: 0,
    anggota: "0",
    aset: "0",
    shu: "0",
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getStats = useCallback(async (isMounted: boolean) => {
    const [news, partners, settingsData] = await Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("partners").select("*", { count: "exact", head: true }),
      supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["total_anggota", "total_aset", "total_shu"]),
    ]);

    if (isMounted) {
      const findVal = (key: string) =>
        settingsData.data?.find((i) => i.setting_key === key)?.setting_value ||
        "0";

      setStats({
        berita: news.count || 0,
        mitra: partners.count || 0,
        anggota: findVal("total_anggota"),
        aset: findVal("total_aset"),
        shu: findVal("total_shu"),
      });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      await getStats(isMounted);
    })();
    return () => {
      isMounted = false;
    };
  }, [getStats]);

  // PERBAIKAN: Fungsi pemformatan cerdas (Smart Formatting)
  const formatCompact = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return val;

    // Logika Konversi Satuan
    if (num >= 1_000_000_000_000)
      return (num / 1_000_000_000_000).toLocaleString("id-ID") + " Triliun";
    if (num >= 1_000_000_000)
      return (num / 1_000_000_000).toLocaleString("id-ID") + " Miliar";
    if (num >= 1_000_000)
      return (num / 1_000_000).toLocaleString("id-ID") + " Juta";
    if (num >= 1_000) return (num / 1_000).toLocaleString("id-ID") + " Ribu";

    return num.toLocaleString("id-ID");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12 space-y-8 lg:space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-100 pb-10 mt-10 lg:mt-0">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Dashboard Utama
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
            Ringkasan Operasional Koperasi Adis
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-5 py-3 rounded-2xl flex items-center gap-3 self-start md:self-center">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none">
            Sistem Aktif
          </span>
        </div>
      </div>

      {/* Grid Manajemen Berita & Mitra */}
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

      {/* Statistik Koperasi: Menggunakan Format Compact */}
      <div className="space-y-6 pt-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] px-2">
          Capaian Strategis Koperasi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: "Anggota Terdaftar",
              val: stats.anggota,
              color: "bg-slate-900",
            },
            { label: "Total Aset", val: stats.aset, color: "bg-blue-900" },
            { label: "Total SHU", val: stats.shu, color: "bg-slate-800" },
          ].map((card, idx) => (
            <div
              key={idx}
              className={`${card.color} p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between h-56 relative overflow-hidden group`}
            >
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {card.label}
                </p>
                <h4 className="text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
                  {/* Tampilan angka cerdas dengan satuan */}
                  {loading ? "..." : formatCompact(card.val)}
                </h4>
              </div>
              <button
                onClick={() => router.push("/statistik-manager")}
                className="relative z-10 w-fit text-[10px] font-black text-blue-400 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
              >
                Kelola Data →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
