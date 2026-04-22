"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function KategoriPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("category_name");
    if (data) setCategories(data);
    setLoading(false);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    const slug = newCategory.toLowerCase().replace(/ /g, "-");
    const { error } = await supabase
      .from("categories")
      .insert([{ category_name: newCategory, slug }]);

    if (error) alert(error.message);
    else {
      setNewCategory("");
      fetchCategories();
    }
  }

  async function handleDelete(id: number) {
    if (
      confirm(
        "Hapus kategori ini? Berita dengan kategori ini mungkin akan terpengaruh.",
      )
    ) {
      await supabase.from("categories").delete().eq("id", id);
      fetchCategories();
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Manajemen Kategori
      </h1>

      {/* FORM TAMBAH */}
      <form
        onSubmit={handleAddCategory}
        className="bg-white p-6 rounded-xl shadow-sm border mb-8 flex gap-4"
      >
        <input
          type="text"
          placeholder="Nama Kategori Baru (Contoh: Berita Koperasi)"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
          + Tambah
        </button>
      </form>

      {/* LIST KATEGORI */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold text-gray-600 uppercase text-xs">
                Nama Kategori
              </th>
              <th className="p-4 font-bold text-gray-600 uppercase text-xs">
                Slug
              </th>
              <th className="p-4 font-bold text-gray-600 uppercase text-xs text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-slate-700">
                  {cat.category_name}
                </td>
                <td className="p-4 text-gray-500 text-sm">{cat.slug}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
