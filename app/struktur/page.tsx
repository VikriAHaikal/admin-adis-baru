"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function StrukturPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    setLoading(true);
    const { data } = await supabase
      .from("teams") // Sesuai nama tabel lu
      .select("*")
      .order("order_priority", { ascending: true }); // Sesuai kolom lu
    if (data) setTeams(data);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    let photo_url = "";

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data } = await supabase.storage
        .from("pengurus-photos")
        .upload(fileName, file);
      if (data) {
        const { data: urlData } = supabase.storage
          .from("pengurus-photos")
          .getPublicUrl(fileName);
        photo_url = urlData.publicUrl;
      }
    }

    // Insert sesuai kolom di tabel teams
    await supabase.from("teams").insert([
      {
        name,
        position,
        photo_url,
        order_priority: teams.length + 1,
      },
    ]);

    setName("");
    setPosition("");
    setFile(null);
    fetchTeams();
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Manajemen Struktur (Revisi Poin 7)
      </h1>

      <form
        onSubmit={handleAdd}
        className="bg-white p-6 rounded-2xl shadow-sm border mb-10 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 border rounded-xl outline-none"
            required
          />
          <input
            type="text"
            placeholder="Jabatan"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="p-3 border rounded-xl outline-none"
            required
          />
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700"
        />
        <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
          Simpan Pengurus
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teams.map((t) => (
          <div
            key={t.id}
            className="bg-white p-4 rounded-2xl shadow-sm border text-center transition hover:shadow-md"
          >
            <img
              src={t.photo_url || "/placeholder-user.png"}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-blue-100 shadow-inner"
            />
            <h3 className="font-bold text-slate-800">{t.name}</h3>
            <p className="text-sm text-blue-600 font-medium mb-4 italic">
              {t.position}
            </p>
            <button
              onClick={async () => {
                if (confirm("Hapus?")) {
                  await supabase.from("teams").delete().eq("id", t.id);
                  fetchTeams();
                }
              }}
              className="text-red-500 text-sm hover:underline font-bold"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
