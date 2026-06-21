from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.core.config import db
from datetime import datetime
from app.services.gemini import generate_travel_plan

# ★ Firestore固有の前提条件エラーや配列操作のためにインポートを追加
from google.api_core.exceptions import FailedPrecondition
from firebase_admin import firestore as admin_firestore
import logging

# ログを出力するための設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 💡 データモデルに uid を追加
class PlanCreate(BaseModel):
    destination: str
    days: int
    purpose: str
    budget: str
    companion: str
    uid: str          # 追加: どのユーザーが作成したかを識別するID

# 💰 💡 追加：出費登録用のデータモデル
class ExpenseCreate(BaseModel):
    memo: str     # 例: "ホテル代"
    amount: int   # 例: 15000

@app.get("/")
def read_root():
    return {"message": "Hello Travel App!"}

# 1. プランを生成して特定のユーザーデータとしてFirestoreに保存するAPI
@app.post("/plans")
def create_travel_plan(plan: PlanCreate):
    try:
        concept_prompt = (
            f"{plan.days}日間の旅行。\n"
            f"旅の目的: {plan.purpose}\n"
            f"同行者: {plan.companion}\n"
            f"総予算目安: {plan.budget}"
        )
        
        ai_generated_content = generate_travel_plan(plan.destination, concept_prompt)
        
        doc_ref = db.collection("plans").document()
        plan_data = {
            "id": doc_ref.id,
            "uid": plan.uid,             # 💡 ユーザーIDをFirestoreのフィールドに格納！
            "destination": plan.destination,
            "days": plan.days,
            "purpose": plan.purpose,
            "budget": plan.budget,
            "companion": plan.companion,
            "title": ai_generated_content.get("title", f"{plan.destination}の旅"),
            "summary": ai_generated_content.get("summary", ""),
            "schedule": ai_generated_content.get("schedule", []),
            "souvenirs": ai_generated_content.get("souvenirs", []),
            "expenses": [],              # 💰 💡 初回生成時に空の出費配列を用意しておく
            "created_at": datetime.utcnow()
        }
        doc_ref.set(plan_data)
        
        plan_data["created_at"] = plan_data["created_at"].isoformat()
        return {"status": "Success", "id": doc_ref.id, "data": plan_data}
    except Exception as e:
        logger.error(f"❌【プラン作成エラー】: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 2. 【拡張】クエリパラメータの uid でFirestoreからその人のデータだけを絞り込んで取得するAPI
@app.get("/plans")
def get_travel_plans(uid: str = Query(..., description="ログインユーザーのUID")):
    try:
        # 💡 .where("uid", "==", uid) を使ってユーザー個人のデータだけに絞り込む（マルチユーザー対応）
        docs = (
            db.collection("plans")
            .where("uid", "==", uid)
            .order_by("created_at", direction="DESCENDING")
            .stream()
        )
        
        plans_list = []
        for doc in docs:
            data = doc.to_dict()
            if "created_at" in data and data["created_at"]:
                if isinstance(data["created_at"], datetime):
                    data["created_at"] = data["created_at"].isoformat()
                else:
                    data["created_at"] = str(data["created_at"])
                
            data["id"] = doc.id
            plans_list.append(data)
            
        return plans_list
        
    except FailedPrecondition as e:
        # ★ 今後、別の複合クエリなどを追加してインデックスが足りなくなった場合はここに引っかかります
        logger.error(f"❌【Firestore インデックス未作成エラー】: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="データベースのインデックス（索引）が不足しています。ターミナルのログに出力されたURLからインデックスを作成してください。"
        )
    except Exception as e:
        logger.error(f"❌【予期せぬデータ取得エラー】: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 3. 指定したプランを物理削除するAPI
@app.delete("/plans/{plan_id}")
def delete_travel_plan(plan_id: str):
    try:
        doc_ref = db.collection("plans").document(plan_id)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=404, detail="指定されたプランが見つかりません。")
            
        doc_ref.delete()
        return {"status": "Success", "message": f"Plan {plan_id} has been deleted."}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"❌【プラン削除エラー】: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 4. 💰 💡 追加：特定のプランに出費を追加するAPI
@app.post("/plans/{plan_id}/expenses")
def add_expense(plan_id: str, expense: ExpenseCreate):
    try:
        doc_ref = db.collection("plans").document(plan_id)
        plan_snap = doc_ref.get()
        
        if not plan_snap.exists:
            raise HTTPException(status_code=404, detail="指定されたプランが見つかりません。")
            
        # 削除・特定時に利用するユニークIDをタイムスタンプベースで簡易生成
        expense_id = f"exp_{int(datetime.utcnow().timestamp())}"
        
        expense_data = {
            "id": expense_id,
            "memo": expense.memo,
            "amount": expense.amount
        }
        
        # ArrayUnionを使って既存の配列を壊さず末尾に安全にプッシュ追加する
        doc_ref.update({
            "expenses": admin_firestore.ArrayUnion([expense_data])
        })
        
        return {"status": "Success", "data": expense_data}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"❌【出費追加エラー】: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))