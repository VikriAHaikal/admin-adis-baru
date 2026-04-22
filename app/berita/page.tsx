"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function BeritaPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // State untuk Search
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, [searchTerm]); // Re-fetch saat mengetik di pencarian

  async function fetchPosts() {
    setLoading(true);
    let query = supabase
      .from("posts")
      .select("*, categories(category_name)")
      .order("created_at", { ascending: false });

    // FITUR SEARCH: Filter berdasarkan judul jika ada input [Bagian III No. 7]
    if (searchTerm) {
      query = query.ilike("title", `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) console.error("Error:", error);
    else setPosts(data || []);
    setLoading(false);
  }

  // Fungsi untuk mengurutkan berdasarkan Trending (Views Terbanyak) [Bagian III No. 6]
  const handleSortTrending = () => {
    const sorted = [...posts].sort((a, b) => b.views - a.views);
    setPosts(sorted);
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (window.confirm("Yakin mau hapus berita ini?")) {
      setLoading(true);
      if (imageUrl) {
        const fileName = imageUrl.split("/").pop();
        if (fileName)
          await supabase.storage.from("news-images").remove([fileName]);
      }
      await supabase.from("posts").delete().eq("id", id);
      fetchPosts();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Berita</h1>
        <button
          onClick={() => router.push("/berita/tambah")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-bold transition shadow-md"
        >
          + Tambah Berita
        </button>
      </div>

      {/* FILTER & SEARCH BOX */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari judul berita... [Revisi No. 7]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <button
          onClick={handleSortTrending}
          className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl font-bold hover:bg-orange-200 transition"
        >
          🔥 Urutkan Trending (Views)
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold text-gray-600 uppercase text-xs">
                Judul
              </th>
              <th className="p-4 font-bold text-gray-600 uppercase text-xs">
                Kategori
              </th>
              <th className="p-4 font-bold text-gray-600 uppercase text-xs text-center">
                Views
              </th>
              <th className="p-4 font-bold text-gray-600 uppercase text-xs text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-400">
                  Loading data...
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-400">
                  Tidak ada berita ditemukan.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-slate-700">
                    {post.title}
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      {post.categories?.category_name || "Umum"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`font-bold ${post.views > 10 ? "text-orange-600" : "text-gray-500"}`}
                    >
                      {post.views}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-4">
                    <button
                      onClick={() => router.push(`/berita/edit/${post.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id, post.image_url)}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
