type ScheduleCardProps = {
  title: string;
  time?: string;
  description?: string;
};

export default function ScheduleCard({
  title,
  time,
  description,
}: ScheduleCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition duration-200 mb-4">
      {time && (
        <div className="text-sm text-cyan-500 mb-1 font-medium">{time}</div>
      )}

      <h3 className="text-lg font-semibold">{title}</h3>

      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
    </div>
  );
}
