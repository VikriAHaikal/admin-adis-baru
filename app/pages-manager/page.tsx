"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PagesManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // State Visi & Misi / Sejarah
  const [visi, setVisi] = useState("");
  const [listData, setListData] = useState<any[]>([]);

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempItem, setTempItem] = useState({ col1: "", col2: "", col3: "" });
  const [genericContent, setGenericContent] = useState("");

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    const { data } = await supabase.from("pages").select("*");
    if (data) setPages(data);
  }

  // LOGIKA PERBAIKAN: Parsing HTML saat halaman dipilih
  const handleSelectPage = (p: any) => {
    setSelectedPage(p);
    setVisi("");
    setListData([]);
    setGenericContent("");

    if (p.content) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(p.content, "text/html");

      if (p.slug === "visi-misi") {
        // Ambil Visi
        const visiTxt = doc.querySelector(".visi-section p")?.textContent || "";
        setVisi(visiTxt.replace(/"/g, ""));

        // Ambil Misi
        const misiItems = Array.from(
          doc.querySelectorAll(".misi-grid > div"),
        ).map((el) => ({
          col1: el.querySelector("h3")?.textContent || "",
          col2: el.querySelector("p")?.textContent || "",
        }));
        setListData(misiItems);
      } else if (p.slug === "sejarah") {
        // Ambil Timeline Sejarah
        const historyItems = Array.from(doc.querySelectorAll(".milestone")).map(
          (el) => ({
            col1: el.querySelector(".year")?.textContent || "",
            col2: el.querySelector(".title")?.textContent || "",
            col3: el.querySelector(".desc")?.textContent || "",
          }),
        );
        setListData(historyItems);
      } else {
        setGenericContent(p.content);
      }
    }
  };

  const openModal = (index: number | null = null) => {
    if (index !== null) {
      setEditingIndex(index);
      setTempItem(listData[index]);
    } else {
      setEditingIndex(null);
      setTempItem({ col1: "", col2: "", col3: "" });
    }
    setIsModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!tempItem.col1 || !tempItem.col2) return alert("Lengkapi data!");
    const updated = [...listData];
    if (editingIndex !== null) updated[editingIndex] = tempItem;
    else updated.push(tempItem);
    setListData(updated);
    setIsModalOpen(false);
  };

  async function handlePublish() {
    setLoading(true);
    let finalContent = genericContent;

    if (selectedPage.slug === "visi-misi") {
      finalContent = `
        <div class="visi-section mb-12 text-center">
          <h2 class="text-3xl font-bold text-blue-600 mb-4">Visi</h2>
          <p class="text-xl italic text-slate-700">"${visi}"</p>
        </div>
        <div class="misi-grid grid grid-cols-1 md:grid-cols-2 gap-8">
          ${listData
            .map(
              (m) => `
            <div class="p-6 border-l-4 border-blue-600 bg-white shadow-sm">
              <h3 class="font-black text-slate-900 uppercase mb-2">${m.col1}</h3>
              <p class="text-slate-600 text-sm leading-relaxed">${m.col2}</p>
            </div>
          `,
            )
            .join("")}
        </div>`;
    } else if (selectedPage.slug === "sejarah") {
      finalContent = `
        <div class="timeline-container">
          ${listData
            .map(
              (h) => `
            <div class="milestone p-6 mb-4 border-b">
              <span class="year font-black text-blue-600 text-2xl">${h.col1}</span>
              <h3 class="title font-bold text-xl text-slate-800">${h.col2}</h3>
              <p class="desc text-slate-600">${h.col3}</p>
            </div>
          `,
            )
            .join("")}
        </div>`;
    }

    await supabase
      .from("pages")
      .update({ content: finalContent })
      .eq("id", selectedPage.id);
    alert("Data Berhasil di-Sync!");
    setLoading(false);
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 min-h-screen bg-gray-50">
      <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-8 italic">
        ⚙️ Control Panel Konten
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* NAVIGASI */}
        <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:w-64">
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPage(p)}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl font-bold transition-all ${selectedPage?.id === p.id ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-400 border"}`}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* EDITOR */}
        <div className="flex-1">
          {selectedPage ? (
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-10">
              <h2 className="text-xl md:text-2xl font-black italic">
                Editing: {selectedPage.title}
              </h2>

              {selectedPage.slug === "visi-misi" ||
              selectedPage.slug === "sejarah" ? (
                <div className="space-y-10">
                  {selectedPage.slug === "visi-misi" && (
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase block mb-4">
                        Visi Utama
                      </label>
                      <textarea
                        value={visi}
                        onChange={(e) => setVisi(e.target.value)}
                        className="w-full p-5 bg-slate-50 border-2 rounded-3xl h-32 focus:border-blue-500 outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {selectedPage.slug === "sejarah"
                          ? "Milestones"
                          : "Poin Misi"}
                      </label>
                      <button
                        onClick={() => openModal()}
                        className="text-sm font-black text-blue-600"
                      >
                        + Tambah Baru
                      </button>
                    </div>
                    <div className="space-y-3">
                      {listData.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl"
                        >
                          <div className="truncate pr-4">
                            <p className="font-black text-slate-800 text-sm uppercase">
                              {selectedPage.slug === "sejarah"
                                ? `${item.col1} - ${item.col2}`
                                : item.col1}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {selectedPage.slug === "sejarah"
                                ? item.col3
                                : item.col2}
                            </p>
                          </div>
                          <div className="flex gap-4">
                            <button
                              onClick={() => openModal(idx)}
                              className="text-blue-500 font-bold text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                setListData(
                                  listData.filter((_, i) => i !== idx),
                                )
                              }
                              className="text-red-400 font-bold text-xs"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <textarea
                  value={genericContent}
                  onChange={(e) => setGenericContent(e.target.value)}
                  className="w-full p-6 border-2 rounded-3xl h-96 font-mono text-sm"
                />
              )}

              <button
                onClick={handlePublish}
                disabled={loading}
                className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xl hover:bg-blue-600 transition-all shadow-xl active:scale-95"
              >
                {loading ? "Syncing..." : "PUBLISH PERUBAHAN ✅"}
              </button>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border-4 border-dashed rounded-[3rem] text-slate-200 font-black italic">
              PILIH HALAMAN
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black mb-8 italic uppercase">
              {editingIndex !== null ? "Edit Data" : "Tambah Data"}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                  {selectedPage.slug === "sejarah" ? "Tahun" : "Judul Misi"}
                </label>
                <input
                  type="text"
                  value={tempItem.col1}
                  onChange={(e) =>
                    setTempItem({ ...tempItem, col1: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-blue-500 font-bold"
                />
              </div>
              {selectedPage.slug === "sejarah" && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                    Judul Milestone
                  </label>
                  <input
                    type="text"
                    value={tempItem.col2}
                    onChange={(e) =>
                      setTempItem({ ...tempItem, col2: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              )}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                  Penjelasan
                </label>
                <textarea
                  value={
                    selectedPage.slug === "sejarah"
                      ? tempItem.col3
                      : tempItem.col2
                  }
                  onChange={(e) =>
                    selectedPage.slug === "sejarah"
                      ? setTempItem({ ...tempItem, col3: e.target.value })
                      : setTempItem({ ...tempItem, col2: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 rounded-2xl h-32 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveItem}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg"
                >
                  SIMPAN
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black"
                >
                  BATAL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
