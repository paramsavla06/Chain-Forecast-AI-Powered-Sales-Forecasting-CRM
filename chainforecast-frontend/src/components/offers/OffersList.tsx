type Offer = {
  segment: string;
  offerText: string;
};

type OffersListProps = {
  offers: Offer[];
};

export default function OffersList({ offers }: OffersListProps) {
  return (
    <div style={{ marginTop: "20px" }}>
      {offers.map((o, idx) => (
        <div
          key={idx}
          style={{
            padding: "12px 16px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginBottom: "10px",
            backgroundColor: "#fafafa"
          }}
        >
          <h3 style={{ margin: 0 }}>{o.segment}</h3>
          <p style={{ marginTop: "6px" }}>{o.offerText}</p>
        </div>
      ))}
    </div>
  );
}