import firebase_admin
from firebase_admin import credentials, firestore
import os

# 1. パスをしっかり作る
base_dir = os.path.dirname(os.path.abspath(__file__)) # app/core
# backend直下にある serviceAccountKey.json を指す
key_path = os.path.normpath(os.path.join(base_dir, "../../serviceAccountKey.json"))

# 2. 読み込む
cred = credentials.Certificate(key_path)

# 3. 初期化
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()
print("🎉 ついにFirebaseとの接続に成功しました！")