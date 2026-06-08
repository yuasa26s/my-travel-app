"use client";

import { useState, useEffect } from "react";

// プランデータの型定義
interface TravelPlan {
  id: string;
  destination: string;
  days: number;
  purpose: string;
  created_at?: string;
}

export default function Home() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("1");
  const [purpose, setPurpose] = useState("");
  
  const [message, setMessage] = useState("プランを入力して、作成ボタンを押してください");
  const [loading, setLoading] = useState(false);
  
  // Firestoreから読み込んだプランを保存する配列
  const [plans, setPlans] = useState<TravelPlan[]>([]);

  // 💡 【修正】コメントのシャープ（#）をスラッシュ（//）に直しました！
  // データ一覧をバックエンドから取得する関数
  const fetchPlans = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (error) {
      console.error("データ取得エラー:", error);
    }
  };

  // 画面が最初に開いた時に、自動でデータを1回読み込む
  useEffect(() => {
    fetchPlans();
  }, []);

  // プラン作成（送信）処理
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination) {
      alert("目的地を入力してください！");
      return;
    }

    setLoading(true);
    setMessage("旅行プランをFirestoreに保存中...");

    try {
      const res = await fetch("http://127.0.0.1:8000/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: destination,
          days: parseInt(days, 10),
          purpose: purpose,
        }),
      });

      const data = await res.json();
      setMessage(`🎉 プラン保存成功！ (ID: ${data.id || "Success"})`);
      
      // フォームを空っぽにする
      setDestination("");
      setPurpose("");
      
      // 保存が成功したら、一覧を再読み込みして画面を最新にする！
      fetchPlans();
      
    } catch (error) {
      console.error(error);
      setMessage("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans p-6 text-black gap-8">
      
      {/* 入力フォーム部分 */}
      <main className="flex flex-col items-center gap-6 rounded-2xl bg-white p-8 shadow-xl max-w-md w-full">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-600 mb-2">
            ✈️ AI Travel Planner
          </h1>
          <p className="text-sm text-zinc-500">
            あなたの好みに合わせた旅行計画を作成します
          </p>
        </div>

        <form onSubmit={handleCreatePlan} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-700 uppercase">目的地</label>
            <input
              type="text"
              placeholder="例: 北海道、京都、熱海"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 h-11 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-700 uppercase">期間</label>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full px-4 h-11 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="1">日帰り</option>
              <option value="2">1泊2日</option>
              <option value="3">2泊3日</option>
              <option value="4">3泊4日以上</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-700 uppercase">旅の目的 / やりたいこと</label>
            <textarea
              placeholder="例: 美味しい海鮮を食べたい、温泉でゆっくりしたい"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-3 h-20 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm resize-none"
            />
          </div>

          <div className="w-full rounded-lg bg-blue-50 p-3 font-medium text-xs text-blue-800 border border-blue-100 text-center">
            {message}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:bg-zinc-300 cursor-pointer shadow-md"
          >
            {loading ? "保存中..." : "旅行プランを作成"}
          </button>
        </form>
      </main>

      {/* 保存されたプラン一覧表示エリア */}
      <div className="max-w-md w-full flex flex-col gap-4">
        <h2 className="text-xl font-bold text-zinc-800 px-1">
          🗺️ 保存されたプラン一覧 ({plans.length}件)
        </h2>
        
        {plans.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-4 bg-white rounded-xl border border-dashed border-zinc-300">
            まだプランが登録されていません。
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-lg text-zinc-900">📍 {plan.destination}</span>
                  <span className="text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-600 font-medium">
                    {plan.days === 1 ? "日帰り" : `${plan.days - 1}泊${plan.days}日`}
                  </span>
                </div>
                {plan.purpose && (
                  <p className="text-sm text-zinc-600 bg-zinc-50 p-2 rounded border border-zinc-100">
                    {plan.purpose}
                  </p>
                )}
                <span className="text-[10px] text-zinc-400 font-mono self-end">
                  ID: {plan.id}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}