"use client";

import { useState } from "react";
import { Icon } from "./icons";

export type StaffAppointment = { title: string; customer: string; staff: string; date: string; time: string };
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
function label(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${month}月${day}日（${weekdays[new Date(year, month - 1, day).getDay()]}）`;
}
export function StaffCalendar({ appointments }: { appointments: StaffAppointment[] }) {
  const [month, setMonth] = useState({ year: 2026, month: 10 });
  const [selected, setSelected] = useState(appointments[0]?.date ?? "2026-10-10");
  const [owner, setOwner] = useState("all");
  const visible = appointments.filter(item => owner === "all" || item.staff === "佐藤 美咲");
  const selectedAppointments = visible.filter(item => item.date === selected);
  const monthPrefix = `${month.year}-${String(month.month).padStart(2, "0")}`;
  const monthly = visible.filter(item => item.date.startsWith(monthPrefix));
  function moveMonth(direction: number) {
    const next = new Date(month.year, month.month - 1 + direction, 1);
    setMonth({ year: next.getFullYear(), month: next.getMonth() + 1 });
    setSelected(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`);
  }
  return <div className="staff-calendar-layout"><section className="admin-panel staff-calendar"><header className="staff-calendar-header"><div className="staff-month-navigation"><button aria-label="前の月" onClick={() => moveMonth(-1)}><span className="staff-arrow-left"><Icon name="arrow" size={18} /></span></button><h2 aria-live="polite">{month.year}年 {month.month}月</h2><button aria-label="次の月" onClick={() => moveMonth(1)}><Icon name="arrow" size={18} /></button></div><button className="admin-outline" onClick={() => { setMonth({ year: 2026, month: 10 }); setSelected("2026-10-10"); }}>デモ基準日</button><select aria-label="予定の担当者で絞り込み" value={owner} onChange={event => setOwner(event.target.value)}><option value="all">担当チーム全員</option><option value="mine">自分の予定</option></select></header><div className="staff-calendar-grid">{weekdays.map((day, index) => <span key={day} className={`staff-weekday weekday-${index}`}>{day}</span>)}{Array.from({ length: new Date(month.year, month.month - 1, 1).getDay() }, (_, index) => <span className="staff-calendar-blank" key={`blank-${index}`} />)}{Array.from({ length: new Date(month.year, month.month, 0).getDate() }, (_, index) => { const date = `${monthPrefix}-${String(index + 1).padStart(2, "0")}`; const events = visible.filter(item => item.date === date); return <button key={date} className={`staff-calendar-day ${date === selected ? "selected" : ""} ${date === "2026-10-10" ? "today" : ""}`} aria-pressed={date === selected} aria-label={`${month.year}年${label(date)}、予定${events.length}件`} onClick={() => setSelected(date)}><span>{index + 1}</span><div>{events.map(item => <span className="staff-calendar-event" key={`${item.title}-${item.time}`}><b>{item.time.split("〜")[0]}</b><span>{item.title}</span></span>)}</div>{events.length > 0 && <i className="staff-calendar-dot" aria-hidden="true" />}</button>; })}</div><p className="staff-calendar-caption">日付を選ぶと予定の詳細が表示されます。デモ基準日：2026年10月10日</p></section><section className="admin-panel staff-day-agenda"><h2>{label(selected)}の予定</h2><span className="admin-muted">{selectedAppointments.length}件</span>{selectedAppointments.length ? selectedAppointments.map(item => <article className="admin-appointment" key={item.title}><span className="admin-badge">{item.time}</span><h3>{item.title}</h3><p>{item.customer} 様</p><p>担当：{item.staff}</p><p>場所：米元建設工業 本社</p></article>) : <p className="admin-empty">この日の予定はありません。</p>}<div className="staff-month-agenda"><h3>今月の予定 <span>{monthly.length}件</span></h3>{monthly.map(item => <button key={item.title} className={item.date === selected ? "selected" : ""} onClick={() => setSelected(item.date)}><small>{label(item.date)}　{item.time}</small><strong>{item.title}</strong><span>{item.customer} 様 ／ {item.staff}</span></button>)}{monthly.length === 0 && <p className="admin-muted">今月の予定はありません。</p>}</div></section></div>;
}
