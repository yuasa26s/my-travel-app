# TODO API関数を先に作った。keyの入力をすること。

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchTrips = async () => {
  const res = await fetch(`${BASE_URL}/api/trips`);
  if (!res.ok) throw new Error("Failed to fetch trips");
  return res.json();
};

export const fetchSchedules = async (tripId: string) => {
  const res = await fetch(`${BASE_URL}/api/schedules?tripId=${tripId}`);
  if (!res.ok) throw new Error("Failed to fetch schedules");
  return res.json();
};

export const fetchExpenses = async (tripId: string) => {
  const res = await fetch(`${BASE_URL}/api/expenses?tripId=${tripId}`);
  if (!res.ok) throw new Error("Failed to fetch expenses");
  return res.json();
};
