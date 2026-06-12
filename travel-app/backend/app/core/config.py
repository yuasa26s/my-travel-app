import os
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# .env 読み込み
load_dotenv()

# config.pyがある位置から見た「backend/」のルートディレクトリを絶対パスで取得
BASE_DIR = Path(__file__).resolve().parent.parent.parent

cred_path_env = os.getenv("FIREBASE_CREDENTIAL_PATH")

if not cred_path_env:
    raise ValueError("FIREBASE_CREDENTIAL_PATH is not set in .env")

# 相対パスを、BASE_DIRを基準にした絶対パスに強制変換
cred_path = Path(cred_path_env)
if not cred_path.is_absolute():
    cred_path = BASE_DIR / cred_path

print(f"[DEBUG] Firebase 認証鍵の参照パス: {cred_path}")

if not cred_path.exists():
    raise FileNotFoundError(
        f"Firebaseの鍵ファイルが見つかりません。配置場所を確認してください: {cred_path}"
    )

# Firebase初期化
if not firebase_admin._apps:
    cred = credentials.Certificate(str(cred_path))
    firebase_admin.initialize_app(cred)

db = firestore.client()