from fastapi import APIRouter, HTTPException
from app.core.config import db
from app.models.trip import TripCreate

router = APIRouter()

# 1. 旅行の一覧取得（GET /api/trips/）
@router.get("/")
async def get_trips():
    try:
        docs = db.collection("trips").stream()
        trips = []
        for d in docs:
            data = d.to_dict()
            data["id"] = d.id
            trips.append(data)
        return trips
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. 旅行の新規作成（POST /api/trips/）
@router.post("/")
async def create_trip(trip: TripCreate):
    try:
        # フロントから届いたデータを辞書形式にする
        trip_data = trip.dict()
        
        # Firestoreの 'trips' コレクションに保存 (.add を使うとIDが自動生成される)
        # 戻り値は (update_time, doc_ref) なので、doc_ref を使u
        
        update_time, doc_ref = db.collection("trips").add(trip_data)
        
        return {
            "id": doc_ref.id, 
            "message": "旅行を作成しました！",
            "created_at": update_time.isoformat() if update_time else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. 特定の旅行の詳細取得（GET /api/trips/{trip_id}）
@router.get("/{trip_id}")
async def get_trip(trip_id: str):
    try:
        doc = db.collection("trips").document(trip_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="旅行が見つかりません") 
        return doc.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))