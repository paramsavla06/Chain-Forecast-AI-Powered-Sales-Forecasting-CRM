import { useState } from "react";
import ForecastChart from "../components/charts/ForecastChart";
import ForecastPieChart from "../components/charts/ForecastPieChart";

const shortTerm = [
  { date: "Week 1", sales: 12000 },
  { date: "Week 2", sales: 13500 },
  { date: "Week 3", sales: 12800 },
  { date: "Week 4", sales: 15000 },
];

const longTerm = [
  { date: "Month 1", sales: 58000 },
  { date: "Month 2", sales: 60500 },
  { date: "Month 3", sales: 64000 },
  { date: "Month 4", sales: 69000 },
];

const topProducts = [
  { name: "Wireless Headphones", sales: 420 },
  { name: "Smartwatch Pro", sales: 360 },
  { name: "Gaming Mouse", sales: 310 },
];

const futureWinners = [
  { name: "Smart Glasses", lift: "+38%" },
  { name: "Eco Bottle Pack", lift: "+24%" },
  { name: "Fitness Band Lite", lift: "+19%" },
];

export default function ForecastPage() {
  const [horizon, setHorizon] = useState<"short" | "long">("short");

  const currentData = horizon === "short" ? shortTerm : longTerm;

  return (
    <div>
      {/* PAGE HEADER */}
      <h1 className="page-title">AI Sales Forecasting &amp; CRM</h1>
      <p className="page-subtitle">
        Two forecasting models (short-term &amp; long-term) combined with CRM
        insights to help retailers plan inventory, discounts and retention.
      </p>

      {/* GRID: 4 SECTIONS */}
      <div className="dashboard-grid">
        {/* 1. FORECAST MODELS */}
        <section className="card card-hover fade-in">
          <div className="card-header">
            <div>
              <div className="card-title">Forecast models</div>
              <div className="card-meta">
                Short horizon for weekly planning · Long horizon for strategy
              </div>
            </div>
            <div className="pill-toggle">
              <button
                className={horizon === "short" ? "active" : ""}
                onClick={() => setHorizon("short")}
              >
                Short term
              </button>
              <button
                className={horizon === "long" ? "active" : ""}
                onClick={() => setHorizon("long")}
              >
                Long term
              </button>
            </div>
          </div>

          <div className="card-body">
            <div className="chart-grid">
              <div className="chart-main">
                <ForecastChart data={currentData} />
              </div>
              <div className="chart-side">
                <h3 className="chart-side-title">Share by period</h3>
                <ForecastPieChart data={currentData} />
              </div>
            </div>
          </div>
        </section>

        {/* 2. CRM DISCOUNT DESIGNER */}
        <section className="card card-hover fade-in">
          <div className="card-header">
            <div>
              <div className="card-title">CRM discount rules</div>
              <div className="card-meta">
                Target segments based on purchase volume and recency.
              </div>
            </div>
          </div>
          <div className="card-body crm-grid">
            <div className="crm-form">
              <label>
                Customer category
                <select>
                  <option>High-value (top 10% spend)</option>
                  <option>New customers (joined &lt; 30 days)</option>
                  <option>At-risk (no purchase in 60 days)</option>
                  <option>Bulk buyers (≥ 5 orders / month)</option>
                </select>
              </label>

              <label>
                Minimum number of products
                <input type="number" min={1} defaultValue={3} />
              </label>

              <label>
                Discount percentage
                <input type="number" min={0} max={90} defaultValue={15} />
              </label>

              <label>
                Coupon code to send
                <input placeholder="e.g. VIP15, REACTIVATE20" />
              </label>

              <button
                className="primary-btn"
                onClick={() => alert("This would generate a CRM campaign payload")}
              >
                Generate offer campaign
              </button>
            </div>

            <div className="crm-summary">
              <h3>Campaign summary (demo)</h3>
              <p>
                Targeting <strong>High-value</strong> customers who bought at
                least <strong>3</strong> products in the last month.
              </p>
              <p>
                They will receive a <strong>15% discount</strong> via coupon code{" "}
                <strong>VIP15</strong>.
              </p>
              <p className="crm-footnote">
                Later, this box will show expected uplift based on your model.
              </p>
            </div>
          </div>
        </section>

        {/* 3. TOP PRODUCTS + RETENTION */}
        <section className="card card-hover fade-in">
          <div className="card-header">
            <div className="card-title">Top products &amp; retention</div>
            <div className="card-meta">Past 60 days snapshot</div>
          </div>
          <div className="card-body stats-grid">
            <div>
              <h3 className="stats-title">Best sellers</h3>
              <ul className="product-list">
                {topProducts.map((p, idx) => (
                  <li key={p.name}>
                    <div className="product-row">
                      <span>
                        {idx + 1}. {p.name}
                      </span>
                      <span>{p.sales} units</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${(p.sales / topProducts[0].sales) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="stats-title">Customer retention</h3>
              <p className="retention-number">68% repeat rate</p>
              <p className="retention-meta">
                2 out of 3 customers buy again within 45 days.
              </p>
              <ul className="retention-list">
                <li>• 24% are brand new customers</li>
                <li>• 44% are active repeat buyers</li>
                <li>• 32% are at risk of churn</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. FUTURE WINNERS */}
        <section className="card card-hover fade-in">
          <div className="card-header">
            <div className="card-title">Future winners</div>
            <div className="card-meta">
              Products predicted to boom from the long-term model.
            </div>
          </div>
          <div className="card-body">
            <ul className="future-list">
              {futureWinners.map((p) => (
                <li key={p.name}>
                  <div className="future-name">{p.name}</div>
                  <div className="future-lift">{p.lift} forecasted uplift</div>
                </li>
              ))}
            </ul>
            <p className="future-footnote">
              In your final version, populate this from product-level forecasts.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
