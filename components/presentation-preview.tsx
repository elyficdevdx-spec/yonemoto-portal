"use client";

import { useState } from "react";
import { CustomerPortal } from "./customer-portal";
import { DemoToolbar } from "./demo-toolbar";
import { PreviewControls } from "./preview-controls";
import { usePhoneScale } from "./use-phone-scale";
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
  const { canvasRef, phoneStyle } = usePhoneScale(mode);

  if (embedded) return <CustomerPortal stage={stage} />;

  return (
    <div className={`presentation ${mode === "sp" ? "is-sp" : "is-pc"}`}>
      <DemoToolbar current="customer" stage={stage} onStageChange={setStage} />
      <PreviewControls mode={mode} onChange={setMode} />
      {mode === "pc" ? (
        <div className="presentation-pc"><CustomerPortal key={stage} stage={stage} /></div>
      ) : (
        <div className="presentation-stage" ref={canvasRef} style={phoneStyle}>
          <div className="device-frame">
            <div className="device-speaker" aria-hidden="true" />
            <iframe key={stage} title={`${stageOptions.find(x => x.value === stage)?.short}ステージのスマートフォン表示`} src={`/?preview=sp&stage=${stage}`} />
            <div className="device-home" aria-hidden="true" />
          </div>
          <p>スマートフォン表示・375 × 700px</p>
        </div>
      )}
    </div>
  );
}
