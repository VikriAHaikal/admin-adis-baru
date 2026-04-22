"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

interface HeroData {
  setting_key: string;
  setting_value: string;
}

export default function HeroManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hero, setHero] = useState({
    hero_title: "",
    hero_subtitle: "",
    hero_image_url: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Ambil data hero secara real-time
  const fetchHero = useCallback(async (isMounted: boolean) => {
    const { data } = await supabase
      .from("site_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["hero_title", "hero_subtitle", "hero_image_url"]);

    if (isMounted && data) {
      const items = data as HeroData[];
      setHero({
        hero_title:
          items.find((i) => i.setting_key === "hero_title")?.setting_value ||
          "",
        hero_subtitle:
          items.find((i) => i.setting_key === "hero_subtitle")?.setting_value ||
          "",
        hero_image_url:
          items.find((i) => i.setting_key === "hero_image_url")
            ?.setting_value || "",
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      await fetchHero(isMounted);
    })();
    return () => {
      isMounted = false;
    };
  }, [fetchHero]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024)
        return toast.error("Ukuran banner maksimal 5MB!");
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const saveToast = toast.loading("Mensinkronisasi data hero...");

    try {
      let finalImageUrl = hero.hero_image_url;
      let oldImageToDelete: string | null = null;

      // 1. Jika ada file baru, siapkan penghapusan foto lama
      if (file) {
        if (hero.hero_image_url) {
          oldImageToDelete = hero.hero_image_url.split("/").pop() || null;
        }

        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("hero")
          .upload(fileName, file);
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("hero").getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }

      // 2. Update database secara kolektif
      const updates = [
        { key: "hero_title", val: hero.hero_title },
        { key: "hero_subtitle", val: hero.hero_subtitle },
        { key: "hero_image_url", val: finalImageUrl },
      ];

      await Promise.all(
        updates.map((u) =>
          supabase
            .from("site_settings")
            .update({ setting_value: u.val })
            .eq("setting_key", u.key),
        ),
      );

      // 3. Hapus file lama dari storage jika update database berhasil
      if (oldImageToDelete) {
        await supabase.storage.from("hero").remove([oldImageToDelete]);
      }

      // 4. Reset Form
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      await fetchHero(true);
      toast.success("Tampilan Beranda Berhasil Diperbarui!", { id: saveToast });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error("Error: " + msg, { id: saveToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-10 px-4">
      <Toaster position="top-right" />

      <div className="border-b-2 border-slate-100 pb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
          Manajemen Banner Hero
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
          Konfigurasi visual dan narasi sambutan pada halaman utama
        </p>
      </div>

      <form
        onSubmit={handleUpdate}
        className="grid grid-cols-1 lg:grid-cols-2 gap-10"
      >
        {/* Kolom Kiri: Konfigurasi Narasi */}
        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
            Konfigurasi Narasi
          </h3>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 px-1 tracking-widest">
              Judul Utama (H1)
            </label>
            <textarea
              value={hero.hero_title}
              onChange={(e) => setHero({ ...hero, hero_title: e.target.value })}
              className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-blue-500 font-bold text-lg h-40 transition-all leading-relaxed"
              placeholder="Masukkan judul banner..."
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 px-1 tracking-widest">
              Sub-Judul / Slogan
            </label>
            <textarea
              value={hero.hero_subtitle}
              onChange={(e) =>
                setHero({ ...hero, hero_subtitle: e.target.value })
              }
              className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-blue-500 font-bold h-40 transition-all leading-relaxed"
              placeholder="Masukkan narasi pendukung..."
              required
            />
          </div>
        </div>

        {/* Kolom Kanan: Media Visual */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Media Visual Utama
            </h3>

            {/* Preview Banner */}
            <div className="relative w-full h-64 bg-slate-100 rounded-[2.5rem] overflow-hidden border-2 border-slate-50 group">
              {preview || hero.hero_image_url ? (
                <Image
                  src={preview || hero.hero_image_url}
                  alt="Hero Preview"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300 font-bold uppercase text-[10px]">
                  Tidak Ada Media
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 px-1 tracking-widest">
                Unggah Media Baru
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] font-bold text-xs cursor-pointer"
              />
              <p className="text-[9px] font-bold text-slate-400 mt-3 px-1 uppercase tracking-tighter">
                * Rekomendasi: 1920x1080 piksel (Maks. 5MB)
              </p>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-slate-900 text-white py-7 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? "Menyinkronkan..." : "Simpan Konfigurasi Hero"}
          </button>
        </div>
      </form>
    </div>
  );
}
