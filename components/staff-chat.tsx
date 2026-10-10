"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";

type ChatMessage = { id: number; from: "customer" | "staff"; text: string; time: string };
const conversations = [
  { id: 1, name: "山田 太郎", house: "山田様邸 新築工事", staff: "佐藤 美咲", messages: [{ id: 1, from: "staff", text: "山田様、こんにちは。1階平面図の最新版を登録しました。キッチン横の収納を広げています。ご確認をお願いいたします。", time: "10:25" }, { id: 2, from: "customer", text: "ありがとうございます。家族で確認してご連絡します。", time: "11:08" }] as ChatMessage[] },
  { id: 2, name: "高橋 健", house: "高橋様邸", staff: "佐藤 美咲", messages: [{ id: 3, from: "customer", text: "こんにちは。リビングの窓が開閉しづらくなっています。一度見ていただくことはできますか？", time: "09:40" }, { id: 4, from: "staff", text: "ご連絡ありがとうございます。施工担当に確認し、訪問日程をご案内します。", time: "10:05" }] as ChatMessage[] },
  { id: 3, name: "鈴木 花子", house: "家づくりのご相談", staff: "田中 悠", messages: [{ id: 5, from: "customer", text: "完成見学会に参加したいです。24日の午後は空いていますか？", time: "10:50" }] as ChatMessage[] },
];
export function StaffChat({ active, unreadCounts, onRead }: { active: boolean; unreadCounts: Record<number, number>; onRead: (id: number) => void }) {
  const [threads, setThreads] = useState(conversations);
  const [selected, setSelected] = useState(1);
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [mobileThread, setMobileThread] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const conversation = threads.find(thread => thread.id === selected)!;
  const text = drafts[selected] ?? "";
  const filtered = threads.filter(thread => `${thread.name}${thread.house}`.replaceAll(" ", "").includes(query.replaceAll(" ", "")));
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [selected, conversation.messages.length, mobileThread]);
  useEffect(() => {
    if (!active) return;
    const viewport = window.matchMedia("(max-width: 760px)");
    const readVisible = () => { if (!viewport.matches || mobileThread) onRead(selected); };
    readVisible();
    viewport.addEventListener("change", readVisible);
    return () => viewport.removeEventListener("change", readVisible);
  }, [active, selected, mobileThread, onRead]);
  return <div className={`staff-chat ${mobileThread ? "show-conversation" : "show-threads"}`}><aside className="staff-chat-threads"><h2>お客様とのチャット</h2><label className="staff-chat-search"><Icon name="search" size={18} /><input aria-label="チャットを検索" placeholder="お客様名・住宅名で検索" value={query} onChange={event => setQuery(event.target.value)} /></label><div className="staff-chat-thread-list">{filtered.map(thread => { const last = thread.messages[thread.messages.length - 1]; return <button key={thread.id} className={selected === thread.id ? "selected" : ""} aria-pressed={selected === thread.id} onClick={() => { setSelected(thread.id); setMobileThread(true); }}><span className="staff-chat-avatar">{thread.name[0]}</span><span className="staff-chat-thread-copy"><strong>{thread.name} 様</strong><small>{thread.house}</small><span>{last.text}</span></span><time>{last.time}</time>{unreadCounts[thread.id] > 0 && <span className="staff-unread-badge staff-thread-unread" aria-label={`未読${unreadCounts[thread.id]}件`}>{unreadCounts[thread.id]}</span>}</button>; })}{filtered.length === 0 && <p className="admin-empty">該当するチャットはありません。</p>}</div></aside><section className="staff-chat-conversation" aria-label={`${conversation.name}様とのチャット`}><header><button className="staff-chat-back" aria-label="チャット一覧に戻る" onClick={() => setMobileThread(false)}><span className="staff-arrow-left"><Icon name="arrow" /></span></button><span className="staff-chat-avatar">{conversation.name[0]}</span><div><h2>{conversation.name} 様</h2><p>{conversation.house}</p></div><span className="staff-chat-assignee">担当：{conversation.staff}</span></header><div className="staff-chat-log" role="log" aria-label="会話履歴" aria-live="polite" aria-relevant="additions"><p className="staff-chat-date">2026年10月10日</p>{conversation.messages.map(message => <div className={`staff-chat-message from-${message.from}`} key={message.id}><div><small>{message.from === "staff" ? "佐藤 美咲" : `${conversation.name} 様`}</small><p>{message.text}</p><time>{message.time}</time></div></div>)}<div ref={end} /></div><form className="staff-chat-composer" onSubmit={event => { event.preventDefault(); if (!text.trim()) return; const time = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()); setThreads(previous => previous.map(thread => thread.id === selected ? { ...thread, messages: [...thread.messages, { id: Date.now(), from: "staff", text: text.trim(), time }] } : thread)); setDrafts(previous => ({ ...previous, [selected]: "" })); }}><label><span className="admin-sr-only">{conversation.name}様へのメッセージ</span><textarea placeholder="メッセージを入力" rows={2} value={text} onChange={event => setDrafts(previous => ({ ...previous, [selected]: event.target.value }))} /></label><button type="submit" disabled={!text.trim()} aria-label="メッセージを送信"><Icon name="send" size={20} /><span>送信</span></button></form><p className="staff-chat-demo">送信はモック内のみです。再読み込みで初期化されます。</p></section></div>;
}
