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

      {trips.map((trip) => (
        <div key={trip.id}>
          <h2>{trip.title}</h2>
          <p>ID: {trip.id}</p>
        </div>
      ))}
    </div>
  );
}
