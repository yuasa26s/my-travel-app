"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/trips");
    } catch (error) {
      console.error("ログイン失敗:", error);
      alert("ログインに失敗しました");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-6 text-2xl font-bold text-gray-700">ログイン</h1>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-600">
            メールアドレス
          </label>
          <input
            type="email"
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm text-gray-600">パスワード</label>
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-sky-400 py-2 font-semibold text-white hover:bg-sky-500 transition"
        >
          ログイン
        </button>
      </form>
    </div>
  );
}
