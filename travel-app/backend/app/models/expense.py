from pydantic import BaseModel
from typing import List, Optional

# 1. 予定（Schedule）の基本形
class ScheduleBase(BaseModel):
    tripId: str
    startDate: str
    startTime: str
    endTime: str
    place: str
    expense: int
    categoryId: int
    purpose: str
    memo: Optional[str] = ""

# 2. 予定のレスポンス（作成日時などを含む）
class ScheduleResponse(ScheduleBase):
    id: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

# 3. 出費一覧用の小さなアイテム型（設計書の中段にあるもの）
class ExpenseItem(BaseModel):
    id: str
    expense: int
    categoryId: int
    place: str

# 4. 出費一覧のレスポンス（合計金額を含む）
class ExpenseSummaryResponse(BaseModel):
    expenses: List[ExpenseItem]
    total: int