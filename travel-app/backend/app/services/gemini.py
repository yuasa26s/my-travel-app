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

# 2026年現在の推奨SDK（google-genai）のクライアント初期化
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
    
    必ず以下の構造のJSONフォーマットのみを返却してください。
    余計な挨拶文や、Markdownの ```json などの囲みは一切含めず、純粋なJSON文字列のみを出力してください。
    
    {{
        "title": "旅行プランのタイトル（例: 贅沢海鮮と絶景を巡る北海道日帰り旅）",
        "destination": "{destination}",
        "summary": "この旅の全体的な見どころやおすすめポイントの要約文（200文字程度）",
        "schedule": [
            {{
                "time": "09:00",
                "spot": "スポット名（例: 函館朝市）",
                "description": "そこでの具体的な過ごし方や、おすすめのメニュー・体験内容（詳細に詳しく書くこと）"
            }},
            {{
                "time": "12:00",
                "spot": "スポット名",
                "description": "詳細な説明"
            }}
        ],
        "souvenirs": [
            {{
                "name": "おすすめのお土産名",
                "reason": "なぜおすすめなのか、どこで買えるかなどの詳細な理由"
            }}
        ]
    }}
    """

    try:
        # 最新の標準モデルである gemini-2.5-flash を使用
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            # ResponseをJSONオブジェクトに固定する設定
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        # 文字列として返ってきたJSONをPythonの辞書型に変換
        plan_data = json.loads(response.text)
        return plan_data

    except Exception as e:
        print(f"[ERROR] Gemini APIの呼び出しに失敗しました: {e}")
        # 万が一パースエラーなどが発生した際のセーフティネット
        return {
            "title": f"{destination}の旅",
            "destination": destination,
            "summary": "プランの生成に失敗しました。",
            "schedule": [],
            "souvenirs": []
        }