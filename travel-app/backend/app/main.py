from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.core.config import db
from datetime import datetime

app = FastAPI()

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PlanCreate(BaseModel):
    destination: str
    days: int
    purpose: str

@app.get("/")
def read_root():
    return {"message": "Hello Travel App!"}

# 1. データを保存するAPI（既存のものに少し改良を加え、直下にidを返します）
@app.post("/plans")
def create_travel_plan(plan: PlanCreate):
    try:
        doc_ref = db.collection("plans").document()
        plan_data = {
            "destination": plan.destination,
            "days": plan.days,
            "purpose": plan.purpose,
            "created_at": datetime.utcnow()
        }
        doc_ref.set(plan_data)
        
        return {
            "status": "Success",
            "id": doc_ref.id,
            "plan_id": doc_ref.id,
            "data": plan_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ⬇️ 2. 【追加】Firestoreからプラン一覧を取得するAPI
@app.get("/plans")
def get_travel_plans():
    try:
        # plansコレクションから、作成日時の新しい順（降順）にデータを取得
        docs = db.collection("plans").order_by("created_at", direction="DESCENDING").stream()
        
        plans_list = []
        for doc in docs:
            data = doc.to_dict()
            
            # datetimeオブジェクトはそのままJSONにできないので文字列に変換
            if "created_at" in data and data["created_at"]:
                data["created_at"] = data["created_at"].isoformat()
                
            # ドキュメントの固有ID（Firestoreのキー）も一緒にフロントに渡す
            data["id"] = doc.id
            plans_list.append(data)
            
        return plans_list  # 配列形式でフロントに返却
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))