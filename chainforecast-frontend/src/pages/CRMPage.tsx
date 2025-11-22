import RFMSummaryTable from "../components/crm/RFMSummaryTable";

const mockRFMData = [
  {
    customerId: "C001",
    name: "Rohit Sharma",
    recencyDays: 3,
    frequency: 18,
    monetary: 45000,
    segment: "Top Spenders",
  },
  {
    customerId: "C002",
    name: "Sneha Patil",
    recencyDays: 25,
    frequency: 6,
    monetary: 12000,
    segment: "At-Risk",
  },
  {
    customerId: "C003",
    name: "Aman Verma",
    recencyDays: 5,
    frequency: 3,
    monetary: 5000,
    segment: "New Customers",
  },
  {
    customerId: "C004",
    name: "Priya Nair",
    recencyDays: 10,
    frequency: 9,
    monetary: 21000,
    segment: "Top Spenders",
  },
];

export default function CRMPage() {
  return (
    <div>
      <h1>Customer Segmentation (RFM)</h1>
      <p>
        This table shows example RFM metrics and segments.
        Later this data will come from the backend CRM model.
      </p>

      <RFMSummaryTable data={mockRFMData} />
    </div>
  );
}