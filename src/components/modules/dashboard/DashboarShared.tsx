import { LucideIcon } from "lucide-react";
import React, { ReactNode } from "react";


interface PanelProps {
  title: ReactNode;
  children: ReactNode;
}

export function WelcomeBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-600 to-blue-500 p-8 shadow-lg shadow-indigo-200/40">
      <div className="relative z-10">
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">
          {title}
        </h1>
        <p className="text-indigo-100 font-medium text-sm">
          {subtitle}
        </p>
      </div>
      {/* Decoración de fondo opcional */}
      <div className="absolute right-0 top-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl md:h-48 md:w-48" />
      <div className="absolute bottom-0 right-20 -mb-10 h-32 w-32 rounded-full bg-indigo-800/20 blur-xl" />
    </div>
  );
}

export function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: "indigo" | "emerald" | "blue" | "purple" | "rose";
}) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all hover:scale-[1.02]">
      <div className={`p-3 rounded-2xl ${colorMap[color]} shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-1">
          {value}
        </p>
        <h3 className="font-bold text-slate-500 uppercase text-[9px] tracking-widest">
          {title}
        </h3>
      </div>
    </div>
  );
}

export function Panel({ title, children }: PanelProps) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40">
      <div className="text-lg font-black text-slate-800 tracking-tight mb-6">
        {title}
      </div>
      {children}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="p-8 text-center bg-slate-50/50 rounded-3xl border-2 border-slate-100 border-dashed">
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">{text}</p>
    </div>
  );
}