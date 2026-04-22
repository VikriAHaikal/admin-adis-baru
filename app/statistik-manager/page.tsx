"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface StatItem {
  setting_key: string;
  setting_value: string;
  updated_at: string;
}

const UNIT_MULTIPLIERS: Record<string, number> = {
  "": 1,
  Ribu: 1000,
  Juta: 1000000,
  Miliar: 1000000000,
  Triliun: 1000000000000,
};

export default function StatistikManager() {
  const [stats, setStats] = useState({
    total_anggota: { val: "", unit: "" },
    total_aset: { val: "", unit: "" },
    total_shu: { val: "", unit: "" },
  });
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async (isMounted: boolean) => {
    const { data } = await supabase
      .from("site_settings")
      .select("setting_key, setting_value, updated_at")
      .in("setting_key", ["total_anggota", "total_aset", "total_shu"]);

    if (isMounted && data) {
      const items = data as StatItem[];
      setStats({
        total_anggota: {
          val:
            items.find((i) => i.setting_key === "total_anggota")
              ?.setting_value || "0",
          unit: "",
        },
        total_aset: {
          val:
            items.find((i) => i.setting_key === "total_aset")?.setting_value ||
            "0",
          unit: "",
        },
        total_shu: {
          val:
            items.find((i) => i.setting_key === "total_shu")?.setting_value ||
            "0",
          unit: "",
        },
      });
      // Ambil waktu update dari salah satu row (asumsi diupdate bersamaan)
      if (items.length > 0) setLastUpdate(items[0].updated_at);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      await fetchStats(isMounted);
    })();
    return () => {
      isMounted = false;
    };
  }, [fetchStats]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const keys = ["total_anggota", "total_aset", "total_shu"] as const;
    const responses = await Promise.all(
      keys.map((key) => {
        const numericVal =
          parseFloat(stats[key].val.replace(/[^0-9.]/g, "")) || 0;
        const multiplier = UNIT_MULTIPLIERS[stats[key].unit];
        const finalValue = (numericVal * multiplier).toString();

        return supabase
          .from("site_settings")
          .update({
            setting_value: finalValue,
            updated_at: new Date().toISOString(),
          })
          .eq("setting_key", key);
      }),
    );

    if (responses.some((res) => res.error)) {
      alert("Terjadi kesalahan sistem saat sinkronisasi data.");
    } else {
      alert("Data statistik berhasil diperbarui secara sistem.");
      fetchStats(true);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-10">
      {/* Header Selaras dengan Sidebar */}
      <div className="border-l-4 border-blue-600 pl-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
            Manajemen Statistik Koperasi
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Pembaruan angka capaian strategis dengan sistem konversi otomatis.
          </p>
        </div>
        {lastUpdate && (
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Terakhir Diperbarui
            </p>
            <p className="text-xs font-bold text-slate-600">
              {new Date(lastUpdate).toLocaleString("id-ID")}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        {(["total_anggota", "total_aset", "total_shu"] as const).map((key) => {
          const multiplier = UNIT_MULTIPLIERS[stats[key].unit];
          const previewVal = (parseFloat(stats[key].val) || 0) * multiplier;

          return (
            <div
              key={key}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-blue-100 transition-all"
            >
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4 px-1">
                {key.replace("total_", "Indikator ").replace("_", " ")}
              </label>

              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={stats[key].val}
                    onChange={(e) =>
                      setStats({
                        ...stats,
                        [key]: { ...stats[key], val: e.target.value },
                      })
                    }
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-black text-2xl transition-all"
                    placeholder="0"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs uppercase">
                    Nilai
                  </div>
                </div>

                <div className="relative w-full md:w-56">
                  <select
                    value={stats[key].unit}
                    onChange={(e) =>
                      setStats({
                        ...stats,
                        [key]: { ...stats[key], unit: e.target.value },
                      })
                    }
                    className="w-full p-5 bg-slate-100 border-2 border-slate-200 rounded-2xl font-bold text-sm appearance-none outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {Object.keys(UNIT_MULTIPLIERS).map((u) => (
                      <option key={u} value={u}>
                        {u || "Satuan Dasar"}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* Status Hasil Konversi */}
              <div className="mt-4 flex items-center gap-3 bg-blue-50/50 w-fit px-4 py-2 rounded-full border border-blue-100/50">
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                  Hasil Konversi:
                </span>
                <span className="text-sm font-black text-blue-600 tracking-tight">
                  {previewVal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          );
        })}

        <div className="pt-4">
          <button
            disabled={loading}
            className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? "Menyimpan Perubahan..." : "Sinkronisasi Data Statistik"}
          </button>
        </div>
      </form>
    </div>
  );
}
