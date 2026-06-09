from fastapi import APIRouter
router = APIRouter()

@router.post("/login")
async def login():
    return {"message": "Login successful", "user_id": "test_user_01"}