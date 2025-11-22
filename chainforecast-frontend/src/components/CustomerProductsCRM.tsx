import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

type CustomerProfile = {
  customerid: string;
  recency: number;
  frequency: number;
  monetary: number;
  customertype: string;
  discount: string;
  r_score: number;
  f_score: number;
  m_score: number;
  rfm_sum: number;
};

type CustomerProduct = {
  description: string;
  last_purchase_date: string | null;
  total_quantity: number;
  total_spent: number;
};

type CustomerProductsResponse = {
  profile: CustomerProfile;
  products: CustomerProduct[];
};

const CustomerProductsCRM: React.FC = () => {
  const [customerId, setCustomerId] = useState("");
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [products, setProducts] = useState<CustomerProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    if (!customerId.trim()) {
      setError("Please enter a customer ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setProfile(null);
      setProducts([]);

      const res = await axios.post<CustomerProductsResponse>(
        `${API_BASE_URL}/customer-products`,
        { customer_id: customerId.trim() }
      );

      setProfile(res.data.profile);
      setProducts(res.data.products);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Error fetching customer products.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card card-hover fade-in">
      <div className="card-header">
        <div>
          <div className="card-title">Customer product profile</div>
          <div className="card-meta">
            Enter a customer ID to see their top 50 products by spend.
          </div>
        </div>
      </div>

      <div className="card-body">
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "0.75rem",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Enter customer ID..."
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            style={{ flex: 1, padding: "0.35rem 0.6rem" }}
          />
          <button
            className="primary-btn"
            onClick={handleFetch}
            disabled={loading}
          >
            {loading ? "Loading..." : "Get products"}
          </button>
        </div>

        {error && (
          <p style={{ color: "red", marginBottom: "0.5rem" }}>{error}</p>
        )}

        {profile && (
          <div style={{ marginBottom: "0.75rem" }}>
            <h3 className="stats-title">Customer profile</h3>
            <p className="card-meta">
              <strong>ID:</strong> {profile.customerid} ·{" "}
              <strong>Type:</strong> {profile.customertype} ·{" "}
              <strong>Discount:</strong> {profile.discount}
            </p>
            <p className="card-meta">
              Recency: {profile.recency} days · Frequency: {profile.frequency}{" "}
              orders · Monetary: £{profile.monetary.toFixed(2)} · RFM sum:{" "}
              {profile.rfm_sum}
            </p>
          </div>
        )}

        {products.length > 0 && (
          <>
            <h3 className="stats-title">Top products</h3>
            <div
              style={{
                maxHeight: "260px",
                overflowY: "auto",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.8rem",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ padding: "0.4rem" }}>Product</th>
                    <th style={{ padding: "0.4rem" }}>Last purchase</th>
                    <th style={{ padding: "0.4rem", textAlign: "right" }}>
                      Qty
                    </th>
                    <th style={{ padding: "0.4rem", textAlign: "right" }}>
                      Total spent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, idx) => (
                    <tr key={`${p.description}-${idx}`}>
                      <td style={{ padding: "0.35rem" }}>{p.description}</td>
                      <td style={{ padding: "0.35rem" }}>
                        {p.last_purchase_date || "-"}
                      </td>
                      <td style={{ textAlign: "right", padding: "0.35rem" }}>
                        {p.total_quantity.toFixed(0)}
                      </td>
                      <td style={{ textAlign: "right", padding: "0.35rem" }}>
                        £{p.total_spent.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CustomerProductsCRM;
