"use client";
import { useState } from "react";
import { contactMethods, contactSummary, type Customer, type ContactMethod } from "@/lib/staff-data";

export function ContactPreferenceFields({ customer }: { customer?: Customer }) {
  const [selected, setSelected] = useState<ContactMethod[]>(customer?.contactMethods ?? []);
  const [only, setOnly] = useState(customer?.contactOnly ?? false);
  function toggle(method: ContactMethod) { const next = selected.includes(method) ? selected.filter(item => item !== method) : [...selected, method]; setSelected(next); if (!next.length) setOnly(false); }
  return <fieldset className="contact-preference-fields"><legend>希望連絡方法</legend><p>お客様に確認した連絡方法を選択してください（複数選択可）。未選択は「未確認」と表示します。</p><div className="contact-method-options">{contactMethods.map(method => <label key={method}><input type="checkbox" name="contactMethods" value={method} checked={selected.includes(method)} onChange={() => toggle(method)} />{method}</label>)}</div><label className="contact-only-option"><input type="checkbox" name="contactOnly" checked={only} disabled={!selected.length} onChange={event => setOnly(event.target.checked)} />選択した連絡方法のみを希望</label><label>連絡時の配慮・時間帯<textarea name="contactNote" rows={3} defaultValue={customer?.contactNote ?? ""} placeholder="例：メールのみ希望／電話は平日18時以降" /></label></fieldset>;
}
export function ContactPreferenceSummary({ customer }: { customer: Customer }) { return <div className={`contact-preference-summary ${customer.contactOnly ? "is-exclusive" : ""}`}><strong>{contactSummary(customer)}</strong>{customer.contactNote && <p>{customer.contactNote}</p>}</div>; }
