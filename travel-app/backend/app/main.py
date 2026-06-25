import logging
import traceback  # 💡 エラーの発生箇所を特定するために追加
from datetime import datetime

from app.core.config import db
from app.services.gemini import generate_travel_plan
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import firestore as admin_firestore
from google.api_core.exceptions import FailedPrecondition
from pydantic import BaseModel

# ログを出力するための設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# 💡 CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
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
    uid: str


# 💰 💡 追加：出費登録用のデータモデル
class ExpenseCreate(BaseModel):
    memo: str
    amount: int


# 📸 💡 追加：画像URL登録用のデータモデル
class ImageUrlCreate(BaseModel):
    url: str


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

        logger.info(
            f"🤖 Gemini呼び出し開始: destination={plan.destination}"
        )

        # 💡 ここでGeminiの生成処理を実行
        ai_generated_content = generate_travel_plan(
            plan.destination, concept_prompt
        )

        # 💡 ログを追加：Geminiから何が返ってきたかをターミナルに表示
        logger.info(f"📩 Geminiからのレスポンス内容: {ai_generated_content}")

        # 万が一辞書型で返ってきていない場合の簡易防衛策
        if not isinstance(ai_generated_content, dict):
            logger.warning(
                "⚠️ Geminiからの返り値が辞書型（dict）ではありません。ダミーデータを使用します。"
            )
            ai_generated_content = {}

        doc_ref = db.collection("plans").document()
        plan_data = {
            "id": doc_ref.id,
            "uid": plan.uid,
            "destination": plan.destination,
            "days": plan.days,
            "purpose": plan.purpose,
            "budget": plan.budget,
            "companion": plan.companion,
            "title": ai_generated_content.get("title", f"{plan.destination}の旅"),
            "summary": ai_generated_content.get(
                "summary", "プランの生成に失敗しました（データ構造不一致）。"
            ),
            "schedule": ai_generated_content.get("schedule", []),
            "souvenirs": ai_generated_content.get("souvenirs", []),
            "expenses": [],
            "image_urls": [],
            "created_at": datetime.utcnow(),
        }
        doc_ref.set(plan_data)

        plan_data["created_at"] = plan_data["created_at"].isoformat()
        return {"status": "Success", "id": doc_ref.id, "data": plan_data}

    except Exception as e:
        # 💡 エラーの詳細な行数や原因（スタックトレース）をすべてターミナルに出力するように強化！
        error_details = traceback.format_exc()
        logger.error(
            f"❌【プラン作成エラー詳細】:\n{error_details}"
        )
        raise HTTPException(status_code=500, detail=str(e))


# 2. 【拡張】クエリパラメータの uid でFirestoreからその人のデータだけを絞り込んで取得するAPI
@app.get("/plans")
def get_travel_plans(
    uid: str = Query(..., description="ログインユーザーのUID"),
):
    try:
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
        logger.error(f"❌【Firestore インデックス未作成エラー】: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="データベースのインデックス（索引）が不足しています。ターミナルのログに出力されたURLからインデックスを作成してください。",
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
            raise HTTPException(
                status_code=404, detail="指定されたプランが見つかりません。"
            )

        doc_ref.delete()
        return {
            "status": "Success",
            "message": f"Plan {plan_id} has been deleted.",
        }

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
            raise HTTPException(
                status_code=404, detail="指定されたプランが見つかりません。"
            )

        expense_id = f"exp_{int(datetime.utcnow().timestamp())}"
        expense_data = {
            "id": expense_id,
            "memo": expense.memo,
            "amount": expense.amount,
        }

        doc_ref.update(
            {"expenses": admin_firestore.ArrayUnion([expense_data])}
        )
        return {"status": "Success", "data": expense_data}

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"❌【出費追加エラー】: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 5. 📸 💡 追加：特定のプランに画像URLを追加するAPI
@app.post("/plans/{plan_id}/images")
def add_image_url(plan_id: str, image: ImageUrlCreate):
    try:
        doc_ref = db.collection("plans").document(plan_id)
        plan_snap = doc_ref.get()

        if not plan_snap.exists:
            raise HTTPException(
                status_code=404, detail="指定されたプランが見つかりません。"
            )

        doc_ref.update({"image_urls": admin_firestore.ArrayUnion([image.url])})
        return {"status": "Success", "url": image.url}

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"❌【画像URL追加エラー】: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))