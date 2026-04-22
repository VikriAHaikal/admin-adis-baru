"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface HeroData {
  setting_key: string;
  setting_value: string;
}

export default function HeroManager() {
  const [hero, setHero] = useState({
    hero_title: "",
    hero_subtitle: "",
    hero_image_url: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch data hero secara stabil
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = hero.hero_image_url;

      // 1. Jika ada file baru, upload dulu
      if (file) {
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

      // 2. Update semua text & image url ke site_settings
      const updates = [
        { key: "hero_title", val: hero.hero_title },
        { key: "hero_subtitle", val: hero.hero_subtitle },
        { key: "hero_image_url", val: finalImageUrl },
      ];

      const responses = await Promise.all(
        updates.map((u) =>
          supabase
            .from("site_settings")
            .update({ setting_value: u.val })
            .eq("setting_key", u.key),
        ),
      );

      if (responses.some((r) => r.error))
        throw new Error("Gagal update database");

      setFile(null);
      const fileInput = document.getElementById(
        "fileInput",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      await fetchHero(true);
      alert("Tampilan Beranda Berhasil Diperbarui!");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan";
      alert("Error: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-10">
      <div className="border-b-2 border-slate-100 pb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
          Pengaturan Hero
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
          Kelola Banner Utama dan Sambutan Beranda
        </p>
      </div>

      <form
        onSubmit={handleUpdate}
        className="grid grid-cols-1 lg:grid-cols-2 gap-10"
      >
        {/* Kolom Kiri: Input Teks */}
        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-8">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
            Konten Teks
          </h3>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 px-1">
              Judul Utama (H1)
            </label>
            <textarea
              value={hero.hero_title}
              onChange={(e) => setHero({ ...hero, hero_title: e.target.value })}
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-500 font-bold text-lg h-32 transition-all"
              placeholder="Masukkan judul banner..."
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 px-1">
              Sub-Judul / Slogan
            </label>
            <textarea
              value={hero.hero_subtitle}
              onChange={(e) =>
                setHero({ ...hero, hero_subtitle: e.target.value })
              }
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-500 font-bold h-32 transition-all"
              placeholder="Masukkan slogan singkat..."
              required
            />
          </div>
        </div>

        {/* Kolom Kanan: Visual & Upload */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Banner Utama
            </h3>

            {/* Preview Banner Saat Ini */}
            <div className="relative w-full h-48 bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-slate-50">
              {hero.hero_image_url ? (
                <Image
                  src={hero.hero_image_url}
                  alt="Hero Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300 font-bold uppercase text-[10px]">
                  No Image Preview
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 px-1">
                Ganti Foto Banner
              </label>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
                className="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl font-bold text-xs"
              />
              <p className="text-[9px] text-slate-400 mt-2 px-1">
                * Disarankan ukuran 1920x1080px untuk hasil terbaik.
              </p>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? "Menyimpan Perubahan..." : "Simpan Pengaturan Hero"}
          </button>
        </div>
      </form>
    </div>
  );
}
