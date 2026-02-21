from fastapi import APIRouter
from app.core.config import db
from app.models.trip import TripCreate

router = APIRouter()

# POST /api/trips (作成)
@router.post("/")
async def create_trip(trip: TripCreate):
    doc_ref = db.collection("trips").document()
    doc_ref.set(trip.dict())
    return {"id": doc_ref.id, "message": "Trip created"}

# GET /api/trips (一覧取得)
@router.get("/")
async def get_trips():
    docs = db.collection("trips").stream()
    trips = []
    for d in docs:
        data = d.to_dict()
        data["id"] = d.id
        trips.append(data)
    return trips