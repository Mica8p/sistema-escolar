import React from "react";

export function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: number | string; color: "indigo" | "emerald" | "blue" | "purple" }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>{icon}</div>
        <h3 className="font-black text-slate-700 uppercase text-[10px] tracking-widest">{title}</h3>
      </div>
      <p className="text-4xl font-black text-slate-800 tracking-tighter">{value}</p>
    </div>
  );
}

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-black text-slate-800 tracking-tight mb-4">{title}</h3>
      {children}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{text}</p>
    </div>
  );
}

export function formatDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(d);
}