import React, { ReactNode } from "react";


interface PanelProps {
  title: ReactNode;
  children: ReactNode;
  variant?: "white" | "red";
}

export function WelcomeBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative overflow-hidden rounded-4xl bg-linear-to-r from-indigo-600 to-blue-500 p-8 shadow-lg shadow-indigo-200/40">
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

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  color: 'indigo' | 'emerald' | 'blue' | 'purple';
}

export function StatCard({ icon, title, value, color }: StatCardProps) {
  const shadowColors: Record<string, string> = {
    indigo: "shadow-indigo-400/40",
    emerald: "shadow-emerald-200/60",
    blue: "shadow-blue-300/40",
    purple: "shadow-purple-400/40",
  };

  return (
    <div className={`
      bg-white p-4 rounded-4xl border transition-all duration-300
      border-slate-400/50
      shadow-xl ${shadowColors[color] || "shadow-slate-300/50"}

      hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-900/60
    `}>
      <div className="flex flex-col gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center
          ${color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
            color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
            color === 'blue' ? 'bg-blue-50 text-blue-600' :
            'bg-purple-50 text-purple-600'}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

export function Panel({ title, children, variant = "white" }: PanelProps) {
  const bgClass = variant === "red" 
    ? "bg-red-50 border-red-200" 
    : "bg-white border-slate-400/40";
  
  return (
    <div className={`p-6 rounded-[2.5rem] border shadow-lg shadow-slate-900/20 ${bgClass}`}>
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