import Image from "next/image";

interface PartnerCardProps {
  partner: { id: number; name: string; logo_url: string };
  onEdit: () => void;
  onDelete: () => void;
}

export default function PartnerCard({ partner, onEdit, onDelete }: PartnerCardProps) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-50 shadow-sm flex items-center justify-between group hover:border-blue-100 hover:shadow-md transition-all">
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-2 flex-shrink-0">
          <Image src={partner.logo_url} alt={partner.name} fill className="object-contain" unoptimized />
        </div>
        <div className="truncate">
          <p className="text-sm font-black text-slate-900 leading-none truncate">{partner.name}</p>
          <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1.5 tracking-tighter">● Terverifikasi</p>
        </div>
      </div>
      <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-2.5 text-slate-200 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button onClick={onDelete} className="p-2.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}