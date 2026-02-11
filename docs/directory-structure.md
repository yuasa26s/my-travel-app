■ディレクトリ構成
travel-app/
├── frontend/ (Next.js) # メンバーA主導：画面・UI
│ ├── src/
│ │ ├── app/ # ルーティング（login, postsなど）
│ │ ├── components/ # UI部品（shadcn/uiなど）
│ │ ├── hooks/ # API呼び出し用（useSWRやReact Query用）
│ │ ├── lib/ # Firebase SDK設定、APIクライアント
│ │ └── types/ # TypeScriptの型定義（APIレスポンス用）
│ └── .env.local # Firebase設定値、バックエンドURL
│
├── backend/ (FastAPI) # メンバーB・C主導：API・DB・認証
│ ├── app/
│ │ ├── main.py # アプリ起動エントリーポイント（CORS設定など）
│ │ ├── routers/ # エンドポイント（機能ごとに分割）
│ │ │ ├── auth.py # ユーザー認証・トークン検証
│ │ │ ├── posts.py # しおりCRUD（作成・取得・編集）
│ │ │ └── expenses.py # 出費計算・一覧
│ │ ├── services/ # ビジネスロジック（Firestoreへの具体的な書き込み処理）
│ │ ├── schemas/ # Pydanticモデル（リクエスト・レスポンスの型定義）
│ │ └── core/ # Firebase Admin SDK初期設定、共通設定
│ ├── tests/ # テスト用スクリプト
│ ├── requirements.txt # Pythonパッケージリスト
│ └── .env # Firebaseサービスアカウント情報
│
└── firebase/ # (任意) Firebase Security Rulesなどを管理
