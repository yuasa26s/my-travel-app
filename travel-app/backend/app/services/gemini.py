import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# APIキーの取得
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in .env")

# クライアント初期化
client = genai.Client(api_key=GEMINI_API_KEY)

def generate_travel_plan(destination: str, concept: str) -> dict:
    """
    目的地と旅行のコンセプト（やりたいこと）から、
    詳細なスケジュールとお土産提案を含む旅行プランをJSON形式で生成する
    """
    
    prompt = f"""
    あなたはプロの旅行プランナーです。
    以下の条件をもとに、最高に詳細で魅力的な旅行プランを作成してください。
    
    【目的地】: {destination}
    【旅のテーマ・やりたいこと】: {concept}
    
    必ず指定された構造のJSONフォーマットのみを返却してください。
    余計な挨拶文や、Markdownの ```json などの囲みは一切含めず、純粋なJSON文字列のみを出力してください。
    """

    try:
        # 🤖 モデル指定を最新SDKで確実に認識される 'gemini-2.5-flash' に戻し、
        # 🛠️ 構造化出力（response_schema）で強制指定します
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                # レスポンスのデータ構造を明示的に強制する設定
                response_schema=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "title": types.Schema(type=types.Type.STRING),
                        "destination": types.Schema(type=types.Type.STRING),
                        "summary": types.Schema(type=types.Type.STRING),
                        "schedule": types.Schema(
                            type=types.Type.ARRAY,
                            items=types.Schema(
                                type=types.Type.OBJECT,
                                properties={
                                    "time": types.Schema(type=types.Type.STRING),
                                    "spot": types.Schema(type=types.Type.STRING),
                                    "description": types.Schema(type=types.Type.STRING),
                                },
                                required=["time", "spot", "description"]
                            )
                        ),
                        "souvenirs": types.Schema(
                            type=types.Type.ARRAY,
                            items=types.Schema(
                                type=types.Type.OBJECT,
                                properties={
                                    "name": types.Schema(type=types.Type.STRING),
                                    "reason": types.Schema(type=types.Type.STRING),
                                },
                                required=["name", "reason"]
                            )
                        )
                    },
                    required=["title", "destination", "summary", "schedule", "souvenirs"]
                )
            )
        )
        
        # 文字列として返ってきたJSONをPythonの辞書型に変換
        plan_data = json.loads(response.text)
        return plan_data

    except Exception as e:
        print(f"[ERROR] Gemini APIの呼び出しに失敗しました: {e}")
        # 万が一エラーが発生した際のセーフティネット
        return {
            "title": f"{destination}の旅",
            "destination": destination,
            "summary": "プランの生成に失敗しました。",
            "schedule": [],
            "souvenirs": []
        }