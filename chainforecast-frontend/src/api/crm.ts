import api from "./client";

export async function fetchRFM() {
  const res = await api.get("/crm/rfm");
  return res.data;
}
