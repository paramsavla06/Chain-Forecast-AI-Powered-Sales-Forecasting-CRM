import HashLogTable from "../components/logs/HashLogTable";

const mockHashLogs = [
  {
    id: 1,
    batchId: "FORECAST_2025-11-01",
    timestamp: "2025-11-01 10:15",
    merkleRoot: "0xabc123...789",
    onChain: true,
  },
  {
    id: 2,
    batchId: "FORECAST_2025-11-08",
    timestamp: "2025-11-08 10:20",
    merkleRoot: "0xdef456...321",
    onChain: true,
  },
  {
    id: 3,
    batchId: "FORECAST_2025-11-15",
    timestamp: "2025-11-15 10:30",
    merkleRoot: "0x999aaa...555",
    onChain: false,
  },
];

export default function LogsPage() {
  return (
    <div>
      <h1>Integrity / Blockchain Logs</h1>
      <p>
        These are sample hash and Merkle root logs for forecast batches.
        Later this data will come from the backend + blockchain.
      </p>

      <HashLogTable data={mockHashLogs} />
    </div>
  );
}
