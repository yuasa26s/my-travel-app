from pydantic import BaseModel
from typing import List, Optional

class PlanCreate(BaseModel):
    time: str
    location: str
    category: str
    cost: int
    memo: Optional[str] = ""

class PostCreate(BaseModel):
    title: str
    startDate: str
    endDate: str