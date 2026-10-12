"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { DemoToolbar } from "./demo-toolbar";
import { Icon } from "./icons";
import { StaffCalendar } from "./staff-calendar";
import { StaffChat } from "./staff-chat";
import { ContentManager } from "./content-manager";

import { contactMethods, contactSummary, initialCustomers, initialTasks, taskStatuses, type ContactMethod, type Customer, type StaffTask } from "@/lib/staff-data";
import { ContactPreferenceFields } from "./contact-preferences";
import { StaffTaskForm } from "./staff-task-form";

const appointments = [
  { title: "仕様・設備のお打合せ", customer: "山田 太郎", staff: "佐藤 美咲", date: "2026-10-17", time: "10:00〜11:00" },
  { title: "間取り・動線のお打合せ", customer: "山田 太郎", staff: "伊藤 彩", date: "2026-10-24", time: "14:00〜15:00" },
];
const navigation = [
  { id: "dashboard", label: "ダッシュボード", icon: "dashboard" },
  { id: "customers", label: "顧客管理", icon: "people" },
  { id: "tasks", label: "タスク管理", icon: "clipboard" },
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
  const [taskEditing, setTaskEditing] = useState<StaffTask | "new" | null>(null);
  const [editing, setEditing] = useState<Customer | "new" | null>(null);
  const [notice, setNotice] = useState("");
  const [approved, setApproved] = useState(false);
  const customerSection = useRef<HTMLElement>(null);

  const mine = customers.filter(customer => customer.staff.includes("佐藤"));
  const visibleCustomers = customers.filter(customer => (owner === "all" || customer.staff.includes("佐藤")) && `${customer.name}${customer.house}${customer.city}`.replaceAll(" ", "").includes(query.replaceAll(" ", "")));
  const priorityOrder: Record<string, number> = { "高": 0, "通常": 1, "低": 2 };
  const visibleTasks = tasks.filter(task => taskFilter === "all" || task.status === taskFilter).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.deadline.localeCompare(b.deadline));
  const go = (next: string) => { setPage(next); setNotice(""); window.scrollTo({ top: 0 }); };
  const showTasks = (filter: string) => { setTaskFilter(filter); go("tasks"); };
  const stats = [
    { label: "未対応のタスク", count: tasks.filter(task => task.status === "未対応").length, action: () => showTasks("未対応"), urgent: true },
    { label: "対応中", count: tasks.filter(task => task.status === "対応中").length, action: () => showTasks("対応中") },
    { label: "予約", count: appointments.length, action: () => go("calendar") },
    { label: "承認・確定待ち", count: approved ? 0 : 1, action: () => go("approvals") },
  ];
  function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const customer: Customer = { id: editing === "new" ? Date.now() : (editing as Customer).id, name: String(data.get("name")).trim(), house: String(data.get("house")).trim(), city: String(data.get("city")).trim(), staff: String(data.get("staff")), progress: String(data.get("progress")), handover: String(data.get("handover")), contactMethods: data.getAll("contactMethods").map(String).filter((value): value is ContactMethod => contactMethods.includes(value as ContactMethod)), contactOnly: data.get("contactOnly") === "on", contactNote: String(data.get("contactNote") ?? "").trim() };
    if (!customer.name || !customer.house || !customer.city) return;
    setCustomers(previous => editing === "new" ? [...previous, customer] : previous.map(item => item.id === customer.id ? customer : item));
    setEditing(null); setNotice("住宅情報を保存しました（モック）。");
  }
  const customerList = <section className="admin-customers" ref={customerSection}>
    <div className="admin-section-heading"><h2>顧客・住宅の一体管理</h2><button className="admin-outline" onClick={() => setEditing("new")}>住宅を登録</button></div>
    <div className="admin-filters"><label className="admin-search"><Icon name="search" /><input aria-label="顧客・住宅を検索" placeholder="顧客名・住宅名・所在地" value={query} onChange={event => setQuery(event.target.value)} /></label><label className="admin-owner">担当者で絞り込み<select value={owner} onChange={event => setOwner(event.target.value)}><option value="mine">自分の担当</option><option value="all">すべての担当</option></select></label></div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>お客様・担当</th><th>住宅・所在地</th><th>進捗</th><th>引き渡し予定／実績</th><th>希望連絡方法</th><th><span className="admin-sr-only">操作</span></th></tr></thead><tbody>{visibleCustomers.map(customer => <tr key={customer.id}><td><button className="admin-text-button" onClick={() => setEditing(customer)}>{customer.name} 様</button><small>{customer.staff}</small></td><td><strong>{customer.house}</strong><small>{customer.city}（サンプル所在地）</small></td><td><span className="admin-badge">{customer.progress}</span></td><td>{customer.handover || "未定"}</td><td className="admin-contact-cell"><span className={`admin-badge ${customer.contactOnly ? "is-urgent" : ""}`}>{contactSummary(customer)}</span>{customer.contactNote && <small>{customer.contactNote}</small>}</td><td><button className="admin-outline" onClick={() => setEditing(customer)}>詳細・編集</button></td></tr>)}</tbody></table>{visibleCustomers.length === 0 && <p className="admin-empty">条件に一致するお客様はいません。</p>}</div>
  </section>;
  function saveTask(task: StaffTask) { setTasks(previous => taskEditing === "new" ? [...previous, task] : previous.map(item => item.id === task.id ? task : item)); if (taskEditing === "new") setTaskFilter("all"); setTaskEditing(null); setNotice("タスクを保存しました。"); }
  const taskList = (items: StaffTask[]) => <div className="admin-task-list">{items.map(task => { const customer = customers.find(item => item.id === task.customerId); return <article key={task.id}><div><div className="admin-task-meta"><span className={`admin-badge ${task.status === "未対応" ? "is-urgent" : ""}`}>{task.status}</span><span className={`admin-badge ${task.priority === "高" ? "is-urgent" : ""}`}>優先度：{task.priority}</span><span>{customer ? `${customer.name} 様` : "社内タスク"}</span></div><h3>{task.title}</h3><p>期限 {task.deadline} ／ {task.staff}</p>{customer && <p className="task-contact-hint">連絡方法：{contactSummary(customer)}</p>}</div><button className="admin-text-button" onClick={() => setTaskEditing(task)}>詳細・編集</button></article>; })}{items.length === 0 && <p className="admin-empty">該当するタスクはありません。</p>}</div>;
  return <div className="staff-shell staff-dashboard">
    {!embedded && <DemoToolbar current="admin" />}
    <header className="staff-header"><button className="staff-brand" onClick={() => go("dashboard")}>米元建設工業 <span>様</span></button><span>顧客・案件管理</span><div className="admin-account"><Icon name="person" /><strong>佐藤 美咲</strong><span>営業</span><button onClick={onLogout}>ログアウト</button></div></header>
    <div className="staff-body"><aside className="staff-sidebar"><nav aria-label="社内管理メニュー">{navigation.map((item, index) => <div key={item.id}>{index === 5 && <p className="admin-nav-group">管理</p>}<button className={page === item.id ? "active" : ""} aria-current={page === item.id ? "page" : undefined} onClick={() => go(item.id)}><Icon name={item.icon} /><span>{item.label}</span>{item.id === "messages" && unreadTotal > 0 && <span className="staff-unread-badge" aria-label={`未読${unreadTotal}件`}>{unreadTotal}</span>}</button></div>)}</nav></aside>
    <main className="admin-main"><div className="admin-page-heading"><h1>{navigation.find(item => item.id === page)?.label}</h1><p>{page === "dashboard" ? "佐藤 美咲さん、今日の対応を確認しましょう。" : page === "tasks" ? "担当者・期限・優先度を確認し、日々のタスクを管理できます。" : page === "calendar" ? "担当チームの予定をカレンダーで確認しましょう。" : page === "messages" ? "お客様ごとの会話を確認し、メッセージを送信できます。" : "担当のお客様と住宅に関する情報を確認できます。"}</p></div>
      {page === "dashboard" && unreadTotal > 0 && <button className="staff-unread-notice" onClick={() => go("messages")}><Icon name="chat" size={20} /><span>お客様から未読のメッセージがあります</span><span className="staff-unread-badge">{unreadTotal}</span><Icon name="arrow" size={16} /></button>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {page === "dashboard" && <><section className="admin-assigned"><div><span>自分が担当しているお客様</span><strong>{mine.length}<small>名</small></strong></div><button className="admin-primary" onClick={() => { setOwner("mine"); setQuery(""); customerSection.current?.scrollIntoView({ behavior: "smooth" }); }}>担当のお客様を見る</button></section><div className="admin-stats">{stats.map(stat => <button key={stat.label} className="admin-stat" onClick={stat.action}><span>{stat.label}</span><strong className={stat.urgent ? "urgent" : ""}>{stat.count}<small>件</small></strong><span>詳細を確認 <Icon name="arrow" size={16} /></span></button>)}</div><div className="admin-dashboard-panels"><section className="admin-panel"><div className="admin-section-heading"><h2>優先して対応するタスク・案件</h2><button className="admin-text-button" onClick={() => showTasks("all")}>すべて見る</button></div>{taskList(tasks.filter(task => task.status !== "完了"))}</section><section className="admin-panel"><h2>直近の予定</h2>{appointments.map(item => <article className="admin-appointment" key={item.title}><h3>{item.title}</h3><p>{item.customer} 様 ／ {item.staff}</p></article>)}<button className="admin-outline" onClick={() => go("calendar")}>カレンダーを見る</button></section></div>{customerList}</>}
      {page === "customers" && customerList}
      {page === "tasks" && <section className="admin-panel"><div className="admin-section-heading"><h2>タスク・対応案件 <span className="admin-muted">{tasks.filter(task => task.status !== "完了").length}件 未完了</span></h2><button className="admin-primary" onClick={() => setTaskEditing("new")}>タスクを追加</button></div><label className="admin-task-filter">対応状況<select value={taskFilter} onChange={event => setTaskFilter(event.target.value)}>{["all", ...taskStatuses].map(value => <option key={value} value={value}>{value === "all" ? "すべて" : value}</option>)}</select></label>{taskList(visibleTasks)}</section>}
      <div hidden={page !== "calendar"}><StaffCalendar appointments={appointments} /></div>
      {page === "approvals" && <section className="admin-panel"><h2>図面の確認・承認</h2><article className="admin-appointment"><span className="admin-badge">{approved ? "承認済み" : "承認待ち"}</span><h3>山田様邸　1階平面図 Ver.3</h3><p>キッチン横の収納を拡張しています。</p><button className="admin-primary" disabled={approved} onClick={() => { setApproved(true); setNotice("図面の承認状態を更新しました（モック）。"); }}>{approved ? "承認済み" : "承認する"}</button></article></section>}
      <div hidden={page !== "messages"}><StaffChat active={page === "messages"} unreadCounts={unreadCounts} onRead={markRead} /></div>
      <div hidden={page !== "contents"}><ContentManager /></div>
      <footer className="admin-footer">米元建設工業 様 ｜ 操作体験モック<br />人物・予約情報はサンプルです。予約・チャットは再読み込みで初期化されます。コンテンツの編集はこのタブ内のみです。</footer>
    </main></div>
    {taskEditing && <Modal title={taskEditing === "new" ? "タスクを追加" : "タスクの詳細・編集"} close={() => setTaskEditing(null)}><StaffTaskForm task={taskEditing === "new" ? null : taskEditing} customers={customers} onSave={saveTask} onCancel={() => setTaskEditing(null)} /></Modal>}
    {editing && <Modal title={editing === "new" ? "住宅を登録" : "顧客・住宅の詳細・編集"} close={() => setEditing(null)}><form className="admin-edit-form" onSubmit={saveCustomer}>{[{ key: "name", label: "お客様名" }, { key: "house", label: "住宅名" }, { key: "city", label: "所在地" }, { key: "staff", label: "担当者" }].map(field => <label key={field.key}>{field.label}<input name={field.key} defaultValue={editing === "new" ? (field.key === "staff" ? "佐藤 美咲" : "") : editing[field.key as "name" | "house" | "city" | "staff"]} required /></label>)}<label>進捗<select name="progress" defaultValue={editing === "new" ? "契約前" : editing.progress}>{["契約前", "設計・仕様", "工事中", "引き渡し済み"].map(progress => <option key={progress}>{progress}</option>)}</select></label><label>引き渡し予定／実績<input type="date" name="handover" defaultValue={editing === "new" ? "" : editing.handover} /></label><ContactPreferenceFields customer={editing === "new" ? undefined : editing} /><button className="admin-primary" type="submit">保存する</button></form></Modal>}
  </div>;
}
