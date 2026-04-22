"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface StatItem {
  setting_key: string;
  setting_value: string;
}

export default function StatistikManager() {
  const [stats, setStats] = useState({
    total_anggota: "0",
    total_aset: "0",
    total_shu: "0",
  });
  const [loading, setLoading] = useState(false);

  // Memoize fungsi fetch
  const fetchStats = useCallback(async (isMounted: boolean) => {
    const { data } = await supabase
      .from("site_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["total_anggota", "total_aset", "total_shu"]);

    if (isMounted && data) {
      const items = data as StatItem[];
      setStats({
        total_anggota:
          items.find((i) => i.setting_key === "total_anggota")?.setting_value ||
          "0",
        total_aset:
          items.find((i) => i.setting_key === "total_aset")?.setting_value ||
          "0",
        total_shu:
          items.find((i) => i.setting_key === "total_shu")?.setting_value ||
          "0",
      });
    }
  }, []);

  // PERBAIKAN: Gunakan IIFE + await untuk menenangkan linter
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

    // Perbaikan: Cek status error pada setiap hasil Promise
    const responses = await Promise.all(
      keys.map((key) =>
        supabase
          .from("site_settings")
          .update({ setting_value: stats[key] })
          .eq("setting_key", key),
      ),
    );

    const hasError = responses.some((res) => res.error);

    if (hasError) {
      alert("Gagal memperbarui beberapa data statistik");
    } else {
      alert("Statistik berhasil diperbarui!");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl space-y-10">
      <div className="border-b-2 border-slate-100 pb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
          Statistik Koperasi
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
          Update Data Angka Capaian Secara Real-Time
        </p>
      </div>

      <form
        onSubmit={handleUpdate}
        className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(["total_anggota", "total_aset", "total_shu"] as const).map(
            (key) => (
              <div key={key}>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-3 px-1 tracking-widest">
                  {key.replace("_", " ")}
                </label>
                <input
                  type="text"
                  value={stats[key]}
                  onChange={(e) =>
                    setStats({ ...stats, [key]: e.target.value })
                  }
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-500 font-black text-2xl transition-all"
                />
              </div>
            ),
          )}
        </div>

        <div className="pt-6 border-t border-slate-100">
          <button
            disabled={loading}
            className="w-full md:w-fit px-12 bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Statistik"}
          </button>
        </div>
      </form>

      <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex gap-4 items-center">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          !
        </div>
        <p className="text-xs font-bold text-blue-800 leading-relaxed">
          Anggota Terdaftar akan langsung memperbarui angka pada Dashboard
          Utama. Pastikan input hanya berupa angka tanpa titik atau koma.
        </p>
      </div>
    </div>
  );
}
