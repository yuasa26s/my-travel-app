"use client";

import { useEffect, useState } from "react";
import { getExpenses } from "@/lib/api";
import { ExpenseResponse } from "@/types/expense";

type Props = {
  params: {
    tripId: string;
    scheduleId: string;
  };
};

export default function AmountPage({ params }: Props) {
  const { tripId } = params;

  const [data, setData] = useState<ExpenseResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await getExpenses(tripId);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [tripId]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">出費一覧</h1>

      <div className="mb-4">
        <p className="font-semibold">Total:</p>
        <p className="text-lg">¥{data.total}</p>
      </div>

      <div>
        <p className="font-semibold mb-2">内訳:</p>
        {data.expenses.map((item) => (
          <div key={item.id} className="border p-2 mb-2">
            <p>Place: {item.place}</p>
            <p>Amount: ¥{item.expense}</p>
            <p>Category ID: {item.categoryId}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
