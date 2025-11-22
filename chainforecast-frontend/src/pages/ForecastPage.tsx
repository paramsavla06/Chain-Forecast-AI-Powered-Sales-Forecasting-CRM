import { useEffect, useState } from "react";
import ForecastChart from "../components/Charts/ForecastChart";
import type { ForecastPoint } from "../api/forecast";
import { fetchForecast } from "../api/forecast";

export default function ForecastPage() {
  const [data, setData] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadForecast() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchForecast();
        setData(result);
      } catch (err) {
        console.error(err);
        setError("Failed to load forecast. Showing no data for now.");
      } finally {
        setLoading(false);
      }
    }

    loadForecast();
  }, []);

  return (
    <div>
      <h1>4-Week Sales Forecast</h1>
      <p>This chart shows the forecast returned by the backend API.</p>

      {loading && <p>Loading forecast...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && data.length === 0 && (
        <p>No forecast data available.</p>
      )}

      {!loading && data.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <ForecastChart data={data} />
        </div>
      )}
    </div>
  );
}