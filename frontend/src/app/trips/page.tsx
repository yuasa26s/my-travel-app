"use client";

import { useEffect, useState } from "react";
import { getTrips } from "../../lib/api";
import { Trip } from "../../types/trip";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    getTrips()
      .then(setTrips)
      .catch((error: unknown) => console.error(error));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">旅行一覧</h1>

      {/* テストの為一時的にJSON表示 */}
      <pre>{JSON.stringify(trips, null, 2)}</pre>

      {/* あとでTripCardに差し替える */}
    </div>
  );
}
