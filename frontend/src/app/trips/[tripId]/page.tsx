export default function TripDetailPage({
  params,
}: {
  params: { tripId: string };
}) {
  return <h1>Trip ID: {params.tripId}</h1>;
}
