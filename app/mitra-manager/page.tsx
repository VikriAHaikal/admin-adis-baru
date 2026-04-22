"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react"; // 1. Tambahkan useRef
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import PartnerCard from "@/components/PartnerCard";
import PartnerSkeleton from "@/components/PartnerSkeleton";
import Image from "next/image";

interface Partner {
  id: number;
  name: string;
  logo_url: string;
}

export default function MitraManager() {
  // 2. Inisialisasi Ref untuk mengontrol elemen input file secara manual
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchPartners = useCallback(async (isMounted: boolean) => {
    const { data } = await supabase
      .from("partners")
      .select("*")
      .order("id", { ascending: false });
    if (isMounted && data) {
      setPartners(data as Partner[]);
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      await fetchPartners(isMounted);
    })();
    return () => {
      isMounted = false;
    };
  }, [fetchPartners]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB!");
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset jika gagal validasi
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const saveToast = toast.loading("Sedang memproses data...");

    try {
      let finalUrl = preview;
      let oldFileToDelete: string | null = null;

      if (editingPartner && file) {
        oldFileToDelete = editingPartner.logo_url.split("/").pop() || null;
      }

      if (file) {
        const fileName = `${Math.random()}.${file.name.split(".").pop()}`;
        await supabase.storage.from("partners").upload(fileName, file);
        finalUrl = supabase.storage.from("partners").getPublicUrl(fileName)
          .data.publicUrl;
      }

      if (editingPartner) {
        await supabase
          .from("partners")
          .update({ name, logo_url: finalUrl })
          .eq("id", editingPartner.id);
        if (oldFileToDelete)
          await supabase.storage.from("partners").remove([oldFileToDelete]);
        toast.success("Informasi mitra diperbarui!", { id: saveToast });
      } else {
        await supabase.from("partners").insert([{ name, logo_url: finalUrl }]);
        toast.success("Mitra berhasil ditambahkan!", { id: saveToast });
      }

      // 3. PROSES RESET TOTAL
      setName("");
      setFile(null);
      setPreview(null);
      setEditingPartner(null);

      // Paksa hapus teks nama file di elemen input browser
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchPartners(true);
    } catch {
      toast.error("Gagal melakukan sinkronisasi data.", { id: saveToast });
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = useMemo(
    () =>
      partners.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [partners, searchTerm],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 px-4 py-10">
      <Toaster position="top-right" />

      <div className="border-b-2 border-slate-100 pb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
          Manajemen Mitra
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
          Pusat Data Partner Strategis Koperasi
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-10">
          <form
            onSubmit={handleSave}
            className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-6"
          >
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {editingPartner
                ? "Edit Informasi Mitra"
                : "Pendaftaran Mitra Baru"}
            </h3>

            {preview && (
              <div className="relative w-full h-36 bg-slate-50 rounded-3xl overflow-hidden border-2 border-slate-100 p-4">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 px-1">
                  Nama Mitra
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 outline-none transition-all"
                  placeholder="Input nama resmi..."
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 px-1">
                  Upload Logo
                </label>
                {/* 4. Pasang Ref di sini */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] cursor-pointer"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading
                ? "Menyimpan..."
                : editingPartner
                  ? "Simpan Perubahan"
                  : "Daftarkan Mitra"}
            </button>

            {editingPartner && (
              <button
                type="button"
                onClick={() => {
                  setEditingPartner(null);
                  setName("");
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2"
              >
                Batal Edit
              </button>
            )}
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Daftar Partner Aktif ({partners.length})
            </h3>
            <input
              type="text"
              placeholder="Cari nama mitra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-5 py-2.5 border-2 border-slate-100 rounded-full text-xs font-bold focus:border-blue-500 outline-none transition-all w-full md:w-64"
            />
          </div>

          <div className="max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-5">
            {fetching ? (
              Array(6)
                .fill(0)
                .map((_, i) => <PartnerSkeleton key={i} />)
            ) : filteredPartners.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]">
                <p className="text-slate-300 font-black text-sm uppercase tracking-widest">
                  Data Tidak Ditemukan
                </p>
              </div>
            ) : (
              filteredPartners.map((p) => (
                <PartnerCard
                  key={p.id}
                  partner={p}
                  onEdit={() => {
                    setEditingPartner(p);
                    setName(p.name);
                    setPreview(p.logo_url);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onDelete={async () => {
                    if (
                      confirm("Apakah Anda yakin ingin menghapus mitra ini?")
                    ) {
                      const deleteToast = toast.loading("Menghapus data...");
                      try {
                        const fileName = p.logo_url.split("/").pop();
                        if (fileName)
                          await supabase.storage
                            .from("partners")
                            .remove([fileName]);
                        await supabase.from("partners").delete().eq("id", p.id);
                        toast.success("Mitra telah dihapus!", {
                          id: deleteToast,
                        });
                        await fetchPartners(true);
                      } catch {
                        toast.error("Gagal menghapus data.", {
                          id: deleteToast,
                        });
                      }
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
