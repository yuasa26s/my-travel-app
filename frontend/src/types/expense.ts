export type ExpenseItem = {
  id: string;
  expense: number;
  categoryId: number;
  place: string;
};

export type ExpenseResponse = {
  expenses: ExpenseItem[];
  total: number;
};
