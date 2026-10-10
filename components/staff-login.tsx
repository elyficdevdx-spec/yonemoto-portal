"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { DemoToolbar } from "./demo-toolbar";
import { StaffDashboard } from "./staff-dashboard";

export function StaffLogin({ embedded = false }: { embedded?: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== "demo1234") {
      setError("デモ用パスワードが違います。demo1234 を入力してください。");
      return;
    }
    setError("");
    setLoggedIn(true);
  }

  if (loggedIn) return <StaffDashboard embedded={embedded} onLogout={() => { setLoggedIn(false); setPassword(""); setError(""); }} />;

  return (
    <div className="staff-shell">
      {!embedded && <DemoToolbar current="admin" />}
      <header className="staff-header">
        <Link href="/" className="staff-brand">米元建設工業 <span>様</span></Link>
        <span>顧客・案件管理</span>
      </header>
      <div className="staff-body">
        <aside className="staff-sidebar" aria-label="社内管理サイドバー" />
        <main className="staff-main">
          <section className="staff-login-card" aria-labelledby="staff-login-title">
            <h1 id="staff-login-title">スタッフログイン</h1>
            <p className="staff-intro">アカウントを選択して、担当のお客様を確認できます。</p>
            <form onSubmit={login}>
              <label htmlFor="staff-account">スタッフ</label>
              <select id="staff-account" disabled={loggedIn}>
                <option value="sato">佐藤 美咲 ／ 営業</option>
              </select>
              <label htmlFor="staff-password">デモ用パスワード</label>
              <input id="staff-password" type="password" autoComplete="off" value={password} onChange={event => { setPassword(event.target.value); setError(""); }} aria-invalid={!!error} aria-describedby={error ? "staff-password-hint staff-error" : "staff-password-hint"} required disabled={loggedIn} />
              <p id="staff-password-hint" className="staff-password-hint">共通デモパスワード：<strong>demo1234</strong></p>
              {error && <p id="staff-error" className="staff-error" role="alert">{error}</p>}
              <button type="submit" className="staff-login-button">ログイン</button>
            </form>
            <p className="staff-disclaimer">架空のスタッフで操作を確認する画面です。本番の認証・アクセス制限は行いません。</p>
          </section>
          <footer className="staff-footer">米元建設工業 様 ｜ 操作体験モック<br />人物・予約情報はサンプルです。施工写真・建物情報はYCS公式サイトより。入力は再読み込みで初期化されます。</footer>
        </main>
      </div>
    </div>
  );
}
