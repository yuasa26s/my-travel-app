export default async function ScheduleDetailPage({
  params,
}: {
  params: { tripId: string; scheduleId: string };
}) {
  const { tripId, scheduleId } = params;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Trip ID: {tripId}
        </h1>
        <h2 className="text-lg text-gray-600">Schedule ID: {scheduleId}</h2>
      </div>
    </div>
  );
}
