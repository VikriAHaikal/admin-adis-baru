export default function PartnerSkeleton() {
  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-100 rounded"></div>
          <div className="h-3 w-20 bg-slate-50 rounded"></div>
        </div>
      </div>
    </div>
  );
}