const mockTrips = [
  { id: 1, name: "沖縄旅行", period: "2026/03/01 - 03/03" },
  { id: 2, name: "北海道旅行", period: "2026/04/10 - 04/12" },
];

// export default function TripsPage() {
//   return (
//     <div>
//       <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>旅行一覧</h1>
//       {mockTrips.map((trip) => (
//         <div
//           key={trip.id}
//           style={{
//             borderRadius: "12px",
//             padding: "20px",
//             marginBottom: "16px",
//             backgroundColor: "#ffffff",
//             boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
//             cursor: "pointer",
//             transition: "0.2s",
//           }}
//         >
//           <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>{trip.name}</h2>
//           <p style={{ color: "#666" }}>{trip.period}</p>
//         </div>
//       ))}
//     </div>
//   );
// }
