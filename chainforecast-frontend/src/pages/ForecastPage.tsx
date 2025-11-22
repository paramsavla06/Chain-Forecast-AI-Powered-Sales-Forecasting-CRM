import SalesForecastChart from "../components/SalesForecastChart";
import CustomerProductsCRM from "../components/CustomerProductsCRM";
import "./../App.css";

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
          <SalesForecastChart />
        </section>

        {/* 2. CUSTOMER PRODUCTS CRM (top-right card) */}
        <CustomerProductsCRM />

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
                        style={{
                          width: `${
                            (p.sales / topProducts[0].sales) * 100
                          }%`,
                        }}
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
                  <div className="future-lift">
                    {p.lift} forecasted uplift
                  </div>
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
