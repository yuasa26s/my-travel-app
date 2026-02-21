from pydantic import BaseModel
from typing import Optional

class TripBase(BaseModel):
    title: str
    startDate: str
    endDate: str

class TripCreate(TripBase):
    pass  # 新規登録時に使う（IDはまだ無いので継承のみ）

class TripResponse(TripBase):
    tripId: str  # レスポンスにはIDが含まれる

    class Config:
        from_attributes = True