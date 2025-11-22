import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ForecastPieChartProps = {
  data: { date: string; sales: number }[];
};

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#eab308"];

export default function ForecastPieChart({ data }: ForecastPieChartProps) {
  const pieData = data.map((d) => ({
    name: d.date,
    value: d.sales,
  }));

  return (
    <div style={{ width: "100%", height: 230 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
          >
            {pieData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
