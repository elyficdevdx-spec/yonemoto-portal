"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CustomerStage } from "@/lib/customer-stage";

export function DemoToolbar({ current, stage, onStageChange }: {
  current: "customer" | "admin";
  stage?: CustomerStage;
  onStageChange?: (stage: CustomerStage) => void;
}) {
  const router = useRouter();
  const [help, setHelp] = useState(false);
  return <>
    <div className="mock-toolbar">
      <div className="mock-toolbar-caption"><span className="mock-demo-badge"><i aria-hidden="true" />操作体験モック</span><span className="mock-toolbar-description">架空データ・外部送信なし</span></div>
      <div className="mock-toolbar-controls">
        <select aria-label="表示する画面" value={current} onChange={event => router.push(event.target.value === "admin" ? "/admin" : "/")}>
          <option value="customer">お客様向け</option>
          <option value="admin">社内管理</option>
        </select>
        {current === "customer" && <select aria-label="顧客ステージ" value={stage} onChange={event => onStageChange?.(event.target.value as CustomerStage)}>
          <option value="upstream">契約前（川上）</option>
          <option value="midstream">契約後（川中）</option>
          <option value="downstream">引き渡し後（川下）</option>
        </select>}
        <button className="mock-toolbar-help" aria-label="操作体験モックについて" aria-expanded={help} onClick={() => setHelp(!help)}>?</button>
      </div>
    </div>
    {help && <div className="mock-toolbar-note" role="status">人物・予約情報はサンプルです。入力内容は保存・外部送信されません。社内管理の共通デモパスワードは demo1234 です。</div>}
  </>;
}
