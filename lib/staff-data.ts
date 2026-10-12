export const contactMethods = ["アプリチャット", "メール", "電話", "LINE", "その他"] as const;
export type ContactMethod = typeof contactMethods[number];
export type Customer = { id: number; name: string; staff: string; house: string; city: string; progress: string; handover: string; contactMethods: ContactMethod[]; contactOnly: boolean; contactNote: string };
export function contactSummary(customer: Customer) { return customer.contactMethods.length ? `${customer.contactMethods.join("・")}${customer.contactOnly ? "のみ" : "を希望"}` : "希望連絡方法：未確認"; }
export const initialCustomers: Customer[] = [
  { id: 1, name: "山田 太郎", staff: "佐藤 美咲・伊藤 彩", house: "山田様邸 新築工事", city: "那覇市", progress: "設計・仕様", handover: "2027-03-20", contactMethods: ["アプリチャット", "メール"], contactOnly: false, contactNote: "日中は仕事のため、まずメッセージでご連絡ください。" },
  { id: 2, name: "高橋 健", staff: "佐藤 美咲", house: "高橋様邸", city: "浦添市", progress: "引き渡し済み", handover: "2023-06-15", contactMethods: ["電話"], contactOnly: true, contactNote: "電話のみ希望。平日18時以降にご連絡ください。" },
  { id: 3, name: "鈴木 花子", staff: "田中 悠", house: "鈴木様邸 新築工事", city: "宜野湾市", progress: "契約前", handover: "", contactMethods: ["メール"], contactOnly: true, contactNote: "メールのみ希望。電話での連絡は控えてください。" },
];
export const taskStatuses = ["未対応", "対応中", "社内確認中", "完了"] as const;
export const taskPriorities = ["高", "通常", "低"] as const;
export type StaffTask = { id: number; status: string; customerId: number | null; title: string; deadline: string; staff: string; body: string; priority: string };
export const initialTasks: StaffTask[] = [
  { id: 1, status: "未対応", customerId: 1, title: "キッチン仕様の確認", deadline: "2026-10-10", staff: "佐藤 美咲", body: "キッチンの収納と設備仕様について、お客様への確認をお願いします。", priority: "高" },
  { id: 2, status: "対応中", customerId: 3, title: "完成見学会の予約について", deadline: "2026-10-12", staff: "田中 悠", body: "完成見学会の参加希望について、予約枠とご希望の日程を確認してください。", priority: "通常" },
  { id: 3, status: "社内確認中", customerId: 2, title: "窓の開閉に関する修理依頼", deadline: "2026-10-15", staff: "佐藤 美咲", body: "窓が開閉しづらいとのご相談です。施工担当に確認し、訪問日を調整してください。", priority: "高" },
];
