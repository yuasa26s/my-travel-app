"use client";

import { useState, useEffect } from "react";

interface ScheduleItem {
  time: string;
  spot: string;
  description: string;
}

interface SouvenirItem {
  name: string;
  reason: string;
}

// 💡 型定義に budget と companion を追加
interface TravelPlan {
  id: string;
  destination: string;
  days: number;
  purpose: string;
  budget: string;
  companion: string;
  title?: string;
  summary?: string;
  schedule?: ScheduleItem[];
  souvenirs?: SouvenirItem[];
  created_at?: string;
}

export default function Home() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("1");
  const [purpose, setPurpose] = useState("");
  
  // 💡 拡張：予算と同行者のステートを追加
  const [budget, setBudget] = useState("5万円");
  const [companion, setCompanion] = useState("一人旅");
  
  const [message, setMessage] = useState("プランを入力して、作成ボタンを押してください");
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<TravelPlan[]>([]);

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

  const handleDeletePlan = async (id: string) => {
    if (!confirm("この旅行プランを削除してもよろしいですか？")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/plans/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage("🗑️ プランを削除しました。");
        fetchPlans();
      }
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination) {
      alert("目的地を入力してください！");
      return;
    }

    setLoading(true);
    setMessage("🤖 Geminiが条件にピッタリの特製プランを練っています...");

    try {
      const res = await fetch("http://127.0.0.1:8000/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: destination,
          days: parseInt(days, 10),
          purpose: purpose,
          budget: budget,       // 💡 バックエンドへ送信
          companion: companion, // 💡 バックエンドへ送信
        }),
      });

      if (res.ok) {
        setMessage(`🎉 プラン保存成功！`);
        setDestination("");
        setPurpose("");
        fetchPlans();
      } else {
        setMessage("生成エラーが発生しました。");
      }
    } catch (error) {
      console.error(error);
      setMessage("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans p-6 text-black gap-8 print:bg-white print:p-0">
      
      {/* 入力フォーム部分 */}
      <main className="flex flex-col items-center gap-6 rounded-2xl bg-white p-8 shadow-xl max-w-md w-full print:hidden">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-600 mb-2">
            ✈️ AI Travel Planner
          </h1>
          <p className="text-sm text-zinc-500">
            予算や同行者に合わせて最適な計画を作成します
          </p>
        </div>

        <form onSubmit={handleCreatePlan} className="w-full flex flex-col gap-4">
          {/* 目的地 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-700 uppercase">目的地</label>
            <input
              type="text"
              placeholder="例: 北海道、京都、箱根"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 h-11 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* 期間 */}
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

          {/* 💡 追加：同行者セレクトボックス */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-700 uppercase">誰と行く？</label>
            <select
              value={companion}
              onChange={(e) => setCompanion(e.target.value)}
              className="w-full px-4 h-11 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="一人旅">一人旅</option>
              <option value="友達と">友達と</option>
              <option value="カップル・夫婦">カップル・夫婦</option>
              <option value="家族旅行（子ども連れ）">家族旅行（子ども連れ）</option>
              <option value="シニア旅行（親孝行など）">シニア旅行（親孝行など）</option>
            </select>
          </div>

          {/* 💡 追加：予算セレクトボックス */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-700 uppercase">総予算目安（1人あたり）</label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-4 h-11 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="3万円以内">リーズナブル（3万円以内）</option>
              <option value="5万円程度">標準的（5万円程度）</option>
              <option value="10万円程度">少し贅沢（10万円程度）</option>
              <option value="20万円以上">豪華極上旅（20万円以上）</option>
              <option value="設定なし">予算制限なし</option>
            </select>
          </div>

          {/* 旅の目的 */}
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
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:bg-zinc-300 cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                特製プランを練り中...
              </>
            ) : (
              "旅行プランを作成"
            )}
          </button>
        </form>
      </main>

      {/* 表示エリア */}
      <div className="max-w-2xl w-full flex flex-col gap-4 print:max-w-none">
        <h2 className="text-xl font-bold text-zinc-800 px-1 print:hidden">
          🗺️ 保存されたプラン一覧 ({plans.length}件)
        </h2>
        
        {plans.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-4 bg-white rounded-xl border border-dashed border-zinc-300 print:hidden">
            まだプランが登録されていません。
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white p-6 rounded-xl shadow-md border border-zinc-200 flex flex-col gap-4 relative print:shadow-none print:border-none print:p-0 page-break-after">
                
                {/* ヘッダーセクション */}
                <div className="flex justify-between items-start gap-4 border-b border-zinc-100 pb-3">
                  <div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                        {plan.days === 1 ? "日帰り" : `${plan.days - 1}泊${plan.days}日`}
                      </span>
                      {/* 💡 条件タグをUI上に可視化 */}
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                        👥 {plan.companion}
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        💰 {plan.budget}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-xl text-zinc-900 mt-1.5">
                      {plan.title || `📍 ${plan.destination}の旅`}
                    </h3>
                  </div>
                  
                  {/* アクションエリア */}
                  <div className="flex items-center gap-2 print:hidden">
                    <button
                      onClick={handlePrint}
                      className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      🖨️ PDF・印刷
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-zinc-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* 旅の要約・コンセプト */}
                {plan.summary && (
                  <div className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-100 leading-relaxed print:bg-zinc-100">
                    <p className="font-bold text-xs text-zinc-500 mb-1">✨ AIコンシェルジュの要約</p>
                    {plan.summary}
                  </div>
                )}

                {/* 🕒 タイムラインスケジュール表示 */}
                {plan.schedule && plan.schedule.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h4 className="font-bold text-sm text-zinc-800 flex items-center gap-1">🕒 当日のタイムライン</h4>
                    <div className="border-l-2 border-blue-200 pl-4 ml-2 flex flex-col gap-4 my-1">
                      {plan.schedule.map((item, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[21px] top-1.5 bg-blue-500 h-2 w-2 rounded-full ring-4 ring-white"></div>
                          <div className="text-xs font-mono text-blue-600 font-bold">{item.time}</div>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-zinc-900">{item.spot}</span>
                            {!item.spot.includes("駅") && !item.spot.includes("空港") && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plan.destination + " " + item.spot)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 text-[10px] text-blue-500 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded font-medium transition-colors print:hidden"
                              >
                                🗺️ Map
                              </a>
                            )}
                          </div>
                          
                          <div className="text-xs text-zinc-500 mt-0.5">{item.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 🎁 お土産セクション */}
                {plan.souvenirs && plan.souvenirs.length > 0 && (
                  <div className="mt-2 pt-3 border-t border-dashed border-zinc-200 print:border-zinc-300">
                    <h4 className="font-bold text-sm text-zinc-800 mb-2 flex items-center gap-1">🎁 おすすめのお土産</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {plan.souvenirs.map((souvenir, idx) => (
                        <div key={idx} className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 print:bg-zinc-50 print:border-zinc-200">
                          <div className="text-xs font-bold text-amber-900 print:text-zinc-900">🛍️ {souvenir.name}</div>
                          <div className="text-[11px] text-amber-800 mt-0.5 leading-snug print:text-zinc-600">{souvenir.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* フッター */}
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono mt-2 pt-2 border-t border-zinc-100 print:hidden">
                  <span>目的: {plan.purpose || "未設定"}</span>
                  <span>ID: {plan.id}</span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          .page-break-after {
            page-break-after: always;
          }
        }
      `}</style>

    </div>
  );
}