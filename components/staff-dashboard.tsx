"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { DemoToolbar } from "./demo-toolbar";
import { Icon } from "./icons";
import { StaffCalendar } from "./staff-calendar";
import { StaffChat } from "./staff-chat";
import { ContentManager } from "./content-manager";

type Customer = { id: number; name: string; staff: string; house: string; city: string; progress: string; handover: string };
const initialCustomers: Customer[] = [
  { id: 1, name: "山田 太郎", staff: "佐藤 美咲・伊藤 彩", house: "山田様邸 新築工事", city: "那覇市", progress: "設計・仕様", handover: "2027-03-20" },
  { id: 2, name: "高橋 健", staff: "佐藤 美咲", house: "高橋様邸", city: "浦添市", progress: "引き渡し済み", handover: "2023-06-15" },
  { id: 3, name: "鈴木 花子", staff: "田中 悠", house: "鈴木様邸 新築工事", city: "宜野湾市", progress: "契約前", handover: "" },
];
const initialTasks = [
  { id: 1, status: "未対応", customer: "山田 太郎", title: "キッチン仕様の確認", deadline: "2026-10-10", staff: "佐藤", body: "キッチンの収納と設備仕様について、お客様への確認をお願いします。" },
  { id: 2, status: "対応中", customer: "鈴木 花子", title: "完成見学会の予約について", deadline: "2026-10-12", staff: "田中", body: "完成見学会の参加希望について、予約枠とご希望の日程を確認してください。" },
  { id: 3, status: "社内確認中", customer: "高橋 健", title: "窓の開閉に関する修理依頼", deadline: "2026-10-15", staff: "佐藤", body: "窓が開閉しづらいとのご相談です。施工担当に確認し、訪問日を調整してください。" },
];
const appointments = [
  { title: "仕様・設備のお打合せ", customer: "山田 太郎", staff: "佐藤 美咲", date: "2026-10-17", time: "10:00〜11:00" },
  { title: "間取り・動線のお打合せ", customer: "山田 太郎", staff: "伊藤 彩", date: "2026-10-24", time: "14:00〜15:00" },
];
const navigation = [
  { id: "dashboard", label: "ダッシュボード", icon: "dashboard" },
  { id: "customers", label: "顧客管理", icon: "people" },
  { id: "tasks", label: "対応案件", icon: "clipboard" },
  { id: "calendar", label: "マイカレンダー", icon: "calendar" },
  { id: "messages", label: "チャット", icon: "chat" },
  { id: "approvals", label: "図面・承認管理", icon: "check" },
  { id: "contents", label: "コンテンツ管理", icon: "book" },
];

function Modal({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="admin-dialog" onCancel={close} onClick={event => { if (event.target === event.currentTarget) close(); }}><header><h2>{title}</h2><button aria-label="閉じる" onClick={close}><Icon name="close" /></button></header>{children}</dialog>;
}

export function StaffDashboard({ onLogout, embedded = false }: { onLogout: () => void; embedded?: boolean }) {
  const [page, setPage] = useState("dashboard");
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({ 1: 1, 2: 0, 3: 1 });
  const unreadTotal = Object.values(unreadCounts).reduce((total, count) => total + count, 0);
  const markRead = useCallback((id: number) => setUnreadCounts(previous => previous[id] ? { ...previous, [id]: 0 } : previous), []);
  const [customers, setCustomers] = useState(initialCustomers);
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState("mine");
  const [taskFilter, setTaskFilter] = useState("all");
  const [taskId, setTaskId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Customer | "new" | null>(null);
  const [notice, setNotice] = useState("");
  const [approved, setApproved] = useState(false);
  const customerSection = useRef<HTMLElement>(null);
  const selectedTask = tasks.find(task => task.id === taskId);
  const mine = customers.filter(customer => customer.staff.includes("佐藤"));
  const visibleCustomers = customers.filter(customer => (owner === "all" || customer.staff.includes("佐藤")) && `${customer.name}${customer.house}${customer.city}`.replaceAll(" ", "").includes(query.replaceAll(" ", "")));
  const visibleTasks = tasks.filter(task => taskFilter === "all" || task.status === taskFilter);
  const go = (next: string) => { setPage(next); setNotice(""); window.scrollTo({ top: 0 }); };
  const showTasks = (filter: string) => { setTaskFilter(filter); go("tasks"); };
  const stats = [
    { label: "未対応の案件", count: tasks.filter(task => task.status === "未対応").length, action: () => showTasks("未対応"), urgent: true },
    { label: "対応中", count: tasks.filter(task => task.status === "対応中").length, action: () => showTasks("対応中") },
    { label: "予約", count: appointments.length, action: () => go("calendar") },
    { label: "承認・確定待ち", count: approved ? 0 : 1, action: () => go("approvals") },
  ];
  function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const customer: Customer = { id: editing === "new" ? Date.now() : (editing as Customer).id, name: String(data.get("name")).trim(), house: String(data.get("house")).trim(), city: String(data.get("city")).trim(), staff: String(data.get("staff")), progress: String(data.get("progress")), handover: String(data.get("handover")) };
    if (!customer.name || !customer.house || !customer.city) return;
    setCustomers(previous => editing === "new" ? [...previous, customer] : previous.map(item => item.id === customer.id ? customer : item));
    setEditing(null); setNotice("住宅情報を保存しました（モック）。");
  }
  const customerList = <section className="admin-customers" ref={customerSection}>
    <div className="admin-section-heading"><h2>顧客・住宅の一体管理</h2><button className="admin-outline" onClick={() => setEditing("new")}>住宅を登録</button></div>
    <div className="admin-filters"><label className="admin-search"><Icon name="search" /><input aria-label="顧客・住宅を検索" placeholder="顧客名・住宅名・所在地" value={query} onChange={event => setQuery(event.target.value)} /></label><label className="admin-owner">担当者で絞り込み<select value={owner} onChange={event => setOwner(event.target.value)}><option value="mine">自分の担当</option><option value="all">すべての担当</option></select></label></div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>お客様・担当</th><th>住宅・所在地</th><th>進捗</th><th>引き渡し予定／実績</th><th><span className="admin-sr-only">操作</span></th></tr></thead><tbody>{visibleCustomers.map(customer => <tr key={customer.id}><td><button className="admin-text-button" onClick={() => setEditing(customer)}>{customer.name} 様</button><small>{customer.staff}</small></td><td><strong>{customer.house}</strong><small>{customer.city}（サンプル所在地）</small></td><td><span className="admin-badge">{customer.progress}</span></td><td>{customer.handover || "未定"}</td><td><button className="admin-outline" onClick={() => setEditing(customer)}>詳細・編集</button></td></tr>)}</tbody></table>{visibleCustomers.length === 0 && <p className="admin-empty">条件に一致するお客様はいません。</p>}</div>
  </section>;
  const taskList = (items: typeof tasks) => <div className="admin-task-list">{items.map(task => <article key={task.id}><div><div className="admin-task-meta"><span className={`admin-badge ${task.status === "未対応" ? "is-urgent" : ""}`}>{task.status}</span><span>{task.customer} 様</span></div><h3>{task.title}</h3><p>期限 {task.deadline} ／ {task.staff}</p></div><button className="admin-text-button" onClick={() => setTaskId(task.id)}>対応する</button></article>)}{items.length === 0 && <p className="admin-empty">該当する案件はありません。</p>}</div>;
  return <div className="staff-shell staff-dashboard">
    {!embedded && <DemoToolbar current="admin" />}
    <header className="staff-header"><button className="staff-brand" onClick={() => go("dashboard")}>米元建設工業 <span>様</span></button><span>顧客・案件管理</span><div className="admin-account"><Icon name="person" /><strong>佐藤 美咲</strong><span>営業</span><button onClick={onLogout}>ログアウト</button></div></header>
    <div className="staff-body"><aside className="staff-sidebar"><nav aria-label="社内管理メニュー">{navigation.map((item, index) => <div key={item.id}>{index === 5 && <p className="admin-nav-group">管理</p>}<button className={page === item.id ? "active" : ""} aria-current={page === item.id ? "page" : undefined} onClick={() => go(item.id)}><Icon name={item.icon} /><span>{item.label}</span>{item.id === "messages" && unreadTotal > 0 && <span className="staff-unread-badge" aria-label={`未読${unreadTotal}件`}>{unreadTotal}</span>}</button></div>)}</nav></aside>
    <main className="admin-main"><div className="admin-page-heading"><h1>{navigation.find(item => item.id === page)?.label}</h1><p>{page === "dashboard" ? "佐藤 美咲さん、今日の対応を確認しましょう。" : page === "calendar" ? "担当チームの予定をカレンダーで確認しましょう。" : page === "messages" ? "お客様ごとの会話を確認し、メッセージを送信できます。" : "担当のお客様と住宅に関する情報を確認できます。"}</p></div>
      {page === "dashboard" && unreadTotal > 0 && <button className="staff-unread-notice" onClick={() => go("messages")}><Icon name="chat" size={20} /><span>お客様から未読のメッセージがあります</span><span className="staff-unread-badge">{unreadTotal}</span><Icon name="arrow" size={16} /></button>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {page === "dashboard" && <><section className="admin-assigned"><div><span>自分が担当しているお客様</span><strong>{mine.length}<small>名</small></strong></div><button className="admin-primary" onClick={() => { setOwner("mine"); setQuery(""); customerSection.current?.scrollIntoView({ behavior: "smooth" }); }}>担当のお客様を見る</button></section><div className="admin-stats">{stats.map(stat => <button key={stat.label} className="admin-stat" onClick={stat.action}><span>{stat.label}</span><strong className={stat.urgent ? "urgent" : ""}>{stat.count}<small>件</small></strong><span>詳細を確認 <Icon name="arrow" size={16} /></span></button>)}</div><div className="admin-dashboard-panels"><section className="admin-panel"><div className="admin-section-heading"><h2>優先して対応する案件</h2><button className="admin-text-button" onClick={() => showTasks("all")}>すべて見る</button></div>{taskList(tasks.filter(task => task.status !== "完了"))}</section><section className="admin-panel"><h2>直近の予定</h2>{appointments.map(item => <article className="admin-appointment" key={item.title}><h3>{item.title}</h3><p>{item.customer} 様 ／ {item.staff}</p></article>)}<button className="admin-outline" onClick={() => go("calendar")}>カレンダーを見る</button></section></div>{customerList}</>}
      {page === "customers" && customerList}
      {page === "tasks" && <section className="admin-panel"><label className="admin-task-filter">対応状況<select value={taskFilter} onChange={event => setTaskFilter(event.target.value)}>{["all", "未対応", "対応中", "社内確認中", "完了"].map(value => <option key={value} value={value}>{value === "all" ? "すべて" : value}</option>)}</select></label>{taskList(visibleTasks)}</section>}
      <div hidden={page !== "calendar"}><StaffCalendar appointments={appointments} /></div>
      {page === "approvals" && <section className="admin-panel"><h2>図面の確認・承認</h2><article className="admin-appointment"><span className="admin-badge">{approved ? "承認済み" : "承認待ち"}</span><h3>山田様邸　1階平面図 Ver.3</h3><p>キッチン横の収納を拡張しています。</p><button className="admin-primary" disabled={approved} onClick={() => { setApproved(true); setNotice("図面の承認状態を更新しました（モック）。"); }}>{approved ? "承認済み" : "承認する"}</button></article></section>}
      <div hidden={page !== "messages"}><StaffChat active={page === "messages"} unreadCounts={unreadCounts} onRead={markRead} /></div>
      <div hidden={page !== "contents"}><ContentManager /></div>
      <footer className="admin-footer">米元建設工業 様 ｜ 操作体験モック<br />人物・予約情報はサンプルです。予約・チャットは再読み込みで初期化されます。コンテンツの編集はこのタブ内のみです。</footer>
    </main></div>
    {selectedTask && <Modal title={selectedTask.title} close={() => setTaskId(null)}><p>{selectedTask.customer} 様 ／ 担当 {selectedTask.staff}</p><p>{selectedTask.body}</p><p className="admin-muted">期限：{selectedTask.deadline}</p><label className="admin-form-label">対応状況<select value={selectedTask.status} onChange={event => setTasks(previous => previous.map(task => task.id === selectedTask.id ? { ...task, status: event.target.value } : task))}>{["未対応", "対応中", "社内確認中", "完了"].map(status => <option key={status}>{status}</option>)}</select></label><button className="admin-primary" onClick={() => { setTaskId(null); setNotice("案件の対応状況を更新しました（モック）。"); }}>確認して閉じる</button></Modal>}
    {editing && <Modal title={editing === "new" ? "住宅を登録" : "顧客・住宅の詳細・編集"} close={() => setEditing(null)}><form className="admin-edit-form" onSubmit={saveCustomer}>{[{ key: "name", label: "お客様名" }, { key: "house", label: "住宅名" }, { key: "city", label: "所在地" }, { key: "staff", label: "担当者" }].map(field => <label key={field.key}>{field.label}<input name={field.key} defaultValue={editing === "new" ? (field.key === "staff" ? "佐藤 美咲" : "") : editing[field.key as keyof Customer]} required /></label>)}<label>進捗<select name="progress" defaultValue={editing === "new" ? "契約前" : editing.progress}>{["契約前", "設計・仕様", "工事中", "引き渡し済み"].map(progress => <option key={progress}>{progress}</option>)}</select></label><label>引き渡し予定／実績<input type="date" name="handover" defaultValue={editing === "new" ? "" : editing.handover} /></label><button className="admin-primary" type="submit">保存する</button></form></Modal>}
  </div>;
}
