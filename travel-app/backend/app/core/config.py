import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# .env 読み込み
load_dotenv()

cred_path = os.getenv("FIREBASE_CREDENTIAL_PATH")

if not cred_path:
    raise ValueError("FIREBASE_CREDENTIAL_PATH is not set in .env")

# Firebase初期化（重複防止）
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

# Firestoreクライアント作成
db = firestore.client()
