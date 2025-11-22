from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from data_loader import get_date_bounds
from forecasting import get_short_term_forecast, get_long_term_forecast
from crm import get_segments_summary, get_sample_customers
from insights import get_top_products, get_retention, get_future_winners

app = FastAPI(title="ChainForecast Backend", version="1.0.0")

# Allow frontend during dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    start, end = get_date_bounds()
    return {
        "status": "ok",
        "data_range": {
            "min_date": start.strftime("%Y-%m-%d"),
            "max_date": end.strftime("%Y-%m-%d"),
        },
    }


# ---------- FORECASTING ----------

@app.get("/api/forecast/short")
def short_forecast():
    """
    Short-term (4 weeks) forecast – for your first card (short-term model).
    """
    return {"horizon": "short_term", "points": get_short_term_forecast()}


@app.get("/api/forecast/long")
def long_forecast():
    """
    Long-term (~4 months) forecast – for your second model.
    """
    return {"horizon": "long_term", "points": get_long_term_forecast()}


# ---------- CRM / SEGMENTS ----------

@app.get("/api/crm/segments")
def crm_segments():
    """
    RFM-based customer segments summary.
    """
    return get_segments_summary()


@app.get("/api/crm/sample-customers")
def crm_sample(segment: str = Query("Top Spenders")):
    """
    Sample customers for a given RFM segment name.
    """
    return {"segment": segment, "customers": get_sample_customers(segment)}


# ---------- INSIGHTS ----------

@app.get("/api/insights/top-products")
def api_top_products(days: int = 60):
    """
    Top products by quantity in the last N days.
    """
    return {"days": days, "products": get_top_products(days=days)}


@app.get("/api/insights/retention")
def api_retention():
    """
    Simple retention rate between last 60d and previous 60d.
    """
    return get_retention()


@app.get("/api/insights/future-winners")
def api_future_winners():
    """
    Products whose quantity grew the most between 2 windows.
    """
    return {"products": get_future_winners()}
