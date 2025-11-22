from datetime import timedelta
from typing import List, Dict

import pandas as pd
from sklearn.linear_model import LinearRegression

from data_loader import load_data


def _get_daily_sales() -> pd.DataFrame:
    df = load_data()
    daily = (
        df.set_index("invoice_date")["line_total"]
        .resample("D")
        .sum()
        .rename("sales")
        .reset_index()
    )
    return daily


def _fit_regression_forecast(
    days_forward: int, history_days: int
) -> List[Dict[str, float]]:
    daily = _get_daily_sales().copy()

    # keep only last `history_days` to make model more “recent”
    if history_days is not None and history_days < len(daily):
        daily = daily.iloc[-history_days:]

    # Use index as simple time variable
    daily["t"] = range(len(daily))
    X = daily[["t"]]
    y = daily["sales"]

    model = LinearRegression()
    model.fit(X, y)

    last_t = daily["t"].iloc[-1]
    start_date = daily["invoice_date"].iloc[-1]

    forecasts = []
    for i in range(1, days_forward + 1):
        t_future = last_t + i
        pred = float(model.predict([[t_future]])[0])
        day = start_date + timedelta(days=i)
        forecasts.append(
            {
                "date": day.strftime("%Y-%m-%d"),
                "sales": max(pred, 0.0),
            }
        )
    return forecasts


def get_short_term_forecast() -> List[Dict[str, float]]:
    """
    4-week horizon, using last 90 days of sales.
    """
    return _fit_regression_forecast(days_forward=28, history_days=90)


def get_long_term_forecast() -> List[Dict[str, float]]:
    """
    4-month horizon, using last 365 days.
    """
    # 4 months ≈ 120 days for demo
    return _fit_regression_forecast(days_forward=120, history_days=365)
