"use client";

import { useEffect, useRef, useState } from "react";
import type { CustomerStage } from "@/lib/customer-stage";
import { Icon } from "./icons";

export type Reservation = { id: number; title: string; date: string; time: string; staff: string; place: string; allowedDates?: string[]; allowedTimes?: string[] };
export type BookingDraft = { title: string; id?: number; allowedDates?: string[]; allowedTimes?: string[]; place?: string };
export const DEMO_TODAY = "2026-10-10";
export const TIME_SLOTS = ["10:00", "14:00", "16:00"];
export function dateParts(date: string) { const [year, month, day] = date.split("-").map(Number); return { year, month, day }; }
export function dateLabel(date: string) { const { year, month, day } = dateParts(date); return `${year}年${month}月${day}日（${["日", "月", "火", "水", "木", "金", "土"][new Date(year, month - 1, day).getDay()]}）`; }
export function endTime(time: string) { return `${String(Number(time.split(":")[0]) + 1).padStart(2, "0")}:00`; }
export function initialReservations(stage: CustomerStage): Reservation[] {
  const after = stage === "downstream";
  return [
    { id: 1, title: after ? "お引き渡し後1年点検" : stage === "upstream" ? "家づくり個別相談会" : "仕様・設備のお打合せ", date: after ? "2026-11-08" : "2026-10-17", time: "10:00", staff: "佐藤 美咲", place: after ? "山田様邸" : "米元建設工業 本社" },
    { id: 2, title: after ? "住まいのメンテナンス相談" : stage === "upstream" ? "土地・資金計画のご相談" : "間取り・動線のお打合せ", date: after ? "2026-11-15" : "2026-10-24", time: "14:00", staff: "伊藤 彩", place: "米元建設工業 本社" },
  ];
}

function ReservationCard({ reservation, change, details }: { reservation: Reservation; change: () => void; details: () => void }) {
  const { month, day } = dateParts(reservation.date);
  return <article className="reservation-card"><div className="reservation-card-top"><span>次回の予約</span><b>予約確定</b></div><div className="reservation-date"><strong>{month}<small>月</small>{day}<small>日</small></strong><span>{dateLabel(reservation.date).slice(-2, -1)}曜日</span><b>{reservation.time}<small>〜{endTime(reservation.time)}</small></b></div><h3>{reservation.title}</h3><p>{reservation.place} ／ {reservation.staff}</p><div className="reservation-actions"><button onClick={change}>日程を変更</button><button onClick={details}>予約内容を見る</button></div></article>;
}

export function ReservationCarousel({ reservations, change, details }: { reservations: Reservation[]; change: (reservation: Reservation) => void; details: (reservation: Reservation) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  function slide(index: number) { const card = track.current?.children[index] as HTMLElement | undefined; if (card && track.current) track.current.scrollTo({ left: card.offsetLeft, behavior: "smooth" }); }
  return <section className="reservation-carousel" aria-label="次回のご予約" aria-roledescription="カルーセル"><div className="reservation-track" ref={track} tabIndex={0} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); slide(Math.max(0, Math.min(reservations.length - 1, active + (event.key === "ArrowRight" ? 1 : -1)))); } }} onScroll={event => { const target = event.currentTarget; setActive(Math.round(target.scrollLeft / (target.clientWidth + 14))); }}>{reservations.map((reservation, index) => <div className="reservation-slide" key={reservation.id} role="group" aria-roledescription="スライド" aria-label={`${index + 1} / ${reservations.length}`}><ReservationCard reservation={reservation} change={() => change(reservation)} details={() => details(reservation)} /></div>)}</div><div className="reservation-slider-controls"><button aria-label="前の予約" disabled={active === 0} onClick={() => slide(active - 1)}><span className="reservation-prev"><Icon name="arrow" size={16} /></span></button><div className="reservation-dots">{reservations.map((reservation, index) => <button key={reservation.id} className={active === index ? "active" : ""} aria-label={`${index + 1}件目の予約を表示`} aria-current={active === index ? "true" : undefined} onClick={() => slide(index)} />)}</div><span aria-live="polite">{Math.min(active + 1, reservations.length)} / {reservations.length}</span><button aria-label="次の予約" disabled={active >= reservations.length - 1} onClick={() => slide(active + 1)}><Icon name="arrow" size={16} /></button></div></section>;
}

export function ReservationDetails({ reservation, close, change }: { reservation: Reservation; close: () => void; change: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="reservation-dialog" onCancel={close} onClick={event => { if (event.target === event.currentTarget) close(); }}><header><h2>予約内容</h2><button onClick={close} aria-label="閉じる"><Icon name="close" /></button></header><span className="booking-confirmed-badge">予約確定</span><h3>{reservation.title}</h3><dl><div><dt>日時</dt><dd>{dateLabel(reservation.date)}<br />{reservation.time}〜{endTime(reservation.time)}</dd></div><div><dt>場所</dt><dd>{reservation.place}</dd></div><div><dt>担当者</dt><dd>{reservation.staff}</dd></div></dl><button className="booking-primary" onClick={change}>カレンダーで日程を変更</button><p className="booking-demo-note">操作体験モックです。実際の予約は行われません。</p></dialog>;
}

export function BookingPage({ reservations, draft, save, change, details, home }: { reservations: Reservation[]; draft: BookingDraft; save: (reservation: Reservation) => void; change: (reservation: Reservation) => void; details: (reservation: Reservation) => void; home: () => void }) {
  const editing = reservations.find(reservation => reservation.id === draft.id);
  const [title, setTitle] = useState(draft.title);
  const initialDate = editing?.date ?? draft.allowedDates?.[0] ?? DEMO_TODAY;
  const initialParts = dateParts(initialDate);
  const [month, setMonth] = useState({ year: initialParts.year, month: initialParts.month });
  const [date, setDate] = useState(editing?.date ?? "");
  const [time, setTime] = useState(editing?.time ?? "");
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);
  const [error, setError] = useState("");
  const timeSlots = draft.allowedTimes ?? TIME_SLOTS;
  const firstWeekday = new Date(month.year, month.month - 1, 1).getDay();
  const days = new Date(month.year, month.month, 0).getDate();
  const dateKey = (day: number) => `${month.year}-${String(month.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const slotTaken = (day: string, slot: string) => reservations.some(reservation => reservation.id !== draft.id && reservation.date === day && reservation.time === slot);
  const dayAvailable = (day: string) => day >= DEMO_TODAY && (!draft.allowedDates || draft.allowedDates.includes(day)) && timeSlots.some(slot => !slotTaken(day, slot));
  const previousDisabled = month.year === 2026 && month.month === 10;
  function moveMonth(direction: number) { const next = new Date(month.year, month.month - 1 + direction, 1); setMonth({ year: next.getFullYear(), month: next.getMonth() + 1 }); }
  return <section className="booking-page page-section"><div className="page-title"><h1>予約・打合せ</h1><span>日付と時間を選んで予約</span></div><div className="booking-layout"><section className="booking-form-card"><h2>{draft.id ? "予約の日程を変更" : "新しい予約"}</h2><p className="booking-description">カレンダーからご希望の日付を選択してください。</p>{confirmed ? <div className="booking-success" role="status"><Icon name="check" size={32} /><h3>{draft.id ? "予約日程を変更しました" : "予約を受け付けました"}</h3><strong>{confirmed.title}</strong><p>{dateLabel(confirmed.date)}<br />{confirmed.time}〜{endTime(confirmed.time)}</p><p>予約一覧とホームに反映しました。</p><button className="booking-primary" onClick={home}>ホームで予約を確認</button><p className="booking-demo-note">モック内の予約です。再読み込みで初期化されます。</p></div> : <form onSubmit={event => { event.preventDefault(); if (!date || !time || !dayAvailable(date) || !timeSlots.includes(time) || slotTaken(date, time)) { setError("予約できる日付と時間を選択してください。"); return; } const reservation: Reservation = { id: draft.id ?? Date.now(), title, date, time, staff: editing?.staff ?? "佐藤 美咲", place: draft.place ?? editing?.place ?? "米元建設工業 本社", allowedDates: draft.allowedDates, allowedTimes: draft.allowedTimes }; save(reservation); setConfirmed(reservation); }}><label className="booking-type">予約内容{draft.allowedDates || draft.place ? <strong>{title}</strong> : <select value={title} onChange={event => setTitle(event.target.value)}>{Array.from(new Set([draft.title, "仕様・設備のお打合せ", "間取り・動線のお打合せ", "家づくり個別相談会", "土地・資金計画のご相談", "住まいの設備相談", "お引き渡し後1年点検", "住まいのメンテナンス相談"])).map(item => <option key={item}>{item}</option>)}</select>}</label><div className="booking-calendar"><header><button type="button" aria-label="前の月" disabled={previousDisabled} onClick={() => moveMonth(-1)}><span className="reservation-prev"><Icon name="arrow" size={18} /></span></button><h3 aria-live="polite">{month.year}年 {month.month}月</h3><button type="button" aria-label="次の月" onClick={() => moveMonth(1)}><Icon name="arrow" size={18} /></button></header><div className="booking-calendar-grid">{["日", "月", "火", "水", "木", "金", "土"].map((day, index) => <span className={`booking-weekday day-${index}`} key={day}>{day}</span>)}{Array.from({ length: firstWeekday }, (_, index) => <span key={`blank-${index}`} />)}{Array.from({ length: days }, (_, index) => { const key = dateKey(index + 1); const available = dayAvailable(key); return <button type="button" key={key} className={`${date === key ? "selected" : ""} ${key === DEMO_TODAY ? "is-today" : ""}`} disabled={!available} aria-label={`${dateLabel(key)}${available ? "・予約可能" : "・予約不可"}`} aria-pressed={date === key} onClick={() => { setDate(key); setTime(""); setError(""); }}><span>{index + 1}</span><i aria-hidden="true" /></button>; })}</div><p className="booking-calendar-legend"><i />予約可能 <span>デモ基準日：2026年10月10日</span></p></div><fieldset className="booking-times"><legend>{date ? `${dateLabel(date)}の時間` : "日付を選ぶと時間を選択できます"}</legend><div>{timeSlots.map(slot => <label key={slot} className={`${time === slot ? "selected" : ""} ${!date || slotTaken(date, slot) ? "unavailable" : ""}`}><input type="radio" name="booking-time" value={slot} disabled={!date || slotTaken(date, slot)} checked={time === slot} onChange={() => { setTime(slot); setError(""); }} /><span>{slot}〜{endTime(slot)}<small>{date && slotTaken(date, slot) ? "予約済み" : ""}</small></span></label>)}</div></fieldset><div className="booking-summary"><span>選択した日時</span><strong>{date ? dateLabel(date) : "未選択"}{time && `　${time}〜${endTime(time)}`}</strong></div>{error && <p className="booking-error" role="alert">{error}</p>}<button type="submit" className="booking-primary" disabled={!date || !time}>{draft.id ? "この日程に変更する" : "この日時で予約する"}</button><p className="booking-demo-note">空き状況はサンプルです。実際の予約・外部送信は行われません。</p></form>}</section><section className="booking-list"><h2>予約一覧 <span>{reservations.length}件</span></h2>{reservations.map(reservation => <article key={reservation.id}><span className="booking-confirmed-badge">予約確定</span><h3>{reservation.title}</h3><p>{dateLabel(reservation.date)}<br />{reservation.time}〜{endTime(reservation.time)}</p><small>{reservation.place} ／ {reservation.staff}</small><div><button onClick={() => details(reservation)}>予約内容を見る</button><button onClick={() => change(reservation)}>日程を変更</button></div></article>)}</section></div></section>;
}
