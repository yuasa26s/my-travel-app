from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.core.config import db
from datetime import datetime
# 新しく作成した Gemini サービスをインポート
from app.services.gemini import generate_travel_plan

app = FastAPI()

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 💡 フロントエンドからの入力データ構造に「予算」と「同行者」を拡張
class PlanCreate(BaseModel):
    destination: str
    days: int
    purpose: str
    budget: str       # 追加: 例 "5万円程度", "3万円以内"
    companion: str    # 追加: 例 "一人旅", "家族旅行（子ども連れ）"

@app.get("/")
def read_root():
    return {"message": "Hello Travel App!"}

# 1. データを生成してFirestoreに保存するAPI（予算・同行者対応の肉付け版）
@app.post("/plans")
def create_travel_plan(plan: PlanCreate):
    try:
        # --- [肉付け] 予算や同行者を織り交ぜて、Gemini用のプロンプトを動的にビルド ---
        # これにより、app/services/gemini.py 側のプロンプトへ強力な制約条件として伝播します
        concept_prompt = (
            f"{plan.days}日間の旅行。\n"
            f"旅の目的: {plan.purpose}\n"
            f"同行者: {plan.companion} (※このメンバー構成に適した移動ペースやスポットを考慮してください)\n"
            f"総予算目安: {plan.budget} (※この予算感に合う観光・食事のトーンにしてください)"
        )
        
        # 既存のロジックを活かしてGeminiを呼び出し
        ai_generated_content = generate_travel_plan(plan.destination, concept_prompt)
        
        # --- Firestoreへの保存処理 ---
        doc_ref = db.collection("plans").document()
        plan_data = {
            "destination": plan.destination,
            "days": plan.days,
            "purpose": plan.purpose,
            "budget": plan.budget,       # 💡 新しい条件もFirestoreに保存
            "companion": plan.companion, # 💡 新しい条件もFirestoreに保存
            
            # Geminiが生成したリッチなデータを丸ごとマージして保存
            "title": ai_generated_content.get("title", f"{plan.destination}の旅"),
            "summary": ai_generated_content.get("summary", ""),
            "schedule": ai_generated_content.get("schedule", []),
            "souvenirs": ai_generated_content.get("souvenirs", []),
            "created_at": datetime.utcnow()
        }
        doc_ref.set(plan_data)
        
        # フロントエンドが扱いやすいように、ISO形式に変換してレスポンスに含める
        plan_data["created_at"] = plan_data["created_at"].isoformat()
        
        return {
            "status": "Success",
            "id": doc_ref.id,
            "plan_id": doc_ref.id,
            "data": plan_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 2. Firestoreからプラン一覧を取得するAPI
@app.get("/plans")
def get_travel_plans():
    try:
        docs = db.collection("plans").order_by("created_at", direction="DESCENDING").stream()
        
        plans_list = []
        for doc in docs:
            data = doc.to_dict()
            
            if "created_at" in data and data["created_at"]:
                # 既に文字列の場合はスキップし、datetimeオブジェクトの場合のみ変換
                if isinstance(data["created_at"], datetime):
                    data["created_at"] = data["created_at"].isoformat()
                else:
                    data["created_at"] = str(data["created_at"])
                
            data["id"] = doc.id
            plans_list.append(data)
            
        return plans_list
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 3. 指定したプランを物理削除するAPI
@app.delete("/plans/{plan_id}")
def delete_travel_plan(plan_id: str):
    try:
        doc_ref = db.collection("plans").document(plan_id)
        
        # ドキュメントが存在するかチェック
        if not doc_ref.get().exists:
            raise HTTPException(status_code=404, detail="指定されたプランが見つかりません。")
            
        # 削除実行
        doc_ref.delete()
        return {"status": "Success", "message": f"Plan {plan_id} has been deleted."}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))