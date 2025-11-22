import { useState } from "react";

export default function AdminPage() {
  const [lastRetrain, setLastRetrain] = useState<string | null>(null);
  const [lastHashPublish, setLastHashPublish] = useState<string | null>(null);

  const handleRetrain = () => {
    const now = new Date().toLocaleString();
    setLastRetrain(now);
    alert("Mock: retrain requested (backend will handle in real app).");
  };

  const handlePublishHash = () => {
    const now = new Date().toLocaleString();
    setLastHashPublish(now);
    alert("Mock: publish hash to blockchain requested.");
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>
        This page will control model retraining and writing final forecast hash to blockchain.
        For now, it uses mock actions.
      </p>

      <div style={{ marginTop: "20px", display: "flex", gap: "16px" }}>
        <button style={buttonStyle} onClick={handleRetrain}>
          Retrain Forecast Model
        </button>
        <button style={buttonStyle} onClick={handlePublishHash}>
          Publish Latest Merkle Root
        </button>
      </div>

      <div style={{ marginTop: "24px" }}>
        <p>
          <strong>Last Retrain:</strong>{" "}
          {lastRetrain ?? "No retrain triggered yet"}
        </p>
        <p>
          <strong>Last Hash Publish:</strong>{" "}
          {lastHashPublish ?? "No hash publish triggered yet"}
        </p>
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  cursor: "pointer",
  fontSize: "14px",
  backgroundColor: "#f3f4f6",
};
   