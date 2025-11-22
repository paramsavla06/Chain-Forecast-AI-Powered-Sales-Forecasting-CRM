import api from "./client";

export type ForecastPoint = {
  date: string;
  sales: number;
};

export async function fetchForecast(): Promise<ForecastPoint[]> {
  const res = await api.get("/forecast"); // <-- backend should expose this
  // Expecting backend JSON like: [{ "date": "2025-11-01", "sales": 12000 }, ...]
  return res.data;
}
