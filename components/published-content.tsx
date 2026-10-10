"use client";

import { useEffect, useRef, useState } from "react";
import { eventDates, useContentStore, type ContentItem } from "@/lib/content-store";
import type { BookingDraft } from "./customer-reservations";
import { Icon } from "./icons";

export function PublishedEvents({ book }: { book: (draft: BookingDraft) => void }) {
  const { items } = useContentStore();
  const events = items.filter(item => item.kind === "event" && item.status === "published");
  const first = events[0];
  const reserve = (item: ContentItem) => book({ title: item.title, allowedDates: eventDates(item), allowedTimes: item.times, place: item.location });
  return <section className="page-section"><div className="page-title"><h1>見学・イベント</h1><span>{events.length}件</span></div>{first ? <><div className="event-hero"><div><small>EVENT</small><h2>{first.title}</h2><p>{first.startDate || "随時開催"}{first.endDate && first.endDate !== first.startDate && ` 〜 ${first.endDate}`}<br />{first.location}</p><p>{first.description}</p><button onClick={() => reserve(first)}>カレンダーから予約する</button></div><div /></div><div className="simple-cards">{events.slice(1).map(item => <article key={item.id}><b>{item.title}</b><p>{item.description}</p><p>{item.location}</p><button onClick={() => reserve(item)}>空き状況を見る</button></article>)}</div></> : <p className="empty">現在公開中のイベントはありません。</p>}</section>;
}
function NoticeDialog({ item, close }: { item: ContentItem; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog className="reservation-dialog" ref={ref} onCancel={close} onClick={event => { if (event.target === event.currentTarget) close(); }}><header><h2>お知らせ</h2><button aria-label="閉じる" onClick={close}><Icon name="close" /></button></header><small>{item.startDate}</small><h3>{item.title}</h3><p style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>{item.description}</p><button className="booking-primary" onClick={close}>閉じる</button></dialog>;
}
export function PublishedNotices({ compact = false }: { compact?: boolean }) {
  const { items } = useContentStore();
  const [detail, setDetail] = useState<ContentItem | null>(null);
  const notices = items.filter(item => item.kind === "notice" && item.status === "published").sort((a, b) => b.startDate.localeCompare(a.startDate));
  return <><div className="notice-list">{(compact ? notices.slice(0, 1) : notices).map(item => <button key={item.id} onClick={() => setDetail(item)}><i>お知らせ</i><div><small>{item.startDate}　米元建設工業より</small><b>{item.title}</b><p>{item.description}</p></div><Icon name="arrow" /></button>)}</div>{detail && <NoticeDialog item={detail} close={() => setDetail(null)} />}</>;
}
