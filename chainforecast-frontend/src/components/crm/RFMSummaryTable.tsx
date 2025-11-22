type RFMRecord = {
  customerId: string;
  name: string;
  recencyDays: number;
  frequency: number;
  monetary: number;
  segment: string;
};

type RFMSummaryTableProps = {
  data: RFMRecord[];
};

export default function RFMSummaryTable({ data }: RFMSummaryTableProps) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
      <thead>
        <tr>
          <th style={thStyle}>Customer ID</th>
          <th style={thStyle}>Name</th>
          <th style={thStyle}>Recency (days)</th>
          <th style={thStyle}>Frequency</th>
          <th style={thStyle}>Monetary</th>
          <th style={thStyle}>Segment</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.customerId}>
            <td style={tdStyle}>{row.customerId}</td>
            <td style={tdStyle}>{row.name}</td>
            <td style={tdStyle}>{row.recencyDays}</td>
            <td style={tdStyle}>{row.frequency}</td>
            <td style={tdStyle}>₹{row.monetary.toLocaleString()}</td>
            <td style={tdStyle}>
              <span style={segmentBadgeStyle(row.segment)}>
                {row.segment}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "8px",
  backgroundColor: "#f5f5f5",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "8px",
  fontSize: "14px",
};

function segmentBadgeStyle(segment: string): React.CSSProperties {
  let background = "#e5e7eb"; // default gray
  if (segment === "Top Spenders") background = "#d1fae5"; // green-ish
  if (segment === "At-Risk") background = "#fee2e2";      // red-ish
  if (segment === "New Customers") background = "#e0f2fe"; // blue-ish

  return {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "999px",
    backgroundColor: background,
    fontSize: "12px",
  };
}
