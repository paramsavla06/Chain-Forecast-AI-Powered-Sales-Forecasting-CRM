import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

// --------------------
//  PROP TYPES
// --------------------
interface SalesForecastChartProps {
  fullScreen?: boolean;  // <--- THIS FIXES YOUR ERROR
}

// --------------------
//  RESPONSE TYPES
// --------------------
type ForecastResponse = {
  product: string;
  product_description: string;
  model_used: string;
  model_label: string;
  weeks: string[];
  forecast: number[];
};

// --------------------
//  COMPONENT
// --------------------
export default function SalesForecastChart({
  fullScreen = false,        // <--- DEFAULT VALUE FIX
}: SalesForecastChartProps) {
  const [product, setProduct] = useState("84029G");
  const [productDescription, setProductDescription] = useState("");
  const [modelLabel, setModelLabel] = useState("Short term");
  const [selectedModel, setSelectedModel] = useState<"sarimax" | "xgboost">(
    "sarimax"
  );
  const [plotUrl, setPlotUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Build backend plot image URL
  const buildPlotUrl = (p: string, m: "sarimax" | "xgboost") =>
    `${API_BASE_URL}/forecast/plot?product=${encodeURIComponent(
      p
    )}&model=${m}&t=${Date.now()}`;

  // Run forecast
  const runForecast = async (p: string, m: "sarimax" | "xgboost") => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post<ForecastResponse>(`${API_BASE_URL}/forecast`, {
        product: p,
        model: m,
      });

      setProductDescription(res.data.product_description);
      setModelLabel(res.data.model_label);
      setPlotUrl(buildPlotUrl(p, m));
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Product not found or server error.";
      setError(msg);
      setPlotUrl("");
      setProductDescription("");
    } finally {
      setLoading(false);
    }
  };

  // Initial load: SARIMAX
  useEffect(() => {
    runForecast(product, "sarimax");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = (model: "sarimax" | "xgboost") => {
    setSelectedModel(model);
    runForecast(product, model);
  };

  const handleRunClick = () => {
    runForecast(product, selectedModel);
  };

  const handleOpenNewTab = () => {
    if (plotUrl) window.open(plotUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Header */}
      <div className="card-header">
        <div>
          <div className="card-title">Forecast models</div>
          <div className="card-meta">{modelLabel} prediction (4-week horizon)</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Only hide this in full-screen mode */}
          {!fullScreen && plotUrl && (
            <button
              className="secondary-btn"
              style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
              onClick={handleOpenNewTab}
            >
              Open graph in new tab
            </button>
          )}

          <div className="pill-toggle">
            <button
              className={selectedModel === "sarimax" ? "active" : ""}
              onClick={() => handleToggle("sarimax")}
            >
              Short term
            </button>
            <button
              className={selectedModel === "xgboost" ? "active" : ""}
              onClick={() => handleToggle("xgboost")}
            >
              Long term
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="card-body">
        {/* Input row */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <input
            type="text"
            className="forecast-input"
            style={{ flex: 1, padding: "0.25rem 0.5rem" }}
            placeholder="Enter StockCode or product name..."
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
          <button className="primary-btn" onClick={handleRunClick} disabled={loading}>
            {loading ? "Loading..." : "Run forecast"}
          </button>
        </div>

        {/* Product description */}
        {productDescription && (
          <p className="card-meta" style={{ marginBottom: "0.5rem" }}>
            Forecast for: <strong>{productDescription}</strong>
          </p>
        )}

        {/* Error */}
        {error && (
          <p style={{ color: "red", marginBottom: "0.5rem" }}>
            {error}
          </p>
        )}

        {/* Graph image */}
        {plotUrl && (
          <div
            style={{
              marginTop: "0.5rem",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#f9fafb",
              padding: "0.5rem",
            }}
          >
            <img
              src={plotUrl}
              alt="Forecast graph"
              style={{
                display: "block",
                width: "100%",
                height: fullScreen ? "auto" : "260px", // smaller inside card
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
