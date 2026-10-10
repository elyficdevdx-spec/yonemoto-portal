"use client";

import { useSyncExternalStore } from "react";
import { catalogItems } from "./mock-data";
export type ContentKind = "catalog" | "event" | "notice";
export type ContentStatus = "draft" | "published" | "hidden";
export type ContentItem = { id: number; kind: ContentKind; status: ContentStatus; title: string; description: string; category: string; designer: string; image: string; startDate: string; endDate: string; location: string; times: string[]; updated: string };
const empty = { description: "", category: "自社設計", designer: "", image: "", startDate: "", endDate: "", location: "", times: ["10:00", "14:00", "16:00"], updated: "2026-10-10" };
export const initialContents: ContentItem[] = [
  ...catalogItems.map(item => ({ ...empty, ...item, kind: "catalog" as const, status: "published" as const })),
  { ...empty, id: 101, kind: "event", status: "published", title: "光と風を感じる平屋の完成見学会", description: "光と風を取り込む平屋の住まいをご見学いただけます。", startDate: "2026-10-24", endDate: "2026-10-25", location: "沖縄県浦添市" },
  { ...empty, id: 102, kind: "event", status: "published", title: "家づくり個別相談会", description: "土地・資金・プランを個別にご相談いただけます。", location: "米元建設工業 本社" },
  { ...empty, id: 103, kind: "event", status: "published", title: "住まいの設備相談", description: "キッチンや水回り設備を実物を見ながら比較。", location: "米元建設工業 本社" },
  { ...empty, id: 201, kind: "notice", status: "published", title: "秋の住まいづくり相談会のお知らせ", description: "ご家族で参加いただける個別相談会を開催します。見学・イベントからご希望の日程をご予約ください。", startDate: "2026-10-03" },
];
const key = "yonemoto-content-demo-v1";
let snapshot = initialContents;
let lastRaw: string | null | undefined;
const listeners = new Set<() => void>();
function read() {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw !== lastRaw) {
      lastRaw = raw;
      const parsed = raw ? JSON.parse(raw) : initialContents;
      snapshot = Array.isArray(parsed) && parsed.every(item => typeof item.id === "number" && ["catalog", "event", "notice"].includes(item.kind) && ["draft", "published", "hidden"].includes(item.status) && typeof item.title === "string" && typeof item.description === "string" && typeof item.image === "string" && typeof item.startDate === "string" && typeof item.endDate === "string" && Array.isArray(item.times)) ? parsed : initialContents;
    }
  } catch { /* Storage unavailable: retain the in-memory demo. */ }
  return snapshot;
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const sync = () => { listener(); };
  window.addEventListener("storage", sync);
  return () => { listeners.delete(listener); window.removeEventListener("storage", sync); };
}
export function useContentStore() {
  const items = useSyncExternalStore(subscribe, read, () => initialContents);
  function save(item: ContentItem) {
    const current = read();
    snapshot = current.some(entry => entry.id === item.id) ? current.map(entry => entry.id === item.id ? item : entry) : [...current, item];
    try { lastRaw = JSON.stringify(snapshot); sessionStorage.setItem(key, lastRaw); } catch { /* Keep local updates if storage is unavailable. */ }
    listeners.forEach(listener => listener());
  }
  return { items, save };
}
export function newContent(kind: ContentKind): ContentItem { return { ...empty, times: [...empty.times], id: Date.now(), kind, status: "draft", title: "" }; }
export function eventDates(item: ContentItem): string[] | undefined {
  if (!item.startDate) return undefined;
  const dates: string[] = [];
  const date = new Date(`${item.startDate}T12:00:00`);
  const end = item.endDate || item.startDate;
  for (let i = 0; i < 31; i++) {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    if (key > end) break;
    dates.push(key); date.setDate(date.getDate() + 1);
  }
  return dates;
}
