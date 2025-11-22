import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const DatasetUploadCard: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setStatus("Uploading file to server...");

      const res = await axios.post(`${API_BASE_URL}/upload-dataset`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 sec timeout so it can't hang forever
      });

      console.log("Upload response:", res.data);
      const data = res.data;
      setStatus(
        `✅ Uploaded: ${file.name} (rows: ${data.rows}, columns: ${data.columns})`
      );
    } catch (err: any) {
      console.error("Upload error:", err);

      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "❌ Error uploading dataset.";
      setStatus(msg);
    } finally {
      // this ALWAYS runs, success or error
      setLoading(false);
    }
  };

  return (
    <section className="card card-hover fade-in">
      <div className="card-header">
        <div>
          <div className="card-title">Upload dataset</div>
          <div className="card-meta">
            Upload a CSV or Excel file to use as the active dataset for forecasts.
          </div>
        </div>
      </div>

      <div className="card-body">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
          />

          <button
            className="primary-btn"
            onClick={handleUpload}
            disabled={loading || !file}
          >
            {loading ? "Uploading..." : "Upload dataset"}
          </button>

          {status && (
            <p className="card-meta" style={{ marginTop: "0.5rem" }}>
              {status}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default DatasetUploadCard;
