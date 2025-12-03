/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // <--- ¡ESTO ES LO QUE FALTABA!

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function GraficaEstadoResultados({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(val) => `$${val.toLocaleString()}`} />
        <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
        <Legend />
        <Bar
          dataKey="Ingresos"
          fill="#22c55e"
          name="Ingresos"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="Egresos"
          fill="#ef4444"
          name="Egresos"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
