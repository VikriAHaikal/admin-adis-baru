"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export default function WhatsAppSettings() {
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchWhatsapp = useCallback(async (isMounted: boolean) => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "whatsapp_number")
      .single();

    if (isMounted && data) {
      setWhatsapp(data.setting_value || "");
      setFetching(false);
    }
    if (error) setFetching(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      await fetchWhatsapp(isMounted);
    })();
    return () => {
      isMounted = false;
    };
  }, [fetchWhatsapp]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let cleanedNum = whatsapp.replace(/[^0-9]/g, "");
    if (cleanedNum.startsWith("0")) {
      cleanedNum = "62" + cleanedNum.substring(1);
    } else if (!cleanedNum.startsWith("62")) {
      cleanedNum = "62" + cleanedNum;
    }

    const { error } = await supabase
      .from("site_settings")
      .update({
        setting_value: cleanedNum,
        updated_at: new Date().toISOString(),
      })
      .eq("setting_key", "whatsapp_number");

    if (error) {
      alert("Gagal memperbarui nomor: " + error.message);
    } else {
      setWhatsapp(cleanedNum);
      alert("Nomor WhatsApp berhasil diperbarui secara sistem.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-10">
      <div className="border-l-4 border-blue-600 pl-6">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
          Konfigurasi WhatsApp
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-2">
          Kelola nomor admin untuk integrasi layanan pesan instan pada website
          utama.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <form
            onSubmit={handleUpdate}
            className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8"
          >
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
                Nomor WhatsApp Aktif
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-slate-200 pr-4">
                  <span className="text-xl">🇮🇩</span>
                  <span className="font-black text-slate-400">+</span>
                </div>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  disabled={fetching}
                  className="w-full pl-24 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-500 font-black text-3xl transition-all"
                  placeholder="62812xxxx"
                  required
                />
              </div>
              <p className="text-[10px] font-bold text-slate-400 italic px-2">
                *Sistem akan otomatis mengonversi format 08xx menjadi 628xx.
              </p>
            </div>

            <button
              disabled={loading || fetching}
              className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Sinkronisasi Nomor Admin"}
            </button>
          </form>
        </div>

        <div className="md:col-span-1 space-y-6">
          <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-lg flex flex-col justify-between h-full min-h-[300px]">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 text-2xl">
                💬
              </div>
              <h3 className="text-xl font-black leading-tight">
                Integrasi Live Chat
              </h3>
              <p className="text-xs font-medium text-emerald-100 mt-4 leading-relaxed">
                {/* PERBAIKAN: Menggunakan entity &quot; agar linter senang */}
                Nomor ini akan digunakan sebagai tujuan utama tombol
                &quot;Hubungi Kami&quot; di seluruh halaman website publik.
              </p>
            </div>
            <div className="pt-6 border-t border-white/20">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                Status Layanan
              </p>
              <p className="text-sm font-bold mt-1">● Terkoneksi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex gap-5 items-center">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400">
          🛡️
        </div>
        <p className="text-xs font-bold text-slate-500 leading-relaxed">
          Pembaruan ini dilindungi oleh{" "}
          <span className="text-blue-600">Row Level Security (RLS)</span>. Hanya
          akun admin terverifikasi yang diizinkan memodifikasi parameter ini.
        </p>
      </div>
    </div>
  );
}
