import ForecastChart, { ForecastPoint } from "../components/charts/ForecastChart.tsx";

const mockForecast: ForecastPoint[] = [
  { date: "Week 1", sales: 12000 },
  { date: "Week 2", sales: 13500 },
  { date: "Week 3", sales: 12800 },
  { date: "Week 4", sales: 15000 },
];

export default function ForecastPage() {
  return (
    <div>
      <h1>4-Week Sales Forecast</h1>
      <p>Below is a sample forecast (mock data). Later this will come from the backend.</p>

      <div style={{ marginTop: "20px" }}>
        <ForecastChart data={mockForecast} />
      </div>
    </div>
  );
}