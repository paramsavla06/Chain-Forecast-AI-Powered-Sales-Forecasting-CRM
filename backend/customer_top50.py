import os
from datetime import timedelta
from typing import Dict, List, Tuple, Optional

import numpy as np
import pandas as pd

from cleaning import clean_record  # reuse your existing cleaning logic


# ------------------------------------------------------------------------------
# Paths & base load
# ------------------------------------------------------------------------------

base_dir = os.path.dirname(os.path.abspath(__file__))
dataset_dir = os.path.join(base_dir, "dataset")

# CSV used by the whole project
csv_path = os.path.join(dataset_dir, "online_retail.csv")


def _load_cleaned_from_csv(path: str = csv_path) -> pd.DataFrame:
    """
    Load the original CSV and clean it using your existing clean_record().
    """
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"CSV file not found at: {path}. "
            f"Expected backend/dataset/online_retail.csv"
        )

    raw = pd.read_csv(path, encoding="latin1", low_memory=False)

    # Use your cleaning pipeline
    df = clean_record(raw)

    # Normalize columns
    df.columns = [str(c).strip().lower() for c in df.columns]

    # Ensure essential columns exist
    if "invoicedate" not in df.columns:
        raise ValueError("Column 'invoicedate' missing in cleaned CSV.")
    if "customerid" not in df.columns:
        raise ValueError("Column 'customerid' missing in cleaned CSV.")
    if "description" not in df.columns:
        raise ValueError("Column 'description' missing in cleaned CSV.")

    # Quantity
    if "quantity" not in df.columns:
        df["quantity"] = np.nan
    else:
        df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce")

    # Monetary: prefer 'sales'; else quantity*price
    if "sales" in df.columns:
        df["totalprice"] = pd.to_numeric(df["sales"], errors="coerce")
    else:
        price_col = None
        for cand in ["price", "unitprice", "unit_price"]:
            if cand in df.columns:
                price_col = cand
                break
        if price_col:
            df[price_col] = pd.to_numeric(df[price_col], errors="coerce")
            df["totalprice"] = df["quantity"] * df[price_col]
        else:
            df["totalprice"] = df["quantity"]

    # Dates
    df["invoicedate"] = pd.to_datetime(df["invoicedate"], errors="coerce")

    # Drop unusable rows
    df = df[df["invoicedate"].notna() & df["totalprice"].notna()].copy()

    return df


# ---------------------------------------------------------------------------
# RFM computation
# ---------------------------------------------------------------------------

def _compute_rfm_and_assign(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute recency, frequency, monetary and segment labels for each customer.
    """
    rfm_df = df[df["customerid"].notna()].copy()

    if rfm_df.empty:
        return pd.DataFrame(
            columns=[
                "customerid",
                "recency",
                "frequency",
                "monetary",
                "customertype",
                "discount",
                "r_score",
                "f_score",
                "m_score",
                "rfm_sum",
            ]
        )

    snapshot = rfm_df["invoicedate"].max() + timedelta(days=1)

    # Frequency via invoice number if exists, else count rows
    if "invoiceno" in rfm_df.columns:
        grouped = rfm_df.groupby("customerid").agg(
            {
                "invoicedate": lambda x: (snapshot - x.max()).days,
                "totalprice": "sum",
                "invoiceno": "nunique",
            }
        )
        grouped.rename(columns={"invoiceno": "frequency"}, inplace=True)
    else:
        grouped = rfm_df.groupby("customerid").agg(
            {
                "invoicedate": lambda x: (snapshot - x.max()).days,
                "totalprice": "sum",
            }
        )
        grouped["frequency"] = rfm_df.groupby("customerid").size()

    grouped.rename(
        columns={"invoicedate": "recency", "totalprice": "monetary"}, inplace=True
    )
    grouped = grouped.reset_index()

    # Scores
    grouped["r_score"] = pd.qcut(
        grouped["recency"].rank(method="first"), 4, labels=[4, 3, 2, 1]
    ).astype(int)

    grouped["f_score"] = pd.qcut(
        grouped["frequency"].rank(method="first"), 4, labels=[1, 2, 3, 4]
    ).astype(int)

    grouped["m_score"] = pd.qcut(
        grouped["monetary"].rank(method="first"), 4, labels=[1, 2, 3, 4]
    ).astype(int)

    grouped["rfm_sum"] = (
        grouped["r_score"] + grouped["f_score"] + grouped["m_score"]
    )

    # Customer segment
    def get_type(row):
        if row["rfm_sum"] >= 10:
            return "top spenders"
        if row["frequency"] == 1 and row["recency"] <= 60:
            return "new customers"
        if row["recency"] > 90 or row["rfm_sum"] <= 5:
            return "at-risk / dormant"
        if row["rfm_sum"] >= 7:
            return "top spenders"
        return "at-risk / dormant"

    grouped["customertype"] = grouped.apply(get_type, axis=1)

    def discount(ct):
        if ct == "top spenders":
            return "15% VIP discount"
        if ct == "new customers":
            return "10% welcome discount"
        if ct == "at-risk / dormant":
            return "25% re-engagement discount"
        return "5% promo"

    grouped["discount"] = grouped["customertype"].apply(discount)

    return grouped


def _merge_rfm(df: pd.DataFrame, rfm_table: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["customerid"] = df["customerid"].astype(str)
    rfm_table = rfm_table.copy()
    rfm_table["customerid"] = rfm_table["customerid"].astype(str)

    merged = df.merge(rfm_table, on="customerid", how="left")
    return merged


# ---------------------------------------------------------------------------
# Prepare merged_df ONCE at import time
# ---------------------------------------------------------------------------

try:
    _base_df = _load_cleaned_from_csv(csv_path)
    _rfm_table = _compute_rfm_and_assign(_base_df)
    _merged_df = _merge_rfm(_base_df, _rfm_table)
except Exception as e:
    raise RuntimeError(f"Error preparing customer RFM data from CSV: {e}")


# ---------------------------------------------------------------------------
# Public function used by FastAPI
# ---------------------------------------------------------------------------

def get_customer_top_products(
    customer_id: str, top_n: int = 50
) -> Tuple[Optional[Dict], Optional[List[Dict]]]:
    """
    Return (profile_dict, products_list) for a given customer_id.
    profile_dict: single dict with RFM fields
    products_list: list of up to top_n products with quantity and spend
    """
    df = _merged_df.copy()
    df["customerid"] = (
        df["customerid"].astype(str).str.strip().str.split(".").str[0]
    )

    cust = customer_id.strip()
    match = df[df["customerid"] == cust]

    if match.empty:
        return None, None

    # Profile
    profile_cols = [
        "customerid",
        "recency",
        "frequency",
        "monetary",
        "customertype",
        "discount",
        "r_score",
        "f_score",
        "m_score",
        "rfm_sum",
    ]
    profile_df = (
        match[profile_cols].drop_duplicates().reset_index(drop=True)
    )
    profile_row = profile_df.iloc[0]
    profile = {
        k: (v.item() if hasattr(v, "item") else v) for k, v in profile_row.items()
    }

    # Product table
    prod_tbl = (
        match.groupby("description")
        .agg(
            last_purchase=("invoicedate", "max"),
            quantity=("quantity", "sum"),
            total_spent=("totalprice", "sum"),
        )
        .reset_index()
    )

    prod_tbl = prod_tbl.sort_values("total_spent", ascending=False).head(top_n)

    products: List[Dict] = []
    for _, row in prod_tbl.iterrows():
        lp = row["last_purchase"]
        if isinstance(lp, pd.Timestamp):
            lp_str = lp.date().isoformat()
        else:
            lp_str = None

        products.append(
            {
                "description": str(row["description"]),
                "last_purchase_date": lp_str,
                "total_quantity": float(row["quantity"])
                if not pd.isna(row["quantity"])
                else 0.0,
                "total_spent": float(row["total_spent"])
                if not pd.isna(row["total_spent"])
                else 0.0,
            }
        )

    return profile, products
