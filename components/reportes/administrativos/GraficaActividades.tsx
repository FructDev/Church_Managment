/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function GraficaActividades({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>
        <CartesianGrid stroke="#f5f5f5" vertical={false} />
        <XAxis dataKey="name" scale="band" fontSize={12} />

        {/* Eje Y Izquierdo: Cantidad de Actividades */}
        <YAxis
          yAxisId="left"
          orientation="left"
          stroke="#8884d8"
          fontSize={12}
        />

        {/* Eje Y Derecho: Asistencia */}
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#ff7300"
          fontSize={12}
        />

        <Tooltip />
        <Legend />

        <Bar
          yAxisId="left"
          dataKey="Cantidad"
          barSize={20}
          fill="#413ea0"
          radius={[4, 4, 0, 0]}
          name="Total Actividades"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="AsistenciaPromedio"
          stroke="#ff7300"
          strokeWidth={2}
          name="Asistencia Prom."
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
