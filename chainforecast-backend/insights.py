from datetime import timedelta
from typing import Dict, List

import pandas as pd

from data_loader import load_data


def get_top_products(days: int = 60, limit: int = 5) -> List[Dict]:
    df = load_data()
    max_date = df["invoice_date"].max()
    cutoff = max_date - timedelta(days=days)

    recent = df[df["invoice_date"] >= cutoff]

    grp = (
        recent.groupby("description")
        .agg(quantity=("quantity", "sum"), revenue=("line_total", "sum"))
        .reset_index()
        .sort_values("quantity", ascending=False)
        .head(limit)
    )

    return [
        {
            "description": row["description"],
            "quantity": int(row["quantity"]),
            "revenue": round(float(row["revenue"]), 2),
        }
        for _, row in grp.iterrows()
    ]


def get_retention() -> Dict:
    df = load_data()
    max_date = df["invoice_date"].max()

    window_1_end = max_date - timedelta(days=60)
    window_1_start = window_1_end - timedelta(days=60)

    window_2_start = max_date - timedelta(days=60)
    window_2_end = max_date

    w1 = df[(df["invoice_date"] >= window_1_start) & (df["invoice_date"] < window_1_end)]
    w2 = df[(df["invoice_date"] >= window_2_start) & (df["invoice_date"] <= window_2_end)]

    c1 = set(w1["customer_id"].unique())
    c2 = set(w2["customer_id"].unique())

    if not c1:
        retention_rate = 0.0
    else:
        retention_rate = len(c1 & c2) / len(c1)

    return {
        "window_1_customers": len(c1),
        "window_2_customers": len(c2),
        "retained_customers": len(c1 & c2),
        "retention_rate": round(retention_rate * 100, 2),
    }


def get_future_winners(limit: int = 5) -> List[Dict]:
    """
    Simple heuristic: compare qty in last 60 days vs previous 60 days.
    Products with biggest positive growth are 'future winners'.
    """
    df = load_data()
    max_date = df["invoice_date"].max()

    recent_start = max_date - timedelta(days=60)
    past_start = max_date - timedelta(days=120)

    recent = df[(df["invoice_date"] > recent_start)]
    past = df[(df["invoice_date"] > past_start) & (df["invoice_date"] <= recent_start)]

    recent_qty = (
        recent.groupby("description")["quantity"].sum().rename("recent_qty")
    )
    past_qty = past.groupby("description")["quantity"].sum().rename("past_qty")

    merged = pd.concat([recent_qty, past_qty], axis=1).fillna(0)
    merged["growth"] = merged["recent_qty"] - merged["past_qty"]
    merged = merged.sort_values("growth", ascending=False).head(limit)

    results = []
    for desc, row in merged.iterrows():
        baseline = row["past_qty"] if row["past_qty"] > 0 else 1
        lift_pct = (row["growth"] / baseline) * 100
        results.append(
            {
                "description": desc,
                "recent_qty": int(row["recent_qty"]),
                "past_qty": int(row["past_qty"]),
                "lift_percent": round(float(lift_pct), 2),
            }
        )

    return results
