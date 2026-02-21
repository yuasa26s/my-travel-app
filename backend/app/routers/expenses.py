from fastapi import APIRouter, Query
from app.core.config import db  
from app.models.expense import ExpenseSummaryResponse, ExpenseItem

router = APIRouter()

@router.get("/trips/{trip_id}/expenses", response_model=ExpenseSummaryResponse)
async def get_trip_expense_summary(trip_id: str):
    # 1. Firebaseからデータを取得
    docs = db.collection("schedules").where("tripId", "==", trip_id).stream()
    
    expense_list = []
    total_val = 0

    for doc in docs:
        data = doc.to_dict()
        amount = data.get("expense", 0)
        
        # 出費があるものだけをリストに追加
        if amount > 0:
            item = {
                "id": doc.id,
                "expense": amount,
                "categoryId": data.get("categoryId", 0),
                "place": data.get("place", "不明")
            }
            expense_list.append(item)
            total_val += amount

    # 2. 設計書の型 (ExpenseSummaryResponse) に合わせて返す
    return {
        "expenses": expense_list,
        "total": total_val
    }

@router.get("/expenses", response_model=ExpenseSummaryResponse) 
async def get_expenses(tripId: str = Query(...)):
    # 上の関数と同じロジック、または共通化して呼び出す
    return await get_trip_expense_summary(tripId)