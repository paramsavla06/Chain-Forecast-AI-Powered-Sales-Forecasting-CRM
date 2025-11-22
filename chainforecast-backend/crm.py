from datetime import timedelta
from typing import List, Dict

import pandas as pd

from data_loader import load_data


def _rfm_table() -> pd.DataFrame:
    df = load_data()
    snapshot_date = df["invoice_date"].max() + timedelta(days=1)

    rfm = (
        df.groupby("customer_id")
        .agg(
            recency=("invoice_date", lambda x: (snapshot_date - x.max()).days),
            frequency=("invoice_no", "nunique"),
            monetary=("line_total", "sum"),
        )
        .reset_index()
    )

    # scores 1–5 using quantiles (higher is better except recency)
    rfm["R_score"] = pd.qcut(rfm["recency"], 5, labels=[5, 4, 3, 2, 1]).astype(int)
    rfm["F_score"] = pd.qcut(rfm["frequency"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(
        int
    )
    rfm["M_score"] = pd.qcut(rfm["monetary"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(
        int
    )

    rfm["RFM_score"] = rfm["R_score"] + rfm["F_score"] + rfm["M_score"]
    return rfm


def get_segments_summary() -> Dict[str, List[Dict]]:
    rfm = _rfm_table()

    def segment_row(row):
        if row.RFM_score >= 13:
            return "Top Spenders"
        if row.R_score >= 4 and row.F_score >= 3:
            return "Loyal"
        if row.R_score <= 2 and row.F_score >= 3:
            return "At-Risk"
        if row.F_score == 1 and row.R_score <= 2:
            return "Churned"
        return "Regular"

    rfm["segment"] = rfm.apply(segment_row, axis=1)

    segments = (
        rfm.groupby("segment")
        .agg(
            customers=("customer_id", "nunique"),
            avg_monetary=("monetary", "mean"),
            avg_frequency=("frequency", "mean"),
        )
        .reset_index()
    )

    result = []
    for _, row in segments.iterrows():
        result.append(
            {
                "segment": row["segment"],
                "customers": int(row["customers"]),
                "avg_monetary": round(float(row["avg_monetary"]), 2),
                "avg_frequency": round(float(row["avg_frequency"]), 2),
            }
        )

    return {"segments": result}


def get_sample_customers(segment_name: str, limit: int = 10) -> List[Dict]:
    rfm = _rfm_table()

    def segment_row(row):
        if row.RFM_score >= 13:
            return "Top Spenders"
        if row.R_score >= 4 and row.F_score >= 3:
            return "Loyal"
        if row.R_score <= 2 and row.F_score >= 3:
            return "At-Risk"
        if row.F_score == 1 and row.R_score <= 2:
            return "Churned"
        return "Regular"

    rfm["segment"] = rfm.apply(segment_row, axis=1)
    subset = rfm[rfm["segment"] == segment_name].head(limit)

    return [
        {
            "customer_id": int(row.customer_id),
            "recency_days": int(row.recency),
            "frequency": int(row.frequency),
            "monetary": round(float(row.monetary), 2),
        }
        for _, row in subset.iterrows()
    ]
