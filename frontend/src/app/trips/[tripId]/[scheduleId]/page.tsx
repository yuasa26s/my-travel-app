export default async function ScheduleDetailPage({
  params,
}: {
  params: Promise<{ tripId: string; scheduleId: string }>;
}) {
  const { tripId, scheduleId } = await params;

  return (
    <div>
      <h1>Trip ID: {tripId}</h1>
      <h2>Schedule ID: {scheduleId}</h2>
    </div>
  );
}
