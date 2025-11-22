import os
import io
from typing import List, Optional

import matplotlib.pyplot as plt
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from cleaning import clean_record
from utils import sarimax_forecast
from utils2 import xgboost_forecast
from customer_top50 import get_customer_top_products


# ------------------------------------------------------------------------------
# FastAPI app + CORS
# ------------------------------------------------------------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------------------
# Load dataset ONCE at startup (hard-coded CSV)
# ------------------------------------------------------------------------------

base_dir = os.path.dirname(os.path.abspath(__file__))
dataset_dir = os.path.join(base_dir, "dataset")
csv_path = os.path.join(dataset_dir, "online_retail.csv")

if not os.path.exists(csv_path):
    raise RuntimeError(
        f"online_retail.csv not found at {csv_path}. "
        f"Put your CSV there (backend/dataset/online_retail.csv)."
    )

raw_df = pd.read_csv(csv_path, encoding="latin1", low_memory=False)
df = clean_record(raw_df)  # uses your existing cleaning.py

# ensure essential columns
required_cols = {"stockcode", "description", "invoicedate", "sales"}
missing = required_cols - set(df.columns.str.lower())
if missing:
    raise RuntimeError(f"Missing required columns in cleaned data: {missing}")

# normalize column names to lower case for safety
df.columns = [c.lower() for c in df.columns]

# make sure invoicedate is datetime
if not pd.api.types.is_datetime64_any_dtype(df["invoicedate"]):
    df["invoicedate"] = pd.to_datetime(df["invoicedate"], errors="coerce")

if df["invoicedate"].isna().all():
    raise RuntimeError("All 'invoicedate' values became NaT after to_datetime")


# ------------------------------------------------------------------------------
# Pydantic models (forecast)
# ------------------------------------------------------------------------------

class ForecastRequest(BaseModel):
    product: str
    model: str = "sarimax"  # "sarimax" or "xgboost"


class PeriodShare(BaseModel):
    name: str
    value: float


class ForecastResponse(BaseModel):
    product: str
    product_description: str
    model_used: str
    model_label: str
    weeks: List[str]
    forecast: List[float]
    share_by_period: List[PeriodShare]


# ------------------------------------------------------------------------------
# Pydantic models (customer top products)
# ------------------------------------------------------------------------------

class CustomerProductsRequest(BaseModel):
    customer_id: str


class CustomerProfile(BaseModel):
    customerid: str
    recency: float
    frequency: float
    monetary: float
    customertype: str
    discount: str
    r_score: int
    f_score: int
    m_score: int
    rfm_sum: int


class CustomerProduct(BaseModel):
    description: str
    last_purchase_date: Optional[str]
    total_quantity: float
    total_spent: float


class CustomerProductsResponse(BaseModel):
    profile: CustomerProfile
    products: List[CustomerProduct]


# ------------------------------------------------------------------------------
# Helper functions (forecast)
# ------------------------------------------------------------------------------

def _get_product_df(product_input: str) -> pd.DataFrame:
    """
    Match product either by stockcode exactly or by description substring.
    """
    if product_input in df["stockcode"].astype(str).unique():
        pdf = df[df["stockcode"].astype(str) == product_input]
    else:
        pdf = df[df["description"].str.contains(product_input, case=False, na=False)]
    return pdf.copy()


def _prepare_weekly_sales(pdf: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate product sales to weekly frequency.
    """
    pdf = pdf.copy()
    pdf["weekstart"] = pdf["invoicedate"].dt.to_period("W").apply(
        lambda r: r.start_time
    )
    weekly = pdf.groupby("weekstart")["sales"].sum().reset_index()
    weekly = (
        weekly.set_index("weekstart")
        .asfreq("W-MON", fill_value=0)
        .reset_index()
    )
    return weekly


# ------------------------------------------------------------------------------
# JSON forecast endpoint
# ------------------------------------------------------------------------------

@app.post("/forecast", response_model=ForecastResponse)
def get_forecast(req: ForecastRequest):
    model_key = req.model.lower()
    if model_key not in {"sarimax", "xgboost"}:
        raise HTTPException(
            status_code=400,
            detail="model must be 'sarimax' or 'xgboost'",
        )

    pdf = _get_product_df(req.product)
    if pdf.empty:
        raise HTTPException(status_code=404, detail="No product found")

    weekly = _prepare_weekly_sales(pdf)
    if weekly.empty:
        raise HTTPException(status_code=404, detail="No weekly data for product")

    sales_series = weekly["sales"].values

    if model_key == "sarimax":
        preds = sarimax_forecast(sales_series, steps=4)
        model_label = "Short term"
    else:
        try:
            preds = xgboost_forecast(sales_series, steps=4)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error in XGBoost model: {e}",
            )
        model_label = "Long term"

    preds = [float(x) for x in preds]
    weeks = [f"Week {i + 1}" for i in range(4)]

    total = sum(preds) or 1.0
    share_by_period = [
        PeriodShare(
            name=weeks[i],
            value=round(preds[i] / total * 100.0, 2),
        )
        for i in range(4)
    ]

    product_description = str(pdf["description"].iloc[0])

    return ForecastResponse(
        product=req.product,
        product_description=product_description,
        model_used=model_key,
        model_label=model_label,
        weeks=weeks,
        forecast=preds,
        share_by_period=share_by_period,
    )


# ------------------------------------------------------------------------------
# Image forecast endpoint
# ------------------------------------------------------------------------------

@app.get("/forecast/plot")
def get_forecast_plot(product: str, model: str = "sarimax"):
    model_key = model.lower()
    if model_key not in {"sarimax", "xgboost"}:
        raise HTTPException(
            status_code=400,
            detail="model must be 'sarimax' or 'xgboost'",
        )

    pdf = _get_product_df(product)
    if pdf.empty:
        raise HTTPException(status_code=404, detail="No product found")

    weekly = _prepare_weekly_sales(pdf)
    if weekly.empty:
        raise HTTPException(status_code=404, detail="No weekly data for product")

    sales_series = weekly["sales"].values

    if model_key == "sarimax":
        preds = sarimax_forecast(sales_series, steps=4)
        model_label = "Short term (SARIMAX)"
        colour = "purple"
    else:
        try:
            preds = xgboost_forecast(sales_series, steps=4)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error in XGBoost model: {e}",
            )
        model_label = "Long term (XGBoost)"
        colour = "green"

    preds = [float(x) for x in preds]

    last_date = weekly["weekstart"].iloc[-1]
    future_dates = [last_date + pd.Timedelta(weeks=i + 1) for i in range(4)]

    fig, ax = plt.subplots(figsize=(8, 4))

    ax.plot(
        weekly["weekstart"],
        weekly["sales"],
        color="blue",
        linewidth=2,
        marker="o",
        label="Historical sales",
    )

    ax.scatter(last_date, weekly["sales"].iloc[-1], color="blue", s=35, zorder=5)

    ax.plot(
        [last_date] + future_dates,
        [weekly["sales"].iloc[-1]] + preds,
        color=colour,
        linewidth=2,
        marker="o",
        label=model_label,
    )

    ax.set_title(
        f"{model_label} forecast for: {pdf['description'].iloc[0]}",
        fontsize=12,
    )
    ax.set_xlabel("Week")
    ax.set_ylabel("Sales")
    ax.grid(alpha=0.3)
    ax.legend()
    fig.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")


# ------------------------------------------------------------------------------
# Customer top products endpoint (CRM card)
# ------------------------------------------------------------------------------

@app.post("/customer-products", response_model=CustomerProductsResponse)
def customer_products(req: CustomerProductsRequest):
    profile_dict, products_list = get_customer_top_products(req.customer_id)

    if profile_dict is None or products_list is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    profile = CustomerProfile(
        customerid=str(profile_dict.get("customerid", "")),
        recency=float(profile_dict.get("recency", 0)),
        frequency=float(profile_dict.get("frequency", 0)),
        monetary=float(profile_dict.get("monetary", 0)),
        customertype=str(profile_dict.get("customertype", "")),
        discount=str(profile_dict.get("discount", "")),
        r_score=int(profile_dict.get("r_score", 0)),
        f_score=int(profile_dict.get("f_score", 0)),
        m_score=int(profile_dict.get("m_score", 0)),
        rfm_sum=int(profile_dict.get("rfm_sum", 0)),
    )

    products = [
        CustomerProduct(
            description=p["description"],
            last_purchase_date=p["last_purchase_date"],
            total_quantity=p["total_quantity"],
            total_spent=p["total_spent"],
        )
        for p in products_list
    ]

    return CustomerProductsResponse(profile=profile, products=products)
