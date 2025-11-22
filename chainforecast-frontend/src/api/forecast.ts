import api from "./client";

export type ForecastPoint = {
  date: string;
  sales: number;
};

export async function fetchForecast(): Promise<ForecastPoint[]> {
  const response = await api.get<ForecastPoint[]>("/forecast");
  return response.data;
}
