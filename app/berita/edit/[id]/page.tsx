"use client";
import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function EditBeritaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [oldImageUrl, setOldImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);

    // 1. Ambil Kategori
    const { data: catData } = await supabase.from("categories").select("*");
    if (catData) setCategories(catData);

    // 2. Ambil Data Berita Lama berdasarkan ID
    const { data: postData, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert("Data tidak ditemukan!");
      router.push("/berita");
    } else {
      setTitle(postData.title);
      setContent(postData.content);
      setCategoryId(postData.category_id);
      setOldImageUrl(postData.image_url);
    }
    setLoading(false);
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    let finalImageUrl = oldImageUrl;

    // LOGIC JIKA GAMBAR DIGANTI
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("news-images")
        .upload(fileName, imageFile);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("news-images")
          .getPublicUrl(fileName);
        finalImageUrl = urlData.publicUrl;

        // Hapus gambar lama di storage agar hemat ruang
        if (oldImageUrl) {
          const oldFileName = oldImageUrl.split("/").pop();
          if (oldFileName)
            await supabase.storage.from("news-images").remove([oldFileName]);
        }
      }
    }

    // UPDATE KE DATABASE
    const { error } = await supabase
      .from("posts")
      .update({
        title,
        content,
        category_id: categoryId,
        image_url: finalImageUrl,
        slug: title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      })
      .eq("id", id);

    if (error) {
      alert("Gagal update: " + error.message);
    } else {
      alert("Berita berhasil diperbarui!");
      router.push("/berita");
    }
    setUpdating(false);
  };

  if (loading)
    return <div className="p-10 text-center">Memuat data berita...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-blue-600 transition"
        >
          ← Kembali
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Berita</h1>
      </div>

      <form
        onSubmit={handleUpdate}
        className="bg-white p-8 rounded-xl shadow-lg space-y-6 border border-gray-100"
      >
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Judul Berita
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Kategori
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Gambar Berita
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            {/* Tampilkan Preview Gambar Baru atau Gambar Lama */}
            <img
              src={imageFile ? URL.createObjectURL(imageFile) : oldImageUrl}
              alt="Preview"
              className="rounded-lg border shadow-sm w-full max-w-xs h-40 object-cover bg-gray-100"
            />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-2 italic">
                *Kosongkan jika tidak ingin mengganti gambar
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {imageFile && (
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="mt-2 text-xs text-red-600 hover:underline"
                >
                  Batal Ganti Gambar
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Isi Berita
          </label>
          <textarea
            required
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-500 font-medium"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={updating}
            className="bg-green-600 text-white px-10 py-3 rounded-lg font-bold shadow-md hover:bg-green-700 disabled:opacity-50 transition"
          >
            {updating ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
