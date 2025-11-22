from functools import lru_cache
from datetime import datetime
from typing import Tuple

import pandas as pd

from config import DATA_PATH


@lru_cache(maxsize=1)
def load_data() -> pd.DataFrame:
    """
    Load the cleaned Online Retail data from Excel and standardise columns.
    Cached so we don't reload on every request.
    """
    df = pd.read_excel(DATA_PATH)

    # Try to normalise column names – adapt if your sheet is different
    df = df.rename(
        columns={
            "InvoiceDate": "invoice_date",
            "Invoice": "invoice_no",
            "InvoiceNo": "invoice_no",
            "StockCode": "stock_code",
            "Description": "description",
            "Quantity": "quantity",
            "UnitPrice": "unit_price",
            "CustomerID": "customer_id",
            "Customer Id": "customer_id",
            "Country": "country",
        }
    )

    # Ensure datetime
    df["invoice_date"] = pd.to_datetime(df["invoice_date"])
    # Total revenue per line
    df["line_total"] = df["quantity"] * df["unit_price"]

    # Drop obvious bad rows if present
    df = df.dropna(subset=["invoice_date", "customer_id"])
    df = df[df["quantity"] > 0]
    df = df[df["unit_price"] > 0]

    return df


def get_date_bounds() -> Tuple[datetime, datetime]:
    df = load_data()
    return df["invoice_date"].min(), df["invoice_date"].max()
