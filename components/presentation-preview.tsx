"use client";

import { useState } from "react";
import { CustomerPortal } from "./customer-portal";
import { CustomerStage, DEFAULT_CUSTOMER_STAGE } from "@/lib/customer-stage";

type PreviewMode = "pc" | "sp";

const stageOptions: { value: CustomerStage; short: string; description: string }[] = [
  { value: "upstream", short: "川上", description: "未登録・契約前" },
  { value: "midstream", short: "川中", description: "契約後〜引き渡し前" },
  { value: "downstream", short: "川下", description: "引き渡し後" },
];

export function PresentationPreview({ embedded = false, initialStage = DEFAULT_CUSTOMER_STAGE }: { embedded?: boolean; initialStage?: CustomerStage }) {
  const [stage, setStage] = useState<CustomerStage>(initialStage);
  const [mode, setMode] = useState<PreviewMode>("pc");

  if (embedded) return <CustomerPortal stage={stage} />;

  return (
    <div className={`presentation ${mode === "sp" ? "is-sp" : "is-pc"}`}>
      <aside className="presentation-controls" aria-label="表示プレビュー設定">
        <div className="presentation-controls-inner">
          <div className="presentation-title"><b>表示プレビュー</b><span>クライアントプレゼン用</span></div>
          <div className="control-group">
            <span className="control-label">表示</span>
            <div className="segmented-control">
              <button className={mode === "pc" ? "selected" : ""} onClick={() => setMode("pc")} aria-pressed={mode === "pc"}>PC</button>
              <button className={mode === "sp" ? "selected" : ""} onClick={() => setMode("sp")} aria-pressed={mode === "sp"}>SP</button>
            </div>
          </div>
          <div className="control-group stage-control">
            <span className="control-label">顧客ステージ</span>
            <div className="stage-buttons">
              {stageOptions.map(option => (
                <button key={option.value} className={stage === option.value ? "selected" : ""} onClick={() => setStage(option.value)} aria-pressed={stage === option.value}>
                  <b>{option.short}</b><span>{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
      {mode === "pc" ? (
        <div className="presentation-pc"><CustomerPortal key={stage} stage={stage} /></div>
      ) : (
        <div className="presentation-stage">
          <div className="device-frame">
            <div className="device-speaker" aria-hidden="true" />
            <iframe key={stage} title={`${stageOptions.find(x => x.value === stage)?.short}ステージのスマートフォン表示`} src={`/?preview=sp&stage=${stage}`} />
            <div className="device-home" aria-hidden="true" />
          </div>
          <p>スマートフォン表示・390px</p>
        </div>
      )}
    </div>
  );
}
