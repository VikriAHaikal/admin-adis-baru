"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

// Definisi tipe data agar tidak ada error 'any'
interface Partner {
  id: number;
  name: string;
  logo_url: string;
}

export default function MitraManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Memoize fungsi fetch agar stabil
  const fetchPartners = useCallback(async (isMounted: boolean) => {
    const { data } = await supabase
      .from("partners")
      .select("*")
      .order("id", { ascending: true });

    if (isMounted && data) {
      setPartners(data as Partner[]);
    }
  }, []);

  // PERBAIKAN: Gunakan IIFE + await untuk menenangkan linter
  useEffect(() => {
    let isMounted = true;

    (async () => {
      await fetchPartners(isMounted);
    })();

    return () => {
      isMounted = false;
    };
  }, [fetchPartners]);

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Pilih logo mitra dulu!");
    setLoading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("partners")
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("partners").getPublicUrl(fileName);
      const { error: insertError } = await supabase
        .from("partners")
        .insert([{ name, logo_url: publicUrl }]);
      if (insertError) throw insertError;

      setName("");
      setFile(null);
      const fileInput = document.getElementById(
        "fileInput",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      await fetchPartners(true);
      alert("Mitra berhasil ditambahkan!");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan";
      alert("Error: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, logoUrl: string) => {
    if (confirm("Hapus mitra ini?")) {
      const fileName = logoUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("partners").remove([fileName]);
      }
      await supabase.from("partners").delete().eq("id", id);
      await fetchPartners(true);
    }
  };

  return (
    <div className="space-y-10">
      <div className="border-b-2 border-slate-100 pb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
          Manajemen Mitra
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
          Upload Logo Partner Strategis Koperasi
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <form
            onSubmit={handleAddPartner}
            className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-6"
          >
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Tambah Mitra Baru
            </h3>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 px-1 tracking-widest">
                Nama Perusahaan
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold transition-all placeholder:text-slate-300"
                placeholder="Nama Mitra"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 px-1 tracking-widest">
                Pilih Logo Mitra
              </label>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
                className="w-full p-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl font-bold text-xs"
                required
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? "Sedang Upload..." : "Simpan Mitra"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest px-2">
            Daftar Partner Aktif
          </h3>
          {partners.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                Belum ada data mitra
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 bg-slate-50 rounded-xl overflow-hidden p-2">
                      <Image
                        src={partner.logo_url}
                        alt={partner.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none">
                        {partner.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                        Logo Terupload
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(partner.id, partner.logo_url)}
                    className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
