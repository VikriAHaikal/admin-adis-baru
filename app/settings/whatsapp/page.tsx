"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function WhatsAppSetting() {
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSetting() {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "whatsapp_number")
        .single();
      if (data) setWhatsapp(data.setting_value);
      setLoading(false);
    }
    fetchSetting();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { setting_key: "whatsapp_number", setting_value: whatsapp },
        { onConflict: "setting_key" },
      );

    if (error) alert("Gagal: " + error.message);
    else alert("Nomor WhatsApp diperbarui!");
    setSaving(false);
  }

  if (loading)
    return <div className="p-10 text-center font-sans">Memuat...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Setting WhatsApp
      </h1>
      <form
        onSubmit={handleSave}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6"
      >
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Nomor WhatsApp Admin
          </label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Contoh: 628123456789"
            required
          />
        </div>
        <button
          disabled={saving}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
