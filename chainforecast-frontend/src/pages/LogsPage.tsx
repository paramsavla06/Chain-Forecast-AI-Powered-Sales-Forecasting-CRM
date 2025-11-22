export default function LogsPage() {
  const mockLogs = [
    {
      id: 1,
      time: "2025-11-21 14:32",
      action: "Forecast recomputed",
      detail: "Prophet model retrained on latest 90 days of sales.",
      level: "info",
    },
    {
      id: 2,
      time: "2025-11-21 14:29",
      action: "Data hash committed",
      detail: "Merkle root for sales_snapshot_2025_11_21 stored on-chain.",
      level: "success",
    },
    {
      id: 3,
      time: "2025-11-21 10:11",
      action: "Suspicious upload rejected",
      detail: "CSV file contained missing invoice IDs.",
      level: "warning",
    },
  ];

  return (
    <div>
      <h1 className="page-title">Integrity Logs</h1>
      <p className="page-subtitle">
        Every critical action is recorded here to prove data integrity and
        model transparency.
      </p>

      <div className="card card-hover fade-in" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">Recent log entries</div>
          <div className="card-meta">Demo data · last 3 events</div>
        </div>

        <div className="card-body">
          <div className="logs-table">
            {mockLogs.map((log) => (
              <div key={log.id} className={`logs-row logs-${log.level}`}>
                <div className="logs-dot" />
                <div className="logs-main">
                  <div className="logs-action">{log.action}</div>
                  <div className="logs-detail">{log.detail}</div>
                </div>
                <div className="logs-meta">
                  <div className="logs-time">{log.time}</div>
                  <div className="logs-badge">{log.level.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
