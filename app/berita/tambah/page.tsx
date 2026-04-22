"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function TambahBeritaPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Ambil data kategori dari Supabase
  useEffect(() => {
    async function getCategories() {
      const { data } = await supabase.from("categories").select("*");
      if (data) setCategories(data);
    }
    getCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = "";

    // LOGIC UPLOAD GAMBAR (Hanya jalan jika ada file yang dipilih)
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("news-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        alert("Gagal upload gambar: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("news-images")
        .getPublicUrl(filePath);

      imageUrl = urlData.publicUrl;
    }

    // SIMPAN DATA KE TABEL POSTS
    const { error } = await supabase.from("posts").insert([
      {
        title,
        content,
        category_id: categoryId,
        image_url: imageUrl,
        views: 0,
        slug: title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      },
    ]);

    if (error) {
      alert("Gagal menyimpan berita: " + error.message);
    } else {
      alert("Berita berhasil dipublish!");
      router.push("/berita");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-blue-600 transition"
        >
          ← Kembali
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Buat Berita Baru</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg space-y-6 border border-gray-100"
      >
        {/* JUDUL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Judul Berita
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            placeholder="Masukkan judul berita..."
          />
        </div>

        {/* KATEGORI */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Kategori Berita
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">-- Pilih Kategori --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* UPLOAD & PREVIEW GAMBAR */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Gambar Utama Berita
          </label>

          {!imageFile ? (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">
                    Klik untuk upload gambar
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          ) : (
            <div className="relative inline-block">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="rounded-lg border-2 border-blue-100 shadow-md w-full max-w-sm h-52 object-cover"
              />
              <button
                type="button"
                onClick={() => setImageFile(null)}
                className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-1.5 shadow-lg hover:bg-red-700 transition"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                ✓ {imageFile.name}
              </p>
            </div>
          )}
        </div>

        {/* ISI BERITA */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Isi Berita Lengkap
          </label>
          <textarea
            required
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            placeholder="Tuliskan berita di sini..."
          />
        </div>

        {/* TOMBOL AKSI */}
        <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-500 font-medium hover:text-gray-700"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-10 py-3 rounded-lg font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 transition transform active:scale-95"
          >
            {loading ? "Sedang Memproses..." : "Publish Berita"}
          </button>
        </div>
      </form>
    </div>
  );
}
