"use client";

import { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { auth } from "../lib/firebase"; 

interface ScheduleItem {
  time: string;
  spot: string;
}

interface TripPlan {
  id: string;
  title: string;
  destination: string;
  summary?: string;
  purpose?: string;
  budget?: string;
  companion?: string;
  days?: number;
  schedule?: ScheduleItem[];
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  
  // フォーム用の状態管理
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(1);
  const [purpose, setPurpose] = useState("");
  const [budget, setBudget] = useState("");
  const [companion, setCompanion] = useState("");
  const [generating, setGenerating] = useState(false);

  // ★ 詳細表示モーダル用の状態管理
  const [selectedPlan, setSelectedPlan] = useState<TripPlan | null>(null);

  // 1. Firebaseのログイン状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchTripPlans();
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. バックエンドから旅行プラン一覧を取得する処理
  const fetchTripPlans = async () => {
    if (!auth.currentUser?.uid) return;

    try {
      const uid = auth.currentUser.uid;
      const res = await fetch(`http://127.0.0.1:8000/plans?uid=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setTripPlans(data);
      }
    } catch (error) {
      console.error("データ取得失敗:", error);
    }
  };

  // 3. Googleログイン処理
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("ログインエラー:", error);
    }
  };

  // 4. ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTripPlans([]);
      setSelectedPlan(null);
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  // 5. 新しい旅行プランを生成・保存する処理 (POST /plans)
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser?.uid) return;
    
    setGenerating(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          days,
          purpose,
          budget,
          companion,
          uid: auth.currentUser.uid,
        }),
      });

      if (res.ok) {
        alert("AIが素敵な旅のしおりを生成しました！");
        // フォームをリセット
        setDestination("");
        setPurpose("");
        setBudget("");
        setCompanion("");
        setDays(1);
        // 一覧を再取得
        fetchTripPlans();
      } else {
        alert("プランの生成に失敗しました。");
      }
    } catch (error) {
      console.error("生成エラー:", error);
      alert("通信エラーが発生しました。");
    } finally {
      setGenerating(false);
    }
  };

  // 6. プランの削除処理
  const handleDeletePlan = async (id: string, e: React.MouseEvent) => {
    // モーダルが開くのを防ぐ
    e.stopPropagation();
    if (!confirm("この旅行プランを削除してもよろしいですか？")) return;
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/plans/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTripPlans(tripPlans.filter((plan) => plan.id !== id));
        if (selectedPlan?.id === id) setSelectedPlan(null);
        alert("削除しました。");
      } else {
        alert("削除に失敗しました。");
      }
    } catch (error) {
      console.error("削除エラー:", error);
      alert("通信エラーが発生しました。");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-sky-100">
        <p className="text-gray-500 text-lg">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-100 pb-12">
      {/* ヘッダー */}
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-sky-600 flex items-center gap-2">
          ✈️ Travel App
        </h1>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{user.displayName} さん</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Googleでログイン
            </button>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8 max-w-4xl flex flex-col gap-8">
        {!user ? (
          /* 未ログイン時 */
          <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl border border-gray-100 mt-10">
            <div className="text-4xl mb-4">✈️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">あなただけの旅のしおりを作ろう</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              ログインすると、AIを使った旅行プランの自動生成や、過去に作成したあなた専用のしおりをいつでも管理できるようになります。
            </p>
            <button
              onClick={handleLogin}
              className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white shadow-md hover:bg-blue-500 transition-colors"
            >
              Googleアカウントで始める
            </button>
          </div>
        ) : (
          /* ログイン済み */
          <>
            {/* フォームセクション */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-50">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                ✨ 新しい旅行プランをAIで生成する
              </h2>
              <form onSubmit={handleCreatePlan} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">目的地</label>
                  <input
                    type="text"
                    required
                    placeholder="例: 北海道、京都、沖縄"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">日数</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">旅の目的</label>
                  <input
                    type="text"
                    placeholder="例: 温泉、食べ歩き、観光"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">同行者</label>
                  <input
                    type="text"
                    placeholder="例: 一人旅、家族、友達、カップル"
                    value={companion}
                    onChange={(e) => setCompanion(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-sky-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">総予算目安</label>
                  <input
                    type="text"
                    placeholder="例: 5万円、10万円以内"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-sky-500"
                  />
                </div>
                <div className="md:col-span-2 mt-2">
                  <button
                    type="submit"
                    disabled={generating}
                    className={`w-full rounded-xl py-3 font-semibold text-white shadow-md transition-colors ${
                      generating ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                    }`}
                  >
                    {generating ? "🪄 AIがしおりを生成中（数十秒かかります）..." : "✈️ AI旅行プランを生成して保存"}
                  </button>
                </div>
              </form>
            </div>

            {/* 一覧セクション */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-50">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🗂️ 作成済みの旅行プラン</h2>
              {tripPlans.length === 0 ? (
                <p className="text-gray-400 text-center py-8 text-sm">
                  まだ保存された旅行プランがありません。<br />上のフォームから最初のしおりを作ってみましょう！
                </p>
              ) : (
                <div className="grid gap-4">
                  {tripPlans.map((plan) => (
                    /* ★ カード全体をクリック可能にし、ホバーで少し浮くエフェクトを追加 */
                    <div 
                      key={plan.id} 
                      onClick={() => setSelectedPlan(plan)}
                      className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex justify-between items-start shadow-sm cursor-pointer hover:bg-sky-50/40 hover:border-sky-200 transition-all group"
                    >
                      <div className="flex-1">
                        {/* ★ タイトルにホバー時アンダーラインがつくように変更 */}
                        <h3 className="font-bold text-base text-gray-800 mb-1 group-hover:text-sky-600 transition-colors">
                          {plan.title || `${plan.destination}の旅`}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed mb-2">
                          {plan.summary}
                        </p>
                        {plan.schedule && plan.schedule.length > 0 && (
                          <div className="bg-white rounded-lg p-3 text-xs border border-gray-200/60">
                            <span className="font-bold text-sky-600 block mb-1">🕒 スケジュール抜粋:</span>
                            {plan.schedule.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="text-gray-600">
                                {item.time} - {item.spot}
                              </div>
                            ))}
                            {plan.schedule.length > 2 && <span className="text-gray-400 text-[10px]">他 {plan.schedule.length - 2} 件...（クリックで詳細を表示）</span>}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDeletePlan(plan.id, e)}
                        className="ml-4 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ★ 詳細表示用のポップアップモーダル UI */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col">
            {/* モーダルヘッダー */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">📋 しおり詳細</h3>
              <button 
                onClick={() => setSelectedPlan(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* モーダルボディ */}
            <div className="p-6 flex flex-col gap-6 overflow-y-auto">
              <div>
                <h2 className="text-2xl font-bold text-sky-600 mb-2">
                  {selectedPlan.title || `${selectedPlan.destination}の旅`}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed bg-sky-50/50 rounded-xl p-4 border border-sky-100/50">
                  {selectedPlan.summary}
                </p>
              </div>

              {/* 基本情報タグ */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
                  <span className="block text-gray-400 font-bold mb-0.5">📍 目的地</span>
                  <span className="text-gray-700 font-semibold text-sm">{selectedPlan.destination}</span>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
                  <span className="block text-gray-400 font-bold mb-0.5">📅 日数</span>
                  <span className="text-gray-700 font-semibold text-sm">{selectedPlan.days} 日間</span>
                </div>
                {selectedPlan.companion && (
                  <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
                    <span className="block text-gray-400 font-bold mb-0.5">👥 同行者</span>
                    <span className="text-gray-700 font-semibold text-sm">{selectedPlan.companion}</span>
                  </div>
                )}
                {selectedPlan.budget && (
                  <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
                    <span className="block text-gray-400 font-bold mb-0.5">💰 予算目安</span>
                    <span className="text-gray-700 font-semibold text-sm">{selectedPlan.budget}</span>
                  </div>
                )}
              </div>

              {/* 詳細スケジュール一覧 */}
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                  🗺️ 旅のスケジュール
                </h4>
                {selectedPlan.schedule && selectedPlan.schedule.length > 0 ? (
                  <div className="relative border-l-2 border-sky-200 ml-2.5 pl-5 flex flex-col gap-4">
                    {selectedPlan.schedule.map((item, idx) => (
                      <div key={idx} className="relative">
                        {/* タイムラインの丸ぽち */}
                        <div className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-sky-500 border-2 border-white shadow-sm" />
                        <span className="text-xs font-bold text-sky-600 block mb-0.5">{item.time}</span>
                        <p className="text-sm font-semibold text-gray-800">{item.spot}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs italic">スケジュール情報がありません。</p>
                )}
              </div>
            </div>

            {/* モーダルお尻の閉じるボタン */}
            <div className="border-t border-gray-100 px-6 py-4 flex justify-end bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => setSelectedPlan(null)}
                className="rounded-xl bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}