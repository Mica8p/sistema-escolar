"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AsistenciaData {
  name: string;
  presente: number;
  tarde: number;
  justificado: number;
  ausente: number;
}

export default function ChartAsistencia({ data }: { data: AsistenciaData[] }) {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">Esperando datos de asistencia...</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
          dy={10}
        />
        <YAxis hide domain={[0, 'dataMax + 2']} />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
        />
        <Legend
          verticalAlign="top"
          align="center"
          iconType="circle"
          wrapperStyle={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: '30px' }}
        />

        <Bar dataKey="presente" stackId="a" fill="#4f46e5" barSize={40} name="Presentes" />
        <Bar dataKey="tarde" stackId="a" fill="#fbbf24" name="Tardes" />
        <Bar dataKey="justificado" stackId="a" fill="#94a3b8" name="Justificados" />
        <Bar dataKey="ausente" stackId="a" fill="#f87171" radius={[8, 8, 0, 0]} name="Ausentes" />
      </BarChart>
    </ResponsiveContainer>
  );
}