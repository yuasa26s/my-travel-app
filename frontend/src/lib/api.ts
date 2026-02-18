const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// # 今はGETのみ。apiが繋がった事を確認したらディレクトリにわける。
// -------- Trips --------
export const getTrips = async () => {
  const res = await fetch(`${BASE_URL}/api/trips`);

  console.log("BASE_URL:", BASE_URL);

  if (!res.ok) throw new Error("Failed to fetch trips");
  return res.json();
};

export const getTrip = async (tripId: string) => {
  const res = await fetch(`${BASE_URL}/api/trips/${tripId}`);
  if (!res.ok) throw new Error("Failed to fetch trip");
  return res.json();
};

// -------- Schedules --------
export const getSchedules = async (tripId: string) => {
  const res = await fetch(`${BASE_URL}/api/schedules?tripId=${tripId}`);
  if (!res.ok) throw new Error("Failed to fetch schedules");
  return res.json();
};

// -------- Expenses --------
export const getExpenses = async (tripId: string) => {
  const res = await fetch(`${BASE_URL}/api/expenses?tripId=${tripId}`);
  if (!res.ok) throw new Error("Failed to fetch expenses");
  return res.json();
};
