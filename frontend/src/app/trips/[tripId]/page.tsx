const mockSchedules = [
  { id: 1, title: "1日目：観光", time: "10:00 - 17:00" },
  { id: 2, title: "2日目：テーマパーク", time: "09:00 - 18:00" },
];

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white p-8">
      <h1 className="text-2xl font-bold mb-6">京都旅行 1日目</h1>
    </div>
  );
}
